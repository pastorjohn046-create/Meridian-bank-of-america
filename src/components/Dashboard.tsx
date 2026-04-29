import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard, X, Send, ArrowLeftRight, History } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

const chartData = [
  { name: 'Mon', value: 42000 },
  { name: 'Tue', value: 45000 },
  { name: 'Wed', value: 43000 },
  { name: 'Thu', value: 48000 },
  { name: 'Fri', value: 52000 },
  { name: 'Sat', value: 51000 },
  { name: 'Sun', value: 57000 },
];

import { Asset, Transaction } from '../types';

import { api } from '../services/api';

interface DashboardProps {
  user: any;
  onUpdateUser?: (user: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        // Also sync user data when dashboard mounts to ensure latest balance
        const updatedUser = await api.syncCurrentUser(user.id);
        if (updatedUser && onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        
        const data = await api.getTransactions(user.id);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const totalBalance = Number(user?.balance || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-20 space-y-8"
    >
      {/* Header Greeting */}
      <div className="pt-2 px-1 flex justify-between items-end">
        <div>
          <h2 className="font-serif text-3xl font-light tracking-tight italic">Welcome back,</h2>
          <p className="text-xl font-bold tracking-tight text-zinc-100">{user?.name?.split(' ')[0] || 'Member'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Private Tier</p>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-medium text-emerald-500">Elite Status</p>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card - The primary anchor */}
        <section className={cn(
          "p-8 rounded-[3rem] text-white flex flex-col justify-between min-h-[220px] relative overflow-hidden group",
          "bg-premium-gradient shadow-2xl shadow-red-900/40"
        )}>
          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-[0.25em]">Wealth Overview</p>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-light text-zinc-300">$</span>
                <h2 className="text-4xl font-black tracking-tighter">
                  {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
              <CreditCard size={24} className="text-white" />
            </div>
          </div>
          
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                <ArrowUpRight size={12} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">+12.5%</span>
              </div>
              <p className="text-[10px] text-zinc-300/60 font-medium uppercase tracking-widest">Monthly Growth</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-zinc-400 uppercase tracking-widest mb-1">Account No</p>
              <p className="font-mono text-xs tracking-widest text-zinc-200">•••• 8829</p>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Send, label: 'Transact', color: 'bg-zinc-100 text-black', onClick: () => navigate('/send') },
            { icon: ArrowLeftRight, label: 'Portfolio', color: 'bg-zinc-800 text-white', onClick: () => navigate('/wallet') },
            { icon: ArrowDownLeft, label: 'Redeem', color: 'bg-zinc-800 text-white', onClick: () => navigate('/withdraw') },
            { icon: Plus, label: 'Secure', color: 'bg-premium-gradient text-white', onClick: () => navigate('/signup') },
          ].map((action, i) => (
            <button key={i} onClick={action.onClick} className={cn(
              "p-5 rounded-[2rem] flex flex-col justify-between items-start transition-all active:scale-95 text-left h-[105px]",
              action.color
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                action.color.includes('zinc-800') ? "bg-white/5" : "bg-black/5"
              )}>
                <action.icon size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Service: WHSBC Concierge */}
      <section className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 shadow-xl">
            <Send size={28} className="translate-x-0.5 -translate-y-0.5 rotate-12" />
          </div>
          <div>
            <h4 className="font-serif text-lg italic font-light tracking-wide">Elite Concierge</h4>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">24/7 Priority Support is available for your account.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/support')}
          className="mt-5 w-full py-3 bg-zinc-100 text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
        >
          Connect with Advisor
        </button>
      </section>

      {/* Investment & Insights Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Performance Chart */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl italic font-light tracking-wide">Portfolio Growth</h3>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Insight</span>
          </div>
          <div className="glass-card p-6 rounded-[2.5rem] h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#db0011" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#db0011" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#db0011" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #333', 
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontFamily: 'Inter'
                  }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Transaction Ledger */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl italic font-light tracking-wide">Secure Journal</h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-[10px] font-bold text-red-500 uppercase tracking-widest"
            >
              Full Statement
            </button>
          </div>
          
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.slice(0, 4).map((tx) => (
                <Link 
                  key={tx.id} 
                  to={`/transaction/${tx.id}`}
                  className="glass-card flex items-center justify-between p-4 rounded-[1.5rem] transition-all hover:bg-white/5 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === 'receive' ? "bg-emerald-500/10 text-emerald-500" : 
                      tx.type === 'send' ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"
                    )}>
                      {tx.type === 'receive' ? <ArrowDownLeft size={16} /> : 
                       tx.type === 'send' ? <ArrowUpRight size={16} /> : <ArrowLeftRight size={16} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold tracking-tight text-white">{tx.counterparty || tx.type.toUpperCase()}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.timestamp), 'MMM dd | HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold tracking-tight",
                      tx.type === 'receive' ? "text-emerald-500" : "text-white"
                    )}>
                      {tx.type === 'receive' ? '+' : '-'}${Math.abs(tx.fiatAmount || tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <div className={cn("w-1 h-1 rounded-full", tx.status === 'completed' ? "bg-emerald-500" : "bg-amber-500")} />
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{tx.status}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-12 rounded-[2.5rem]">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-3">
                  <History size={24} />
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Waiting for activity</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Market Ticker Sim - Prestige Style */}
      <section className="glass-card p-6 rounded-[2.5rem] space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Global Markets</h4>
          <div className="flex items-center gap-1 text-emerald-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold tracking-widest uppercase">Live</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          {[
            { label: 'Gold', value: '2,342.10', change: '+1.2%' },
            { label: 'Silver', value: '28.45', change: '-0.3%' },
            { label: 'Oil', value: '82.15', change: '+2.1%' },
          ].map((m, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{m.label}</p>
              <p className="text-sm font-bold text-white">{m.value}</p>
              <p className={cn("text-[9px] font-bold", m.change.includes('+') ? "text-emerald-500" : "text-red-500")}>{m.change}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
