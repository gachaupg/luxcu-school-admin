import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  Smartphone,
  Lock,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TestAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestAccountModal = ({ isOpen, onClose }: TestAccountModalProps) => {
  const { toast } = useToast();

  const testAccountInfo = {
    url: "https://smarshule.eujimsolutions.com/login",
    phone: "0768952248",
    password: "Test@123",
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const openTestAccount = () => {
    window.open(testAccountInfo.url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Test Account Access
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Use these credentials to access the demo account and explore our
            platform features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <ExternalLink className="h-4 w-4 mr-2 text-emerald-600" />
              Login URL
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                value={testAccountInfo.url}
                readOnly
                className="flex-1 bg-slate-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(testAccountInfo.url, "URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <Smartphone className="h-4 w-4 mr-2 text-emerald-600" />
              Phone Number
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                value={testAccountInfo.phone}
                readOnly
                className="flex-1 bg-slate-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(testAccountInfo.phone, "Phone number")
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <Lock className="h-4 w-4 mr-2 text-emerald-600" />
              Password
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                value={testAccountInfo.password}
                readOnly
                type="password"
                className="flex-1 bg-slate-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(testAccountInfo.password, "Password")
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features Badge */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-800">
                Demo Features Available
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-emerald-700">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Student Management</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Driver Management</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Route Planning</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>GPS Tracking</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={openTestAccount}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Demo Account
            </Button>
          </div>

          {/* Note */}
          <div className="text-xs text-slate-500 text-center">
            This is a demo account with sample data. All changes are temporary
            and will be reset periodically.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestAccountModal;
