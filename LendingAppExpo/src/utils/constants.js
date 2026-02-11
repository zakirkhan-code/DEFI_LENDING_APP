export const API_BASE_URL = 'http://192.168.10.4:5000/api'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:5000/api'; // iOS Simulator
// export const API_BASE_URL = 'https://your-production-api.com/api'; // Production

export const BLOCKCHAIN_NETWORK = 'sepolia';
export const CHAIN_ID = 11155111;

// Replace with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  LENDING_PLATFORM: '0x7ea833495FF51a591000C5bc70b9Fb74BE4091Ed',
  LOAN_TOKEN: '0x5F7668D007FBa59F54F5Ccf8dD2c304f4766cfa3',
  CREDIT_SCORE: '0x27eCB031E8c2fFc48b8d94258723C079e3ac6046',
  LENDING_POOL: '0xbEb0784956BFB4537CB5a9c8f74a895b99d783f5',
};

export const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/o3bRe0lLz7rIfkhWPxx-rETKggQzl1GB';

export const INTEREST_RATES = [
  { label: '5%', value: 500 },
  { label: '8%', value: 800 },
  { label: '10%', value: 1000 },
  { label: '12%', value: 1200 },
  { label: '15%', value: 1500 },
];

export const LOAN_DURATIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

export const COLLATERAL_RATIO = 1.5; // 150%

export const STORAGE_KEYS = {
  TOKEN: '@lending_app:token',
  USER: '@lending_app:user',
  WALLET_ADDRESS: '@lending_app:wallet',
};