import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Copy,
  CreditCard,
  Settings,
  HelpCircle,
  Headset,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

import { api } from '../services/api';

interface ProfileProps {
  isAdmin?: boolean;
  user: any;
  onLogout: () => void;
  onOpenChat: () => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ isAdmin, user, onLogout, onOpenChat }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'guest@meridian.com';
  const userSeed = userName.split(' ')[0];

  const accountNumber = user?.accountNumber || '8822 4411 0099';
  const sortCode = user?.sortCode || '20-44-99';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [newAccountNumber, setNewAccountNumber] = React.useState(accountNumber);
  const [newSortCode, setNewSortCode] = React.useState(sortCode);

  const handleUpdateDetails = async () => {
    try {
      const result = await api.updateUserDetails(user.id, {
        accountNumber: newAccountNumber,
        sortCode: newSortCode
      });
      
      if (result.status === 'ok') {
        setIsEditing(false);
        toast.success('Account details updated live');
      }
    } catch (error) {
      toast.error('Failed to update details');
    }
  };

  const menuItems = [
    ...(isAdmin ? [{ icon: ShieldAlert, label: 'System Administration', sub: 'Admin Portal Access', action: () => navigate('/admin') }] : []),
    { icon: Headset, label: 'Customer Care', sub: '24/7 Priority Support', action: onOpenChat },
    { icon: Shield, label: 'Security & Privacy', sub: 'PIN, Biometrics, 2FA' },
    { icon: Bell, label: 'Notifications', sub: 'Alerts, Marketing, Push' },
    { icon: CreditCard, label: 'Linked Accounts', sub: 'Banks, Cards, Wallets' },
    { icon: Settings, label: 'App Settings', sub: 'Theme, Language, Region' },
    { icon: HelpCircle, label: 'Support & FAQ', sub: 'Help center, Contact us' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10 space-y-5"
    >
      <header className="space-y-0.5">
        <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Customer Dashboard</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account Details & Settings</p>
      </header>

      {/* Profile Card */}
      <div className={cn(
        "p-5 rounded-[2rem] flex flex-col items-center text-center space-y-3 transition-colors",
        theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-gray-100 shadow-sm"
      )}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-600 p-1">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userSeed}`} 
              alt="User" 
              className="w-full h-full rounded-full bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{userName}</h3>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{isAdmin ? 'System Administrator' : 'Private Tier Member'}</p>
          <p className={cn("text-sm font-bold mt-1 transition-colors", theme === 'dark' ? "text-emerald-400" : "text-emerald-600")}>
            ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Account Details */}
      <div className={cn("rounded-2xl p-4 space-y-3", theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800" : "bg-gray-50")}>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5 flex-1">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Account Number</p>
            {isEditing ? (
              <input 
                type="text"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                className={cn(
                  "w-full px-2 py-1 rounded-lg text-[11px] font-mono font-bold outline-none border",
                  theme === 'dark' ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-white border-gray-200 text-gray-900"
                )}
              />
            ) : (
              <p className={cn("text-[11px] font-mono font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{accountNumber}</p>
            )}
          </div>
          <div className="flex gap-1">
            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className={cn("p-2 rounded-lg transition-colors", theme === 'dark' ? "bg-zinc-800 text-indigo-400" : "bg-white text-indigo-500")}
              >
                <Settings size={14} />
              </button>
            )}
            {!isEditing && (
              <button 
                onClick={() => copyToClipboard(accountNumber, 'Account Number')}
                className={cn("p-2 rounded-lg transition-colors", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-white text-gray-400")}
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5 flex-1">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sort Code</p>
            {isEditing ? (
              <input 
                type="text"
                value={newSortCode}
                onChange={(e) => setNewSortCode(e.target.value)}
                className={cn(
                  "w-full px-2 py-1 rounded-lg text-[11px] font-mono font-bold outline-none border",
                  theme === 'dark' ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-white border-gray-200 text-gray-900"
                )}
              />
            ) : (
              <p className={cn("text-[11px] font-mono font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{sortCode}</p>
            )}
          </div>
          {!isEditing && (
            <button 
              onClick={() => copyToClipboard(sortCode, 'Sort Code')}
              className={cn("p-2 rounded-lg transition-colors", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-white text-gray-400")}
            >
              <Copy size={14} />
            </button>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleUpdateDetails}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              Save Changes
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className={cn(
                "flex-1 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all",
                theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-200 text-gray-600"
              )}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Preferences</h4>
        <div className={cn("rounded-2xl overflow-hidden border", theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100")}>
          {menuItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => item.action?.()}
              className={cn(
                "w-full flex items-center justify-between p-3.5 transition-colors border-b last:border-0",
                theme === 'dark' ? "border-zinc-800 hover:bg-zinc-800/50" : "border-gray-50 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                  theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-50 text-gray-500"
                )}>
                  <item.icon size={16} />
                </div>
                <div className="text-left">
                  <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{item.label}</p>
                  <p className="text-[9px] text-gray-500 font-medium">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          toast.info('Logging out...');
          onLogout();
          navigate('/login');
        }}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
          theme === 'dark' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-100"
        )}
      >
        <LogOut size={16} />
        Log Out
      </button>

      <p className="text-center text-[8px] text-gray-500 font-bold uppercase tracking-widest pt-2">
        Meridian Wealth v2.4.0 • Secure Session
      </p>
    </motion.div>
  );
};
