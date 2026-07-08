import axios, { type AxiosInstance } from "axios";

import { API_BASE_URL, TOKEN_STORAGE_KEY } from "@/constants/app";

/**
 * Pre-configured Axios instance. A request interceptor attaches the bearer
 * token; a response interceptor clears the session on 401 so the route guards
 * redirect to login. Swapping mock mode for the real backend requires no
 * changes here.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Let the guard handle redirect; avoid a hard reload loop on /login.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);
