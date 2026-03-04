import { Transaction } from '../types';

export const api = {
  // --- Users ---
  async getUsers() {
    try {
      const response = await fetch(`/api/users?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('API Error (getUsers):', error);
      throw error;
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
      console.error('API Error (registerUser):', error);
      return { status: 'error', message: 'Server connection failed. Please try again.' };
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
      console.error('API Error (loginUser):', error);
      return { status: 'error', message: 'Server connection failed. Please try again.' };
    }
  },

  async updateUserDetails(id: string, details: any) {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...details })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API failed');
      }
      return await response.json();
    } catch (error: any) {
      console.error('Update user details failed:', error);
      return { status: 'error', message: error.message || 'Server connection failed' };
    }
  },

  async updateBalance(id: string, balance: number, note?: string) {
    try {
      const response = await fetch('/api/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, balance, note })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API failed');
      }
      return await response.json();
    } catch (error: any) {
      console.error('Update balance failed:', error);
      return { status: 'error', message: error.message || 'Server connection failed' };
    }
  },

  async syncCurrentUser(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      const user = await response.json();
      localStorage.setItem('hsbc_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Sync current user failed:', error);
      return null;
    }
  },

  // --- Deposit Accounts ---
  async getDepositAccounts() {
    try {
      const response = await fetch(`/api/deposit-accounts?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get deposit accounts failed:', error);
      throw error;
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
      console.error('Add deposit account failed:', error);
      throw error;
    }
  },

  async deleteDepositAccount(id: string) {
    try {
      const response = await fetch(`/api/admin/deposit-accounts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Delete deposit account failed:', error);
      throw error;
    }
  },

  // --- Crypto Wallets ---
  async getCryptoWallets() {
    try {
      const response = await fetch(`/api/crypto-wallets?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get crypto wallets failed:', error);
      throw error;
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
      console.error('Add crypto wallet failed:', error);
      throw error;
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
      console.error('Update crypto wallet failed:', error);
      throw error;
    }
  },

  async deleteCryptoWallet(id: string) {
    try {
      const response = await fetch(`/api/admin/crypto-wallets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Delete crypto wallet failed:', error);
      throw error;
    }
  },

  // --- Transactions ---
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`/api/transactions/${userId}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get transactions failed:', error);
      throw error;
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
      console.error('Create transaction failed:', error);
      throw error;
    }
  },

  async getPendingWithdrawals() {
    try {
      const response = await fetch(`/api/admin/withdrawals?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get pending withdrawals failed:', error);
      throw error;
    }
  },

  async getPendingDeposits() {
    try {
      const response = await fetch(`/api/admin/deposits?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get pending deposits failed:', error);
      throw error;
    }
  },

  async approveDeposit(id: string) {
    try {
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Approve deposit failed:', error);
      throw error;
    }
  },

  async rejectDeposit(id: string) {
    try {
      const response = await fetch('/api/admin/deposits/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Reject deposit failed:', error);
      throw error;
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
      console.error('Approve withdrawal failed:', error);
      throw error;
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
      console.error('Reject withdrawal failed:', error);
      throw error;
    }
  },

  // --- Withdrawal Methods (User Specific) ---
  async getWithdrawalMethods(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/withdrawal-methods`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get withdrawal methods failed:', error);
      throw error;
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
      console.error('Add withdrawal method failed:', error);
      throw error;
    }
  },

  // --- Support Messages ---
  async getMessages(userId: string) {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Get messages failed:', error);
      throw error;
    }
  },

  async sendMessage(messageData: any) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  resetLocalData() {
    localStorage.clear();
    window.location.reload();
  }
};
