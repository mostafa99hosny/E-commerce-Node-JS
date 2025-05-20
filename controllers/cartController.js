const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');

// Create or update cart
exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find existing cart or create new one
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Update existing cart
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex > -1) {
        // Product exists in cart, update quantity
        cart.products[productIndex].quantity = quantity;
      } else {
        // Product does not exist in cart, add it
        cart.products.push({ product: productId, quantity });
      }
      
      cart.updatedAt = Date.now();
    }

    await cart.save();
    
    // Populate product details
    await cart.populate('products.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    
    if (!cart) {
      return res.json({ products: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove product from cart
    cart.products = cart.products.filter(
      item => item.product.toString() !== productId
    );
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    await cart.populate('products.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.products = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
