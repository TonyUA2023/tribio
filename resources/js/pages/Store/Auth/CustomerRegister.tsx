/**
 * Customer Register Page - Nike Style
 */

import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import type { StoreConfig } from '../types';

interface CustomerRegisterProps {
  data: {
    config: StoreConfig;
    account_slug: string;
  };
}

export default function CustomerRegister() {
  const pageProps = usePage<{ data: CustomerRegisterProps['data'] }>().props;
  const { config, account_slug } = pageProps.data;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const primaryColor = config.colors?.primary || '#000000';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) return;
    post(`/${account_slug}/cuenta/registro`);
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(data.password);
  const strengthLabels = ['', 'Debil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  return (
    <>
      <Head title={`Crear Cuenta | ${config.name}`} />

      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${account_slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver a la tienda</span>
            </Link>

            {config.logo ? (
              <img src={config.logo} alt={config.name} className="h-8" />
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {config.name}
              </span>
            )}

            <div className="w-24" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-black mb-2">
                Crea tu cuenta
              </h1>
              <p className="text-gray-600">
                Unete para acceder a ofertas exclusivas y mas
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-black mb-3">Beneficios de miembro:</h3>
              <ul className="space-y-2">
                {[
                  'Seguimiento de tus pedidos en tiempo real',
                  'Historial de compras en todas las tiendas Tribio',
                  'Lista de favoritos sincronizada',
                  'Ofertas y descuentos exclusivos',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-black placeholder-gray-400
                              focus:outline-none focus:border-black transition-colors
                              ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Tu nombre"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-black placeholder-gray-400
                              focus:outline-none focus:border-black transition-colors
                              ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono / WhatsApp
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-black placeholder-gray-400
                              focus:outline-none focus:border-black transition-colors
                              ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="999 999 999"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrasena
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-lg text-black placeholder-gray-400
                              focus:outline-none focus:border-black transition-colors
                              ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Minimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {data.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: passwordStrength >= level
                              ? strengthColors[passwordStrength]
                              : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contrasena
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-lg text-black placeholder-gray-400
                              focus:outline-none focus:border-black transition-colors
                              ${data.password_confirmation && data.password !== data.password_confirmation
                                ? 'border-red-500'
                                : 'border-gray-200'}`}
                    placeholder="Repite tu contrasena"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {data.password_confirmation && data.password !== data.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">Las contrasenas no coinciden</p>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black accent-black mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los{' '}
                    <Link href={`/${account_slug}/terminos`} className="text-black underline">
                      terminos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link href={`/${account_slug}/privacidad`} className="text-black underline">
                      politica de privacidad
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || !acceptTerms}
                className="w-full py-4 rounded-full font-bold text-white transition-all
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">o registrate con</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social Register */}
            <div className="space-y-3">
              <a
                href={`/${account_slug}/auth/google`}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200
                         rounded-full font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                <span>Continuar con Google</span>
              </a>
            </div>

            {/* Login Link */}
            <p className="text-center mt-8 text-gray-600">
              Ya tienes cuenta?{' '}
              <Link
                href={`/${account_slug}/cuenta/login`}
                className="font-semibold text-black hover:underline"
              >
                Inicia sesion
              </Link>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <Link href={`/${account_slug}/terminos`} className="hover:text-black">
              Terminos y Condiciones
            </Link>
            <span>|</span>
            <Link href={`/${account_slug}/privacidad`} className="hover:text-black">
              Politica de Privacidad
            </Link>
            <span>|</span>
            <span>© {new Date().getFullYear()} {config.name}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
