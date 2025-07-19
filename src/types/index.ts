export interface User {
  id: string;
  email: string;
  hasCompletedSegmentation: boolean;
  filters?: UserFilters;
  createdAt: string;
}

export interface UserFilters {
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  platform: 'mercadolibre' | 'tiendanube' | 'shopify';
  platformId: string;
  userId: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  saleDate: string;
  platform: 'mercadolibre' | 'tiendanube' | 'shopify';
  userId: string;
  createdAt: string;
}

export interface TopProduct {
  product: Product;
  totalSales: number;
  totalRevenue: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}