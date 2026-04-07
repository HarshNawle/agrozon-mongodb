// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const STATUS_STYLES = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [stats,   setStats]   = useState({ products:0, orders:0, pending:0 })
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pRes, oRes] = await Promise.all([
          api.get('/products', { params: { limit:1 } }),
          api.get('/orders/admin', { params: { limit:50 } }),
        ])
        const allOrders   = oRes.data.orders ?? []
        const pendingCount = allOrders.filter(o => o.status === 'pending').length
        setStats({ products: pRes.data.total ?? 0, orders: oRes.data.total ?? 0, pending: pendingCount })
        setRecent(allOrders.slice(0, 5))
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const CARDS = [
    { label:'Total Products', value:stats.products, icon:'🌾', link:'/admin/products', color:'bg-forest-50 text-forest-700' },
    { label:'Total Orders',   value:stats.orders,   icon:'📦', link:'/admin/orders',  color:'bg-blue-50  text-blue-700'   },
    { label:'Pending Orders', value:stats.pending,  icon:'⏳', link:'/admin/orders',  color:'bg-yellow-50 text-yellow-700' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-800">Dashboard</h1>
        <p className="font-body text-gray-400 text-sm mt-1">Welcome back! Here's what's happening on Agrozon.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {CARDS.map(c => (
          <Link key={c.label} to={c.link} className="card hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${c.color}`}>{c.icon}</div>
            <div>
              <p className="font-body text-sm text-gray-400">{c.label}</p>
              <p className="font-display font-bold text-3xl text-gray-800">{c.value}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-body text-forest-600 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="font-body text-gray-400 text-sm text-center py-8">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left py-2 pr-4">Order ID</th>
                  <th className="text-left py-2 pr-4">Customer</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-right py-2 pr-4">Total</th>
                  <th className="text-right py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-gray-500 text-xs">{o._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 pr-4 text-gray-700">{o.user?.name ?? 'Unknown'}</td>
                    <td className="py-3 pr-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-forest-700">₹{Number(o.totalAmount).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <span className={`badge ${STATUS_STYLES[o.status] ?? 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
