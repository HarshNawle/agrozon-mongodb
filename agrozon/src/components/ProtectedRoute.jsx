// src/components/ProtectedRoute.jsx
// Guards routes based on auth and role.
// Props:
//   adminOnly  — only 'admin' role passes
//   farmerOnly — only 'farmer' role passes

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, farmerOnly = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-forest-700">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (farmerOnly && profile?.role !== 'farmer') {
    return <Navigate to="/" replace />
  }

  return children
}
