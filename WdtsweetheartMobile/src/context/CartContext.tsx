import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Định nghĩa lại kiểu dữ liệu sản phẩm (bạn có thể import từ file types chung nếu có)
export type UIProduct = {
  id: string;
  title: string;
  price: string;
  primaryImage: string;
  secondaryImage?: string;
  rating: number;
  isSale: boolean;
  priceValue: number;
  originalPrice?: string;
};

export type CartItem = {
  product: UIProduct;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: UIProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product: UIProduct, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        // Nếu đã có trong giỏ -> cộng thêm số lượng
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Nếu chưa có -> thêm mới
      return [...prevItems, { product, quantity }];
    });
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  // Cập nhật số lượng (+ / -)
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Xóa sạch giỏ hàng (dùng khi thanh toán xong)
  const clearCart = () => setCartItems([]);

  // Tính tổng tiền & tổng số lượng (Tự động tính lại khi cartItems thay đổi)
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.priceValue * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook tự tạo để gọi Context nhanh hơn ở các Screen khác
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được bọc bên trong CartProvider');
  }
  return context;
};