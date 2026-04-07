// src/api/axios.js
// Central Axios instance.
// Automatically attaches the JWT token from localStorage to every request.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrozon_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agrozon_token')
      localStorage.removeItem('agrozon_user')
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
