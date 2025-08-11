/*
  # Row Level Security Policies for AssetAlchemyPrime

  1. Security Policies
    - Enable RLS on all tables
    - Users can only access their own data
    - Admin users can access all data for management
    - Public read access for certain reference data

  2. Functions
    - Helper functions for admin checks
    - User data access functions
*/

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_addresses ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (is_admin(auth.uid()));

-- Transactions table policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all transactions" ON transactions
  FOR UPDATE USING (is_admin(auth.uid()));

-- Investments table policies
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments" ON investments
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all investments" ON investments
  FOR UPDATE USING (is_admin(auth.uid()));

-- Card applications table policies
CREATE POLICY "Users can view own card applications" ON card_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own card applications" ON card_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card applications" ON card_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all card applications" ON card_applications
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all card applications" ON card_applications
  FOR UPDATE USING (is_admin(auth.uid()));

-- Withdrawal addresses table policies
CREATE POLICY "Users can view own withdrawal addresses" ON withdrawal_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal addresses" ON withdrawal_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawal addresses" ON withdrawal_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawal addresses" ON withdrawal_addresses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal addresses" ON withdrawal_addresses
  FOR SELECT USING (is_admin(auth.uid()));

-- Function to handle user creation from auth trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, country, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
    UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();