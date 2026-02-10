// src/shared/api/axios.ts
import { showToast } from '@shared/utils/toast';
import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { triggerLogout } from './authBridge';
import { Platform, NativeModules } from 'react-native';
import Config from 'react-native-config';

const FALLBACK_BASE_URL_IOS = 'http://localhost:3001';
const FALLBACK_BASE_URL_ANDROID = 'http://192.168.1.5:3001';

const getPackagerHost = () => {
  if (!__DEV__) return null;
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/https?:\/\/([^/:]+)(:\d+)?\//);
  return '192.168.1.13';
};

const DEV_BASE_URL = (() => {
  const host = getPackagerHost();
  return host ? `http://${host}:3001` : null;
})();

const BASE_URL =
  (__DEV__ && DEV_BASE_URL) ||
  (Platform.OS === 'android'
    ? Config.BASE_URL_ANDROID || Config.BASE_URL || FALLBACK_BASE_URL_ANDROID
    : Config.BASE_URL_IOS || Config.BASE_URL || FALLBACK_BASE_URL_IOS);

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipToast?: boolean;
  skipAuthLogout?: boolean;
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
      !error.config?.skipAuthLogout &&
      (status === 401 ||
        status === 403 ||
        code === 'AUTH_INVALID_TOKEN' ||
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
      try {
        await triggerLogout();
      } catch (e) {
        // no-op; still reject the original error
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
