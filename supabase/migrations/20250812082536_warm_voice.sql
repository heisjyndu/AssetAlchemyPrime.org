/*
  # Authentication System Setup

  1. New Tables
    - `users` - Main user table with username/password authentication
    - `user_sessions` - Session management
    - `transactions` - User transactions
    - `investments` - User investments
    - `card_applications` - Card application requests
    - `withdrawal_addresses` - Whitelisted withdrawal addresses

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Admin users can access all data
    - Secure password hashing

  3. Indexes
    - Performance indexes on frequently queried columns
    - Unique constraints on usernames and emails
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with username/password auth
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username varchar(50) UNIQUE NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  country varchar(2) NOT NULL,
  is_verified boolean DEFAULT false,
  has_2fa boolean DEFAULT false,
  two_fa_secret varchar(255),
  referral_code varchar(10) UNIQUE,
  referred_by varchar(10),
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token varchar(255) UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'profit', 'bonus')),
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  method varchar(50) NOT NULL,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  tx_hash varchar(255),
  wallet_address varchar(255),
  receipt_file varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id varchar(20) NOT NULL CHECK (plan_id IN ('basic', 'standard', 'advanced', 'business', 'veteran')),
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  daily_rate numeric(5,4) NOT NULL CHECK (daily_rate > 0),
  duration integer NOT NULL CHECK (duration > 0),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Card applications table
CREATE TABLE IF NOT EXISTS card_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  full_name varchar(255) NOT NULL,
  card_type varchar(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  address text,
  city varchar(100),
  state varchar(100),
  zip_code varchar(20),
  country varchar(2),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'rejected')),
  card_number varchar(16),
  created_at timestamptz DEFAULT now()
);

-- Withdrawal addresses table
CREATE TABLE IF NOT EXISTS withdrawal_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  address varchar(255) NOT NULL,
  label varchar(100),
  is_whitelisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_card_applications_user_id ON card_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_addresses_user_id ON withdrawal_addresses(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = current_setting('app.current_user_id')::uuid);

-- RLS Policies for user_sessions table
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- RLS Policies for investments table
CREATE POLICY "Users can read own investments" ON investments
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own investments" ON investments
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- RLS Policies for card_applications table
CREATE POLICY "Users can read own card applications" ON card_applications
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own card applications" ON card_applications
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- RLS Policies for withdrawal_addresses table
CREATE POLICY "Users can manage own withdrawal addresses" ON withdrawal_addresses
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- Insert demo users (passwords are hashed with bcrypt)
INSERT INTO users (username, email, password_hash, name, country, is_verified, has_2fa, referral_code, is_admin) VALUES
('admin', 'admin@assetalchemyprime.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'GB', true, true, 'ADMIN1', true),
('demo', 'demo@assetalchemyprime.org', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'GB', true, false, 'DEMO123', false)
ON CONFLICT (username) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();