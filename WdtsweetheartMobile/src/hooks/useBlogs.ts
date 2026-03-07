import { useEffect, useState } from 'react';
import { getBlogs, type BlogItem, type BlogListParams } from '../services/api/blog';

export const useBlogs = (params?: BlogListParams) => {
  const [data, setData] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const blogs = await getBlogs(params);
      setData(blogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.categoryId, params?.keyword]);

  return { data, loading, error, refetch: fetchBlogs };
};
