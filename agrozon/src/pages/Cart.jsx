// src/pages/Cart.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast  from 'react-hot-toast'

const PLACEHOLDER = 'https://placehold.co/80x80/e8f5e9/1a5c38?text=🌿'

export default function Cart() {
  const { t } = useTranslation()
  const { items, cartTotal, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate  = useNavigate()
  const [address,  setAddress]  = useState('')
  const [placing,  setPlacing]  = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!address.trim()) return
    setPlacing(true)
    try {
      await api.post('/orders', { address })
      await clearCart()
      toast.success(t('cart.order_success'))
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || t('cart.order_error'))
    } finally { setPlacing(false) }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">🛒 {t('cart.title')}</h1>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-7xl">🛒</span>
            <p className="font-display text-xl font-semibold text-gray-500">{t('cart.empty')}</p>
            <Link to="/" className="btn-primary">{t('cart.continue_shopping')}</Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const p = item.product
                return (
                  <div key={item._id} className="card flex gap-4 items-start">
                    <img src={p?.imageUrl || PLACEHOLDER} alt={p?.name}
                      onError={e => { e.target.src = PLACEHOLDER }}
                      className="w-20 h-20 object-cover rounded-xl shrink-0 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-gray-800 text-sm leading-tight truncate">{p?.name}</h3>
                      <p className="text-xs font-body text-gray-400 mt-0.5 capitalize">{p?.category}</p>
                      <p className="font-display font-bold text-forest-700 mt-1">₹{p?.price} <span className="text-xs text-gray-400 font-body">/{p?.unit}</span></p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-body text-gray-500">{t('cart.quantity')}:</span>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 font-bold">−</button>
                          <span className="px-3 py-0.5 font-body font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 font-bold">+</button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-gray-800 text-sm">
                        ₹{(p?.price * item.quantity).toFixed(2)}
                      </p>
                      <button onClick={() => removeFromCart(item._id)}
                        className="text-xs text-red-400 hover:text-red-600 font-body mt-2">
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="card">
                <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm font-body">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[150px]">{item.product?.name} ×{item.quantity}</span>
                      <span>₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800 text-base">
                    <span>{t('cart.total')}</span>
                    <span className="text-forest-700">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {!showForm ? (
                  <button onClick={() => setShowForm(true)} className="btn-primary w-full mt-4">
                    {t('cart.checkout')}
                  </button>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="mt-4 space-y-3">
                    <label className="block text-sm font-body font-semibold text-gray-700">
                      {t('cart.delivery_address')}
                    </label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)}
                      rows={3} placeholder={t('cart.address_placeholder')}
                      className="input-field resize-none" required />
                    <button type="submit" disabled={placing}
                      className="btn-secondary w-full flex items-center justify-center gap-2">
                      {placing
                        ? <span className="w-4 h-4 border-2 border-forest-800 border-t-transparent rounded-full animate-spin" />
                        : '📦'}
                      {t('cart.place_order')}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-ghost w-full text-sm">
                      {t('admin.cancel')}
                    </button>
                  </form>
                )}
              </div>
              <Link to="/" className="block text-center text-sm font-body text-forest-600 hover:underline">
                ← {t('cart.continue_shopping')}
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
