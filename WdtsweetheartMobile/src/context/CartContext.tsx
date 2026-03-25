import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { env } from '../config';
import { getCartDetail, type CartListResponse, type CartVariant } from '../services/api/cart';

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
  lineId: string;
  product: UIProduct;
  quantity: number;
  checked: boolean;
  variant?: CartVariant[];
};

type CartContextType = {
  cartItems: CartItem[];
  checkedCartItems: CartItem[];
  cartDetailItems: CartItem[];
  cartDetailLoading: boolean;
  cartDetailError: string | null;
  shippingOptions: CartListResponse['shippingOptions'];
  fetchCartDetail: (userAddress?: { latitude: number; longitude: number }) => Promise<CartListResponse | null>;
  addToCart: (product: UIProduct, quantity: number, variant?: CartVariant[]) => void;
  replaceCart: (product: UIProduct, quantity: number, variant?: CartVariant[]) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  toggleCheck: (lineId: string) => void;
  toggleAll: () => void;
  clearCart: () => void;
  cartTotal: number;
  checkedCartTotal: number;
  cartDetailTotal: number;
  cartCount: number;
  checkedCartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeVariant = (variant?: CartVariant[]) =>
  (variant || [])
    .map((item) => ({
      attrId: item.attrId,
      value: item.value,
      label: item.label || item.value,
    }))
    .sort((a, b) => a.attrId.localeCompare(b.attrId));

const buildLineId = (productId: string, variant?: CartVariant[]) => {
  const normalized = normalizeVariant(variant);
  if (normalized.length === 0) return productId;
  return `${productId}__${normalized.map((item) => `${item.attrId}:${item.value}`).join('|')}`;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDetailItems, setCartDetailItems] = useState<CartItem[]>([]);
  const [cartDetailLoading, setCartDetailLoading] = useState(false);
  const [cartDetailError, setCartDetailError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<CartListResponse['shippingOptions']>(null);

  const toAbsoluteUrl = useCallback(
    (url?: string) => {
      if (!url) return '';
      if (/^https?:\/\//i.test(url)) return url;
      const trimmed = url.replace(/^\/+/, '');
      return `${env.apiBaseUrl}/${trimmed}`;
    },
    [env.apiBaseUrl]
  );

  const mapCartDetailToUI = useCallback(
    (detail: CartListResponse['cart']) => {
      return (detail || []).map((item: any) => {
        const priceValue = item?.detail?.priceNew ?? item?.detail?.priceOld ?? 0;
        return {
          lineId: buildLineId(item.productId, item.variant),
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
          checked: true,
          variant: normalizeVariant(item.variant),
        } as CartItem;
      });
    },
    [toAbsoluteUrl]
  );

  const addToCart = (product: UIProduct, quantity: number, variant?: CartVariant[]) => {
    const lineId = buildLineId(product.id, variant);
    const normalizedVariant = normalizeVariant(variant);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.lineId === lineId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + quantity, checked: true } : item
        );
      }
      return [...prevItems, { lineId, product, quantity, checked: true, variant: normalizedVariant }];
    });
  };

  const replaceCart = (product: UIProduct, quantity: number, variant?: CartVariant[]) => {
    setCartItems([{ lineId: buildLineId(product.id, variant), product, quantity, checked: true, variant: normalizeVariant(variant) }]);
    setCartDetailItems([]);
    setShippingOptions(null);
  };

  const removeFromCart = (lineId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.lineId !== lineId));
    setCartDetailItems((prevItems) => prevItems.filter((item) => item.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
    );
    setCartDetailItems((prevItems) =>
      prevItems.map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
    );
  };

  const toggleCheck = (lineId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.lineId === lineId ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleAll = () => {
    setCartItems((prevItems) => {
      const shouldCheckAll = prevItems.some((item) => !item.checked);
      return prevItems.map((item) => ({ ...item, checked: shouldCheckAll }));
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartDetailItems([]);
    setShippingOptions(null);
  };

  const checkedCartItems = useMemo(() => cartItems.filter((item) => item.checked), [cartItems]);

  const fetchCartDetail = useCallback(
    async (userAddress?: { latitude: number; longitude: number }): Promise<CartListResponse | null> => {
      if (checkedCartItems.length === 0) {
        setCartDetailItems([]);
        setShippingOptions(null);
        return null;
      }

      setCartDetailLoading(true);
      setCartDetailError(null);
      try {
        const payload = {
          cart: checkedCartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            variant: item.variant,
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
    },
    [checkedCartItems, mapCartDetailToUI]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
    [cartItems]
  );
  const checkedCartTotal = useMemo(
    () => checkedCartItems.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
    [checkedCartItems]
  );
  const cartDetailTotal = useMemo(
    () => cartDetailItems.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
    [cartDetailItems]
  );
  const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);
  const checkedCartCount = useMemo(
    () => checkedCartItems.reduce((count, item) => count + item.quantity, 0),
    [checkedCartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        checkedCartItems,
        cartDetailItems,
        cartDetailLoading,
        cartDetailError,
        shippingOptions,
        fetchCartDetail,
        addToCart,
        replaceCart,
        removeFromCart,
        updateQuantity,
        toggleCheck,
        toggleAll,
        clearCart,
        cartTotal,
        checkedCartTotal,
        cartDetailTotal,
        cartCount,
        checkedCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được bọc bên trong CartProvider');
  }
  return context;
};
