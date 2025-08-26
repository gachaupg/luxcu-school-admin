import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchVehicles,
  addVehicle,
  deleteVehicle,
  Vehicle,
} from "../redux/slices/vehiclesSlice";
import { fetchDrivers } from "../redux/slices/driversSlice";
import {
  Car,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye as ViewIcon,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { parseVehicleError } from "@/utils/errorHandler";
import { ExportDropdown } from "@/components/ExportDropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

// Form component moved outside to prevent recreation on every render
interface VehicleFormData {
  registration_number: string;
  vehicle_type: string;
  capacity: number;
  school: number | null;
  driver: number;
  manufacturer: string;
  model: string;
  year: number;
  fuel_type: string;
  is_active: boolean;
  mileage: number;
  has_gps: boolean;
  has_camera: boolean;
  has_emergency_button: boolean;
  [key: string]: string | number | boolean | null;
}

interface Driver {
  id: number;
  phone_number?: string;
  user_details: {
    id?: number;
    phone_number: string;
    user_type: string;
    email: string;
    first_name: string;
    last_name: string;
    username?: string;
    profile_image?: string;
  };
}

const AddVehicleForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  filteredDrivers,
  driversLoading,
}: {
  formData: VehicleFormData;
  setFormData: React.Dispatch<React.SetStateAction<VehicleFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  filteredDrivers: Driver[];
  driversLoading: boolean;
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "driver" ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={onSubmit} className="">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicle_type">Vehicle Type</Label>
          <Select
            value={formData.vehicle_type}
            onValueChange={(value) => handleSelectChange("vehicle_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="car">Car</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver">Driver</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled={driversLoading}
              >
                {formData.driver === 0
                  ? "Select driver..."
                  : filteredDrivers.find(
                      (driver) =>
                        (driver.user_details.id || driver.id) ===
                        formData.driver
                    )
                  ? `${
                      filteredDrivers.find(
                        (driver) =>
                          (driver.user_details.id || driver.id) ===
                          formData.driver
                      )?.user_details.first_name
                    } ${
                      filteredDrivers.find(
                        (driver) =>
                          (driver.user_details.id || driver.id) ===
                          formData.driver
                      )?.user_details.last_name
                    } (${
                      filteredDrivers.find(
                        (driver) =>
                          (driver.user_details.id || driver.id) ===
                          formData.driver
                      )?.phone_number
                    })`
                  : "Select driver..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search drivers..." />
                <CommandList>
                  <CommandEmpty>No driver found.</CommandEmpty>
                  <CommandGroup>
                    {driversLoading ? (
                      <CommandItem disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading drivers...
                        </div>
                      </CommandItem>
                    ) : filteredDrivers.length === 0 ? (
                      <CommandItem disabled>No drivers available</CommandItem>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <CommandItem
                          key={driver.id}
                          value={`${driver.user_details.first_name} ${
                            driver.user_details.last_name
                          } ${driver.phone_number || ""}`}
                          onSelect={() =>
                            handleSelectChange(
                              "driver",
                              (driver.user_details.id || driver.id).toString()
                            )
                          }
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.driver ===
                              (driver.user_details.id || driver.id)
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span>
                              {driver.user_details.first_name}{" "}
                              {driver.user_details.last_name}
                            </span>
                            {driver.phone_number && (
                              <span className="text-xs text-muted-foreground">
                                {driver.phone_number}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel_type">Fuel Type</Label>
          <Select
            value={formData.fuel_type}
            onValueChange={(value) => handleSelectChange("fuel_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has_gps"
              checked={formData.has_gps}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  has_gps: e.target.checked,
                }))
              }
            />
            <Label htmlFor="has_gps">GPS</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has_camera"
              checked={formData.has_camera}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  has_camera: e.target.checked,
                }))
              }
            />
            <Label htmlFor="has_camera">Camera</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has_emergency_button"
              checked={formData.has_emergency_button}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  has_emergency_button: e.target.checked,
                }))
              }
            />
            <Label htmlFor="has_emergency_button">Emergency Button</Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white mt-1"
      >
        {loading ? "Adding Vehicle..." : "Add Vehicle"}
      </Button>
    </form>
  );
};

export default function Vehicles() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { vehicles, loading, error } = useAppSelector(
    (state) => state.vehicles
  );

  // Debug logging for vehicles state
  useEffect(() => {
    // console.log("Vehicles state updated:", {
    //   count: vehicles.length,
    //   vehicles: vehicles,
    //   loading: loading,
    //   error: error,
    // });
  }, [vehicles, loading, error]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { schools } = useAppSelector((state) => state.schools);
  const { drivers, loading: driversLoading } = useAppSelector(
    (state) => state.drivers
  );

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Action modals state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter schools for the current admin
  const filteredSchools =
    schools?.filter((school) => school.admin === user?.id) || [];

  // Get the first school's ID (assuming admin has one school)
  const schoolId = filteredSchools[0]?.id;
  // Filter drivers for the school
  const filteredDrivers =
    drivers?.filter((driver) => driver?.school === schoolId) || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        if (schoolId) {
          const result = await dispatch(fetchVehicles({ schoolId }));
          // console.log("Fetch vehicles result:", result);
        }
        await dispatch(fetchDrivers());
      } catch (err) {
        // console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [dispatch, schoolId]);

  useEffect(() => {
   
  }, [
    user,
    schoolId,
    schools,
    drivers,
    filteredSchools,
    filteredDrivers,
    driversLoading,
  ]);

  // Filter and search logic
  const filteredAndSearchedVehicles = vehicles.filter((vehicle) => {
    if (!vehicle) return false;

    const matchesSearch =
      (vehicle.registration_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.manufacturer || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicle_type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (
        filteredDrivers.find((d) => d?.id === vehicle.driver)?.user_details
          ?.first_name || ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (
        filteredDrivers.find((d) => d?.id === vehicle.driver)?.user_details
          ?.last_name || ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && vehicle.is_active) ||
      (statusFilter === "inactive" && !vehicle.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSearchedVehicles.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredAndSearchedVehicles.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Action handlers
  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number || "",
      vehicle_type: vehicle.vehicle_type || "bus",
      capacity: vehicle.capacity || 40,
      school: schoolId,
      driver: vehicle.driver || 0,
      manufacturer: vehicle.manufacturer || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      fuel_type: vehicle.fuel_type || "diesel",
      is_active: vehicle.is_active ?? true,
      mileage: vehicle.mileage || 0,
      has_gps: vehicle.has_gps ?? true,
      has_camera: vehicle.has_camera ?? true,
      has_emergency_button: vehicle.has_emergency_button ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
    

      if (!selectedVehicle) {
        toast({
          title: "Error",
          description: "No vehicle selected for deletion",
          variant: "destructive",
        });
        return;
      }

      if (!selectedVehicle.id) {
        toast({
          title: "Error",
          description: "Vehicle ID is missing",
          variant: "destructive",
        });
        return;
      }

      // Ensure ID is a number
      const vehicleId =
        typeof selectedVehicle.id === "string"
          ? parseInt(selectedVehicle.id)
          : selectedVehicle.id;

      await dispatch(deleteVehicle(vehicleId)).unwrap();

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      let errorMessage = "Failed to delete vehicle";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const [formData, setFormData] = useState<VehicleFormData>({
    registration_number: "",
    vehicle_type: "bus",
    capacity: 40,
    school: schoolId || null,
    driver: 0,
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    fuel_type: "diesel",
    is_active: true,
    mileage: 0,
    has_gps: true,
    has_camera: true,
    has_emergency_button: true,
  });

  // Update formData when schoolId changes
  useEffect(() => {
    if (schoolId) {
      setFormData((prev) => ({
        ...prev,
        school: schoolId,
      }));
    }
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that we have a valid school ID
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school found. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(addVehicle(formData)).unwrap();
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        registration_number: "",
        vehicle_type: "bus",
        capacity: 40,
        school: schoolId,
        driver: 0,
        manufacturer: "",
        model: "",
        year: new Date().getFullYear(),
        fuel_type: "diesel",
        is_active: true,
        mileage: 0,
        has_gps: true,
        has_camera: true,
        has_emergency_button: true,
      });
    } catch (error) {

      // Show the actual database error response
      let errorMessage = "Failed to add vehicle";

      if (error instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(error.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 flex w-full">
        <div className="flex-1">
          <main className="flex-1 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading vehicles...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-3 flex w-full">
        <div className="flex-1">
          <main className="flex-1 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-2 sm:px-4 py-4 w-full max-w-[98vw] mx-auto">
          {/* Page Title Only */}
          <div className="mb-2 flex justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Car className="w-8 h-8 text-green-500" /> Vehicles
            </h1>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#f7c624] hover:bg-[#f7c624] text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
                    disabled={!schoolId}
                    title={
                      !schoolId
                        ? "No school found. Please contact your administrator."
                        : ""
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                  </DialogHeader>
                  <AddVehicleForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    loading={loading}
                    filteredDrivers={filteredDrivers}
                    driversLoading={driversLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Vehicles Table */}
          <Card className="bg-white border-0 rounded-xl">
            <div className="mb-2">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2"></div>

              {/* Search and Filter Toolbar */}
              <div className="bg-white">
                <CardContent className="">
                  <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search vehicles by registration, manufacturer, model, or driver..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-full shadow-sm"
                        />
                        {searchTerm && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Found {filteredAndSearchedVehicles.length} vehicle
                            {filteredAndSearchedVehicles.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-full sm:w-40 border-gray-200 rounded-full shadow-sm">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vehicles</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setCurrentPage(1);
                        }}
                        className="border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-full shadow-sm"
                      >
                        Clear Filters
                      </Button>
                      <ExportDropdown
                        data={{
                          headers: [
                            "Registration Number",
                            "Driver",
                            "Vehicle Type",
                            "Capacity",
                            "Manufacturer",
                            "Model",
                            "Year",
                            "Fuel Type",
                            "Status",
                            "Mileage",
                            "GPS",
                            "Camera",
                            "Emergency Button",
                          ],
                          data: filteredAndSearchedVehicles.map((vehicle) => ({
                            registration_number:
                              vehicle.registration_number || "",
                            driver: filteredDrivers.find(
                              (d) => d?.id === vehicle.driver
                            )
                              ? `${
                                  filteredDrivers.find(
                                    (d) => d?.id === vehicle.driver
                                  )?.user_details?.first_name || ""
                                } ${
                                  filteredDrivers.find(
                                    (d) => d?.id === vehicle.driver
                                  )?.user_details?.last_name || ""
                                }`
                              : "Not Assigned",
                            vehicle_type: vehicle.vehicle_type || "",
                            capacity: vehicle.capacity?.toString() || "",
                            manufacturer: vehicle.manufacturer || "",
                            model: vehicle.model || "",
                            year: vehicle.year?.toString() || "",
                            fuel_type: vehicle.fuel_type || "",
                            status: vehicle.is_active ? "Active" : "Inactive",
                            mileage: vehicle.mileage?.toString() || "",
                            gps: vehicle.has_gps ? "Yes" : "No",
                            camera: vehicle.has_camera ? "Yes" : "No",
                            emergency_button: vehicle.has_emergency_button
                              ? "Yes"
                              : "No",
                          })),
                          fileName: "vehicles_export",
                          title: "Vehicles Directory",
                        }}
                        className="border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">
                      Loading vehicles...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Car className="h-12 w-12 text-muted-foreground/50" />
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        No vehicles found
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Get started by adding your first vehicle
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-2"
                      disabled={!schoolId}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Registration No.
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Driver
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Capacity
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedVehicles.map((vehicle, idx) => {
                          if (!vehicle) return null;

                          const driver = filteredDrivers.find(
                            (d) => d?.id === vehicle.driver
                          );
                          const driverName = driver
                            ? `${driver.user_details?.first_name || ""} ${
                                driver.user_details?.last_name || ""
                              }`.trim()
                            : "Not Assigned";

                          return (
                            <tr
                              key={vehicle.id}
                              className={`transition-colors duration-200 ${
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-green-50`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    <Car className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {vehicle.registration_number || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {vehicle.manufacturer} {vehicle.model}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                    {driverName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </div>
                                  <div className="text-sm text-gray-900">
                                    {driverName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className="capitalize font-medium bg-gray-100 text-gray-700 border-gray-200"
                                >
                                  {vehicle.vehicle_type || "N/A"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {vehicle.capacity || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500 ml-1">
                                    seats
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  vehicle.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  <span className={`w-2 h-2 rounded-full inline-block ${
                                    vehicle.is_active ? "bg-green-500" : "bg-gray-500"
                                  }`}></span>
                                  {vehicle.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleView(vehicle)}
                                    title="View Details"
                                  >
                                    <ViewIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(vehicle)}
                                    title="Edit Vehicle"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(vehicle)}
                                    title="Delete Vehicle"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Pagination */}
                  <div className="bg-white border-t border-gray-200">
                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Page Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Showing</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md font-semibold text-gray-900">
                            {startIndex + 1}
                          </span>
                          <span>to</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md font-semibold text-gray-900">
                            {Math.min(endIndex, filteredAndSearchedVehicles.length)}
                          </span>
                          <span>of</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md font-semibold text-gray-900">
                            {filteredAndSearchedVehicles.length}
                          </span>
                          <span>vehicles</span>
                        </div>
                        {filteredAndSearchedVehicles.length > 0 && (
                          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                            <span>•</span>
                            <span>Page {currentPage} of {totalPages}</span>
                          </div>
                        )}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center gap-3">
                          {/* First Page Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-9 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            <ChevronLeft className="h-4 w-4 -ml-2" />
                          </Button>

                          {/* Previous Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-9 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {/* Show first page if not in range */}
                            {currentPage > 3 && totalPages > 5 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(1)}
                                  className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium"
                                >
                                  1
                                </Button>
                                {currentPage > 4 && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                              </>
                            )}

                            {/* Current page range */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                if (totalPages <= 5) return true;
                                if (currentPage <= 3) return page <= 5;
                                if (currentPage >= totalPages - 2) return page >= totalPages - 4;
                                return Math.abs(page - currentPage) <= 1;
                              })
                              .map((page) => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`h-9 w-9 p-0 font-medium transition-all duration-200 ${
                                    currentPage === page
                                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                                      : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                  }`}
                                >
                                  {page}
                                </Button>
                              ))}

                            {/* Show last page if not in range */}
                            {currentPage < totalPages - 2 && totalPages > 5 && (
                              <>
                                {currentPage < totalPages - 3 && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(totalPages)}
                                  className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium"
                                >
                                  {totalPages}
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Next Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-9 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>

                          {/* Last Page Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-9 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-4 w-4 ml-1" />
                            <ChevronRight className="h-4 w-4 -mr-2" />
                          </Button>
                        </div>
                      )}

                      {/* Items Per Page Selector */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show:</span>
                                                 <Select
                           value={itemsPerPage.toString()}
                           onValueChange={(value) => {
                             setItemsPerPage(parseInt(value));
                           }}
                         >
                          <SelectTrigger className="h-8 w-16 border-gray-300 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>per page</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* View Vehicle Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Registration Number</Label>
                  <p>{selectedVehicle.registration_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Vehicle Type</Label>
                  <p className="capitalize">
                    {selectedVehicle.vehicle_type || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Manufacturer</Label>
                  <p>{selectedVehicle.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Model</Label>
                  <p>{selectedVehicle.model || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Year</Label>
                  <p>{selectedVehicle.year || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Capacity</Label>
                  <p>{selectedVehicle.capacity || "N/A"} passengers</p>
                </div>
                <div>
                  <Label className="font-semibold">Fuel Type</Label>
                  <p className="capitalize">
                    {selectedVehicle.fuel_type || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Mileage</Label>
                  <p>{selectedVehicle.mileage || "N/A"} km</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={
                      selectedVehicle.is_active ? "default" : "secondary"
                    }
                  >
                    {selectedVehicle.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Driver</Label>
                  <p>
                    {filteredDrivers.find(
                      (d) => d?.user_details?.id === selectedVehicle.driver
                    )?.user_details?.first_name || ""}{" "}
                    {filteredDrivers.find(
                      (d) => d?.user_details?.id === selectedVehicle.driver
                    )?.user_details?.last_name || "Not assigned"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Features</Label>
                <div className="flex gap-2 mt-2">
                  {selectedVehicle.has_gps && (
                    <Badge variant="outline">GPS</Badge>
                  )}
                  {selectedVehicle.has_camera && (
                    <Badge variant="outline">Camera</Badge>
                  )}
                  {selectedVehicle.has_emergency_button && (
                    <Badge variant="outline">Emergency Button</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <AddVehicleForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            filteredDrivers={filteredDrivers}
            driversLoading={driversLoading}
          />
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
              vehicle
              {selectedVehicle && ` "${selectedVehicle.registration_number}"`}.
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
}
