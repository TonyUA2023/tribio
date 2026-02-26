/**
 * Página de Checkout - Estilo Shopify profesional
 */

import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiCreditCard,
  FiTruck,
  FiMapPin,
  FiCheck,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { StoreProvider, useStore } from './context/StoreContext';
import type { StoreConfig, Category, CustomerInfo } from './types';

interface CheckoutPageProps {
  config: StoreConfig;
  categories: Category[];
}

// ============================================
// CHECKOUT STEPS
// ============================================
type CheckoutStep = 'cart' | 'info' | 'shipping' | 'payment' | 'confirmation';

const steps: { id: CheckoutStep; label: string }[] = [
  { id: 'cart', label: 'Carrito' },
  { id: 'info', label: 'Informacion' },
  { id: 'shipping', label: 'Envio' },
  { id: 'payment', label: 'Pago' },
];

// ============================================
// ORDER SUMMARY COMPONENT
// ============================================
function OrderSummary() {
  const { cart, formatPrice, config, updateQuantity, removeFromCart } = useStore();
  const primaryColor = config.colors?.primary || '#f97316';

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen del pedido</h2>

      {/* Items */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {cart.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <img
                src={resolveImageUrl(item.image)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-xs
                             rounded-full flex items-center justify-center font-medium">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
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
      <div className="mt-6 pt-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Codigo de descuento"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-orange-500"
          />
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
                     hover:bg-gray-50 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 pt-4 border-t space-y-2">
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
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span style={{ color: primaryColor }}>{formatPrice(cart.total)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CUSTOMER INFO FORM
// ============================================
interface CustomerFormProps {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  errors: Partial<Record<keyof CustomerInfo, string>>;
}

function CustomerForm({ data, onChange, errors }: CustomerFormProps) {
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Informacion de contacto</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                      ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
            placeholder="Juan Perez"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefono / WhatsApp *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                      ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
            placeholder="999 999 999"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (opcional)
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="juan@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de entrega *
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('delivery_type', 'delivery')}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all
                      ${data.delivery_type === 'delivery'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
          >
            <FiTruck className={`w-6 h-6 ${data.delivery_type === 'delivery' ? 'text-orange-500' : 'text-gray-400'}`} />
            <div className="text-left">
              <span className="font-medium block">Delivery</span>
              <span className="text-sm text-gray-500">Envio a domicilio</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('delivery_type', 'pickup')}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all
                      ${data.delivery_type === 'pickup'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
          >
            <FiMapPin className={`w-6 h-6 ${data.delivery_type === 'pickup' ? 'text-orange-500' : 'text-gray-400'}`} />
            <div className="text-left">
              <span className="font-medium block">Recojo en tienda</span>
              <span className="text-sm text-gray-500">Sin costo de envio</span>
            </div>
          </button>
        </div>
      </div>

      {data.delivery_type === 'delivery' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Direccion de entrega *
            </label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                        ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="Av. Principal 123, Dpto 456"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distrito *
              </label>
              <input
                type="text"
                value={data.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Miraflores"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Lima"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Indicaciones especiales, referencias, etc."
        />
      </div>
    </div>
  );
}

// ============================================
// PAYMENT METHODS
// ============================================
interface PaymentMethodsProps {
  selected: string;
  onChange: (method: string) => void;
}

function PaymentMethods({ selected, onChange }: PaymentMethodsProps) {
  const { config } = useStore();

  const methods = [
    {
      id: 'cash',
      label: 'Efectivo',
      description: 'Pagar al recibir tu pedido',
      icon: '💵',
    },
    {
      id: 'transfer',
      label: 'Transferencia / Yape / Plin',
      description: 'Te enviaremos los datos bancarios',
      icon: '📱',
    },
    {
      id: 'card',
      label: 'Tarjeta de credito/debito',
      description: 'Pago seguro con tarjeta',
      icon: '💳',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Metodo de pago</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all
                      ${selected === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
          >
            <span className="text-2xl">{method.icon}</span>
            <div className="flex-1">
              <span className="font-medium block">{method.label}</span>
              <span className="text-sm text-gray-500">{method.description}</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${selected === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
              {selected === method.id && <FiCheck className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-sm text-gray-500 justify-center pt-4">
        <FiLock className="w-4 h-4" />
        <span>Tus datos estan seguros y encriptados</span>
      </div>
    </div>
  );
}

// ============================================
// MAIN CHECKOUT CONTENT
// ============================================
function StoreCheckoutContent() {
  const { config, cart, formatPrice, clearCart, getWhatsAppLink } = useStore();
  const primaryColor = config.colors?.primary || '#f97316';

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    delivery_type: 'delivery',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El telefono es requerido';
    }
    if (customerInfo.delivery_type === 'delivery' && !customerInfo.address?.trim()) {
      newErrors.address = 'La direccion es requerida para delivery';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build WhatsApp message
      const itemsList = cart.items.map(item => {
        let text = `• ${item.name} x${item.quantity} - ${formatPrice(item.subtotal)}`;
        if (item.selected_options && Object.keys(item.selected_options).length > 0) {
          text += ` (${Object.values(item.selected_options).join(', ')})`;
        }
        return text;
      }).join('\n');

      const deliveryInfo = customerInfo.delivery_type === 'delivery'
        ? `\n\n📍 *Direccion:*\n${customerInfo.address}\n${customerInfo.district || ''} ${customerInfo.city || ''}`
        : '\n\n📍 *Recojo en tienda*';

      const message = `🛒 *NUEVO PEDIDO*\n\n` +
        `👤 *Cliente:* ${customerInfo.name}\n` +
        `📱 *Telefono:* ${customerInfo.phone}\n` +
        `${customerInfo.email ? `📧 *Email:* ${customerInfo.email}\n` : ''}` +
        deliveryInfo +
        `\n\n📦 *Productos:*\n${itemsList}\n\n` +
        `💰 *Subtotal:* ${formatPrice(cart.subtotal)}\n` +
        `🚚 *Envio:* ${cart.shipping > 0 ? formatPrice(cart.shipping) : 'Por confirmar'}\n` +
        `${cart.discount > 0 ? `🏷️ *Descuento:* -${formatPrice(cart.discount)}\n` : ''}` +
        `\n*TOTAL: ${formatPrice(cart.total)}*\n\n` +
        `💳 *Metodo de pago:* ${paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta'}\n` +
        `${customerInfo.notes ? `\n📝 *Notas:* ${customerInfo.notes}` : ''}`;

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

  // If cart is empty (and not order complete), redirect
  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito esta vacio</h2>
          <p className="text-gray-600 mb-6">Agrega productos antes de continuar con el checkout</p>
          <Link
            href={`/${config.slug}/productos`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  // Order confirmation
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pedido enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto para confirmar los detalles.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Numero de pedido: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          <div className="space-y-3">
            <Link
              href={`/${config.slug}`}
              className="block w-full py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Volver a la tienda
            </Link>
            <a
              href={getWhatsAppLink('Hola! Tengo una consulta sobre mi pedido')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold
                       border border-green-500 text-green-600 hover:bg-green-50 transition-colors"
            >
              <FaWhatsapp className="w-5 h-5" />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={`Checkout | ${config.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={`/${config.slug}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <FiChevronLeft className="w-5 h-5" />
              <span>Volver a la tienda</span>
            </Link>

            {config.logo ? (
              <img src={config.logo} alt={config.name} className="h-10" />
            ) : (
              <span className="text-2xl font-serif italic" style={{ color: primaryColor }}>
                {config.name}
              </span>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiLock className="w-4 h-4" />
              <span>Checkout Seguro</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Form Section */}
            <div className="space-y-8">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <CustomerForm
                  data={customerInfo}
                  onChange={setCustomerInfo}
                  errors={errors}
                />
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <PaymentMethods
                  selected={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-full
                         font-bold text-lg text-white transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="w-6 h-6" />
                    Confirmar pedido por WhatsApp
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Al confirmar, aceptas nuestros{' '}
                <Link href={`/${config.slug}/terminos`} className="underline">
                  terminos y condiciones
                </Link>
              </p>
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <OrderSummary />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Wrapper with Provider
export default function StoreCheckout() {
  const pageProps = usePage<{ data: CheckoutPageProps }>().props;
  const { data } = pageProps;

  return (
    <StoreProvider config={data.config} categories={data.categories}>
      <StoreCheckoutContent />
    </StoreProvider>
  );
}
