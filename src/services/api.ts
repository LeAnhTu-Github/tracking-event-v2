// lib/axios.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
type TError = {
  code: number;
  message: string;
};

// Types
export interface ApiError {
  message: string;
  status: number;
  data?: any;
  error?: TError;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Environment configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.gms.xtel.vn',
  // timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
} as const;

export const API_BASE_URL: string = API_CONFIG.baseURL;

export const getAbsoluteApiUrl = (path: string): string => {
  if (!path) return API_BASE_URL;
  return new URL(path.startsWith('/') ? path : `/${path}`, API_BASE_URL).toString();
};

const serializeParams = (params: unknown): string => {
  if (!params || typeof params !== 'object') return '';
  const entries = Object.entries(params as Record<string, unknown>).flatMap(
    ([key, value]) => {
      if (value === undefined || value === null) return [];
      if (Array.isArray(value)) {
        return value
          .filter((v) => v !== undefined && v !== null)
          .map(
            (v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`
          );
      }
      return [
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      ];
    }
  );
  return entries.join('&');
};

const generateRequestId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return uuidv4();
};
// Create axios instan
// ce
const axiosInstance: AxiosInstance = axios.create({
  ...API_CONFIG,
  paramsSerializer: {
    serialize: serializeParams
  }
});

// Request interceptor for authentication and logging
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add request ID for tracking
    const requestId = generateRequestId();
    if (requestId) {
      config.headers['X-Request-ID'] = requestId;
    }

    // Log request in development
    // if (process.env.NODE_ENV === 'development') {
    //     console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
    //         headers: config.headers,
    //         data: config.data
    //     });
    // }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    // if (process.env.NODE_ENV === 'development') {
    //     console.log(
    //         `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
    //         {
    //             status: response.status,
    //             data: response.data
    //         }
    //     );
    // }

    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error('Unauthorized');
      return Promise.reject(error);
    }

    // Handle different error types
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      message:
        responseData?.error?.message ||
        responseData?.message ||
        error.message ||
        'An error occurred',
      status: error.response?.status || 500,
      data: responseData,
      error: responseData?.error
    };
    return Promise.reject(apiError);
  }
);

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get<ApiResponse<T>>(url, config).then((res) => res.data.data),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    axiosInstance
      .post<ApiResponse<T>>(url, data, config)
      .then((res) => res.data.data),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    axiosInstance
      .put<ApiResponse<T>>(url, data, config)
      .then((res) => res.data.data),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    axiosInstance
      .patch<ApiResponse<T>>(url, data, config)
      .then((res) => res.data.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance
      .delete<ApiResponse<T>>(url, config)
      .then((res) => res.data.data),

  upload: <T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance
      .post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        }
      })
      .then((res) => res.data.data);
  },

  // Download file
  download: (url: string, filename?: string) =>
    axiosInstance
      .get(url, {
        responseType: 'blob'
      })
      .then((response) => {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
};

// Server-side API calls (for server components and API routes)
export const serverApi = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<T> => {
    const { token, ...restConfig } = config || {};
    return axios
      .get<ApiResponse<T>>(url, {
        ...restConfig,
        baseURL: API_CONFIG.baseURL,
        headers: {
          ...API_CONFIG.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...restConfig.headers
        }
      })
      .then((res) => res.data.data);
  },

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<T> => {
    const { token, ...restConfig } = config || {};
    return axios
      .post<ApiResponse<T>>(url, data, {
        ...restConfig,
        baseURL: API_CONFIG.baseURL,
        headers: {
          ...API_CONFIG.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...restConfig.headers
        }
      })
      .then((res) => res.data.data);
  }
};

// Request cancellation utility
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    token: controller.signal,
    cancel: (reason?: string) => controller.abort(reason)
  };
};

// Retry utility for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) break;

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw lastError!;
};

export default axiosInstance;
