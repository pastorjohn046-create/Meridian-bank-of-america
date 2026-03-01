import { Asset, Transaction } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'USD',
    name: 'US Dollar',
    balance: 0,
    fiatValue: 0,
    change24h: 0,
    type: 'fiat',
    color: '#10b981'
  },
  {
    id: '2',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0,
    fiatValue: 0,
    change24h: 2.4,
    type: 'crypto',
    color: '#f59e0b'
  },
  {
    id: '3',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0,
    fiatValue: 0,
    change24h: -1.2,
    type: 'crypto',
    color: '#6366f1'
  },
  {
    id: '4',
    symbol: 'SOL',
    name: 'Solana',
    balance: 0,
    fiatValue: 0,
    change24h: 5.8,
    type: 'crypto',
    color: '#14f195'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'receive',
    asset: 'BTC',
    amount: 0.05,
    fiatAmount: 3150.00,
    timestamp: new Date(Date.now() - 3600000 * 2),
    status: 'completed',
    counterparty: 'External Wallet'
  },
  {
    id: 't2',
    type: 'exchange',
    asset: 'USD to ETH',
    amount: 1200,
    fiatAmount: 1200,
    timestamp: new Date(Date.now() - 3600000 * 24),
    status: 'completed'
  },
  {
    id: 't3',
    type: 'send',
    asset: 'USD',
    amount: 45.50,
    fiatAmount: 45.50,
    timestamp: new Date(Date.now() - 3600000 * 48),
    status: 'completed',
    counterparty: 'Starbucks Coffee'
  }
];

export const MOCK_MARKET_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  price: 60000 + Math.random() * 5000
}));
