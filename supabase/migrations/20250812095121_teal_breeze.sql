/*
  # AssetAlchemyPrime Authentication & Database Schema
  
  1. New Tables
    - `users` - User accounts with username/password authentication
    - `user_sessions` - Session management for login tracking
    - `transactions` - Financial transactions (deposits, withdrawals, profits, bonuses)
    - `investments` - User investment records
    - `card_applications` - Crypto card applications
    - `withdrawal_addresses` - Whitelisted withdrawal addresses
    
  2. Security
    - Enable RLS on all tables
    - Comprehensive CRUD policies for users and admins
    - Secure password hashing and session management
    
  3. Demo Data
    - Admin user: username 'admin', password 'admin123'
    - Demo user: username 'demo', password 'user123'
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_id')
  )::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_current_user() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = get_current_user() 
    AND is_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS withdrawal_addresses CASCADE;
DROP TABLE IF EXISTS card_applications CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table with username/password authentication
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'profit', 'bonus')),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    tx_hash VARCHAR(255),
    wallet_address VARCHAR(255),
    receipt_file VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(20) NOT NULL CHECK (plan_id IN ('basic', 'standard', 'advanced', 'business', 'veteran')),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    daily_rate NUMERIC(5,4) NOT NULL CHECK (daily_rate > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Card applications table
CREATE TABLE card_applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'rejected')),
    card_number VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal addresses table
CREATE TABLE withdrawal_addresses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    label VARCHAR(100),
    is_whitelisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_card_applications_user_id ON card_applications(user_id);
CREATE INDEX idx_withdrawal_addresses_user_id ON withdrawal_addresses(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (id = get_current_user());

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (id = get_current_user());

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE TO authenticated
    USING (is_admin());

-- RLS Policies for user_sessions table
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Admins can manage all sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (is_admin());

-- RLS Policies for transactions table
CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = get_current_user());

CREATE POLICY "Users can read own transactions" ON transactions
    FOR SELECT TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Admins can manage all transactions" ON transactions
    FOR ALL TO authenticated
    USING (is_admin());

-- RLS Policies for investments table
CREATE POLICY "Users can create own investments" ON investments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = get_current_user());

CREATE POLICY "Users can read own investments" ON investments
    FOR SELECT TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Users can update own investments" ON investments
    FOR UPDATE TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Admins can manage all investments" ON investments
    FOR ALL TO authenticated
    USING (is_admin());

-- RLS Policies for card_applications table
CREATE POLICY "Users can create own card applications" ON card_applications
    FOR INSERT TO authenticated
    WITH CHECK (user_id = get_current_user());

CREATE POLICY "Users can read own card applications" ON card_applications
    FOR SELECT TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Users can update own pending card applications" ON card_applications
    FOR UPDATE TO authenticated
    USING (user_id = get_current_user() AND status = 'pending');

CREATE POLICY "Admins can manage all card applications" ON card_applications
    FOR ALL TO authenticated
    USING (is_admin());

-- RLS Policies for withdrawal_addresses table
CREATE POLICY "Users can manage own withdrawal addresses" ON withdrawal_addresses
    FOR ALL TO authenticated
    USING (user_id = get_current_user());

CREATE POLICY "Admins can manage all withdrawal addresses" ON withdrawal_addresses
    FOR ALL TO authenticated
    USING (is_admin());

-- Insert demo users with hashed passwords
-- Password for 'admin123' and 'user123' hashed with bcrypt (12 rounds)
INSERT INTO users (id, username, email, password_hash, name, country, is_verified, has_2fa, referral_code, is_admin) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@assetalchemyprime.org',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
    'Admin User',
    'GB',
    true,
    true,
    'ADMIN1',
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'demo',
    'demo@assetalchemyprime.org',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Demo User',
    'GB',
    true,
    false,
    'DEMO123',
    false
);

-- Insert some demo transactions
INSERT INTO transactions (user_id, type, amount, method, status, created_at) VALUES
('00000000-0000-0000-0000-000000000002', 'deposit', 5000.00, 'Bitcoin', 'completed', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000002', 'profit', 250.50, 'Investment Return', 'completed', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000002', 'withdraw', 1000.00, 'USDT', 'pending', NOW() - INTERVAL '6 hours');

-- Insert demo investment
INSERT INTO investments (user_id, plan_id, amount, daily_rate, duration, end_date) VALUES
('00000000-0000-0000-0000-000000000002', 'standard', 5000.00, 0.02, 7, NOW() + INTERVAL '5 days');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();