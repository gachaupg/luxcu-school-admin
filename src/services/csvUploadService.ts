import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";

export interface CSVUploadResponse {
  success: boolean;
  message: string;
  created_count: number; // Number of successfully created users
  skipped_count: number; // Number of records that were skipped (duplicates, etc.)
  errors: Array<
    | {
        row?: number;
        field?: string;
        message?: string;
      }
    | string
  >; // Can be structured error or string error
  created_users: Array<{
    phone_number: string;
    name: string;
    email: string;
    user_type: string;
  }>;
}

export const uploadCSVFile = async (
  file: File,
  uploadType: "parents" | "drivers" | "students" | "teachers" | "vehicles" | "staffs"
): Promise<CSVUploadResponse> => {
  try {
    // Log current school information
    const schoolInfo = getCurrentSchoolInfo();

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_type", uploadType);

    // Get school_id from multiple possible sources
    let schoolId = localStorage.getItem("schoolId");

    // If not found, try to get from Redux persist data
    if (!schoolId) {
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        try {
          const authData = JSON.parse(persistAuth);
          const userData = JSON.parse(authData.user || "{}");
          schoolId = userData.school_id || userData.school;
        } catch (e) {
          // Error parsing persist:auth for school_id
        }
      }
    }

    if (schoolId) {
      formData.append("school_id", schoolId);
    }

    // Get auth token
    let token = localStorage.getItem("token");
    if (!token) {
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        try {
          const authData = JSON.parse(persistAuth);
          const userData = JSON.parse(authData.user || "{}");
          token = userData.token;
        } catch (e) {
          // Error parsing persist:auth
        }
      }
    }

    if (token) {
      // Handle double-stringified token from Redux Persist
      if (token.startsWith('"') && token.endsWith('"')) {
        token = JSON.parse(token);
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Create request config with auth header
    const requestConfig = {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await api.post(
      API_ENDPOINTS.CSV_UPLOAD,
      formData,
      requestConfig
    );

    // Transform the response to match our interface
    return {
      success: true,
      message: response.data.message,
      created_count: response.data.created_count,
      skipped_count: response.data.skipped_count,
      errors: response.data.errors || [],
      created_users: response.data.created_users || [],
    };
  } catch (error: any) {
    if (error.response?.data) {
      return {
        success: false,
        message:
          error.response.data.message ||
          error.response.data.detail ||
          "Upload failed",
        created_count: 0,
        skipped_count: 0,
        errors: error.response.data.errors || [],
        created_users: [],
      };
    }

    return {
      success: false,
      message: error.message || "Upload failed",
      created_count: 0,
      skipped_count: 0,
      errors: [],
      created_users: [],
    };
  }
};

// Generate CSV template for parents
export const generateParentsCSVTemplate = (): string => {
  const headers = [
    "first_name",
    "school_id",
    "last_name",
    "phone_number",
    "email",
    "address",
    "emergency_contact",
    "secondary_phone",
    "preferred_contact_method",
    "authorized_pickup_persons",
  ];

  // Get the current school ID from multiple sources
  let schoolId = localStorage.getItem("schoolId");

  // If not found, try to get from Redux persist data
  if (!schoolId) {
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      try {
        const authData = JSON.parse(persistAuth);
        const userData = JSON.parse(authData.user || "{}");
        schoolId = userData.school_id || userData.school;
      } catch (e) {
        // Error parsing persist:auth for template school_id
      }
    }
  }

  if (!schoolId) {
    // No school ID found in any source for parent template. Using placeholder '2'
  }

  const sampleData = [
    "John",
    schoolId || "2",
    "Doe",
    "+254712345678",
    "john.doe@email.com",
    "123 Main St, Nairobi",
    "Jane Doe (+254723456789)",
    "+254734567890",
    "phone",
    "Jane Doe (Spouse, +254723456789); Mike Smith (Friend, +254745678901)",
  ];

  const csvContent = [
    headers.join(","),
    sampleData.join(","),
    `Mary,${
      schoolId || "2"
    },Smith,+254723456789,mary.smith@email.com,456 Oak Ave,Tom Smith (+254734567890),+254745678901,email,Tom Smith (Spouse, +254734567890)`,
  ].join("\n");

  return csvContent;
};

// Generate CSV template for drivers
export const generateDriversCSVTemplate = (): string => {
  const headers = [
    "first_name",
    "school_id",
    "last_name",
    "phone_number",
    "email",
    "license_number",
    "license_expiry",
    "license_class",
    "is_assistant_driver",
    "last_health_check",
    "last_background_check",
  ];

  // Get the current school ID from multiple sources
  let schoolId = localStorage.getItem("schoolId");

  // If not found, try to get from Redux persist data
  if (!schoolId) {
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      try {
        const authData = JSON.parse(persistAuth);
        const userData = JSON.parse(authData.user || "{}");
        schoolId = userData.school_id || userData.school;
      } catch (e) {
        // Error parsing persist:auth for driver template school_id
      }
    }
  }

  if (!schoolId) {
    // No school ID found in any source for driver template. Using placeholder '2'
  }

  const sampleData = [
    "Peter",
    schoolId || "2",
    "Gachau",
    "+254712345678",
    "peter.gachau@email.com",
    "DL123456789",
    "2025-12-31",
    "B",
    "false",
    "2024-01-15",
    "2024-01-10",
  ];

  const csvContent = [
    headers.join(","),
    sampleData.join(","),
    `Jane,${
      schoolId || "2"
    },Mwangi,+254723456789,jane.mwangi@email.com,DL987654321,2025-06-30,A,true,2024-01-20,2024-01-15`,
  ].join("\n");

  return csvContent;
};

// Generate CSV template for students
export const generateStudentsCSVTemplate = (): string => {
  const headers = [
    "first_name",
    "middle_name",
    "last_name",
    "admission_number",
    "school_id",
    "grade",
    "section",
    "gender",
    "date_of_birth",
    "parent_name",
    "parent_phone",
  ];

  // Get the current school ID from multiple sources
  let schoolId = localStorage.getItem("schoolId");

  // If not found, try to get from Redux persist data
  if (!schoolId) {
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      try {
        const authData = JSON.parse(persistAuth);
        const userData = JSON.parse(authData.user || "{}");
        schoolId = userData.school_id || userData.school;
      } catch (e) {
        // Error parsing persist:auth for student template school_id
      }
    }
  }

  if (!schoolId) {
    // No school ID found in any source for student template. Using placeholder '2'
  }

  const sampleData = [
    "John",
    "Michael",
    "Doe",
    "STU001",
    schoolId || "2",
    "Grade 1",
    "A",
    "male",
    "2015-05-15",
    "Jane Doe",
    "+254712345678",
  ];

  const row2 = [
    "Peter",
    "", // Empty middle name
    "Johnson",
    "STU002",
    schoolId || "2",
    "Grade 1",
    "A",
    "male",
    "2015-03-10",
    "Sarah Johnson",
    "+254734567890",
  ];

  const csvContent = [
    headers.join(","),
    sampleData.join(","),
    row2.join(","),
  ].join("\n");

  console.log("📝 Generated student CSV template:");
  console.log(csvContent);

  return csvContent;
};

// Generate CSV template for vehicles
export const generateVehiclesCSVTemplate = (): string => {
  const headers = [
    "registration_number",
    "school_id",
    "vehicle_type",
    "capacity",
    "model",
    "year",
    "fuel_type",
    "manufacturer",
    "is_active",
    "has_gps",
    "has_camera",
    "has_emergency_button",
    "driver_phone_number",
  ];

  // Get the current school ID from multiple sources
  let schoolId = localStorage.getItem("schoolId");

  // If not found, try to get from Redux persist data
  if (!schoolId) {
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      try {
        const authData = JSON.parse(persistAuth);
        const userData = JSON.parse(authData.user || "{}");
        schoolId = userData.school_id || userData.school;
      } catch (e) {
        // Error parsing persist:auth for vehicle template school_id
      }
    }
  }

  if (!schoolId) {
    // No school ID found in any source for vehicle template. Using placeholder '2'
  }

  const sampleData = [
    "KAA-123B",
    schoolId || "2",
    "bus",
    "50",
    "Coaster",
    "2020",
    "diesel",
    "Toyota",
    "true",
    "true",
    "true",
    "true",
    "+254757198002",
  ];

  const csvContent = [
    headers.join(","),
    sampleData.join(","),
    `KBB-456C,${
      schoolId || "2"
    },van,14,Caravan,2019,petrol,Nissan,true,true,true,true,+254757198002`,
    `KCC-789D,${
      schoolId || "2"
    },bus,40,NQR,2021,diesel,Isuzu,true,true,true,true,+254757198002`,
  ].join("\n");

  return csvContent;
};

// Generate CSV template for staff
export const generateStaffCSVTemplate = (): string => {
  const headers = [
    "first_name",
    "middle_name",
    "last_name",
    "employee_number",
    "school_id",
    "gender",
    "mobile_number",
    "email",
    "status",
    "role",
    "can_manage_routes",
    "can_manage_vehicles",
    "can_manage_staff",
    "can_manage_student_trips",
    "is_on_duty",
  ];

  // Get the current school ID from multiple sources
  let schoolId = localStorage.getItem("schoolId");

  // If not found, try to get from Redux persist data
  if (!schoolId) {
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      try {
        const authData = JSON.parse(persistAuth);
        const userData = JSON.parse(authData.user || "{}");
        schoolId = userData.school_id || userData.school;
      } catch (e) {
        // Error parsing persist:auth for staff template school_id
      }
    }
  }

  if (!schoolId) {
    // No school ID found in any source for staff template. Using placeholder '2'
  }

  const sampleData = [
    "John",
    "Michael",
    "Doe",
    "EMP001",
    schoolId || "2",
    "male",
    "+254712345678",
    "john.doe@school.com",
    "active",
    "teacher",
    "false",
    "false",
    "false",
    "true",
    "true",
  ];

  const csvContent = [
    headers.join(","),
    sampleData.join(","),
    `Mary,Ann,Smith,EMP002,${
      schoolId || "2"
    },female,+254723456789,mary.smith@school.com,active,school_admin,true,true,true,true,true`,
    `Peter,,Johnson,EMP003,${
      schoolId || "2"
    },male,+254734567890,peter.johnson@school.com,active,driver,true,true,false,false,true`,
  ].join("\n");

  return csvContent;
};

// Download CSV template
export const downloadCSVTemplate = (uploadType: string): void => {
  let csvContent = "";
  let fileName = "";

  switch (uploadType) {
    case "parents":
      csvContent = generateParentsCSVTemplate();
      fileName = "parents_template.csv";
      break;
    case "drivers":
      csvContent = generateDriversCSVTemplate();
      fileName = "drivers_template.csv";
      break;
    case "students":
      csvContent = generateStudentsCSVTemplate();
      fileName = "students_template.csv";
      break;
    case "vehicles":
      csvContent = generateVehiclesCSVTemplate();
      fileName = "vehicles_template.csv";
      break;
    case "staffs":
    case "staff":
      csvContent = generateStaffCSVTemplate();
      fileName = "staff_template.csv";
      break;
    default:
      csvContent = "first_name,last_name,phone_number\nJohn,Doe,+254700000000";
      fileName = `${uploadType}_template.csv`;
  }

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Get current school information for debugging
export const getCurrentSchoolInfo = (): {
  id: string | null;
  name?: string;
} => {
  const schoolId = localStorage.getItem("schoolId");
  const schoolName = localStorage.getItem("schoolName");

  // Check for other possible school ID keys
  const allSchoolKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.toLowerCase().includes("school")) {
      allSchoolKeys.push({ key, value: localStorage.getItem(key) });
    }
  }

  return {
    id: schoolId,
    name: schoolName || undefined,
  };
};
