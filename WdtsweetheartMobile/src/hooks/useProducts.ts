import { useEffect, useState } from 'react';
import { getProducts, GetProductsParams, Product } from '../services/api/product';

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
