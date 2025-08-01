import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Plus,
  Zap,
  Shield,
  Users,
  Bus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  subscriptionPlanService,
  SubscriptionPlan,
} from "@/services/subscriptionPlanService";
import { useToast } from "@/hooks/use-toast";

interface SchoolSubscription {
  id: string;
  schoolName: string;
  plan: string;
  status: "active" | "expired" | "cancelled" | "pending";
  amount: number;
  billingCycle: string;
  nextBilling: string;
  startDate: string;
  endDate: string;
  features: string[];
  paymentMethod: string;
  lastPayment: string;
}

const BILLING_CYCLE_CHOICES = [
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
  { value: "quarterly", label: "Quarterly" },
];

const Subscriptions = () => {
  const { toast } = useToast();
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [schoolSubscriptions, setSchoolSubscriptions] = useState<
    SchoolSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"plans" | "schools">("plans");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    base_price: "",
    price_per_student: "",
    price_per_bus: "",
    default_billing_cycle: "monthly" as const,
    is_active: true,
    features: {
      max_students: 100,
      max_parents: 100,
      max_buses: 5,
      sms_notifications: false,
      whatsapp_integration: false,
      realtime_tracking: false,
      parent_app_access: false,
      basic_reports: false,
      driver_management: false,
      route_optimization: false,
      advanced_analytics: false,
      api_access: false,
      geofencing: false,
      speed_monitoring: false,
      fuel_tracking: false,
      maintenance_tracking: false,
      custom_integrations: false,
      priority_support: false,
    },
  });

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchSchoolSubscriptions();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionPlanService.getSubscriptionPlans();
      console.log("API Response:", data);
      // Handle different API response formats
      const plans = Array.isArray(data)
        ? data
        : data?.results || data?.data || [];
      console.log("Processed plans:", plans);
      setSubscriptionPlans(plans || []);
      if (plans && plans.length > 0) {
        toast({
          title: "Success",
          description: "Subscription plans loaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans. Using mock data.",
        variant: "destructive",
      });
      // Mock data for development
      setSubscriptionPlans([
        {
          id: "1",
          name: "premium_school",
          description:
            "Comprehensive solution for large schools with advanced requirements. Full API access, fuel tracking, and priority support.",
          base_price: "10000.00",
          price_per_student: "12.00",
          price_per_bus: "500.00",
          features_json: {
            max_students: 1000,
            max_parents: 1000,
            max_buses: 15,
            sms_notifications: true,
            whatsapp_integration: true,
            realtime_tracking: true,
            parent_app_access: true,
            basic_reports: true,
            driver_management: true,
            route_optimization: true,
            advanced_analytics: true,
            api_access: true,
            geofencing: true,
            speed_monitoring: true,
            fuel_tracking: true,
            maintenance_tracking: true,
            custom_integrations: true,
            priority_support: true,
          },
          is_active: true,
          default_billing_cycle: "annually",
        },
        {
          id: "2",
          name: "basic_school",
          description:
            "Essential features for small to medium schools. Basic tracking and reporting capabilities.",
          base_price: "5000.00",
          price_per_student: "8.00",
          price_per_bus: "300.00",
          features_json: {
            max_students: 500,
            max_parents: 500,
            max_buses: 8,
            sms_notifications: true,
            whatsapp_integration: false,
            realtime_tracking: true,
            parent_app_access: true,
            basic_reports: true,
            driver_management: true,
            route_optimization: false,
            advanced_analytics: false,
            api_access: false,
            geofencing: false,
            speed_monitoring: false,
            fuel_tracking: false,
            maintenance_tracking: false,
            custom_integrations: false,
            priority_support: false,
          },
          is_active: true,
          default_billing_cycle: "monthly",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolSubscriptions = async () => {
    // Mock data for school subscriptions
    setSchoolSubscriptions([
      {
        id: "1",
        schoolName: "Springfield High School",
        plan: "premium_school",
        status: "active",
        amount: 299.99,
        billingCycle: "Monthly",
        nextBilling: "2024-02-15",
        startDate: "2023-09-15",
        endDate: "2024-09-15",
        features: [
          "Unlimited Students",
          "Advanced Analytics",
          "Priority Support",
        ],
        paymentMethod: "Credit Card",
        lastPayment: "2024-01-15",
      },
      {
        id: "2",
        schoolName: "Lincoln Elementary",
        plan: "basic_school",
        status: "active",
        amount: 99.99,
        billingCycle: "Monthly",
        nextBilling: "2024-02-20",
        startDate: "2023-10-20",
        endDate: "2024-10-20",
        features: ["Up to 500 Students", "Basic Analytics"],
        paymentMethod: "Credit Card",
        lastPayment: "2024-01-20",
      },
    ]);
    setLoading(false);
  };

  const handleCreatePlan = async () => {
    try {
      setIsCreating(true);
      await subscriptionPlanService.createSubscriptionPlan({
        ...newPlan,
        features_json: newPlan.features,
      });
      setIsCreateModalOpen(false);
      fetchSubscriptionPlans(); // Refresh the list
      toast({
        title: "Success",
        description: "Subscription plan created successfully!",
      });
      // Reset form
      setNewPlan({
        name: "",
        description: "",
        base_price: "",
        price_per_student: "",
        price_per_bus: "",
        default_billing_cycle: "monthly" as const,
        is_active: true,
        features: {
          max_students: 100,
          max_parents: 100,
          max_buses: 5,
          sms_notifications: false,
          whatsapp_integration: false,
          realtime_tracking: false,
          parent_app_access: false,
          basic_reports: false,
          driver_management: false,
          route_optimization: false,
          advanced_analytics: false,
          api_access: false,
          geofencing: false,
          speed_monitoring: false,
          fuel_tracking: false,
          maintenance_tracking: false,
          custom_integrations: false,
          priority_support: false,
        },
      });
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium_school":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case "basic_school":
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "api_access":
        return <Zap className="h-4 w-4" />;
      case "priority_support":
        return <Shield className="h-4 w-4" />;
      case "advanced_analytics":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
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
            Subscriptions Management
          </h1>
          <p className="text-muted-foreground">
            Manage subscription plans and school subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Subscription Plan</DialogTitle>
                <DialogDescription>
                  Define a new subscription plan with features and pricing
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={newPlan.name}
                    onChange={(e) =>
                      setNewPlan((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., premium_school"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Default Billing Cycle</Label>
                  <Select
                    value={newPlan.default_billing_cycle}
                    onValueChange={(
                      value: "monthly" | "annually" | "quarterly"
                    ) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        default_billing_cycle: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLE_CHOICES.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={newPlan.base_price}
                    onChange={(e) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        base_price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerStudent">Price per Student</Label>
                  <Input
                    id="pricePerStudent"
                    type="number"
                    value={newPlan.price_per_student}
                    onChange={(e) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        price_per_student: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerBus">Price per Bus</Label>
                  <Input
                    id="pricePerBus"
                    type="number"
                    value={newPlan.price_per_bus}
                    onChange={(e) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        price_per_bus: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={newPlan.features.max_students}
                    onChange={(e) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          max_students: parseInt(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <Label>Features</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(newPlan.features).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          checked={typeof value === "boolean" ? value : false}
                          onCheckedChange={(checked) =>
                            setNewPlan((prev) => ({
                              ...prev,
                              features: { ...prev.features, [key]: checked },
                            }))
                          }
                        />
                        <Label className="text-sm capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "plans"
              ? "border-b-2 border-purple-500 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("plans")}
        >
          Subscription Plans
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "schools"
              ? "border-b-2 border-purple-500 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("schools")}
        >
          School Subscriptions
        </button>
      </div>

      {activeTab === "plans" ? (
        /* Subscription Plans */
        <div className="space-y-6">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(!subscriptionPlans || !Array.isArray(subscriptionPlans)
              ? []
              : subscriptionPlans
            ).map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {plan.name.replace(/_/g, " ").toUpperCase()}
                    </CardTitle>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Base Price:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(plan.base_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Per Student:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(plan.price_per_student)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Per Bus:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(plan.price_per_bus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Billing Cycle:
                      </span>
                      <span className="font-medium capitalize">
                        {plan.default_billing_cycle}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(plan.features_json).map(
                        ([key, value]) => {
                          if (typeof value === "boolean" && value) {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-2 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </div>
                            );
                          }
                          if (typeof value === "number" && value > 0) {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-2 text-xs"
                              >
                                <Users className="h-3 w-3 text-blue-600" />
                                <span className="capitalize">
                                  {key.replace(/_/g, " ")}: {value}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* School Subscriptions */
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    schoolSubscriptions
                      .reduce((total, sub) => total + sub.amount, 0)
                      .toString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
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
                  {
                    schoolSubscriptions.filter((s) => s.status === "active")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    schoolSubscriptions
                      .filter((s) => s.billingCycle === "Monthly")
                      .reduce((total, sub) => total + sub.amount, 0)
                      .toString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    schoolSubscriptions.filter((s) => {
                      const nextBilling = new Date(s.nextBilling);
                      const now = new Date();
                      const daysUntil = Math.ceil(
                        (nextBilling.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysUntil <= 30 && s.status === "active";
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* School Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                School Subscriptions ({schoolSubscriptions.length})
              </CardTitle>
              <CardDescription>All active school subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.schoolName}
                      </TableCell>
                      <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(subscription.amount.toString())}
                      </TableCell>
                      <TableCell>{subscription.billingCycle}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {subscription.nextBilling}
                        </div>
                      </TableCell>
                      <TableCell>{subscription.paymentMethod}</TableCell>
                      <TableCell>{subscription.lastPayment}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Manage Billing
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
