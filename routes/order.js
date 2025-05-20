const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  processStripePayment,
  processPaypalPayment
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// All order routes require authentication
router.use(auth);

router.post('/create', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/payment/stripe', processStripePayment);
router.post('/payment/paypal', processPaypalPayment);

module.exports = router;