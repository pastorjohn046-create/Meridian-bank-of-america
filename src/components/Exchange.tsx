import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, Info, Zap } from 'lucide-react';
import { MOCK_ASSETS } from '../mockData';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

import { api } from '../services/api';

interface ExchangeProps {
  user: any;
}

export const ExchangeScreen: React.FC<ExchangeProps> = ({ user }) => {
  const { theme } = useTheme();
  const [fromAsset, setFromAsset] = useState(MOCK_ASSETS[0]);
  const [toAsset, setToAsset] = useState(MOCK_ASSETS[1]);
  const [amount, setAmount] = useState('');

  const handleSwap = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-5 pb-16 space-y-4"
    >
      <header className="space-y-0.5">
        <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Swap Assets</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Instant Exchange</p>
      </header>

      <div className="space-y-1 relative">
        {/* From Section */}
        <div className={cn("p-4 rounded-2xl space-y-2", theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800" : "bg-gray-50")}>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">From</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Bal: {fromAsset.balance}</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn("bg-transparent text-xl font-bold outline-none w-1/2", theme === 'dark' ? "text-zinc-100 placeholder:text-zinc-700" : "text-gray-900 placeholder:text-gray-400")}
            />
            <button className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-sm transition-colors", theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-white border border-gray-100")}>
              <div className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: fromAsset.color }}>
                {fromAsset.symbol[0]}
              </div>
              <span className="font-bold text-[10px]">{fromAsset.symbol}</span>
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <button 
          onClick={handleSwap}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-xl shadow-lg flex items-center justify-center text-indigo-500 z-10 hover:scale-110 active:scale-90 transition-all",
            theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-100"
          )}
        >
          <ArrowUpDown size={16} />
        </button>

        {/* To Section */}
        <div className={cn("p-4 rounded-2xl space-y-2", theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800" : "bg-gray-50")}>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">To</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Bal: {toAsset.balance}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className={cn("text-xl font-bold", theme === 'dark' ? "text-zinc-600" : "text-gray-400")}>
              {amount ? (parseFloat(amount) * 0.000016).toFixed(6) : '0.00'}
            </div>
            <button className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-sm transition-colors", theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-white border border-gray-100")}>
              <div className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: toAsset.color }}>
                {toAsset.symbol[0]}
              </div>
              <span className="font-bold text-[10px]">{toAsset.symbol}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className={cn("p-3 rounded-xl space-y-1.5", theme === 'dark' ? "bg-indigo-500/10" : "bg-indigo-50")}>
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-indigo-500 font-bold flex items-center gap-1 uppercase tracking-widest">
            <Info size={10} /> Rate
          </span>
          <span className={cn("font-bold", theme === 'dark' ? "text-indigo-300" : "text-indigo-900")}>1 {fromAsset.symbol} = 0.000016 {toAsset.symbol}</span>
        </div>
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-indigo-500 font-bold flex items-center gap-1 uppercase tracking-widest">
            <Zap size={10} /> Fee
          </span>
          <span className={cn("font-bold", theme === 'dark' ? "text-indigo-300" : "text-indigo-900")}>$0.45</span>
        </div>
      </div>

      <button 
        onClick={async () => {
          if (user && user.balance <= 0) {
            import('sonner').then(({ toast }) => toast.error('Your balance is zero. Please deposit funds to exchange assets.'));
            return;
          }
          if (amount && user && user.balance < parseFloat(amount)) {
             import('sonner').then(({ toast }) => toast.error('Insufficient balance for this exchange.'));
             return;
          }
          try {
            // Create a transaction record locally if API fails
            await api.createTransaction({
              userId: user?.id || 'current',
              type: 'trade',
              amount: parseFloat(amount || '0'),
              details: { from: fromAsset.symbol, to: toAsset.symbol }
            });

            // Optional: Notify (can be ignored if API fails)
            try {
              await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'Exchange Completed',
                  message: `Swapped ${fromAsset.symbol} for ${toAsset.symbol}`,
                  type: 'trade',
                  amount: amount || '0',
                  asset: fromAsset.symbol
                })
              });
            } catch (e) {
              // Ignore notification failure on static hosts
            }
            
            import('sonner').then(({ toast }) => toast.success('Exchange completed successfully'));
          } catch (e) {
            console.error(e);
            import('sonner').then(({ toast }) => toast.error('Exchange failed'));
          }
        }}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all"
      >
        Preview Exchange
      </button>
    </motion.div>
  );
};
