import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createSchoolSubscription } from "@/redux/slices/schoolSubscriptionsSlice";
import { fetchSchools } from "@/redux/slices/schoolsSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Building2 } from "lucide-react";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { schools } = useAppSelector((state) => state.schools);
  const { creating } = useAppSelector((state) => state.schoolSubscriptions);

  const [formData, setFormData] = useState({
    school: "",
    plan: "",
    billing_cycle: "monthly",
    start_date: "",
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSchools());
    }
  }, [isOpen, dispatch]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.school || !formData.plan || !formData.start_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const subscriptionData = {
        ...formData,
        school: parseInt(formData.school),
      };

      await dispatch(createSchoolSubscription(subscriptionData)).unwrap();
      
      toast({
        title: "Subscription Created",
        description: "School subscription has been created successfully.",
      });
      
      // Reset form
      setFormData({
        school: "",
        plan: "",
        billing_cycle: "monthly",
        start_date: "",
      });
      
      onClose();
    } catch (error) {
      // Parse error message for better user experience
      let errorMessage = "Failed to create subscription. Please try again.";
      
      if (error && typeof error === "object") {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.detail) {
          errorMessage = errorObj.detail;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Modal stays open to allow user to fix the issue
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Create New Subscription
          </DialogTitle>
          <DialogDescription>
            Create a new subscription for a school.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Select
              value={formData.school}
              onValueChange={(value) => handleInputChange("school", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {school.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) => handleInputChange("plan", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic_school">Basic School Plan</SelectItem>
                <SelectItem value="premium_school">Premium School Plan</SelectItem>
                <SelectItem value="enterprise_school">Enterprise School Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_cycle">Billing Cycle</Label>
            <Select
              value={formData.billing_cycle}
              onValueChange={(value) => handleInputChange("billing_cycle", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionModal; 