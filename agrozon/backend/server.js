// backend/server.js
// Main Express server — registers all routes and starts listening.

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const connectDB = require('./src/config/db')

// ── Route imports ────────────────────────────────────────────
const authRoutes    = require('./src/routes/auth')
const productRoutes = require('./src/routes/products')
const cartRoutes    = require('./src/routes/cart')
const orderRoutes   = require('./src/routes/orders')
const uploadRoutes  = require('./src/routes/upload')
const cropScanRoutes = require('./src/routes/cropScan')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect to MongoDB ───────────────────────────────────────
connectDB()

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images as static files
// e.g. GET /uploads/products/1234.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart',     cartRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/upload',   uploadRoutes)
app.use('/api/crop-scan', cropScanRoutes)

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '🌿 Agrozon API is running' })
})

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`🌿 Agrozon backend running on http://localhost:${PORT}`)
})
