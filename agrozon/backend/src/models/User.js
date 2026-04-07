// backend/src/models/User.js
// User schema — supports roles: user | farmer | admin

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,  // never returned in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'farmer', 'admin'],
    default: 'user',
  },
  // Farmer-only fields
  farmName:  { type: String, default: '' },
  location:  { type: String, default: '' },
  bio:       { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare plain password with hashed
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
