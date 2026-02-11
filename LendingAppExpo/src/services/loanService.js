import api from './api';

export const loanService = {
  // Get active loan requests
  getActiveLoanRequests: async () => {
    return await api.get('/blockchain/loan-requests');
  },

  // Get loan details
  getLoanDetails: async (loanId) => {
    return await api.get(`/blockchain/loans/${loanId}`);
  },

  // Get user's loans (as borrower)
  getMyLoans: async () => {
    return await api.get('/blockchain/my-loans');
  },

  // Get user's lending history
  getMyLending: async () => {
    return await api.get('/blockchain/my-lending');
  },

  // Get user's loan requests
  getMyRequests: async () => {
    return await api.get('/blockchain/my-requests');
  },

  // Get platform statistics
  getPlatformStats: async () => {
    return await api.get('/blockchain/stats');
  },

  // Get gas price
  getGasPrice: async () => {
    return await api.get('/blockchain/gas-price');
  },

  // Verify transaction
  verifyTransaction: async (txHash) => {
    return await api.get(`/blockchain/transaction/${txHash}`);
  },

  // Get token balance
  getTokenBalance: async (address) => {
    return await api.get(`/blockchain/token-balance/${address}`);
  },

  // Get all loans from database
  getAllLoans: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await api.get(`/loans${queryParams ? `?${queryParams}` : ''}`);
  },
};

export default loanService;