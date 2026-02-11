import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Async thunks
export const fetchCreditScore = createAsyncThunk(
  'user/fetchCreditScore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getCreditScore();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  creditScore: 0,
  creditDetails: null,
  userStats: null,
  isLoading: false,
  error: null,
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUserData: (state) => {
      state.creditScore = 0;
      state.creditDetails = null;
      state.userStats = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Credit Score
    builder
      .addCase(fetchCreditScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreditScore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creditScore = action.payload.creditScore;
        state.creditDetails = action.payload.creditDetails;
      })
      .addCase(fetchCreditScore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch User Stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload.stats;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetUserData } = userSlice.actions;
export default userSlice.reducer;