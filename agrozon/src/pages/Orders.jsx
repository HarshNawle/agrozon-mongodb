// src/pages/Orders.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100  text-blue-700  border-blue-200',
  shipped:   'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100   text-red-700   border-red-200',
}
const STATUS_EMOJI = { pending:'⏳', confirmed:'✅', shipped:'🚚', delivered:'📦', cancelled:'❌' }

export default function Orders() {
  const { t } = useTranslation()
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState({})

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const fmt = iso => new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">📦 {t('orders.title')}</h1>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-7xl">📭</span>
            <p className="font-display text-xl font-semibold text-gray-500">{t('orders.empty')}</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {orders.map(order => (
              <div key={order._id} className="card border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-body text-gray-400">
                      {t('orders.order_id')}
                      <span className="font-mono text-gray-600 ml-1">{order._id.slice(-8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs font-body text-gray-400 mt-0.5">{t('orders.date')}: {fmt(order.createdAt)}</p>
                    {order.address && (
                      <p className="text-xs font-body text-gray-400 flex gap-1 mt-1 max-w-xs">
                        <span>📍</span><span className="line-clamp-1">{order.address}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge border ${STATUS_STYLES[order.status] ?? ''}`}>
                      {STATUS_EMOJI[order.status]} {t(`orders.${order.status}`)}
                    </span>
                    <span className="font-display font-bold text-forest-700">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(p => ({ ...p, [order._id]: !p[order._id] }))}
                  className="text-xs font-body text-forest-600 hover:text-forest-800 mt-3 flex items-center gap-1">
                  {expanded[order._id] ? '▲ Hide' : '▼ Show'} {t('orders.items')} ({order.items?.length ?? 0})
                </button>

                {expanded[order._id] && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5 animate-slide-up">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm font-body text-gray-700">
                        <div className="flex items-center gap-2">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.productName}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                          )}
                          <span>{item.productName}</span>
                        </div>
                        <span className="text-gray-400">×{item.quantity} · ₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
