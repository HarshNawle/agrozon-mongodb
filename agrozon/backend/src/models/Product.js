// backend/src/models/Product.js
// Product schema covering all agricultural categories.

const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  // Farmer who listed this product (null = admin-created seed data)
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  farmerName:   { type: String, required: true, default: 'Agrozon Farmer' },
  farmLocation: { type: String, default: '' },

  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other'],
    default: 'other',
  },
  subCategory: { type: String, default: '' },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  unit:       { type: String, default: 'kg' },
  imageUrl:   { type: String, default: '' },
  isOrganic:  { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true })

// Text search index on name + description
productSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Product', productSchema)
