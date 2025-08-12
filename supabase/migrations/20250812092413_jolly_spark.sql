@@ .. @@
 -- Create users table with username authentication
 CREATE TABLE IF NOT EXISTS users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
+  username VARCHAR(50) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password_hash VARCHAR(255) NOT NULL,
   name VARCHAR(255) NOT NULL,
@@ .. @@
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

+-- Create index on username for faster lookups
+CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
+
 -- Create user_sessions table for session management
 CREATE TABLE IF NOT EXISTS user_sessions (
@@ .. @@
 -- Insert demo users with usernames
 INSERT INTO users (username, email, password_hash, name, country, is_verified, has_2fa, referral_code, is_admin) VALUES
-  ('admin', 'admin@cryptovest.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'GB', true, true, 'ADMIN1', true),
-  ('demo', 'user@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'GB', true, false, 'DEMO123', false)
+  ('admin', 'admin@assetalchemyprime.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'GB', true, true, 'ADMIN1', true),
+  ('demo', 'demo@assetalchemyprime.org', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'GB', true, false, 'DEMO123', false)
 ON CONFLICT (username) DO NOTHING;