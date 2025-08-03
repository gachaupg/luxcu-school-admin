import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSchoolSubscriptions } from "@/redux/slices/schoolSubscriptionsSlice";
import { SchoolSubscription } from "@/redux/slices/schoolSubscriptionsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Calendar,
  Users,
  Bus,
  Building2,
  DollarSign,
} from "lucide-react";
import { generateSubscriptionPDF, downloadPDF } from "@/utils/pdfGenerator";

const SchoolSubscriptionPage = () => {
  const dispatch = useAppDispatch();
  const { subscriptions, loading, error } = useAppSelector(
    (state) => state.schoolSubscriptions
  );
  const { schools } = useAppSelector((state) => state.schools);
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingCycleFilter, setBillingCycleFilter] = useState("all");
  const [schoolIdFilter, setSchoolIdFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] =
    useState<SchoolSubscription | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Get logged-in school ID from localStorage or calculate from Redux state
  const loggedInSchoolId = useMemo(() => {
    // First try localStorage
    const storedSchoolId = localStorage.getItem("schoolId");
    if (storedSchoolId && storedSchoolId !== "") {
      return storedSchoolId;
    }

    // Fallback: calculate from Redux state
    if (schools.length > 0 && user?.id) {
      const school = schools.find((school) => school.admin === user.id);
      if (school?.id) {
        // Store the found school ID in localStorage for future use
        localStorage.setItem("schoolId", school.id.toString());
        return school.id.toString();
      }
    }

    return null;
  }, [schools, user?.id]);


  // Check if user can see all schools (admin) or just their own school
  const canSeeAllSchools = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.role === "admin" || user.role === "super_admin";
      }
    } catch (error) {
      // console.error("Error parsing user data:", error);
    }
    return false;
  };

  const isAdmin = canSeeAllSchools();

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        await dispatch(fetchSchoolSubscriptions()).unwrap();

        // Auto-filter by logged-in school if available
        if (loggedInSchoolId) {
          setSchoolIdFilter(loggedInSchoolId);
       
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load subscriptions";

        // Handle throttling errors specifically
        if (
          errorMessage.includes("Rate limited") ||
          errorMessage.includes("throttled")
        ) {
          toast({
            title: "Rate Limited",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    };

    loadSubscriptions();
  }, [dispatch, toast, loggedInSchoolId]);

  const handleViewDetails = (subscription: SchoolSubscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedSubscription(null);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBillingCycleFilter("all");
    // Keep the school ID filter set to logged-in school
    setSchoolIdFilter(loggedInSchoolId || "all");
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
      toast({
        title: "Error",
        description: "Failed to generate subscription PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
const subsdata= subscriptions.filter((subscription) => {
  return subscription.school.toString() === loggedInSchoolId;
});

  const filteredSubscriptions = subsdata.filter((subscription) => {
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
    const matchesSchoolId =
      schoolIdFilter === "all" ||
      subscription.school.toString() === schoolIdFilter;

  

    return (
      matchesSearch && matchesStatus && matchesBillingCycle && matchesSchoolId
    );
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
    }).format(parseFloat(amount));
  };

  const getUniqueSchools = () => {
    const schoolMap = new Map();
    subscriptions.forEach((subscription) => {
      if (!schoolMap.has(subscription.school)) {
        schoolMap.set(subscription.school, subscription.school_name);
      }
    });
    const uniqueSchools = Array.from(schoolMap.entries()).map(([id, name]) => ({
      id: id.toString(),
      name: name as string,
    }));

    

    return uniqueSchools;
  };

  const getExpiryStatus = (subscription: SchoolSubscription) => {
    if (!subscription.end_date) {
      return { status: "no_expiry", days: 0 };
    }

    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return { status: "expired", days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring_soon", days: daysUntilExpiry };
    } else {
      return { status: "active", days: daysUntilExpiry };
    }
  };

  const getExpiryBadge = (subscription: SchoolSubscription) => {
    const expiryStatus = getExpiryStatus(subscription);

    switch (expiryStatus.status) {
      case "expired":
        return (
          <Badge variant="destructive">
            Expired {expiryStatus.days} days ago
          </Badge>
        );
      case "expiring_soon":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Expires in {expiryStatus.days} days
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            Active ({expiryStatus.days} days left)
          </Badge>
        );
      case "no_expiry":
        return <Badge variant="outline">No expiry date</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage and monitor school ddddsubscription plans
         
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              All school subscriptions
            </p>
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
              {filteredSubscriptions.filter((sub) => sub.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredSubscriptions.filter((sub) => {
                  const expiryStatus = getExpiryStatus(sub);
                  return expiryStatus.status === "expiring_soon";
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredSubscriptions
                  .reduce((sum, sub) => sum + parseFloat(sub.price_charged), 0)
                  .toString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From all subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by school or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={schoolIdFilter} onValueChange={setSchoolIdFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="all">All Schools</SelectItem>}
                {getUniqueSchools().map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name} (ID: {school.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {schoolIdFilter !== "all" && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Selected School ID: {schoolIdFilter}
              </div>
            )}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Filter Summary */}
          {(searchTerm ||
            schoolIdFilter !== "all" ||
            statusFilter !== "all" ||
            billingCycleFilter !== "all") && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Active Filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                )}
                {schoolIdFilter !== "all" && (
                  <Badge variant="secondary">
                    School ID: {schoolIdFilter}
                    {loggedInSchoolId === schoolIdFilter && " (Your School)"}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary">Status: {statusFilter}</Badge>
                )}
                {billingCycleFilter !== "all" && (
                  <Badge variant="secondary">
                    Billing: {billingCycleFilter}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            School Subscriptions ({filteredSubscriptions.length} of{" "}
            {filteredSubscriptions.length})
          </CardTitle>
          <CardDescription>
            All school subscriptions and their current status
            {searchTerm && (
              <span className="block text-sm text-blue-600">
                🔍 Filtered by: "{searchTerm}"
              </span>
            )}
            {schoolIdFilter !== "all" && (
              <span className="block text-sm text-blue-600">
                🏫 School ID: {schoolIdFilter}
                {loggedInSchoolId === schoolIdFilter && " (Your School)"}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="block text-sm text-blue-600">
                📊 Status: {statusFilter}
              </span>
            )}
            {billingCycleFilter !== "all" && (
              <span className="block text-sm text-blue-600">
                💳 Billing: {billingCycleFilter}
              </span>
            )}
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
                {filteredSubscriptions.length === 0
                  ? "No subscriptions have been created yet."
                  : "No subscriptions match your current filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Expiry Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {subscription.school_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {subscription.school}
                            </div>
                          </div>
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
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
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
                      <TableCell>{getExpiryBadge(subscription)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-sm">
                              {subscription.current_students_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bus className="h-3 w-3 text-green-600" />
                            <span className="text-sm">
                              {subscription.current_buses_count}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Eye className="h-4 w-4" />
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Subscription Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDetailsModalClose}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Subscription Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Subscription ID:
                    </span>
                    <p className="font-medium">{selectedSubscription.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedSubscription.status)}
                      {getExpiryBadge(selectedSubscription)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Plan:</span>
                    <p className="font-medium">
                      {selectedSubscription.plan_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Billing Cycle:
                    </span>
                    {getBillingCycleBadge(selectedSubscription.billing_cycle)}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      School:
                    </span>
                    <p className="font-medium">
                      {selectedSubscription.school_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Price Charged:
                    </span>
                    <p className="font-medium">
                      {formatCurrency(selectedSubscription.price_charged)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Usage Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">
                      {selectedSubscription.current_students_count}
                    </div>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Bus className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">
                      {selectedSubscription.current_buses_count}
                    </div>
                    <p className="text-sm text-muted-foreground">Buses</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">
                      {selectedSubscription.current_parents_count}
                    </div>
                    <p className="text-sm text-muted-foreground">Parents</p>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Important Dates</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      Start Date:
                    </span>
                    <span className="font-medium">
                      {formatDate(selectedSubscription.start_date)}
                    </span>
                  </div>
                  {selectedSubscription.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-muted-foreground">
                        End Date:
                      </span>
                      <span className="font-medium">
                        {formatDate(selectedSubscription.end_date)}
                      </span>
                    </div>
                  )}
                  {selectedSubscription.next_billing_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-muted-foreground">
                        Next Billing:
                      </span>
                      <span className="font-medium">
                        {formatDate(selectedSubscription.next_billing_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownloadSubscription(selectedSubscription)
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  View School
                </Button>
                {selectedSubscription.status === "pending" && (
                  <Button>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                {selectedSubscription.status === "active" && (
                  <Button variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSubscriptionPage;
