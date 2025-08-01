import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSchoolSubscriptions,
  updateSchoolSubscription,
  SchoolSubscription,
} from "@/redux/slices/schoolSubscriptionsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MoreHorizontal,
  CreditCard,
  Calendar,
  Users,
  Bus,
  Building2,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SubscriptionDetailsModal from "@/components/SubscriptionDetailsModal";
import {
  generateTablePDF,
  generateSubscriptionPDF,
  downloadPDF,
} from "@/utils/pdfGenerator";

const SchoolSubscriptions = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { subscriptions, loading, error } = useAppSelector(
    (state) => state.schoolSubscriptions
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingCycleFilter, setBillingCycleFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SchoolSubscription | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSchoolSubscriptions());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    // Refresh subscriptions after creating a new one
    dispatch(fetchSchoolSubscriptions());
  };

  const handleViewDetails = (subscription: SchoolSubscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleDownloadAllSubscriptions = () => {
    try {
      const headers = [
        "School",
        "Plan",
        "Status",
        "Billing Cycle",
        "Price",
        "Students",
        "Buses",
        "Parents",
      ];
      const rows = filteredSubscriptions.map((subscription) => [
        subscription.school_name,
        subscription.plan_name,
        subscription.status,
        subscription.billing_cycle,
        formatCurrency(subscription.price_charged),
        subscription.current_students_count.toString(),
        subscription.current_buses_count.toString(),
        subscription.current_parents_count.toString(),
      ]);

      const doc = generateTablePDF({
        headers,
        rows,
        title: "School Subscriptions Report",
        subtitle: `Total Subscriptions: ${filteredSubscriptions.length}`,
      });

      downloadPDF(
        doc,
        `subscriptions-report-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast({
        title: "PDF Downloaded",
        description: "Subscriptions report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSubscription = (subscription: SchoolSubscription) => {
    try {
      const doc = generateSubscriptionPDF(subscription);
      downloadPDF(
        doc,
        `subscription-${subscription.id}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      toast({
        title: "Subscription Downloaded",
        description: "Subscription PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating subscription PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate subscription PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.school_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    const matchesBillingCycle =
      billingCycleFilter === "all" ||
      subscription.billing_cycle === billingCycleFilter;

    return matchesSearch && matchesStatus && matchesBillingCycle;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(parseFloat(amount));
  };

  const handleUpdateStatus = async (
    subscriptionId: string,
    newStatus: string
  ) => {
    try {
      await dispatch(
        updateSchoolSubscription({
          id: subscriptionId,
          updateData: { status: newStatus as any },
        })
      ).unwrap();

      toast({
        title: "Status Updated",
        description: "Subscription status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            School Subscriptions
          </h1>
          <p className="text-muted-foreground">
            Manage school subscriptions and billing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadAllSubscriptions}>
            <Download size={16} className="mr-2" />
            Export All
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Building2 size={16} className="mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">All subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((s) => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Subscriptions
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((s) => s.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting activation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                subscriptions
                  .reduce((sum, sub) => sum + parseFloat(sub.price_charged), 0)
                  .toString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter subscriptions by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={billingCycleFilter}
              onValueChange={setBillingCycleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            School Subscriptions ({filteredSubscriptions.length})
          </CardTitle>
          <CardDescription>
            All school subscriptions and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Subscriptions
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Subscriptions Found
              </h3>
              <p className="text-muted-foreground">
                {subscriptions.length === 0
                  ? "No school subscriptions have been created yet."
                  : "No subscriptions match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {subscription.school_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.plan_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {subscription.plan}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      {getBillingCycleBadge(subscription.billing_cycle)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(subscription.price_charged)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Calculated:{" "}
                        {formatCurrency(
                          subscription.calculated_cost.toString()
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {subscription.current_students_count} students
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Bus className="h-3 w-3" />
                          {subscription.current_buses_count} buses
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {subscription.current_parents_count} parents
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(subscription.start_date)}
                      </div>
                      {subscription.next_billing_date && (
                        <div className="text-xs text-muted-foreground">
                          Next: {formatDate(subscription.next_billing_date)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(subscription)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownloadSubscription(subscription)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Subscription
                          </DropdownMenuItem>
                          {subscription.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(subscription.id, "active")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "active" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(subscription.id, "cancelled")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Create Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateSubscriptionModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
      />
      <SubscriptionDetailsModal
        subscription={selectedSubscription}
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
      />
    </div>
  );
};

export default SchoolSubscriptions;
