const express = require('express');
const router = express.Router();
const {
  getSellerProducts,
  getSellerOrders,
  getSellerProfile
} = require('../controllers/sellerController');
const { auth, sellerAuth } = require('../middleware/auth');

// All seller routes require authentication and seller status
router.use(auth);
router.use(sellerAuth);

router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.get('/profile', getSellerProfile);

module.exports = router;