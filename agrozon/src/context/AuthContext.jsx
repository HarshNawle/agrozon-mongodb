// src/context/AuthContext.jsx
// JWT-based auth — token stored in localStorage.
// Exposes: user, loading, isAdmin, isFarmer, login, register, logout, updateProfile

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('agrozon_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // On mount — verify stored token is still valid
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('agrozon_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
      localStorage.setItem('agrozon_user', JSON.stringify(data))
    } catch {
      localStorage.removeItem('agrozon_token')
      localStorage.removeItem('agrozon_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { verifyToken() }, [verifyToken])

  // ── Register ─────────────────────────────────────────────────
  async function register({ name, email, password, role, farmName, location, bio }) {
    const { data } = await api.post('/auth/register', {
      name, email, password, role, farmName, location, bio,
    })
    localStorage.setItem('agrozon_token', data.token)
    localStorage.setItem('agrozon_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // ── Login ─────────────────────────────────────────────────────
  async function login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('agrozon_token', data.token)
    localStorage.setItem('agrozon_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // ── Logout ────────────────────────────────────────────────────
  function logout() {
    localStorage.removeItem('agrozon_token')
    localStorage.removeItem('agrozon_user')
    setUser(null)
  }

  // ── Update own profile ────────────────────────────────────────
  async function updateProfile(fields) {
    const { data } = await api.put('/auth/me', fields)
    setUser(data)
    localStorage.setItem('agrozon_user', JSON.stringify(data))
    return data
  }

  const isAdmin  = user?.role === 'admin'
  const isFarmer = user?.role === 'farmer'

  return (
    <AuthContext.Provider value={{
      user,
      // Backwards-compatible aliases used by existing route guards/layouts.
      profile: user,
      signOut: logout,
      loading,
      isAdmin,
      isFarmer,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
