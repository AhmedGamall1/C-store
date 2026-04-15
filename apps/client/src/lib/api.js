import axios from 'axios'

// Single axios instance used by every API hook.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response.data, // unwrap — callers get the payload directly
  (error) => {
    // Normalize: always produce an Error with a useful .message and .status
    const status = error.response?.status ?? 0
    const serverMessage = error.response?.data?.message
    const message =
      serverMessage ||
      (status === 0
        ? 'Network error. Check your connection.'
        : error.message) ||
      'Something went wrong.'

    const normalized = new Error(message)
    normalized.status = status
    normalized.data = error.response?.data
    return Promise.reject(normalized)
  }
)
