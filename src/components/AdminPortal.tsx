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
  RefreshCw,
  Building2,
  Plus,
  Trash2,
  Wallet,
  Bitcoin,
  MessageSquare,
  Send
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { api } from '../services/api';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pin?: string;
  balance: number;
  accountNumber?: string;
  sortCode?: string;
  status: 'active' | 'suspended';
  joinDate: string;
}

interface AdminPortalProps {
  onUpdateUser?: (user: any) => void;
  currentUser?: any;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onUpdateUser, currentUser }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [depositAccounts, setDepositAccounts] = useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const editingUserRef = React.useRef<UserAccount | null>(null);

  React.useEffect(() => {
    editingUserRef.current = editingUser;
  }, [editingUser]);

  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editSortCode, setEditSortCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'crypto' | 'support' | 'withdrawals' | 'pending_deposits'>('users');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [selectedUserForChat, setSelectedUserForChat] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // New Deposit Account Form
  const [newAccount, setNewAccount] = useState({ bankName: '', accountName: '', accountNumber: '', type: 'Checking' });

  // New Crypto Wallet Form
  const [newWallet, setNewWallet] = useState({ coin: '', symbol: '', address: '', network: '' });
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [updatedAddress, setUpdatedAddress] = useState('');

  const fetchData = async () => {
    try {
      const [usersData, depositsData, cryptoData, messagesData, withdrawalsData, pendingDepositsData] = await Promise.all([
        api.getUsers(),
        api.getDepositAccounts(),
        api.getCryptoWallets(),
        api.getMessages('admin'),
        api.getPendingWithdrawals(),
        api.getPendingDeposits()
      ]);
      setUsers(usersData);
      setDepositAccounts(depositsData);
      setCryptoWallets(cryptoData);
      setAllMessages(messagesData);
      setPendingWithdrawals(withdrawalsData);
      setPendingDeposits(pendingDepositsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect WebSocket for real-time chat
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'CHAT_MESSAGE') {
          setAllMessages(prev => {
            if (prev.some(m => m.id === message.data.id)) return prev;
            return [...prev, message.data];
          });
          toast.info(`New message from ${message.data.senderName}`);
        } else if (message.type === 'USER_REGISTERED') {
          setUsers(prev => {
            if (prev.some(u => u.id === message.data.id)) return prev;
            return [message.data, ...prev];
          });
          toast.success(`New user registered: ${message.data.name}`);
        } else if (message.type === 'USER_LOGGED_IN') {
          toast.info(`User logged in: ${message.data.name}`);
          // Optionally update user status or last login time in the list
          setUsers(prev => prev.map(u => u.id === message.data.id ? { ...u, lastLogin: message.data.lastLogin } : u));
        } else if (message.type === 'USER_UPDATED') {
          setUsers(prev => prev.map(u => u.id === message.data.id ? message.data : u));
          if (editingUserRef.current && editingUserRef.current.id === message.data.id) {
            setEditingUser(message.data);
            // Update input fields if they are currently editing this user
            setEditAccountNumber(message.data.accountNumber || '');
            setEditSortCode(message.data.sortCode || '');
          }
        } else if (message.type === 'DEPOSIT_ACCOUNTS_UPDATED') {
          setDepositAccounts(message.data);
          toast.info('Deposit accounts updated');
        } else if (message.type === 'CRYPTO_WALLETS_UPDATED') {
          setCryptoWallets(message.data);
          toast.info('Crypto wallets updated');
        } else if (message.type === 'WITHDRAWAL_REQUESTED') {
          setPendingWithdrawals(prev => [...prev, message.data]);
          toast.info(`New withdrawal request from ${message.data.userName}`);
        } else if (message.type === 'WITHDRAWAL_APPROVED' || message.type === 'WITHDRAWAL_REJECTED') {
          setPendingWithdrawals(prev => prev.filter(w => w.id !== message.data.id));
        } else if (message.type === 'DEPOSIT_REQUESTED') {
          setPendingDeposits(prev => [...prev, message.data]);
          toast.info(`New deposit request from ${message.data.userName}`);
        } else if (message.type === 'DEPOSIT_APPROVED' || message.type === 'DEPOSIT_REJECTED') {
          setPendingDeposits(prev => prev.filter(d => d.id !== message.data.id));
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleAddDepositAccount = async () => {
    if (!newAccount.bankName || !newAccount.accountNumber) return;
    try {
      const result = await api.addDepositAccount(newAccount);
      if (result.status === 'ok') {
        setDepositAccounts([...depositAccounts, result.account]);
        setNewAccount({ bankName: '', accountName: '', accountNumber: '', type: 'Checking' });
        toast.success('Deposit account added');
      }
    } catch (e) {
      toast.error('Failed to add account');
    }
  };

  const handleDeleteDepositAccount = async (id: string) => {
    try {
      const result = await api.deleteDepositAccount(id);
      if (result.status === 'ok') {
        setDepositAccounts(depositAccounts.filter(a => a.id !== id));
        toast.success('Account removed');
      }
    } catch (e) {
      toast.error('Failed to remove account');
    }
  };

  const handleAddCryptoWallet = async () => {
    if (!newWallet.coin || !newWallet.address) return;
    try {
      const result = await api.addCryptoWallet(newWallet);
      if (result.status === 'ok') {
        setCryptoWallets([...cryptoWallets, result.wallet]);
        setNewWallet({ coin: '', symbol: '', address: '', network: '' });
        toast.success('Crypto wallet added');
      }
    } catch (e) {
      toast.error('Failed to add wallet');
    }
  };

  const handleDeleteCryptoWallet = async (id: string) => {
    try {
      const result = await api.deleteCryptoWallet(id);
      if (result.status === 'ok') {
        setCryptoWallets(cryptoWallets.filter(w => w.id !== id));
        toast.success('Wallet removed');
      }
    } catch (e) {
      toast.error('Failed to remove wallet');
    }
  };

  const handleUpdateCryptoWallet = async (id: string) => {
    if (!updatedAddress.trim()) return;
    try {
      const result = await api.updateCryptoWallet(id, updatedAddress);
      if (result.status === 'ok') {
        setCryptoWallets(cryptoWallets.map(w => w.id === id ? result.wallet : w));
        setEditingWalletId(null);
        setUpdatedAddress('');
        toast.success('Wallet address updated');
      }
    } catch (e) {
      toast.error('Failed to update wallet');
    }
  };
  
  const handleApproveWithdrawal = async (id: string) => {
    try {
      const result = await api.approveWithdrawal(id);
      if (result.status === 'ok') {
        setPendingWithdrawals(pendingWithdrawals.filter(w => w.id !== id));
        if (result.user) {
          setUsers(users.map(u => u.id === result.user.id ? result.user : u));
        }
        toast.success('Withdrawal approved successfully');
      } else {
        toast.error(result.message || 'Failed to approve withdrawal');
      }
    } catch (e) {
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      const result = await api.rejectWithdrawal(id);
      if (result.status === 'ok') {
        setPendingWithdrawals(pendingWithdrawals.filter(w => w.id !== id));
        toast.success('Withdrawal rejected');
      }
    } catch (e) {
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      const result = await api.approveDeposit(id);
      if (result.status === 'ok') {
        setPendingDeposits(pendingDeposits.filter(d => d.id !== id));
        if (result.user) {
          setUsers(users.map(u => u.id === result.user.id ? result.user : u));
        }
        toast.success('Deposit approved successfully');
      } else {
        toast.error(result.message || 'Failed to approve deposit');
      }
    } catch (e) {
      toast.error('Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (id: string) => {
    try {
      const result = await api.rejectDeposit(id);
      if (result.status === 'ok') {
        setPendingDeposits(pendingDeposits.filter(d => d.id !== id));
        toast.success('Deposit rejected');
      }
    } catch (e) {
      toast.error('Failed to reject deposit');
    }
  };

  const handleSendAdminReply = () => {
    if (!selectedUserForChat || !adminReply.trim() || !socket) return;

    const messageData = {
      userId: selectedUserForChat, // The user we are replying to
      senderName: 'System Support',
      text: adminReply,
      isAdmin: true,
      receiverId: selectedUserForChat
    };

    socket.send(JSON.stringify({
      type: 'CHAT_MESSAGE',
      data: messageData
    }));

    setAdminReply('');
  };

  const chatUsers = Array.from(new Set(allMessages.map(m => m.userId))).map(uid => {
    return users.find(u => u.id === uid) || { id: uid, name: 'Unknown User' };
  });

  const selectedUserMessages = allMessages.filter(m => m.userId === selectedUserForChat || m.receiverId === selectedUserForChat);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateUserDetails = async () => {
    if (!editingUser) return;

    try {
      const result = await api.updateUserDetails(editingUser.id, {
        accountNumber: editAccountNumber,
        sortCode: editSortCode
      });
      
      if (result.status === 'ok') {
        setUsers(users.map(u => u.id === editingUser.id ? result.user : u));
        setEditingUser(result.user);
        
        // Update global session if it's the current user
        if (currentUser && result.user.id === currentUser.id) {
          onUpdateUser?.(result.user);
        }
        
        toast.success('User details updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update user details');
    }
  };

  const handleAdjustBalance = async (type: 'increase' | 'reduce') => {
    if (!editingUser || !adjustmentAmount) return;
    
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount)) return;

    const currentBalance = Number(editingUser.balance);
    const newBalance = type === 'increase' ? currentBalance + amount : currentBalance - amount;
    const finalBalance = Math.max(0, newBalance);

    try {
      const result = await api.updateBalance(editingUser.id, finalBalance, `Manual ${type} by admin`);
      
      if (result.status === 'ok') {
        setUsers(users.map(u => u.id === editingUser.id ? result.user : u));
        setEditingUser(result.user);
        
        // Update global session if it's the current user
        if (currentUser && result.user.id === currentUser.id) {
          onUpdateUser?.(result.user);
        }
        
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (window.confirm('This will clear all local browser data and reload the app. Continue?')) {
                api.resetLocalData();
              }
            }}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2",
              theme === 'dark' ? "bg-zinc-900 text-red-400" : "bg-red-50 text-red-600"
            )}
            title="Reset Local Data (Static Mode)"
          >
            <Trash2 size={16} />
            <span className="text-[9px] font-bold uppercase tracking-widest hidden md:block">Reset Data</span>
          </button>
          <button 
            onClick={() => {
              setIsLoading(true);
              fetchData();
            }}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-90",
              theme === 'dark' ? "bg-zinc-900 text-zinc-400" : "bg-gray-100 text-gray-600"
            )}
          >
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={cn(
        "p-1 rounded-2xl flex gap-1",
        theme === 'dark' ? "bg-zinc-900" : "bg-gray-100"
      )}>
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'users' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('deposits')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'deposits' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Bank Accounts
        </button>
        <button 
          onClick={() => setActiveTab('crypto')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'crypto' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Crypto
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'withdrawals' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Withdrawals
          {pendingWithdrawals.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('pending_deposits')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'pending_deposits' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Deposits
          {pendingDeposits.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
              {pendingDeposits.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={cn(
            "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'support' 
              ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "bg-white text-gray-900 shadow-sm")
              : "text-gray-500"
          )}
        >
          Support
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
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
                  onClick={() => {
                    setEditingUser(user);
                    setEditAccountNumber(user.accountNumber || '');
                    setEditSortCode(user.sortCode || '');
                  }}
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
        </>
      ) : activeTab === 'deposits' ? (
        <div className="space-y-6">
          {/* Add New Account */}
          <div className={cn(
            "p-5 rounded-[2rem] space-y-4",
            theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-gray-50"
          )}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Add Deposit Account</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Bank Name"
                value={newAccount.bankName}
                onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              />
              <input 
                type="text" 
                placeholder="Account Name"
                value={newAccount.accountName}
                onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              />
              <input 
                type="text" 
                placeholder="Account Number"
                value={newAccount.accountNumber}
                onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              />
              <button 
                onClick={handleAddDepositAccount}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Plus size={16} />
                Add Account
              </button>
            </div>
          </div>

          {/* Account List */}
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Active Deposit Channels</h3>
            <div className="space-y-2">
              {depositAccounts.map((acc) => (
                <div 
                  key={acc.id}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-white">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{acc.bankName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{acc.accountNumber} • {acc.accountName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteDepositAccount(acc.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'withdrawals' ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Pending Withdrawal Requests ({pendingWithdrawals.length})</h3>
            <div className="space-y-3">
              {pendingWithdrawals.length === 0 ? (
                <div className={cn(
                  "p-10 rounded-2xl border-2 border-dashed text-center space-y-2",
                  theme === 'dark' ? "border-zinc-800 bg-zinc-900/20" : "border-gray-100 bg-gray-50/50"
                )}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Pending Withdrawals</p>
                  <p className="text-[8px] text-gray-400">All withdrawal requests have been processed.</p>
                </div>
              ) : (
                pendingWithdrawals.map((tx) => (
                  <div 
                    key={tx.id}
                    className={cn(
                      "p-4 rounded-2xl border space-y-4",
                      theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                          <ArrowDownCircle size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{tx.userName || 'Unknown User'}</p>
                          <p className="text-[9px] text-gray-500 font-medium">{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                          {tx.details?.accountNumber && (
                            <p className="text-[9px] text-indigo-500 font-bold mt-1">
                              {tx.details.bankName}: {tx.details.accountNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">-${tx.amount.toLocaleString()}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">{tx.details?.method || 'Bank Transfer'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200 dark:border-zinc-800">
                      <button 
                        onClick={() => handleApproveWithdrawal(tx.id)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectWithdrawal(tx.id)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all",
                          theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'pending_deposits' ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Pending Deposit Requests ({pendingDeposits.length})</h3>
            <div className="space-y-3">
              {pendingDeposits.length === 0 ? (
                <div className={cn(
                  "p-10 rounded-2xl border-2 border-dashed text-center space-y-2",
                  theme === 'dark' ? "border-zinc-800 bg-zinc-900/20" : "border-gray-100 bg-gray-50/50"
                )}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Pending Deposits</p>
                  <p className="text-[8px] text-gray-400">All deposit requests have been processed.</p>
                </div>
              ) : (
                pendingDeposits.map((tx) => (
                  <div 
                    key={tx.id}
                    className={cn(
                      "p-4 rounded-2xl border space-y-4",
                      theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <ArrowUpCircle size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{tx.userName || 'Unknown User'}</p>
                          <p className="text-[9px] text-gray-500 font-medium">{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                          {tx.details?.method && (
                            <p className="text-[9px] text-indigo-500 font-bold mt-1">
                              Method: {tx.details.method}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">+${tx.amount.toLocaleString()}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Pending Approval</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200 dark:border-zinc-800">
                      <button 
                        onClick={() => handleApproveDeposit(tx.id)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectDeposit(tx.id)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all",
                          theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'support' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User List */}
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Active Conversations</h3>
              <div className="space-y-1.5">
                {chatUsers.length === 0 && (
                  <p className="text-[10px] text-gray-500 text-center py-10">No active support requests</p>
                )}
                {chatUsers.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserForChat(u.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border transition-all flex items-center gap-3",
                      selectedUserForChat === u.id
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : (theme === 'dark' ? "bg-zinc-900/50 border-zinc-800 text-zinc-100 hover:bg-zinc-800" : "bg-white border-gray-100 text-gray-900 hover:shadow-md")
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", selectedUserForChat === u.id ? "bg-white/20" : "bg-indigo-100 text-indigo-600")}>
                      <Users size={16} />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-[11px] font-bold truncate">{u.name}</p>
                      <p className={cn("text-[8px] truncate", selectedUserForChat === u.id ? "text-white/70" : "text-gray-500")}>
                        {allMessages.filter(m => m.userId === u.id).slice(-1)[0]?.text || 'No messages'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="md:col-span-2">
              {selectedUserForChat ? (
                <div className={cn(
                  "rounded-2xl border flex flex-col h-[500px] overflow-hidden",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                )}>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold">Chat with {users.find(u => u.id === selectedUserForChat)?.name}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {selectedUserMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex flex-col",
                          msg.isAdmin ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] p-3 rounded-2xl text-[11px] font-medium shadow-sm",
                          msg.isAdmin 
                            ? "bg-indigo-600 text-white"
                            : (theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "bg-gray-100 text-gray-900")
                        )}>
                          {msg.text}
                        </div>
                        <p className="text-[8px] text-gray-500 mt-1 px-1">
                          {msg.isAdmin ? 'You (Admin)' : 'User'} • {format(new Date(msg.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Type reply..."
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendAdminReply()}
                        className={cn(
                          "w-full pl-4 pr-10 py-2.5 rounded-xl text-[11px] outline-none transition-all",
                          theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-indigo-500" : "bg-white border border-gray-200 text-gray-900 focus:border-indigo-500"
                        )}
                      />
                      <button 
                        onClick={handleSendAdminReply}
                        disabled={!adminReply.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-all active:scale-90"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "h-[500px] rounded-2xl border flex flex-col items-center justify-center text-center p-10 space-y-3",
                  theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-gray-50/50 border-gray-100 border-dashed"
                )}>
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Select a conversation</p>
                  <p className="text-[10px] text-gray-400 max-w-[200px]">Choose a user from the list to view their messages and provide assistance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Address Update */}
          <div className={cn(
            "p-5 rounded-[2rem] space-y-4",
            theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-gray-50"
          )}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Quick Address Update</h3>
            <div className="space-y-3">
              <select 
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-white border border-gray-200 text-gray-900"
                )}
                value={editingWalletId || ''}
                onChange={(e) => {
                  const wallet = cryptoWallets.find(w => w.id === e.target.value);
                  if (wallet) {
                    setEditingWalletId(wallet.id);
                    setUpdatedAddress(wallet.address);
                  } else {
                    setEditingWalletId(null);
                    setUpdatedAddress('');
                  }
                }}
              >
                <option value="">Select Coin to Update...</option>
                {cryptoWallets.map(w => (
                  <option key={w.id} value={w.id}>{w.coin} ({w.symbol})</option>
                ))}
              </select>
              
              {editingWalletId && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <input 
                    type="text" 
                    placeholder="New Wallet Address"
                    value={updatedAddress}
                    onChange={(e) => setUpdatedAddress(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                      theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                    )}
                  />
                  <button 
                    onClick={() => handleUpdateCryptoWallet(editingWalletId)}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <Save size={16} />
                    Update Address
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Add New Crypto Wallet */}
          <div className={cn(
            "p-5 rounded-[2rem] space-y-4",
            theme === 'dark' ? "bg-zinc-900 border border-zinc-800" : "bg-gray-50"
          )}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Add Crypto Wallet</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Coin (e.g. Bitcoin)"
                  value={newWallet.coin}
                  onChange={(e) => setNewWallet({...newWallet, coin: e.target.value})}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[11px] outline-none",
                    theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                  )}
                />
                <input 
                  type="text" 
                  placeholder="Symbol (e.g. BTC)"
                  value={newWallet.symbol}
                  onChange={(e) => setNewWallet({...newWallet, symbol: e.target.value})}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[11px] outline-none",
                    theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                  )}
                />
              </div>
              <input 
                type="text" 
                placeholder="Wallet Address"
                value={newWallet.address}
                onChange={(e) => setNewWallet({...newWallet, address: e.target.value})}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              />
              <input 
                type="text" 
                placeholder="Network (e.g. ERC20, BTC)"
                value={newWallet.network}
                onChange={(e) => setNewWallet({...newWallet, network: e.target.value})}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-[11px] outline-none",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              />
              <button 
                onClick={handleAddCryptoWallet}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus size={16} />
                Add Wallet
              </button>
            </div>
          </div>

          {/* Wallet List */}
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Active Crypto Channels</h3>
            <div className="space-y-2">
              {cryptoWallets.map((wallet) => (
                <div 
                  key={wallet.id}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col gap-3",
                    theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-gradient flex items-center justify-center text-white">
                        <Bitcoin size={20} />
                      </div>
                      <div className="max-w-[180px]">
                        <p className="text-xs font-bold">{wallet.coin} ({wallet.symbol})</p>
                        <p className="text-[9px] text-gray-500 font-medium truncate">{wallet.address}</p>
                        <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Network: {wallet.network}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setEditingWalletId(wallet.id);
                          setUpdatedAddress(wallet.address);
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          theme === 'dark' ? "text-zinc-400 hover:bg-zinc-800" : "text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCryptoWallet(wallet.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {editingWalletId === wallet.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="pt-2 border-t border-zinc-800/50 dark:border-zinc-800/50 space-y-2"
                    >
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Update {wallet.coin} Address</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={updatedAddress}
                          onChange={(e) => setUpdatedAddress(e.target.value)}
                          placeholder="Enter new address"
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg text-[10px] outline-none",
                            theme === 'dark' ? "bg-zinc-800 border border-zinc-700" : "bg-gray-50 border border-gray-200"
                          )}
                        />
                        <button 
                          onClick={() => handleUpdateCryptoWallet(wallet.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingWalletId(null)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95",
                            theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600"
                          )}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

            <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-6 no-scrollbar">
              <div className={cn("p-4 rounded-2xl text-center space-y-1", theme === 'dark' ? "bg-zinc-800" : "bg-gray-50")}>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Current Balance</p>
                <p className={cn("text-2xl font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>${editingUser.balance.toLocaleString()}</p>
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

              <div className="space-y-3">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Account Details</p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase ml-1">Account Number</label>
                    <input 
                      type="text" 
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl text-[11px] font-mono outline-none",
                        theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-gray-100 border border-gray-200 text-gray-900"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase ml-1">Sort Code</label>
                    <input 
                      type="text" 
                      value={editSortCode}
                      onChange={(e) => setEditSortCode(e.target.value)}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl text-[11px] font-mono outline-none",
                        theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-gray-100 border border-gray-200 text-gray-900"
                      )}
                    />
                  </div>
                  <button 
                    onClick={handleUpdateUserDetails}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Save size={14} />
                    Update Details
                  </button>
                </div>
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
            </div>

            <button 
              onClick={() => setEditingUser(null)}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "bg-gray-100 text-gray-900"
              )}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
