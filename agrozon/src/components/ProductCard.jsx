// src/components/ProductCard.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER = 'https://placehold.co/400x300/e8f5e9/1a5c38?text=🌿'
const CAT_EMOJI   = { vegetables:'🥦', fruits:'🍎', grains:'🌾', dairy:'🥛', spices:'🌶️', other:'🍯' }

export default function ProductCard({ product }) {
  const { t }         = useTranslation()
  const { addToCart } = useCart()
  const { user }      = useAuth()
  const inStock = product.stock > 0

  async function handleAdd(e) {
    e.preventDefault()
    if (!user) { toast.error('Please login to add items to cart'); return }
    try {
      await addToCart(product._id)          // MongoDB uses _id
      toast.success(t('product.added_to_cart'), {
        icon: CAT_EMOJI[product.category] ?? '🛒',
        style: { fontFamily: 'Nunito, sans-serif' },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart')
    }
  }

  return (
    <Link to={`/product/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-200
                 overflow-hidden flex flex-col animate-fade-in">
      {/* Image */}
      <div className="relative h-48 bg-forest-50 overflow-hidden">
        <img src={product.imageUrl || PLACEHOLDER} alt={product.name}
          onError={e => { e.target.src = PLACEHOLDER }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" />
        <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs
                         font-body font-semibold text-forest-700 px-2 py-0.5 rounded-full">
          {CAT_EMOJI[product.category]} {product.category}
        </span>
        {product.isOrganic && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px]
                           font-body font-bold px-2 py-0.5 rounded-full">🌱 Organic</span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full font-body">
              {t('product.out_of_stock')}
            </span>
          </div>
        )}
      </div>
      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-1">
        <h3 className="font-display font-semibold text-gray-800 text-base leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs font-body text-gray-400">
          {t('product.by_farmer', { name: product.farmerName })}
        </p>
        <p className="text-xs font-body text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="font-display font-bold text-lg text-forest-700">₹{product.price}</span>
            <span className="text-xs font-body text-gray-400 ml-1">/{product.unit}</span>
            {inStock && (
              <p className="text-xs font-body text-gray-400">
                {t('product.stock_left', { count: product.stock })}
              </p>
            )}
          </div>
          <button onClick={handleAdd} disabled={!inStock}
            className={`px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-all
              ${inStock ? 'bg-forest-600 hover:bg-forest-700 text-white active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </Link>
  )
}
