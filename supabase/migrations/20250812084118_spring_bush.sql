@@ .. @@
 -- Enable RLS on all tables
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
 ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
 ALTER TABLE card_applications ENABLE ROW LEVEL SECURITY;
 ALTER TABLE withdrawal_addresses ENABLE ROW LEVEL SECURITY;
 
--- RLS Policies for users table
+-- =============================================
+-- COMPREHENSIVE RLS POLICIES FOR ALL OPERATIONS
+-- =============================================
+
+-- Users table policies
 CREATE POLICY "Users can read own data"
   ON users
   FOR SELECT
   USING (id = auth.uid());
 
+CREATE POLICY "Users can update own data"
+  ON users
+  FOR UPDATE
+  USING (id = auth.uid())
+  WITH CHECK (id = auth.uid());
+
+CREATE POLICY "Users can insert own data"
+  ON users
+  FOR INSERT
+  WITH CHECK (id = auth.uid());
+
+CREATE POLICY "Users cannot delete themselves"
+  ON users
+  FOR DELETE
+  USING (false); -- Prevent user deletion for data integrity
+
+-- Admin policies for users table
+CREATE POLICY "Admins can read all users"
+  ON users
+  FOR SELECT
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+CREATE POLICY "Admins can update all users"
+  ON users
+  FOR UPDATE
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  )
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+-- User sessions policies
+CREATE POLICY "Users can read own sessions"
+  ON user_sessions
+  FOR SELECT
+  USING (user_id = auth.uid());
+
+CREATE POLICY "Users can insert own sessions"
+  ON user_sessions
+  FOR INSERT
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users can update own sessions"
+  ON user_sessions
+  FOR UPDATE
+  USING (user_id = auth.uid())
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users can delete own sessions"
+  ON user_sessions
+  FOR DELETE
+  USING (user_id = auth.uid());
+
+-- Transactions table policies
 CREATE POLICY "Users can read own transactions"
   ON transactions
   FOR SELECT
-  USING (user_id = auth.uid());
+  USING (user_id = auth.uid());
 
 CREATE POLICY "Users can create own transactions"
   ON transactions
   FOR INSERT
   WITH CHECK (user_id = auth.uid());
 
+CREATE POLICY "Users can update own transactions"
+  ON transactions
+  FOR UPDATE
+  USING (user_id = auth.uid())
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users cannot delete transactions"
+  ON transactions
+  FOR DELETE
+  USING (false); -- Prevent deletion for audit trail
+
+-- Admin policies for transactions
+CREATE POLICY "Admins can read all transactions"
+  ON transactions
+  FOR SELECT
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+CREATE POLICY "Admins can update all transactions"
+  ON transactions
+  FOR UPDATE
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  )
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+-- Investments table policies
 CREATE POLICY "Users can read own investments"
   ON investments
   FOR SELECT
   USING (user_id = auth.uid());
 
 CREATE POLICY "Users can create own investments"
   ON investments
   FOR INSERT
   WITH CHECK (user_id = auth.uid());
 
+CREATE POLICY "Users can update own investments"
+  ON investments
+  FOR UPDATE
+  USING (user_id = auth.uid())
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users cannot delete investments"
+  ON investments
+  FOR DELETE
+  USING (false); -- Prevent deletion for audit trail
+
+-- Admin policies for investments
+CREATE POLICY "Admins can read all investments"
+  ON investments
+  FOR SELECT
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+CREATE POLICY "Admins can update all investments"
+  ON investments
+  FOR UPDATE
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  )
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+-- Card applications policies
 CREATE POLICY "Users can read own card applications"
   ON card_applications
   FOR SELECT
   USING (user_id = auth.uid());
 
 CREATE POLICY "Users can create own card applications"
   ON card_applications
   FOR INSERT
   WITH CHECK (user_id = auth.uid());
 
+CREATE POLICY "Users can update own card applications"
+  ON card_applications
+  FOR UPDATE
+  USING (user_id = auth.uid() AND status = 'pending')
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users cannot delete card applications"
+  ON card_applications
+  FOR DELETE
+  USING (false); -- Prevent deletion for audit trail
+
+-- Admin policies for card applications
+CREATE POLICY "Admins can read all card applications"
+  ON card_applications
+  FOR SELECT
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+CREATE POLICY "Admins can update all card applications"
+  ON card_applications
+  FOR UPDATE
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  )
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+-- Withdrawal addresses policies
+CREATE POLICY "Users can read own withdrawal addresses"
+  ON withdrawal_addresses
+  FOR SELECT
+  USING (user_id = auth.uid());
+
+CREATE POLICY "Users can create own withdrawal addresses"
+  ON withdrawal_addresses
+  FOR INSERT
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users can update own withdrawal addresses"
+  ON withdrawal_addresses
+  FOR UPDATE
+  USING (user_id = auth.uid())
+  WITH CHECK (user_id = auth.uid());
+
+CREATE POLICY "Users can delete own withdrawal addresses"
+  ON withdrawal_addresses
+  FOR DELETE
+  USING (user_id = auth.uid());
+
+-- Admin policies for withdrawal addresses
+CREATE POLICY "Admins can manage all withdrawal addresses"
+  ON withdrawal_addresses
+  FOR ALL
+  USING (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  )
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM users 
+      WHERE id = auth.uid() AND is_admin = true
+    )
+  );
+
+-- =============================================
+-- SECURITY FUNCTIONS
+-- =============================================
+
+-- Function to check if current user is admin
+CREATE OR REPLACE FUNCTION is_admin()
+RETURNS BOOLEAN AS $$
+BEGIN
+  RETURN EXISTS (
+    SELECT 1 FROM users 
+    WHERE id = auth.uid() AND is_admin = true
+  );
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Function to get current user's data
+CREATE OR REPLACE FUNCTION get_current_user()
+RETURNS TABLE (
+  id UUID,
+  username TEXT,
+  email TEXT,
+  name TEXT,
+  country TEXT,
+  is_verified BOOLEAN,
+  has_2fa BOOLEAN,
+  referral_code TEXT,
+  referred_by TEXT,
+  is_admin BOOLEAN
+) AS $$
+BEGIN
+  RETURN QUERY
+  SELECT 
+    u.id,
+    u.username,
+    u.email,
+    u.name,
+    u.country,
+    u.is_verified,
+    u.has_2fa,
+    u.referral_code,
+    u.referred_by,
+    u.is_admin
+  FROM users u
+  WHERE u.id = auth.uid();
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;