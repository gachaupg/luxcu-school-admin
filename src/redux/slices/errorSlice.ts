import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppError {
  id: string;
  message: string;
  details?: string;
  type: 'network' | 'api' | 'validation' | 'auth' | 'unknown';
  timestamp: string;
  component?: string;
  action?: string;
  stack?: string;
  recoverable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  lastOnlineTime?: string;
  retryAttempts: number;
}

interface ErrorState {
  errors: AppError[];
  networkStatus: NetworkStatus;
  isGlobalErrorVisible: boolean;
  lastErrorId: string | null;
}

const initialState: ErrorState = {
  errors: [],
  networkStatus: {
    isOnline: navigator.onLine,
    lastOnlineTime: new Date().toISOString(),
    retryAttempts: 0,
  },
  isGlobalErrorVisible: false,
  lastErrorId: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Add a new error
    addError: (state, action: PayloadAction<Omit<AppError, 'id' | 'timestamp'>>) => {
      const error: AppError = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: action.payload.maxRetries || 3,
      };
      
      state.errors.push(error);
      state.lastErrorId = error.id;
      
      // Show global error for critical errors
      if (error.type === 'network' || error.type === 'auth') {
        state.isGlobalErrorVisible = true;
      }
    },

    // Remove an error by ID
    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
      
      // Hide global error if no critical errors remain
      const hasCriticalErrors = state.errors.some(error => 
        error.type === 'network' || error.type === 'auth'
      );
      if (!hasCriticalErrors) {
        state.isGlobalErrorVisible = false;
      }
    },

    // Clear all errors
    clearErrors: (state) => {
      state.errors = [];
      state.isGlobalErrorVisible = false;
      state.lastErrorId = null;
    },

    // Clear errors by type
    clearErrorsByType: (state, action: PayloadAction<AppError['type']>) => {
      state.errors = state.errors.filter(error => error.type !== action.payload);
      
      // Update global error visibility
      const hasCriticalErrors = state.errors.some(error => 
        error.type === 'network' || error.type === 'auth'
      );
      if (!hasCriticalErrors) {
        state.isGlobalErrorVisible = false;
      }
    },

    // Update network status
    updateNetworkStatus: (state, action: PayloadAction<Partial<NetworkStatus>>) => {
      state.networkStatus = {
        ...state.networkStatus,
        ...action.payload,
      };
    },

    // Increment retry count for an error
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const error = state.errors.find(error => error.id === action.payload);
      if (error && error.retryCount !== undefined) {
        error.retryCount += 1;
      }
    },

    // Mark error as resolved
    markErrorResolved: (state, action: PayloadAction<string>) => {
      const error = state.errors.find(error => error.id === action.payload);
      if (error) {
        error.recoverable = false;
      }
    },

    // Set global error visibility
    setGlobalErrorVisibility: (state, action: PayloadAction<boolean>) => {
      state.isGlobalErrorVisible = action.payload;
    },

    // Add batch of errors (useful for API validation errors)
    addBatchErrors: (state, action: PayloadAction<Omit<AppError, 'id' | 'timestamp'>[]>) => {
      const errors: AppError[] = action.payload.map(error => ({
        ...error,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: error.maxRetries || 3,
      }));
      
      state.errors.push(...errors);
      
      // Show global error if any critical errors
      const hasCriticalErrors = errors.some(error => 
        error.type === 'network' || error.type === 'auth'
      );
      if (hasCriticalErrors) {
        state.isGlobalErrorVisible = true;
      }
    },
  },
});

export const {
  addError,
  removeError,
  clearErrors,
  clearErrorsByType,
  updateNetworkStatus,
  incrementRetryCount,
  markErrorResolved,
  setGlobalErrorVisibility,
  addBatchErrors,
} = errorSlice.actions;

// Selectors
export const selectErrors = (state: { error: ErrorState }) => state.error.errors;
export const selectNetworkStatus = (state: { error: ErrorState }) => state.error.networkStatus;
export const selectIsGlobalErrorVisible = (state: { error: ErrorState }) => state.error.isGlobalErrorVisible;
export const selectLastError = (state: { error: ErrorState }) => {
  const errors = state.error.errors;
  return errors.length > 0 ? errors[errors.length - 1] : null;
};
export const selectErrorsByType = (type: AppError['type']) => (state: { error: ErrorState }) => 
  state.error.errors.filter(error => error.type === type);
export const selectRecoverableErrors = (state: { error: ErrorState }) => 
  state.error.errors.filter(error => error.recoverable);

export default errorSlice.reducer;

