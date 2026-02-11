import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // ✅ Increase to 60 seconds (was 10000)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('📡 API Request:', config.method.toUpperCase(), config.url); // ADD THIS
      console.log('📦 Data:', config.data); // ADD THIS
      
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error); // ADD THIS
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url); // ADD THIS
    return response.data;
  },
  async (error) => {
    console.error('❌ API Error:', error.message); // ADD THIS
    console.error('❌ Error Details:', error.response?.data); // ADD THIS
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      } catch (err) {
        console.error('Error clearing storage:', err);
      }
    }
    
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;