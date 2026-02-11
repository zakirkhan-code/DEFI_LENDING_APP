import api from './api';

export const userService = {
  // Get user credit score
  getCreditScore: async () => {
    return await api.get('/users/credit-score');
  },

  // Get user statistics
  getUserStats: async () => {
    return await api.get('/users/stats');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },
};

export default userService;