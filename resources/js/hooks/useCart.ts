// resources/js/hooks/useCart.ts
import { useState, useMemo } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  [key: string]: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Totales calculados automáticamente
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0), 
  [cart]);

  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0), 
  [cart]);

  // Acciones
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  };

  return {
    cart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    updateQuantity,
    clearCart
  };
};