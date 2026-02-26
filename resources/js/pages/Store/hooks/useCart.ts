/**
 * Hook para manejo del carrito de compras
 * Persiste en localStorage
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Cart, CartItem, Product } from '../types';

const CART_STORAGE_KEY = 'tribio_store_cart';

function loadCartFromStorage(storageKey: string): Cart {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return {
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  };
}

export function useCart(storeSlug: string) {
  const storageKey = `${CART_STORAGE_KEY}_${storeSlug}`;

  // Inicializar el estado directamente desde localStorage para evitar race conditions
  const [cart, setCart] = useState<Cart>(() => loadCartFromStorage(storageKey));

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Recargar carrito si cambia el storageKey (cambio de tienda)
  useEffect(() => {
    const loaded = loadCartFromStorage(storageKey);
    setCart(loaded);
  }, [storageKey]);

  // Guardar carrito en localStorage cuando cambie (pero no en el primer render)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart, storageKey]);

  // Recalcular totales
  const recalculateTotals = useCallback((items: CartItem[], shipping = 0, discount = 0): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      items,
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    };
  }, []);

  // Agregar producto al carrito
  const addToCart = useCallback((product: Product, quantity = 1, selectedOptions?: { [key: string]: string }) => {
    setCart(prevCart => {
      // Calcular precio con opciones
      let itemPrice = product.price;
      if (selectedOptions && product.options) {
        product.options.forEach(option => {
          const selectedValue = selectedOptions[option.name];
          if (selectedValue && option.prices?.[selectedValue]) {
            itemPrice += option.prices[selectedValue];
          }
        });
      }

      // Buscar si ya existe el producto con las mismas opciones
      const existingIndex = prevCart.items.findIndex(item => {
        if (item.id !== product.id) return false;
        if (!selectedOptions && !item.selected_options) return true;
        return JSON.stringify(item.selected_options) === JSON.stringify(selectedOptions);
      });

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Actualizar cantidad existente
        newItems = prevCart.items.map((item, index) => {
          if (index === existingIndex) {
            const newQuantity = item.quantity + quantity;
            return {
              ...item,
              quantity: newQuantity,
              subtotal: itemPrice * newQuantity,
            };
          }
          return item;
        });
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          ...product,
          quantity,
          selected_options: selectedOptions,
          subtotal: itemPrice * quantity,
        };
        newItems = [...prevCart.items, newItem];
      }

      return recalculateTotals(newItems, prevCart.shipping, prevCart.discount);
    });

    // Abrir carrito brevemente para mostrar que se agregó
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 2000);
  }, [recalculateTotals]);

  // Actualizar cantidad de un item
  const updateQuantity = useCallback((itemIndex: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemIndex);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map((item, index) => {
        if (index === itemIndex) {
          // Recalcular precio con opciones
          let itemPrice = item.price;
          if (item.selected_options && item.options) {
            item.options.forEach(option => {
              const selectedValue = item.selected_options![option.name];
              if (selectedValue && option.prices?.[selectedValue]) {
                itemPrice += option.prices[selectedValue];
              }
            });
          }

          return {
            ...item,
            quantity,
            subtotal: itemPrice * quantity,
          };
        }
        return item;
      });

      return recalculateTotals(newItems, prevCart.shipping, prevCart.discount);
    });
  }, [recalculateTotals]);

  // Eliminar item del carrito
  const removeFromCart = useCallback((itemIndex: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter((_, index) => index !== itemIndex);
      return recalculateTotals(newItems, prevCart.shipping, prevCart.discount);
    });
  }, [recalculateTotals]);

  // Vaciar carrito
  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
    });
  }, []);

  // Aplicar código de descuento
  const applyDiscount = useCallback((discount: number, couponCode?: string) => {
    setCart(prevCart => ({
      ...recalculateTotals(prevCart.items, prevCart.shipping, discount),
      coupon_code: couponCode,
    }));
  }, [recalculateTotals]);

  // Establecer costo de envío
  const setShipping = useCallback((shipping: number) => {
    setCart(prevCart => recalculateTotals(prevCart.items, shipping, prevCart.discount));
  }, [recalculateTotals]);

  // Obtener cantidad total de items
  const itemCount = useMemo(() =>
    cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: number) => {
    return cart.items.some(item => item.id === productId);
  }, [cart.items]);

  // Obtener cantidad de un producto específico
  const getProductQuantity = useCallback((productId: number) => {
    const item = cart.items.find(item => item.id === productId);
    return item?.quantity || 0;
  }, [cart.items]);

  return {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    setShipping,
    itemCount,
    isInCart,
    getProductQuantity,
  };
}

export type UseCartReturn = ReturnType<typeof useCart>;
