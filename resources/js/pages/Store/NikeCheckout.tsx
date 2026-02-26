/**
 * Nike-Style Checkout - Multi-step checkout with customer authentication
 */

import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiCreditCard,
  FiTruck,
  FiMapPin,
  FiCheck,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiPlus,
  FiMinus,
  FiTrash2,
} from 'react-icons/fi';
import { FaWhatsapp, FaGoogle } from 'react-icons/fa';
import { StoreProvider, useStore } from './context/StoreContext';
import type { StoreConfig, Category } from './types';

interface NikeCheckoutProps {
  config: StoreConfig;
  categories: Category[];
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    addresses: Array<{
      id: string;
      label: string;
      address: string;
      district: string;
      city: string;
      is_default: boolean;
    }>;
  } | null;
}

type CheckoutStep = 'auth' | 'shipping' | 'payment' | 'review';

const steps: { id: CheckoutStep; label: string; number: number }[] = [
  { id: 'auth', label: 'Cuenta', number: 1 },
  { id: 'shipping', label: 'Envio', number: 2 },
  { id: 'payment', label: 'Pago', number: 3 },
  { id: 'review', label: 'Confirmar', number: 4 },
];

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
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                          ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {isCompleted ? <FiCheck className="w-4 h-4" /> : step.number}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-black' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================
// AUTH STEP (Login/Register)
// ============================================
function AuthStep({
  onContinue,
  customer,
  accountSlug,
}: {
  onContinue: () => void;
  customer: NikeCheckoutProps['customer'];
  accountSlug: string;
}) {
  const { config } = useStore();
  const primaryColor = config.colors?.primary || '#000000';

  // If already logged in, auto-continue
  useEffect(() => {
    if (customer) {
      onContinue();
    }
  }, [customer, onContinue]);

  if (customer) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-black text-center mb-2">
        Inicia sesion para continuar
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Crea una cuenta o inicia sesion para completar tu compra
      </p>

      {/* Benefits */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="space-y-2 text-sm">
          {[
            'Seguimiento de tu pedido en tiempo real',
            'Historial de compras guardado',
            'Checkout mas rapido en futuras compras',
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600">
              <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="space-y-4">
        <Link
          href={`/${accountSlug}/cuenta/login?redirect=checkout`}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full
                   font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <FiUser className="w-5 h-5" />
          Iniciar Sesion
        </Link>

        <Link
          href={`/${accountSlug}/cuenta/registro?redirect=checkout`}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full
                   font-bold text-black border-2 border-black transition-all hover:bg-black hover:text-white"
        >
          Crear Cuenta
        </Link>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <a
          href={`/${accountSlug}/auth/google?redirect=checkout`}
          className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200
                   rounded-full font-medium text-gray-700 hover:border-gray-300 transition-colors"
        >
          <FaGoogle className="w-5 h-5 text-red-500" />
          Continuar con Google
        </a>
      </div>
    </div>
  );
}

// ============================================
// SHIPPING STEP
// ============================================
function ShippingStep({
  customer,
  selectedAddress,
  setSelectedAddress,
  deliveryType,
  setDeliveryType,
  onContinue,
  onBack,
}: {
  customer: NikeCheckoutProps['customer'];
  selectedAddress: string | null;
  setSelectedAddress: (id: string | null) => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { config } = useStore();
  const primaryColor = config.colors?.primary || '#000000';
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    district: '',
    city: '',
  });

  const addresses = customer?.addresses || [];

  const handleAddAddress = () => {
    // TODO: Save new address via API
    setShowNewAddress(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-black mb-6">Metodo de entrega</h2>

      {/* Delivery Type Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setDeliveryType('delivery')}
          className={`flex items-center gap-4 p-5 border-2 rounded-xl transition-all text-left
                    ${deliveryType === 'delivery' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${deliveryType === 'delivery' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
            <FiTruck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold block text-black">Delivery</span>
            <span className="text-sm text-gray-500">Envio a domicilio</span>
          </div>
        </button>

        <button
          onClick={() => setDeliveryType('pickup')}
          className={`flex items-center gap-4 p-5 border-2 rounded-xl transition-all text-left
                    ${deliveryType === 'pickup' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${deliveryType === 'pickup' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold block text-black">Recojo en tienda</span>
            <span className="text-sm text-gray-500">Sin costo de envio</span>
          </div>
        </button>
      </div>

      {/* Address Selection (only for delivery) */}
      {deliveryType === 'delivery' && (
        <div className="mb-8">
          <h3 className="font-bold text-black mb-4">Direccion de entrega</h3>

          {addresses.length === 0 && !showNewAddress ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <FiMapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
              <button
                onClick={() => setShowNewAddress(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium
                         border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Agregar direccion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl transition-all text-left
                            ${selectedAddress === addr.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                ${selectedAddress === addr.id ? 'border-black bg-black' : 'border-gray-300'}`}>
                    {selectedAddress === addr.id && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-500">{addr.district}, {addr.city}</p>
                  </div>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-600 rounded">
                      Principal
                    </span>
                  )}
                </button>
              ))}

              {!showNewAddress && (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed
                           border-gray-200 rounded-xl text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Agregar nueva direccion
                </button>
              )}
            </div>
          )}

          {/* New Address Form */}
          {showNewAddress && (
            <div className="mt-4 p-6 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-bold text-black">Nueva direccion</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiqueta (ej: Casa, Oficina)
                </label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Mi casa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion completa
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Av. Principal 123, Dpto 456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Miraflores"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Lima"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewAddress(false)}
                  className="flex-1 py-3 rounded-full font-medium border-2 border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 py-3 rounded-full font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pickup Location (only for pickup) */}
      {deliveryType === 'pickup' && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-bold text-black mb-3">Ubicacion de recojo</h3>
          <div className="flex items-start gap-3">
            <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-black">{config.name}</p>
              <p className="text-sm text-gray-600">{config.address || 'Direccion no disponible'}</p>
              <p className="text-sm text-gray-500 mt-2">
                Horario de atencion: Lunes a Sabado 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200
                   text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Atras
        </button>
        <button
          onClick={onContinue}
          disabled={deliveryType === 'delivery' && !selectedAddress && addresses.length > 0}
          className="flex-1 py-4 rounded-full font-bold text-white transition-all
                   hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT STEP
// ============================================
function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  onContinue,
  onBack,
}: {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { config } = useStore();
  const primaryColor = config.colors?.primary || '#000000';

  const methods = [
    {
      id: 'transfer',
      label: 'Yape / Plin / Transferencia',
      description: 'Pago inmediato con QR o datos bancarios',
      icon: '📱',
    },
    {
      id: 'cash',
      label: 'Efectivo contra entrega',
      description: 'Paga al recibir tu pedido',
      icon: '💵',
    },
    {
      id: 'card',
      label: 'Tarjeta de credito/debito',
      description: 'Visa, Mastercard, American Express',
      icon: '💳',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-black mb-6">Metodo de pago</h2>

      <div className="space-y-3 mb-8">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`w-full flex items-center gap-4 p-5 border-2 rounded-xl transition-all text-left
                      ${paymentMethod === method.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="text-3xl">{method.icon}</span>
            <div className="flex-1">
              <span className="font-bold block text-black">{method.label}</span>
              <span className="text-sm text-gray-500">{method.description}</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${paymentMethod === method.id ? 'border-black bg-black' : 'border-gray-300'}`}>
              {paymentMethod === method.id && <FiCheck className="w-4 h-4 text-white" />}
            </div>
          </button>
        ))}
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
        <FiLock className="w-4 h-4" />
        <span>Tus datos estan seguros y encriptados</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200
                   text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Atras
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-4 rounded-full font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================
// REVIEW STEP
// ============================================
function ReviewStep({
  customer,
  deliveryType,
  selectedAddress,
  paymentMethod,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  customer: NikeCheckoutProps['customer'];
  deliveryType: 'delivery' | 'pickup';
  selectedAddress: string | null;
  paymentMethod: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { cart, config, formatPrice } = useStore();
  const primaryColor = config.colors?.primary || '#000000';

  const address = customer?.addresses?.find((a) => a.id === selectedAddress);

  const paymentLabels: Record<string, string> = {
    cash: 'Efectivo contra entrega',
    transfer: 'Yape / Plin / Transferencia',
    card: 'Tarjeta de credito/debito',
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-black mb-6">Revisa tu pedido</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black">Datos de contacto</h3>
            <Link
              href={`/${config.slug}/cuenta/configuracion`}
              className="text-sm hover:underline"
              style={{ color: primaryColor }}
            >
              <FiEdit2 className="w-4 h-4 inline mr-1" />
              Editar
            </Link>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 text-gray-600">
              <FiUser className="w-4 h-4" />
              {customer?.name}
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <FiMail className="w-4 h-4" />
              {customer?.email}
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <FiPhone className="w-4 h-4" />
              {customer?.phone || 'No registrado'}
            </p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black">
              {deliveryType === 'delivery' ? 'Direccion de entrega' : 'Recojo en tienda'}
            </h3>
          </div>
          {deliveryType === 'delivery' && address ? (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-black">{address.label}</p>
              <p>{address.address}</p>
              <p>{address.district}, {address.city}</p>
            </div>
          ) : deliveryType === 'pickup' ? (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-black">{config.name}</p>
              <p>{config.address || 'Direccion de tienda'}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin direccion seleccionada</p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-black mb-2">Metodo de pago</h3>
        <p className="text-sm text-gray-600">{paymentLabels[paymentMethod]}</p>
      </div>

      {/* Order Items */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-black mb-4">Productos ({cart.items.length})</h3>
        <div className="space-y-4">
          {cart.items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-black truncate">{item.name}</p>
                {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                  <p className="text-xs text-gray-500">
                    {Object.values(item.selected_options).join(' / ')}
                  </p>
                )}
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-bold" style={{ color: primaryColor }}>
                {formatPrice(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-black text-white rounded-xl p-6 mb-8">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Envio</span>
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

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-full font-bold border-2 border-gray-200
                   text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Atras
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-full font-bold text-white transition-all
                   hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <FaWhatsapp className="w-5 h-5" />
              Confirmar Pedido
            </>
          )}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Al confirmar, aceptas nuestros{' '}
        <Link href={`/${config.slug}/terminos`} className="underline">
          terminos y condiciones
        </Link>
      </p>
    </div>
  );
}

// ============================================
// ORDER SUMMARY SIDEBAR
// ============================================
function OrderSummarySidebar() {
  const { cart, formatPrice, config, updateQuantity, removeFromCart } = useStore();
  const primaryColor = config.colors?.primary || '#000000';

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 sticky top-4">
      <h3 className="text-lg font-bold text-black mb-4">
        Resumen ({cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'})
      </h3>

      <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
        {cart.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <img
                src={resolveImageUrl(item.image)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs
                             rounded-full flex items-center justify-center font-medium">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-black text-sm truncate">{item.name}</p>
              {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                <p className="text-xs text-gray-500">
                  {Object.values(item.selected_options).join(' / ')}
                </p>
              )}
              <p className="text-sm font-semibold mt-1" style={{ color: primaryColor }}>
                {formatPrice(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Codigo de descuento"
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-black"
          />
          <button className="px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium
                           hover:bg-gray-800 transition-colors">
            Aplicar
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envio</span>
          <span className="font-medium">
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
          <span style={{ color: primaryColor }}>{formatPrice(cart.total)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN CHECKOUT CONTENT
// ============================================
function NikeCheckoutContent({ customer }: { customer: NikeCheckoutProps['customer'] }) {
  const { config, cart, formatPrice, clearCart, getWhatsAppLink } = useStore();
  const primaryColor = config.colors?.primary || '#000000';

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(customer ? 'shipping' : 'auth');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>(customer ? ['auth'] : []);

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    customer?.addresses?.find((a) => a.is_default)?.id || null
  );
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const completeStep = (step: CheckoutStep, nextStep: CheckoutStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    setCurrentStep(nextStep);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const address = customer?.addresses?.find((a) => a.id === selectedAddress);

      // Build WhatsApp message
      const itemsList = cart.items.map((item) => {
        let text = `• ${item.name} x${item.quantity} - ${formatPrice(item.subtotal)}`;
        if (item.selected_options && Object.keys(item.selected_options).length > 0) {
          text += ` (${Object.values(item.selected_options).join(', ')})`;
        }
        return text;
      }).join('\n');

      const deliveryInfo = deliveryType === 'delivery' && address
        ? `\n\n📍 *Direccion:*\n${address.address}\n${address.district}, ${address.city}`
        : '\n\n📍 *Recojo en tienda*';

      const paymentLabels: Record<string, string> = {
        cash: 'Efectivo',
        transfer: 'Transferencia/Yape/Plin',
        card: 'Tarjeta',
      };

      const message = `🛒 *NUEVO PEDIDO*\n\n` +
        `👤 *Cliente:* ${customer?.name}\n` +
        `📧 *Email:* ${customer?.email}\n` +
        `📱 *Telefono:* ${customer?.phone || 'No registrado'}\n` +
        deliveryInfo +
        `\n\n📦 *Productos:*\n${itemsList}\n\n` +
        `💰 *Subtotal:* ${formatPrice(cart.subtotal)}\n` +
        `🚚 *Envio:* ${deliveryType === 'pickup' ? 'Gratis (Recojo)' : cart.shipping > 0 ? formatPrice(cart.shipping) : 'Por confirmar'}\n` +
        `${cart.discount > 0 ? `🏷️ *Descuento:* -${formatPrice(cart.discount)}\n` : ''}` +
        `\n*TOTAL: ${formatPrice(cart.total)}*\n\n` +
        `💳 *Metodo de pago:* ${paymentLabels[paymentMethod]}`;

      // Open WhatsApp
      window.open(getWhatsAppLink(message), '_blank');

      // Generate order number
      const generatedOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(generatedOrderNumber);

      // Clear cart and show confirmation
      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart
  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiTruck className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Tu carrito esta vacio</h2>
          <p className="text-gray-600 mb-6">Agrega productos para continuar</p>
          <Link
            href={`/${config.slug}/productos`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  // Order complete
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Pedido enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto para confirmar los detalles.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Numero de pedido: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          <div className="space-y-3">
            <Link
              href={`/${config.slug}/cuenta`}
              className="block w-full py-4 rounded-full font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Ver mis pedidos
            </Link>
            <Link
              href={`/${config.slug}`}
              className="block w-full py-4 rounded-full font-bold border-2 border-black text-black
                       hover:bg-black hover:text-white transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={`Checkout | ${config.name}`} />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b sticky top-0 bg-white z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${config.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Volver a la tienda</span>
            </Link>

            {config.logo ? (
              <img src={config.logo} alt={config.name} className="h-8" />
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {config.name}
              </span>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiLock className="w-4 h-4" />
              <span className="hidden sm:block">Checkout Seguro</span>
            </div>
          </div>

          {/* Steps */}
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Steps Content */}
            <div>
              {currentStep === 'auth' && (
                <AuthStep
                  onContinue={() => completeStep('auth', 'shipping')}
                  customer={customer}
                  accountSlug={config.slug}
                />
              )}

              {currentStep === 'shipping' && (
                <ShippingStep
                  customer={customer}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  deliveryType={deliveryType}
                  setDeliveryType={setDeliveryType}
                  onContinue={() => completeStep('shipping', 'payment')}
                  onBack={() => goToStep('auth')}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onContinue={() => completeStep('payment', 'review')}
                  onBack={() => goToStep('shipping')}
                />
              )}

              {currentStep === 'review' && (
                <ReviewStep
                  customer={customer}
                  deliveryType={deliveryType}
                  selectedAddress={selectedAddress}
                  paymentMethod={paymentMethod}
                  onBack={() => goToStep('payment')}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>

            {/* Order Summary Sidebar - Hidden on mobile for review step */}
            <div className={`${currentStep === 'review' ? 'hidden lg:block' : ''}`}>
              <OrderSummarySidebar />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ============================================
// MAIN COMPONENT WITH PROVIDER
// ============================================
export default function NikeCheckout() {
  const pageProps = usePage<{ data: NikeCheckoutProps }>().props;
  const { config, categories, customer } = pageProps.data;

  return (
    <StoreProvider config={config} categories={categories}>
      <NikeCheckoutContent customer={customer} />
    </StoreProvider>
  );
}
