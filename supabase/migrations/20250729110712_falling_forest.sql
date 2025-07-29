-- Initialize CryptoVest Database
-- This file is automatically executed when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'profit', 'bonus')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    tx_hash VARCHAR(255),
    wallet_address VARCHAR(255),
    receipt_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(20) NOT NULL CHECK (plan_id IN ('basic', 'standard', 'advanced', 'business', 'veteran')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    daily_rate DECIMAL(5,4) NOT NULL CHECK (daily_rate > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create card applications table
CREATE TABLE IF NOT EXISTS card_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'rejected')),
    card_number VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create withdrawal addresses table
CREATE TABLE IF NOT EXISTS withdrawal_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    label VARCHAR(100),
    is_whitelisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_card_applications_user_id ON card_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_addresses_user_id ON withdrawal_addresses(user_id);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, name, country, is_verified, is_admin, referral_code) 
VALUES (
    'admin@cryptovest.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 
    'Admin User', 
    'GB', 
    true, 
    true, 
    'ADMIN1'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (email, password_hash, name, country, is_verified, referral_code) 
VALUES (
    'user@example.com', 
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'John Doe', 
    'GB', 
    true, 
    'USER01'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions for demo user
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'user@example.com';
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO transactions (user_id, type, amount, method, status, created_at) VALUES
        (demo_user_id, 'deposit', 5000.00, 'Bitcoin', 'completed', NOW() - INTERVAL '5 days'),
        (demo_user_id, 'profit', 250.50, 'Investment', 'completed', NOW() - INTERVAL '3 days'),
        (demo_user_id, 'withdraw', 1000.00, 'USDT', 'pending', NOW() - INTERVAL '1 day'),
        (demo_user_id, 'bonus', 500.00, 'Referral', 'completed', NOW() - INTERVAL '2 days');
        
        INSERT INTO investments (user_id, plan_id, amount, daily_rate, duration, end_date) VALUES
        (demo_user_id, 'business', 10000.00, 0.04, 7, NOW() + INTERVAL '2 days');
    END IF;
END $$;