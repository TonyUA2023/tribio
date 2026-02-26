/**
 * Contexto global de la tienda
 * Maneja el estado del carrito, configuración y navegación
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCart, UseCartReturn } from '../hooks/useCart';
import type { StoreConfig, Category, ProductFilters } from '../types';

interface StoreContextType extends UseCartReturn {
  config: StoreConfig;
  categories: Category[];
  // Búsqueda
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Filtros
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  resetFilters: () => void;
  // Mobile menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  // Helpers
  formatPrice: (price: number) => string;
  getWhatsAppLink: (message?: string) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
  config: StoreConfig;
  categories: Category[];
}

export function StoreProvider({ children, config, categories }: StoreProviderProps) {
  // Carrito
  const cartHook = useCart(config.slug);

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<ProductFilters>({});
  const resetFilters = useCallback(() => setFilters({}), []);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Formatear precio
  const formatPrice = useCallback((price: number) => {
    const symbol = config.currency_symbol || 'S/';
    return `${symbol} ${price.toFixed(2)}`;
  }, [config.currency_symbol]);

  // Obtener link de WhatsApp
  const getWhatsAppLink = useCallback((message?: string) => {
    const phone = config.social_links?.whatsapp || config.phone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const baseUrl = `https://wa.me/${cleanPhone}`;
    return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
  }, [config.social_links?.whatsapp, config.phone]);

  const value: StoreContextType = {
    ...cartHook,
    config,
    categories,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    filters,
    setFilters,
    resetFilters,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    formatPrice,
    getWhatsAppLink,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return context;
}
