import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_BASE_URL } from '../utils/constants';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('=================================');
      console.log('🚀 Register Function Called');
      console.log('📡 Base URL:', API_BASE_URL);
      console.log('📦 User Data:', userData);
      console.log('=================================');
      
      const response = await api.post('/auth/register', userData);
      
      console.log('=================================');
      console.log('✅ Registration Response:', response);
      console.log('=================================');
      
      if (response.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        console.log('✅ Token & User saved to storage');
      }
      
      return response;
    } catch (error) {
      console.log('=================================');
      console.error('❌ Registration Error:', error);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Stack:', error.stack);
      console.log('=================================');
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('🔑 Login attempt:', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login Error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.WALLET_ADDRESS,
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Get current user from backend
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Connect wallet
  connectWallet: async (walletAddress) => {
    try {
      const response = await api.put('/auth/connect-wallet', { walletAddress });
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, walletAddress);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if logged in
  isLoggedIn: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get stored user
  getStoredUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },

  // Get stored token
  getStoredToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      return null;
    }
  },
};

export default authService;