import { AxiosError } from "axios";
import { showToast } from "./toast";
import { store } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";

// Callback type for auth-related actions
type AuthCallback = () => void;

// Default auth callback that can be set by the app
let authCallback: AuthCallback = () => {
  store.dispatch(logout());
  window.location.href = "/login";
};

// Function to set the auth callback
export const setAuthCallback = (callback: AuthCallback) => {
  authCallback = callback;
};

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    // Handle network errors
    if (!error.response) {
      showToast.error("Network Error", "Please check your connection");
      throw new Error("Network error - please check your connection");
    }

    // Handle API errors
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        showToast.error(
          "Error Trying to Make The Request",
          data.message || data.error || "Invalid request"
        );
        throw new Error(data.message || data.error || "Bad request");

      case 401:
        authCallback();
        return;

      case 403:
        showToast.error("Forbidden", "You don't have permission");
        throw new Error("Forbidden - you don't have permission");

      case 404:
        showToast.error("Not Found", "Resource not found");
        throw new Error("Resource not found");

      case 500:
        showToast.error("Server Error", "Please try again later");
        throw new Error("Server error - please try again later");

      default:
        showToast.error("Error", data.message || "An error occurred");
        throw new Error(data.message || "An error occurred");
    }
  }

  // Handle non-Axios errors
  showToast.error(
    "Error",
    error instanceof Error ? error.message : "An unexpected error occurred"
  );
  throw error;
};

export const handleAuthError = handleApiError;
export const handleP2PError = handleApiError;

// Enhanced error parser for database errors
export const parseDatabaseError = (
  error: unknown,
  entityType: string
): { message: string; fieldErrors?: Record<string, string> } => {
  let message = `Failed to ${entityType}`;
  const fieldErrors: Record<string, string> = {};

  if (error instanceof Error) {
    const errorStr = error.message.toLowerCase();

    // Common database error patterns
    const errorPatterns = {
      // Email errors
      email: {
        patterns: ["email", "e-mail"],
        message: "Email address is already registered or invalid",
      },
      // Phone errors
      phone: {
        patterns: ["phone", "phone_number", "mobile"],
        message: "Phone number is already registered or invalid",
      },
      // Password errors
      password: {
        patterns: ["password", "pass"],
        message: "Password requirements not met",
      },
      // Name errors
      name: {
        patterns: ["first_name", "last_name", "name"],
        message: "Name fields are required and must be valid",
      },
      // Unique constraint errors
      unique: {
        patterns: ["unique", "already exists", "duplicate"],
        message: "This record already exists",
      },
      // Foreign key errors
      foreign_key: {
        patterns: ["foreign key", "constraint", "reference"],
        message: "Referenced record not found",
      },
      // Required field errors
      required: {
        patterns: ["required", "not null", "empty"],
        message: "Required field is missing",
      },
      // Format errors
      format: {
        patterns: ["format", "invalid", "malformed"],
        message: "Invalid format provided",
      },
      // Permission errors
      permission: {
        patterns: ["permission", "forbidden", "unauthorized"],
        message: "You don't have permission to perform this action",
      },
      // Not found errors
      not_found: {
        patterns: ["not found", "does not exist", "missing"],
        message: "Record not found or has been deleted",
      },
    };

    // Check for specific patterns
    for (const [key, pattern] of Object.entries(errorPatterns)) {
      if (pattern.patterns.some((p) => errorStr.includes(p))) {
        fieldErrors[key] = pattern.message;
        message = pattern.message;
        break;
      }
    }

    // If no specific pattern found, use the original error message
    if (Object.keys(fieldErrors).length === 0) {
      message = error.message;
    }
  } else {
    message = String(error);
  }

  return { message, fieldErrors };
};

// Enhanced error parser for API response errors
export const parseApiError = (
  error: unknown
): { message: string; fieldErrors?: Record<string, string> } => {
  let message = "An error occurred";
  const fieldErrors: Record<string, string> = {};

  try {
    // Try to parse the error as JSON first
    let errorData: Record<string, unknown> | null = null;

    if (typeof error === "string") {
      try {
        errorData = JSON.parse(error);
      } catch (parseError) {
        message = error;
        return { message, fieldErrors };
      }
    } else if (error instanceof Error) {
      try {
        errorData = JSON.parse(error.message);
      } catch (parseError) {
        message = error.message;
        return { message, fieldErrors };
      }
    } else {
      message = String(error);
      return { message, fieldErrors };
    }

    // If we successfully parsed JSON error data, process field-specific errors
    if (errorData && typeof errorData === "object") {
      // Map database field names to form field names
      const fieldMapping: Record<string, string> = {
        // User data fields
        "user.email": "user_data.email",
        "user.phone_number": "user_data.phone_number",
        "user.first_name": "user_data.first_name",
        "user.last_name": "user_data.last_name",
        "user.password": "user_data.password",
        "user.confirm_password": "user_data.confirm_password",

        // Direct field mappings
        email: "user_data.email",
        phone_number: "user_data.phone_number",
        first_name: "user_data.first_name",
        last_name: "user_data.last_name",
        password: "user_data.password",
        confirm_password: "user_data.confirm_password",
        address: "address",
        emergency_contact: "emergency_contact",
        secondary_phone: "secondary_phone",
        preferred_contact_method: "preferred_contact_method",
        authorized_pickup_persons: "authorized_pickup_persons",
        school: "school",
      };

      // Process each error field
      Object.entries(errorData).forEach(([field, errorValue]) => {
        const formField = fieldMapping[field] || field;
        const errorMessage = Array.isArray(errorValue)
          ? errorValue[0]
          : String(errorValue);

        fieldErrors[formField] = errorMessage;
      });

      // Create a user-friendly error message for the toast
      const errorMessages = Object.values(errorData).flat();
      message =
        errorMessages.length > 0
          ? errorMessages.join(", ")
          : "Please check the form for errors";
    }
  } catch (parseError) {
    // Error parsing API error data
    message =
      typeof error === "string" ? error : "An unexpected error occurred";
  }

  return { message, fieldErrors };
};

// Specific error handlers for different entities
export const parseParentError = (error: unknown) => {
  return parseDatabaseError(error, "register parent");
};

export const parseStudentError = (error: unknown) => {
  return parseDatabaseError(error, "create student");
};

export const parseDriverError = (error: unknown) => {
  return parseDatabaseError(error, "add driver");
};

export const parseVehicleError = (error: unknown) => {
  return parseDatabaseError(error, "add vehicle");
};

export const parseRouteError = (error: unknown) => {
  return parseDatabaseError(error, "add route");
};

export const parseStaffError = (error: unknown) => {
  return parseDatabaseError(error, "add staff member");
};

// Generic error handler for forms
export const handleFormError = (error: unknown, entityType: string) => {
  const { message, fieldErrors } = parseDatabaseError(error, entityType);

  // Error logged for entityType

  return {
    message,
    fieldErrors,
    showToast: () => {
      showToast.error("Error", message);
    },
  };
};

// Specific error handler for parent operations
export const handleParentError = (error: unknown) => {
  const { message, fieldErrors } = parseApiError(error);

  // Add parent-specific error context
  const enhancedMessage = message.includes("Failed to")
    ? message
    : `Failedggg to register parent: ${message}`;

  return {
    message: enhancedMessage,
    fieldErrors,
    showToast: () => {
      showToast.error("Parent Registration Failed", enhancedMessage);
    },
  };
};

// Enhanced error handler for parent updates
export const handleParentUpdateError = (error: unknown) => {
  const { message, fieldErrors } = parseApiError(error);

  const enhancedMessage = message.includes("Failed to")
    ? message
    : `Failed to update parent: ${message}`;

  return {
    message: enhancedMessage,
    fieldErrors,
    showToast: () => {
      showToast.error("Parent Update Failed", enhancedMessage);
    },
  };
};

// Enhanced error handler for parent deletion
export const handleParentDeleteError = (error: unknown) => {
  const { message } = parseApiError(error);

  const enhancedMessage = message.includes("Failed to")
    ? message
    : `Failed to delete parent: ${message}`;

  return {
    message: enhancedMessage,
    showToast: () => {
      showToast.error("Parent Deletion Failed", enhancedMessage);
    },
  };
};

// Enhanced error parser for Redux errors (JSON strings)
// This function handles errors that come from Redux actions as JSON strings
// Example error format: '{"email": ["A user with this email already exists."], "phone_number": ["user with this phone number already exists."]}'
export const parseReduxError = (
  error: unknown
): { message: string; fieldErrors?: Record<string, string> } => {
  let message = "An error occurred";
  const fieldErrors: Record<string, string> = {};

  try {
    // Redux errors are typically JSON strings
    if (typeof error === "string") {
      const errorData = JSON.parse(error);

      if (errorData && typeof errorData === "object") {
        // Map database field names to form field names
        Object.entries(errorData).forEach(([field, errorValue]) => {
          const errorMsg = Array.isArray(errorValue)
            ? errorValue[0]
            : String(errorValue);

          // Map common database field names to form field names
          if (field === "email") {
            fieldErrors["user_data.email"] = errorMsg;
          } else if (field === "phone_number") {
            fieldErrors["user_data.phone_number"] = errorMsg;
          } else if (field === "first_name") {
            fieldErrors["user_data.first_name"] = errorMsg;
          } else if (field === "last_name") {
            fieldErrors["user_data.last_name"] = errorMsg;
          } else if (field === "password") {
            fieldErrors["user_data.password"] = errorMsg;
          } else if (field === "confirm_password") {
            fieldErrors["user_data.confirm_password"] = errorMsg;
          } else {
            fieldErrors[field] = errorMsg;
          }
        });

        // Create a user-friendly error message
        const errorMessages = Object.values(errorData).flat();
        message = errorMessages.join(", ");
      }
    } else {
      message = String(error);
    }
  } catch (parseError) {
    // Error parsing Redux error data
    message =
      typeof error === "string" ? error : "An unexpected error occurred";
  }

  return { message, fieldErrors };
};
