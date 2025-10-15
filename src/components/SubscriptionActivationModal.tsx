import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  MessageCircle,
  CreditCard
} from "lucide-react";

interface SubscriptionActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionActivationModal: React.FC<SubscriptionActivationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handlePayNow = () => {
    // Navigate to payment page or open payment modal
    window.open("/subscription-selection", "_blank");
  };

  const handleContactSupport = () => {
    // Open email client with support email
    window.open("mailto:support@eujimsolutions.com?subject=Subscription Activation Request", "_blank");
  };

  const handleCallSupport = () => {
    // Open phone dialer
    window.open("tel:+254113281424", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-yellow-600" />
            Subscription Activation Required
          </DialogTitle>
          <DialogDescription className="text-sm">
            Your school subscription is currently inactive. Please activate your subscription to access the ShuleTrack Admin Dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {/* Status Card */}
           <Card className="border-red-200 bg-red-50">
             <CardContent className="p-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Badge variant="destructive" className="text-xs">
                     Subscription Inactive
                   </Badge>
                 </div>
                 <p className="text-xs text-red-700">
                   Account access is currently disabled
                 </p>
               </div>
             </CardContent>
           </Card>

                     {/* Contact Information */}
           <Card>
             <CardContent className="p-4">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-yellow-600" />
                Contact Information
              </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-start gap-3">
                   <MapPin className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <p className="font-semibold text-sm mb-1">Head Office</p>
                     <p className="text-sm text-gray-600">
                       Gesora Road, Utawala, Nairobi
                     </p>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   <Mail className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <p className="font-semibold text-sm mb-1">Email Support</p>
                     <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Inquiry:</span>{" "}
                        <a 
                          href="mailto:info@shuletrack.com " 
                          className="text-yellow-600 hover:underline"
                        >
                          info@shuletrack.com
                        </a>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Support:</span>{" "}
                        <a 
                          href="mailto:support@shuletrack.com" 
                          className="text-yellow-600 hover:underline"
                        >
                          support@shuletrack.com
                        </a>
                      </p>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   <Phone className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                   <div>
                    <p className="font-semibold text-sm mb-1">Phone Support</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <a 
                          href="tel:+254113281424" 
                          className="text-yellow-600 hover:underline"
                        >
                          +254 113281424
                        </a>
                      </p>
                      <p className="text-sm text-gray-600">
                        <a 
                          href="tel:+254718099959" 
                          className="text-yellow-600 hover:underline"
                        >
                          +254 718099959
                        </a>
                      </p>
                    </div>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   <MessageCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                   <div>
                    <p className="font-semibold text-sm mb-1">Contact Support</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Need help? Reach out to our support team
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleContactSupport}
                      className="h-9 text-sm"
                    >
                      <Mail className="mr-2 h-3 w-3" />
                      Email Us
                    </Button>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>

                     {/* Quick Actions */}
           <div className="flex flex-col sm:flex-row gap-2">
             <Button 
               variant="outline" 
               onClick={handleCallSupport}
               className="flex-1 h-9"
             >
               <Phone className="mr-2 h-3 w-3" />
               Call Now
             </Button>
             
             <Button 
               variant="outline" 
               onClick={handleContactSupport}
               className="flex-1 h-9"
             >
               <Mail className="mr-2 h-3 w-3" />
               Email Support
             </Button>
           </div>

           <div className="text-center pt-2">
             <Button variant="ghost" onClick={onClose} size="sm">
               Close
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionActivationModal;
