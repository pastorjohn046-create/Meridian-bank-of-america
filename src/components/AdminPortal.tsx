import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ChevronRight, 
  ShieldAlert,
  Save,
  X,
  Phone,
  Mail,
  Calendar,
  Key,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pin?: string;
  balance: number;
  status: 'active' | 'suspended';
  joinDate: string;
}

export const AdminPortal: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustBalance = async (type: 'increase' | 'reduce') => {
    if (!editingUser || !adjustmentAmount) return;
    
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount)) return;

    const newBalance = type === 'increase' ? editingUser.balance + amount : editingUser.balance - amount;
    const finalBalance = Math.max(0, newBalance);

    try {
      const response = await fetch('/api/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, balance: finalBalance })
      });
      
      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? result.user : u));
        setEditingUser(result.user);
        setAdjustmentAmount('');
        toast.success(`Balance ${type === 'increase' ? 'increased' : 'reduced'} successfully`);
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
      toast.error('Failed to update balance');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 pb-10 space-y-6"
    >
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert size={20} />
            <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Admin Management</h2>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">System Administration Portal</p>
        </div>
        <button 
          onClick={() => {
            setIsLoading(true);
            fetchUsers();
          }}
          className={cn(
            "p-2 rounded-xl transition-all active:scale-90",
            theme === 'dark' ? "bg-zinc-900 text-zinc-400" : "bg-gray-100 text-gray-600"
          )}
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input 
          type="text" 
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full pl-9 pr-4 py-2.5 rounded-xl text-[11px] transition-all outline-none",
            theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600" : "bg-gray-50 border border-gray-100 text-gray-900"
          )}
        />
      </div>

      {/* User List */}
      <div className="space-y-2">
        <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Registered Customers ({filteredUsers.length})</h3>
        <div className="space-y-1.5">
          {filteredUsers.map((user) => (
            <div 
              key={user.id}
              onClick={() => setEditingUser(user)}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between",
                theme === 'dark' ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800" : "bg-white border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                  <Users size={18} />
                </div>
                <div>
                  <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{user.name}</p>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500">{user.email}</p>
                      {user.phone && (
                        <>
                          <span className="text-[8px] text-gray-400">•</span>
                          <p className="text-[9px] text-gray-500">{user.phone}</p>
                        </>
                      )}
                    </div>
                    <p className="text-[8px] text-gray-400 font-medium">Joined: {user.joinDate}</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className={cn("text-[11px] font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>${user.balance.toLocaleString()}</p>
                  <span className={cn(
                    "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                    user.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {user.status}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className={cn(
              "w-full max-w-md rounded-[2.5rem] p-6 space-y-6 shadow-2xl",
              theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-white"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Manage Account</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{editingUser.name}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className={cn("p-2 rounded-full", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600")}>
                <X size={18} />
              </button>
            </div>

            <div className={cn("p-4 rounded-2xl text-center space-y-1", theme === 'dark' ? "bg-zinc-800" : "bg-gray-50")}>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Current Balance</p>
              <p className={cn("text-2xl font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>${editingUser.balance.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Registration Details</p>
              <div className="grid grid-cols-1 gap-2">
                <div className={cn("p-3 rounded-xl flex items-center gap-3", theme === 'dark' ? "bg-zinc-800/50" : "bg-gray-50")}>
                  <Mail size={14} className="text-gray-400" />
                  <p className="text-[10px] font-medium">{editingUser.email}</p>
                </div>
                {editingUser.phone && (
                  <div className={cn("p-3 rounded-xl flex items-center gap-3", theme === 'dark' ? "bg-zinc-800/50" : "bg-gray-50")}>
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-[10px] font-medium">{editingUser.phone}</p>
                  </div>
                )}
                {editingUser.pin && (
                  <div className={cn("p-3 rounded-xl flex items-center gap-3", theme === 'dark' ? "bg-zinc-800/50" : "bg-gray-50")}>
                    <Key size={14} className="text-gray-400" />
                    <p className="text-[10px] font-medium">Security PIN: {editingUser.pin}</p>
                  </div>
                )}
                <div className={cn("p-3 rounded-xl flex items-center gap-3", theme === 'dark' ? "bg-zinc-800/50" : "bg-gray-50")}>
                  <Calendar size={14} className="text-gray-400" />
                  <p className="text-[10px] font-medium">Joined: {editingUser.joinDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Adjust Balance</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className={cn(
                      "w-full pl-7 pr-4 py-3 rounded-xl text-sm font-bold outline-none",
                      theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-gray-100 border border-gray-200 text-gray-900"
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAdjustBalance('increase')}
                  className="py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <ArrowUpCircle size={16} />
                  Increase
                </button>
                <button 
                  onClick={() => handleAdjustBalance('reduce')}
                  className="py-3.5 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  <ArrowDownCircle size={16} />
                  Reduce
                </button>
              </div>
            </div>

            <button 
              onClick={() => setEditingUser(null)}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "bg-gray-100 text-gray-900"
              )}
            >
              <Save size={16} />
              Done
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
