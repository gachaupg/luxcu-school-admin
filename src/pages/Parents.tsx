import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Users,
  MoreVertical,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  registerParent,
  fetchParents,
  updateParent,
  deleteParent,
} from "@/redux/slices/parentsSlice";
import { toast } from "@/components/ui/use-toast";
import { ParentViewModal } from "@/components/ParentViewModal";
import { ParentEditModal } from "@/components/ParentEditModal";
import { RootState } from "@/redux/store";
import {
  parseParentError,
  parseApiError,
  handleParentError,
  handleParentUpdateError,
  handleParentDeleteError,
  parseReduxError,
} from "@/utils/errorHandler";

interface AuthorizedPerson {
  name: string;
  relation: string;
  phone: string;
}

interface Parent {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  school?: number;
  preferred_contact_method?: string;
  secondary_phone?: string;
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_type: string;
    profile_image: string | null;
  };
  authorized_pickup_persons?: {
    persons: AuthorizedPerson[];
  };
}

interface ParentFormData {
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
    user_type: string;
    profile_image: string | null;
  };
  address: string;
  emergency_contact: string;
  school: number;
  preferred_contact_method: string;
  secondary_phone: string;
  authorized_pickup_persons: {
    persons: AuthorizedPerson[];
  };
}

interface FormErrors {
  user_data?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    password?: string;
    confirm_password?: string;
  };
  address?: string;
  emergency_contact?: string;
  secondary_phone?: string;
  preferred_contact_method?: string;
  authorized_pickup_persons?: string;
  general?: string;
}

export default function Parents() {
  const dispatch = useAppDispatch();
  const {
    parents = [],
    loading,
    error,
  } = useAppSelector((state: RootState) => state.parents);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [selected, setSelected] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [authorizedPersons, setAuthorizedPersons] = useState<
    AuthorizedPerson[]
  >([{ name: "", relation: "", phone: "" }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<ParentFormData>({
    user_data: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      confirm_password: "",
      user_type: "parent",
      profile_image: null,
    },
    address: "",
    emergency_contact: "",
    school: 1,
    preferred_contact_method: "email",
    secondary_phone: "",
    authorized_pickup_persons: {
      persons: authorizedPersons,
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert phone numbers to international format
    if (
      name === "user_data.phone_number" ||
      name === "secondary_phone" ||
      name === "emergency_contact"
    ) {
      const convertedValue = convertToInternationalFormat(value);
      if (name.startsWith("user_data.")) {
        const field = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          user_data: {
            ...prev.user_data,
            [field]: convertedValue,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: convertedValue,
        }));
      }
    } else if (name.startsWith("user_data.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        user_data: {
          ...prev.user_data,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Function to convert local phone numbers to international format
  const convertToInternationalFormat = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // If it's already in international format, return as is
    if (cleaned.startsWith("254")) {
      return `+${cleaned}`;
    }

    // If it starts with 0, replace with +254
    if (cleaned.startsWith("0")) {
      return `+254${cleaned.substring(1)}`;
    }

    // If it's 9 digits (Kenyan number without country code), add +254
    if (cleaned.length === 9) {
      return `+254${cleaned}`;
    }

    // If it's already 12 digits and starts with 254, add +
    if (cleaned.length === 12 && cleaned.startsWith("254")) {
      return `+${cleaned}`;
    }

    // Return as is if it doesn't match any pattern
    return phoneNumber;
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAuthorizedPerson = () => {
    setAuthorizedPersons([
      ...authorizedPersons,
      { name: "", relation: "", phone: "" },
    ]);
  };

  const removeAuthorizedPerson = (index: number) => {
    setAuthorizedPersons(authorizedPersons.filter((_, i) => i !== index));
  };

  const handleAuthorizedPersonChange = (
    index: number,
    field: keyof AuthorizedPerson,
    value: string
  ) => {
    const newPersons = [...authorizedPersons];
    // Convert phone numbers to international format
    const convertedValue =
      field === "phone" ? convertToInternationalFormat(value) : value;
    newPersons[index] = { ...newPersons[index], [field]: convertedValue };
    setAuthorizedPersons(newPersons);
    setFormData((prev) => ({
      ...prev,
      authorized_pickup_persons: {
        persons: newPersons,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});

    // Enhanced client-side validation
    const validationErrors: FormErrors = {};

    // Validate required fields
    if (!formData.user_data?.first_name?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        first_name: "First name is required",
      };
    }

    if (!formData.user_data?.last_name?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        last_name: "Last name is required",
      };
    }

    if (!formData.user_data?.email?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        email: "Email is required",
      };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_data.email)) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        email: "Please enter a valid email address",
      };
    }

    if (!formData.user_data?.phone_number?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        phone_number: "Phone number is required",
      };
    }

    if (!formData.user_data?.password?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        password: "Password is required",
      };
    } else if (formData.user_data.password.length < 8) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        password: "Password must be at least 8 characters long",
      };
    }

    if (!formData.user_data?.confirm_password?.trim()) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        confirm_password: "Please confirm your password",
      };
    }

    if (!formData.address?.trim()) {
      validationErrors.address = "Address is required";
    }

    if (!formData.emergency_contact?.trim()) {
      validationErrors.emergency_contact = "Emergency contact is required";
    }

    // Validate passwords match
    if (
      formData.user_data?.password &&
      formData.user_data?.confirm_password &&
      formData.user_data.password !== formData.user_data.confirm_password
    ) {
      validationErrors.user_data = {
        ...validationErrors.user_data,
        confirm_password: "Passwords do not match",
      };
    }

    // If there are validation errors, display them and return
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the actual school ID from localStorage
      const schoolId = localStorage.getItem("schoolId");
      if (!schoolId) {
        toast({
          title: "Error",
          description: "School ID not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Filter out empty authorized persons
      const validAuthorizedPersons = authorizedPersons.filter(
        (person) =>
          person.name.trim() && person.relation.trim() && person.phone.trim()
      );

      // Ensure phone numbers are properly formatted
      const formattedEmergencyContact = convertToInternationalFormat(
        formData.emergency_contact
      );
      const formattedSecondaryPhone = convertToInternationalFormat(
        formData.secondary_phone
      );
      const formattedUserPhone = convertToInternationalFormat(
        formData.user_data?.phone_number || ""
      );

      // Transform form data to match API structure with user data nested
      const apiData = {
        user: {
          first_name: formData.user_data?.first_name || "",
          last_name: formData.user_data?.last_name || "",
          email: formData.user_data?.email || "",
          phone_number: formattedUserPhone,
          password: formData.user_data?.password || "",
          confirm_password: formData.user_data?.confirm_password || "",
          user_type: formData.user_data?.user_type || "parent",
          profile_image: formData.user_data?.profile_image || null,
        },
        address: formData.address,
        emergency_contact: formattedEmergencyContact,
        school: parseInt(schoolId),
        preferred_contact_method: formData.preferred_contact_method,
        secondary_phone: formattedSecondaryPhone,
        authorized_pickup_persons: {
          persons: validAuthorizedPersons.map((person) => ({
            ...person,
            phone: convertToInternationalFormat(person.phone),
          })),
        },
      };

      console.log("Form data before submission:", formData);
      console.log("API data being sent:", apiData);
      console.log("School ID:", schoolId);

      const result = await dispatch(registerParent(apiData)).unwrap();
      console.log("Registration successful:", result);

      toast({
        title: "Success",
        description: "Parent registered successfully",
      });
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        user_data: {
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirm_password: "",
          user_type: "parent",
          profile_image: null,
        },
        address: "",
        emergency_contact: "",
        school: parseInt(schoolId),
        preferred_contact_method: "email",
        secondary_phone: "",
        authorized_pickup_persons: {
          persons: [{ name: "", relation: "", phone: "" }],
        },
      });
      setAuthorizedPersons([{ name: "", relation: "", phone: "" }]);
      setFormErrors({});
    } catch (error) {
      console.error("Parent registration error:", error);
      console.error("Error type:", typeof error);
      console.error("Error instanceof Error:", error instanceof Error);
      console.error("Raw error:", error);

      // Use the Redux-specific error parser
      const { message: errorMessage, fieldErrors } = parseReduxError(error);

      console.log("Parsed error message:", errorMessage);
      console.log("Parsed field errors:", fieldErrors);

      // Convert field errors to the expected format
      const formFieldErrors: FormErrors = {};

      Object.entries(fieldErrors || {}).forEach(([field, errorMsg]) => {
        console.log(`Processing field: ${field} with error: ${errorMsg}`);
        if (field.startsWith("user_data.")) {
          const userField = field.split(".")[1];
          formFieldErrors.user_data = {
            ...formFieldErrors.user_data,
            [userField]: errorMsg,
          };
          console.log(`Mapped to user_data.${userField}: ${errorMsg}`);
        } else {
          (formFieldErrors as Record<string, string>)[field] = errorMsg;
          console.log(`Mapped to ${field}: ${errorMsg}`);
        }
      });

      console.log("Final form field errors:", formFieldErrors);

      setFormErrors(formFieldErrors);

      // Show toast with the main error message
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateParent = async (id: number, data: Partial<Parent>) => {
    try {
      await dispatch(updateParent({ id, data })).unwrap();
      toast({
        title: "Success",
        description: "Parent updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedParent(null);
      // Refresh parents list
      const schoolId = localStorage.getItem("schoolId");
      if (schoolId) {
        dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
      }
    } catch (error) {
      console.error("Parent update error:", error);

      // Use the enhanced parent-specific error parser
      const { message: errorMessage } = handleParentUpdateError(error);

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent?.id) return;

    try {
      await dispatch(deleteParent(selectedParent.id)).unwrap();
      toast({
        title: "Success",
        description: "Parent deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedParent(null);
    } catch (error) {
      console.error("Parent delete error:", error);

      // Use the enhanced parent-specific error parser
      const { message: errorMessage } = handleParentDeleteError(error);

      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openViewModal = (parent: Parent) => {
    setSelectedParent(parent);
    setIsViewModalOpen(true);
  };

  const openEditModal = (parent: Parent) => {
    setSelectedParent(parent);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (parent: Parent) => {
    setSelectedParent(parent);
    setIsDeleteDialogOpen(true);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === (parents?.length || 0)) setSelected([]);
    else setSelected(parents.map((p) => p.id));
  };

  // Fetch parents on component mount
  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    if (schoolId) {
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
    }
  }, [dispatch]);

  const schoolId = localStorage.getItem("schoolId");
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      (
        parent.user_data?.first_name ||
        parent.user_full_name?.split(" ")[0] ||
        ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (
        parent.user_data?.last_name ||
        parent.user_full_name?.split(" ").slice(1).join(" ") ||
        ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (parent.user_data?.email || parent.user_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (parent.user_data?.phone_number || parent.phone_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || statusFilter === "active";

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParents = filteredParents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading parents...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Parents
            </h3>
            <p className="text-red-500 mb-6">{error}</p>
            <Button
              onClick={() => {
                const schoolId = localStorage.getItem("schoolId");
                if (schoolId) {
                  dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
                }
              }}
              className="bg-green-500 hover:bg-green-600"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-4 py-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* <p>Parents</p> */}
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" /> Add New Parent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Parent</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error Display */}
                    {formErrors.general && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-red-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Registration Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{formErrors.general}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Summary */}
                    {Object.keys(formErrors).length > 0 &&
                      !formErrors.general && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">
                                Please fix the following errors:
                              </h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <ul className="list-disc pl-5 space-y-1">
                                  {formErrors.user_data?.first_name && (
                                    <li>
                                      First name:{" "}
                                      {formErrors.user_data.first_name}
                                    </li>
                                  )}
                                  {formErrors.user_data?.last_name && (
                                    <li>
                                      Last name:{" "}
                                      {formErrors.user_data.last_name}
                                    </li>
                                  )}
                                  {formErrors.user_data?.email && (
                                    <li>Email: {formErrors.user_data.email}</li>
                                  )}
                                  {formErrors.user_data?.phone_number && (
                                    <li>
                                      Phone number:{" "}
                                      {formErrors.user_data.phone_number}
                                    </li>
                                  )}
                                  {formErrors.user_data?.password && (
                                    <li>
                                      Password: {formErrors.user_data.password}
                                    </li>
                                  )}
                                  {formErrors.user_data?.confirm_password && (
                                    <li>
                                      Confirm password:{" "}
                                      {formErrors.user_data.confirm_password}
                                    </li>
                                  )}
                                  {formErrors.address && (
                                    <li>Address: {formErrors.address}</li>
                                  )}
                                  {formErrors.emergency_contact && (
                                    <li>
                                      Emergency contact:{" "}
                                      {formErrors.emergency_contact}
                                    </li>
                                  )}
                                  {formErrors.secondary_phone && (
                                    <li>
                                      Secondary phone:{" "}
                                      {formErrors.secondary_phone}
                                    </li>
                                  )}
                                  {formErrors.preferred_contact_method && (
                                    <li>
                                      Preferred contact method:{" "}
                                      {formErrors.preferred_contact_method}
                                    </li>
                                  )}
                                  {formErrors.authorized_pickup_persons && (
                                    <li>
                                      Authorized pickup persons:{" "}
                                      {formErrors.authorized_pickup_persons}
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_data.first_name">First Name</Label>
                        <Input
                          id="user_data.first_name"
                          name="user_data.first_name"
                          value={formData.user_data?.first_name || ""}
                          onChange={handleInputChange}
                          required
                          className={
                            formErrors.user_data?.first_name
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {formErrors.user_data?.first_name && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.first_name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user_data.last_name">Last Name</Label>
                        <Input
                          id="user_data.last_name"
                          name="user_data.last_name"
                          value={formData.user_data?.last_name || ""}
                          onChange={handleInputChange}
                          required
                          className={
                            formErrors.user_data?.last_name
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {formErrors.user_data?.last_name && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_data.email">Email</Label>
                        <Input
                          id="user_data.email"
                          name="user_data.email"
                          type="email"
                          value={formData.user_data?.email || ""}
                          onChange={handleInputChange}
                          required
                          className={
                            formErrors.user_data?.email ? "border-red-500" : ""
                          }
                        />
                        {formErrors.user_data?.email && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user_data.phone_number">
                          Phone Number
                        </Label>
                        <Input
                          id="user_data.phone_number"
                          name="user_data.phone_number"
                          value={formData.user_data?.phone_number || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., 0722858508 or +254722858508"
                          required
                          className={
                            formErrors.user_data?.phone_number
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {formErrors.user_data?.phone_number && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.phone_number}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Enter local format (0722858508) or international
                          format (+254722858508)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_data.password">Password</Label>
                        <div className="relative">
                          <Input
                            id="user_data.password"
                            name="user_data.password"
                            type={showPassword ? "text" : "password"}
                            value={formData.user_data?.password || ""}
                            onChange={handleInputChange}
                            required
                            className={
                              formErrors.user_data?.password
                                ? "border-red-500"
                                : ""
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {formErrors.user_data?.password && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.password}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user_data.confirm_password">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="user_data.confirm_password"
                            name="user_data.confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.user_data?.confirm_password || ""}
                            onChange={handleInputChange}
                            required
                            className={
                              formErrors.user_data?.confirm_password
                                ? "border-red-500"
                                : ""
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {formErrors.user_data?.confirm_password && (
                          <p className="text-sm text-red-500">
                            {formErrors.user_data.confirm_password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className={formErrors.address ? "border-red-500" : ""}
                      />
                      {formErrors.address && (
                        <p className="text-sm text-red-500">
                          {formErrors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact">
                          Emergency Contact
                        </Label>
                        <Input
                          id="emergency_contact"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleInputChange}
                          placeholder="e.g., 0722858508 or +254722858508"
                          required
                          className={
                            formErrors.emergency_contact ? "border-red-500" : ""
                          }
                        />
                        {formErrors.emergency_contact && (
                          <p className="text-sm text-red-500">
                            {formErrors.emergency_contact}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary_phone">Secondary Phone</Label>
                        <Input
                          id="secondary_phone"
                          name="secondary_phone"
                          value={formData.secondary_phone}
                          onChange={handleInputChange}
                          placeholder="e.g., 0722858508 or +254722858508"
                          className={
                            formErrors.secondary_phone ? "border-red-500" : ""
                          }
                        />
                        {formErrors.secondary_phone && (
                          <p className="text-sm text-red-500">
                            {formErrors.secondary_phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_contact_method">
                        Preferred Contact Method
                      </Label>
                      <Select
                        value={formData.preferred_contact_method}
                        onValueChange={(value) =>
                          handleSelectChange("preferred_contact_method", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            formErrors.preferred_contact_method
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.preferred_contact_method && (
                        <p className="text-sm text-red-500">
                          {formErrors.preferred_contact_method}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Authorized Pickup Persons</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addAuthorizedPerson}
                          className="text-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Person
                        </Button>
                      </div>
                      {formErrors.authorized_pickup_persons && (
                        <p className="text-sm text-red-500">
                          {formErrors.authorized_pickup_persons}
                        </p>
                      )}
                      {authorizedPersons.map((person, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
                        >
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={person.name}
                              onChange={(e) =>
                                handleAuthorizedPersonChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Relation</Label>
                            <Input
                              value={person.relation}
                              onChange={(e) =>
                                handleAuthorizedPersonChange(
                                  index,
                                  "relation",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <div className="flex gap-2">
                              <Input
                                value={person.phone}
                                onChange={(e) =>
                                  handleAuthorizedPersonChange(
                                    index,
                                    "phone",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., 0722858508 or +254722858508"
                                required
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => removeAuthorizedPerson(index)}
                                  className="px-2"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Add Parent
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter Section */}
            <Card className="bg-white shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search parents by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-40 border-gray-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parents</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parents Table */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Parents List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {currentParents?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="w-10 px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={
                                selected.length === currentParents.length &&
                                currentParents.length > 0
                              }
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Address
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentParents.map((parent) => (
                          <tr
                            key={parent.id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="w-10 px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selected.includes(parent.id)}
                                onChange={() => toggleSelect(parent.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {parent.user_data?.first_name ||
                                    parent.user_full_name?.split(" ")[0] ||
                                    "-"}{" "}
                                  {parent.user_data?.last_name ||
                                    parent.user_full_name
                                      ?.split(" ")
                                      .slice(1)
                                      .join(" ") ||
                                    ""}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {parent.user_data?.email ||
                                    parent.user_email ||
                                    "-"}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-sm text-gray-900">
                                  {parent.user_data?.phone_number ||
                                    parent.phone_number ||
                                    "-"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {parent.emergency_contact ||
                                    "No emergency contact"}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {parent.address || "No address provided"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs">
                                Active
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-gray-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => openViewModal(parent)}
                                  >
                                    <User className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => openEditModal(parent)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Parent
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                                    onClick={() => openDeleteDialog(parent)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Parent
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, filteredParents.length)} of{" "}
                        {filteredParents.length} parents
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-200 hover:bg-gray-50 h-8 px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={
                                  currentPage === pageNum
                                    ? "bg-green-500 hover:bg-green-600 text-white h-8 w-8 p-0"
                                    : "border-gray-200 hover:bg-gray-50 h-8 w-8 p-0"
                                }
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-200 hover:bg-gray-50 h-8 px-3"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || statusFilter !== "all"
                      ? "No matching parents found"
                      : "No Parents Found"}
                  </h3>
                  <p className="text-gray-500 text-center mb-4 max-w-md text-sm">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "There are no parents registered in your school yet. Add the first parent to get started."}
                  </p>
                  {searchTerm || statusFilter !== "all" ? (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Parent
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* View Modal */}
      <ParentViewModal
        parent={selectedParent}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedParent(null);
        }}
      />

      {/* Edit Modal */}
      <ParentEditModal
        parent={selectedParent}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParent(null);
        }}
        onSave={handleUpdateParent}
      />

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
              parent "
              {selectedParent?.user_data?.first_name ||
                selectedParent?.user_full_name?.split(" ")[0]}{" "}
              {selectedParent?.user_data?.last_name ||
                selectedParent?.user_full_name?.split(" ").slice(1).join(" ")}
              " and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Parent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
