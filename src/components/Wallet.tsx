import React from 'react';
import { motion } from 'motion/react';
import { MOCK_ASSETS } from '../mockData';
import { TrendingUp, TrendingDown, ChevronRight, Building2, Bitcoin, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface WalletProps {
  user: any;
}

export const WalletScreen: React.FC<WalletProps> = ({ user }) => {
  const { theme } = useTheme();
  const [depositAccounts, setDepositAccounts] = React.useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = React.useState<any[]>([]);
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);
  const fiatAssets = MOCK_ASSETS.filter(a => a.type === 'fiat');
  const cryptoAssets = MOCK_ASSETS.filter(a => a.type === 'crypto');

  React.useEffect(() => {
    Promise.all([
      fetch('/api/deposit-accounts').then(res => res.json()),
      fetch('/api/crypto-wallets').then(res => res.json())
    ]).then(([deposits, wallets]) => {
      setDepositAccounts(deposits);
      setCryptoWallets(wallets);
    }).catch(err => console.error(err));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-5 pb-16 space-y-6"
    >
      <header className="space-y-0.5">
        <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>My Assets</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Portfolio Overview</p>
      </header>

      {/* Deposit Accounts Section */}
      {(depositAccounts.length > 0 || cryptoWallets.length > 0) && (
        <section className="space-y-4">
          <header className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Deposit Channels</h3>
            <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter">Admin Verified</span>
          </header>
          
          <div className="space-y-3">
            {/* Bank Accounts */}
            {depositAccounts.map((acc) => (
              <div 
                key={acc.id}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all",
                  theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-white">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{acc.bankName}</p>
                    <p className={cn("text-[10px] font-medium", theme === 'dark' ? "text-zinc-400" : "text-gray-500")}>
                      {acc.accountNumber} • {acc.accountName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Bank Transfer</p>
                </div>
              </div>
            ))}

            {/* Crypto Wallets */}
            {cryptoWallets.map((wallet) => (
              <div 
                key={wallet.id}
                onClick={() => copyToClipboard(wallet.address)}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98]",
                  theme === 'dark' ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800" : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-gradient flex items-center justify-center text-white">
                    <Bitcoin size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className={cn("text-xs font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{wallet.coin} ({wallet.symbol})</p>
                    <p className={cn("text-[9px] font-medium truncate max-w-[150px]", theme === 'dark' ? "text-zinc-500" : "text-gray-400")}>
                      {wallet.address}
                    </p>
                    <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Network: {wallet.network}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-50 text-gray-400"
                  )}>
                    {copiedAddress === wallet.address ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Click to copy</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
