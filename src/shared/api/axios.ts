// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 📦 Request Interceptor
api.interceptors.request.use(
  config => {
    console.log('➡️ [API Request]', {
      method: config.method,
      url: (config.baseURL || '') + config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  error => {
    console.error('❌ [Request Error]', error);
    return Promise.reject(error);
  },
);

// 📩 Response Interceptor
api.interceptors.response.use(
  response => {
    console.log('✅ [API Response]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('❌ [Response Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  },
);
