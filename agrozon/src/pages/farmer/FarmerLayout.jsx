// src/pages/farmer/FarmerLayout.jsx
// Sidebar layout for the farmer portal.

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function FarmerLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-60 bg-harvest-800 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-harvest-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌾</span>
            <span className="font-display font-bold text-lg text-harvest-100">Farmer Portal</span>
          </div>
          <p className="text-xs font-body text-harvest-400 uppercase tracking-wide">
            Powered by Agrozon
          </p>
        </div>

        {/* Farmer profile chip */}
        <div className="px-5 py-4 border-b border-harvest-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-400 text-white flex
                            items-center justify-center font-bold text-sm">
              {profile?.name?.[0]?.toUpperCase() ?? 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-body font-semibold truncate">{profile?.name}</p>
              <p className="text-xs font-body text-harvest-400 truncate">
                {profile?.farm_name || 'My Farm'}
              </p>
              {profile?.location && (
                <p className="text-xs font-body text-harvest-400 truncate">📍 {profile.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { to: '/farmer',           label: 'Dashboard',    icon: '📊', end: true },
            { to: '/farmer/products',  label: 'My Products',  icon: '🌿' },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body
                 font-medium transition-all
                 ${isActive ? 'bg-harvest-600 text-white' : 'text-harvest-100 hover:bg-harvest-700 hover:text-white'}`
              }>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-harvest-700 space-y-1">
          <NavLink to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body
                       text-harvest-200 hover:bg-harvest-700 hover:text-white transition-all">
            🏬 View Marketplace
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                       font-body text-red-300 hover:bg-red-900/30 transition-all text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-8 py-4">
          <p className="text-xs font-body text-gray-400 uppercase tracking-wide">
            Agrozon · Farmer Portal
          </p>
        </div>
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
