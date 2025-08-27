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
  const [activeTab, setActiveTab] = useState<"plans" | "schools">("plans");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [isViewSchoolModalOpen, setIsViewSchoolModalOpen] = useState(false);
  const [isDeletingSchool, setIsDeletingSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolSubscription | null>(null);
  const [viewingSchool, setViewingSchool] = useState<SchoolSubscription | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    base_price: "",
    price_per_student: "",
    price_per_bus: "",
    default_billing_cycle: "monthly" as "monthly" | "annually" | "quarterly",
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
      // Handle different API response formats
      const plans = Array.isArray(data)
        ? data
        : (data as any)?.results || (data as any)?.data || [];
      setSubscriptionPlans(plans || []);
      if (plans && plans.length > 0) {
        toast({
          title: "Success",
          description: "Subscription plans loaded successfully!",
        });
      }
    } catch (error) {
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
      toast({
        title: "Error",
        description: "Failed to create subscription plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleViewPlan = (plan: SubscriptionPlan) => {
    setViewingPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    
    try {
      setIsCreating(true);
      await subscriptionPlanService.updateSubscriptionPlan(editingPlan.id, {
        name: editingPlan.name,
        description: editingPlan.description,
        base_price: editingPlan.base_price,
        price_per_student: editingPlan.price_per_student,
        price_per_bus: editingPlan.price_per_bus,
        features_json: editingPlan.features_json,
        is_active: editingPlan.is_active,
        default_billing_cycle: editingPlan.default_billing_cycle,
      });
      setIsEditModalOpen(false);
      setEditingPlan(null);
      fetchSubscriptionPlans(); // Refresh the list
      toast({
        title: "Success",
        description: "Subscription plan updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      setIsDeleting(true);
      await subscriptionPlanService.deleteSubscriptionPlan(planId);
      setPlanToDelete(null);
      fetchSubscriptionPlans(); // Refresh the list
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscription plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSchoolSubscription = (subscription: SchoolSubscription) => {
    setEditingSchool(subscription);
    setIsEditSchoolModalOpen(true);
  };

  const handleViewSchoolSubscription = (subscription: SchoolSubscription) => {
    setViewingSchool(subscription);
    setIsViewSchoolModalOpen(true);
  };

  const handleUpdateSchoolSubscription = async () => {
    if (!editingSchool) return;
    
    try {
      setIsCreating(true);
      // TODO: Replace with actual API call when available
      // await schoolSubscriptionService.updateSchoolSubscription(editingSchool.id, editingSchool);
      
      // For now, update local state
      setSchoolSubscriptions(prev => 
        prev.map(sub => 
          sub.id === editingSchool.id ? editingSchool : sub
        )
      );
      
      setIsEditSchoolModalOpen(false);
      setEditingSchool(null);
      toast({
        title: "Success",
        description: "School subscription updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update school subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSchoolSubscription = async (subscriptionId: string) => {
    try {
      setIsDeletingSchool(true);
      // TODO: Replace with actual API call when available
      // await schoolSubscriptionService.deleteSchoolSubscription(subscriptionId);
      
      // For now, update local state
      setSchoolSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      setSchoolToDelete(null);
      toast({
        title: "Success",
        description: "School subscription deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete school subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSchool(false);
    }
  };

  const handleCancelSchoolSubscription = async (subscriptionId: string) => {
    try {
      setIsCreating(true);
      // TODO: Replace with actual API call when available
      // await schoolSubscriptionService.cancelSchoolSubscription(subscriptionId);
      
      // For now, update local state
      setSchoolSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: "cancelled" as const }
            : sub
        )
      );
      
      toast({
        title: "Success",
        description: "School subscription cancelled successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel school subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
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

          {/* Edit Plan Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Subscription Plan</DialogTitle>
                <DialogDescription>
                  Update the subscription plan details and features
                </DialogDescription>
              </DialogHeader>
              {editingPlan && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPlanName">Plan Name</Label>
                    <Input
                      id="editPlanName"
                      value={editingPlan.name}
                      onChange={(e) =>
                        setEditingPlan((prev) => 
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      placeholder="e.g., premium_school"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editBillingCycle">Default Billing Cycle</Label>
                    <Select
                      value={editingPlan.default_billing_cycle}
                      onValueChange={(value: "monthly" | "annually" | "quarterly") =>
                        setEditingPlan((prev) => 
                          prev ? { ...prev, default_billing_cycle: value } : null
                        )
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
                    <Label htmlFor="editBasePrice">Base Price</Label>
                    <Input
                      id="editBasePrice"
                      type="number"
                      value={editingPlan.base_price}
                      onChange={(e) =>
                        setEditingPlan((prev) => 
                          prev ? { ...prev, base_price: e.target.value } : null
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPricePerStudent">Price per Student</Label>
                    <Input
                      id="editPricePerStudent"
                      type="number"
                      value={editingPlan.price_per_student}
                      onChange={(e) =>
                        setEditingPlan((prev) => 
                          prev ? { ...prev, price_per_student: e.target.value } : null
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPricePerBus">Price per Bus</Label>
                    <Input
                      id="editPricePerBus"
                      type="number"
                      value={editingPlan.price_per_bus}
                      onChange={(e) =>
                        setEditingPlan((prev) => 
                          prev ? { ...prev, price_per_bus: e.target.value } : null
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMaxStudents">Max Students</Label>
                    <Input
                      id="editMaxStudents"
                      type="number"
                      value={editingPlan.features_json.max_students}
                      onChange={(e) =>
                        setEditingPlan((prev) => 
                          prev ? {
                            ...prev,
                            features_json: {
                              ...prev.features_json,
                              max_students: parseInt(e.target.value),
                            },
                          } : null
                        )
                      }
                    />
                  </div>
                </div>
              )}
              {editingPlan && (
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingPlan.description}
                    onChange={(e) =>
                      setEditingPlan((prev) => 
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    rows={3}
                  />
                </div>
              )}

              {/* Features Section */}
              {editingPlan && (
                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(editingPlan.features_json).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Switch
                            checked={typeof value === "boolean" ? value : false}
                            onCheckedChange={(checked) =>
                              setEditingPlan((prev) => 
                                prev ? {
                                  ...prev,
                                  features_json: { ...prev.features_json, [key]: checked },
                                } : null
                              )
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
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPlan(null);
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePlan} disabled={isCreating}>
                  {isCreating ? "Updating..." : "Update Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Plan Details Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Subscription Plan Details</DialogTitle>
                <DialogDescription>
                  Complete information about the subscription plan
                </DialogDescription>
              </DialogHeader>
              {viewingPlan && (
                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {viewingPlan.name.replace(/_/g, " ").toUpperCase()}
                      </h3>
                      <p className="text-gray-600 mt-1">{viewingPlan.description}</p>
                    </div>
                    <Badge variant={viewingPlan.is_active ? "default" : "secondary"}>
                      {viewingPlan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Pricing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Base Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(viewingPlan.base_price)}
                        </div>
                        <p className="text-xs text-muted-foreground">Monthly base cost</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Per Student
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(viewingPlan.price_per_student)}
                        </div>
                        <p className="text-xs text-muted-foreground">Per student per month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Bus className="h-4 w-4 mr-2" />
                          Per Bus
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(viewingPlan.price_per_bus)}
                        </div>
                        <p className="text-xs text-muted-foreground">Per bus per month</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Billing Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Billing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Default Billing Cycle</Label>
                          <p className="text-lg capitalize">{viewingPlan.default_billing_cycle}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Plan Status</Label>
                          <p className="text-lg">{viewingPlan.is_active ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Features & Limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Limits */}
                        <div>
                          <h4 className="font-medium mb-2">Limits</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm">Max Students</span>
                              <span className="font-semibold">{viewingPlan.features_json.max_students}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm">Max Parents</span>
                              <span className="font-semibold">{viewingPlan.features_json.max_parents}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm">Max Buses</span>
                              <span className="font-semibold">{viewingPlan.features_json.max_buses}</span>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <h4 className="font-medium mb-2">Features</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(viewingPlan.features_json).map(([key, value]) => {
                              if (typeof value === "boolean") {
                                return (
                                  <div key={key} className="flex items-center space-x-2 p-2">
                                    {value ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm capitalize">
                                      {key.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Plan Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency("0")}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0%</div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingPlan(null);
                  }}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingPlan(null);
                    if (viewingPlan) {
                      handleEditPlan(viewingPlan);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subscription Plan</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this subscription plan? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPlanToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => planToDelete && handleDeletePlan(planToDelete)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit School Subscription Modal */}
          <Dialog open={isEditSchoolModalOpen} onOpenChange={setIsEditSchoolModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit School Subscription</DialogTitle>
                <DialogDescription>
                  Update the school subscription details
                </DialogDescription>
              </DialogHeader>
              {editingSchool && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSchoolName">School Name</Label>
                      <Input
                        id="editSchoolName"
                        value={editingSchool.schoolName}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, schoolName: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPlan">Plan</Label>
                      <Select
                        value={editingSchool.plan}
                        onValueChange={(value) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, plan: value } : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium_school">Premium School</SelectItem>
                          <SelectItem value="basic_school">Basic School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select
                        value={editingSchool.status}
                        onValueChange={(value: "active" | "expired" | "cancelled" | "pending") =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, status: value } : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editAmount">Amount</Label>
                      <Input
                        id="editAmount"
                        type="number"
                        value={editingSchool.amount}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, amount: parseFloat(e.target.value) } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editBillingCycle">Billing Cycle</Label>
                      <Select
                        value={editingSchool.billingCycle}
                        onValueChange={(value) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, billingCycle: value } : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPaymentMethod">Payment Method</Label>
                      <Input
                        id="editPaymentMethod"
                        value={editingSchool.paymentMethod}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, paymentMethod: e.target.value } : null
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate">Start Date</Label>
                      <Input
                        id="editStartDate"
                        type="date"
                        value={editingSchool.startDate}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, startDate: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEndDate">End Date</Label>
                      <Input
                        id="editEndDate"
                        type="date"
                        value={editingSchool.endDate}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, endDate: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editNextBilling">Next Billing</Label>
                      <Input
                        id="editNextBilling"
                        type="date"
                        value={editingSchool.nextBilling}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, nextBilling: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLastPayment">Last Payment</Label>
                      <Input
                        id="editLastPayment"
                        type="date"
                        value={editingSchool.lastPayment}
                        onChange={(e) =>
                          setEditingSchool((prev) => 
                            prev ? { ...prev, lastPayment: e.target.value } : null
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editFeatures">Features</Label>
                    <Textarea
                      id="editFeatures"
                      value={editingSchool.features.join(", ")}
                      onChange={(e) =>
                        setEditingSchool((prev) => 
                          prev ? { ...prev, features: e.target.value.split(", ") } : null
                        )
                      }
                      placeholder="Enter features separated by commas"
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditSchoolModalOpen(false);
                    setEditingSchool(null);
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateSchoolSubscription} disabled={isCreating}>
                  {isCreating ? "Updating..." : "Update Subscription"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View School Subscription Modal */}
          <Dialog open={isViewSchoolModalOpen} onOpenChange={setIsViewSchoolModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>School Subscription Details</DialogTitle>
                <DialogDescription>
                  Complete information about the school subscription
                </DialogDescription>
              </DialogHeader>
              {viewingSchool && (
                <div className="space-y-6">
                  {/* School Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {viewingSchool.schoolName}
                      </h3>
                      <p className="text-gray-600 mt-1">Subscription Details</p>
                    </div>
                    {getStatusBadge(viewingSchool.status)}
                  </div>

                  {/* Subscription Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Amount
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(viewingSchool.amount.toString())}
                        </div>
                        <p className="text-xs text-muted-foreground">{viewingSchool.billingCycle} billing</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Next Billing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {new Date(viewingSchool.nextBilling).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Due date</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payment Method
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {viewingSchool.paymentMethod}
                        </div>
                        <p className="text-xs text-muted-foreground">Last payment: {viewingSchool.lastPayment}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Plan and Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Plan Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Plan:</span>
                            {getPlanBadge(viewingSchool.plan)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Billing Cycle:</span>
                            <span>{viewingSchool.billingCycle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Status:</span>
                            {getStatusBadge(viewingSchool.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Start Date:</span>
                            <span>{new Date(viewingSchool.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">End Date:</span>
                            <span>{new Date(viewingSchool.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Last Payment:</span>
                            <span>{new Date(viewingSchool.lastPayment).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {viewingSchool.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewSchoolModalOpen(false);
                    setViewingSchool(null);
                  }}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewSchoolModalOpen(false);
                    setViewingSchool(null);
                    if (viewingSchool) {
                      handleEditSchoolSubscription(viewingSchool);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Subscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete School Subscription Confirmation Dialog */}
          <Dialog open={!!schoolToDelete} onOpenChange={() => setSchoolToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete School Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this school subscription? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSchoolToDelete(null)}
                  disabled={isDeletingSchool}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => schoolToDelete && handleDeleteSchoolSubscription(schoolToDelete)}
                  disabled={isDeletingSchool}
                >
                  {isDeletingSchool ? "Deleting..." : "Delete Subscription"}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MoreHorizontal className="h-3 w-3 mr-1" />
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPlan(plan)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setPlanToDelete(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                            <DropdownMenuItem onClick={() => handleViewSchoolSubscription(subscription)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSchoolSubscription(subscription)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Manage Billing
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => handleCancelSchoolSubscription(subscription.id)}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setSchoolToDelete(subscription.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Subscription
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
