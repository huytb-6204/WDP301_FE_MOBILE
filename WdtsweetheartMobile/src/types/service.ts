export type ServiceCategory = {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  createdAt: string;
};

export type Service = {
  _id: string;
  name: string;
  description?: string;
  categoryId: ServiceCategory | string;
  price?: number;
  priceOld?: number;
  discount?: number;
  image?: string;
  petType?: string;
  duration?: number;
  status: 'active' | 'inactive';
  deleted: boolean;
  createdAt: string;
};

export type ServiceReview = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  status?: string;
  user?: {
    fullName?: string;
    avatar?: string;
  };
};

export type PaginationResponse<T> = {
  code: number;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ServiceListParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  petType?: string;
};
