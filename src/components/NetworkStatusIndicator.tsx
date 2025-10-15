import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateNetworkStatus } from '@/redux/slices/errorSlice';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/utils/toast';

const NetworkStatusIndicator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOnline, retryAttempts } = useAppSelector(state => state.error.networkStatus);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(updateNetworkStatus({ 
        isOnline: true, 
        lastOnlineTime: new Date().toISOString(),
        retryAttempts: 0 
      }));
      setShowIndicator(true);
      showToast.success('Connection Restored', 'You are back online');
      
      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      dispatch(updateNetworkStatus({ isOnline: false }));
      setShowIndicator(true);
      showToast.error('Connection Lost', 'You are currently offline');
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine && isOnline) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, isOnline]);

  const handleRetryConnection = async () => {
    setIsReconnecting(true);
    
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        dispatch(updateNetworkStatus({ 
          isOnline: true, 
          lastOnlineTime: new Date().toISOString(),
          retryAttempts: 0 
        }));
        setShowIndicator(false);
        showToast.success('Connection Restored', 'You are back online');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      dispatch(updateNetworkStatus({ retryAttempts: retryAttempts + 1 }));
      showToast.error('Connection Failed', 'Unable to establish connection. Please check your internet.');
    } finally {
      setIsReconnecting(false);
    }
  };

  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg border
        ${isOnline 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }
      `}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">You're Offline</span>
              <span className="text-xs text-red-600">
                Check your internet connection
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetryConnection}
              disabled={isReconnecting}
              className="ml-2 h-7 text-xs"
            >
              {isReconnecting ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;

