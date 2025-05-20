const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { auth, sellerAuth } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication and seller status)
router.post('/create', auth, sellerAuth, createProduct);
router.put('/update/:id', auth, sellerAuth, updateProduct);
router.delete('/delete/:id', auth, sellerAuth, deleteProduct);

module.exports = router;