import React from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setGlobalErrorVisibility, removeError } from '@/redux/slices/errorSlice';
import { AlertTriangle, X, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const GlobalErrorBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isGlobalErrorVisible, errors } = useAppSelector(state => state.error);

  // Get critical errors (network and auth errors)
  const criticalErrors = errors.filter(error => 
    error.type === 'network' || error.type === 'auth'
  );

  const handleDismiss = () => {
    dispatch(setGlobalErrorVisibility(false));
  };

  const handleDismissError = (errorId: string) => {
    dispatch(removeError(errorId));
    
    // Hide banner if no critical errors remain
    const remainingCriticalErrors = criticalErrors.filter(error => error.id !== errorId);
    if (remainingCriticalErrors.length === 0) {
      dispatch(setGlobalErrorVisibility(false));
    }
  };

  const handleRetry = (errorId: string) => {
    // Implement retry logic based on error type
    const error = errors.find(e => e.id === errorId);
    if (error) {
      if (error.type === 'network') {
        // Retry network operations
        window.location.reload();
      } else if (error.type === 'auth') {
        // Redirect to login
        window.location.href = '/login';
      }
    }
  };

  const handleGoHome = () => {
    dispatch(setGlobalErrorVisibility(false));
    window.location.href = '/';
  };

  if (!isGlobalErrorVisible || criticalErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Critical Issues Detected
                </h3>
                <div className="space-y-2">
                  {criticalErrors.map((error) => (
                    <div key={error.id} className="text-sm text-red-700">
                      <div className="flex items-center justify-between">
                        <span>{error.message}</span>
                        <div className="flex items-center gap-2 ml-4">
                          {error.recoverable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(error.id)}
                              className="h-6 text-xs border-red-300 text-red-700 hover:bg-red-100"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissError(error.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {error.details && (
                        <div className="text-xs text-red-600 mt-1">
                          {error.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGoHome}
                className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-100"
              >
                <Home className="h-3 w-3 mr-1" />
                Go Home
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalErrorBanner;

