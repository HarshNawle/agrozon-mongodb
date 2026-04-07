// backend/src/middleware/auth.js
// JWT verification and role-based access control middleware.

const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ── Verify JWT ────────────────────────────────────────────────
// Attaches req.user = { id, role } if token is valid.
async function protect(req, res, next) {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised — no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach minimal user info (id + role) to request
    req.user = await User.findById(decoded.id).select('_id name email role farmName location')
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ── Role guards ───────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

function requireFarmer(req, res, next) {
  if (req.user?.role !== 'farmer' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Farmer access required' })
  }
  next()
}

// ── Helper: sign a JWT ───────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

module.exports = { protect, requireAdmin, requireFarmer, signToken }
