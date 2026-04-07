// backend/src/routes/upload.js
// POST /api/upload/product-image — upload an image file
// Returns { url } pointing to the publicly-served file.

const router = require('express').Router()
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const { protect, requireFarmer } = require('../middleware/auth')

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ── Multer config: disk storage ──────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase()
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
    cb(null, safeName)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const ext     = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WebP and GIF images are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB max
})

// ── POST /api/upload/product-image ───────────────────────────
router.post(
  '/product-image',
  protect,
  requireFarmer,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' })
    }

    // Build the public URL: http://localhost:5000/uploads/products/xxx.jpg
    const protocol = req.protocol
    const host     = req.get('host')
    const url      = `${protocol}://${host}/uploads/products/${req.file.filename}`

    res.json({ url, filename: req.file.filename })
  }
)

// ── Multer error handler ──────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image must be under 5 MB' })
    }
  }
  res.status(400).json({ message: err.message })
})

module.exports = router
