const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // If isSeller is not in the token, fetch it from the database
    if (decoded.isSeller === undefined) {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user.isSeller = user.isSeller;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Middleware to check if user is a seller
const sellerAuth = (req, res, next) => {
  if (!req.user.isSeller) {
    return res.status(403).json({ message: 'Access denied. Not a seller account.' });
  }
  next();
};

module.exports = { auth, sellerAuth };