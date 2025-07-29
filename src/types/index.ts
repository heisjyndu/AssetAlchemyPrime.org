export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  isVerified: boolean;
  has2FA: boolean;
  referralCode: string;
  referredBy?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'deposit' | 'withdraw' | 'profit' | 'bonus';
  txHash?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  dailyRate: number;
  minAmount: number;
  maxAmount: number;
  duration: number;
  features: string[];
}

export interface Dashboard {
  balance: number;
  activeDeposit: number;
  profit: number;
  withdrawn: number;
  bonus: number;
}

export interface CardApplication {
  id: string;
  name: string;
  address: string;
  cardType: 'virtual' | 'physical';
  status: 'pending' | 'approved' | 'shipped';
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}