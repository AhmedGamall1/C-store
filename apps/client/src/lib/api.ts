import axios, { type AxiosRequestConfig } from 'axios'
import { toApiError } from './errors/parse'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
})

instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toApiError(error))
)

// The response interceptor unwraps `response.data`, so every call resolves to
// the API body directly (not an AxiosResponse). This typed facade reflects that.
export interface ApiClient {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export const api = instance as unknown as ApiClient
