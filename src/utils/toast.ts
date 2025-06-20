import { toast } from "@/components/ui/use-toast";

export const showToast = {
  success: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  },
  error: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  },
  warning: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "warning",
    });
  },
  info: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  },
};
