// backend/src/models/Order.js
// Order with embedded items (snapshot of product at purchase time).

const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  productName: { type: String, required: true },   // snapshot — survives product deletion
  unitPrice:   { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  imageUrl:    { type: String, default: '' },
}, { _id: true })

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items:       { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  address:     { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
