import { User, Transaction, InvestmentPlan, Dashboard, Language } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  country: 'GB',
  isVerified: true,
  has2FA: true,
  referralCode: 'JD12345',
  referredBy: 'REF987'
};

export const mockDashboard: Dashboard = {
  balance: 15750.50,
  activeDeposit: 25000.00,
  profit: 3420.75,
  withdrawn: 8950.25,
  bonus: 1250.00
};

export const mockTransactions: Transaction[] = [
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
  },
  {
    id: '4',
    date: '2025-01-12',
    amount: 500,
    method: 'Referral',
    status: 'completed',
    type: 'bonus'
  }
];

export const investmentPlans: InvestmentPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    dailyRate: 0.015,
    minAmount: 100,
    maxAmount: 1000,
    duration: 7,
    features: ['1.5% Daily ROI', 'Basic Support', 'Mobile App Access']
  },
  {
    id: 'standard',
    name: 'Standard',
    dailyRate: 0.02,
    minAmount: 1000,
    maxAmount: 5000,
    duration: 7,
    features: ['2% Daily ROI', 'Priority Support', 'Advanced Analytics']
  },
  {
    id: 'advanced',
    name: 'Advanced',
    dailyRate: 0.025,
    minAmount: 5000,
    maxAmount: 15000,
    duration: 7,
    features: ['2.5% Daily ROI', 'VIP Support', 'Market Insights']
  },
  {
    id: 'business',
    name: 'Business',
    dailyRate: 0.04,
    minAmount: 15000,
    maxAmount: 50000,
    duration: 7,
    features: ['4% Daily ROI', 'Dedicated Manager', 'Custom Strategies']
  },
  {
    id: 'veteran',
    name: 'Veteran',
    dailyRate: 0.055,
    minAmount: 50000,
    maxAmount: 500000,
    duration: 7,
    features: ['5.5% Daily ROI', 'White Glove Service', 'Exclusive Events']
  }
];

export const blockedCountries = ['US', 'CA', 'CN', 'KP', 'IR', 'SY'];

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false }
];