import React, { useState, useEffect } from 'react';
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
import { useTheme } from './hooks/useTheme';
import { 
  mockUser, 
  mockDashboard, 
  mockTransactions, 
  investmentPlans 
} from './data/mockData';
import { InvestmentPlan } from './types';

function App() {
  const { isDark } = useTheme();
  const [isCountryVerified, setIsCountryVerified] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleCountryVerified = (country: string) => {
    setUserCountry(country);
    setIsCountryVerified(true);
  };

  const handleLogout = () => {
    setIsCountryVerified(false);
    setUserCountry('');
    setActiveTab('dashboard');
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'deposit':
        setShowDepositModal(true);
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

  const handleDeposit = (amount: number, method: string, receipt: File | null) => {
    console.log('Deposit:', { amount, method, receipt });
    // Handle deposit logic here
  };

  const handleWithdraw = (amount: number, address: string, password: string, twoFA: string) => {
    console.log('Withdraw:', { amount, address, password, twoFA });
    // Handle withdrawal logic here
  };

  const handleCardApplication = (data: any) => {
    console.log('Card Application:', data);
    // Handle card application logic here
  };

  const handleInvestment = (amount: number) => {
    console.log('Investment:', { amount, plan: selectedPlan });
    // Handle investment logic here
  };

  if (!isCountryVerified) {
    return <ComplianceGate onCountryVerified={handleCountryVerified} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SummaryCards data={mockDashboard} />
            <ActionCenter onAction={handleAction} />
            <TransactionTable transactions={mockTransactions} />
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
            <TransactionTable transactions={mockTransactions} />
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
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isAdmin={isAdmin}
        />
        
        <div className="flex-1">
          <Header user={mockUser} onLogout={handleLogout} />
          
          <main className="p-6">
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
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        availableBalance={mockDashboard.balance}
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
    </div>
  );
}

export default App;