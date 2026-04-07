// src/pages/admin/AdminLayout.jsx
// Shared layout for all admin pages — sidebar navigation + outlet.

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin',          label: 'admin.dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'admin.products',  icon: '🌾' },
  { to: '/admin/add-product', label: 'Add product',  icon: '➕' },
  { to: '/admin/orders',   label: 'admin.orders',    icon: '📦' },
]

export default function AdminLayout() {
  const { t } = useTranslation()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-60 bg-forest-900 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-forest-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-lg text-harvest-300">Agrozon</span>
          </div>
          <p className="text-xs font-body text-forest-400 uppercase tracking-wide">
            Admin Panel
          </p>
        </div>

        {/* Admin profile chip */}
        <div className="px-5 py-4 border-b border-forest-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-harvest-400 text-forest-900 flex
                            items-center justify-center font-bold text-sm">
              {profile?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="text-sm font-body font-semibold leading-none">{profile?.name}</p>
              <p className="text-xs font-body text-forest-400 mt-0.5">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body
                 font-medium transition-all
                 ${isActive
                   ? 'bg-forest-600 text-white'
                   : 'text-forest-200 hover:bg-forest-700 hover:text-white'}`
              }
            >
              <span>{item.icon}</span>
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-forest-700 space-y-1">
          <NavLink to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body
                       text-forest-200 hover:bg-forest-700 hover:text-white transition-all">
            🏬 View Store
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                       font-body text-red-300 hover:bg-red-900/30 transition-all text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4">
          <p className="text-xs font-body text-gray-400 uppercase tracking-wide">
            Agrozon Admin
          </p>
        </div>

        <div className="px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
