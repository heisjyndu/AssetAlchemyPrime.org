import React, { useState, useEffect } from 'react';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ComplianceGate from './components/ComplianceGate';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import SummaryCards from './components/Dashboard/SummaryCards';
import ActionCenter from './components/Dashboard/ActionCenter';
import TransactionTable from './components/Dashboard/TransactionTable';
import PlanSelector from './components/Investment/PlanSelector';
import InvestmentCalculator from './components/Investment/InvestmentCalculator';
import DepositModal from './components/Modals/DepositModal';
import WithdrawModal from './components/Modals/WithdrawModal';
import CardApplicationModal from './components/Modals/CardApplicationModal';
import StripeDepositModal from './components/Modals/StripeDepositModal';
import { useTheme } from './hooks/useTheme';
import { useAuthProvider } from './hooks/useAuth';
import { apiService } from './services/api';
import { 
  mockUser, 
  investmentPlans 
} from './data/mockData';
import { InvestmentPlan } from './types';

function App() {
  const { isDark } = useTheme();
  const auth = useAuthProvider();
  const [isCountryVerified, setIsCountryVerified] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userCountry, setUserCountry] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'crypto' | 'card'>('crypto');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (auth.isAuthenticated && isCountryVerified) {
      loadDashboardData();
      loadTransactions();
    }
  }, [auth.isAuthenticated, isCountryVerified]);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await apiService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };
  const handleCountryVerified = (country: string) => {
    setUserCountry(country);
    setIsCountryVerified(true);
    if (!auth.isAuthenticated) {
      setShowAuth(true);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsCountryVerified(false);
    setShowAuth(false);
    setUserCountry('');
    setActiveTab('dashboard');
    setDashboardData(null);
    setTransactions([]);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'deposit':
        // Show method selection or directly open crypto modal
        setDepositMethod('crypto');
        setShowDepositModal(true);
        break;
      case 'deposit-card':
        setDepositMethod('card');
        setShowStripeModal(true);
        break;
      case 'withdraw':
        setShowWithdrawModal(true);
        break;
      case 'reinvest':
        setActiveTab('invest');
        break;
      case 'card':
        setShowCardModal(true);
        break;
    }
  };

  const handleStripeSuccess = async (amount: number) => {
    await loadDashboardData();
    await loadTransactions();
    // Show success notification
    if (import.meta.env.PROD) {
      alert(`Demo: Stripe payment of $${amount} simulated successfully!`);
    }
  };

  const handleDeposit = async (amount: number, method: string, receipt: File | null) => {
    try {
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('method', method);
      if (receipt) {
        formData.append('receipt', receipt);
      }
      
      await apiService.createDeposit(formData);
      await loadTransactions();
      if (import.meta.env.PROD) {
        alert(`Demo: Deposit of $${amount} via ${method} submitted successfully!`);
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      if (import.meta.env.PROD) {
        alert('Demo: Deposit submitted successfully!');
      }
    }
  };

  const handleWithdraw = async (amount: number, address: string, password: string, twoFA: string) => {
    try {
      await apiService.createWithdrawal({ amount, address, password, twoFA });
      await loadTransactions();
      if (import.meta.env.PROD) {
        alert(`Demo: Withdrawal of $${amount} submitted successfully!`);
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
      if (import.meta.env.PROD) {
        alert('Demo: Withdrawal submitted successfully!');
      }
    }
  };

  const handleCardApplication = async (data: any) => {
    try {
      await apiService.applyForCard(data);
      if (import.meta.env.PROD) {
        alert(`Demo: ${data.cardType} card application submitted successfully!`);
      }
    } catch (error) {
      console.error('Card application failed:', error);
      if (import.meta.env.PROD) {
        alert('Demo: Card application submitted successfully!');
      }
    }
  };

  const handleInvestment = async (amount: number) => {
    if (!selectedPlan) return;
    
    try {
      await apiService.createInvestment({ planId: selectedPlan.id, amount });
      await loadDashboardData();
      await loadTransactions();
      if (import.meta.env.PROD) {
        alert(`Demo: Investment of $${amount} in ${selectedPlan.name} plan created successfully!`);
      }
    } catch (error) {
      console.error('Investment failed:', error);
      if (import.meta.env.PROD) {
        alert('Demo: Investment created successfully!');
      }
    }
  };

  if (!isCountryVerified) {
    return <ComplianceGate onCountryVerified={handleCountryVerified} />;
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm
            onLogin={async (email, password) => {
              await auth.login(email, password);
              setShowAuth(false);
            }}
            onSwitchToRegister={() => setAuthMode('register')}
            isLoading={auth.isLoading}
          />
        ) : (
          <RegisterForm
            onRegister={async (userData) => {
              await auth.register(userData);
              setShowAuth(false);
            }}
            onSwitchToLogin={() => setAuthMode('login')}
            isLoading={auth.isLoading}
          />
        )}
      </div>
    );
  }

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (!dashboardData) {
          return (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <SummaryCards data={dashboardData} />
            <ActionCenter onAction={handleAction} />
            <TransactionTable transactions={transactions} />
          </div>
        );
      case 'invest':
        return (
          <div className="space-y-6">
            <PlanSelector
              plans={investmentPlans}
              selectedPlan={selectedPlan}
              onPlanSelect={setSelectedPlan}
            />
            <InvestmentCalculator
              selectedPlan={selectedPlan}
              onInvest={handleInvestment}
            />
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-6">
            <TransactionTable transactions={transactions} />
          </div>
        );
      case 'cards':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Crypto Cards
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You don't have any active cards yet. Apply for a crypto card to start spending your digital assets.
            </p>
            <button
              onClick={() => setShowCardModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Apply for Card
            </button>
          </div>
        );
      case 'security':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of important activities</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'admin-overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12,458</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Volume</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.4M</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Investments</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8,742</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$450K</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This feature is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="lg:flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isAdmin={isAdmin}
        />
        
        <div className="flex-1 lg:ml-0">
          <Header user={auth.user || mockUser} onLogout={handleLogout} />
          
          <main className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />
      
      <StripeDepositModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        onSuccess={handleStripeSuccess}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        availableBalance={dashboardData?.balance || 0}
      />
      
      <CardApplicationModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onApply={handleCardApplication}
      />

      {/* Admin Toggle (for demo) */}
      <button
        onClick={() => setIsAdmin(!isAdmin)}
        className="fixed bottom-4 right-4 p-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title={`Switch to ${isAdmin ? 'User' : 'Admin'} View`}
      >
        {isAdmin ? '👤' : '⚙️'}
      </button>

      {/* Quick Card Deposit Button */}
      <button
        onClick={() => handleAction('deposit-card')}
        className="fixed bottom-20 right-4 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title="Quick Card Deposit"
      >
        💳
      </button>
    </div>
  );
}

export default App;