// Centralized Google Maps loader to prevent multiple script loading
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  // Return existing promise if already loading
  if (isGoogleMapsLoading && loadPromise) {
    return loadPromise;
  }

  // Return resolved promise if already loaded
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  // Check if Google Maps is already available
  if (window.google && window.google.maps) {
    isGoogleMapsLoaded = true;
    return Promise.resolve();
  }

  isGoogleMapsLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        resolve();
      });
      existingScript.addEventListener('error', () => {
        isGoogleMapsLoading = false;
        reject(new Error('Failed to load Google Maps script'));
      });
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isGoogleMapsLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && !!(window.google && window.google.maps);
};
