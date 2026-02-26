/**
 * CheckoutContent - Nike-style multi-step checkout
 * Payment via Culqi (Tarjeta + Yape) + WhatsApp notifications via backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import {
  FiLock,
  FiTruck,
  FiMapPin,
  FiCheck,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronRight,
  FiCreditCard,
  FiAlertCircle,
} from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';

interface Address {
  id: string;
  label: string;
  address: string;
  reference?: string;
  department: string;
  province: string;
  district: string;
  postal_code?: string;
  phone?: string;
  is_default: boolean;
}

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

interface CheckoutContentProps {
  storeSlug: string;
  customer: CustomerData | null;
  culqiPublicKey?: string;
}

type CheckoutStep = 'auth' | 'shipping' | 'payment' | 'review';

// ============================================
// STEP INDICATOR
// ============================================
function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
}) {
  const steps = [
    { id: 'auth' as CheckoutStep, label: 'Cuenta', number: 1 },
    { id: 'shipping' as CheckoutStep, label: 'Envio', number: 2 },
    { id: 'payment' as CheckoutStep, label: 'Pago', number: 3 },
    { id: 'review' as CheckoutStep, label: 'Confirmar', number: 4 },
  ];

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3 py-8 px-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                          ${isCompleted ? 'bg-black text-white' : isActive ? 'bg-black text-white ring-4 ring-black/10' : 'bg-gray-200 text-gray-400'}`}
              >
                {isCompleted ? <FiCheck className="w-4 h-4" /> : step.number}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${isActive || isCompleted ? 'text-black' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-6 sm:w-12 h-0.5 ${isCompleted ? 'bg-black' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN CHECKOUT CONTENT
// ============================================
export default function CheckoutContent({ storeSlug, customer, culqiPublicKey }: CheckoutContentProps) {
  const { cart, config, formatPrice, clearCart } = useStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(customer ? 'shipping' : 'auth');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>(customer ? ['auth'] : []);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    customer?.addresses?.find((a) => a.is_default)?.id || null
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yape'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Editable customer info for review step
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');

  // Culqi state
  const [culqiLoaded, setCulqiLoaded] = useState(false);

  // Addresses state (synced with backend)
  const [localAddresses, setLocalAddresses] = useState<Address[]>(customer?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(!(customer?.addresses?.length));
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const emptyAddress = {
    label: '',
    address: '',
    reference: '',
    department: '',
    province: '',
    district: '',
    postal_code: '',
    phone: customer?.phone || '',
  };
  const [addressForm, setAddressForm] = useState(emptyAddress);

  const addresses = localAddresses;

  // Persist addresses to backend
  const persistAddresses = useCallback(async (addrs: Address[]) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      await fetch(`/${storeSlug}/checkout/save-addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ addresses: addrs }),
      });
    } catch {
      // Silent fail - addresses are still in local state
    }
  }, [storeSlug]);

  // Load Culqi.js script
  useEffect(() => {
    if (!culqiPublicKey || culqiLoaded) return;

    if ((window as any).Culqi) {
      setCulqiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => setCulqiLoaded(true);
    script.onerror = () => console.error('Error loading Culqi script');
    document.head.appendChild(script);
  }, [culqiPublicKey, culqiLoaded]);

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      address: addr.address,
      reference: addr.reference || '',
      department: addr.department || '',
      province: addr.province || '',
      district: addr.district,
      postal_code: addr.postal_code || '',
      phone: addr.phone || '',
    });
    setShowAddressForm(true);
  };

  const deleteAddress = (id: string) => {
    const updated = localAddresses.filter((a) => a.id !== id);
    setLocalAddresses(updated);
    persistAddresses(updated);
    if (selectedAddress === id) {
      setSelectedAddress(updated.length > 0 ? updated[0].id : null);
    }
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  };

  const saveAddress = () => {
    if (!addressForm.label || !addressForm.address || !addressForm.department || !addressForm.province || !addressForm.district || !addressForm.phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    let updated: Address[];

    if (editingAddressId) {
      updated = localAddresses.map((a) =>
        a.id === editingAddressId
          ? { ...a, ...addressForm, reference: addressForm.reference, postal_code: addressForm.postal_code }
          : a
      );
    } else {
      const addr: Address = {
        id: `addr_${Date.now()}`,
        ...addressForm,
        is_default: addresses.length === 0,
      };
      updated = [...localAddresses, addr];
      setSelectedAddress(addr.id);
    }

    setLocalAddresses(updated);
    persistAddresses(updated);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  };

  const completeStep = (step: CheckoutStep, nextStep: CheckoutStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    setCurrentStep(nextStep);
  };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
    const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
    return `/${publicPath}/${clean}`;
  };

  // Submit order to backend with Culqi token
  const submitOrder = useCallback(async (culqiToken: string) => {
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const address = addresses.find((a) => a.id === selectedAddress);
      let deliveryAddress = 'Recojo en tienda';

      if (deliveryType === 'delivery' && address) {
        deliveryAddress = address.address;
        if (address.reference) deliveryAddress += ` | Ref: ${address.reference}`;
        deliveryAddress += ` | ${address.district}, ${address.province}, ${address.department}`;
        if (address.postal_code) deliveryAddress += ` | CP ${address.postal_code}`;
        if (address.phone) deliveryAddress += ` | Tel: ${address.phone}`;
      }

      const orderData = {
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          selected_options: item.selected_options || null,
        })),
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        culqi_token: culqiToken,
        customer_name: customerName || customer?.name || '',
        customer_email: customerEmail || customer?.email || '',
        customer_phone: customerPhone || address?.phone || '',
      };

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const response = await fetch(`/${storeSlug}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('Checkout response:', response.status, result);

      if (result.success) {
        setOrderNumber(result.order_number);
        clearCart();
        setOrderComplete(true);
      } else {
        const errorDetail = result.errors
          ? Object.values(result.errors).flat().join(', ')
          : result.message || 'Error al procesar el pedido';
        console.error('Checkout error detail:', result);
        setPaymentError(errorDetail);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setPaymentError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [addresses, selectedAddress, deliveryType, paymentMethod, cart.items, customer, storeSlug, clearCart, customerName, customerEmail, customerPhone]);

  // Set up Culqi global callback (with guard to prevent double-submit)
  const isProcessingRef = React.useRef(false);

  useEffect(() => {
    if (!culqiLoaded) return;

    (window as any).culqi = function () {
      if (isProcessingRef.current) return;
      const CulqiObj = (window as any).Culqi;
      if (CulqiObj.token) {
        // Close the Culqi modal and show loading on our button
        isProcessingRef.current = true;
        CulqiObj.close();
        setIsSubmitting(true);
        submitOrder(CulqiObj.token.id).finally(() => {
          isProcessingRef.current = false;
        });
      } else if (CulqiObj.error) {
        CulqiObj.close();
        setPaymentError(CulqiObj.error.user_message || 'Error al procesar el pago');
        setIsSubmitting(false);
      }
    };
  }, [culqiLoaded, submitOrder]);

  // Create Culqi order (required for Yape payments)
  const createCulqiOrder = useCallback(async (): Promise<string | null> => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const response = await fetch(`/${storeSlug}/checkout/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          amount: cart.total,
          customer_name: customerName || customer?.name || '',
          customer_email: customerEmail || customer?.email || '',
          customer_phone: customerPhone || '',
        }),
      });

      const result = await response.json();
      if (result.success && result.order_id) {
        return result.order_id;
      }
      setPaymentError(result.message || 'Error al preparar el pago');
      return null;
    } catch {
      setPaymentError('Error de conexión al preparar el pago');
      return null;
    }
  }, [storeSlug, cart.total, customer, customerName, customerEmail, customerPhone]);

  // Build absolute URL for logo (Culqi loads from its own domain if relative)
  const getAbsoluteLogoUrl = useCallback(() => {
    const logo = config.logo;
    if (!logo) return '';
    if (logo.startsWith('http')) return logo;
    const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
    const clean = logo.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
    const resolved = logo.startsWith('/') ? logo : `/${publicPath}/${clean}`;
    return `${window.location.origin}${resolved}`;
  }, [config.logo]);

  // Open Culqi checkout
  const openCulqiCheckout = useCallback(async () => {
    if (!culqiPublicKey || !culqiLoaded) {
      setPaymentError('El sistema de pago no está disponible en este momento');
      return;
    }

    setPaymentError(null);
    setIsSubmitting(true);

    const CulqiObj = (window as any).Culqi;
    CulqiObj.publicKey = culqiPublicKey;

    // For Yape, we need a pre-created Culqi Order ID
    const settings: Record<string, any> = {
      title: config.name || 'Tienda',
      currency: 'PEN',
      amount: Math.round(cart.total * 100),
    };

    if (paymentMethod === 'yape') {
      const orderId = await createCulqiOrder();
      if (!orderId) {
        setIsSubmitting(false);
        return;
      }
      settings.order = orderId;
    }

    CulqiObj.settings(settings);

    CulqiObj.options({
      lang: 'auto',
      style: {
        logo: getAbsoluteLogoUrl(),
        bannerColor: '#000000',
        buttonBackground: '#000000',
        menuColor: '#000000',
        linksColor: '#000000',
        buttonText: 'Pagar',
        buttonTextColor: '#ffffff',
        priceColor: '#000000',
      },
    });

    CulqiObj.open();
    setIsSubmitting(false);
  }, [culqiPublicKey, culqiLoaded, cart.total, config.name, getAbsoluteLogoUrl, paymentMethod, createCulqiOrder]);

  // Handle confirm order
  const handleSubmit = () => {
    // Validate required customer fields
    const phone = customerPhone || addresses.find(a => a.id === selectedAddress)?.phone || '';
    if (!customerName.trim() || !customerName.includes(' ')) {
      setPaymentError('Por favor ingresa tu nombre completo (nombre y apellido)');
      return;
    }
    if (!customerEmail.trim()) {
      setPaymentError('Por favor ingresa tu email');
      return;
    }
    if (!phone || phone.length < 6) {
      setPaymentError('Por favor ingresa un numero de telefono valido');
      return;
    }
    // Update customerPhone state if it came from the address
    if (!customerPhone && phone) {
      setCustomerPhone(phone);
    }
    setPaymentError(null);
    openCulqiCheckout();
  };

  // ---- EMPTY CART ----
  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiTruck className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Tu carrito esta vacio</h2>
          <p className="text-gray-500 mb-8">Agrega productos para continuar con tu compra</p>
          <Link
            href={`/${storeSlug}/productos`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
          >
            Ver productos
            <FiChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // ---- ORDER COMPLETE ----
  if (orderComplete) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-3">Pedido confirmado!</h1>
          <p className="text-gray-600 mb-2">
            Tu pago ha sido procesado exitosamente. Te enviaremos una notificación con los detalles de tu pedido.
          </p>
          <p className="text-sm text-gray-400 mb-8 font-mono">#{orderNumber}</p>
          <div className="space-y-3">
            <Link
              href={`/${storeSlug}/cuenta`}
              className="block w-full py-4 rounded-full font-bold bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Ver mis pedidos
            </Link>
            <Link
              href={`/${storeSlug}/productos`}
              className="block w-full py-4 rounded-full font-bold border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN CHECKOUT ----
  return (
    <div className="max-w-7xl mx-auto px-4">
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <div className="grid lg:grid-cols-[1fr,380px] gap-8 pb-16">
        {/* Left: Steps Content */}
        <div>
          {/* ---- AUTH STEP ---- */}
          {currentStep === 'auth' && (
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-black text-center mb-2">
                Inicia sesion para continuar
              </h2>
              <p className="text-gray-500 text-center mb-8">
                Necesitas una cuenta para completar tu compra
              </p>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                <div className="space-y-2.5">
                  {['Seguimiento de tu pedido en tiempo real', 'Historial de compras guardado', 'Checkout mas rapido en futuras compras'].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/${storeSlug}/cuenta/login?redirect=checkout`}
                  className="block w-full py-4 bg-black text-white rounded-full font-bold text-center hover:bg-gray-800 transition-colors"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href={`/${storeSlug}/cuenta/registro?redirect=checkout`}
                  className="block w-full py-4 border-2 border-black text-black rounded-full font-bold text-center hover:bg-black hover:text-white transition-colors"
                >
                  Crear Cuenta
                </Link>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400">o</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <a
                  href={`/${storeSlug}/auth/google?redirect=checkout`}
                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  Continuar con Google
                </a>
              </div>
            </div>
          )}

          {/* ---- SHIPPING STEP ---- */}
          {currentStep === 'shipping' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-black mb-6">Metodo de entrega</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left
                            ${deliveryType === 'delivery' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center
                                ${deliveryType === 'delivery' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FiTruck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold block text-black">Delivery</span>
                    <span className="text-sm text-gray-500">Envio a domicilio</span>
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left
                            ${deliveryType === 'pickup' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center
                                ${deliveryType === 'pickup' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FiMapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold block text-black">Recojo en tienda</span>
                    <span className="text-sm text-gray-500">Sin costo de envio</span>
                  </div>
                </button>
              </div>

              {/* Addresses for delivery */}
              {deliveryType === 'delivery' && (
                <div className="mb-8">
                  <h3 className="font-bold text-black mb-4">Direccion de entrega</h3>

                  {addresses.length > 0 && !showAddressForm && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`relative border-2 rounded-xl transition-all
                                    ${selectedAddress === addr.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <button
                            onClick={() => setSelectedAddress(addr.id)}
                            className="w-full flex items-start gap-4 p-4 text-left"
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                          ${selectedAddress === addr.id ? 'border-black bg-black' : 'border-gray-300'}`}>
                              {selectedAddress === addr.id && <FiCheck className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black">{addr.label}</p>
                              <p className="text-sm text-gray-600">{addr.address}</p>
                              {addr.reference && <p className="text-sm text-gray-400 italic">{addr.reference}</p>}
                              <p className="text-sm text-gray-500">
                                {addr.district}, {addr.province}{addr.department ? `, ${addr.department}` : ''}
                              </p>
                              {addr.postal_code && <p className="text-sm text-gray-400">CP: {addr.postal_code}</p>}
                              {addr.phone && <p className="text-sm text-gray-500">Tel: {addr.phone}</p>}
                            </div>
                          </button>
                          <div className="absolute top-3 right-3 flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditAddress(addr); }}
                              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Editar"
                            >
                              <FiEdit2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <FiTrash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {addresses.length > 0 && !showAddressForm && (
                    <button
                      onClick={() => { setEditingAddressId(null); setAddressForm(emptyAddress); setShowAddressForm(true); }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline mb-4"
                    >
                      <FiPlus className="w-4 h-4" />
                      Agregar otra direccion
                    </button>
                  )}

                  {addresses.length === 0 && !showAddressForm && (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <FiMapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        Agregar direccion
                      </button>
                    </div>
                  )}

                  {/* Address form */}
                  {showAddressForm && (
                    <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
                      <h4 className="font-bold text-black">
                        {editingAddressId ? 'Editar direccion' : 'Nueva direccion'}
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta *</label>
                        <input
                          type="text"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                          placeholder="Ej: Casa, Oficina, Trabajo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direccion completa *</label>
                        <input
                          type="text"
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                          placeholder="Av. Principal 123, Dpto 4B"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                        <input
                          type="text"
                          value={addressForm.reference}
                          onChange={(e) => setAddressForm({ ...addressForm, reference: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                          placeholder="Cerca al parque, frente a la bodega, etc."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                          <input
                            type="text"
                            value={addressForm.department}
                            onChange={(e) => setAddressForm({ ...addressForm, department: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                            placeholder="Junin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                          <input
                            type="text"
                            value={addressForm.province}
                            onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                            placeholder="Huancayo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                          <input
                            type="text"
                            value={addressForm.district}
                            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                            placeholder="El Tambo"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Codigo postal</label>
                          <input
                            type="text"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                            placeholder="12006"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telefono de contacto *</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                            placeholder="987 654 321"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        {(addresses.length > 0 || editingAddressId) && (
                          <button
                            onClick={cancelAddressForm}
                            className="flex-1 py-3 rounded-full font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={saveAddress}
                          className="flex-1 py-3 rounded-full font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          {editingAddressId ? 'Actualizar direccion' : 'Guardar direccion'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pickup info */}
              {deliveryType === 'pickup' && (
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold text-black mb-3">Ubicacion de recojo</h3>
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-black">{config.name}</p>
                      <p className="text-sm text-gray-600">{config.address || 'Consultar direccion'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href={`/${storeSlug}/productos`}
                  className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Seguir comprando
                </Link>
                <button
                  onClick={() => {
                    if (deliveryType === 'delivery' && !selectedAddress) {
                      alert('Por favor agrega y selecciona una direccion de entrega');
                      return;
                    }
                    completeStep('shipping', 'payment');
                  }}
                  className="flex-1 py-4 rounded-full font-bold bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ---- PAYMENT STEP ---- */}
          {currentStep === 'payment' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-black mb-6">Metodo de pago</h2>

              <div className="space-y-3 mb-8">
                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left
                            ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center
                                ${paymentMethod === 'card' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FiCreditCard className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold block text-black">Tarjeta de credito / debito</span>
                    <span className="text-sm text-gray-500">Visa, Mastercard, American Express, Diners</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                ${paymentMethod === 'card' ? 'border-black bg-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'card' && <FiCheck className="w-4 h-4 text-white" />}
                  </div>
                </button>

                {/* Yape */}
                <button
                  onClick={() => setPaymentMethod('yape')}
                  className={`w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left
                            ${paymentMethod === 'yape' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
                                ${paymentMethod === 'yape' ? 'bg-[#6B2D8B] text-white' : 'bg-gray-100'}`}>
                    <span className={paymentMethod === 'yape' ? '' : 'grayscale opacity-50'}>📱</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold block text-black">Yape</span>
                    <span className="text-sm text-gray-500">Paga rapido desde tu celular con Yape</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                ${paymentMethod === 'yape' ? 'border-black bg-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'yape' && <FiCheck className="w-4 h-4 text-white" />}
                  </div>
                </button>
              </div>

              {paymentError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{paymentError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
                <FiLock className="w-4 h-4" />
                <span>Pago seguro procesado por Culqi</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => goToStep('shipping')}
                  className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Atras
                </button>
                <button
                  onClick={() => completeStep('payment', 'review')}
                  className="flex-1 py-4 rounded-full font-bold bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ---- REVIEW STEP ---- */}
          {currentStep === 'review' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-black mb-6">Revisa tu pedido</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="font-bold text-black mb-3">Datos de contacto</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Nombre completo *</label>
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nombre y Apellido"
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-gray-400 text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-gray-400 text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Telefono *</label>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="tel"
                          value={customerPhone || addresses.find(a => a.id === selectedAddress)?.phone || ''}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="987654321"
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-gray-400 text-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="font-bold text-black mb-3">
                    {deliveryType === 'delivery' ? 'Envio a domicilio' : 'Recojo en tienda'}
                  </h3>
                  {deliveryType === 'delivery' ? (
                    (() => {
                      const addr = addresses.find((a) => a.id === selectedAddress);
                      return addr ? (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-black">{addr.label}</p>
                          <p>{addr.address}</p>
                          {addr.reference && <p className="text-gray-400 italic">{addr.reference}</p>}
                          <p>{addr.district}, {addr.province}, {addr.department}</p>
                          {addr.postal_code && <p className="text-gray-400">CP: {addr.postal_code}</p>}
                          {addr.phone && <p>Tel: {addr.phone}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Sin direccion seleccionada</p>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-black">{config.name}</p>
                      <p>{config.address || 'Consultar direccion'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-black mb-2">Metodo de pago</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {paymentMethod === 'card' ? (
                    <><FiCreditCard className="w-4 h-4" /> Tarjeta de credito / debito</>
                  ) : (
                    <>📱 Yape</>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-black mb-4">Productos ({cart.items.length})</h3>
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-black truncate">{item.name}</p>
                        {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                          <p className="text-xs text-gray-500">{Object.values(item.selected_options).join(' / ')}</p>
                        )}
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-black">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black text-white rounded-2xl p-6 mb-8">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Envio</span>
                    <span>{deliveryType === 'pickup' ? 'Gratis' : cart.shipping > 0 ? formatPrice(cart.shipping) : 'Por confirmar'}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Descuento</span>
                      <span>-{formatPrice(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-700">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{paymentError}</p>
                    <p className="text-xs text-red-600 mt-1">Intenta de nuevo o usa otro metodo de pago</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => goToStep('payment')}
                  className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Atras
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-full font-bold bg-black text-white hover:bg-gray-800 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-5 h-5" />
                      Pagar {formatPrice(cart.total)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-4">
                Al confirmar, aceptas nuestros terminos y condiciones
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className={`${currentStep === 'review' ? 'hidden lg:block' : ''}`}>
          <div className="bg-gray-50 rounded-2xl p-6 lg:sticky lg:top-4">
            <h3 className="text-lg font-bold text-black mb-4">
              Resumen ({cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'})
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto mb-6">
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{item.name}</p>
                    <p className="text-sm font-semibold text-black mt-0.5">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Codigo de descuento"
                  className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
                <button className="px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  Aplicar
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-black">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envio</span>
                <span className="font-medium text-black">
                  {cart.shipping > 0 ? formatPrice(cart.shipping) : 'Por calcular'}
                </span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
