import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { InvestmentPlan } from '../../types';

interface PlanSelectorProps {
  plans: InvestmentPlan[];
  selectedPlan: InvestmentPlan | null;
  onPlanSelect: (plan: InvestmentPlan) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, selectedPlan, onPlanSelect }) => {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const formatPercentage = (rate: number) => {
    return (rate * 100).toFixed(1) + '%';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Investment Plans
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const isHovered = hoveredPlan === plan.id;
          const isPopular = plan.id === 'business';
          
          return (
            <div
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 ${
                isSelected || isHovered ? 'transform scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => onPlanSelect(plan)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : isHovered
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}>
                <div className="text-center mb-4">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h4>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                    {formatPercentage(plan.dailyRate)}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Daily Returns</p>
                </div>
                
                <div className="space-y-2 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Min:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(plan.minAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Max:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(plan.maxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.duration} days
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 sm:mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                  {isSelected ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelector;