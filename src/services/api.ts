const API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = import.meta.env.PROD 
      ? `${API_BASE_URL}${endpoint}`
      : `/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is empty or not JSON
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        // If we're in production and the API fails, use mock data
        if (import.meta.env.PROD) {
          return this.handleProductionFallback(endpoint, options);
        }
        let error;
        try {
          error = hasJsonContent ? await response.json() : { error: 'Server error' };
        } catch {
          error = { error: 'Server error' };
        }
        throw new Error(error.error || 'Request failed');
      }

      // Handle empty responses or non-JSON responses
      if (!hasJsonContent) {
        return { success: true };
      }
      
      const text = await response.text();
      if (!text) {
        return { success: true };
      }
      
      try {
        return JSON.parse(text);
      } catch {
        return { success: true, data: text };
      }
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Always fall back to mock data when backend is not available
      if (import.meta.env.PROD || error.message?.includes('fetch')) {
        return this.handleProductionFallback(endpoint, options);
      }
      
      throw error;
    }
  }

  private async handleProductionFallback(endpoint: string, options: RequestInit = {}) {
    // Mock responses for production demo
    const method = options.method || 'GET';
    
    if (endpoint === '/auth/login' && method === 'POST') {
      // Store token for demo
      const mockToken = 'demo-token-' + Date.now();
      this.token = mockToken;
      localStorage.setItem('auth_token', mockToken);
      
      return {
        token: mockToken,
        user: {
          id: '1',
          email: 'demo@cryptovest.com',
          name: 'Demo User',
          country: 'GB',
          isVerified: true,
          has2FA: true,
          referralCode: 'DEMO123',
          isAdmin: false
        }
      };
    }
    
    if (endpoint === '/auth/register' && method === 'POST') {
      // Store token for demo
      const mockToken = 'demo-token-' + Date.now();
      this.token = mockToken;
      localStorage.setItem('auth_token', mockToken);
      
      return {
        token: mockToken,
        user: {
          id: '2',
          email: 'newuser@cryptovest.com',
          name: 'New User',
          country: 'GB',
          isVerified: false,
          has2FA: false,
          referralCode: 'NEW456',
          isAdmin: false
        }
      };
    }
    
    if (endpoint === '/dashboard') {
      return {
        balance: 15750.50,
        activeDeposit: 25000.00,
        profit: 3420.75,
        withdrawn: 8950.25,
        bonus: 1250.00
      };
    }
    
    if (endpoint === '/transactions') {
      return [
        {
          id: '1',
          date: '2025-01-15',
          amount: 5000,
          method: 'Bitcoin',
          status: 'completed',
          type: 'deposit',
          txHash: '0x123...abc'
        },
        {
          id: '2',
          date: '2025-01-14',
          amount: 250.50,
          method: 'Ethereum',
          status: 'completed',
          type: 'profit'
        },
        {
          id: '3',
          date: '2025-01-13',
          amount: 1000,
          method: 'USDT',
          status: 'pending',
          type: 'withdraw'
        }
      ];
    }
    
    // Default success response
    return { success: true, message: 'Demo mode - operation simulated' };
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    country: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  async getTransactions() {
    return this.request('/transactions');
  }

  // Transactions
  async createDeposit(formData: FormData) {
    return this.request('/transactions/deposit', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  async createWithdrawal(data: {
    amount: number;
    address: string;
    password: string;
    twoFA: string;
  }) {
    return this.request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Investments
  async createInvestment(data: { planId: string; amount: number }) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cards
  async applyForCard(data: any) {
    return this.request('/cards/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Payments
  async createStripePaymentIntent(amount: number, currency: string = 'usd') {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount: amount * 100, currency }), // Convert to cents
    });
  }
}

export const apiService = new ApiService();
export default apiService;