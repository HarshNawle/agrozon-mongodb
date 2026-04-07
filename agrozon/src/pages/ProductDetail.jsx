// src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast  from 'react-hot-toast'

const PLACEHOLDER = 'https://placehold.co/600x400/e8f5e9/1a5c38?text=🌿'

export default function ProductDetail() {
  const { id }  = useParams()
  const { t }   = useTranslation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user }      = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [adding,  setAdding]  = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAdd() {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product._id, qty)
      toast.success(t('product.added_to_cart'), { icon: '🛒' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart')
    } finally { setAdding(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">😕</span>
        <p className="font-display text-xl font-bold text-gray-600">Product not found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )

  const inStock = product.stock > 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm font-body text-gray-400 mb-6 flex gap-2">
          <Link to="/" className="hover:text-forest-600">Home</Link>
          <span>/</span>
          <Link to={`/?cat=${product.category}`} className="hover:text-forest-600 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 animate-fade-in">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-forest-50">
            <img src={product.imageUrl || PLACEHOLDER} alt={product.name}
              onError={e => { e.target.src = PLACEHOLDER }}
              className="w-full h-80 object-cover" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-body font-semibold text-forest-600 uppercase tracking-wide
                                 bg-forest-50 px-2.5 py-1 rounded-full">{product.category}</span>
                {product.isOrganic && (
                  <span className="text-xs bg-green-100 text-green-700 font-body font-bold px-2.5 py-1 rounded-full">
                    🌱 Organic
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-3xl text-gray-800 mt-3 leading-tight">{product.name}</h1>
              <p className="font-body text-gray-400 text-sm mt-1">
                {t('product.by_farmer', { name: product.farmerName })}
                {product.farmLocation && ` · 📍 ${product.farmLocation}`}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-4xl text-forest-700">₹{product.price}</span>
              <span className="font-body text-sm text-gray-400">per {product.unit}</span>
            </div>

            <div>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-body text-green-700
                                 bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
                  {t('product.in_stock')} · {t('product.stock_left', { count: product.stock })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-body text-red-700
                                 bg-red-50 px-3 py-1 rounded-full">{t('product.out_of_stock')}</span>
              )}
            </div>

            <div>
              <h3 className="font-display font-semibold text-gray-700 mb-1">{t('product.description')}</h3>
              <p className="font-body text-gray-600 text-sm leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>

            {inStock && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100">−</button>
                  <span className="px-4 py-2 font-body font-semibold text-gray-800 min-w-[2.5rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100">+</button>
                </div>
                <button onClick={handleAdd} disabled={adding}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {adding
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : '🛒'}
                  {t('product.add_to_cart')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
