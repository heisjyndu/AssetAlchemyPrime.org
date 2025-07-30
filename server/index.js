const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

require('dotenv').config();

// Import modules
const { pool } = require('./database');
const { authenticateToken } = require('./middleware/auth');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Database initialization
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(2) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        has_2fa BOOLEAN DEFAULT false,
        two_fa_secret VARCHAR(255),
        referral_code VARCHAR(10) UNIQUE,
        referred_by VARCHAR(10),
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        tx_hash VARCHAR(255),
        wallet_address VARCHAR(255),
        receipt_file VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        plan_id VARCHAR(20) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        daily_rate DECIMAL(5,4) NOT NULL,
        duration INTEGER NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS card_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        full_name VARCHAR(255) NOT NULL,
        card_type VARCHAR(20) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(2),
        status VARCHAR(20) DEFAULT 'pending',
        card_number VARCHAR(16),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        address VARCHAR(255) NOT NULL,
        label VARCHAR(100),
        is_whitelisted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

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

// Payment routes
app.use('/api/payments', paymentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, country } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, country, referral_code) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, country, referral_code',
      [email, passwordHash, name, country, referralCode]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        referralCode: user.referral_code,
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

    const result = await pool.query(
      'SELECT id, email, password_hash, name, country, is_verified, has_2fa, referral_code, referred_by, is_admin FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        isVerified: user.is_verified,
        has2FA: user.has_2fa,
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        isAdmin: user.is_admin
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
    const userId = req.user.userId;

    // Get user balance and stats
    const deposits = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'deposit' AND status = 'completed'",
      [userId]
    );

    const withdrawals = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'withdraw' AND status = 'completed'",
      [userId]
    );

    const profits = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'profit' AND status = 'completed'",
      [userId]
    );

    const bonuses = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'bonus' AND status = 'completed'",
      [userId]
    );

    const activeInvestments = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = $1 AND status = 'active'",
      [userId]
    );

    const totalDeposits = parseFloat(deposits.rows[0].total);
    const totalWithdrawals = parseFloat(withdrawals.rows[0].total);
    const totalProfits = parseFloat(profits.rows[0].total);
    const totalBonuses = parseFloat(bonuses.rows[0].total);
    const activeDeposit = parseFloat(activeInvestments.rows[0].total);

    const balance = totalDeposits + totalProfits + totalBonuses - totalWithdrawals - activeDeposit;

    res.json({
      balance: Math.max(0, balance),
      activeDeposit,
      profit: totalProfits,
      withdrawn: totalWithdrawals,
      bonus: totalBonuses
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT id, type, amount, method, status, tx_hash, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    const transactions = result.rows.map(tx => ({
      id: tx.id,
      date: tx.created_at.toISOString().split('T')[0],
      amount: parseFloat(tx.amount),
      method: tx.method,
      status: tx.status,
      type: tx.type,
      txHash: tx.tx_hash
    }));

    res.json(transactions);
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

    const result = await pool.query(
      'INSERT INTO transactions (user_id, type, amount, method, wallet_address, receipt_file) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, 'deposit', amount, method, walletAddress, receiptFile]
    );

    res.status(201).json({
      message: 'Deposit request created successfully',
      transactionId: result.rows[0].id,
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

    // Verify user password
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create withdrawal request
    const result = await pool.query(
      'INSERT INTO transactions (user_id, type, amount, method, wallet_address, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, 'withdraw', amount, 'crypto', address, 'pending']
    );

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      transactionId: result.rows[0].id
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

    const result = await pool.query(
      'INSERT INTO investments (user_id, plan_id, amount, daily_rate, duration, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, planId, amount, plan.dailyRate, plan.duration, endDate]
    );

    res.status(201).json({
      message: 'Investment created successfully',
      investmentId: result.rows[0].id
    });
  } catch (error) {
    console.error('Investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Card application
app.post('/api/cards/apply', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, cardType, address, city, state, zipCode, country } = req.body;

    const result = await pool.query(
      'INSERT INTO card_applications (user_id, full_name, card_type, address, city, state, zip_code, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [userId, fullName, cardType, address, city, state, zipCode, country]
    );

    res.status(201).json({
      message: 'Card application submitted successfully',
      applicationId: result.rows[0].id
    });
  } catch (error) {
    console.error('Card application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.userId]);
    if (!userResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalVolume = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'");
    const activeInvestments = await pool.query("SELECT COUNT(*) as count FROM investments WHERE status = 'active'");
    const totalRevenue = await pool.query("SELECT COALESCE(SUM(amount * 0.1), 0) as total FROM transactions WHERE type = 'deposit' AND status = 'completed'");

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalVolume: parseFloat(totalVolume.rows[0].total),
      activeInvestments: parseInt(activeInvestments.rows[0].count),
      revenue: parseFloat(totalRevenue.rows[0].total)
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

// Initialize database and start server
const startServer = async () => {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  });
};

startServer().catch(console.error);

module.exports = app;