/**
 * Footer de la tienda virtual - Estilo Shopify/Dolce Capriccio
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiInstagram,
  FiFacebook,
} from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';

export function StoreFooter() {
  const { config, categories, getWhatsAppLink } = useStore();

  const primaryColor = config.colors?.primary || '#f97316';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Suscribete a nuestro Newsletter
              </h3>
              <p className="text-gray-400">
                Recibe ofertas exclusivas y novedades en tu correo
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Tu correo electronico"
                className="flex-1 md:w-80 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div>
            {config.logo ? (
              <img
                src={config.logo}
                alt={config.name}
                className="h-12 mb-4 brightness-0 invert"
              />
            ) : (
              <h2 className="text-2xl font-serif italic mb-4" style={{ color: primaryColor }}>
                {config.name}
              </h2>
            )}
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {config.description || 'La mejor tienda online con productos de calidad premium.'}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {config.social_links?.instagram && (
                <a
                  href={config.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center
                           hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-500 transition-all"
                >
                  <FiInstagram className="w-5 h-5" />
                </a>
              )}
              {config.social_links?.facebook && (
                <a
                  href={config.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center
                           hover:bg-blue-600 transition-all"
                >
                  <FiFacebook className="w-5 h-5" />
                </a>
              )}
              {config.social_links?.tiktok && (
                <a
                  href={config.social_links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center
                           hover:bg-black transition-all"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
              )}
              {config.social_links?.whatsapp && (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center
                           hover:bg-green-500 transition-all"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/${config.slug}/categoria/${category.slug}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Enlaces Rapidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${config.slug}/nosotros`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/tiendas`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Nuestras Tiendas
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/blog`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/contacto`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/faq`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/terminos`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Terminos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/privacidad`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Politica de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-3">
              {config.address && (
                <li className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{config.address}</span>
                </li>
              )}
              {config.phone && (
                <li className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <a
                    href={`tel:${config.phone}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {config.phone}
                  </a>
                </li>
              )}
              {config.email && (
                <li className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <a
                    href={`mailto:${config.email}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {config.email}
                  </a>
                </li>
              )}
              {config.business_hours && (
                <li className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{config.business_hours}</span>
                </li>
              )}
            </ul>

            {/* Payment Methods */}
            {config.payment_methods && config.payment_methods.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-semibold mb-3">Metodos de Pago</h5>
                <div className="flex items-center gap-2 flex-wrap">
                  {config.payment_methods.includes('visa') && (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-xs">VISA</span>
                    </div>
                  )}
                  {config.payment_methods.includes('mastercard') && (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">MC</span>
                    </div>
                  )}
                  {config.payment_methods.includes('yape') && (
                    <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">Yape</span>
                    </div>
                  )}
                  {config.payment_methods.includes('plin') && (
                    <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">Plin</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              &copy; {currentYear} {config.name}. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm">
              Desarrollado con 💜 por{' '}
              <a
                href="https://tribio.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                TRIBIO
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Cookies Banner - Fixed at bottom */}
      <CookiesBanner />
    </footer>
  );
}

// Componente de cookies
function CookiesBanner() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const hasAccepted = localStorage.getItem('cookies_accepted');
    if (!hasAccepted) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:w-96 z-50">
      <div className="bg-white text-gray-800 p-4 md:rounded-lg shadow-2xl border border-gray-200">
        <p className="text-sm mb-3">
          Para brindarle una experiencia de compra personalizada, nuestro sitio
          utiliza cookies. Al continuar usando este sitio, usted acepta nuestros{' '}
          <a href="#" className="text-orange-500 underline">
            politica de cookies
          </a>
          .
        </p>
        <button
          onClick={acceptCookies}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium
                   hover:bg-gray-800 transition-colors"
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
}

export default StoreFooter;
