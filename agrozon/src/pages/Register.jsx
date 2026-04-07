// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { t }    = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [role,     setRole]     = useState('user')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [farmName, setFarmName] = useState('')
  const [location, setLocation] = useState('')
  const [bio,      setBio]      = useState('')
  const [loading,  setLoading]  = useState(false)

  const isFarmer = role === 'farmer'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ name, email, password, role, farmName, location, bio })
      toast.success(isFarmer ? '🌾 Farmer account created!' : '🌿 Welcome to Agrozon!')
      navigate(isFarmer ? '/farmer' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.register_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-harvest-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🌿</span>
            <span className="font-display font-bold text-3xl text-forest-800">Agrozon</span>
          </Link>
        </div>
        <div className="card shadow-lg">
          {/* Role toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button type="button" onClick={() => setRole('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all flex items-center justify-center gap-1.5
                ${role === 'user' ? 'bg-white text-forest-700 shadow-sm' : 'text-gray-500'}`}>
              🛒 {t('auth.as_buyer')}
            </button>
            <button type="button" onClick={() => setRole('farmer')}
              className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all flex items-center justify-center gap-1.5
                ${role === 'farmer' ? 'bg-forest-700 text-white shadow-sm' : 'text-gray-500'}`}>
              🌾 {t('auth.as_farmer')}
            </button>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-800 mb-1">
            {isFarmer ? t('auth.farmer_register_title') : t('auth.register_title')}
          </h1>
          <p className="font-body text-gray-500 text-sm mb-6">
            {isFarmer ? t('auth.farmer_register_sub') : t('auth.register_sub')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.name')} *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="input-field" placeholder={isFarmer ? 'Raju Patil' : 'Rahul Sharma'} required />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.email')} *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.password')} *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="Min. 6 characters" required minLength={6} />
            </div>

            {isFarmer && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-px bg-forest-100" />
                  <span className="text-xs font-body text-forest-600 font-semibold uppercase tracking-wider px-2">Farm Details</span>
                  <div className="flex-1 h-px bg-forest-100" />
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.farm_name')} *</label>
                  <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)}
                    className="input-field" placeholder="Patil's Organic Farm" required />
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.farm_location')} *</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className="input-field" placeholder="Nashik, Maharashtra" required />
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">{t('auth.bio')}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    className="input-field resize-none" placeholder={t('auth.bio_placeholder')} />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className={`w-full flex items-center justify-center gap-2 mt-2 ${isFarmer ? 'btn-secondary' : 'btn-primary'}`}>
              {loading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : (isFarmer ? '🌾' : '✨')}
              {t('auth.register_btn')}
            </button>
          </form>

          <p className="text-center text-sm font-body text-gray-500 mt-5">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:underline">{t('nav.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
