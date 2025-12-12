const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['prescription', 'otc', 'vitamins', 'wellness', 'beauty', 'baby'],
    default: 'otc'
  },
  stock_quantity: {
    type: Number,
    default: 100
  },
  requires_prescription: {
    type: Boolean,
    default: false
  },
  image_url: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
