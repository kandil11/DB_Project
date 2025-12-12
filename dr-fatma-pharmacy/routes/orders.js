const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create order (checkout)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { shipping_address } = req.body;
    
    if (!shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    // Get cart
    const cart = await Cart.findOne({ user_id: req.userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    // Create order
    const order = new Order({
      user_id: req.userId,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      tax,
      total,
      shipping_address,
      status: 'pending'
    });
    
    await order.save();
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order_id: order._id,
        subtotal,
        tax,
        total,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Special route for admin to get all orders
    if (req.params.id === 'all') {
      if (req.userType !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const orders = await Order.find()
        .populate('user_id', 'name email phone')
        .sort({ createdAt: -1 });
      
      return res.json({
        success: true,
        data: orders
      });
    }
    
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
