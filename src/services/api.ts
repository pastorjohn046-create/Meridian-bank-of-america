import { Transaction } from '../types';

// Helper to handle API calls with a fallback to localStorage for static deployments
// This ensures the app works even on static hosts like Netlify where the Express server isn't running
export const api = {
  // --- Users ---
  async getUsers() {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const local = localStorage.getItem('local_users');
      if (!local) {
        // Seed initial admin user if empty
        const initialUsers = [{
          id: 'admin-1',
          name: 'System Admin',
          email: 'Jobfindercorps@gmail.com',
          pin: '1234',
          balance: 1000000,
          accountNumber: '8822 4411 9900',
          sortCode: '20-44-99',
          status: 'active',
          joinDate: '2024-01-01'
        }];
        localStorage.setItem('local_users', JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(local);
    }
  },

  async registerUser(userData: any) {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) return { status: 'error', message: data.message || 'Registration failed' };
      return data;
    } catch (error) {
      console.warn('Using local storage for registration');
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        balance: 0,
        accountNumber: '8822 4411 ' + Math.floor(1000 + Math.random() * 9000),
        sortCode: '20-44-99',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      users.push(newUser);
      localStorage.setItem('local_users', JSON.stringify(users));
      return { status: 'ok', user: newUser };
    }
  },

  async loginUser(email: string, pin: string) {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      const data = await response.json();
      if (!response.ok) return { status: 'error', message: data.message || 'Login failed' };
      return data;
    } catch (error) {
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const user = users.find((u: any) => u.email === email);
      if (user) return { status: 'ok', user };
      return { status: 'error', message: 'User not found' };
    }
  },

  async updateUserDetails(id: string, details: any) {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...details })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const index = users.findIndex((u: any) => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...details };
        localStorage.setItem('local_users', JSON.stringify(users));
        
        // Sync with current session if it's the same user
        const currentSession = localStorage.getItem('meridian_user');
        if (currentSession) {
          const loggedInUser = JSON.parse(currentSession);
          if (loggedInUser.id === id) {
            const updatedLoggedInUser = { ...loggedInUser, ...details };
            localStorage.setItem('meridian_user', JSON.stringify(updatedLoggedInUser));
          }
        }
        
        return { status: 'ok', user: users[index] };
      }
      return { status: 'error', message: 'User not found' };
    }
  },

  async updateBalance(id: string, balance: number) {
    try {
      const response = await fetch('/api/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, balance })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const index = users.findIndex((u: any) => u.id === id);
      if (index !== -1) {
        users[index].balance = balance;
        localStorage.setItem('local_users', JSON.stringify(users));
        
        // Sync with current session if it's the same user
        const currentSession = localStorage.getItem('meridian_user');
        if (currentSession) {
          const loggedInUser = JSON.parse(currentSession);
          if (loggedInUser.id === id) {
            loggedInUser.balance = balance;
            localStorage.setItem('meridian_user', JSON.stringify(loggedInUser));
          }
        }
        
        return { status: 'ok', user: users[index] };
      }
      return { status: 'error', message: 'User not found' };
    }
  },

  // --- Deposit Accounts ---
  async getDepositAccounts() {
    try {
      const response = await fetch('/api/deposit-accounts');
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem('local_deposit_accounts') || '[]');
    }
  },

  async addDepositAccount(account: any) {
    try {
      const response = await fetch('/api/admin/deposit-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const accounts = JSON.parse(localStorage.getItem('local_deposit_accounts') || '[]');
      const newAccount = { ...account, id: Date.now().toString() };
      accounts.push(newAccount);
      localStorage.setItem('local_deposit_accounts', JSON.stringify(accounts));
      return { status: 'ok', account: newAccount };
    }
  },

  async deleteDepositAccount(id: string) {
    try {
      const response = await fetch(`/api/admin/deposit-accounts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const accounts = JSON.parse(localStorage.getItem('local_deposit_accounts') || '[]');
      const filtered = accounts.filter((a: any) => a.id !== id);
      localStorage.setItem('local_deposit_accounts', JSON.stringify(filtered));
      return { status: 'ok' };
    }
  },

  // --- Crypto Wallets ---
  async getCryptoWallets() {
    try {
      const response = await fetch('/api/crypto-wallets');
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem('local_crypto_wallets') || '[]');
    }
  },

  async addCryptoWallet(wallet: any) {
    try {
      const response = await fetch('/api/admin/crypto-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallet)
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const wallets = JSON.parse(localStorage.getItem('local_crypto_wallets') || '[]');
      const newWallet = { ...wallet, id: Date.now().toString() };
      wallets.push(newWallet);
      localStorage.setItem('local_crypto_wallets', JSON.stringify(wallets));
      return { status: 'ok', wallet: newWallet };
    }
  },

  async updateCryptoWallet(id: string, address: string) {
    try {
      const response = await fetch(`/api/admin/crypto-wallets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const wallets = JSON.parse(localStorage.getItem('local_crypto_wallets') || '[]');
      const index = wallets.findIndex((w: any) => w.id === id);
      if (index !== -1) {
        wallets[index].address = address;
        localStorage.setItem('local_crypto_wallets', JSON.stringify(wallets));
        return { status: 'ok', wallet: wallets[index] };
      }
      return { status: 'error', message: 'Wallet not found' };
    }
  },

  async deleteCryptoWallet(id: string) {
    try {
      const response = await fetch(`/api/admin/crypto-wallets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const wallets = JSON.parse(localStorage.getItem('local_crypto_wallets') || '[]');
      const filtered = wallets.filter((w: any) => w.id !== id);
      localStorage.setItem('local_crypto_wallets', JSON.stringify(filtered));
      return { status: 'ok' };
    }
  },

  // --- Transactions ---
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`/api/transactions/${userId}`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const localTxs = localStorage.getItem(`txs_${userId}`);
      return localTxs ? JSON.parse(localTxs) : [];
    }
  },

  async createTransaction(txData: any) {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const txs = JSON.parse(localStorage.getItem(`txs_${txData.userId}`) || '[]');
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const user = users.find((u: any) => u.id === txData.userId);
      
      const newTx = {
        ...txData,
        id: Date.now().toString(),
        userName: user ? user.name : 'Unknown',
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      txs.push(newTx);
      localStorage.setItem(`txs_${txData.userId}`, JSON.stringify(txs));
      
      // Also store in a global pending withdrawals list for admin
      if (txData.type === 'withdraw') {
        const allWithdrawals = JSON.parse(localStorage.getItem('local_pending_withdrawals') || '[]');
        allWithdrawals.push(newTx);
        localStorage.setItem('local_pending_withdrawals', JSON.stringify(allWithdrawals));
      }

      return { status: 'ok', transaction: newTx };
    }
  },

  async getPendingWithdrawals() {
    try {
      const response = await fetch('/api/admin/withdrawals');
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem('local_pending_withdrawals') || '[]');
    }
  },

  async approveWithdrawal(id: string) {
    try {
      const response = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const allWithdrawals = JSON.parse(localStorage.getItem('local_pending_withdrawals') || '[]');
      const txIndex = allWithdrawals.findIndex((t: any) => t.id === id);
      
      if (txIndex !== -1) {
        const tx = allWithdrawals[txIndex];
        const users = JSON.parse(localStorage.getItem('local_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === tx.userId);
        
        if (userIndex !== -1) {
          if (users[userIndex].balance < tx.amount) {
            return { status: 'error', message: 'Insufficient balance' };
          }
          
          // Deduct balance
          users[userIndex].balance -= tx.amount;
          localStorage.setItem('local_users', JSON.stringify(users));
          
          // Update transaction status in user's list
          const userTxs = JSON.parse(localStorage.getItem(`txs_${tx.userId}`) || '[]');
          const userTxIndex = userTxs.findIndex((t: any) => t.id === id);
          if (userTxIndex !== -1) {
            userTxs[userTxIndex].status = 'completed';
            localStorage.setItem(`txs_${tx.userId}`, JSON.stringify(userTxs));
          }
          
          // Remove from pending
          allWithdrawals.splice(txIndex, 1);
          localStorage.setItem('local_pending_withdrawals', JSON.stringify(allWithdrawals));
          
          return { status: 'ok', user: users[userIndex] };
        }
      }
      return { status: 'error', message: 'Withdrawal not found' };
    }
  },

  async rejectWithdrawal(id: string) {
    try {
      const response = await fetch('/api/admin/withdrawals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const allWithdrawals = JSON.parse(localStorage.getItem('local_pending_withdrawals') || '[]');
      const txIndex = allWithdrawals.findIndex((t: any) => t.id === id);
      
      if (txIndex !== -1) {
        const tx = allWithdrawals[txIndex];
        
        // Update transaction status in user's list
        const userTxs = JSON.parse(localStorage.getItem(`txs_${tx.userId}`) || '[]');
        const userTxIndex = userTxs.findIndex((t: any) => t.id === id);
        if (userTxIndex !== -1) {
          userTxs[userTxIndex].status = 'failed';
          localStorage.setItem(`txs_${tx.userId}`, JSON.stringify(userTxs));
        }
        
        // Remove from pending
        allWithdrawals.splice(txIndex, 1);
        localStorage.setItem('local_pending_withdrawals', JSON.stringify(allWithdrawals));
        
        return { status: 'ok' };
      }
      return { status: 'error', message: 'Withdrawal not found' };
    }
  },

  // --- Withdrawal Methods (User Specific) ---
  async getWithdrawalMethods(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/withdrawal-methods`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem(`withdrawal_methods_${userId}`) || '[]');
    }
  },

  async addWithdrawalMethod(userId: string, method: any) {
    try {
      const response = await fetch(`/api/users/${userId}/withdrawal-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method)
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      const methods = JSON.parse(localStorage.getItem(`withdrawal_methods_${userId}`) || '[]');
      const newMethod = { ...method, id: Date.now().toString() };
      methods.push(newMethod);
      localStorage.setItem(`withdrawal_methods_${userId}`, JSON.stringify(methods));
      return { status: 'ok', method: newMethod };
    }
  },

  // --- Support Messages ---
  async getMessages(userId: string) {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem(`messages_${userId}`) || '[]');
    }
  }
};
