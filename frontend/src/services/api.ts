import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hadAccessToken = Boolean(error.config?.headers.get('Authorization'));
    if (error.response?.status === 401 && hadAccessToken && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
