import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export const BottomNav: React.FC = () => {
  const { theme } = useTheme();
  const tabs = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'wallet', path: '/wallet', icon: Wallet, label: 'Wallet' },
    { id: 'exchange', path: '/exchange', icon: ArrowLeftRight, label: 'Swap' },
    { id: 'market', path: '/market', icon: BarChart3, label: 'Market' },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t px-4 py-2 flex justify-between items-center z-50 max-w-md mx-auto transition-colors duration-300",
      theme === 'dark' ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-gray-100"
    )}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className={cn(
                "flex flex-col items-center gap-0.5 transition-all duration-200",
                isActive 
                  ? (theme === 'dark' ? "text-hsbc-red scale-105" : "text-hsbc-red scale-105") 
                  : (theme === 'dark' ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-600")
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-widest">{tab.label}</span>
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
