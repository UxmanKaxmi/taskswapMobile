// src/shared/api/axios.ts
import { showToast } from '@shared/utils/toast';
import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshBackendSession, triggerLogout } from './authBridge';
import { Platform, NativeModules } from 'react-native';
import Config from 'react-native-config';
import { buildRoute } from './apiRoutes';

const PROD_BASE_URL = 'https://taskswapbackend.onrender.com';

const getPackagerHost = () => {
  if (!__DEV__) return null;
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/https?:\/\/([^/:]+)(:\d+)?\//);
  const host = match?.[1] || null;

  // Simulator often resolves to localhost; let env config drive that case.
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;

  return host;
};

const DEV_BASE_URL = (() => {
  const host = getPackagerHost();
  return host ? `http://${host}:3001` : null;
})();

const CONFIG_BASE_URL =
  Platform.OS === 'android'
    ? Config.BASE_URL_ANDROID || Config.BASE_URL
    : Config.BASE_URL_IOS || Config.BASE_URL;

const getDevFallbackBaseUrl = () => {
  if (!__DEV__) return null;

  return Platform.OS === 'android'
    ? ['http://', '192.168.1.5', ':3001'].join('')
    : ['http://', 'localhost', ':3001'].join('');
};

const BASE_URL = CONFIG_BASE_URL || DEV_BASE_URL || getDevFallbackBaseUrl() || PROD_BASE_URL;

console.log('API base URL:', BASE_URL);

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipToast?: boolean;
  skipAuthLogout?: boolean;
  skipAuthRefresh?: boolean;
  _authRetry?: boolean;
}
interface CustomAxiosError extends Omit<AxiosError, 'config'> {
  config: CustomAxiosRequestConfig & { headers?: Record<string, string> };
}

const GOOGLE_SYNC_ROUTES = new Set([buildRoute.syncUserToDb(), '/users']);

const isGoogleSyncRequest = (config?: AxiosRequestConfig | null) =>
  config?.method?.toLowerCase() === 'post' &&
  typeof config.url === 'string' &&
  GOOGLE_SYNC_ROUTES.has(config.url);

const getAuthorizationHeader = (config: InternalAxiosRequestConfig) => {
  const headers: any = config.headers;

  if (typeof headers?.get === 'function') {
    return headers.get('Authorization') || headers.get('authorization');
  }

  return headers?.Authorization || headers?.authorization;
};

const setAuthorizationHeader = (config: CustomAxiosRequestConfig, token: string) => {
  const headers: any = config.headers || {};

  if (typeof headers?.set === 'function') {
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
    return;
  }

  config.headers = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const getJwtAlg = (authorization?: string | null) => {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const header = token?.split('.')[0];

  if (!header) return null;

  try {
    const normalized = header.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded)?.alg ?? null;
  } catch {
    return null;
  }
};

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

    const authorization = getAuthorizationHeader(config);

    if (isGoogleSyncRequest(config) && getJwtAlg(authorization) === 'HS256') {
      return Promise.reject(
        new Error('Google sync expects a Google ID token, but received the backend app JWT.'),
      );
    }

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

      if (
        !error.config.skipAuthRefresh &&
        !error.config._authRetry &&
        !isGoogleSyncRequest(error.config)
      ) {
        try {
          const refreshedToken = await refreshBackendSession();

          if (refreshedToken) {
            error.config._authRetry = true;
            setAuthorizationHeader(error.config, refreshedToken);
            return api(error.config);
          }
        } catch {
          // Fall through to logout when Google refresh is unavailable or rejected.
        }
      }

      // friendly info toast
      showToast({
        type: 'info',
        title: 'Signed out',
        message: 'Session ended. Please sign in again.',
      });

      // trigger app-level sign out via the bridge
      try {
        await triggerLogout();
      } catch {
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
