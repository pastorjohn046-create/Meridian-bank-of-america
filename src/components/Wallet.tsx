import React from 'react';
import { motion } from 'motion/react';
import { MOCK_ASSETS } from '../mockData';
import { TrendingUp, TrendingDown, ChevronRight, Building2, Bitcoin, Copy, Check, Plus, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

import { api } from '../services/api';

interface WalletProps {
  user: any;
  onUpdateUser?: (user: any) => void;
}

export const WalletScreen: React.FC<WalletProps> = ({ user, onUpdateUser }) => {
  const { theme } = useTheme();
  const [depositAccounts, setDepositAccounts] = React.useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = React.useState<any[]>([]);
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fiatAssets = MOCK_ASSETS.filter(a => a.type === 'fiat').map(a => 
    a.symbol === 'USD' ? { ...a, balance: Number(user.balance), fiatValue: Number(user.balance) } : a
  );
  const cryptoAssets = MOCK_ASSETS.filter(a => a.type === 'crypto');

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Sync user data on mount
        const updatedUser = await api.syncCurrentUser(user.id);
        if (updatedUser && onUpdateUser) {
          onUpdateUser(updatedUser);
        }

        const [deposits, wallets] = await Promise.all([
          api.getDepositAccounts(),
          api.getCryptoWallets()
        ]);
        setDepositAccounts(deposits);
        setCryptoWallets(wallets);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'DEPOSIT_ACCOUNTS_UPDATED') {
          setDepositAccounts(message.data);
        } else if (message.type === 'CRYPTO_WALLETS_UPDATED') {
          setCryptoWallets(message.data);
        } else if (message.type === 'DEPOSIT_APPROVED' && message.data.userId === user?.id) {
          toast.success('Deposit Approved', {
            description: `Your deposit of $${message.data.amount.toLocaleString()} has been approved.`
          });
        } else if (message.type === 'DEPOSIT_REJECTED' && message.data.userId === user?.id) {
          toast.error('Deposit Rejected', {
            description: `Your deposit of $${message.data.amount.toLocaleString()} was rejected.`
          });
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    return () => socket.close();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleConfirmDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0 || !selectedMethod) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.createTransaction({
        userId: user.id,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        details: {
          method: selectedMethod.bankName || selectedMethod.coin,
          accountNumber: selectedMethod.accountNumber || selectedMethod.address
        }
      });

      if (result.status === 'ok') {
        toast.success('Deposit Request Sent', {
          description: 'Your deposit is pending administrator approval.'
        });
        setIsDepositModalOpen(false);
        setDepositAmount('');
        setSelectedMethod(null);
      }
    } catch (error) {
      toast.error('Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
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
                onClick={() => {
                  setSelectedMethod(acc);
                  setIsDepositModalOpen(true);
                }}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
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
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Deposit Now</p>
                </div>
              </div>
            ))}

            {/* Crypto Wallets */}
            {cryptoWallets.map((wallet) => (
              <div 
                key={wallet.id}
                onClick={() => {
                  setSelectedMethod(wallet);
                  setIsDepositModalOpen(true);
                }}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
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
                    <Plus size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Deposit</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Deposit Confirmation Modal */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className={cn(
                "w-full max-w-md rounded-[2.5rem] p-6 space-y-6 shadow-2xl",
                theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-white"
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Confirm Deposit</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Submit your transaction details</p>
                </div>
                <button onClick={() => setIsDepositModalOpen(false)} className={cn("p-2 rounded-full", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600")}>
                  <X size={18} />
                </button>
              </div>

              <div className={cn("p-4 rounded-2xl space-y-2", theme === 'dark' ? "bg-zinc-800" : "bg-gray-50")}>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Selected Method</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    {selectedMethod?.bankName ? <Building2 size={16} /> : <Bitcoin size={16} />}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">{selectedMethod?.bankName || selectedMethod?.coin}</p>
                    <p className="text-[9px] text-gray-500 truncate max-w-[200px]">{selectedMethod?.accountNumber || selectedMethod?.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Amount Sent</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className={cn(
                      "w-full pl-8 pr-4 py-4 rounded-2xl text-lg font-bold outline-none transition-all",
                      theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-indigo-500" : "bg-gray-100 border border-gray-200 text-gray-900 focus:border-indigo-500"
                    )}
                  />
                </div>
                <p className="text-[8px] text-gray-400 px-1">Please enter the exact amount you transferred to the details above.</p>
              </div>

              <button 
                onClick={handleConfirmDeposit}
                disabled={isSubmitting || !depositAmount}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50",
                  "bg-indigo-600 text-white shadow-indigo-500/20"
                )}
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                Confirm Deposit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
