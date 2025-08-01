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
import { SchoolSubscription } from "@/redux/slices/schoolSubscriptionsSlice";
import {
  CreditCard,
  Calendar,
  Users,
  Bus,
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
} from "lucide-react";
import { generateSubscriptionPDF, downloadPDF } from "@/utils/pdfGenerator";

interface SubscriptionDetailsModalProps {
  subscription: SchoolSubscription | null;
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  subscription,
  isOpen,
  onClose,
}) => {
  if (!subscription) return null;

  const formatCurrency = (amount: string) => {
    try {
      if (!amount) return "N/A";
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(parseFloat(amount));
    } catch (error) {
      return "N/A";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingCycleBadge = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return <Badge className="bg-blue-100 text-blue-800">Monthly</Badge>;
      case "annually":
        return (
          <Badge className="bg-purple-100 text-purple-800">Annually</Badge>
        );
      default:
        return <Badge variant="outline">{cycle}</Badge>;
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = generateSubscriptionPDF(subscription);
      downloadPDF(
        doc,
        `subscription-${subscription.id}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of subscription {subscription.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Subscription Information
                </h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subscription ID:
                    </span>
                    <span className="font-medium">{subscription.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">
                      {subscription.plan_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Billing Cycle:
                    </span>
                    {getBillingCycleBadge(subscription.billing_cycle)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">School Information</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium">
                      {subscription.school_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School ID:</span>
                    <span className="font-medium">{subscription.school}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Price Charged:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(subscription.price_charged)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Calculated Cost:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(subscription.calculated_cost.toString())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">
                  {subscription.current_students_count}
                </div>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Bus className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  {subscription.current_buses_count}
                </div>
                <p className="text-sm text-muted-foreground">Buses</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">
                  {subscription.current_parents_count}
                </div>
                <p className="text-sm text-muted-foreground">Parents</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">
                    Start Date:
                  </span>
                  <span className="font-medium">
                    {formatDate(subscription.start_date)}
                  </span>
                </div>
                {subscription.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">
                      End Date:
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.end_date)}
                    </span>
                  </div>
                )}
                {subscription.next_billing_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-muted-foreground">
                      Next Billing:
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.next_billing_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              View School
            </Button>
            {subscription.status === "pending" && (
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </Button>
            )}
            {subscription.status === "active" && (
              <Button variant="outline">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailsModal;
