/**
 * Header de la tienda virtual - Estilo Shopify/Dolce Capriccio
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiLogOut,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';

interface StoreHeaderProps {
  transparent?: boolean;
}

export function StoreHeader({ transparent = false }: StoreHeaderProps) {
  const {
    config,
    categories,
    itemCount,
    setIsCartOpen,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    getWhatsAppLink,
  } = useStore();

  const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string } | null } }>().props;
  const user = auth?.user;
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerBg = transparent && !isScrolled
    ? 'bg-transparent'
    : 'bg-white shadow-sm';

  const textColor = transparent && !isScrolled
    ? 'text-white'
    : 'text-gray-800';

  const primaryColor = config.colors?.primary || '#f97316'; // Naranja coral como Dolce Capriccio

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {config.phone && (
              <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                <FiPhone className="w-3.5 h-3.5" />
                <span>{config.phone}</span>
              </a>
            )}
            {config.address && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <FiMapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{config.address}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{config.business_hours}</span>
            {config.social_links?.whatsapp && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/${config.slug}`} className="flex-shrink-0">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt={config.name}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <h1
                  className="text-3xl font-serif italic"
                  style={{ color: primaryColor }}
                >
                  {config.name}
                </h1>
              )}
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-full
                         text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
                <span className="text-sm">Buscar productos...</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Cuenta */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium hidden xl:block max-w-[100px] truncate ${textColor}`}>
                        {user.name.split(' ')[0]}
                      </span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href={`/${config.slug}/cuenta/pedidos`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiPackage className="w-4 h-4" />
                          Mis pedidos
                        </Link>
                        <Link
                          href="/mis-compras"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiShoppingCart className="w-4 h-4" />
                          Todas mis compras
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Link
                            href={`/${config.slug}/cuenta/logout`}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiLogOut className="w-4 h-4" />
                            Cerrar sesion
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/${config.slug}/cuenta/login`}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${textColor}`}
                  >
                    <FiUser className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Favoritos */}
              <button className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${textColor}`}>
                <FiHeart className="w-5 h-5" />
              </button>

              {/* Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiShoppingCart className={`w-5 h-5 ${textColor}`} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs
                             flex items-center justify-center font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block border-t border-gray-100">
            <ul className="flex items-center justify-center gap-1 py-3">
              {/* Categorías Dropdown */}
              <li className="relative group">
                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium text-sm transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FiMenu className="w-4 h-4" />
                  <span>NUESTRAS CATEGORIAS</span>
                </button>

                {/* Mega Menu */}
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                              transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${config.slug}/categoria/${category.slug}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {category.icon && (
                            <span className="text-xl">{category.icon}</span>
                          )}
                          <span className="text-gray-700 font-medium text-sm">
                            {category.name}
                          </span>
                        </div>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <FiChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Links principales */}
              <li>
                <Link
                  href={`/${config.slug}`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  <span>🏠</span>
                  <span>INICIO</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/nosotros`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  <span>❤️</span>
                  <span>NOSOTROS</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/tiendas`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  <span>📍</span>
                  <span>TIENDAS</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/blog`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  <span>📝</span>
                  <span>BLOG</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${config.slug}/carta`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  <span>🍴</span>
                  <span>CARTA SALON</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between h-16">
            {/* Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-2 ${textColor}`}
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href={`/${config.slug}`} className="flex-shrink-0">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt={config.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <h1
                  className="text-2xl font-serif italic"
                  style={{ color: primaryColor }}
                >
                  {config.name}
                </h1>
              )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 ${textColor}`}
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
              >
                <FiShoppingCart className={`w-5 h-5 ${textColor}`} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs
                             flex items-center justify-center font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="h-8" />
              ) : (
                <span className="text-xl font-serif italic" style={{ color: primaryColor }}>
                  {config.name}
                </span>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/${config.slug}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">🏠</span>
                    <span className="font-medium">Inicio</span>
                  </Link>
                </li>

                {/* Categorías */}
                <li className="pt-2">
                  <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categorías
                  </span>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${config.slug}/categoria/${category.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.icon && (
                        <span className="text-xl">{category.icon}</span>
                      )}
                      <span className="font-medium">{category.name}</span>
                      {category.products_count && (
                        <span className="ml-auto text-xs text-gray-400">
                          {category.products_count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}

                {/* Otros links */}
                <li className="pt-4 border-t mt-4">
                  <Link
                    href={`/${config.slug}/nosotros`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">❤️</span>
                    <span className="font-medium">Nosotros</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${config.slug}/contacto`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">📞</span>
                    <span className="font-medium">Contacto</span>
                  </Link>
                </li>
              </ul>

              {/* WhatsApp CTA */}
              {config.social_links?.whatsapp && (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-6 px-6 py-3 bg-green-500 text-white
                           rounded-full font-medium hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>Contactar por WhatsApp</span>
                </a>
              )}

              {/* User section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div
                        className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={`/${config.slug}/cuenta/pedidos`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiPackage className="w-5 h-5" />
                      <span className="font-medium">Mis pedidos</span>
                    </Link>
                    <Link
                      href="/mis-compras"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span className="font-medium">Todas mis compras</span>
                    </Link>
                    <Link
                      href={`/${config.slug}/cuenta/logout`}
                      method="post"
                      as="button"
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="font-medium">Cerrar sesion</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/${config.slug}/cuenta/login`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Iniciar sesion</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export default StoreHeader;
