import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8081/api/v1',
  ios: 'http://localhost:8081/api/v1',
  default: 'http://localhost:8081/api/v1',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let getToken: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (provider: () => Promise<string | null>) => {
  getToken = provider;
};

api.interceptors.request.use(async (config) => {
  if (getToken) {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — auth context will handle sign out
    }
    return Promise.reject(error);
  }
);

export default api;
