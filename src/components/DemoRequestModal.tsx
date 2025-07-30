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

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoRequestModal = ({ isOpen, onClose }: DemoRequestModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
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

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Demo Request Sent!",
        description: "We'll contact you within 24 hours to schedule your demo.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        school: "",
        message: "",
      });
      onClose();
    }, 2000);
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
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Full Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@school.edu"
              required
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone Number *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
              required
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* School Field */}
          <div className="space-y-2">
            <Label
              htmlFor="school"
              className="text-sm font-medium text-slate-700"
            >
              School/District Name
            </Label>
            <Input
              id="school"
              name="school"
              type="text"
              value={formData.school}
              onChange={handleInputChange}
              placeholder="Your School District"
              className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
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
              placeholder="Tell us about your transportation needs..."
              rows={3}
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
