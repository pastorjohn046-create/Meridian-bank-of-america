import { Transaction } from '../types';

// Helper to handle API calls with a fallback to localStorage for static deployments
export const api = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`/api/transactions/${userId}`);
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      console.warn('Using local storage for transactions');
      const localTxs = localStorage.getItem(`txs_${userId}`);
      return localTxs ? JSON.parse(localTxs) : [];
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
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      // Save to a local "users" list
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      users.push(newUser);
      localStorage.setItem('local_users', JSON.stringify(users));
      return { status: 'ok', user: newUser };
    }
  },

  async getUsers() {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem('local_users') || '[]');
    }
  }
};
