import { apiGet } from './client';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
  priceOld?: number;
  priceNew?: number;
  discount?: number;
  description?: string;
  content?: string;
};

export const getProducts = async () => {
  return apiGet<Product[]>('/api/v1/client/product');
};

export type ProductDetailResponse = {
  productDetail: Product;
  attributeList: unknown[];
};

export const getProductDetail = async (slug: string) => {
  return apiGet<ProductDetailResponse>(`/api/v1/client/product/detail/${slug}`);
};
