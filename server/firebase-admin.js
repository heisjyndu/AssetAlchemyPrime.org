const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // In production, use service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'cryptovest-demo'}.firebaseio.com`
    });
  } else {
    // In development, use default credentials or emulator
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'cryptovest-demo'
    });
  }
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization failed, using fallback mode:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();

// Collections
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  CARD_APPLICATIONS: 'card_applications',
  WITHDRAWAL_ADDRESSES: 'withdrawal_addresses',
  ADMIN_LOGS: 'admin_logs'
};

module.exports = {
  admin,
  db,
  auth,
  COLLECTIONS
};