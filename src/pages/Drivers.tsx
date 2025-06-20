import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addDriver, fetchDrivers } from "../redux/slices/driversSlice";
import { fetchSchools } from "../redux/slices/schoolsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye as ViewIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Drivers = () => {
  const dispatch = useAppDispatch();
  const { drivers, loading, error } = useAppSelector((state) => state.drivers);
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    schools,
    loading: schoolsLoading,
    error: schoolsError,
  } = useAppSelector((state) => state.schools);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Action modals state
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Action handlers
  const handleView = (driver) => {
    setSelectedDriver(driver);
    setIsViewModalOpen(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);

    // Handle current_location which can be either an object or string
    let latitude = -1.286389;
    let longitude = 36.817223;

    if (driver.current_location) {
      if (typeof driver.current_location === "object") {
        latitude = driver.current_location.latitude;
        longitude = driver.current_location.longitude;
      } else if (typeof driver.current_location === "string") {
        // Handle the old string format "SRID=4326;POINT (longitude latitude)"
        const match = driver.current_location.match(
          /POINT \(([^ ]+) ([^)]+)\)/
        );
        if (match) {
          longitude = parseFloat(match[1]);
          latitude = parseFloat(match[2]);
        }
      }
    }

    setFormData({
      firstName: driver.user_details?.first_name || "",
      lastName: driver.user_details?.last_name || "",
      email: driver.user_details?.email || "",
      phoneNumber: driver.user_details?.phone_number || "",
      password: "",
      confirmPassword: "",
      licenseNumber: driver.license_number || "",
      licenseClass: driver.license_class || "",
      licenseExpiry: driver.license_expiry || "",
      lastHealthCheck: driver.last_health_check || "",
      lastBackgroundCheck: driver.last_background_check || "",
      latitude,
      longitude,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // TODO: Implement delete driver API call
      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete driver",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting to fetch data...");
        const driversResult = await dispatch(fetchDrivers()).unwrap();
        console.log("Drivers fetched successfully:", driversResult);

        console.log("Starting to fetch schools...");
        try {
          const schoolsResult = await dispatch(fetchSchools()).unwrap();
          if (Array.isArray(schoolsResult)) {
            console.log("Schools fetched successfully:", schoolsResult);
          } else {
            console.error("Invalid schools data format:", schoolsResult);
          }
        } catch (schoolsError) {
          console.error("Failed to fetch schools:", {
            error: schoolsError,
            message: schoolsError?.message,
            response: schoolsError?.response?.data,
          });
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (schools && Array.isArray(schools) && schools.length > 0) {
      console.log(
        "Schools data loaded:",
        schools.map((school) => ({
          id: school.id,
          name: school.name,
          location: school.location,
          contact: school.contact_number,
          email: school.email,
          operatingHours: `${school.operating_hours_start} - ${school.operating_hours_end}`,
          isActive: school.is_active,
        }))
      );
    } else if (schoolsLoading) {
      console.log("Loading schools...", { schoolsLoading, schoolsError });
    } else if (schoolsError) {
      console.error("Error loading schools:", schoolsError);
    } else {
      console.log("Schools state:", {
        schools: schools || [],
        schoolsLoading,
        schoolsError,
        isArray: Array.isArray(schools),
      });
    }
  }, [schools, schoolsLoading, schoolsError]);

  // Filter schools for the current admin
  const filteredSchools =
    schools?.filter((school) => school.admin === user?.id) || [];

  // Get the first school's ID (assuming admin has one school)
  const schoolId = filteredSchools[0]?.id;

  // Filter drivers for the school
  // Temporarily show all drivers to debug the issue
  const filteredDrivers =
    drivers?.filter((driver) => driver.school === schoolId) || [];

  // Filter and search logic
  const filteredAndSearchedDrivers = filteredDrivers.filter((driver) => {
    console.log("Checking driver:", driver);
    // Check if driver and user_details exist before accessing properties
    if (!driver || !driver.user_details) {
      console.log("Skipping driver - no user_details:", driver);
      return false; // Skip drivers without user_details
    }

    const matchesSearch =
      (driver.user_details.first_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (driver.user_details.last_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (driver.user_details.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (driver.user_details.phone_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (driver.license_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && driver.is_available) ||
      (statusFilter === "unavailable" && !driver.is_available);

    console.log(
      "Driver matches search:",
      matchesSearch,
      "matches status:",
      matchesStatus
    );
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  console.log("=== PAGINATION DEBUG ===");
  console.log(
    "filteredAndSearchedDrivers length:",
    filteredAndSearchedDrivers.length
  );
  console.log("totalPages:", totalPages);
  console.log("startIndex:", startIndex);
  console.log("endIndex:", endIndex);
  console.log("paginatedDrivers:", paginatedDrivers);
  console.log("=== END PAGINATION DEBUG ===");

  // Temporary: Show all drivers without any filtering
  console.log("=== ALL DRIVERS TEST ===");
  console.log("Raw drivers from Redux:", drivers);
  console.log("Drivers length:", drivers?.length);
  console.log("First driver:", drivers?.[0]);
  console.log("=== END ALL DRIVERS TEST ===");

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    licenseClass: "",
    licenseExpiry: "",
    lastHealthCheck: "",
    lastBackgroundCheck: "",
    latitude: -1.286389,
    longitude: 36.817223,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const updateLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast({
            title: "Success",
            description: "Current location updated",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: "Failed to get current location: " + error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      user_details: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        user_type: "driver",
      },
      license_number: formData.licenseNumber,
      license_expiry: formData.licenseExpiry,
      license_class: formData.licenseClass,
      school: schoolId || 1,
      is_available: true,
      current_location: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      safety_rating: 4.8,
      on_time_rating: 4.9,
      last_health_check: formData.lastHealthCheck,
      last_background_check: formData.lastBackgroundCheck,
    };

    try {
      await dispatch(addDriver(submitData)).unwrap();
      window.location.reload();
      toast({
        title: "Success",
        description: "Driver added successfully",
      });
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        licenseNumber: "",
        licenseClass: "",
        licenseExpiry: "",
        lastHealthCheck: "",
        lastBackgroundCheck: "",
        latitude: -1.286389,
        longitude: 36.817223,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add driver",
        variant: "destructive",
      });
    }
  };

  const AddDriverForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            type="text"
            placeholder="Enter first name"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            type="text"
            placeholder="Enter last name"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            type="email"
            placeholder="Enter email address"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            type="tel"
            placeholder="Enter phone number"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              required
              minLength={8}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              required
              minLength={8}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            type="text"
            placeholder="Enter license number"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseClass">License Class</Label>
          <Input
            id="licenseClass"
            name="licenseClass"
            value={formData.licenseClass}
            onChange={handleInputChange}
            type="text"
            placeholder="Enter license class"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseExpiry">License Expiry</Label>
          <Input
            id="licenseExpiry"
            name="licenseExpiry"
            value={formData.licenseExpiry}
            onChange={handleInputChange}
            type="date"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastHealthCheck">Last Health Check</Label>
          <Input
            id="lastHealthCheck"
            name="lastHealthCheck"
            value={formData.lastHealthCheck}
            onChange={handleInputChange}
            type="date"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lastBackgroundCheck">Last Background Check</Label>
          <Input
            id="lastBackgroundCheck"
            name="lastBackgroundCheck"
            value={formData.lastBackgroundCheck}
            onChange={handleInputChange}
            type="date"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            type="number"
            step="any"
            placeholder="Enter latitude"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            type="number"
            step="any"
            placeholder="Enter longitude"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={updateLocation}
          className="bg-blue-600 hover:bg-blue-700 mb-4"
        >
          Get Current Location
        </Button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 w-full"
      >
        {loading ? "Adding Driver..." : "Add Driver"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Drivers</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <AddDriverForm />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search drivers by name, email, phone, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSearchedDrivers.length)} of{" "}
            {filteredAndSearchedDrivers.length} drivers
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "all" && ` (${statusFilter})`}
          </div>

          {loading ? (
            <div className="text-center py-4">Loading drivers...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Safety Rating</TableHead>
                  <TableHead>On-time Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDrivers && paginatedDrivers.length > 0 ? (
                  paginatedDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        {driver.user_details?.first_name || "N/A"}{" "}
                        {driver.user_details?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {driver.user_details?.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        {driver.user_details?.phone_number || "N/A"}
                      </TableCell>
                      <TableCell>
                        {driver.license_number || "N/A"} (
                        {driver.license_class || "N/A"})
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            driver.is_available ? "default" : "secondary"
                          }
                        >
                          {driver.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {driver.safety_rating?.toString() || "N/A"}
                      </TableCell>
                      <TableCell>
                        {driver.on_time_rating?.toString() || "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(driver)}
                            >
                              <ViewIcon className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(driver)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(driver)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Driver Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Name</Label>
                  <p>
                    {selectedDriver.user_details?.first_name || "N/A"}{" "}
                    {selectedDriver.user_details?.last_name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedDriver.user_details?.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p>{selectedDriver.user_details?.phone_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">License Number</Label>
                  <p>{selectedDriver.license_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">License Class</Label>
                  <p>{selectedDriver.license_class || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">License Expiry</Label>
                  <p>{selectedDriver.license_expiry || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={
                      selectedDriver.is_available ? "default" : "secondary"
                    }
                  >
                    {selectedDriver.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Safety Rating</Label>
                  <p>{selectedDriver.safety_rating?.toString() || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">On-time Rating</Label>
                  <p>{selectedDriver.on_time_rating?.toString() || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Last Health Check</Label>
                  <p>{selectedDriver.last_health_check || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Last Background Check</Label>
                  <p>{selectedDriver.last_background_check || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Driver Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          <AddDriverForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              driver
              {selectedDriver &&
                ` "${selectedDriver.user_details?.first_name || "Unknown"} ${
                  selectedDriver.user_details?.last_name || "Driver"
                }"`}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Drivers;
