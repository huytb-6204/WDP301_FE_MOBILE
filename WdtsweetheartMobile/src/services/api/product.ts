import { apiGetRaw } from './client';

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
  categorySlug?: string;
  brandSlug?: string;
  stock?: number;
  variants?: ProductVariant[];
};

export type ProductVariantOption = {
  attrId: string;
  value: string;
  label: string;
};

export type ProductVariant = {
  attributeValue: ProductVariantOption[];
  priceNew?: number | string;
  priceOld?: number | string;
  stock?: number | string;
  status?: boolean;
};

export type ProductAttribute = {
  _id: string;
  name: string;
  variants: string[];
  variantsLabel: string[];
};

export type ProductCategory = {
  _id?: string;
  name: string;
  slug: string;
  parent?: string | null;
  productCount?: number;
};

export type ProductBrand = {
  _id?: string;
  name: string;
  slug: string;
};

export type ProductSuggestion = {
  _id?: string;
  name: string;
  slug?: string;
  images?: string[];
  priceOld?: number;
  priceNew?: number;
};

export type GetProductsParams = {
  page?: number;
  limit?: number;
  categorySlug?: string;
  category?: string;
  brandSlug?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortKey?: string;
  sortValue?: string | number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T | { recordList?: T; products?: T };
  recordList?: T;
  products?: T;
  productDetail?: Product;
  attributeList?: ProductAttribute[];
  categories?: ProductCategory[];
  brands?: ProductBrand[];
  suggestions?: ProductSuggestion[];
};

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  const query = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
};

const readList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload !== 'object' || !payload) return [];

  const envelope = payload as ApiEnvelope<T[]>;

  if (Array.isArray(envelope.products)) return envelope.products;
  if (Array.isArray(envelope.recordList)) return envelope.recordList;
  if (Array.isArray(envelope.data)) return envelope.data;
  if (envelope.data && typeof envelope.data === 'object' && Array.isArray((envelope.data as any).recordList)) {
    return (envelope.data as any).recordList as T[];
  }
  if (envelope.data && typeof envelope.data === 'object' && Array.isArray((envelope.data as any).products)) {
    return (envelope.data as any).products as T[];
  }
  if (Array.isArray((payload as any).categories)) return (payload as any).categories as T[];
  if (Array.isArray((payload as any).brands)) return (payload as any).brands as T[];
  if (Array.isArray((payload as any).suggestions)) return (payload as any).suggestions as T[];

  return [];
};

const readProductDetail = (payload: unknown): ProductDetailResponse => {
  if (typeof payload !== 'object' || !payload) {
    throw new Error('Không thể tải chi tiết sản phẩm');
  }

  const raw = payload as ApiEnvelope<Product>;
  const productDetail =
    raw.productDetail ||
    ((raw.data as any)?.productDetail as Product | undefined) ||
    ((raw.data as Product | undefined) ?? undefined);
  const attributeList =
    raw.attributeList ||
    ((raw.data as any)?.attributeList as ProductAttribute[] | undefined) ||
    [];

  if (!productDetail || !productDetail._id) {
    throw new Error('Không thể tải chi tiết sản phẩm');
  }

  return {
    productDetail,
    attributeList,
  };
};

export const getProducts = async (params?: GetProductsParams) => {
  const query = buildQuery(params);
  const res = await apiGetRaw<unknown>(`/api/v1/client/product${query}`);
  return readList<Product>(res);
};

export const getProductCategories = async () => {
  const res = await apiGetRaw<unknown>('/api/v1/client/product/categories');
  return readList<ProductCategory>(res);
};

export const getProductBrands = async () => {
  const res = await apiGetRaw<unknown>('/api/v1/client/product/brands');
  return readList<ProductBrand>(res);
};

export const getProductSuggestions = async (keyword: string) => {
  const query = buildQuery({ keyword });
  const res = await apiGetRaw<unknown>(`/api/v1/client/product/search/suggestions${query}`);
  return readList<ProductSuggestion>(res);
};

export type ProductDetailResponse = {
  productDetail: Product;
  attributeList: ProductAttribute[];
};

export const getProductDetail = async (slug: string): Promise<ProductDetailResponse> => {
  const res = await apiGetRaw<unknown>(`/api/v1/client/product/detail/${slug}`);
  return readProductDetail(res);
};


