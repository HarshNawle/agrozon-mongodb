// backend/src/routes/cart.js
// GET    /api/cart          — get user's cart (populated products)
// POST   /api/cart          — add or increment item
// PUT    /api/cart/:itemId  — update quantity
// DELETE /api/cart/:itemId  — remove one item
// DELETE /api/cart          — clear entire cart

const router  = require('express').Router()
const Cart    = require('../models/Cart')
const Product = require('../models/Product')
const { protect } = require('../middleware/auth')

// All cart routes require authentication
router.use(protect)

// ── GET /api/cart ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price imageUrl category unit stock farmerName')
    if (!cart) cart = { items: [] }
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/cart — add item (creates cart if needed) ────────
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.stock < 1) return res.status(400).json({ message: 'Product out of stock' })

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existing = cart.items.find(i => String(i.product) === String(productId))

    if (existing) {
      // Increment quantity, but don't exceed stock
      existing.quantity = Math.min(existing.quantity + quantity, product.stock)
    } else {
      cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock) })
    }

    await cart.save()
    const populated = await cart.populate('items.product', 'name price imageUrl category unit stock farmerName')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /api/cart/:itemId — update quantity ───────────────────
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    const item = cart.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Item not found in cart' })

    if (quantity < 1) {
      item.deleteOne()
    } else {
      item.quantity = quantity
    }

    await cart.save()
    const populated = await cart.populate('items.product', 'name price imageUrl category unit stock farmerName')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/cart/:itemId — remove single item ─────────────
router.delete('/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    cart.items = cart.items.filter(i => String(i._id) !== req.params.itemId)
    await cart.save()
    res.json({ message: 'Item removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/cart — clear entire cart ─────────────────────
router.delete('/', async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
    res.json({ message: 'Cart cleared' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
