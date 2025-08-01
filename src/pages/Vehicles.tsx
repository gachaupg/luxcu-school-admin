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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    console.log("Vehicles state updated:", {
      count: vehicles.length,
      vehicles: vehicles,
      loading: loading,
      error: error,
    });
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
  const [itemsPerPage] = useState(10);

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
  console.log("schoolId", schoolId);
  // Filter drivers for the school
  const filteredDrivers =
    drivers?.filter((driver) => driver?.school === schoolId) || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading vehicles data for schoolId:", schoolId);
        if (schoolId) {
          const result = await dispatch(fetchVehicles({ schoolId }));
          console.log("Fetch vehicles result:", result);
        }
        await dispatch(fetchDrivers());
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [dispatch, schoolId]);

  useEffect(() => {
    console.log("Debug data:", {
      user: {
        id: user?.id,
        type: user?.user_type,
      },
      schoolId,
      schools: {
        all: schools,
        filtered: filteredSchools,
        count: schools?.length,
      },
      drivers: {
        all: drivers,
        filtered: filteredDrivers,
        count: drivers?.length,
        loading: driversLoading,
      },
    });
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
  }, [searchTerm, statusFilter]);

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
    console.log("handleDelete called with vehicle:", vehicle);
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("confirmDelete called");
      console.log("selectedVehicle:", selectedVehicle);

      if (!selectedVehicle) {
        console.log("No vehicle selected");
        toast({
          title: "Error",
          description: "No vehicle selected for deletion",
          variant: "destructive",
        });
        return;
      }

      if (!selectedVehicle.id) {
        console.log("Vehicle ID is undefined");
        toast({
          title: "Error",
          description: "Vehicle ID is missing",
          variant: "destructive",
        });
        return;
      }

      console.log("Attempting to delete vehicle with ID:", selectedVehicle.id);
      console.log("Vehicle ID type:", typeof selectedVehicle.id);

      // Ensure ID is a number
      const vehicleId =
        typeof selectedVehicle.id === "string"
          ? parseInt(selectedVehicle.id)
          : selectedVehicle.id;
      console.log("Converted vehicle ID:", vehicleId);

      await dispatch(deleteVehicle(vehicleId)).unwrap();

      console.log("Vehicle deleted successfully");
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Delete vehicle error:", err);
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
      console.error("Vehicle creation error:", error);

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
    <div className="min-h-screen bg-background flex w-full">
      <div className="flex-1">
        <main className="flex-1 bg-background">
          <div className="">
            <Card className="mt-1">
              <CardHeader className="pb-3 border-b border-border flex flex-row w-full items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle List
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
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
              </CardHeader>

              {/* Search and Filter Controls */}
              <div className="p-6 border-b border-border/50 bg-muted/10">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search vehicles by registration, manufacturer, model, or driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-background border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    {searchTerm && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Found {filteredAndSearchedVehicles.length} vehicle
                        {filteredAndSearchedVehicles.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[160px] h-10 bg-background border-border/50">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vehicles</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                      className="h-10 bg-background border-border/50 hover:bg-accent/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">
                            Loading vehicles...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-destructive font-medium">
                            {error}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                          >
                            Try Again
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
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
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((vehicle) => {
                      console.log("Rendering vehicle:", vehicle);
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
                          className="group hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Car className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-foreground">
                                  {vehicle.registration_number || "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {vehicle.manufacturer} {vehicle.model}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {driverName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-foreground">
                                  {driverName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Driver
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className="capitalize font-medium"
                            >
                              {vehicle.vehicle_type || "N/A"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-foreground">
                                {vehicle.capacity || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground ml-1">
                                seats
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                vehicle.is_active ? "default" : "secondary"
                              }
                              className={`font-medium ${
                                vehicle.is_active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                              }`}
                            >
                              <div className="w-2 h-2 rounded-full mr-2 bg-current"></div>
                              {vehicle.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-accent"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleView(vehicle)}
                                    className="cursor-pointer"
                                  >
                                    <ViewIcon className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(vehicle)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Vehicle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(vehicle)}
                                    className="text-red-600 cursor-pointer focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Vehicle
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* Quick action buttons - always visible */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(vehicle)}
                                  className="h-7 w-7 p-0 hover:bg-accent"
                                  title="View Details"
                                >
                                  <ViewIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(vehicle)}
                                  className="h-7 w-7 p-0 hover:bg-accent"
                                  title="Edit Vehicle"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(vehicle)}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  title="Delete Vehicle"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination Controls - always show at the bottom */}
              <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(endIndex, filteredAndSearchedVehicles.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {filteredAndSearchedVehicles.length}
                    </span>{" "}
                    vehicles
                  </div>
                  {filteredAndSearchedVehicles.length > 0 && (
                    <div className="text-xs text-muted-foreground/70">
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {/* Show first page */}
                      {currentPage > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="w-8 h-8 p-0"
                          >
                            1
                          </Button>
                          {currentPage > 4 && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                        </>
                      )}

                      {/* Show current page and surrounding pages */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}

                      {/* Show last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
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
