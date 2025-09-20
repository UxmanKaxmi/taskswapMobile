// src/shared/api/axios.ts
import { showToast } from '@shared/utils/toast';
import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSignOut } from './authBridge';
import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.1.15:3001' // 👈 your new LAN IP
    : 'http://localhost:3001'; //
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipToast?: boolean;
}
interface CustomAxiosError extends Omit<AxiosError, 'config'> {
  config: CustomAxiosRequestConfig & { headers?: Record<string, string> };
}

export const api = axios.create({
  baseURL: BASE_URL, // use your LAN IP on device
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Request Interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // If you attach token elsewhere (AuthProvider defaults), keep this commented out
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

// ✅ Response Interceptor — hard logout on invalid/expired token
api.interceptors.response.use(
  response => {
    console.log(`✅ [Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: CustomAxiosError) => {
    const status = error?.response?.status;
    const data: any = error?.response?.data;
    const code = data?.code as string | undefined;
    const errStr = (data?.error || data?.message || '').toString().toLowerCase();

    const shouldLogout =
      status === 401 &&
      (code === 'AUTH_INVALID_TOKEN' ||
        code === 'AUTH_TOKEN_EXPIRED' ||
        errStr.includes('invalid token') ||
        errStr.includes('token expired'));

    if (shouldLogout) {
      // don’t show duplicate error toast from the generic handler
      error.config = { ...(error.config || {}), skipToast: true };

      // friendly info toast
      showToast({
        type: 'info',
        title: 'Signed out',
        message: 'Session ended. Please sign in again.',
      });

      // trigger app-level sign out via the bridge
      const signOut = getSignOut?.();
      if (signOut) {
        try {
          await signOut();
        } catch (e) {
          // no-op; still reject the original error
        }
      }
      return Promise.reject(error);
    }

    // 🧯 Generic error path
    console.error('❌ [Response Error]', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    const message =
      data?.message || data?.error || error.message || 'Something went wrong. Please try again.';

    if (!error.config?.skipToast) {
      showToast({ type: 'error', title: 'Error', message });
    }
    return Promise.reject(error);
  },
);
