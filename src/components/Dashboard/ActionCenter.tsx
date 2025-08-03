import React from 'react';
import { Plus, Minus, RotateCcw, CreditCard } from 'lucide-react';

interface ActionCenterProps {
  onAction: (action: string) => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'deposit',
      label: 'Deposit',
      icon: Plus,
      gradient: 'from-green-500 to-green-600',
      description: 'Crypto deposit'
    },
    {
      id: 'deposit-card',
      label: 'Card Deposit',
      icon: CreditCard,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Instant card payment'
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: Minus,
      gradient: 'from-red-500 to-red-600',
      description: 'Withdraw your earnings'
    },
    {
      id: 'reinvest',
      label: 'Reinvest',
      icon: RotateCcw,
      gradient: 'from-purple-500 to-purple-600',
      description: 'Reinvest your profits'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="flex flex-col items-center p-3 sm:p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-200 group hover:shadow-md"
            >
              <div className={`p-2 sm:p-4 rounded-full bg-gradient-to-r ${action.gradient} mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
                {action.label}
              </h4>
              
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onAction('card')}
          className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Apply for Crypto Card</span>
        </button>
      </div>
    </div>
  );
};

export default ActionCenter;