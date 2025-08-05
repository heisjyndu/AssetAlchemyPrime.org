const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// Import modules
const { authenticateToken } = require('./middleware/auth.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for demo (replace with real database in production)
const users = new Map();
const transactions = new Map();
const investments = new Map();

// Add demo admin user
users.set('admin@assetalchemyprime.org', {
  id: 'admin-1',
  email: 'admin@assetalchemyprime.org',
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // admin123
  name: 'Admin User',
  country: 'GB',
  isVerified: true,
  isAdmin: true,
  referralCode: 'ADMIN1',
  createdAt: new Date()
});

// Add demo regular user
users.set('demo@assetalchemyprime.org', {
  id: 'user-1',
  email: 'demo@assetalchemyprime.org',
  passwordHash: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // user123
  name: 'Demo User',
  country: 'GB',
  isVerified: true,
  isAdmin: false,
  referralCode: 'DEMO123',
  createdAt: new Date()
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Crypto wallet address generator (mock implementation)
const generateWalletAddress = (currency) => {
  const addresses = {
    bitcoin: () => `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    ethereum: () => `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`,
    usdt: () => `T${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
    usdc: () => `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`
  };
  
  return addresses[currency] ? addresses[currency]() : addresses.bitcoin();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, country } = req.body;

    // Check if user exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create user
    const userData = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      country,
      referralCode,
      isVerified: false,
      has2FA: false,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.set(email, userData);

    const token = jwt.sign({ userId: userData.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        country: userData.country,
        referralCode: userData.referralCode,
        isVerified: false,
        has2FA: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userData = users.get(email);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: userData.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        country: userData.country,
        isVerified: userData.isVerified,
        has2FA: userData.has2FA,
        referralCode: userData.referralCode,
        referredBy: userData.referredBy,
        isAdmin: userData.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Return mock dashboard data for demo
    res.json({
      balance: 15750.50,
      activeDeposit: 25000.00,
      profit: 3420.75,
      withdrawn: 8950.25,
      bonus: 1250.00
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    // Return mock transaction data for demo
    res.json([
      {
        id: '1',
        date: '2025-01-15',
        amount: 5000,
        method: 'Bitcoin',
        status: 'completed',
        type: 'deposit',
        txHash: '0x123...abc'
      },
      {
        id: '2',
        date: '2025-01-14',
        amount: 250.50,
        method: 'Ethereum',
        status: 'completed',
        type: 'profit'
      },
      {
        id: '3',
        date: '2025-01-13',
        amount: 1000,
        method: 'USDT',
        status: 'pending',
        type: 'withdraw'
      }
    ]);
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create deposit
app.post('/api/transactions/deposit', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, method } = req.body;
    const receiptFile = req.file ? req.file.filename : null;

    // Generate wallet address
    const walletAddress = generateWalletAddress(method);

    // Create transaction
    const transactionData = {
      id: uuidv4(),
      userId,
      type: 'deposit',
      amount: parseFloat(amount),
      method,
      walletAddress,
      receiptFile,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    transactions.set(transactionData.id, transactionData);

    res.status(201).json({
      message: 'Deposit request created successfully',
      transactionId: transactionData.id,
      walletAddress
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create withdrawal
app.post('/api/transactions/withdraw', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, address, password, twoFA } = req.body;

    // Find user by ID
    let userData = null;
    for (const [email, user] of users.entries()) {
      if (user.id === userId) {
        userData = user;
        break;
      }
    }
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create withdrawal request
    const transactionData = {
      id: uuidv4(),
      userId,
      type: 'withdraw',
      amount: parseFloat(amount),
      method: 'crypto',
      walletAddress: address,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    transactions.set(transactionData.id, transactionData);

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      transactionId: transactionData.id
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create investment
app.post('/api/investments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId, amount } = req.body;

    const plans = {
      basic: { dailyRate: 0.015, duration: 7 },
      standard: { dailyRate: 0.02, duration: 7 },
      advanced: { dailyRate: 0.025, duration: 7 },
      business: { dailyRate: 0.04, duration: 7 },
      veteran: { dailyRate: 0.055, duration: 7 }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Create investment
    const investmentData = {
      id: uuidv4(),
      userId,
      planId,
      amount: parseFloat(amount),
      dailyRate: plan.dailyRate,
      duration: plan.duration,
      startDate: new Date(),
      endDate,
      status: 'active',
      createdAt: new Date()
    };
    
    investments.set(investmentData.id, investmentData);

    res.status(201).json({
      message: 'Investment created successfully',
      investmentId: investmentData.id
    });
  } catch (error) {
    console.error('Investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Card application
app.post('/api/cards/apply', authenticateToken, async (req, res) => {
  try {
    res.status(201).json({
      message: 'Card application submitted successfully',
      applicationId: uuidv4()
    });
  } catch (error) {
    console.error('Card application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Find user by ID
    let userData = null;
    for (const [email, user] of users.entries()) {
      if (user.id === req.user.userId) {
        userData = user;
        break;
      }
    }
    
    if (!userData?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Return mock admin stats
    res.json({
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👥 Demo users loaded: ${users.size}`);
  console.log(`📝 Demo credentials:`);
  console.log(`   Admin: admin@assetalchemyprime.org / admin123`);
  console.log(`   User:  demo@assetalchemyprime.org / user123`);
});

module.exports = app;