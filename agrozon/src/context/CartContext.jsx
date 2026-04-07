// src/context/CartContext.jsx
// Cart state synced with MongoDB backend via REST API.

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items,   setItems]   = useState([])   // cart.items from backend
  const [loading, setLoading] = useState(false)

  // ── Fetch cart ────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setItems(data.items ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  // ── Add to cart ───────────────────────────────────────────────
  async function addToCart(productId, quantity = 1) {
    if (!user) return
    const { data } = await api.post('/cart', { productId, quantity })
    setItems(data.items ?? [])
  }

  // ── Update item quantity ──────────────────────────────────────
  async function updateQuantity(itemId, quantity) {
    const { data } = await api.put(`/cart/${itemId}`, { quantity })
    setItems(data.items ?? [])
  }

  // ── Remove single item ────────────────────────────────────────
  async function removeFromCart(itemId) {
    await api.delete(`/cart/${itemId}`)
    setItems(prev => prev.filter(i => i._id !== itemId))
  }

  // ── Clear entire cart ─────────────────────────────────────────
  async function clearCart() {
    await api.delete('/cart')
    setItems([])
  }

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, loading, cartCount, cartTotal,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside <CartProvider>')
  return ctx
}
