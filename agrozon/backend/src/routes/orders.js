// backend/src/routes/orders.js
// POST /api/orders               — place order from cart
// GET  /api/orders               — user's orders
// GET  /api/orders/admin         — all orders (admin only)
// PUT  /api/orders/:id/status    — update status (admin only)

const router  = require('express').Router()
const Order   = require('../models/Order')
const Cart    = require('../models/Cart')
const Product = require('../models/Product')
const { protect, requireAdmin } = require('../middleware/auth')

router.use(protect)

// ── POST /api/orders — place order ───────────────────────────
router.post('/', async (req, res) => {
  try {
    const { address } = req.body
    if (!address?.trim()) {
      return res.status(400).json({ message: 'Delivery address is required' })
    }

    // Load user's cart with populated products
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    // Build order items (snapshot prices + names)
    let totalAmount = 0
    const orderItems = []

    for (const item of cart.items) {
      const p = item.product
      if (!p) continue

      if (p.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${p.name}. Only ${p.stock} left.`
        })
      }

      const lineTotal = p.price * item.quantity
      totalAmount += lineTotal

      orderItems.push({
        product:     p._id,
        productName: p.name,
        unitPrice:   p.price,
        quantity:    item.quantity,
        imageUrl:    p.imageUrl || '',
      })

      // Decrement stock
      await Product.findByIdAndUpdate(p._id, { $inc: { stock: -item.quantity } })
    }

    // Create the order
    const order = await Order.create({
      user:        req.user._id,
      items:       orderItems,
      totalAmount,
      address:     address.trim(),
      status:      'pending',
    })

    // Clear the cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })

    res.status(201).json(order)
  } catch (err) {
    console.error('Order error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/orders — user's own orders ──────────────────────
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/orders/admin — all orders (admin) ────────────────
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    const total = await Order.countDocuments(filter)
    res.json({ orders, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /api/orders/:id/status — update status (admin) ───────
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')

    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
