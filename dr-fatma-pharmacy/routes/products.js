const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add products'
      });
    }
    
    const { name, description, price, category, stock_quantity, requires_prescription, image_url } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category: category || 'otc',
      stock_quantity: parseInt(stock_quantity) || 100,
      requires_prescription: requires_prescription || false,
      image_url
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update products'
      });
    }
    
    const { name, description, price, category, stock_quantity, requires_prescription, image_url } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (requires_prescription !== undefined) updateData.requires_prescription = requires_prescription;
    if (image_url !== undefined) updateData.image_url = image_url;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete products'
      });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seed initial products (admin only)
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can seed products'
      });
    }
    
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: 'Products already exist',
        count: existingCount
      });
    }
    
    const seedProducts = [
      { name: 'Vitamin C 1000mg', category: 'vitamins', price: 15.99, requires_prescription: false, description: 'High-potency vitamin C supplement for immune support', stock_quantity: 100 },
      { name: 'Pain Relief Tablets', category: 'otc', price: 8.99, requires_prescription: false, description: 'Fast-acting pain relief for headaches and muscle aches', stock_quantity: 200 },
      { name: 'Amoxicillin 500mg', category: 'prescription', price: 24.99, requires_prescription: true, description: 'Antibiotic medication - prescription required', stock_quantity: 50 },
      { name: 'Moisturizing Cream', category: 'beauty', price: 19.99, requires_prescription: false, description: 'Deep hydration for all skin types', stock_quantity: 75 },
      { name: 'Baby Shampoo', category: 'baby', price: 12.99, requires_prescription: false, description: 'Gentle, tear-free formula for babies', stock_quantity: 60 },
      { name: 'Blood Pressure Monitor', category: 'wellness', price: 49.99, requires_prescription: false, description: 'Digital blood pressure monitor for home use', stock_quantity: 25 },
      { name: 'Omega-3 Fish Oil', category: 'vitamins', price: 22.99, requires_prescription: false, description: 'Heart-healthy omega-3 fatty acids', stock_quantity: 80 },
      { name: 'Allergy Relief', category: 'otc', price: 11.99, requires_prescription: false, description: '24-hour non-drowsy allergy relief', stock_quantity: 150 },
      { name: 'Insulin Pen', category: 'prescription', price: 89.99, requires_prescription: true, description: 'Insulin delivery device - prescription required', stock_quantity: 30 },
      { name: 'Sunscreen SPF 50', category: 'beauty', price: 14.99, requires_prescription: false, description: 'Broad spectrum sun protection', stock_quantity: 90 },
      { name: 'Baby Diapers Pack', category: 'baby', price: 29.99, requires_prescription: false, description: 'Ultra-absorbent diapers, pack of 50', stock_quantity: 40 },
      { name: 'Digital Thermometer', category: 'wellness', price: 18.99, requires_prescription: false, description: 'Fast and accurate temperature readings', stock_quantity: 70 }
    ];
    
    await Product.insertMany(seedProducts);
    
    res.json({
      success: true,
      message: 'Products seeded successfully',
      count: seedProducts.length
    });
  } catch (error) {
    console.error('Seed products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
