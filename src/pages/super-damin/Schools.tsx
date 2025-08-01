import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Building2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { schoolsService, School } from "@/services/schoolsService";

const Schools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const schoolsData = await schoolsService.getAllSchools();
        console.log("Schools component received data:", schoolsData);

        // Ensure we have valid data
        if (Array.isArray(schoolsData) && schoolsData.length > 0) {
          setSchools(schoolsData);
        } else {
          console.warn("No valid schools data received, using fallback");
          // Fallback to mock data if API returns empty or invalid data
          setSchools([
            {
              _id: "1",
              name: "Springfield High School",
              address: "123 Main St, Springfield, IL",
              phone: "+1-555-0123",
              email: "info@springfield.edu",
              principal: {
                name: "John Doe",
                phone: "+1-555-0124",
                email: "john.doe@springfield.edu",
              },
              isActive: true,
              location: "Springfield, IL",
              type: "secondary",
              capacity: 1500,
              currentStudents: 1250,
              createdAt: "2023-09-15T00:00:00.000Z",
              updatedAt: "2024-01-15T10:30:00.000Z",
              subscription: "Premium",
              staff: 85,
              lastActive: "2024-01-15 10:30 AM",
            },
            {
              _id: "2",
              name: "Lincoln Elementary",
              address: "456 Oak Ave, Lincoln, NE",
              phone: "+1-555-0125",
              email: "info@lincoln.edu",
              principal: {
                name: "Jane Smith",
                phone: "+1-555-0126",
                email: "jane.smith@lincoln.edu",
              },
              isActive: true,
              location: "Lincoln, NE",
              type: "primary",
              capacity: 500,
              currentStudents: 450,
              createdAt: "2023-10-20T00:00:00.000Z",
              updatedAt: "2024-01-14T14:15:00.000Z",
              subscription: "Basic",
              staff: 32,
              lastActive: "2024-01-14 02:15 PM",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        // Fallback to mock data if API fails
        setSchools([
          {
            _id: "1",
            name: "Springfield High School",
            address: "123 Main St, Springfield, IL",
            phone: "+1-555-0123",
            email: "info@springfield.edu",
            principal: {
              name: "John Doe",
              phone: "+1-555-0124",
              email: "john.doe@springfield.edu",
            },
            isActive: true,
            location: "Springfield, IL",
            type: "secondary",
            capacity: 1500,
            currentStudents: 1250,
            createdAt: "2023-09-15T00:00:00.000Z",
            updatedAt: "2024-01-15T10:30:00.000Z",
            subscription: "Premium",
            staff: 85,
            lastActive: "2024-01-15 10:30 AM",
          },
          {
            _id: "2",
            name: "Lincoln Elementary",
            address: "456 Oak Ave, Lincoln, NE",
            phone: "+1-555-0125",
            email: "info@lincoln.edu",
            principal: {
              name: "Jane Smith",
              phone: "+1-555-0126",
              email: "jane.smith@lincoln.edu",
            },
            isActive: true,
            location: "Lincoln, NE",
            type: "primary",
            capacity: 500,
            currentStudents: 450,
            createdAt: "2023-10-20T00:00:00.000Z",
            updatedAt: "2024-01-14T14:15:00.000Z",
            subscription: "Basic",
            staff: 32,
            lastActive: "2024-01-14 02:15 PM",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = schools.filter((school) => {
    // Skip invalid schools
    if (!school || !school.name) {
      return false;
    }

    const matchesSearch =
      (school.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.principal?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (school.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && (school.isActive || false)) ||
      (statusFilter === "inactive" && !(school.isActive || false)) ||
      (statusFilter === "pending" && !(school.isActive || false)) ||
      (statusFilter === "suspended" && !(school.isActive || false));
    const matchesSubscription =
      subscriptionFilter === "all" ||
      (school.subscription || "Basic") === subscriptionFilter;

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case "Basic":
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>;
      default:
        return <Badge variant="outline">{subscription}</Badge>;
    }
  };

  const handleToggleSchoolStatus = async (schoolId: string) => {
    try {
      await schoolsService.toggleSchoolStatus(schoolId);
      // Refresh schools data
      const updatedSchools = await schoolsService.getAllSchools();
      setSchools(updatedSchools);
    } catch (error) {
      console.error("Error toggling school status:", error);
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
            Schools Management
          </h1>
          <p className="text-muted-foreground">
            Manage all registered schools and their subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button>
            <Building2 size={16} className="mr-2" />
            Add School
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schools
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.filter((s) => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Schools
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.filter((s) => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Premium Schools
            </CardTitle>
            <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.filter((s) => s.subscription === "Premium").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Premium subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter schools by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={subscriptionFilter}
              onValueChange={setSubscriptionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools ({filteredSchools.length})</CardTitle>
          <CardDescription>
            All registered schools in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSchools.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
              <p className="text-muted-foreground">
                {schools.length === 0
                  ? "No schools are currently registered in the system."
                  : "No schools match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{school.name || "Unknown School"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/super-admin/schools/${school._id}`)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {school.principal?.name || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {school.principal?.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{school.location || "N/A"}</TableCell>
                    <TableCell>
                      {getStatusBadge(school.isActive || false)}
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(school.subscription || "Basic")}
                    </TableCell>
                    <TableCell>
                      {(school.currentStudents || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {school.staff?.toLocaleString() || "N/A"}
                    </TableCell>
                    <TableCell>{school.lastActive || "Never"}</TableCell>
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
                            onClick={() =>
                              navigate(`/super-admin/schools/${school._id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit School
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleSchoolStatus(school._id)}
                          >
                            {school.isActive ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate School
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate School
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete School
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
    </div>
  );
};

export default Schools;
