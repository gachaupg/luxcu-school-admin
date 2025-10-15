import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addError, removeError, clearErrorsByType, incrementRetryCount } from '@/redux/slices/errorSlice';
import { showToast } from '@/utils/toast';
import { AppError } from '@/redux/slices/errorSlice';

export const useErrorHandler = () => {
  const dispatch = useAppDispatch();
  const errors = useAppSelector(state => state.error.errors);
  const networkStatus = useAppSelector(state => state.error.networkStatus);

  const handleError = useCallback((
    error: Error | string,
    options: {
      type?: AppError['type'];
      component?: string;
      action?: string;
      recoverable?: boolean;
      maxRetries?: number;
      showToast?: boolean;
      toastTitle?: string;
      toastMessage?: string;
    } = {}
  ) => {
    const {
      type = 'unknown',
      component,
      action,
      recoverable = true,
      maxRetries = 3,
      showToast: shouldShowToast = true,
      toastTitle = 'Error',
      toastMessage,
    } = options;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorData: Omit<AppError, 'id' | 'timestamp'> = {
      message: errorMessage,
      type,
      component,
      action,
      stack: errorStack,
      recoverable,
      maxRetries,
    };

    dispatch(addError(errorData));

    // Show toast notification
    if (shouldShowToast) {
      const message = toastMessage || errorMessage;
      
      switch (type) {
        case 'network':
          showToast.error('Connection Error', 'Please check your internet connection and try again.');
          break;
        case 'auth':
          showToast.error('Authentication Error', 'Please log in again to continue.');
          break;
        case 'validation':
          showToast.error('Validation Error', message);
          break;
        case 'api':
          showToast.error('Request Failed', message);
          break;
        default:
          showToast.error(toastTitle, message);
      }
    }
  }, [dispatch]);

  const handleNetworkError = useCallback((error: Error | string) => {
    handleError(error, {
      type: 'network',
      showToast: true,
      toastTitle: 'Connection Error',
      toastMessage: 'Please check your internet connection and try again.',
    });
  }, [handleError]);

  const handleAuthError = useCallback((error: Error | string) => {
    handleError(error, {
      type: 'auth',
      showToast: true,
      toastTitle: 'Authentication Error',
      toastMessage: 'Please log in again to continue.',
    });
  }, [handleError]);

  const handleValidationError = useCallback((
    error: Error | string,
    component?: string,
    action?: string
  ) => {
    handleError(error, {
      type: 'validation',
      component,
      action,
      showToast: true,
      toastTitle: 'Validation Error',
    });
  }, [handleError]);

  const handleApiError = useCallback((
    error: Error | string,
    component?: string,
    action?: string
  ) => {
    handleError(error, {
      type: 'api',
      component,
      action,
      showToast: true,
      toastTitle: 'Request Failed',
    });
  }, [handleError]);

  const retryError = useCallback((errorId: string) => {
    dispatch(incrementRetryCount(errorId));
  }, [dispatch]);

  const dismissError = useCallback((errorId: string) => {
    dispatch(removeError(errorId));
  }, [dispatch]);

  const clearErrors = useCallback((type?: AppError['type']) => {
    if (type) {
      dispatch(clearErrorsByType(type));
    } else {
      // Clear all errors - you might want to implement this action
      errors.forEach(error => dispatch(removeError(error.id)));
    }
  }, [dispatch, errors]);

  const getErrorsByType = useCallback((type: AppError['type']) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  const getErrorsByComponent = useCallback((component: string) => {
    return errors.filter(error => error.component === component);
  }, [errors]);

  const hasError = useCallback((type?: AppError['type']) => {
    if (type) {
      return errors.some(error => error.type === type);
    }
    return errors.length > 0;
  }, [errors]);

  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  return {
    // Error handling functions
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    handleApiError,
    
    // Error management functions
    retryError,
    dismissError,
    clearErrors,
    
    // Error query functions
    getErrorsByType,
    getErrorsByComponent,
    hasError,
    getLatestError,
    
    // State
    errors,
    networkStatus,
  };
};

export default useErrorHandler;

