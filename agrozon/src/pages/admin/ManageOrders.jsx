// src/pages/admin/ManageOrders.jsx
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUSES  = ['all','pending','confirmed','shipped','delivered','cancelled']
const STATUS_STYLES = {
  pending:'bg-yellow-100 text-yellow-700 border-yellow-200', confirmed:'bg-blue-100 text-blue-700 border-blue-200',
  shipped:'bg-purple-100 text-purple-700 border-purple-200', delivered:'bg-green-100 text-green-700 border-green-200',
  cancelled:'bg-red-100 text-red-700 border-red-200',
}

export default function ManageOrders() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState({})
  const [updating, setUpdating] = useState({})

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.status = filter
      const { data } = await api.get('/orders/admin', { params })
      setOrders(data.orders ?? [])
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filter])

  async function handleStatus(orderId, status) {
    setUpdating(p => ({...p, [orderId]:true}))
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o._id === orderId ? {...o, status:data.status} : o))
      toast.success('Status updated!')
    } catch { toast.error('Update failed') }
    finally { setUpdating(p => ({...p, [orderId]:false})) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-800">Manage Orders</h1>
        <p className="font-body text-sm text-gray-400 mt-0.5">{orders.length} orders shown</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-body font-semibold whitespace-nowrap capitalize shrink-0 transition-all
              ${filter===s ? 'bg-forest-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16"><span className="text-5xl">📭</span>
          <p className="font-display font-semibold text-gray-500 mt-4">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-body text-xs text-gray-400">
                    Order <span className="font-mono text-gray-600">{order._id.slice(-8).toUpperCase()}</span>
                  </p>
                  <p className="font-body font-semibold text-gray-800">{order.user?.name ?? 'Unknown'}</p>
                  <p className="font-body text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
                  </p>
                  {order.address && (
                    <p className="font-body text-xs text-gray-400 flex gap-1 max-w-xs">
                      <span>📍</span><span className="line-clamp-1">{order.address}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display font-bold text-xl text-forest-700">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`badge border ${STATUS_STYLES[order.status]??''}`}>{order.status}</span>
                    <select value={order.status} onChange={e=>handleStatus(order._id,e.target.value)}
                      disabled={updating[order._id]}
                      className="text-xs font-body border border-gray-200 rounded-lg px-2 py-1 bg-white
                                 text-gray-700 focus:outline-none focus:ring-1 focus:ring-forest-400
                                 disabled:opacity-50 cursor-pointer">
                      {STATUSES.filter(s=>s!=='all').map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    {updating[order._id] && (
                      <span className="w-4 h-4 border-2 border-forest-500 border-t-transparent rounded-full animate-spin inline-block" />
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => setExpanded(p=>({...p,[order._id]:!p[order._id]}))}
                className="text-xs font-body text-forest-600 hover:text-forest-800 mt-3 flex items-center gap-1">
                {expanded[order._id]?'▲ Hide':'▼ View'} items ({order.items?.length??0})
              </button>

              {expanded[order._id] && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5 animate-slide-up">
                  {order.items?.map((item,i) => (
                    <div key={i} className="flex justify-between text-sm font-body text-gray-700">
                      <div className="flex items-center gap-2">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                        )}
                        <span>{item.productName}</span>
                      </div>
                      <span className="text-gray-400">×{item.quantity} · ₹{(item.unitPrice*item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
