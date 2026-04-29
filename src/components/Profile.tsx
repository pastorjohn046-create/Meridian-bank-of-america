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
  const userEmail = user?.email || 'guest@whsbc.com';
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
      className="px-4 pb-20 space-y-8"
    >
      <header className="pt-2 px-1">
        <h2 className="font-serif text-3xl font-light italic tracking-tight mb-1">Elite Profile</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em]">Managed Concierge Account</p>
      </header>

      {/* Elite Membership Card */}
      <div className="glass-card p-8 rounded-[3rem] text-center space-y-5 bg-dark-luxury relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-600/10 rounded-full blur-[80px]" />
        
        <div className="relative flex justify-center">
          <div className="relative group/avatar">
            <div className="w-24 h-24 rounded-full bg-premium-gradient p-1 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userSeed}`} 
                alt="User" 
                className="w-full h-full rounded-full bg-zinc-950 border-4 border-zinc-950"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-zinc-950 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-1 relative z-10">
          <h3 className="font-serif text-2xl italic font-light text-white">{userName}</h3>
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.3em]">{isAdmin ? 'Senior Administrator' : 'Private Wealth Member'}</p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Tier</p>
            <p className="text-[11px] font-bold text-white uppercase tracking-tighter">Diamond</p>
          </div>
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Region</p>
            <p className="text-[11px] font-bold text-white uppercase tracking-tighter">Infinite</p>
          </div>
        </div>
      </div>

      {/* Account Details & Coordination */}
      <section className="space-y-4">
        <h4 className="font-serif text-xl italic font-light tracking-wide px-1">Coordinated Details</h4>
        <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
          <div className="flex justify-between items-center group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">WHSBC Account Number</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-white font-mono text-sm outline-none w-full"
                />
              ) : (
                <p className="text-sm font-mono font-bold text-white tracking-widest">{accountNumber}</p>
              )}
            </div>
            <div className="flex gap-2">
              {isAdmin && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="p-3 bg-zinc-900/50 rounded-2xl text-red-500">
                  <Settings size={18} />
                </button>
              )}
              <button onClick={() => copyToClipboard(accountNumber, 'Account Number')} className="p-3 bg-zinc-900/50 rounded-2xl text-zinc-500 hover:text-white transition-colors">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="h-px bg-zinc-800/50 w-full" />

          <div className="flex justify-between items-center group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Secure Sort Code</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={newSortCode}
                  onChange={(e) => setNewSortCode(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-white font-mono text-sm outline-none w-full"
                />
              ) : (
                <p className="text-sm font-mono font-bold text-white tracking-widest">{sortCode}</p>
              )}
            </div>
            <button onClick={() => copyToClipboard(sortCode, 'Sort Code')} className="p-3 bg-zinc-900/50 rounded-2xl text-zinc-500 hover:text-white transition-colors">
              <Copy size={18} />
            </button>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button onClick={handleUpdateDetails} className="flex-1 py-4 bg-zinc-100 text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest">Commit Changes</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest">Abort</button>
            </div>
          )}
        </div>
      </section>

      {/* Concierge Menu */}
      <section className="space-y-4">
        <h4 className="font-serif text-xl italic font-light tracking-wide px-1">Management Hub</h4>
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => item.action?.()}
              className="glass-card w-full flex items-center justify-between p-5 rounded-[2rem] transition-all hover:bg-white/5 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-500 border border-zinc-900 group-hover:text-red-500 transition-colors">
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-700" />
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4 pt-4">
        <button 
          onClick={() => {
            toast.info('Securely terminating session...');
            onLogout();
            navigate('/login');
          }}
          className="w-full py-5 bg-red-950/20 text-red-500 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.25em] border border-red-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-red-950/40"
        >
          <LogOut size={16} />
          Terminate Session
        </button>

        <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
          WHSBC BANK ELITE • SECURE ENCRYPTED ACCESS
        </p>
      </div>
    </motion.div>
  );
};
