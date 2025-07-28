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
  uploadType: "parents" | "drivers" | "students" | "teachers"
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
          console.log("🏫 Found school_id in persist:auth:", schoolId);
        } catch (e) {
          console.log("Error parsing persist:auth for school_id:", e);
        }
      }
    }

    console.log("🏫 Upload - Final school_id being used:", schoolId);

    if (schoolId) {
      formData.append("school_id", schoolId);
      console.log("📝 Adding school_id to FormData:", schoolId);
    } else {
      console.warn("⚠️ No school_id found in any source");
    }

    // Log FormData contents for debugging
    console.log("📤 FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (key === "file") {
        console.log(
          `  ${key}:`,
          (value as File).name,
          `(${(value as File).size} bytes)`
        );
      } else {
        console.log(`  ${key}:`, value);
      }
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
          console.log("Error parsing persist:auth:", e);
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
    console.error("CSV upload error:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

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
        console.log(
          "🏫 Found school_id in persist:auth for template:",
          schoolId
        );
      } catch (e) {
        console.log("Error parsing persist:auth for template school_id:", e);
      }
    }
  }

  console.log("🏫 Generating parent template with school_id:", schoolId);

  if (!schoolId) {
    console.warn(
      "No school ID found in any source for parent template. Using placeholder '2'"
    );
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

  console.log(
    "📄 Generated CSV content preview:",
    csvContent.substring(0, 200) + "..."
  );

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
        console.log(
          "🏫 Found school_id in persist:auth for driver template:",
          schoolId
        );
      } catch (e) {
        console.log(
          "Error parsing persist:auth for driver template school_id:",
          e
        );
      }
    }
  }

  if (!schoolId) {
    console.warn(
      "No school ID found in any source for driver template. Using placeholder '2'"
    );
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

  console.log("🏫 Current school info:", { id: schoolId, name: schoolName });
  console.log("🏫 All school-related localStorage keys:", allSchoolKeys);

  return {
    id: schoolId,
    name: schoolName || undefined,
  };
};
