import React from 'react';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 dark:text-green-400';
      case 'withdraw':
        return 'text-red-600 dark:text-red-400';
      case 'profit':
        return 'text-blue-600 dark:text-blue-400';
      case 'bonus':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Method
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs sm:text-sm font-medium capitalize ${getTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {transaction.method}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                  {transaction.txHash && (
                    <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1">
                      <ExternalLink className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;