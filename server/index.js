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
const { db, COLLECTIONS } = require('./firebase-admin');

// Initialize Stripe only if secret key is provided and not a placeholder
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

require('dotenv').config();

// Import modules
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
const initFirebase = async () => {
  try {
    // Test Firebase connection
    await db.collection('test').add({ test: true });
    console.log('✅ Firebase connected successfully');
    return true;
  } catch (error) {
    console.warn('⚠️  Firebase not available, using fallback mode:', error.message);
    return false;
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

    // Check if user exists in Firebase
    const usersRef = db.collection(COLLECTIONS.USERS);
    const existingUser = await usersRef.where('email', '==', email).get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create user in Firebase
    const userData = {
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
    
    const userRef = await usersRef.add(userData);

    const token = jwt.sign({ userId: userRef.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userRef.id,
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

    // Find user in Firebase
    const usersRef = db.collection(COLLECTIONS.USERS);
    const userQuery = await usersRef.where('email', '==', email).get();

    if (userQuery.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: userDoc.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
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
    const userId = req.user.userId;

    // Get user transactions from Firebase
    const transactionsRef = db.collection(COLLECTIONS.TRANSACTIONS);
    const userTransactions = await transactionsRef.where('userId', '==', userId).get();
    
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalProfits = 0;
    let totalBonuses = 0;
    
    userTransactions.forEach(doc => {
      const tx = doc.data();
      if (tx.status === 'completed') {
        switch (tx.type) {
          case 'deposit':
            totalDeposits += tx.amount || 0;
            break;
          case 'withdraw':
            totalWithdrawals += tx.amount || 0;
            break;
          case 'profit':
            totalProfits += tx.amount || 0;
            break;
          case 'bonus':
            totalBonuses += tx.amount || 0;
            break;
        }
      }
    });
    
    // Get active investments
    const investmentsRef = db.collection(COLLECTIONS.INVESTMENTS);
    const activeInvestments = await investmentsRef
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();
    
    let activeDeposit = 0;
    activeInvestments.forEach(doc => {
      const investment = doc.data();
      activeDeposit += investment.amount || 0;
    });

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
    
    const transactionsRef = db.collection(COLLECTIONS.TRANSACTIONS);
    const userTransactions = await transactionsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const transactions = userTransactions.docs.map(doc => {
      const tx = doc.data();
      return {
        id: doc.id,
        date: tx.createdAt.toDate().toISOString().split('T')[0],
        amount: tx.amount,
        method: tx.method,
        status: tx.status,
        type: tx.type,
        txHash: tx.txHash
      };
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

    // Create transaction in Firebase
    const transactionData = {
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
    
    const transactionRef = await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

    res.status(201).json({
      message: 'Deposit request created successfully',
      transactionId: transactionRef.id,
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

    // Get user from Firebase
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userDoc.data();
    
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create withdrawal request in Firebase
    const transactionData = {
      userId,
      type: 'withdraw',
      amount: parseFloat(amount),
      method: 'crypto',
      walletAddress: address,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const transactionRef = await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      transactionId: transactionRef.id
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

    // Create investment in Firebase
    const investmentData = {
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
    
    const investmentRef = await db.collection(COLLECTIONS.INVESTMENTS).add(investmentData);

    res.status(201).json({
      message: 'Investment created successfully',
      investmentId: investmentRef.id
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

    // Create card application in Firebase
    const applicationData = {
      userId,
      fullName,
      cardType,
      address,
      city,
      state,
      zipCode,
      country,
      status: 'pending',
      createdAt: new Date()
    };
    
    const applicationRef = await db.collection(COLLECTIONS.CARD_APPLICATIONS).add(applicationData);

    res.status(201).json({
      message: 'Card application submitted successfully',
      applicationId: applicationRef.id
    });
  } catch (error) {
    console.error('Card application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin in Firebase
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.userId).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get stats from Firebase
    const [usersSnap, transactionsSnap, investmentsSnap] = await Promise.all([
      db.collection(COLLECTIONS.USERS).get(),
      db.collection(COLLECTIONS.TRANSACTIONS).where('status', '==', 'completed').get(),
      db.collection(COLLECTIONS.INVESTMENTS).where('status', '==', 'active').get()
    ]);
    
    let totalVolume = 0;
    let totalRevenue = 0;
    
    transactionsSnap.forEach(doc => {
      const tx = doc.data();
      totalVolume += tx.amount || 0;
      if (tx.type === 'deposit') {
        totalRevenue += (tx.amount || 0) * 0.1;
      }
    });

    res.json({
      totalUsers: usersSnap.size,
      totalVolume,
      activeInvestments: investmentsSnap.size,
      revenue: totalRevenue
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
  const firebaseInitialized = await initFirebase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔥 Firebase: ${firebaseInitialized ? 'Connected' : 'Fallback mode'}`);
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  });
};

startServer().catch(console.error);

module.exports = app;