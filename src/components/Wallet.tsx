import React from 'react';
import { motion } from 'motion/react';
import { MOCK_ASSETS } from '../mockData';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export const WalletScreen: React.FC = () => {
  const { theme } = useTheme();
  const fiatAssets = MOCK_ASSETS.filter(a => a.type === 'fiat');
  const cryptoAssets = MOCK_ASSETS.filter(a => a.type === 'crypto');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-5 pb-16 space-y-4"
    >
      <header className="space-y-0.5">
        <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>My Assets</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Portfolio Overview</p>
      </header>

      {/* Fiat Section */}
      <section className="space-y-2">
        <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Fiat Currencies</h3>
        <div className="space-y-1.5">
          {fiatAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} theme={theme} />
          ))}
        </div>
      </section>

      {/* Crypto Section */}
      <section className="space-y-2">
        <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Cryptocurrencies</h3>
        <div className="space-y-1.5">
          {cryptoAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} theme={theme} />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const AssetCard: React.FC<{ asset: any, theme: string }> = ({ asset, theme }) => (
  <div className={cn(
    "flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group",
    theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900" : "bg-white border border-gray-100 shadow-sm hover:shadow-md"
  )}>
    <div className="flex items-center gap-2.5">
      <div 
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-inner"
        style={{ backgroundColor: asset.color }}
      >
        {asset.symbol[0]}
      </div>
      <div>
        <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{asset.name}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">{asset.balance} {asset.symbol}</p>
          {asset.change24h !== 0 && (
            <span className={cn(
              "text-[8px] font-bold flex items-center gap-0.5",
              asset.change24h > 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {asset.change24h > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
              {Math.abs(asset.change24h)}%
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>${asset.fiatValue.toLocaleString()}</p>
        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Value USD</p>
      </div>
      <ChevronRight size={12} className={cn("transition-colors", theme === 'dark' ? "text-zinc-700 group-hover:text-zinc-500" : "text-gray-300 group-hover:text-gray-500")} />
    </div>
  </div>
);
