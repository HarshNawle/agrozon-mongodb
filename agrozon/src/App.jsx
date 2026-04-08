// src/App.jsx
// All client-side routes. Farmer portal added alongside admin.

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Public
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import CropScanner from './pages/CropScanner'

// Auth-required
import Cart   from './pages/Cart'
import Orders from './pages/Orders'

// Farmer portal
import FarmerLayout    from './pages/farmer/FarmerLayout'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import FarmerProducts  from './pages/farmer/FarmerProducts'

// Admin portal
import AdminLayout    from './pages/admin/AdminLayout'
import Dashboard      from './pages/admin/Dashboard'
import ManageProducts from './pages/admin/ManageProducts'
import AddProduct    from './pages/admin/AddProduct'
import ManageOrders   from './pages/admin/ManageOrders'

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────── */}
      <Route path="/"            element={<Home />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/register"    element={<Register />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* ── Authenticated users ─────────────────────────────── */}
      <Route path="/cart"   element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

      <Route path="/crop-scanner" element={<ProtectedRoute><CropScanner /></ProtectedRoute>} />

      {/* ── Farmer portal (role = 'farmer') ─────────────────── */}
      <Route path="/farmer" element={
        <ProtectedRoute farmerOnly><FarmerLayout /></ProtectedRoute>
      }>
        <Route index           element={<FarmerDashboard />} />
        <Route path="products" element={<FarmerProducts />} />
      </Route>

      {/* ── Admin portal (role = 'admin') ───────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
      }>
        <Route index           element={<Dashboard />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="orders"   element={<ManageOrders />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <span className="text-6xl">🌾</span>
          <h1 className="font-display text-2xl font-bold text-gray-700">Page not found</h1>
          <a href="/" className="btn-primary">Go Home</a>
        </div>
      } />
    </Routes>
  )
}
