import { supabase, Database } from './supabase';
import { User, Transaction, Dashboard } from '../types';

type Tables = Database['public']['Tables'];
type UserRow = Tables['users']['Row'];
type TransactionRow = Tables['transactions']['Row'];
type InvestmentRow = Tables['investments']['Row'];
type CardApplicationRow = Tables['card_applications']['Row'];

export class SupabaseApiService {
  // Authentication
  async signUp(email: string, password: string, userData: {
    name: string;
    country: string;
  }) {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            country: userData.country
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Generate referral code
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create user profile in our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name: userData.name,
            country: userData.country,
            referral_code: referralCode,
            is_verified: false,
            has_2fa: false,
            is_admin: false
          })
          .select()
          .single();

        if (profileError) throw profileError;

        return {
          user: this.mapUserFromSupabase(userProfile),
          session: authData.session
        };
      }

      throw new Error('User creation failed');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        return {
          user: this.mapUserFromSupabase(userProfile),
          session: data.session
        };
      }

      throw new Error('Sign in failed');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return this.mapUserFromSupabase(userProfile);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Dashboard Data
  async getDashboardData(userId: string): Promise<Dashboard> {
    try {
      // Get transactions for calculations
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (txError) throw txError;

      // Get investments
      const { data: investments, error: invError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (invError) throw invError;

      // Calculate dashboard metrics
      let balance = 0;
      let activeDeposit = 0;
      let profit = 0;
      let withdrawn = 0;
      let bonus = 0;

      transactions?.forEach(tx => {
        if (tx.status === 'completed') {
          switch (tx.type) {
            case 'deposit':
              balance += tx.amount;
              break;
            case 'profit':
              profit += tx.amount;
              balance += tx.amount;
              break;
            case 'withdraw':
              withdrawn += tx.amount;
              balance -= tx.amount;
              break;
            case 'bonus':
              bonus += tx.amount;
              balance += tx.amount;
              break;
          }
        }
      });

      // Calculate active deposits from investments
      activeDeposit = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

      return {
        balance,
        activeDeposit,
        profit,
        withdrawn,
        bonus
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(this.mapTransactionFromSupabase) || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }

  async createTransaction(userId: string, transactionData: {
    type: 'deposit' | 'withdraw' | 'profit' | 'bonus';
    amount: number;
    method: string;
    wallet_address?: string;
    receipt_file?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          ...transactionData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapTransactionFromSupabase(data);
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  async updateTransaction(transactionId: string, updates: {
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    tx_hash?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;

      return this.mapTransactionFromSupabase(data);
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }

  // Investments
  async createInvestment(userId: string, investmentData: {
    plan_id: string;
    amount: number;
    daily_rate: number;
    duration: number;
  }) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + investmentData.duration);

      const { data, error } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          ...investmentData,
          end_date: endDate.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Create investment error:', error);
      throw error;
    }
  }

  // Card Applications
  async createCardApplication(userId: string, applicationData: {
    full_name: string;
    card_type: 'virtual' | 'physical';
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('card_applications')
        .insert({
          user_id: userId,
          ...applicationData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Create card application error:', error);
      throw error;
    }
  }

  // Admin Functions
  async getAllTransactions(status?: string) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users (
            email,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(tx => ({
        ...this.mapTransactionFromSupabase(tx),
        userEmail: tx.users?.email,
        userName: tx.users?.name
      })) || [];
    } catch (error) {
      console.error('Get all transactions error:', error);
      throw error;
    }
  }

  async getAdminStats() {
    try {
      const [usersResult, transactionsResult, investmentsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('transactions').select('id, amount, type, status', { count: 'exact' }),
        supabase.from('investments').select('id', { count: 'exact' })
      ]);

      const totalUsers = usersResult.count || 0;
      const totalTransactions = transactionsResult.count || 0;
      const totalInvestments = investmentsResult.count || 0;

      let totalVolume = 0;
      let totalRevenue = 0;

      transactionsResult.data?.forEach(tx => {
        if (tx.status === 'completed') {
          totalVolume += tx.amount || 0;
          if (tx.type === 'deposit') {
            totalRevenue += (tx.amount || 0) * 0.1; // 10% commission
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
      console.error('Get admin stats error:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refetch transactions when changes occur
          this.getTransactions(userId).then(callback);
        }
      )
      .subscribe();
  }

  subscribeToAllTransactions(callback: (transactions: any[]) => void) {
    return supabase
      .channel('all_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          // Refetch all transactions when changes occur
          this.getAllTransactions().then(callback);
        }
      )
      .subscribe();
  }

  // Helper methods
  private mapUserFromSupabase(userRow: UserRow): User {
    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      country: userRow.country,
      isVerified: userRow.is_verified,
      has2FA: userRow.has_2fa,
      referralCode: userRow.referral_code,
      referredBy: userRow.referred_by
    };
  }

  private mapTransactionFromSupabase(txRow: TransactionRow): Transaction {
    return {
      id: txRow.id,
      date: new Date(txRow.created_at).toISOString().split('T')[0],
      amount: txRow.amount,
      method: txRow.method,
      status: txRow.status,
      type: txRow.type,
      txHash: txRow.tx_hash
    };
  }
}

export const supabaseApi = new SupabaseApiService();