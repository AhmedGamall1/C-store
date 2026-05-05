import axios from 'axios'
import { toApiError } from './errors/parse'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toApiError(error))
)
