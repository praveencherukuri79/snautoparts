import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getStorageItem, removeStorageItem, STORAGE_KEYS } from '@/utils/storage';

// API Response wrapper type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Error type
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for session cookies
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getStorageItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      const apiError: ApiError = {
        message: 'An unexpected error occurred',
        status: error.response?.status || 500,
      };

      if (error.response) {
        const { data, status } = error.response;

        // Handle specific status codes
        switch (status) {
          case 401:
            apiError.message = 'Unauthorized. Please sign in again.';
            // Clear auth data and redirect to login
            removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
            removeStorageItem(STORAGE_KEYS.USER);
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            break;
          case 403:
            apiError.message = 'You do not have permission to perform this action.';
            break;
          case 404:
            apiError.message = 'The requested resource was not found.';
            break;
          case 422:
            apiError.message = data?.message || 'Validation error';
            apiError.errors = data?.errors;
            break;
          case 429:
            apiError.message = 'Too many requests. Please try again later.';
            break;
          case 500:
          case 502:
          case 503:
            apiError.message = 'Server error. Please try again later.';
            break;
          default:
            apiError.message = data?.message || error.message;
        }
      } else if (error.request) {
        // Network error
        apiError.message = 'Network error. Please check your connection.';
        apiError.status = 0;
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Create the api instance
export const api = createApiInstance();

// Generic request methods
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
