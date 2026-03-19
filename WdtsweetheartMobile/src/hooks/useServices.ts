import { useState, useEffect } from 'react';
import {
  getServices,
  getServiceCategories,
  getServiceDetail,
  getServiceBySlug,
} from '../services/api/service';
import { Service, ServiceCategory, ServiceListParams } from '../types/service';

export const useServices = (params?: ServiceListParams) => {
  const [data, setData] = useState<Service[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getServices(params);
        setData(result.data);
        setPagination(result.pagination);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Không thể tải dịch vụ';
        console.error('Error fetching services:', errorMsg);
        setError(errorMsg);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [params?.page, params?.limit, params?.categoryId, params?.petType]);

  return { data, pagination, loading, error };
};

export const useServiceCategories = () => {
  const [data, setData] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getServiceCategories();
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Không thể tải danh mục dịch vụ';
        console.error('Error fetching service categories:', errorMsg);
        setError(errorMsg);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
};

export const useServiceDetail = (serviceId: string) => {
  const [data, setData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getServiceDetail(serviceId);
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Không thể tải chi tiết dịch vụ';
        console.error('Error fetching service detail:', errorMsg);
        setError(errorMsg);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [serviceId]);

  return { data, loading, error };
};

export const useServiceBySlug = (slug: string) => {
  const [data, setData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getServiceBySlug(slug);
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Không thể tải chi tiết dịch vụ';
        console.error('Error fetching service detail:', errorMsg);
        setError(errorMsg);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  return { data, loading, error };
};
