import React from 'react';
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowUpDown, 
  CreditCard, 
  Shield, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isAdmin }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invest', label: 'Invest', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const adminMenuItems = [
    { id: 'admin-overview', label: 'Overview', icon: BarChart3 },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <nav className="p-6">
        <div className="space-y-2">
          {isAdmin && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Admin Panel
              </h3>
            </div>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {!isAdmin && (
          <div className="mt-8 p-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Referral Program</h4>
            <p className="text-sm text-teal-100 mb-3">Earn 10% commission on referrals</p>
            <div className="text-xs bg-white/20 rounded px-2 py-1 font-mono">
              REF: JD12345
            </div>
          </div>
        )}
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;