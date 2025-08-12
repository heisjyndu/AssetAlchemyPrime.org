import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  country: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  country: string;
  isVerified: boolean;
  has2FA: boolean;
  referralCode: string;
  referredBy?: string;
  isAdmin: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  constructor() {
    // Load session from localStorage on initialization
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      this.sessionToken = token;
      this.currentUser = JSON.parse(userData);
    }
  }

  private saveSession(user: User, token: string) {
    this.currentUser = user;
    this.sessionToken = token;
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  private clearSession() {
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_data');
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);
      
      // Generate referral code
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create user in database
      const { data: userData, error } = await supabase
        .from('users')
        .insert({
          username: data.username,
          email: data.email,
          password_hash: passwordHash,
          name: data.name,
          country: data.country,
          referral_code: referralCode,
          is_verified: false,
          has_2fa: false,
          is_admin: false
        })
        .select()
        .single();

      if (error) throw error;

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) throw sessionError;

      const user = this.mapUserFromDB(userData);
      this.saveSession(user, sessionToken);

      return { user, token: sessionToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Get user by username
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .single();

      if (error || !userData) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, userData.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) throw sessionError;

      const user = this.mapUserFromDB(userData);
      this.saveSession(user, sessionToken);

      return { user, token: sessionToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.sessionToken) {
        // Remove session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', this.sessionToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  async validateSession(): Promise<User | null> {
    if (!this.sessionToken) return null;

    try {
      // Check if session is valid and not expired
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('session_token', this.sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !sessionData) {
        this.clearSession();
        return null;
      }

      const user = this.mapUserFromDB(sessionData.users);
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.sessionToken;
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private mapUserFromDB(userData: any): User {
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      country: userData.country,
      isVerified: userData.is_verified,
      has2FA: userData.has_2fa,
      referralCode: userData.referral_code,
      referredBy: userData.referred_by,
      isAdmin: userData.is_admin
    };
  }
}

export const authService = new AuthService();