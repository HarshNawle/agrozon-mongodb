// backend/src/routes/auth.js
// POST /api/auth/register  — create account
// POST /api/auth/login     — login + receive JWT
// GET  /api/auth/me        — get current user profile

const router = require('express').Router()
const User   = require('../models/User')
const { protect, signToken } = require('../middleware/auth')

// Helper: build the response object (no password)
function userResponse(user, token) {
  return {
    token,
    user: {
      id:        user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      farmName:  user.farmName,
      location:  user.location,
      bio:       user.bio,
      avatarUrl: user.avatarUrl,
    },
  }
}

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, farmName, location, bio } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    // Check email uniqueness
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // Validate role (clients can only self-register as user or farmer)
    const allowedRoles = ['user', 'farmer']
    const assignedRole = allowedRoles.includes(role) ? role : 'user'

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      farmName: farmName || '',
      location: location || '',
      bio:      bio || '',
    })

    const token = signToken(user._id)
    res.status(201).json(userResponse(user, token))
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // select: false on password means we must explicitly request it
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const match = await user.matchPassword(password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json(userResponse(user, token))
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: 'Login failed' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  const u = req.user
  res.json({
    id:        u._id,
    name:      u.name,
    email:     u.email,
    role:      u.role,
    farmName:  u.farmName,
    location:  u.location,
    bio:       u.bio,
    avatarUrl: u.avatarUrl,
  })
})

// ── PUT /api/auth/me — update own profile ─────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const { name, farmName, location, bio } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, farmName, location, bio },
      { new: true, runValidators: true }
    )
    res.json({ id: user._id, name: user.name, email: user.email,
               role: user.role, farmName: user.farmName,
               location: user.location, bio: user.bio })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
