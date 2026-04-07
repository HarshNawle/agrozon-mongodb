// backend/src/routes/products.js
// GET    /api/products           — list + search + filter (public)
// GET    /api/products/my        — farmer's own products (protected)
// GET    /api/products/:id       — single product (public)
// POST   /api/products           — create (farmer/admin)
// PUT    /api/products/:id       — update (owner farmer/admin)
// DELETE /api/products/:id       — delete (owner farmer/admin)

const router  = require('express').Router()
const Product = require('../models/Product')
const { protect, requireFarmer, requireAdmin } = require('../middleware/auth')

// ── Product image upload (multipart) for admin-created products ─────────
// This duplicates the existing disk storage used by `/api/upload/product-image`,
// but only for the admin create flow so the new UI can submit `multipart/form-data`
// directly to `POST /api/products`.
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
    cb(null, safeName)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const ext     = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) return cb(null, true)
  cb(new Error('Only JPG, PNG, WebP and GIF images are allowed'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
})

function maybeHandleImageUpload(req, res, next) {
  // Only parse multipart bodies; JSON requests are still handled by express.json().
  if (!req.is('multipart/form-data')) return next()
  return upload.single('image')(req, res, next)
}

// ── GET /api/products ─────────────────────────────────────────
// Query params: q, category, organic, featured, sort, page, limit
router.get('/', async (req, res) => {
  try {
    const {
      q, category, organic, featured,
      sort = '-createdAt',
      page  = 1,
      limit = 40,
    } = req.query

    const filter = {}

    // Full-text search on name + description
    if (q) filter.$text = { $search: q }

    // Category filter
    if (category && category !== 'all') filter.category = category

    // Boolean filters
    if (organic === 'true')   filter.isOrganic  = true
    if (featured === 'true')  filter.isFeatured = true

    const skip = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ])

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/products/my — farmer's own products ──────────────
router.get('/my', protect, requireFarmer, async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user._id })
      .sort('-createdAt')
      .lean()
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/products/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

async function createProductFromReq({ req, res }) {
  const {
    name,
    description,
    price,
    category,
    stock,
    imageUrl,
    farmLocation,
    subCategory,
    unit,
    isOrganic,
    isFeatured,
  } = req.body

  const hasFile = Boolean(req.file)
  const resolvedImageUrl = hasFile
    ? (() => {
      // Build the public URL: http://localhost:5000/uploads/products/xxx.jpg
      const protocol = req.protocol
      const host     = req.get('host')
      return `${protocol}://${host}/uploads/products/${req.file.filename}`
    })()
    : (imageUrl || '')

  // Basic validation: match the new "Add Product" form expectations.
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'name is required' })
  }
  if (price === undefined || price === null || price === '') {
    return res.status(400).json({ message: 'price is required' })
  }
  if (category === undefined || category === null || category === '') {
    return res.status(400).json({ message: 'category is required' })
  }
  if (stock === undefined || stock === null || stock === '') {
    return res.status(400).json({ message: 'stock is required' })
  }
  if (!resolvedImageUrl) {
    return res.status(400).json({ message: 'image is required' })
  }

  const parsedPrice = Number(price)
  const parsedStock = Number(stock)
  if (!Number.isFinite(parsedPrice)) {
    return res.status(400).json({ message: 'price must be a number' })
  }
  if (!Number.isFinite(parsedStock)) {
    return res.status(400).json({ message: 'stock must be a number' })
  }

  const product = await Product.create({
    farmerId:     req.user._id,
    farmerName:   req.user.name,
    farmLocation: farmLocation || req.user.location || '',

    name:         name.trim(),
    description:  description || '',
    price:        parsedPrice,
    category:     category || 'other',
    subCategory:  subCategory || '',
    stock:        parsedStock,
    unit:         unit || 'kg',
    imageUrl:     resolvedImageUrl,
    isOrganic:    Boolean(isOrganic),
    isFeatured:   Boolean(isFeatured),
  })

  return res.status(201).json(product)
}

// ── POST /api/products (Admin create) ──────────────────────────────
router.post('/', protect, requireAdmin, maybeHandleImageUpload, async (req, res) => {
  try {
    await createProductFromReq({ req, res })
  } catch (err) {
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500
    res.status(status).json({ message: err.message })
  }
})

// ── POST /api/products/farmer (Farmer create) ───────────────────────
// Kept for the existing Farmer portal. It expects `imageUrl` (uploaded
// via `/api/upload/product-image`) and does not require multipart upload.
router.post('/farmer', protect, requireFarmer, async (req, res) => {
  try {
    // For farmer JSON requests, multer hasn't run, so req.file is undefined.
    // This handler still supports `imageUrl` passed in the body.
    await createProductFromReq({ req, res })
  } catch (err) {
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500
    res.status(status).json({ message: err.message })
  }
})

// ── PUT /api/products/:id ─────────────────────────────────────
router.put('/:id', protect, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Farmers can only edit their own products; admins can edit any
    if (
      req.user.role !== 'admin' &&
      String(product.farmerId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorised to edit this product' })
    }

    const allowed = [
      'name','description','price','category','subCategory',
      'stock','unit','imageUrl','farmLocation','isOrganic','isFeatured',
    ]
    allowed.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field]
    })

    const updated = await product.save()
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/products/:id ──────────────────────────────────
router.delete('/:id', protect, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    if (
      req.user.role !== 'admin' &&
      String(product.farmerId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorised to delete this product' })
    }

    await product.deleteOne()
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin: GET all products ───────────────────────────────────
router.get('/admin/all', protect, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt').lean()
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
