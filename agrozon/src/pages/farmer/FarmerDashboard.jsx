// src/pages/farmer/FarmerDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const CAT_EMOJI = { vegetables:'🥦', fruits:'🍎', grains:'🌾', dairy:'🥛', spices:'🌶️', other:'🍯' }

export default function FarmerDashboard() {
  const { user }  = useAuth()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/products/my')
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const totalStock  = products.reduce((s, p) => s + p.stock, 0)
  const totalValue  = products.reduce((s, p) => s + p.price * p.stock, 0)
  const outOfStock  = products.filter(p => p.stock === 0).length
  const organic     = products.filter(p => p.isOrganic).length
  const catBreakdown = products.reduce((acc, p) => { acc[p.category] = (acc[p.category]||0)+1; return acc }, {})

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-harvest-600 to-harvest-400 rounded-2xl p-6 text-white">
        <p className="font-body text-harvest-100 text-sm">Welcome back,</p>
        <h1 className="font-display font-bold text-2xl mt-0.5">{user?.name} 🌾</h1>
        {user?.farmName  && <p className="font-body text-harvest-100 mt-1">{user.farmName}</p>}
        {user?.location  && <p className="font-body text-harvest-200 text-sm">📍 {user.location}</p>}
        <Link to="/farmer/products"
          className="inline-flex items-center gap-2 mt-4 bg-white text-harvest-700 px-4 py-2
                     rounded-xl text-sm font-body font-semibold hover:bg-harvest-50 transition-colors">
          + Add New Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Products Listed',  value: products.length,           icon: '🌿', color: 'bg-forest-50  text-forest-700' },
          { label: 'Total Stock Units', value: totalStock,               icon: '📦', color: 'bg-blue-50   text-blue-700'   },
          { label: 'Inventory Value',  value: `₹${totalValue.toLocaleString('en-IN')}`, icon: '💰', color: 'bg-harvest-50 text-harvest-700' },
          { label: 'Organic Items',    value: organic,                   icon: '🌱', color: 'bg-green-50  text-green-700'  },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-body text-gray-400">{s.label}</p>
              <p className="font-display font-bold text-lg text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="card">
          <h2 className="font-display font-bold text-base text-gray-800 mb-4">Products by Category</h2>
          {Object.keys(catBreakdown).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🌱</p>
              <p className="font-body text-sm text-gray-400">No products yet.</p>
              <Link to="/farmer/products" className="btn-secondary text-sm mt-3 inline-block">Add Your First Product</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(catBreakdown).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg">{CAT_EMOJI[cat] ?? '📦'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-body mb-1">
                      <span className="capitalize text-gray-700">{cat}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-harvest-400 rounded-full"
                        style={{ width: `${(count / products.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent listings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-gray-800">Recent Listings</h2>
            <Link to="/farmer/products" className="text-xs font-body text-harvest-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-harvest-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-sm font-body text-gray-400 py-8">No products listed yet.</p>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.imageUrl || 'https://placehold.co/40x40/e8f5e9/1a5c38?text=🌿'} alt={p.name}
                    onError={e => { e.target.src = 'https://placehold.co/40x40/e8f5e9/1a5c38?text=🌿' }}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs font-body text-gray-400">Stock: {p.stock} · ₹{p.price}/{p.unit}</p>
                  </div>
                  {p.isOrganic && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-body shrink-0">Organic</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Out-of-stock alert */}
      {outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-body font-semibold text-red-700 text-sm">
              {outOfStock} product{outOfStock > 1 ? 's are' : ' is'} out of stock
            </p>
            <p className="font-body text-xs text-red-500 mt-0.5">Update stock levels to continue selling.</p>
            <Link to="/farmer/products" className="text-xs font-body font-semibold text-red-600 hover:underline mt-1 inline-block">
              Manage Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
