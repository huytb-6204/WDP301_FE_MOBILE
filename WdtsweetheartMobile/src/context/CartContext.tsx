import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { env } from '../config';
import { getCartDetail, type CartListResponse } from '../services/api/cart';

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
  cartDetailItems: CartItem[];
  cartDetailLoading: boolean;
  cartDetailError: string | null;
  shippingOptions: CartListResponse['shippingOptions'];
  fetchCartDetail: (
    userAddress?: { latitude: number; longitude: number }
  ) => Promise<CartListResponse | null>;
  addToCart: (product: UIProduct, quantity: number) => void;
  replaceCart: (product: UIProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartDetailTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDetailItems, setCartDetailItems] = useState<CartItem[]>([]);
  const [cartDetailLoading, setCartDetailLoading] = useState(false);
  const [cartDetailError, setCartDetailError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<CartListResponse['shippingOptions']>(null);

  const toAbsoluteUrl = useCallback((url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const trimmed = url.replace(/^\/+/, '');
    return `${env.apiBaseUrl}/${trimmed}`;
  }, [env.apiBaseUrl]);

  const mapCartDetailToUI = useCallback((detail: CartListResponse['cart']) => {
    return (detail || []).map((item: any) => {
      const priceValue = item?.detail?.priceNew ?? item?.detail?.priceOld ?? 0;
      return {
        product: {
          id: item.productId,
          title: item?.detail?.name || 'Sản phẩm',
          price: priceValue ? `${priceValue}` : '0',
          primaryImage: toAbsoluteUrl(item?.detail?.images?.[0]),
          secondaryImage: toAbsoluteUrl(item?.detail?.images?.[1] || item?.detail?.images?.[0]),
          rating: 5,
          isSale: !!(item?.detail?.priceOld && item?.detail?.priceNew),
          priceValue,
          originalPrice: item?.detail?.priceOld ? `${item.detail.priceOld}` : undefined,
        },
        quantity: item.quantity,
      } as CartItem;
    });
  }, [toAbsoluteUrl]);

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

  const replaceCart = (product: UIProduct, quantity: number) => {
    setCartItems([{ product, quantity }]);
    setCartDetailItems([]);
    setShippingOptions(null);
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
  const clearCart = () => {
    setCartItems([]);
    setCartDetailItems([]);
    setShippingOptions(null);
  };

  const fetchCartDetail = useCallback(async (
    userAddress?: { latitude: number; longitude: number }
  ): Promise<CartListResponse | null> => {
    if (cartItems.length === 0) {
      setCartDetailItems([]);
      setShippingOptions(null);
      return null;
    }
    setCartDetailLoading(true);
    setCartDetailError(null);
    try {
      const payload = {
        cart: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        userAddress,
      };
      const res = await getCartDetail(payload);
      setCartDetailItems(mapCartDetailToUI(res.cart));
      setShippingOptions(res.shippingOptions ?? null);
      return res;
    } catch (err) {
      setCartDetailError(err instanceof Error ? err.message : 'Không thể tải giỏ hàng');
      return null;
    } finally {
      setCartDetailLoading(false);
    }
  }, [cartItems, mapCartDetailToUI]);

  // Tính tổng tiền & tổng số lượng (Tự động tính lại khi cartItems thay đổi)
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.priceValue * item.quantity, 0);
  }, [cartItems]);

  const cartDetailTotal = useMemo(() => {
    return cartDetailItems.reduce(
      (total, item) => total + item.product.priceValue * item.quantity,
      0
    );
  }, [cartDetailItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartDetailItems,
        cartDetailLoading,
        cartDetailError,
        shippingOptions,
        fetchCartDetail,
        addToCart,
        replaceCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartDetailTotal,
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
