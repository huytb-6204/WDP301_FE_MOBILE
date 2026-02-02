import { apiGet } from './client';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
  priceOld?: number;
  priceNew?: number;
  discount?: number;
};

export const getProducts = async () => {
  return apiGet<Product[]>('/api/v1/client/product');
};
