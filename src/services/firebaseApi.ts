import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Transaction, InvestmentPlan } from '../types';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  CARD_APPLICATIONS: 'card_applications',
  WITHDRAWAL_ADDRESSES: 'withdrawal_addresses'
};

export class FirebaseApiService {
  // Users
  async createUser(userData: any) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: any) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Transactions
  async createTransaction(transactionData: any) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        ...transactionData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...transactionData };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactions(userId?: string, status?: string) {
    try {
      let q = query(collection(db, COLLECTIONS.TRANSACTIONS));
      
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(50));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async updateTransaction(transactionId: string, updates: any) {
    try {
      const docRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToTransactions(callback: (transactions: any[]) => void, status?: string) {
    let q = query(collection(db, COLLECTIONS.TRANSACTIONS));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'), limit(100);
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    });
  }

  // Admin functions
  async getAdminStats() {
    try {
      const [usersSnap, transactionsSnap, investmentsSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.TRANSACTIONS)),
        getDocs(collection(db, COLLECTIONS.INVESTMENTS))
      ]);

      const totalUsers = usersSnap.size;
      const totalTransactions = transactionsSnap.size;
      const totalInvestments = investmentsSnap.size;

      let totalVolume = 0;
      let totalRevenue = 0;

      transactionsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          totalVolume += data.amount || 0;
          if (data.type === 'deposit') {
            totalRevenue += (data.amount || 0) * 0.1; // 10% commission
          }
        }
      });

      return {
        totalUsers,
        totalTransactions,
        totalInvestments,
        totalVolume,
        totalRevenue
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }
}

export const firebaseApi = new FirebaseApiService();