import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

let tokenProvider: (() => Promise<string | null>) | null = null

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (tokenProvider) {
    const token = await tokenProvider()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api
