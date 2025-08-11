import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkbssyeqkgjyhweuztqx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          country: string;
          is_verified: boolean;
          has_2fa: boolean;
          referral_code: string;
          referred_by?: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          country: string;
          is_verified?: boolean;
          has_2fa?: boolean;
          referral_code: string;
          referred_by?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          country?: string;
          is_verified?: boolean;
          has_2fa?: boolean;
          referral_code?: string;
          referred_by?: string;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'deposit' | 'withdraw' | 'profit' | 'bonus';
          amount: number;
          method: string;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          tx_hash?: string;
          wallet_address?: string;
          receipt_file?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'deposit' | 'withdraw' | 'profit' | 'bonus';
          amount: number;
          method: string;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          tx_hash?: string;
          wallet_address?: string;
          receipt_file?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'deposit' | 'withdraw' | 'profit' | 'bonus';
          amount?: number;
          method?: string;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          tx_hash?: string;
          wallet_address?: string;
          receipt_file?: string;
          updated_at?: string;
        };
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          amount: number;
          daily_rate: number;
          duration: number;
          start_date: string;
          end_date?: string;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          amount: number;
          daily_rate: number;
          duration: number;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          amount?: number;
          daily_rate?: number;
          duration?: number;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
        };
      };
      card_applications: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          card_type: 'virtual' | 'physical';
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          country?: string;
          status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
          card_number?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          card_type: 'virtual' | 'physical';
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          country?: string;
          status?: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
          card_number?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          card_type?: 'virtual' | 'physical';
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          country?: string;
          status?: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
          card_number?: string;
        };
      };
    };
  };
}