import React from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Share2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

import { Transaction } from '../types';
import { api } from '../services/api';

export const TransactionDetails: React.FC = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = React.useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTx = async () => {
      if (!id) return;
      try {
        // In a real app, we'd have a specific endpoint for one transaction
        // For now, we'll fetch all and find it, or use a mock if not found
        const response = await fetch('/api/users'); // Just to trigger a fetch
        const users = await response.json();
        
        // Since we don't have a direct "get transaction by id" endpoint yet,
        // we'll try to find it in the local storage or just show a placeholder
        const localTxs = JSON.parse(localStorage.getItem('local_transactions') || '[]');
        const found = localTxs.find((t: any) => t.id === id);
        setTx(found);
      } catch (error) {
        console.error('Failed to fetch transaction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTx();
  }, [id]);

  if (isLoading) return <div className="p-10 text-center text-xs text-gray-500 uppercase tracking-widest">Loading...</div>;
  if (!tx) return <div className="p-10 text-center text-xs text-gray-500 uppercase tracking-widest">Transaction not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10 space-y-5"
    >
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
            theme === 'dark' ? "border-zinc-800 text-zinc-400" : "border-gray-100 text-gray-600"
          )}
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Transaction</h2>
      </header>

      <div className="flex flex-col items-center py-2 space-y-2">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
          tx.type === 'receive' ? "bg-emerald-500/10 text-emerald-500" : 
          tx.type === 'send' ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"
        )}>
          {tx.type === 'receive' ? <ArrowDownLeft size={28} /> : 
           tx.type === 'send' ? <ArrowUpRight size={28} /> : <ArrowLeftRight size={28} />}
        </div>
        <div className="text-center">
          <p className={cn("text-2xl font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>
            {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset.split(' ')[0]}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${tx.fiatAmount.toFixed(2)}</p>
        </div>
        <div className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-bold uppercase tracking-wider">
          Completed
        </div>
      </div>

      <div className={cn("rounded-2xl p-4 space-y-3", theme === 'dark' ? "bg-zinc-900/50 border border-zinc-800" : "bg-gray-50")}>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
          <span className="text-[11px] font-bold text-emerald-500 uppercase">Success</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Date</span>
          <span className={cn("text-[11px] font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{format(tx.timestamp, 'MMM dd, yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Counterparty</span>
          <span className={cn("text-[11px] font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{tx.counterparty || 'Internal Swap'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Network Fee</span>
          <span className={cn("text-[11px] font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>$0.45</span>
        </div>
        <div className={cn("pt-3 border-t", theme === 'dark' ? "border-zinc-800" : "border-gray-200")}>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Transaction ID</span>
            <span className="text-[9px] font-mono text-gray-500">{tx.id.slice(0, 12)}...</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className={cn(
          "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
          theme === 'dark' ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}>
          <Share2 size={14} />
          Share
        </button>
        <button className={cn(
          "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
          theme === 'dark' ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}>
          <Download size={14} />
          PDF
        </button>
      </div>
    </motion.div>
  );
};
