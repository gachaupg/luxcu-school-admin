import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addDriver,
  fetchDrivers,
  CreateDriverData,
  deleteDriver,
  updateDriver,
  Driver,
} from "../redux/slices/driversSlice";
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
  Users,
  MoreVertical,
  Plus,
  User,
  Download,
  Check,
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
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Textarea } from "@/components/ui/textarea";
import { parseDriverError } from "@/utils/errorHandler";
import { ExportDropdown } from "@/components/ExportDropdown";
import {
  MultipleUploadModal,
  DataPreviewModal,
} from "@/components/multiple-upload";
import { uploadCSVFile } from "@/services/csvUploadService";

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

  // Form state - declare this first
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
    latitude: "-1.286389",
    longitude: "36.817223",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  // Function to reset form to initial state
  const resetForm = () => {
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
      latitude: "-1.286389",
      longitude: "36.817223",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle modal open/close
  const handleModalOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Action modals state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Bulk upload state
  const [isMultipleUploadOpen, setIsMultipleUploadOpen] = useState(false);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

  // Action handlers
  const handleView = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsViewModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsEditModalOpen(true);
  };

  const handleDelete = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedDriver) {
        toast({
          title: "Error",
          description: "No driver selected for deletion",
          variant: "destructive",
        });
        return;
      }

      await dispatch(deleteDriver(selectedDriver.id)).unwrap();
      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      let errorMessage = "Failed to delete driver";

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

  // Bulk upload handlers
  const handleMultipleUpload = async (files: File[]) => {
    try {

      const schoolId = localStorage.getItem("schoolId");
      if (!schoolId) {
        throw new Error("School ID not found");
      }

      let totalSuccess = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Upload file to CSV upload endpoint
          const response = await uploadCSVFile(file, "drivers");

          if (response.success) {
            totalSuccess += response.created_count || 0;
            totalFailed += response.skipped_count || 0;

            // Add any errors from the response
            if (response.errors && response.errors.length > 0) {
              response.errors.forEach((error) => {
                if (typeof error === "string") {
                  // Handle string errors
                  allErrors.push(error);
                } else if (error.row && error.field && error.message) {
                  // Handle structured errors
                  allErrors.push(
                    `Row ${error.row}, ${error.field}: ${error.message}`
                  );
                } else {
                  // Handle other error formats
                  allErrors.push(JSON.stringify(error));
                }
              });
            }

            // Log created users for debugging
            if (response.created_users && response.created_users.length > 0) {
              // console.log(
              //   `📝 Created users from file ${file.name}:`,
              //   response.created_users
              // );
            }
          } else {
            totalFailed += 1;
            allErrors.push(`File "${file.name}": ${response.message}`);
          }
        } catch (error: unknown) {
          totalFailed += 1;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          allErrors.push(`File "${file.name}": ${errorMessage}`);
        }
      }

      // Show results
      if (totalSuccess > 0) {
        toast({
          title: "CSV upload completed",
          description: `Successfully created ${totalSuccess} drivers.${
            totalFailed > 0 ? ` ${totalFailed} skipped.` : ""
          }`,
        });
      }

      if (totalFailed > 0) {
        toast({
          title: "Some records were skipped",
          description: `${totalFailed} records were skipped. Check the console for details.`,
          variant: "destructive",
        });

        // Log all errors for debugging
        // console.error("❌ Upload errors:", allErrors);
      }

      // Refresh drivers list
      dispatch(fetchDrivers());
    } catch (error: unknown) {
      toast({
        title: "CSV upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handleDataPreview = (data: Record<string, unknown>[]) => {
    setPreviewData(data);
    setIsDataPreviewOpen(true);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchDrivers()).unwrap();
        try {
          const schoolsResult = await dispatch(fetchSchools()).unwrap();
          if (!Array.isArray(schoolsResult)) {
            // console.error("Invalid schools data format:", schoolsResult);
          }
        } catch (schoolsError) {
          // console.error("Failed to fetch schools:", {
          //   error: schoolsError,
          //   message: schoolsError?.message,
          //   response: schoolsError?.response?.data,
          // });
        }
      } catch (err) {
        // console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (schoolsError) {
      // console.error("Error loading schools:", schoolsError);
    }
  }, [schoolsError]);

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
    // Check if driver and user_details exist before accessing properties
    if (!driver || !driver.user_details) {
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

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Use a timeout to avoid immediate re-render issues
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }, 0);
  };

  const updateLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
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

    // Validate required fields
    const requiredFields = [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email" },
      { field: "phoneNumber", label: "Phone Number" },
      { field: "password", label: "Password" },
      { field: "confirmPassword", label: "Confirm Password" },
      { field: "licenseNumber", label: "License Number" },
      { field: "licenseClass", label: "License Class" },
      { field: "licenseExpiry", label: "License Expiry" },
      { field: "lastHealthCheck", label: "Last Health Check" },
      { field: "lastBackgroundCheck", label: "Last Background Check" },
    ];

    for (const { field, label } of requiredFields) {
      if (
        !formData[field as keyof typeof formData] ||
        formData[field as keyof typeof formData] === ""
      ) {
        toast({
          title: "Error",
          description: `${label} is required`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const submitData: CreateDriverData = {
      user_data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        user_type: "driver",
        profile_image: null,
      },
      license_number: formData.licenseNumber,
      license_expiry: formData.licenseExpiry,
      license_class: formData.licenseClass,
      school: schoolId || 1,
      is_available: true,
      current_location: {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      },
      safety_rating: 4.8,
      on_time_rating: 4.9,
      last_health_check: formData.lastHealthCheck,
      last_background_check: formData.lastBackgroundCheck,
    };

    try {
      await dispatch(addDriver(submitData)).unwrap();
      toast({
        title: "Success",
        description: "Driver added successfully",
      });

      // Reset form and close modal
      resetForm();
      setIsDialogOpen(false);

      // Refresh the drivers list
      dispatch(fetchDrivers());
    } catch (err) {

      // Show the actual database error response
      let errorMessage = "Failed to add driver";

      if (err instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(err.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            // Check for specific field errors
            if (errorData.email) {
              errorMessage = `Email: ${errorData.email.join(", ")}`;
            } else if (errorData.phone_number) {
              errorMessage = `Phone: ${errorData.phone_number.join(", ")}`;
            } else if (errorData.license_number) {
              errorMessage = `License: ${errorData.license_number.join(", ")}`;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = JSON.stringify(errorData, null, 2);
            }
          } else {
            errorMessage = err.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = err.message;
        }
      } else {
        errorMessage = String(err);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const AddDriverForm = () => {
    // Local state for the form - completely separate from the main component state
    const [localFormData, setLocalFormData] = useState({
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
      latitude: "-1.286389",
      longitude: "36.817223",
    });

    const [localShowPassword, setLocalShowPassword] = useState(false);
    const [localShowConfirmPassword, setLocalShowConfirmPassword] =
      useState(false);

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleLocalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate required fields
      const requiredFields = [
        { field: "firstName", label: "First Name" },
        { field: "lastName", label: "Last Name" },
        { field: "email", label: "Email" },
        { field: "phoneNumber", label: "Phone Number" },
        { field: "password", label: "Password" },
        { field: "confirmPassword", label: "Confirm Password" },
        { field: "licenseNumber", label: "License Number" },
        { field: "licenseClass", label: "License Class" },
        { field: "licenseExpiry", label: "License Expiry" },
        { field: "lastHealthCheck", label: "Last Health Check" },
        { field: "lastBackgroundCheck", label: "Last Background Check" },
      ];

      for (const { field, label } of requiredFields) {
        if (!localFormData[field] || localFormData[field] === "") {
          toast({
            title: "Error",
            description: `${label} is required`,
            variant: "destructive",
          });
          return;
        }
      }

      // Validate password match
      if (localFormData.password !== localFormData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // Validate password length
      if (localFormData.password.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localFormData.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      const submitData: CreateDriverData = {
        user_data: {
          first_name: localFormData.firstName,
          last_name: localFormData.lastName,
          email: localFormData.email,
          phone_number: localFormData.phoneNumber,
          password: localFormData.password,
          confirm_password: localFormData.confirmPassword,
          user_type: "driver",
          profile_image: null,
        },
        license_number: localFormData.licenseNumber,
        license_expiry: localFormData.licenseExpiry,
        license_class: localFormData.licenseClass,
        school: schoolId || 1,
        is_available: true,
        current_location: {
          latitude: Number(localFormData.latitude),
          longitude: Number(localFormData.longitude),
        },
        safety_rating: 4.8,
        on_time_rating: 4.9,
        last_health_check: localFormData.lastHealthCheck,
        last_background_check: localFormData.lastBackgroundCheck,
      };

      try {
        await dispatch(addDriver(submitData)).unwrap();
        window.location.reload();
        toast({
          title: "Success",
          description: "Driver added successfully",
        });

        // Reset local form
        setLocalFormData({
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
          latitude: "-1.286389",
          longitude: "36.817223",
        });
        setLocalShowPassword(false);
        setLocalShowConfirmPassword(false);
        // Close modal
        setIsDialogOpen(false);
        // Refresh the drivers list
        dispatch(fetchDrivers());
      } catch (err) {
        let errorMessage = "Failed to add driver";

        if (err instanceof Error) {
          try {
            const errorData = JSON.parse(err.message);
            if (typeof errorData === "object" && errorData !== null) {
              if (errorData.email) {
                errorMessage = `Email: ${errorData.email.join(", ")}`;
              } else if (errorData.phone_number) {
                errorMessage = `Phone: ${errorData.phone_number.join(", ")}`;
              } else if (errorData.license_number) {
                errorMessage = `License: ${errorData.license_number.join(
                  ", "
                )}`;
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else {
                errorMessage = JSON.stringify(errorData, null, 2);
              }
            } else {
              errorMessage = err.message;
            }
          } catch (parseError) {
            errorMessage = err.message;
          }
        } else {
          errorMessage = String(err);
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    const updateLocalLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocalFormData((prev) => ({
              ...prev,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
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

    return (
      <form onSubmit={handleLocalSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              value={localFormData.firstName}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter first name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              value={localFormData.lastName}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter last name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              value={localFormData.email}
              onChange={handleLocalInputChange}
              type="email"
              placeholder="Enter email address"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={localFormData.phoneNumber}
              onChange={handleLocalInputChange}
              type="tel"
              placeholder="Enter phone number"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                value={localFormData.password}
                onChange={handleLocalInputChange}
                type={localShowPassword ? "text" : "password"}
                placeholder="Enter password"
                required
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setLocalShowPassword(!localShowPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {localShowPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                value={localFormData.confirmPassword}
                onChange={handleLocalInputChange}
                type={localShowConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                required
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setLocalShowConfirmPassword(!localShowConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {localShowConfirmPassword ? (
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
            <label htmlFor="licenseNumber" className="text-sm font-medium">
              License Number
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              value={localFormData.licenseNumber}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter license number"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="licenseClass" className="text-sm font-medium">
              License Class
            </label>
            <input
              id="licenseClass"
              name="licenseClass"
              value={localFormData.licenseClass}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter license class"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="licenseExpiry" className="text-sm font-medium">
              License Expiry
            </label>
            <input
              id="licenseExpiry"
              name="licenseExpiry"
              value={localFormData.licenseExpiry}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastHealthCheck" className="text-sm font-medium">
              Last Health Check
            </label>
            <input
              id="lastHealthCheck"
              name="lastHealthCheck"
              value={localFormData.lastHealthCheck}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="lastBackgroundCheck"
              className="text-sm font-medium"
            >
              Last Background Check
            </label>
            <input
              id="lastBackgroundCheck"
              name="lastBackgroundCheck"
              value={localFormData.lastBackgroundCheck}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="latitude" className="text-sm font-medium">
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              value={localFormData.latitude}
              onChange={handleLocalInputChange}
              type="number"
              step="any"
              placeholder="Enter latitude"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="longitude" className="text-sm font-medium">
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              value={localFormData.longitude}
              onChange={handleLocalInputChange}
              type="number"
              step="any"
              placeholder="Enter longitude"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={updateLocalLocation}
            className="bg-blue-600 hover:bg-blue-700 mb-4"
          >
            Get Current Location
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            Add Driver
          </Button>
        </div>
      </form>
    );
  };

  const EditDriverForm = () => {
    // Local state for the edit form
    const [localFormData, setLocalFormData] = useState({
      firstName: selectedDriver?.user_details?.first_name || "",
      lastName: selectedDriver?.user_details?.last_name || "",
      email: selectedDriver?.user_details?.email || "",
      phoneNumber: selectedDriver?.user_details?.phone_number || "",
      password: "",
      confirmPassword: "",
      licenseNumber: selectedDriver?.license_number || "",
      licenseClass: selectedDriver?.license_class || "",
      licenseExpiry: selectedDriver?.license_expiry || "",
      lastHealthCheck: selectedDriver?.last_health_check || "",
      lastBackgroundCheck: selectedDriver?.last_background_check || "",
      latitude: "-1.286389",
      longitude: "36.817223",
    });

    const [localShowPassword, setLocalShowPassword] = useState(false);
    const [localShowConfirmPassword, setLocalShowConfirmPassword] =
      useState(false);

    // Initialize form data when selectedDriver changes
    useEffect(() => {
      if (selectedDriver) {
        let latitude = -1.286389;
        let longitude = 36.817223;

        if (selectedDriver.current_location) {
          if (typeof selectedDriver.current_location === "object") {
            latitude = selectedDriver.current_location.latitude;
            longitude = selectedDriver.current_location.longitude;
          } else if (typeof selectedDriver.current_location === "string") {
            const match = selectedDriver.current_location.match(
              /POINT \(([^ ]+) ([^)]+)\)/
            );
            if (match) {
              longitude = parseFloat(match[1]);
              latitude = parseFloat(match[2]);
            }
          }
        }

        setLocalFormData({
          firstName: selectedDriver.user_details?.first_name || "",
          lastName: selectedDriver.user_details?.last_name || "",
          email: selectedDriver.user_details?.email || "",
          phoneNumber: selectedDriver.user_details?.phone_number || "",
          password: "",
          confirmPassword: "",
          licenseNumber: selectedDriver.license_number || "",
          licenseClass: selectedDriver.license_class || "",
          licenseExpiry: selectedDriver.license_expiry || "",
          lastHealthCheck: selectedDriver.last_health_check || "",
          lastBackgroundCheck: selectedDriver.last_background_check || "",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
      }
    }, [selectedDriver]);

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleLocalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedDriver) {
        toast({
          title: "Error",
          description: "No driver selected for editing",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields (password is optional for editing)
      const requiredFields = [
        { field: "firstName", label: "First Name" },
        { field: "lastName", label: "Last Name" },
        { field: "email", label: "Email" },
        { field: "phoneNumber", label: "Phone Number" },
        { field: "licenseNumber", label: "License Number" },
        { field: "licenseClass", label: "License Class" },
        { field: "licenseExpiry", label: "License Expiry" },
        { field: "lastHealthCheck", label: "Last Health Check" },
        { field: "lastBackgroundCheck", label: "Last Background Check" },
      ];

      for (const { field, label } of requiredFields) {
        if (!localFormData[field] || localFormData[field] === "") {
          toast({
            title: "Error",
            description: `${label} is required`,
            variant: "destructive",
          });
          return;
        }
      }

      // Validate password match if password is provided
      if (
        localFormData.password &&
        localFormData.password !== localFormData.confirmPassword
      ) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // Validate password length if password is provided
      if (localFormData.password && localFormData.password.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localFormData.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      const updateData = {
        user_data: {
          first_name: localFormData.firstName,
          last_name: localFormData.lastName,
          email: localFormData.email,
          phone_number: localFormData.phoneNumber,
          ...(localFormData.password && { password: localFormData.password }),
          user_type: "driver",
          profile_image: null,
        },
        license_number: localFormData.licenseNumber,
        license_expiry: localFormData.licenseExpiry,
        license_class: localFormData.licenseClass,
        school: schoolId || 1,
        is_available: selectedDriver.is_available,
        current_location: {
          latitude: Number(localFormData.latitude),
          longitude: Number(localFormData.longitude),
        },
        safety_rating: selectedDriver.safety_rating,
        on_time_rating: selectedDriver.on_time_rating,
        last_health_check: localFormData.lastHealthCheck,
        last_background_check: localFormData.lastBackgroundCheck,
      };

      try {
        await dispatch(
          updateDriver({ id: selectedDriver.id, data: updateData })
        ).unwrap();

        toast({
          title: "Success",
          description: "Driver updated successfully",
        });

        // Close modal and refresh
        setIsEditModalOpen(false);
        setSelectedDriver(null);
        dispatch(fetchDrivers());
      } catch (err) {
        let errorMessage = "Failed to update driver";

        if (err instanceof Error) {
          try {
            const errorData = JSON.parse(err.message);
            if (typeof errorData === "object" && errorData !== null) {
              if (errorData.email) {
                errorMessage = `Email: ${errorData.email.join(", ")}`;
              } else if (errorData.phone_number) {
                errorMessage = `Phone: ${errorData.phone_number.join(", ")}`;
              } else if (errorData.license_number) {
                errorMessage = `License: ${errorData.license_number.join(
                  ", "
                )}`;
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else {
                errorMessage = JSON.stringify(errorData, null, 2);
              }
            } else {
              errorMessage = err.message;
            }
          } catch (parseError) {
            errorMessage = err.message;
          }
        } else {
          errorMessage = String(err);
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    const updateLocalLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocalFormData((prev) => ({
              ...prev,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
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

    return (
      <form onSubmit={handleLocalSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="editFirstName" className="text-sm font-medium">
              First Name
            </label>
            <input
              id="editFirstName"
              name="firstName"
              value={localFormData.firstName}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter first name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editLastName" className="text-sm font-medium">
              Last Name
            </label>
            <input
              id="editLastName"
              name="lastName"
              value={localFormData.lastName}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter last name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="editEmail" className="text-sm font-medium">
              Email
            </label>
            <input
              id="editEmail"
              name="email"
              value={localFormData.email}
              onChange={handleLocalInputChange}
              type="email"
              placeholder="Enter email address"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editPhoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              id="editPhoneNumber"
              name="phoneNumber"
              value={localFormData.phoneNumber}
              onChange={handleLocalInputChange}
              type="tel"
              placeholder="Enter phone number"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="editPassword" className="text-sm font-medium">
              Password (leave blank to keep current)
            </label>
            <div className="relative">
              <input
                id="editPassword"
                name="password"
                value={localFormData.password}
                onChange={handleLocalInputChange}
                type={localShowPassword ? "text" : "password"}
                placeholder="Enter new password (optional)"
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setLocalShowPassword(!localShowPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {localShowPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="editConfirmPassword"
              className="text-sm font-medium"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="editConfirmPassword"
                name="confirmPassword"
                value={localFormData.confirmPassword}
                onChange={handleLocalInputChange}
                type={localShowConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setLocalShowConfirmPassword(!localShowConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {localShowConfirmPassword ? (
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
            <label htmlFor="editLicenseNumber" className="text-sm font-medium">
              License Number
            </label>
            <input
              id="editLicenseNumber"
              name="licenseNumber"
              value={localFormData.licenseNumber}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter license number"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editLicenseClass" className="text-sm font-medium">
              License Class
            </label>
            <input
              id="editLicenseClass"
              name="licenseClass"
              value={localFormData.licenseClass}
              onChange={handleLocalInputChange}
              type="text"
              placeholder="Enter license class"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="editLicenseExpiry" className="text-sm font-medium">
              License Expiry
            </label>
            <input
              id="editLicenseExpiry"
              name="licenseExpiry"
              value={localFormData.licenseExpiry}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="editLastHealthCheck"
              className="text-sm font-medium"
            >
              Last Health Check
            </label>
            <input
              id="editLastHealthCheck"
              name="lastHealthCheck"
              value={localFormData.lastHealthCheck}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="editLastBackgroundCheck"
              className="text-sm font-medium"
            >
              Last Background Check
            </label>
            <input
              id="editLastBackgroundCheck"
              name="lastBackgroundCheck"
              value={localFormData.lastBackgroundCheck}
              onChange={handleLocalInputChange}
              type="date"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="editLatitude" className="text-sm font-medium">
              Latitude
            </label>
            <input
              id="editLatitude"
              name="latitude"
              value={localFormData.latitude}
              onChange={handleLocalInputChange}
              type="number"
              step="any"
              placeholder="Enter latitude"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editLongitude" className="text-sm font-medium">
              Longitude
            </label>
            <input
              id="editLongitude"
              name="longitude"
              value={localFormData.longitude}
              onChange={handleLocalInputChange}
              type="number"
              step="any"
              placeholder="Enter longitude"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={updateLocalLocation}
            className="bg-blue-600 hover:bg-blue-700 mb-4"
          >
            Get Current Location
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            Update Driver
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-0 px-0 sm:px-0 py-0 w-full max-w-[98vw] mx-auto">
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardHeader className=" border-b border-gray-100 flex flex-row w-full items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 text-green-500" />
                Drivers List
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsMultipleUploadOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
                >
                  <Download className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={handleModalOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200">
                      <Plus className="mr-2 h-4 w-4" /> Add Driver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Driver</DialogTitle>
                    </DialogHeader>
                    <AddDriverForm />
                  </DialogContent>
                </Dialog>
              </div>
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
                  <ExportDropdown
                    data={{
                      headers: [
                        "Name",
                        "Email",
                        "Phone Number",
                        "License Number",
                        "License Class",
                        "License Expiry",
                        "Status",
                        "Safety Rating",
                        "On-time Rating",
                        "Last Health Check",
                        "Last Background Check",
                      ],
                      data: filteredAndSearchedDrivers.map((driver) => ({
                        name: `${driver.user_details?.first_name || ""} ${
                          driver.user_details?.last_name || ""
                        }`,
                        email: driver.user_details?.email || "",
                        phone_number: driver.user_details?.phone_number || "",
                        license_number: driver.license_number || "",
                        license_class: driver.license_class || "",
                        license_expiry: driver.license_expiry || "",
                        status: driver.is_available
                          ? "Available"
                          : "Unavailable",
                        safety_rating: driver.safety_rating?.toString() || "",
                        on_time_rating: driver.on_time_rating?.toString() || "",
                        last_health_check: driver.last_health_check || "",
                        last_background_check:
                          driver.last_background_check || "",
                      })),
                      fileName: "drivers_export",
                      title: "Drivers Directory",
                    }}
                    className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                  />
                </div>
              </div>

              {/* Results Summary */}
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
                              {driver.is_available
                                ? "Available"
                                : "Unavailable"}
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

              {/* Pagination Controls - always show at the bottom */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredAndSearchedDrivers.length)} of{" "}
                  {filteredAndSearchedDrivers.length} drivers
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== "all" && ` (${statusFilter})`}
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
                      <p>
                        {selectedDriver.user_details?.phone_number || "N/A"}
                      </p>
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
                        {selectedDriver.is_available
                          ? "Available"
                          : "Unavailable"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-semibold">Safety Rating</Label>
                      <p>{selectedDriver.safety_rating?.toString() || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">On-time Rating</Label>
                      <p>
                        {selectedDriver.on_time_rating?.toString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Last Health Check</Label>
                      <p>{selectedDriver.last_health_check || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">
                        Last Background Check
                      </Label>
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
              {selectedDriver && <EditDriverForm />}
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
                    ` "${
                      selectedDriver.user_details?.first_name || "Unknown"
                    } ${selectedDriver.user_details?.last_name || "Driver"}"`}
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

          {/* Multiple Upload Modal */}
          <MultipleUploadModal
            isOpen={isMultipleUploadOpen}
            onClose={() => setIsMultipleUploadOpen(false)}
            title="Bulk Upload Drivers"
            description="Upload multiple drivers at once using CSV, PDF, or Word documents."
            acceptedFileTypes={[
              ".csv",
              ".xlsx",
              ".xls",
              ".txt",
              ".pdf",
              ".doc",
              ".docx",
              ".html",
            ]}
            maxFileSize={10}
            maxFiles={5}
            onUpload={handleMultipleUpload}
            onPreview={handleDataPreview}
            uploadType="drivers"
          />

          {/* Data Preview Modal */}
          <DataPreviewModal
            isOpen={isDataPreviewOpen}
            onClose={() => setIsDataPreviewOpen(false)}
            data={previewData}
            title="Driver Data Preview"
            columns={[
              "Name",
              "Email",
              "Phone Number",
              "License Number",
              "License Class",
              "License Expiry",
              "Is Assistant Driver",
              "Last Health Check",
              "Last Background Check",
              "School ID",
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default Drivers;
