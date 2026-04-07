// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar({ onSearch }) {
  const { t } = useTranslation()
  const { user, isAdmin, isFarmer, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [query,    setQuery]    = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (onSearch) onSearch(query.trim())
    else navigate(`/?q=${encodeURIComponent(query.trim())}`)
  }

  function handleLogout() { logout(); navigate('/') }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-xl text-harvest-300 tracking-tight">Agrozon</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 flex mx-3 max-w-2xl">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              className="flex-1 px-4 py-2 text-sm font-body text-gray-800 bg-white rounded-l-full outline-none
                         border-2 border-transparent focus:border-harvest-400" />
            <button type="submit"
              className="px-4 bg-harvest-400 hover:bg-harvest-500 rounded-r-full transition-colors text-forest-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-1 ml-auto shrink-0">
            <LanguageSwitcher />
            <Link to="/cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-body">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <span className="hidden sm:block">{t('nav.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-harvest-400 text-forest-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative ml-1">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-body">
                  <span className="w-7 h-7 rounded-full bg-harvest-300 text-forest-900 flex items-center justify-center font-bold text-xs">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <svg className={`w-3 h-3 transition-transform ${menuOpen?'rotate-180':''}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-forest-100
                                  z-50 overflow-hidden animate-slide-up" onClick={()=>setMenuOpen(false)}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-body">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate font-body">{user.name}</p>
                      <p className="text-xs text-gray-400 font-body capitalize">{user.role}</p>
                    </div>
                    {isFarmer && (
                      <Link to="/farmer" className="block px-4 py-2.5 text-sm font-body text-harvest-700 hover:bg-harvest-50 transition-colors">
                        🌾 {t('nav.farmer_dashboard')}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2.5 text-sm font-body text-forest-700 hover:bg-forest-50 transition-colors">
                        🛠 {t('nav.admin')}
                      </Link>
                    )}
                    <Link to="/orders" className="block px-4 py-2.5 text-sm font-body text-gray-700 hover:bg-forest-50 transition-colors">
                      📦 {t('nav.orders')}
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                      🚪 {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-1">
                <Link to="/login" className="px-3 py-1.5 text-sm font-body hover:bg-white/10 rounded-lg transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-3 py-1.5 text-sm font-body bg-harvest-400 hover:bg-harvest-500 text-forest-900 rounded-lg transition-colors font-semibold">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Category stripe */}
      <div className="bg-forest-700 text-white/90 text-xs font-body overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 py-1.5 whitespace-nowrap">
          {['vegetables','fruits','grains','dairy','spices','other'].map(cat => (
            <Link key={cat} to={`/?cat=${cat}`} className="hover:text-harvest-300 transition-colors capitalize">{cat}</Link>
          ))}
        </div>
      </div>
    </header>
  )
}
