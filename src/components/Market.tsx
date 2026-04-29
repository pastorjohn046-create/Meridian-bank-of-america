import React from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown, Globe, Flame, Zap, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const CRYPTO_MARKET = [
  { name: 'Bitcoin', symbol: 'BTC', price: 64250.20, change: 2.4, color: '#f59e0b' },
  { name: 'Ethereum', symbol: 'ETH', price: 3450.15, change: -1.2, color: '#6366f1' },
  { name: 'Solana', symbol: 'SOL', price: 145.40, change: 5.8, color: '#14f195' },
  { name: 'Gold Spot', symbol: 'XAU', price: 2342.10, change: 1.2, color: '#D4AF37' },
  { name: 'Silver Spot', symbol: 'XAG', price: 28.45, change: -0.3, color: '#9ca3af' },
  { name: 'Brent Oil', symbol: 'OIL', price: 82.15, change: 2.1, color: '#000000' },
];

const INDICES = [
  { name: 'S&P 500', value: '5,204.34', change: '+0.45%' },
  { name: 'NasDaq', value: '16,332.24', change: '+0.12%' },
  { name: 'FTSE 100', value: '7,935.09', change: '-0.21%' },
];

export const MarketScreen: React.FC<{ user: any }> = () => {
  const { theme } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-20 space-y-10"
    >
      <header className="pt-2 px-1">
        <h2 className="font-serif text-3xl font-light italic tracking-tight mb-1">Global Markets</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em]">Live Institutional Data</p>
      </header>

      {/* Indices Scroller */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {INDICES.map((idx, i) => (
          <div key={i} className="glass-card min-w-[140px] p-5 rounded-[1.5rem] space-y-1 border-white/5 bg-zinc-950">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{idx.name}</p>
            <p className="text-sm font-bold text-white">{idx.value}</p>
            <span className={cn("text-[10px] font-bold", idx.change.includes('+') ? "text-emerald-500" : "text-red-500")}>
              {idx.change}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search Global Assets..."
            className="w-full pl-12 pr-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-bold text-white outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Market Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-xl italic font-light tracking-wide">Elite Watchlist</h3>
          <div className="flex items-center gap-1.5 text-red-500">
            <BarChart3 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analytics Ready</span>
          </div>
        </div>

        <div className="space-y-3">
          {CRYPTO_MARKET.map((asset) => (
            <div key={asset.symbol} className="glass-card flex items-center justify-between p-4 rounded-[2rem] transition-all hover:bg-white/5 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[11px]"
                  style={{ backgroundColor: asset.color }}
                >
                  {asset.symbol[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{asset.name}</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">${asset.price.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center justify-end gap-1 font-bold text-[10px] mt-0.5",
                  asset.change > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {asset.change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(asset.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHSBC Insights */}
      <section className="glass-card p-8 rounded-[3rem] space-y-6 bg-premium-gradient text-white border-none shadow-2xl shadow-red-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-serif text-lg italic font-light tracking-wide">Elite Insight</h4>
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Exclusive Analysis</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm font-light leading-relaxed text-zinc-100">
            "Market volatility expected in the energy sector following new global supply reports. Private clients are advised to rebalance metal holdings."
          </p>
          <div className="flex items-center justify-between pt-2">
            <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Full Briefing Availiable</p>
            <ChevronRight size={16} />
          </div>
        </div>
      </section>

      {/* Top Gainers Small Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Flame size={18} className="text-amber-500" />
          <h3 className="font-serif text-xl italic font-light tracking-wide">Bull Run Spotlights</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Solana', change: '+12.4%', color: '#14f195' },
            { name: 'Nvidia', change: '+8.2%', color: '#76b900' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 rounded-[2rem] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-xs font-bold" style={{ color: item.color }}>
                {item.name[0]}
              </div>
              <p className="text-xs font-bold text-white">{item.name}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{item.change}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
