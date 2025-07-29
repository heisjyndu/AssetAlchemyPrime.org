import React from 'react';
import { Wallet, TrendingUp, ArrowDownLeft, Gift } from 'lucide-react';
import { Dashboard } from '../../types';

interface SummaryCardsProps {
  data: Dashboard;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'Balance',
      value: data.balance,
      icon: Wallet,
      gradient: 'from-blue-500 to-blue-600',
      change: '+12.5%'
    },
    {
      title: 'Active Deposit',
      value: data.activeDeposit,
      icon: TrendingUp,
      gradient: 'from-teal-500 to-teal-600',
      change: '+8.2%'
    },
    {
      title: 'Total Profit',
      value: data.profit,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      change: '+15.3%'
    },
    {
      title: 'Withdrawn',
      value: data.withdrawn,
      icon: ArrowDownLeft,
      gradient: 'from-purple-500 to-purple-600',
      change: '+5.7%'
    },
    {
      title: 'Bonus',
      value: data.bonus,
      icon: Gift,
      gradient: 'from-orange-500 to-orange-600',
      change: '+25.1%'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {card.change}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(card.value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;