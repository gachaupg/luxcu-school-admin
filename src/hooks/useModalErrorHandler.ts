import { useToast } from '@/components/ui/use-toast';

export interface ModalErrorHandlerOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Custom hook for handling modal form submissions with consistent error handling
 * Ensures modals stay open on errors and only close on success
 */
export const useModalErrorHandler = (options: ModalErrorHandlerOptions = {}) => {
  const { toast } = useToast();

  const handleModalSubmit = async (
    submitFn: () => Promise<void>,
    customOptions: Partial<ModalErrorHandlerOptions> = {}
  ) => {
    const finalOptions = { ...options, ...customOptions };

    try {
      await submitFn();
      
      // Show success toast
      if (finalOptions.successMessage) {
        toast({
          title: "Success",
          description: finalOptions.successMessage,
        });
      }
      
      // Call success callback (usually closes modal)
      if (finalOptions.onSuccess) {
        finalOptions.onSuccess();
      }
    } catch (error) {
      // Parse error message for better user experience
      let errorMessage = finalOptions.errorMessage || "An error occurred. Please try again.";
      
      if (error && typeof error === "object") {
        const errorObj = error as any;
        
        // Handle different error formats
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.detail) {
          errorMessage = errorObj.detail;
        } else if (errorObj.errors) {
          // Handle validation errors
          if (typeof errorObj.errors === 'object') {
            const fieldErrors = Object.entries(errorObj.errors).map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            });
            errorMessage = fieldErrors.join("; ");
          } else {
            errorMessage = String(errorObj.errors);
          }
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Show error longer for complex validation messages
      });
      
      // Call error callback (usually keeps modal open)
      if (finalOptions.onError) {
        finalOptions.onError(error);
      }
      
      // Modal stays open by default - no automatic closing
    }
  };

  const showValidationError = (message: string) => {
    toast({
      title: "Validation Error",
      description: message,
      variant: "destructive",
    });
  };

  const showSuccessMessage = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  return {
    handleModalSubmit,
    showValidationError,
    showSuccessMessage,
  };
};

export default useModalErrorHandler;
