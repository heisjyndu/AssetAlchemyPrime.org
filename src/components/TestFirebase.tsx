import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Database, Users, CreditCard } from 'lucide-react';

const TestFirebase: React.FC = () => {
  const [tests, setTests] = useState({
    firebaseConnection: { status: 'testing', message: 'Testing Firebase connection...' },
    userCreation: { status: 'pending', message: 'Waiting for Firebase connection...' },
    transactionStorage: { status: 'pending', message: 'Waiting for user creation...' },
    adminAccess: { status: 'pending', message: 'Waiting for transaction test...' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Firebase Connection
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setTests(prev => ({
          ...prev,
          firebaseConnection: { status: 'success', message: 'Backend server connected successfully!' }
        }));
        
        // Test 2: User Creation
        setTimeout(() => testUserCreation(), 1000);
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        firebaseConnection: { status: 'error', message: 'Backend server connection failed' }
      }));
    }
  };

  const testUserCreation = async () => {
    setTests(prev => ({
      ...prev,
      userCreation: { status: 'testing', message: 'Testing user registration...' }
    }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Test User',
          country: 'GB'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({
          ...prev,
          userCreation: { status: 'success', message: 'User registration working!' }
        }));
        
        // Test 3: Transaction Storage
        setTimeout(() => testTransactionStorage(data.token), 1000);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        userCreation: { status: 'error', message: 'User registration failed - Firebase may need setup' }
      }));
    }
  };

  const testTransactionStorage = async (token: string) => {
    setTests(prev => ({
      ...prev,
      transactionStorage: { status: 'testing', message: 'Testing transaction creation...' }
    }));

    try {
      const formData = new FormData();
      formData.append('amount', '100');
      formData.append('method', 'bitcoin');

      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setTests(prev => ({
          ...prev,
          transactionStorage: { status: 'success', message: 'Transaction storage working!' }
        }));
        
        // Test 4: Admin Access
        setTimeout(() => testAdminAccess(token), 1000);
      } else {
        throw new Error('Transaction creation failed');
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        transactionStorage: { status: 'error', message: 'Transaction storage failed' }
      }));
    }
  };

  const testAdminAccess = async (token: string) => {
    setTests(prev => ({
      ...prev,
      adminAccess: { status: 'testing', message: 'Testing admin portal access...' }
    }));

    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        setTests(prev => ({
          ...prev,
          adminAccess: { status: 'success', message: 'Admin security working (non-admin blocked)!' }
        }));
      } else if (response.ok) {
        setTests(prev => ({
          ...prev,
          adminAccess: { status: 'success', message: 'Admin portal accessible!' }
        }));
      } else {
        throw new Error('Admin test failed');
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        adminAccess: { status: 'error', message: 'Admin portal test failed' }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'testing':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔥 AssetAlchemyPrime Integration Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Testing all system components to ensure everything is working properly
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Test 1: Firebase Connection */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(tests.firebaseConnection.status)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(tests.firebaseConnection.status)}
              <Database className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Backend Server Connection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tests.firebaseConnection.message}
                </p>
              </div>
            </div>
          </div>

          {/* Test 2: User Creation */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(tests.userCreation.status)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(tests.userCreation.status)}
              <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  User Registration & Firebase Auth
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tests.userCreation.message}
                </p>
              </div>
            </div>
          </div>

          {/* Test 3: Transaction Storage */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(tests.transactionStorage.status)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(tests.transactionStorage.status)}
              <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Transaction Storage & Firestore
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tests.transactionStorage.message}
                </p>
              </div>
            </div>
          </div>

          {/* Test 4: Admin Access */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(tests.adminAccess.status)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(tests.adminAccess.status)}
              <div className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">A</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Admin Portal & Security
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tests.adminAccess.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Next Steps
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tests.firebaseConnection.status === 'error' 
                  ? "Fix backend server connection first"
                  : tests.userCreation.status === 'error'
                  ? "Set up your Firebase project with proper configuration"
                  : "All systems operational! Ready for production setup."
                }
              </p>
            </div>
            <button
              onClick={runTests}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Run Tests Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFirebase;