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

export type FavoriteProduct = {
  id: string;
  title: string;
  price: string;
  primaryImage: string;
  secondaryImage?: string;
  rating: number;
  isSale: boolean;
  priceValue?: number;
  originalPrice?: string;
  slug?: string;
};

type FavoritesContextType = {
  favorites: FavoriteProduct[];
  favoriteIds: Set<string>;
  isReady: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: string) => void;
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
          const parsed = JSON.parse(stored) as FavoriteProduct[];
          setFavorites(Array.isArray(parsed) ? parsed : []);
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

  const addFavorite = useCallback((product: FavoriteProduct) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.map((item) => (item.id === product.id ? { ...item, ...product } : item));
      }
      return [product, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleFavorite = useCallback((product: FavoriteProduct) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [product, ...prev];
    });
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isReady,
        isFavorite,
        toggleFavorite,
        addFavorite,
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
