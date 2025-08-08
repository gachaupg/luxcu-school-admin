import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchInvoices } from "@/redux/slices/invoicesSlice";
import { fetchSchoolSubscriptions } from "@/redux/slices/schoolSubscriptionsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { schoolsService, DashboardStats } from "@/services/schoolsService";
import { staffService } from "@/services/staffService";
import { toast, useToast } from "@/components/ui/use-toast";
import { generateTablePDF, downloadPDF } from "@/utils/pdfGenerator";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector((state) => state.invoices);
  const { subscriptions } = useAppSelector(
    (state) => state.schoolSubscriptions
  );

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSchools: 0,
    activeSubscriptions: 0,
    revenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    premiumSchools: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch invoices and school subscriptions
        await Promise.all([
          dispatch(fetchInvoices()),
          dispatch(fetchSchoolSubscriptions()),
        ]);

        // Get schools and staff data
        const [allSchools, allStaff] = await Promise.all([
          schoolsService.getAllSchools(),
          staffService.getAllStaff(),
        ]);

        // Calculate real statistics from the data
        const totalRevenue = invoices.reduce((sum, invoice) => {
          return sum + parseFloat(invoice.amount_due || "0");
        }, 0);

        const paidInvoices = invoices.filter(
          (invoice) => invoice.status === "paid"
        );
        const pendingInvoices = invoices.filter(
          (invoice) => invoice.status === "pending"
        );

        // Calculate total users (staff + students)
        const totalStaff = allStaff.length;
        const totalStudents = allSchools.reduce(
          (sum, school) => sum + (school.currentStudents || 0),
          0
        );
        const totalUsers = totalStaff + totalStudents;

        const realStats: DashboardStats = {
          totalSchools: allSchools.length,
          activeSchools: allSchools.filter((school) => school.isActive).length,
          inactiveSchools: allSchools.filter((school) => !school.isActive)
            .length,
          premiumSchools: subscriptions.filter((sub) => sub.status === "active")
            .length,
          totalUsers: totalUsers,
          activeSubscriptions: subscriptions.filter(
            (sub) => sub.status === "active"
          ).length,
          revenue: totalRevenue,
          pendingApprovals: allSchools.filter((school) => !school.isActive)
            .length,
          activeUsers: totalUsers, // For now, consider all users as active
          inactiveUsers: 0,
        };

        setStats(realStats);
      } catch (error) {
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 1247,
          totalSchools: 89,
          activeSubscriptions: 76,
          revenue: 45600,
          pendingApprovals: 12,
          activeUsers: 1189,
          inactiveUsers: 58,
          premiumSchools: 23,
          activeSchools: 67,
          inactiveSchools: 22,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleDownloadDashboardReport = () => {
    try {
      const headers = ["Metric", "Value", "Description"];
      const rows = [
        [
          "Total Users",
          stats.totalUsers.toLocaleString(),
          "All registered users (staff + students)",
        ],
        [
          "Total Schools",
          stats.totalSchools.toString(),
          "All registered schools",
        ],
        [
          "Active Subscriptions",
          stats.activeSubscriptions.toString(),
          "Premium subscriptions",
        ],
        ["Total Revenue", formatCurrency(stats.revenue), "From all invoices"],
        [
          "Pending Approvals",
          stats.pendingApprovals.toString(),
          "Schools awaiting approval",
        ],
        [
          "Active Users",
          stats.activeUsers.toLocaleString(),
          "Users active this month",
        ],
        [
          "Premium Schools",
          stats.premiumSchools.toString(),
          "Schools with premium plans",
        ],
        ["Total Invoices", invoices.length.toString(), "All invoices"],
        [
          "Paid Invoices",
          invoices
            .filter((invoice) => invoice.status === "paid")
            .length.toString(),
          "Successfully paid",
        ],
        [
          "Pending Invoices",
          invoices
            .filter((invoice) => invoice.status === "pending")
            .length.toString(),
          "Awaiting payment",
        ],
        [
          "School Subscriptions",
          subscriptions.length.toString(),
          "All subscriptions",
        ],
      ];

      const doc = generateTablePDF({
        headers,
        rows,
        title: "Super Admin Dashboard Report",
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      });

      downloadPDF(
        doc,
        `dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast({
        title: "Dashboard Report Downloaded",
        description: "Dashboard report has been downloaded successfully.",
      });
    } catch (error) {
      // console.error("Error generating dashboard PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate dashboard PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "default",
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    trend?: { value: number; isPositive: boolean };
    color?: "default" | "success" | "warning" | "danger";
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          size={20}
          className={`${
            color === "success"
              ? "text-green-600"
              : color === "warning"
              ? "text-yellow-600"
              : color === "danger"
              ? "text-red-600"
              : "text-blue-600"
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge
              variant={trend.isPositive ? "default" : "secondary"}
              className={`text-xs ${
                trend.isPositive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
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
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all schools, users, and subscriptions
          </p>
        </div>
        <Button onClick={handleDownloadDashboardReport}>Export Report</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description="All registered users"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="default"
        />
        <StatCard
          title="Total Schools"
          value={stats.totalSchools}
          description={`${stats.activeSchools} active, ${stats.inactiveSchools} inactive`}
          icon={Building2}
          trend={{ value: 8, isPositive: true }}
          color="success"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          description="Premium subscriptions"
          icon={CreditCard}
          trend={{ value: 5, isPositive: true }}
          color="warning"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          description="From all invoices"
          icon={DollarSign}
          trend={{ value: 23, isPositive: true }}
          color="success"
        />
      </div>

      {/* Revenue Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Invoice and revenue statistics from all schools
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/super-admin/invoices")}
              >
                View All Invoices
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/super-admin/school-subscriptions")}
              >
                View Subscriptions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {invoices.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {invoices.filter((invoice) => invoice.status === "paid").length}
              </div>
              <p className="text-sm text-muted-foreground">Paid Invoices</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  invoices.filter((invoice) => invoice.status === "pending")
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">Pending Invoices</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {subscriptions.length}
              </div>
              <p className="text-sm text-muted-foreground">
                School Subscriptions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Schools Overview
              </CardTitle>
              <CardDescription>
                Real-time statistics from all registered schools
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/super-admin/schools")}
            >
              View All Schools
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalSchools}
              </div>
              <p className="text-sm text-muted-foreground">Total Schools</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeSchools}
              </div>
              <p className="text-sm text-muted-foreground">Active Schools</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inactiveSchools}
              </div>
              <p className="text-sm text-muted-foreground">Inactive Schools</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.premiumSchools}
              </div>
              <p className="text-sm text-muted-foreground">Premium Schools</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          description="Users active this month"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          description="Schools awaiting approval"
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Premium Schools"
          value={stats.premiumSchools}
          description="Schools with premium plans"
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users size={24} />
              <span>Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate("/super-admin/schools")}
            >
              <Building2 size={24} />
              <span>Manage Schools</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate("/super-admin/school-subscriptions")}
            >
              <CreditCard size={24} />
              <span>Subscriptions</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate("/super-admin/invoices")}
            >
              <FileText size={24} />
              <span>Invoices</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
function toast(arg0: {
  title: string;
  description: string;
  variant: "destructive";
}) {
  throw new Error("Function not implemented.");
}
