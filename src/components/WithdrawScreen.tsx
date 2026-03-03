import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowDownLeft, Building2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface WithdrawScreenProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

export const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ user, onUpdateUser }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'method' | 'amount' | 'confirm' | 'success'>('method');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [depositAccounts, setDepositAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/deposit-accounts');
        if (response.ok) {
          const data = await response.json();
          setDepositAccounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch deposit accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleWithdraw = async () => {
    setIsLoading(true);
    if (user && user.balance < parseFloat(amount)) {
      toast.error('Insufficient balance for this withdrawal.');
      setIsLoading(false);
      return;
    }

    if (user && user.balance <= 0) {
      toast.error('Your balance is zero. Please deposit funds to withdraw money.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          type: 'withdraw',
          amount: parseFloat(amount),
          details: { method }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          onUpdateUser(result.user);
        }
      }

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Withdrawal Initialized',
          message: `Your withdrawal of $${amount} to ${method} is being processed.`,
          type: 'withdraw',
          amount: parseFloat(amount),
          asset: 'USD'
        })
      });

      setStep('success');
    } catch (error) {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "min-h-screen flex flex-col",
        theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"
      )}
    >
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-4">
        {step !== 'success' && (
          <button 
            onClick={() => step === 'method' ? navigate(-1) : setStep('method')}
            className={cn(
              "p-2 rounded-full border transition-colors",
              theme === 'dark' ? "border-zinc-800 text-zinc-400" : "border-gray-100 text-gray-600"
            )}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="text-lg font-bold">Withdraw Funds</h2>
      </header>

      <div className="flex-1 px-5 py-4">
        {step === 'method' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select Withdrawal Method</p>
              <div className="space-y-2">
                {depositAccounts.length === 0 ? (
                  <div className={cn(
                    "p-8 rounded-2xl border-2 border-dashed text-center space-y-2",
                    theme === 'dark' ? "border-zinc-800 bg-zinc-900/20" : "border-gray-100 bg-gray-50/50"
                  )}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Withdrawal Methods</p>
                    <p className="text-[8px] text-gray-400">Please contact support to add a withdrawal method.</p>
                  </div>
                ) : (
                  depositAccounts.map((m, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setMethod(`${m.bankName} (${m.accountNumber})`);
                        setStep('amount');
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-95",
                        theme === 'dark' ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                        <Building2 size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{m.bankName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{m.accountNumber} • {m.accountName}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-8 flex flex-col h-full">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Withdrawing to {method}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-gray-400">$</span>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "bg-transparent text-5xl font-bold outline-none w-48 text-center",
                    theme === 'dark' ? "text-zinc-100" : "text-gray-900"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {[100, 500, 1000, 2000, 5000, 'All'].map((val, i) => (
                <button 
                  key={i}
                  onClick={() => setAmount(val === 'All' ? '12450' : val.toString())}
                  className={cn(
                    "py-3 rounded-xl text-xs font-bold transition-all active:scale-95",
                    theme === 'dark' ? "bg-zinc-900 text-zinc-400 border border-zinc-800" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {val === 'All' ? val : `$${val}`}
                </button>
              ))}
            </div>

            <div className="mt-auto pb-10">
              <button 
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setStep('confirm')}
                className="w-full py-4 bg-indigo-600 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Review Withdrawal
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8">
            <div className={cn(
              "p-6 rounded-[2.5rem] space-y-6",
              theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-gray-50"
            )}>
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</p>
                <p className="text-xl font-bold">${parseFloat(amount).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Method</p>
                <p className="text-sm font-bold">{method}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Processing Time</p>
                <p className="text-sm font-bold text-indigo-500">1-3 Days</p>
              </div>
            </div>

            <button 
              onClick={handleWithdraw}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowDownLeft size={18} />
                  Confirm Withdrawal
                </>
              )}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Withdrawal Initialized</h2>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Your withdrawal of ${amount} has been successfully initialized and will be processed shortly.</p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all mt-10"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
