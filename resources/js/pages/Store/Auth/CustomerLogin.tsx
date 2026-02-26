/**
 * Customer Login Page - Nike Style
 */

import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronLeft } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import type { StoreConfig } from '../types';

interface CustomerLoginProps {
  data: {
    config: StoreConfig;
    account_slug: string;
  };
}

export default function CustomerLogin() {
  const pageProps = usePage<{ data: CustomerLoginProps['data'] }>().props;
  const { config, account_slug } = pageProps.data;

  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const primaryColor = config.colors?.primary || '#000000';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/${account_slug}/cuenta/login`);
  };

  return (
    <>
      <Head title={`Iniciar Sesion | ${config.name}`} />

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
                Ingresa a tu cuenta
              </h1>
              <p className="text-gray-600">
                Accede a tus pedidos, favoritos y mas
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Tu contrasena"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                <Link
                  href={`/${account_slug}/cuenta/recuperar`}
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  Olvidaste tu contrasena?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-full font-bold text-white transition-all
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">o continua con</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social Login */}
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

            {/* Register Link */}
            <p className="text-center mt-8 text-gray-600">
              No tienes cuenta?{' '}
              <Link
                href={`/${account_slug}/cuenta/registro`}
                className="font-semibold text-black hover:underline"
              >
                Registrate aqui
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
