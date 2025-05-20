const Product = require('../models/product');
const User = require('../models/user');

exports.createProduct = async (req, res) => {
  const { name, description, photo } = req.body;
  try {
    const product = new Product({ name, description, photo, seller: req.user.id });
    await product.save();

    // Populate seller info
    await product.populate('seller', 'name');

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  const { name, seller, sellerName } = req.query;
  try {
    let query = {};

    // Filter by product name
    if (name) {
      query.name = new RegExp(name, 'i');
    }

    // Filter by seller ID
    if (seller) {
      query.seller = seller;
    }

    // Filter by seller name
    if (sellerName) {
      // First find sellers with matching name
      const sellers = await User.find({
        name: new RegExp(sellerName, 'i'),
        isSeller: true
      });

      // Get their IDs
      const sellerIds = sellers.map(seller => seller._id);

      // Add to query
      query.seller = { $in: sellerIds };
    }

    const products = await Product.find(query)
      .populate('seller', 'name')
      .sort({ creationDate: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('seller', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, photo } = req.body;

  try {
    // Find product and check ownership
    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    // Update product
    if (name) product.name = name;
    if (description) product.description = description;
    if (photo) product.photo = photo;

    await product.save();

    // Populate seller info
    await product.populate('seller', 'name');

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Find product and check ownership
    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await Product.deleteOne({ _id: id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};