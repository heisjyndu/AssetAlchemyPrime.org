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
      description: 'Add funds to your account'
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
      gradient: 'from-blue-500 to-blue-600',
      description: 'Reinvest your profits'
    },
    {
      id: 'card',
      label: 'Get Card',
      icon: CreditCard,
      gradient: 'from-purple-500 to-purple-600',
      description: 'Apply for crypto card'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-200 group hover:shadow-md"
            >
              <div className={`p-4 rounded-full bg-gradient-to-r ${action.gradient} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.label}
              </h4>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionCenter;