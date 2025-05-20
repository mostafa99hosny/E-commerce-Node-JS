const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

// Get seller's products
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ creationDate: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seller's orders (orders containing their products)
exports.getSellerOrders = async (req, res) => {
  try {
    // Find all products by this seller
    const sellerProducts = await Product.find({ seller: req.user.id });
    const productIds = sellerProducts.map(product => product._id);

    // Find orders containing these products
    const orders = await Order.find({ 'products.product': { $in: productIds } })
      .populate('products.product')
      .populate('user', 'name email')
      .sort({ createdDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seller profile
exports.getSellerProfile = async (req, res) => {
  try {
    // Check if user is a seller
    if (!req.user.isSeller) {
      return res.status(403).json({ message: 'Access denied. Not a seller account.' });
    }

    const seller = await User.findById(req.user.id).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get count of products
    const productCount = await Product.countDocuments({ seller: req.user.id });

    // Get seller's products
    const products = await Product.find({ seller: req.user.id })
      .sort({ creationDate: -1 })
      .limit(5); // Get only the 5 most recent products

    res.json({
      seller,
      stats: {
        productCount
      },
      recentProducts: products
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};