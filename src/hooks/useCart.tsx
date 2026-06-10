import { useState, createContext, useContext, type ReactNode } from 'react';
import type { CartItem, Listing } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addItem: (listing: Listing, quantity?: number) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  const addItem = (listing: Listing, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.listing.id === listing.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map(item => item.listing.id === listing.id ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        newItems = [...prev, { id: crypto.randomUUID(), listing, quantity }];
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeItem = (listingId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.listing.id !== listingId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const updateQuantity = (listingId: string, quantity: number) => {
    if (quantity < 1) { removeItem(listingId); return; }
    setItems(prev => {
      const newItems = prev.map(item => item.listing.id === listingId ? { ...item, quantity } : item);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearCart = () => { setItems([]); localStorage.removeItem('cart'); };
  const total = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
