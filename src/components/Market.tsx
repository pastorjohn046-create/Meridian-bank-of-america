import React from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const CRYPTO_MARKET = [
  { name: 'Bitcoin', symbol: 'BTC', price: 64250.20, change: 2.4, color: '#f59e0b' },
  { name: 'Ethereum', symbol: 'ETH', price: 3450.15, change: -1.2, color: '#6366f1' },
  { name: 'Solana', symbol: 'SOL', price: 145.40, change: 5.8, color: '#14f195' },
  { name: 'Cardano', symbol: 'ADA', price: 0.45, change: 0.8, color: '#0033ad' },
  { name: 'Polkadot', symbol: 'DOT', price: 7.20, change: -2.5, color: '#e6007a' },
  { name: 'Chainlink', symbol: 'LINK', price: 18.50, change: 1.2, color: '#2a5ada' },
];

interface MarketProps {
  user: any;
}

export const MarketScreen: React.FC<MarketProps> = ({ user }) => {
  const { theme } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-16 space-y-4"
    >
      <header className="space-y-3">
        <div className="space-y-0.5">
          <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Market</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Performance</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search assets..."
            className={cn(
              "w-full pl-9 pr-4 py-2.5 rounded-xl text-[11px] transition-all outline-none",
              theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            )}
          />
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-5 px-5 no-scrollbar">
        {['All', 'Crypto', 'Fiat', 'Stocks', 'Indices'].map((cat, i) => (
          <button 
            key={cat}
            className={cn(
              "px-3.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition-all",
              i === 0 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                : (theme === 'dark' ? "bg-zinc-900 text-zinc-500 hover:bg-zinc-800" : "bg-gray-50 text-gray-500 hover:bg-gray-100")
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="space-y-2">
        <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 uppercase tracking-widest px-1">
          <span>Asset</span>
          <span>Price / 24h</span>
        </div>
        <div className="space-y-1">
          {CRYPTO_MARKET.map((asset) => (
            <div key={asset.symbol} className={cn(
              "flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer group",
              theme === 'dark' ? "hover:bg-zinc-900/50" : "hover:bg-gray-50"
            )}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-sm"
                  style={{ backgroundColor: asset.color }}
                >
                  {asset.symbol[0]}
                </div>
                <div>
                  <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{asset.name}</p>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>${asset.price.toLocaleString()}</p>
                <span className={cn(
                  "text-[8px] font-bold flex items-center justify-end gap-0.5",
                  asset.change > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {asset.change > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  {Math.abs(asset.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
