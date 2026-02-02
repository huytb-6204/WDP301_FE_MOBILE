import { useEffect, useState } from 'react';
import { getProducts, Product } from '../services/api/product';

export const useProducts = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await getProducts();
      setData(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { data, loading, error, refetch: fetchProducts };
};
