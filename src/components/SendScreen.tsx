import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Search, User, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

import { api } from '../services/api';

interface SendScreenProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

export const SendScreen: React.FC<SendScreenProps> = ({ user, onUpdateUser }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm' | 'success'>('recipient');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    if (user && user.balance < parseFloat(amount)) {
      toast.error('Insufficient balance for this transaction.');
      setIsLoading(false);
      return;
    }

    if (user && user.balance <= 0) {
      toast.error('Your balance is zero. Please deposit funds to send money.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await api.createTransaction({
        userId: user?.id || 'current',
        type: 'send',
        amount: parseFloat(amount),
        details: { recipient }
      });

      if (result.status === 'ok') {
        if (result.user) {
          onUpdateUser(result.user);
        }
      }

      // Optional: Notify (can be ignored if API fails)
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Transfer Sent',
            message: `You have successfully sent $${amount} to ${recipient}.`,
            type: 'send',
            amount: parseFloat(amount),
            asset: 'USD'
          })
        });
      } catch (e) {
        // Ignore notification failure on static hosts
      }

      setStep('success');
    } catch (error) {
      toast.error('Transfer failed. Please try again.');
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
            onClick={() => step === 'recipient' ? navigate(-1) : setStep('recipient')}
            className={cn(
              "p-2 rounded-full border transition-colors",
              theme === 'dark' ? "border-zinc-800 text-zinc-400" : "border-gray-100 text-gray-600"
            )}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="text-lg font-bold">Send Money</h2>
      </header>

      <div className="flex-1 px-5 py-4">
        {step === 'recipient' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recipient Details</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Account number or username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className={cn(
                    "w-full pl-11 pr-4 py-4 rounded-2xl text-sm transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600" : "bg-gray-50 border border-gray-100 text-gray-900"
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recent Recipients</p>
              <div className="grid grid-cols-4 gap-4">
                {['Felix', 'Sarah', 'Elena', 'Michael'].map((name, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setRecipient(name);
                      setStep('amount');
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <span className="text-[10px] font-bold">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {recipient && (
              <button 
                onClick={() => setStep('amount')}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-auto"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-8 flex flex-col h-full">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sending to {recipient}</p>
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
              {[10, 50, 100, 500, 1000, 'Max'].map((val, i) => (
                <button 
                  key={i}
                  onClick={() => setAmount(val === 'Max' ? '5000' : val.toString())}
                  className={cn(
                    "py-3 rounded-xl text-xs font-bold transition-all active:scale-95",
                    theme === 'dark' ? "bg-zinc-900 text-zinc-400 border border-zinc-800" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {val === 'Max' ? val : `$${val}`}
                </button>
              ))}
            </div>

            <div className="mt-auto pb-10">
              <button 
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setStep('confirm')}
                className="w-full py-4 bg-indigo-600 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Review Transfer
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
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recipient</p>
                <p className="text-sm font-bold">{recipient}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fee</p>
                <p className="text-sm font-bold text-emerald-500">Free</p>
              </div>
            </div>

            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Confirm & Send
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
              <h2 className="text-2xl font-bold">Transfer Successful</h2>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Your transfer of ${amount} to {recipient} has been processed.</p>
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
