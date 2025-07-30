import React, { useState, useEffect } from 'react';
import { AlertTriangle, Globe, CheckCircle } from 'lucide-react';
import { blockedCountries } from '../data/mockData';

interface ComplianceGateProps {
  onCountryVerified: (country: string) => void;
}

const ComplianceGate: React.FC<ComplianceGateProps> = ({ onCountryVerified }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  const countries = [
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'CN', name: 'China' },
    { code: 'KP', name: 'North Korea' },
    { code: 'IR', name: 'Iran' }
  ];

  useEffect(() => {
    setIsBlocked(blockedCountries.includes(selectedCountry));
  }, [selectedCountry]);

  const handleContinue = () => {
    if (!isBlocked && selectedCountry && acknowledged) {
      onCountryVerified(selectedCountry);
    }
  };

  // Auto-select a safe country for demo purposes
  React.useEffect(() => {
    if (!selectedCountry) {
      setSelectedCountry('GB'); // Default to UK for demo
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full w-16 h-16 mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">
            CryptoVest
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to our investment platform
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Please select your country of residence
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCountry && (
            <div className={`p-4 rounded-lg border ${
              isBlocked
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-start space-x-3">
                {isBlocked ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    isBlocked
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-green-800 dark:text-green-200'
                  }`}>
                    {isBlocked ? 'Access Restricted' : 'Access Granted'}
                  </h3>
                  <p className={`text-sm ${
                    isBlocked
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {isBlocked
                      ? 'Unfortunately, our services are not available in your jurisdiction due to regulatory restrictions.'
                      : 'Great! Our services are available in your country. You can proceed to create an account.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isBlocked && selectedCountry && (
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I acknowledge that I am a resident of {countries.find(c => c.code === selectedCountry)?.name} and 
                  I understand the risks associated with cryptocurrency investments. I confirm that I am at least 18 years old.
                </span>
              </label>

              <button
                onClick={handleContinue}
                disabled={!acknowledged}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Continue to Platform
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceGate;