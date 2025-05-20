const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.createOrder = async (req, res) => {
  const { products, paymentMethod, totalAmount } = req.body;
  try {
    // Validate products exist
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      products,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === 'cash on delivery' ? 'pending' : 'pending'
    });

    await order.save();

    // If order is created from cart, clear the cart
    if (req.body.fromCart) {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { products: [] } }
      );
    }

    // Populate product details
    await order.populate('products.product');
    await order.populate('user', 'name email');

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product')
      .populate('user', 'name email')
      .sort({ createdDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('products.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Process payment with Stripe
exports.processStripePayment = async (req, res) => {
  try {
    const { orderId, paymentMethodId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // In a real application, you would integrate with Stripe API here
    // For this example, we'll simulate a successful payment

    order.paymentStatus = 'completed';
    order.paymentId = 'stripe_' + Date.now(); // Simulate a payment ID
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error' });
  }
};

// Process payment with PayPal
exports.processPaypalPayment = async (req, res) => {
  try {
    const { orderId, paypalPaymentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // In a real application, you would integrate with PayPal API here
    // For this example, we'll simulate a successful payment

    order.paymentStatus = 'completed';
    order.paymentId = paypalPaymentId || 'paypal_' + Date.now(); // Use provided ID or simulate one
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error' });
  }
};