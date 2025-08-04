import React from 'react';
import React, { useState } from 'react';
import { Bell, Globe, Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            CryptoVest
          </h1>
          {import.meta.env.PROD && (
            <span className="hidden sm:inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              DEMO
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Globe className="w-4 h-4" />
              <span className="text-sm">{currentLanguage.code.toUpperCase()}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-sm">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
              <select
                value={currentLanguage.code}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
              >
                {supportedLanguages.slice(0, 5).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;