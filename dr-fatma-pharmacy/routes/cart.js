const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.userId });
    
    if (!cart) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Transform items to ensure product_id is a string
    const items = cart.items.map(item => ({
      product_id: item.product_id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      requires_prescription: item.requires_prescription
    }));
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, name, price, quantity = 1, category, requires_prescription } = req.body;
    
    if (!product_id || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, and price are required'
      });
    }
    
    // Validate product_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    let cart = await Cart.findOne({ user_id: req.userId });
    
    if (!cart) {
      cart = new Cart({ user_id: req.userId, items: [] });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find(item => item.product_id.toString() === product_id.toString());
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product_id: new mongoose.Types.ObjectId(product_id),
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
        requires_prescription
      });
    }
    
    await cart.save();
    
    // Transform items to ensure product_id is a string
    const items = cart.items.map(item => ({
      product_id: item.product_id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      requires_prescription: item.requires_prescription
    }));
    
    res.json({
      success: true,
      message: 'Added to cart',
      data: items
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update cart item quantity
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    const cart = await Cart.findOne({ user_id: req.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(item => item.product_id.toString() !== product_id.toString());
    } else {
      // Update quantity
      const item = cart.items.find(item => item.product_id.toString() === product_id.toString());
      if (item) {
        item.quantity = parseInt(quantity);
      }
    }
    
    await cart.save();
    
    // Transform items to ensure product_id is a string
    const items = cart.items.map(item => ({
      product_id: item.product_id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      requires_prescription: item.requires_prescription
    }));
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: items
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { product_id } = req.query;
    
    const cart = await Cart.findOne({ user_id: req.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.product_id.toString() !== product_id.toString());
    await cart.save();
    
    // Transform items to ensure product_id is a string
    const items = cart.items.map(item => ({
      product_id: item.product_id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      requires_prescription: item.requires_prescription
    }));
    
    res.json({
      success: true,
      message: 'Item removed',
      data: items
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user_id: req.userId },
      { items: [] }
    );
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
