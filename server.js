const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const sellerRoutes = require('./routes/seller');
const cartRoutes = require('./routes/cart');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/cart', cartRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});