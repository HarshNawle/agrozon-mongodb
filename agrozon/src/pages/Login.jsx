// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome back! 🌿')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.login_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-harvest-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🌿</span>
            <span className="font-display font-bold text-3xl text-forest-800">Agrozon</span>
          </Link>
        </div>
        <div className="card shadow-lg">
          <h1 className="font-display font-bold text-2xl text-gray-800 mb-1">{t('auth.login_title')}</h1>
          <p className="font-body text-gray-500 text-sm mb-6">{t('auth.login_sub')}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : null}
              {t('auth.login_btn')}
            </button>
          </form>
          <p className="text-center text-sm font-body text-gray-500 mt-5">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-forest-600 font-semibold hover:underline">{t('nav.register')}</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 card shadow-sm text-xs font-body text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600 mb-1">🧪 Demo accounts (after seeding):</p>
          <p>🛠 Admin: <span className="font-mono">admin@agrozon.com</span> / admin123</p>
          <p>🌾 Farmer: <span className="font-mono">raju@farm.com</span> / farmer123</p>
          <p>🛒 Register a new buyer account above</p>
        </div>
      </div>
    </div>
  )
}
