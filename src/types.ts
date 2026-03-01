export type Currency = 'USD' | 'EUR' | 'GBP';
export type Crypto = 'BTC' | 'ETH' | 'SOL' | 'USDC';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'exchange' | 'buy' | 'sell';
  asset: string;
  amount: number;
  fiatAmount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  counterparty?: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  fiatValue: number;
  change24h: number;
  type: 'fiat' | 'crypto';
  color: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  history: { time: string; price: number }[];
}
