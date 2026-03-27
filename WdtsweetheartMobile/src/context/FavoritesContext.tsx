import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const FAVORITES_STORAGE_KEY = '@wdt:favorites';

export type ProductVariantOption = {
  attrId: string;
  value: string;
  label?: string;
};

export type FavoriteProduct = {
  productId: string;
  variant?: ProductVariantOption[];
  quantity: number;
  addedAt: string;
  detail: {
    id: string;
    title: string;
    price: string;
    priceValue: number;
    originalPrice?: string;
    primaryImage: string;
    secondaryImage?: string;
    slug?: string;
    stock?: number;
    rating?: number;
    attributeList?: any[];
    variants?: any[];
  };
};

type FavoritesContextType = {
  favorites: FavoriteProduct[];
  isReady: boolean;
  isFavorite: (productId: string, variant?: ProductVariantOption[]) => boolean;
  toggleFavorite: (product: Omit<FavoriteProduct, 'addedAt'>) => void;
  removeFavorite: (productId: string, variant?: ProductVariantOption[]) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as any[];
          if (Array.isArray(parsed)) {
            // Migration: Convert old flat items to the new structured format
            const migrated = parsed.map((item) => {
              if (item.detail) return item as FavoriteProduct;
              
              const id = item.productId || item.id;
              if (!id) return null;

              return {
                productId: id,
                quantity: item.quantity || 1,
                addedAt: item.addedAt || new Date().toISOString(),
                variant: item.variant,
                detail: {
                  id: id,
                  title: item.title || '',
                  price: item.price || '0',
                  priceValue: item.priceValue || 0,
                  originalPrice: item.originalPrice,
                  primaryImage: item.primaryImage || '',
                  secondaryImage: item.secondaryImage,
                  slug: item.slug,
                  rating: item.rating,
                },
              } as FavoriteProduct;
            }).filter(Boolean) as FavoriteProduct[];

            setFavorites(migrated);
          } else {
            setFavorites([]);
          }
        }
      } catch {
        setFavorites([]);
      } finally {
        setIsReady(true);
      }
    };

    loadFavorites();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, isReady]);

  const isInList = (list: FavoriteProduct[], productId: string, variant?: ProductVariantOption[]) => {
    return list.some((item) => {
      if (item.productId !== productId) return false;
      if (!item.variant && !variant) return true;
      if (!item.variant || !variant) return false;
      return JSON.stringify(item.variant) === JSON.stringify(variant);
    });
  };

  const isFavorite = useCallback(
    (productId: string, variant?: ProductVariantOption[]) => {
      return isInList(favorites, productId, variant);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((item: Omit<FavoriteProduct, 'addedAt'>) => {
    setFavorites((prev) => {
      const exists = isInList(prev, item.productId, item.variant);
      if (exists) {
        return prev.filter((fav) => {
          if (fav.productId !== item.productId) return true;
          if (!fav.variant && !item.variant) return false;
          if (!fav.variant || !item.variant) return true;
          return JSON.stringify(fav.variant) !== JSON.stringify(item.variant);
        });
      }
      return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((productId: string, variant?: ProductVariantOption[]) => {
    setFavorites((prev) =>
      prev.filter((fav) => {
        if (fav.productId !== productId) return true;
        if (!fav.variant && !variant) return false;
        if (!fav.variant || !variant) return true;
        return JSON.stringify(fav.variant) !== JSON.stringify(variant);
      })
    );
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isReady,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites phải được bọc bên trong FavoritesProvider');
  }
  return context;
};
