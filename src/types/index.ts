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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}