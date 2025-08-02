const API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/api' 
  : '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
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