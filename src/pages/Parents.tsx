import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Users,
  Plus,
  Eye,
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
import { ExportDropdown } from "@/components/ExportDropdown";
import { RootState } from "@/redux/store";
import {
  MultipleUploadModal,
  DataPreviewModal,
} from "@/components/multiple-upload";
import { uploadCSVFile } from "@/services/csvUploadService";

interface ParsedData {
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  emergency_contact?: string;
  emergencyContact?: string;
  preferred_contact_method?: string;
  secondary_phone?: string;
  secondaryPhone?: string;
  authorized_pickup_persons?: AuthorizedPerson[];
  authorizedPickupPersons?: AuthorizedPerson[];
  // CSV column mappings
  "First Name"?: string;
  First_Name?: string;
  "Last Name"?: string;
  Last_Name?: string;
  Email?: string;
  "Phone Number"?: string;
  Phone_Number?: string;
  Address?: string;
  "Emergency Contact"?: string;
  Emergency_Contact?: string;
  "Secondary Phone"?: string;
  Secondary_Phone?: string;
  "Preferred Contact Method"?: string;
  Preferred_Contact_Method?: string;
  "Authorized Pickup Persons"?: AuthorizedPerson[];
  Authorized_Pickup_Persons?: AuthorizedPerson[];
  // Additional name variations
  "Full Name"?: string;
  full_name?: string;
  Full_Name?: string;
  Parent?: string;
  parent?: string;
  "Parent Name"?: string;
  parent_name?: string;
  Parent_Name?: string;
  // Additional phone variations
  Phone?: string;
  mobile?: string;
  Mobile?: string;
  "Mobile Number"?: string;
  mobile_number?: string;
  Mobile_Number?: string;
  // Contact variations
  contact?: string;
  Contact?: string;
  tel?: string;
  Tel?: string;
  [key: string]: unknown;
}

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
  user_phone_number?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  school?: number;
  school_name?: string;
  school_longitude?: number;
  school_latitude?: number;
  preferred_contact_method?: string;
  secondary_phone?: string;
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_phone_number: string;
    user_type: string;
    profile_image: string | null;
  };
  authorized_pickup_persons?: {
    persons: AuthorizedPerson[];
  };
  children?: unknown[];
}

interface ParentFormData {
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_phone_number: string;
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

  // Force fetch on every mount - this is the key fix
  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    

    if (schoolId) {
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }))
        .then((result) => {
        })
        .catch((error) => {
        });
    } else {
    }
  }, []); // Empty dependency array - only run on mount

  // Simple retry mechanism - if no parents after 2 seconds, try again
  useEffect(() => {
    if (parents.length === 0 && !loading) {
      const timeoutId = setTimeout(() => {
        const schoolId = localStorage.getItem("schoolId");
        if (schoolId) {
          dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [parents.length, loading, dispatch]);

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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multiple upload states
  const [isMultipleUploadOpen, setIsMultipleUploadOpen] = useState(false);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

  const [formData, setFormData] = useState<ParentFormData>({
    user_data: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      user_phone_number: "",
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

    // For phone numbers, allow typing but don't auto-convert during input
    if (
      name === "user_data.phone_number" ||
      name === "secondary_phone" ||
      name === "emergency_contact"
    ) {
      if (name.startsWith("user_data.")) {
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

  // Generate email from name if not provided
  const generateEmail = (firstName: string, lastName: string): string => {
    // Ensure we have valid names to work with
    const cleanFirstName = (firstName || "parent")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    const cleanLastName = (lastName || "user")
      .toLowerCase()
      .replace(/[^a-z]/g, "");

    // If names are empty after cleaning, use fallback
    const finalFirstName = cleanFirstName || "parent";
    const finalLastName = cleanLastName || "user";

    const timestamp = Date.now();
    return `${finalFirstName}.${finalLastName}${timestamp}@school.com`;
  };

  // Generate unique phone number
  const generateUniquePhoneNumber = (): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const phoneSuffix = timestamp.toString().slice(-6) + randomSuffix;
    const localNumber = `07${phoneSuffix.slice(0, 8)}`;
    // Convert to international format
    return `+254${localNumber.slice(1)}`;
  };

  const convertToInternationalFormat = (phoneNumber: string): string => {

    if (!phoneNumber || !phoneNumber.trim()) {
      return generateUniquePhoneNumber();
    }

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Validate the cleaned number
    if (cleaned.length === 0) {
    
      return generateUniquePhoneNumber();
    }

    // If it's already in international format (starts with 254), return as is
    if (cleaned.startsWith("254") && cleaned.length === 12) {
      const result = `+${cleaned}`;
      return result;
    }

    // If it starts with 0, replace with 254
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      const result = `+254${cleaned.slice(1)}`;
      return result;
    }

    // If it's 9 digits (without country code), add 254
    if (cleaned.length === 9) {
      const result = `+254${cleaned}`;
      return result;
    }

    // If it's already 12 digits (with country code), add +
    if (cleaned.length === 12) {
      return `+${cleaned}`;
    }

    // If it's 11 digits and starts with 7, it's likely a Kenyan number
    if (cleaned.length === 11 && cleaned.startsWith("7")) {
      return `+254${cleaned}`;
    }

    // Default: assume it's a valid number and add +254 if needed
    if (cleaned.length >= 9) {
      return `+254${cleaned.slice(-9)}`;
    }

    // If the number is too short or invalid, generate a unique one
    return generateUniquePhoneNumber();
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

  // Multiple upload handlers - Updated to use CSV upload service
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
          const response = await uploadCSVFile(file, "parents");

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
          description: `Successfully created ${totalSuccess} parents.${
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
      }

      // Refresh parents list
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
    } catch (error: unknown) {
      toast({
        title: "CSV upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") return false;

    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Additional checks
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) return false;
    if (trimmedEmail.length > 254) return false; // RFC 5321 limit

    return emailRegex.test(trimmedEmail);
  };

  // Generate parent data with automatic field generation
  const generateParentData = (record: ParsedData, schoolId: string) => {
    

    // Extract and clean data from the record with proper CSV column mapping
    // Try multiple variations of name fields
    const rawName = String(
      record.name ||
        record["Name"] ||
        record["Full Name"] ||
        record["full_name"] ||
        record["Full_Name"] ||
        record["Parent"] ||
        record["parent"] ||
        record["Parent Name"] ||
        record["parent_name"] ||
        record["Parent_Name"] ||
        record.first_name ||
        record["First Name"] ||
        record["First_Name"] ||
        record.firstName ||
        ""
    );

    // Remove quotes and clean the name
    const name = rawName.replace(/^["']|["']$/g, "").trim();

    // Split name into first and last name
    const nameParts = name
      .trim()
      .split(" ")
      .filter((part) => part.trim());
    const firstName = nameParts.length > 0 ? nameParts[0] : "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  

    // Handle email with validation
    const rawEmail = record.email || record["Email"];
    let email = "";

    if (rawEmail && String(rawEmail).trim()) {
      // Remove quotes and clean the email
      const cleanedEmail = String(rawEmail)
        .replace(/^["']|["']$/g, "")
        .trim();
     

      if (isValidEmail(cleanedEmail)) {
        email = cleanedEmail;
      } else {
        email = generateEmail(firstName, lastName);
      }
    } else {
      email = generateEmail(firstName, lastName);
    }

    // Final email validation
    if (!isValidEmail(email)) {
      throw new Error("Failed to generate valid email address");
    }


    // Try multiple variations of phone fields
    const rawPhoneNumber = String(
      record.phone_number ||
        record["Phone Number"] ||
        record["Phone_Number"] ||
        record["phone_number"] ||
        record.phone ||
        record["Phone"] ||
        record["phone"] ||
        record.mobile ||
        record["Mobile"] ||
        record["mobile"] ||
        record["Mobile Number"] ||
        record["mobile_number"] ||
        record["Mobile_Number"] ||
        record.phoneNumber ||
        record.contact ||
        record["Contact"] ||
        record["contact"] ||
        record.tel ||
        record["Tel"] ||
        record["tel"] ||
        ""
    );

    // Remove quotes and clean the phone number
    const phoneNumber = rawPhoneNumber.replace(/^["']|["']$/g, "").trim();


    // Convert to international format
    const formattedPhone = convertToInternationalFormat(phoneNumber);
  

    // Validate phone number format
    if (!formattedPhone) {
      throw new Error("Phone number is required");
    }

    if (!formattedPhone.startsWith("+254")) {
      throw new Error(
        "Phone number must be in international format (+254XXXXXXXXX)"
      );
    }

    if (formattedPhone.length !== 13) {
     
      throw new Error(
        "Phone number must be exactly 13 characters (+254XXXXXXXXX)"
      );
    }

    const rawAddress = String(record.address || record["Address"] || "");
    const address = rawAddress.replace(/^["']|["']$/g, "").trim();

    // Optional fields with fallbacks
    const rawEmergencyContact = String(
      record.emergency_contact ||
        record.emergencyContact ||
        record["Emergency Contact"] ||
        record["Emergency_Contact"] ||
        record["emergency_contact"] ||
        phoneNumber || // Use primary phone as fallback
        generateUniquePhoneNumber()
    );
    const emergencyContact = rawEmergencyContact
      .replace(/^["']|["']$/g, "")
      .trim();
    const rawSecondaryPhone = String(
      record.secondary_phone ||
        record.secondaryPhone ||
        record["Secondary Phone"] ||
        record["Secondary_Phone"] ||
        record["secondary_phone"] ||
        ""
    );
    const secondaryPhone = rawSecondaryPhone.replace(/^["']|["']$/g, "").trim();
    const rawPreferredContactMethod = String(
      record.preferred_contact_method ||
        record["Preferred Contact Method"] ||
        record["Preferred_Contact_Method"] ||
        record["preferred_contact_method"] ||
        ""
    )
      .toLowerCase()
      .trim();

    // Normalize and validate preferred contact method
    let preferredContactMethod = "phone"; // default
    if (rawPreferredContactMethod) {
      if (["email", "e-mail", "mail"].includes(rawPreferredContactMethod)) {
        preferredContactMethod = "email";
      } else if (
        ["phone", "mobile", "call", "telephone"].includes(
          rawPreferredContactMethod
        )
      ) {
        preferredContactMethod = "phone";
      } else if (
        ["sms", "text", "message"].includes(rawPreferredContactMethod)
      ) {
        preferredContactMethod = "sms";
      } else {
       
        preferredContactMethod = "phone";
      }
    }

    const authorizedPickupPersons =
      record.authorized_pickup_persons ||
      record.authorizedPickupPersons ||
      record["Authorized Pickup Persons"] ||
      record["Authorized_Pickup_Persons"] ||
      record["authorized_pickup_persons"] ||
      [];

    // Validate required fields only (name and phone are mandatory)
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Name is required");
    }

    if (!phoneNumber.trim()) {
      errors.push("Phone number is required");
    }

    // Email and address are optional - generate if missing
    if (!email.trim() || !isValidEmail(email)) {
    }

    if (!address.trim()) {
    }

    // If there are validation errors, throw them
    if (errors.length > 0) {
      
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Generate password (default: Pass1234 as requested)
    const password = "Pass1234";

    return {
      user: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: convertToInternationalFormat(phoneNumber),
        password: password,
        confirm_password: password,
        user_type: "parent",
        profile_image: null,
      },
      address: address,
      emergency_contact: convertToInternationalFormat(emergencyContact),
      school: parseInt(schoolId),
      preferred_contact_method: preferredContactMethod,
      secondary_phone: secondaryPhone,
      authorized_pickup_persons: {
        persons: authorizedPickupPersons,
      },
    };
  };

  const handleDataPreview = (data: Record<string, unknown>[]) => {
    setPreviewData(data as ParsedData[]);
    setIsDataPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Clear previous errors
    setFormErrors({});
    setIsSubmitting(true);

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
    } else if (!isValidEmail(formData.user_data.email)) {
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

    if (!formData.address?.trim()) {
      validationErrors.address = "Address is required";
    }

    if (!formData.emergency_contact?.trim()) {
      validationErrors.emergency_contact = "Emergency contact is required";
    }

    // If there are validation errors, display them and return
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setIsSubmitting(false);
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
        setIsSubmitting(false);
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
          user_phone_number: formattedUserPhone,
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

      const result = await dispatch(registerParent(apiData)).unwrap();

      // Success - close modal immediately and show success message
      setIsSubmitting(false);
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Parent registered successfully",
      });

      // Reset form
      setFormData({
        user_data: {
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          user_phone_number: "",
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
      
      // Refresh parents list in the background (non-blocking)
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
    } catch (error: any) {
      // Handle Redux action rejection - parse the error message
      let errorMessage = "Failed to register parent. Please try again.";
      let fieldErrors: FormErrors = {};

      try {
        // Try to parse the error as JSON (from Redux slice)
        if (typeof error === 'string') {
          const parsedError = JSON.parse(error);
          
          // Handle different error structures
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          } else if (parsedError.non_field_errors) {
            errorMessage = Array.isArray(parsedError.non_field_errors) 
              ? parsedError.non_field_errors.join(', ')
              : parsedError.non_field_errors;
          } else if (parsedError.user_data) {
            // Handle nested user_data errors
            fieldErrors.user_data = parsedError.user_data;
            errorMessage = "Please fix the field errors below";
          } else {
            // Handle field-specific errors
            Object.keys(parsedError).forEach(key => {
              if (key.startsWith('user_data.')) {
                const field = key.replace('user_data.', '');
                if (!fieldErrors.user_data) fieldErrors.user_data = {};
                fieldErrors.user_data[field as keyof typeof fieldErrors.user_data] = 
                  Array.isArray(parsedError[key]) ? parsedError[key][0] : parsedError[key];
              } else {
                fieldErrors[key as keyof FormErrors] = 
                  Array.isArray(parsedError[key]) ? parsedError[key][0] : parsedError[key];
              }
            });
            
            if (Object.keys(fieldErrors).length > 0) {
              errorMessage = "Please fix the field errors below";
            }
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

      // Set form errors if we have field-specific errors
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      } else {
        // Set general error
        setFormErrors({ general: errorMessage });
      }

      // Reset loading state
      setIsSubmitting(false);

      // Show toast notification
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Modal stays open - user can fix errors and try again
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
    } catch (error: any) {
      // Parse error message for better user feedback
      let errorMessage = "Failed to update parent. Please try again.";
      
      try {
        if (typeof error === 'string') {
          const parsedError = JSON.parse(error);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          } else if (parsedError.non_field_errors) {
            errorMessage = Array.isArray(parsedError.non_field_errors) 
              ? parsedError.non_field_errors.join(', ')
              : parsedError.non_field_errors;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
    } catch (error: any) {
      // Parse error message for better user feedback
      let errorMessage = "Failed to delete parent. Please try again.";
      
      try {
        if (typeof error === 'string') {
          const parsedError = JSON.parse(error);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          } else if (parsedError.non_field_errors) {
            errorMessage = Array.isArray(parsedError.non_field_errors) 
              ? parsedError.non_field_errors.join(', ')
              : parsedError.non_field_errors;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

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
      (
        parent.user_data?.phone_number ||
        parent.user_phone_number ||
        parent.phone_number ||
        ""
      )
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

  // Manual refresh function for debugging
  const handleManualRefresh = () => {
    const schoolId = localStorage.getItem("schoolId");
    if (schoolId) {
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }))
        .then((result) => {
        })
        .catch((error) => {
          // console.error("❌ Manual fetch failed:", error);
        });
    } else {
    }
  };

  // Show loading state only on initial load (when there's no data yet)
  if (loading && parents.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f7c624] mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">
            Loading parents...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md bg-card">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Parents
            </h3>
            <p className="text-destructive mb-6">{error}</p>
            <Button
              onClick={() => {
                const schoolId = localStorage.getItem("schoolId");
                if (schoolId) {
                  dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
                }
              }}
              className="bg-[#f7c624] hover:bg-[#f7c624]/90"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-2 sm:px-4 py-4 w-full max-w-[98vw] mx-auto">
          {/* Page Title Only */}
          <div className="mb-2 flex justify-between">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-[#f7c624]" /> Parents
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsMultipleUploadOpen(true)}
                className="bg-[#10213f] hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              >
                <Download className="mr-2 h-4 w-4" /> Bulk Upload
              </Button>
              <Dialog 
                open={isDialogOpen} 
                onOpenChange={(open) => {
                  // Prevent closing while submitting
                  if (!open && isSubmitting) {
                    return;
                  }
                  setIsDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#f7c624] hover:bg-[#f7c624] text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" /> Add New Parent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Parent</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-2">
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
                        rows={2}
                        className={formErrors.address ? "border-red-500 min-h-[60px]" : "min-h-[60px]"}
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
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsSubmitting(false);
                          setFormErrors({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#f7c624] hover:bg-[#f7c624]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding Parent...
                          </>
                        ) : (
                          "Add Parent"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Parents Table */}
          <Card className="bg-card border-0 rounded-xl">
            <div className="mb-2">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2"></div>

              {/* Search and Filter Toolbar */}
              <div className="bg-card">
                <CardContent className="">
                  <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search parents by name, email, or phone..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 focus:border-[#f7c624] focus:ring-[#f7c624] rounded-full shadow-sm"
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={handleStatusFilter}
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-full shadow-sm">
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
                        className="px-3 py-2 rounded-full shadow-sm"
                      >
                        Clear Filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleManualRefresh}
                        className="px-3 py-2 rounded-full shadow-sm"
                      >
                        Refresh Parents
                      </Button>
                      <ExportDropdown
                        data={{
                          headers: [
                            "Name",
                            "Email",
                            "Phone Number",
                            "Address",
                            "Emergency Contact",
                            "Secondary Phone",
                            "Preferred Contact Method",
                            "Authorized Pickup Persons",
                          ],
                          data: filteredParents.map((parent) => {
                            const authorizedPersons = Array.isArray(
                              parent.authorized_pickup_persons?.persons
                            )
                              ? parent.authorized_pickup_persons.persons
                                  .map(
                                    (person) =>
                                      `${person.name} (${person.relation})`
                                  )
                                  .join("; ")
                              : "None";

                            const phoneNumber =
                              parent.user_data?.phone_number ||
                              parent.user_phone_number ||
                              parent.phone_number ||
                              "";

                          

                            return {
                              name: `${
                                parent.user_data?.first_name ||
                                parent.user_full_name?.split(" ")[0] ||
                                ""
                              } ${
                                parent.user_data?.last_name ||
                                parent.user_full_name
                                  ?.split(" ")
                                  .slice(1)
                                  .join(" ") ||
                                ""
                              }`,
                              email:
                                parent.user_data?.email ||
                                parent.user_email ||
                                "",
                              phone_number: phoneNumber,
                              address: parent.address || "",
                              emergency_contact: parent.emergency_contact || "",
                              secondary_phone: parent.secondary_phone || "",
                              preferred_contact_method:
                                parent.preferred_contact_method || "",
                              authorized_pickup_persons: authorizedPersons,
                            };
                          }),
                          fileName: "parents_export",
                          title: "Parents Directory",
                        }}
                        className="rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>

            <CardContent className="p-0">
              {currentParents?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-muted/50 sticky top-0 z-10">
                        <tr>
                          <th className="w-10 px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={
                                selected.length === currentParents.length &&
                                currentParents.length > 0
                              }
                              onChange={toggleSelectAll}
                              className="rounded text-[#f7c624] focus:ring-[#f7c624]"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Phone Number
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Address
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {currentParents.map((parent, idx) => (
                          <tr
                            key={parent.id}
                            className={`transition-colors duration-200 ${
                              idx % 2 === 0 ? "bg-card" : "bg-muted/30"
                            }`}
                          >
                            <td className="w-10 px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selected.includes(parent.id)}
                                onChange={() => toggleSelect(parent.id)}
                                className="rounded text-[#f7c624] focus:ring-[#f7c624]"
                              />
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2">
                              {/* Avatar or initials */}
                              <div className="w-8 h-8 rounded-full bg-[#f7c624]/20 flex items-center justify-center text-[#f7c624] font-bold">
                                {parent.user_data?.first_name?.[0] ||
                                  parent.user_full_name?.[0] ||
                                  "?"}
                              </div>
                              <div className="font-medium text-foreground text-sm">
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
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-foreground">
                                {parent.user_data?.email ||
                                  parent.user_email ||
                                  "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-foreground">
                                {parent.user_data?.phone_number ||
                                  parent.user_phone_number ||
                                  parent.phone_number ||
                                  "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-foreground max-w-xs truncate">
                                {parent.address || "No address provided"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f7c624]/20 text-[#f7c624] text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#f7c624] inline-block"></span>
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openViewModal(parent)}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditModal(parent)}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                className="h-6 mt-2 w-6"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(parent)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 rounded-b-xl">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                        className="h-8 px-3 rounded-full"
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
                                    ? "bg-[#f7c624] hover:bg-[#f7c624]/90 text-white h-8 w-8 p-0 rounded-full"
                                    : "h-8 w-8 p-0 rounded-full"
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
                        className="h-8 px-3 rounded-full"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm || statusFilter !== "all"
                      ? "No matching parents found"
                      : "No Parents Found"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md text-sm">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "There are no parents registered in your school yet. Add the first parent to get started."}
                  </p>
                    {searchTerm || statusFilter !== "all" ? (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="rounded-full"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-[#f7c624] hover:bg-[#f7c624]/90 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200"
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

      {/* Multiple Upload Modal */}
      <MultipleUploadModal
        isOpen={isMultipleUploadOpen}
        onClose={() => setIsMultipleUploadOpen(false)}
        title="Bulk Upload Parents"
        description="Upload multiple parents at once using CSV document."
        acceptedFileTypes={[
          ".csv",
          
        ]}
        maxFileSize={10}
        maxFiles={5}
        onUpload={handleMultipleUpload}
        onPreview={handleDataPreview}
        uploadType="parents"
      />

      {/* Data Preview Modal */}
      <DataPreviewModal
        isOpen={isDataPreviewOpen}
        onClose={() => setIsDataPreviewOpen(false)}
        data={previewData}
        title="Parent Data Preview"
        columns={[
          "Name",
          "Email",
          "Phone Number",
          "Address",
          "Emergency Contact",
          "Secondary Phone",
          "Preferred Contact Method",
          "Authorized Pickup Persons",
          "School ID",
        ]}
      />

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
