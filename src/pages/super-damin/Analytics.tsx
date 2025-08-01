import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  CreditCard, 
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    growth: number;
  };
  schools: {
    total: number;
    active: number;
    growth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    growth: number;
  };
  monthlyData: {
    month: string;
    revenue: number;
    users: number;
    schools: number;
  }[];
  topSchools: {
    name: string;
    revenue: number;
    users: number;
    subscription: string;
  }[];
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalytics = async () => {
      setLoading(true);
      // Mock data - replace with actual API calls
      setTimeout(() => {
        setData({
          revenue: {
            current: 45600,
            previous: 39800,
            growth: 14.6,
          },
          users: {
            total: 1247,
            active: 1189,
            growth: 8.2,
          },
          schools: {
            total: 89,
            active: 76,
            growth: 12.5,
          },
          subscriptions: {
            total: 89,
            active: 76,
            growth: 15.2,
          },
          monthlyData: [
            { month: "Jan", revenue: 42000, users: 1150, schools: 82 },
            { month: "Feb", revenue: 43500, users: 1180, schools: 84 },
            { month: "Mar", revenue: 44100, users: 1200, schools: 85 },
            { month: "Apr", revenue: 44800, users: 1220, schools: 86 },
            { month: "May", revenue: 45200, users: 1240, schools: 87 },
            { month: "Jun", revenue: 45600, users: 1247, schools: 89 },
          ],
          topSchools: [
            {
              name: "Springfield High School",
              revenue: 299.99,
              users: 1250,
              subscription: "Premium",
            },
            {
              name: "Riverside High",
              revenue: 299.99,
              users: 1100,
              subscription: "Premium",
            },
            {
              name: "Lincoln Elementary",
              revenue: 99.99,
              users: 450,
              subscription: "Basic",
            },
            {
              name: "Oakwood Academy",
              revenue: 299.99,
              users: 800,
              subscription: "Premium",
            },
            {
              name: "Central Middle School",
              revenue: 99.99,
              users: 0,
              subscription: "Basic",
            },
          ],
        });
        setLoading(false);
      }, 1000);
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.current)}</div>
            <div className="flex items-center gap-2 mt-2">
              {getGrowthIcon(data.revenue.growth)}
              <span className={`text-sm ${getGrowthColor(data.revenue.growth)}`}>
                +{data.revenue.growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.users.total)}</div>
            <div className="flex items-center gap-2 mt-2">
              {getGrowthIcon(data.users.growth)}
              <span className={`text-sm ${getGrowthColor(data.users.growth)}`}>
                +{data.users.growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.schools.active}</div>
            <div className="flex items-center gap-2 mt-2">
              {getGrowthIcon(data.schools.growth)}
              <span className={`text-sm ${getGrowthColor(data.schools.growth)}`}>
                +{data.schools.growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subscriptions.active}</div>
            <div className="flex items-center gap-2 mt-2">
              {getGrowthIcon(data.subscriptions.growth)}
              <span className={`text-sm ${getGrowthColor(data.subscriptions.growth)}`}>
                +{data.subscriptions.growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.monthlyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(item.revenue / 50000) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                Revenue in USD
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              Monthly user growth over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.monthlyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-8 bg-green-500 rounded-t"
                    style={{ 
                      height: `${(item.users / 1500) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                Total Users
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Schools</CardTitle>
          <CardDescription>
            Schools with highest revenue and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(school.users)} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={school.subscription === "Premium" ? "default" : "secondary"}
                    className={school.subscription === "Premium" ? "bg-purple-100 text-purple-800" : ""}
                  >
                    {school.subscription}
                  </Badge>
                  <span className="font-medium">{formatCurrency(school.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.4%</div>
            <p className="text-xs text-muted-foreground">
              Trial to paid conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(199.99)}</div>
            <p className="text-xs text-muted-foreground">
              Per school per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Current active users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 