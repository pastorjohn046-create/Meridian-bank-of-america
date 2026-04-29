import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ASSETS } from '../mockData';
import { TrendingUp, TrendingDown, ChevronRight, Building2, Bitcoin, Copy, Check, Plus, X, PieChart as PieIcon, LineChart, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
  const allAssets = [...fiatAssets, ...cryptoAssets];

  const pieData = allAssets.map(a => ({ name: a.name, value: a.fiatValue, color: a.color }));

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
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
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    return () => socket.close();
  }, []);

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
        toast.success('Wait for processing', {
          description: 'Your request is being reviewed by our security team.'
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
      className="px-4 pb-20 space-y-10"
    >
      {/* Portfolio Insight */}
      <header className="pt-2 px-1">
        <h2 className="font-serif text-3xl font-light italic tracking-tight mb-1">Portfolio</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em]">Strategic Asset Allocation</p>
      </header>

      {/* Allocation Wheel & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-[2.5rem] flex items-center justify-between">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 pl-6 space-y-3">
            <div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Total Wealth</p>
              <p className="text-2xl font-black text-white">${Number(user.balance).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/10 px-2 py-1 rounded-lg">
                <p className="text-[10px] font-bold text-emerald-500">+4.2% YTD</p>
              </div>
              <ShieldCheck size={16} className="text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Projected Yields */}
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Projected Yield</h4>
            <LineChart size={18} className="text-red-500" />
          </div>
          <div className="py-2">
            <p className="text-3xl font-serif italic font-light">$12,450</p>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Estimated Annual Dividends</p>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1 mt-4">
            <div className="bg-red-600 h-1 rounded-full w-[65%]" />
          </div>
        </div>
      </div>

      {/* Action Tabs: Deposit Channels */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl italic font-light tracking-wide px-1">Funding Channels</h3>
        <div className="grid grid-cols-1 gap-3">
          {depositAccounts.concat(cryptoWallets).map((method, i) => (
            <button 
              key={i}
              onClick={() => {
                setSelectedMethod(method);
                setIsDepositModalOpen(true);
              }}
              className="glass-card p-5 rounded-[2rem] flex items-center justify-between transition-all hover:bg-white/5 active:scale-[0.98] text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800">
                  {method.bankName ? <Building2 size={22} className="text-red-500" /> : <Bitcoin size={22} className="text-emerald-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{method.bankName || method.coin}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{method.accountNumber || method.address.slice(0, 16) + '...'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-700" />
            </button>
          ))}
        </div>
      </section>

      {/* Assets Grid */}
      <section className="space-y-6">
        <h3 className="font-serif text-xl italic font-light tracking-wide px-1">Holdings</h3>
        
        {/* Cash Assets */}
        <div className="space-y-3">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] px-1">Fixed Income & Fiat</p>
          {fiatAssets.map((asset) => (
            <HOLDING_CARD key={asset.id} asset={asset} />
          ))}
        </div>

        {/* Alternatives */}
        <div className="space-y-3">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] px-1">Alternative Investments</p>
          {cryptoAssets.map((asset) => (
            <HOLDING_CARD key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        method={selectedMethod} 
        amount={depositAmount}
        setAmount={setDepositAmount}
        onConfirm={handleConfirmDeposit}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
};

const HOLDING_CARD: React.FC<{ asset: any }> = ({ asset }) => (
  <div className="glass-card p-5 rounded-[2rem] flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xl"
        style={{ backgroundColor: asset.color }}
      >
        {asset.symbol[0]}
      </div>
      <div>
        <p className="text-[13px] font-bold text-white">{asset.name}</p>
        <div className="flex items-center gap-2 font-bold uppercase text-[9px] tracking-widest mt-0.5">
          <span className="text-zinc-500">{asset.balance} {asset.symbol}</span>
          {asset.change24h > 0 ? (
            <span className="text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> {asset.change24h}%</span>
          ) : (
            <span className="text-red-500 flex items-center gap-0.5"><TrendingDown size={10} /> {Math.abs(asset.change24h)}%</span>
          )}
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[14px] font-bold text-white">${asset.fiatValue.toLocaleString()}</p>
      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Market Value</p>
    </div>
  </div>
);

const DepositModal: React.FC<any> = ({ isOpen, onClose, method, amount, setAmount, onConfirm, isSubmitting }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          exit={{ y: 200 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 space-y-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif text-2xl italic font-light tracking-wide text-white">Deposit Assets</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Secure External Transfer</p>
            </div>
            <button onClick={onClose} className="p-3 bg-zinc-900 rounded-2xl text-zinc-500">
              <X size={18} />
            </button>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              {method?.bankName ? <Building2 size={20} className="text-red-500" /> : <Bitcoin size={20} className="text-emerald-500" />}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{method?.bankName || method?.coin}</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{method?.accountNumber || method?.address}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-serif italic text-xl">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-6 bg-zinc-900 border border-zinc-700 rounded-[1.5rem] text-2xl font-black text-white outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <button 
            onClick={onConfirm}
            disabled={isSubmitting || !amount}
            className="w-full py-5 bg-zinc-100 text-black rounded-[1.5rem] font-bold uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {isSubmitting ? "Encrypting..." : "Confirm Secure Deposit"}
          </button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
