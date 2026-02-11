import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loanService from '../../services/loanService';

// Async thunks
export const fetchActiveLoanRequests = createAsyncThunk(
  'loan/fetchActiveLoanRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getActiveLoanRequests();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLoanDetails = createAsyncThunk(
  'loan/fetchLoanDetails',
  async (loanId, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoanDetails(loanId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyLoans = createAsyncThunk(
  'loan/fetchMyLoans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getMyLoans();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyLending = createAsyncThunk(
  'loan/fetchMyLending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getMyLending();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'loan/fetchMyRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getMyRequests();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPlatformStats = createAsyncThunk(
  'loan/fetchPlatformStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getPlatformStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGasPrice = createAsyncThunk(
  'loan/fetchGasPrice',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getGasPrice();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  activeLoanRequests: [],
  myLoans: [],
  myLending: [],
  myRequests: [],
  currentLoan: null,
  platformStats: null,
  gasPrice: null,
  isLoading: false,
  error: null,
};

// Slice
const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLoan: (state) => {
      state.currentLoan = null;
    },
    resetLoans: (state) => {
      state.activeLoanRequests = [];
      state.myLoans = [];
      state.myLending = [];
      state.myRequests = [];
      state.currentLoan = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Active Loan Requests
    builder
      .addCase(fetchActiveLoanRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveLoanRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeLoanRequests = action.payload.requests || [];
      })
      .addCase(fetchActiveLoanRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Loan Details
    builder
      .addCase(fetchLoanDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLoan = action.payload.loan;
      })
      .addCase(fetchLoanDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch My Loans
    builder
      .addCase(fetchMyLoans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myLoans = action.payload.loans || [];
      })
      .addCase(fetchMyLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch My Lending
    builder
      .addCase(fetchMyLending.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLending.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myLending = action.payload.loans || [];
      })
      .addCase(fetchMyLending.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch My Requests
    builder
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests = action.payload.requests || [];
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Platform Stats
    builder
      .addCase(fetchPlatformStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.platformStats = action.payload.stats;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch Gas Price
    builder
      .addCase(fetchGasPrice.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchGasPrice.fulfilled, (state, action) => {
        state.gasPrice = action.payload.gasPrice;
      })
      .addCase(fetchGasPrice.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentLoan, resetLoans } = loanSlice.actions;
export default loanSlice.reducer;