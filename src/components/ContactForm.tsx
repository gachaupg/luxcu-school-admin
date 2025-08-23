import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/redux/hooks";
import { createContactMessage } from "@/redux/slices/contactMessagesSlice";

const ContactForm = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    school_name: "",
    position: "",
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
        message_type: "inquiry_message" as const,
      };


      await dispatch(createContactMessage(messageData)).unwrap();

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        first_name: "",
        last_name: "",
        email_address: "",
        phone_number: "",
        school_name: "",
        position: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description:
          typeof error === "string"
            ? error
            : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-white font-medium">
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
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-white font-medium">
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
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email_address" className="text-white font-medium">
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
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number" className="text-white font-medium">
            Phone Number
          </Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school_name" className="text-white font-medium">
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
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position" className="text-white font-medium">
            Your Position
          </Label>
          <Input
            id="position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Principal, Admin, etc."
            className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-white font-medium">
          Message *
        </Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your transportation needs and how we can help..."
          rows={4}
          required
          className="border-slate-600 bg-slate-800 text-white focus:border-[#f7c624] focus:ring-[#f7c624] transition-colors resize-none placeholder:text-slate-400"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#f7c624] hover:bg-[#f7c624]/90 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
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
            Send Message
          </>
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
