const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/loans', require('./src/routes/loanRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/blockchain', require('./src/routes/blockchainRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(require('./src/middleware/errorMiddleware'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.BLOCKCHAIN_NETWORK}`);
});