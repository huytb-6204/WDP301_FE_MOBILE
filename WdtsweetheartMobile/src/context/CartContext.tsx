import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: string;
  priceValue: number;
  quantity: number;
  primaryImage: string;
  secondaryImage: string;
  rating: number;
  isSale: boolean;
  originalPrice?: string;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === newItem.productId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === newItem.productId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      
      return [...prevItems, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: string) => {
    return items.find(item => item.productId === productId)?.quantity || 0;
  }, [items]);

  const value: CartContextType = {
    items,
    cartCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
