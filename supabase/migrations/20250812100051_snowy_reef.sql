/*
  # Fixed Authentication Tables Migration
  
  This migration creates all necessary tables in the public schema only,
  avoiding permission issues with the auth schema.
  
  1. New Tables
    - `users` - User profiles and authentication data
    - `user_sessions` - Session management
    - `transactions` - Financial transactions
    - `investments` - Investment records
    - `card_applications` - Card application data
    - `withdrawal_addresses` - Whitelisted withdrawal addresses
    
  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Secure session management
    
  3. Demo Data
    - Sample users with hashed passwords
    - Demo transactions and investments
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (our own auth system)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  has_2fa BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR(255),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by VARCHAR(10),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'profit', 'bonus')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  tx_hash VARCHAR(255),
  wallet_address VARCHAR(255),
  receipt_file VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) NOT NULL CHECK (plan_id IN ('basic', 'standard', 'advanced', 'business', 'veteran')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  daily_rate DECIMAL(5,4) NOT NULL CHECK (daily_rate > 0),
  duration INTEGER NOT NULL CHECK (duration > 0),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create card applications table
CREATE TABLE IF NOT EXISTS public.card_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'rejected')),
  card_number VARCHAR(16),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create withdrawal addresses table
CREATE TABLE IF NOT EXISTS public.withdrawal_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  address VARCHAR(255) NOT NULL,
  label VARCHAR(100),
  is_whitelisted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_card_applications_user_id ON public.card_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_addresses_user_id ON public.withdrawal_addresses(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (id = auth.uid() OR id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (id = auth.uid() OR id::text = current_setting('app.current_user_id', true));

-- Create RLS Policies for user_sessions table
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
  FOR ALL USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Create RLS Policies for transactions table
CREATE POLICY "Users can read own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Create RLS Policies for investments table
CREATE POLICY "Users can read own investments" ON public.investments
  FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own investments" ON public.investments
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Create RLS Policies for card applications table
CREATE POLICY "Users can read own card applications" ON public.card_applications
  FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own card applications" ON public.card_applications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Create RLS Policies for withdrawal addresses table
CREATE POLICY "Users can manage own withdrawal addresses" ON public.withdrawal_addresses
  FOR ALL USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Insert demo users with bcrypt hashed passwords
-- Password for admin: admin123 (hashed with bcrypt)
-- Password for demo: user123 (hashed with bcrypt)
INSERT INTO public.users (username, email, password_hash, name, country, is_verified, has_2fa, referral_code, is_admin) VALUES
('admin', 'admin@assetalchemyprime.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'GB', true, true, 'ADMIN1', true),
('demo', 'demo@assetalchemyprime.org', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'GB', true, false, 'DEMO123', false)
ON CONFLICT (username) DO NOTHING;

-- Get user IDs for demo data
DO $$
DECLARE
    admin_id UUID;
    demo_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_id FROM public.users WHERE username = 'admin';
    
    -- Get demo user ID  
    SELECT id INTO demo_id FROM public.users WHERE username = 'demo';
    
    -- Insert demo transactions for demo user
    IF demo_id IS NOT NULL THEN
        INSERT INTO public.transactions (user_id, type, amount, method, status, created_at) VALUES
        (demo_id, 'deposit', 5000.00, 'Bitcoin', 'completed', NOW() - INTERVAL '5 days'),
        (demo_id, 'profit', 250.50, 'Investment Return', 'completed', NOW() - INTERVAL '3 days'),
        (demo_id, 'withdraw', 1000.00, 'Ethereum', 'pending', NOW() - INTERVAL '1 day'),
        (demo_id, 'bonus', 500.00, 'Referral Bonus', 'completed', NOW() - INTERVAL '2 days')
        ON CONFLICT DO NOTHING;
        
        -- Insert demo investment for demo user
        INSERT INTO public.investments (user_id, plan_id, amount, daily_rate, duration, status) VALUES
        (demo_id, 'standard', 5000.00, 0.02, 7, 'active')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create a function to help with authentication (optional)
CREATE OR REPLACE FUNCTION public.authenticate_user(username_input TEXT, password_input TEXT)
RETURNS TABLE(user_id UUID, user_data JSON) AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT * INTO user_record 
    FROM public.users 
    WHERE username = username_input;
    
    IF user_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Note: Password verification should be done in your application code
    -- This function is just for reference
    RETURN QUERY SELECT 
        user_record.id,
        row_to_json(user_record)::JSON;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;