import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle,
  Calendar,
  Clock,
  Users,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/redux/hooks";
import { createContactMessage } from "@/redux/slices/contactMessagesSlice";

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoRequestModal = ({ isOpen, onClose }: DemoRequestModalProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    school_name: "",
    position: "",
    student_count: "",
    bus_count: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email_address: formData.email_address.trim(),
        school_name: formData.school_name.trim(),
        message: formData.message.trim(),
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: `Please fill in all required fields: ${missingFields.join(
            ", "
          )}`,
          variant: "destructive",
        });
        return;
      }

      // Build message with additional context
      const additionalInfo = [];
      if (formData.position)
        additionalInfo.push(`Position: ${formData.position}`);
      if (formData.student_count)
        additionalInfo.push(`Students: ${formData.student_count}`);
      if (formData.bus_count)
        additionalInfo.push(`Buses: ${formData.bus_count}`);
      if (formData.phone_number)
        additionalInfo.push(`Phone: ${formData.phone_number}`);

      const fullMessage =
        formData.message +
        (additionalInfo.length > 0
          ? `\n\nAdditional Information:\n${additionalInfo.join("\n")}`
          : "");

      const messageData = {
        first_name: requiredFields.first_name,
        last_name: requiredFields.last_name,
        email_address: requiredFields.email_address,
        school_name: requiredFields.school_name,
        message: fullMessage,
        message_type: "demo_request" as const,
      };

      console.log("Submitting demo request with data:", messageData);

      await dispatch(createContactMessage(messageData)).unwrap();

      toast({
        title: "Demo Request Sent!",
        description: "We'll contact you within 24 hours to schedule your demo.",
      });

      setFormData({
        first_name: "",
        last_name: "",
        email_address: "",
        phone_number: "",
        school_name: "",
        position: "",
        student_count: "",
        bus_count: "",
        message: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast({
        title: "Error",
        description:
          typeof error === "string"
            ? error
            : "Failed to send demo request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Request Demo
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Get a personalized demo of our school transportation platform. We'll
            show you how it can transform your operations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="first_name"
                className="text-sm font-medium text-slate-700"
              >
                First Name *
              </Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
                required
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="last_name"
                className="text-sm font-medium text-slate-700"
              >
                Last Name *
              </Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Doe"
                required
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="email_address"
                className="text-sm font-medium text-slate-700"
              >
                Email Address *
              </Label>
              <Input
                id="email_address"
                name="email_address"
                type="email"
                value={formData.email_address}
                onChange={handleInputChange}
                placeholder="john@school.edu"
                required
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className="text-sm font-medium text-slate-700"
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-2">
            <Label
              htmlFor="school_name"
              className="text-sm font-medium text-slate-700"
            >
              School/District Name *
            </Label>
            <Input
              id="school_name"
              name="school_name"
              type="text"
              value={formData.school_name}
              onChange={handleInputChange}
              placeholder="Your School District"
              required
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Position and Scale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="position"
                className="text-sm font-medium text-slate-700"
              >
                Your Position
              </Label>
              <Input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Principal, Admin, etc."
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="student_count"
                className="text-sm font-medium text-slate-700"
              >
                Number of Students
              </Label>
              <Input
                id="student_count"
                name="student_count"
                type="number"
                value={formData.student_count}
                onChange={handleInputChange}
                placeholder="500"
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="bus_count"
                className="text-sm font-medium text-slate-700"
              >
                Number of Buses
              </Label>
              <Input
                id="bus_count"
                name="bus_count"
                type="number"
                value={formData.bus_count}
                onChange={handleInputChange}
                placeholder="10"
                className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-slate-700"
            >
              Additional Information
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your transportation needs, specific requirements, or any questions you have..."
              rows={4}
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 resize-none"
            />
          </div>

          {/* Demo Features */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-800">
                What's Included in Your Demo
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-emerald-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>30-minute personalized walkthrough</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Live platform demonstration</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security & compliance overview</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Q&A session with our experts</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Request Demo
                </>
              )}
            </Button>
          </div>

          {/* Note */}
          <div className="text-xs text-slate-500 text-center">
            We'll contact you within 24 hours to schedule your personalized
            demo.
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DemoRequestModal;
