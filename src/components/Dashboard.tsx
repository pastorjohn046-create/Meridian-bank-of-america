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
      className="px-5 pb-16 space-y-6"
    >
      {/* Balance Card - Premium Gradient */}
      <section className={cn(
        "p-6 rounded-[2.5rem] text-white space-y-4 shadow-2xl shadow-indigo-500/20",
        theme === 'dark' ? "bg-premium-gradient border border-zinc-800" : "bg-premium-gradient"
      )}>
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Available Balance</p>
            <h2 className="text-3xl font-bold tracking-tight">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
            <CreditCard size={20} className="text-gold" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <ArrowUpRight size={10} />
            +12.5%
          </span>
          <p className="text-[9px] text-zinc-500 font-medium">vs last month</p>
        </div>
      </section>

      {/* Quick Actions - Premium Style */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Send, label: 'Send', color: 'bg-indigo-600 text-white', onClick: () => navigate('/send') },
          { icon: ArrowDownLeft, label: 'Withdraw', color: 'bg-zinc-900 text-white', onClick: () => navigate('/withdraw') },
          { icon: Plus, label: 'Deposit', color: 'bg-gold-gradient text-white', onClick: () => navigate('/wallet') },
          { icon: ArrowLeftRight, label: 'Swap', color: 'bg-emerald-gradient text-white', onClick: () => navigate('/exchange') },
        ].map((action, i) => (
          <button key={i} onClick={action.onClick} className="flex flex-col items-center gap-2">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90", action.color)}>
              <action.icon size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <section className="space-y-3">
        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors px-1", theme === 'dark' ? "text-zinc-400" : "text-gray-900")}>Portfolio Performance</h3>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Transactions - Ultra compact */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", theme === 'dark' ? "text-zinc-400" : "text-gray-900")}>Recent Activity</h3>
          <button className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">See All</button>
        </div>
        <div className="space-y-1.5">
          {transactions.length > 0 ? (
            transactions.slice(0, 3).map((tx) => (
              <Link 
                key={tx.id} 
                to={`/transaction/${tx.id}`}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer block",
                  theme === 'dark' ? "bg-zinc-900/50 hover:bg-zinc-900" : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center",
                    tx.type === 'receive' ? "bg-emerald-500/10 text-emerald-500" : 
                    tx.type === 'send' ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"
                  )}>
                    {tx.type === 'receive' ? <ArrowDownLeft size={14} /> : 
                     tx.type === 'send' ? <ArrowUpRight size={14} /> : <ArrowLeftRight size={14} />}
                  </div>
                  <div>
                    <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{tx.counterparty || tx.type.toUpperCase()}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">{format(new Date(tx.timestamp), 'MMM dd, HH:mm')}</p>
                      {tx.status === 'pending' && (
                        <span className="text-[7px] font-bold uppercase px-1 bg-amber-500/10 text-amber-500 rounded">Pending</span>
                      )}
                      {tx.status === 'failed' && (
                        <span className="text-[7px] font-bold uppercase px-1 bg-red-500/10 text-red-500 rounded">Failed</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-[11px] font-bold",
                    tx.type === 'receive' ? "text-emerald-500" : (theme === 'dark' ? "text-zinc-100" : "text-gray-900")
                  )}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset?.split(' ')[0] || 'USD'}
                  </p>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">${(tx.fiatAmount || tx.amount).toFixed(2)}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className={cn(
              "flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed",
              theme === 'dark' ? "border-zinc-900 bg-zinc-900/20" : "border-gray-100 bg-gray-50/50"
            )}>
              <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400 mb-2">
                <History size={20} />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No recent activity</p>
              <p className="text-[8px] text-gray-400 mt-1">Your transactions will appear here</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};
