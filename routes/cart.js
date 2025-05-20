const express = require('express');
const router = express.Router();
const { updateCart, getCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// All cart routes require authentication
router.use(auth);

router.post('/update', updateCart);
router.get('/', getCart);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
