import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard, X, Send, ArrowLeftRight } from 'lucide-react';
import { MOCK_ASSETS, MOCK_TRANSACTIONS } from '../mockData';
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

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [isSendOpen, setIsSendOpen] = useState(false);
  const totalBalance = MOCK_ASSETS.reduce((acc, asset) => acc + asset.fiatValue, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-16 space-y-4"
    >
      {/* Balance Section */}
      <section className="space-y-0.5">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total Balance</p>
        <div className="flex items-baseline gap-2">
          <h2 className={cn("text-2xl font-bold tracking-tight transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">
            <ArrowUpRight size={10} />
            +12.5%
          </span>
        </div>
      </section>

      {/* Chart Section - Ultra compact */}
      <div className="h-20 w-full -mx-5 px-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={theme === 'dark' ? 0.4 : 0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                padding: '8px' 
              }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: theme === 'dark' ? '#f4f4f5' : '#18181b', fontSize: '10px', fontWeight: 'bold' }}
            />
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

      {/* Quick Actions - Ultra compact */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Plus, label: 'Add', color: theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600', onClick: () => {} },
          { icon: ArrowUpRight, label: 'Send', color: theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600', onClick: () => setIsSendOpen(true) },
          { icon: ArrowDownLeft, label: 'Request', color: theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600', onClick: () => {} },
          { icon: CreditCard, label: 'Cards', color: theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600', onClick: () => {} },
        ].map((action, i) => (
          <button key={i} onClick={action.onClick} className="flex flex-col items-center gap-1">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95", action.color)}>
              <action.icon size={18} />
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions - Ultra compact */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", theme === 'dark' ? "text-zinc-400" : "text-gray-900")}>Recent Activity</h3>
          <button className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">See All</button>
        </div>
        <div className="space-y-1.5">
          {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
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
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">{format(tx.timestamp, 'MMM dd, HH:mm')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-[11px] font-bold",
                  tx.type === 'receive' ? "text-emerald-500" : (theme === 'dark' ? "text-zinc-100" : "text-gray-900")
                )}>
                  {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset.split(' ')[0]}
                </p>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">${tx.fiatAmount.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Send Modal */}
      <AnimatePresence>
        {isSendOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSendOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 rounded-t-[2.5rem] p-6 z-50 space-y-6 max-w-md mx-auto transition-colors duration-300",
                theme === 'dark' ? "bg-zinc-900" : "bg-white"
              )}
            >
              <div className="flex justify-between items-center">
                <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Send Money</h3>
                <button onClick={() => setIsSendOpen(false)} className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600")}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className={cn("p-3.5 rounded-2xl space-y-0.5", theme === 'dark' ? "bg-zinc-800" : "bg-gray-50")}>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Recipient</p>
                  <input 
                    type="text" 
                    placeholder="Username or Wallet Address"
                    className={cn("w-full bg-transparent font-bold outline-none text-sm", theme === 'dark' ? "text-zinc-100 placeholder:text-zinc-600" : "text-gray-900 placeholder:text-gray-400")}
                  />
                </div>
                <div className={cn("p-3.5 rounded-2xl space-y-0.5", theme === 'dark' ? "bg-zinc-800" : "bg-gray-50")}>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Amount</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xl font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className={cn("w-full bg-transparent text-xl font-bold outline-none", theme === 'dark' ? "text-zinc-100 placeholder:text-zinc-600" : "text-gray-900 placeholder:text-gray-400")}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/notify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: 'Transfer Successful',
                        message: 'You have successfully sent funds.',
                        type: 'send',
                        amount: 100,
                        asset: 'USD'
                      })
                    });
                    setIsSendOpen(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Send size={18} />
                Confirm Transfer
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
