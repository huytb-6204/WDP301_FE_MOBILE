import { useEffect, useState } from 'react';
import {
  getProducts,
  GetProductsParams,
  Product,
  getProductBrands,
  ProductBrand,
  getProductCategories,
  ProductCategory,
  getProductSuggestions,
  ProductSuggestion,
} from '../services/api/product';

export const useProducts = (params?: GetProductsParams) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await getProducts(params);
      setData(Array.isArray(products) ? products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params || {})]);

  return { data, loading, error, refetch: fetchProducts };
};

export const useProductCategories = () => {
  const [data, setData] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categories = await getProductCategories();
      setData(Array.isArray(categories) ? categories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh mục');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { data, loading, error, refetch: fetchCategories };
};

export const useProductBrands = () => {
  const [data, setData] = useState<ProductBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const brands = await getProductBrands();
      setData(Array.isArray(brands) ? brands : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thương hiệu');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { data, loading, error, refetch: fetchBrands };
};

export const useProductSuggestions = (keyword: string) => {
  const [data, setData] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const suggestions = await getProductSuggestions(trimmed);
      setData(Array.isArray(suggestions) ? suggestions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải gợi ý');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [keyword]);

  return { data, loading, error, refetch: fetchSuggestions };
};
