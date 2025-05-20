// src/shared/api/axios.ts
import { showToast } from '@shared/utils/toast';
import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipToast?: boolean;
}
interface CustomAxiosError extends Omit<AxiosError, 'config'> {
  config: CustomAxiosRequestConfig & { headers?: Record<string, string> };
}

export const api = axios.create({
  baseURL: 'http://localhost:3001', // 🔁 Update to production/staging later
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // const token = await AsyncStorage.getItem('accessToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log(`➡️ [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    if (config.data) console.log('Payload:', config.data);

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [Request Error]', error);
    return Promise.reject(error);
  },
);

// ✅ Response Interceptor
api.interceptors.response.use(
  response => {
    console.log(`✅ [Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: CustomAxiosError) => {
    console.error('❌ [Response Error]', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    const message =
      (error.response?.data as any)?.message ||
      (error.response?.data as { error?: string })?.error || // safely access .message
      error.message ||
      'Something went wrong. Please try again.';

    // 🍞 Global toast
    if (!error.config?.skipToast) {
      showToast({ type: 'error', title: 'Error', message });
    }
    return Promise.reject(error);
  },
);
