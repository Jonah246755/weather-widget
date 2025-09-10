import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Network error'
    return Promise.reject(new Error(msg))
  }
)
