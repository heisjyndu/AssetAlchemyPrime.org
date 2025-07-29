import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { InvestmentPlan } from '../../types';

interface InvestmentCalculatorProps {
  selectedPlan: InvestmentPlan | null;
  onInvest: (amount: number) => void;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ selectedPlan, onInvest }) => {
  const [amount, setAmount] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (selectedPlan && amount > 0) {
      const calculatedProfit = amount * selectedPlan.dailyRate * selectedPlan.duration;
      setProfit(calculatedProfit);
      setTotal(amount + calculatedProfit);
    } else {
      setProfit(0);
      setTotal(0);
    }
  }, [amount, selectedPlan]);

  const handleAmountChange = (value: number) => {
    if (selectedPlan) {
      const clampedValue = Math.max(
        selectedPlan.minAmount,
        Math.min(selectedPlan.maxAmount, value)
      );
      setAmount(clampedValue);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (!selectedPlan) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select a Plan to Calculate
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose an investment plan above to see potential returns
          </p>
        </div>
      </div>
    );
  }

  const isValidAmount = amount >= selectedPlan.minAmount && amount <= selectedPlan.maxAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Investment Calculator - {selectedPlan.name} Plan
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Investment Amount
          </label>
          
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={`${selectedPlan.minAmount} - ${selectedPlan.maxAmount}`}
              />
            </div>
            
            <div className="w-full">
              <input
                type="range"
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{formatCurrency(selectedPlan.minAmount)}</span>
                <span>{formatCurrency(selectedPlan.maxAmount)}</span>
              </div>
            </div>
          </div>

          {!isValidAmount && amount > 0 && (
            <p className="text-red-500 text-sm mt-2">
              Amount must be between {formatCurrency(selectedPlan.minAmount)} and {formatCurrency(selectedPlan.maxAmount)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Investment</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(amount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Daily Rate ({(selectedPlan.dailyRate * 100).toFixed(1)}%)
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(amount * selectedPlan.dailyRate)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Profit ({selectedPlan.duration} days)
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(profit)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total Return</span>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onInvest(amount)}
            disabled={!isValidAmount || amount === 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              isValidAmount && amount > 0
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Start Investment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;