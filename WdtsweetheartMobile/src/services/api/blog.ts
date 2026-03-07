import { apiGet } from './client';

export type BlogCategory = {
  _id?: string;
  name?: string;
  slug?: string;
};

export type BlogItem = {
  _id: string;
  name: string;
  slug: string;
  avatar?: string;
  featuredImage?: string;
  description?: string;
  excerpt?: string;
  expert?: string;
  content?: string;
  category?: BlogCategory[] | BlogCategory;
  publishAt?: string;
  createdAt?: string;
};

export type BlogListParams = {
  categoryId?: string;
  keyword?: string;
};

const buildQuery = (params?: BlogListParams) => {
  if (!params) return '';
  const query = new URLSearchParams();
  if (params.categoryId) query.append('categoryId', params.categoryId);
  if (params.keyword) query.append('keyword', params.keyword);
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getBlogs = async (params?: BlogListParams) => {
  const query = buildQuery(params);
  return apiGet<BlogItem[]>(`/api/v1/client/article/list${query}`);
};

export const getBlogDetail = async (slug: string) => {
  return apiGet<BlogItem>(`/api/v1/client/article/detail/${slug}`);
};
