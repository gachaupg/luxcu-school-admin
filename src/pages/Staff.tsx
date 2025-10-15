import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Users,
  MoreVertical,
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
  Shield,
  UserCheck,
} from "lucide-react";
import { fetchStaff, addStaff } from "../redux/slices/staffSlice";
import { fetchSchools } from "../redux/slices/schoolsSlice";
import {
  fetchRoles,
  createRole,
  createDefaultRoles,
} from "../redux/slices/roleSlice";
import { showToast } from "../utils/toast";
import { StaffModal } from "../components/StaffModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { RoleModal } from "../components/RoleModal";
import { parseStaffError } from "@/utils/errorHandler";
import {
  MultipleUploadModal,
  DataPreviewModal,
} from "@/components/multiple-upload";
import { uploadCSVFile } from "@/services/csvUploadService";

export default function Staff() {
  const dispatch = useAppDispatch();
  const { staff, loading, error } = useAppSelector((state) => state.staff);
  const { roles } = useAppSelector((state) => state.roles);
  const { schools } = useAppSelector((state) => state.schools);
  const data = JSON.parse(localStorage.getItem("profile") || "{}");
  const user = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Bulk upload states
  const [isMultipleUploadOpen, setIsMultipleUploadOpen] = useState(false);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

 

  // Filter schools for the current admin - try multiple approaches
  let filteredSchools =
    schools?.filter((school) => school.admin === user?.id) || [];

  // If no schools found, try alternative approaches
  if (filteredSchools.length === 0 && schools && schools.length > 0) {

    // Try matching by user ID directly
    filteredSchools =
      schools.filter((school) => school.admin_details?.id === user?.id) || [];

    // If still no match, use the first available school (fallback)
    if (filteredSchools.length === 0) {
      filteredSchools = [schools[0]];
    }
  }

  // Use selected school ID if available, otherwise use the first filtered school
  const schoolId = selectedSchoolId || filteredSchools[0]?.id;

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchStaff({ schoolId }));
      dispatch(fetchRoles(schoolId));
    } else {
      // Fetch schools if we don't have a schoolId yet
      dispatch(fetchSchools()).catch((error) => {
        // The API interceptor should handle token expiration automatically
      });
    }
  }, [dispatch, schoolId]);

  // Set selected school ID when filtered schools are available
  useEffect(() => {
    if (filteredSchools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(filteredSchools[0].id);
    }
  }, [filteredSchools, selectedSchoolId]);

  const handleAddStaff = async (staffData: {
    employee_id: string;
    role: number;
    school: number;
    status: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
      confirm_password: string;
    };
  }) => {
    if (!schoolId) {
      showToast.error("Error", "No school found for the current admin");
      return;
    }

    try {
      const resultAction = await dispatch(
        addStaff({
          ...staffData,
          school: schoolId,
        })
      );
      if (addStaff.fulfilled.match(resultAction)) {
        showToast.success("Staff member added successfully");
        setIsModalOpen(false);
      } else if (addStaff.rejected.match(resultAction)) {
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Failed to add staff member";
        showToast.error("Error", errorMessage);
      }
    } catch (err) {

      // Show the actual database error response
      let errorMessage = "Failed to add staff member";

      if (err instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(err.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
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

      showToast.error("Error", errorMessage);
    }
  };

  const handleCreateRole = async (roleData: {
    name: string;
    description: string;
    school: number;
    permissions: string[];
    is_system_role: boolean;
    parent_role?: number;
  }) => {


    if (!schoolId) {
      const errorMsg = `No school found for the current admin. User ID: ${
        user?.id
      }, Available schools: ${JSON.stringify(schools)}`;
      showToast.error(
        "Error",
        "No school found for the current admin. Please check your account setup."
      );
      return;
    }

    try {
      const resultAction = await dispatch(
        createRole({
          ...roleData,
          school: schoolId,
        })
      );
      if (createRole.fulfilled.match(resultAction)) {
        showToast.success("Role created successfully");
        setIsRoleModalOpen(false);
        // Refresh roles list after creating a new role
        dispatch(fetchRoles(schoolId));
      } else if (createRole.rejected.match(resultAction)) {
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Failed to create role";
        showToast.error("Error", errorMessage);
      }
    } catch (err) {
      showToast.error("Error", "Failed to create role");
    }
  };

  const handleCreateDefaultRoles = async () => {
   

    if (!schoolId) {
      const errorMsg = `No school found for the current admin. User ID: ${
        user?.id
      }, Available schools: ${JSON.stringify(schools)}`;
      showToast.error(
        "Error",
        "No school found for the current admin. Please check your account setup."
      );
      return;
    }

    try {
      const resultAction = await dispatch(createDefaultRoles(schoolId));
      if (createDefaultRoles.fulfilled.match(resultAction)) {
        showToast.success("Default roles created successfully");
        // Refresh roles list after creating default roles
        dispatch(fetchRoles(schoolId));
      } else if (createDefaultRoles.rejected.match(resultAction)) {
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Failed to create default roles";
        showToast.error("Error", errorMessage);
      }
    } catch (err) {
      showToast.error("Error", "Failed to create default roles");
    }
  };

  const getRoleName = (roleId: number) => {
    const role = roles?.find((r) => r.id === roleId);
    return role ? role.name : "Unknown Role";
  };

  // Bulk upload handlers
  const handleMultipleUpload = async (files: File[]) => {
    try {
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
          const response = await uploadCSVFile(file, "staffs");

          if (response.success) {
            totalSuccess += response.created_count || 0;
            totalFailed += response.skipped_count || 0;

            // Add any errors from the response
            if (response.errors && response.errors.length > 0) {
              response.errors.forEach((error) => {
                if (typeof error === "string") {
                  allErrors.push(error);
                } else if (error.row && error.field && error.message) {
                  allErrors.push(
                    `Row ${error.row}, ${error.field}: ${error.message}`
                  );
                } else {
                  allErrors.push(JSON.stringify(error));
                }
              });
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
        showToast.success(
          `Successfully created ${totalSuccess} staff member(s).${
            totalFailed > 0 ? ` ${totalFailed} skipped.` : ""
          }`
        );
      }

      if (totalFailed > 0) {
        showToast.error(
          `${totalFailed} records were skipped. Check the console for details.`
        );
      }

      // Refresh staff list
      dispatch(fetchStaff({ schoolId }));
      setIsMultipleUploadOpen(false);
    } catch (error: unknown) {
      showToast.error(
        error instanceof Error ? error.message : "CSV upload failed"
      );
      throw error;
    }
  };

  const handleDataPreview = (data: Record<string, unknown>[]) => {
    setPreviewData(data);
    setIsDataPreviewOpen(true);
  };

  // Error boundary for the component
  if (componentError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-destructive mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">{componentError}</p>
          <button
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-8 py-6 bg-background">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <Users className="text-[#f7c624]" size={32} />
                <h2 className="text-2xl font-bold text-foreground">
                  Staff Management
                </h2>
                {process.env.NODE_ENV === "development" && schoolId && (
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    School ID: {schoolId}
                  </span>
                )}
              </div>

              {/* School Selector */}
              {schools && schools.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Select School:
                  </label>
                  <select
                    value={selectedSchoolId || schoolId || ""}
                    onChange={(e) => {
                      const newSchoolId = parseInt(e.target.value);
                      setSelectedSchoolId(newSchoolId);
                    }}
                    className="border border-border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-background text-foreground"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                {activeTab === "staff" && (
                  <>
                    <button
                      className="bg-[#10213f] hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded shadow flex items-center gap-2"
                      onClick={() => setIsMultipleUploadOpen(true)}
                    >
                      <Download size={20} />
                      Bulk Upload
                    </button>
                    <button
                      className="bg-[#f7c624] hover:bg-[#f7c624] text-white font-semibold px-5 py-2 rounded shadow"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Add New Staff
                    </button>
                  </>
                )}
                {activeTab === "roles" && (
                  <>
                    <button
                      className="bg-[#10213f] hover:bg-[#10213f] text-white font-semibold px-5 py-2 rounded shadow flex items-center gap-2"
                      onClick={handleCreateDefaultRoles}
                    >
                      <Shield size={20} />
                      Create Default Roles
                    </button>
                    <button
                      className="bg-[#f7c624] hover:bg-[#f7c624] text-white font-semibold px-5 py-2 rounded shadow flex items-center gap-2"
                      onClick={() => setIsRoleModalOpen(true)}
                    >
                      <Shield size={20} />
                      Create Custom Role
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setActiveTab("staff")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "staff"
                    ? "border-[#f7c624] text-[#f7c624]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <div className="flex text-[#f7c624] items-center gap-2">
                  <Users size={20} />
                  Staff Members ({staff?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "roles"
                    ? "border-[#f7c624] text-[#f7c624]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={20} />
                  Roles ({roles?.length || 0})
                </div>
              </button>
            </div>
            {loading && <div className="text-center py-4 text-muted-foreground">Loading...</div>}
            {error && (
              <div className="text-destructive text-center py-4">{error}</div>
            )}

            {/* Tab Content */}
            {activeTab === "staff" && (
              <div className="bg-card rounded-lg shadow p-0 overflow-x-auto">
                <div className="px-6 py-4 border-b bg-muted/50">
                  <h3 className="text-lg font-semibold text-foreground">
                    Staff Members
                  </h3>
                </div>
                {!staff || staff.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No staff members
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by adding your first staff member.
                    </p>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Add New Staff
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            First Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Last Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Phone Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Email Address
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {staff?.map((staffMember) => (
                          <tr key={staffMember.employee_id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {staffMember.user?.first_name || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {staffMember.user?.last_name || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {staffMember.user?.phone_number || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {staffMember.user?.email || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getRoleName(staffMember.role)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  staffMember.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-500"
                                }`}
                              >
                                {staffMember.status || "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button className="p-2 rounded-full hover:bg-muted/30">
                                <MoreVertical size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-sm text-muted-foreground">
                      <span>
                        Showing 1-{staff?.length || 0} of {staff?.length || 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 rounded hover:bg-muted/30"
                          disabled
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button className="p-1 rounded hover:bg-muted/30">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "roles" && (
              <div className="bg-card rounded-lg shadow p-0 overflow-x-auto">
                <div className="px-6 py-4 border-b bg-muted/50">
                  <h3 className="text-lg font-semibold text-foreground">
                    Available Roles
                  </h3>
                </div>
                {!roles || roles.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No roles available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create default roles or add custom roles to get started.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                        onClick={handleCreateDefaultRoles}
                      >
                        <Shield size={16} />
                        Create Default Roles
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                        onClick={() => setIsRoleModalOpen(true)}
                      >
                        <Shield size={16} />
                        Create Custom Role
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Role Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Permissions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {roles?.map((role) => (
                          <tr key={role.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-foreground">
                                {role.name || "Unnamed Role"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-muted-foreground max-w-xs">
                                {role.description || "No description available"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  role.is_system_role
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {role.is_system_role ? "System" : "Custom"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {role.permissions &&
                                  role.permissions
                                    .slice(0, 3)
                                    .map((permission) => (
                                      <span
                                        key={permission}
                                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                                      >
                                        {permission.replace("_", " ")}
                                      </span>
                                    ))}
                                {role.permissions &&
                                  role.permissions.length > 3 && (
                                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                      +{role.permissions.length - 3} more
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button className="p-2 rounded-full hover:bg-muted/30">
                                <MoreVertical size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-sm text-muted-foreground">
                      <span>
                        Showing 1-{roles?.length || 0} of {roles?.length || 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 rounded hover:bg-muted/30"
                          disabled
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button className="p-1 rounded hover:bg-muted/30">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>

        <StaffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddStaff}
        />

        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          schoolId={schoolId}
          onSubmit={handleCreateRole}
        />

        {/* Multiple Upload Modal */}
        <MultipleUploadModal
          isOpen={isMultipleUploadOpen}
          onClose={() => setIsMultipleUploadOpen(false)}
          title="Bulk Upload Staff"
          description="Upload multiple staff members at once using CSV document. Required fields: First Name, Last Name, Employee Number, Email, Mobile Number, Role."
          acceptedFileTypes={[".csv"]}
          maxFileSize={10}
          maxFiles={5}
          onUpload={handleMultipleUpload}
          onPreview={handleDataPreview}
          uploadType="staffs"
        />

        {/* Data Preview Modal */}
        <DataPreviewModal
          isOpen={isDataPreviewOpen}
          onClose={() => setIsDataPreviewOpen(false)}
          data={previewData}
          title="Staff Data Preview"
          columns={[
            "First Name",
            "Middle Name",
            "Last Name",
            "Employee Number",
            "Gender",
            "Mobile Number",
            "Email",
            "Status",
            "Role",
            "Can Manage Routes",
            "Can Manage Vehicles",
            "Can Manage Staff",
            "Can Manage Student Trips",
            "Is On Duty",
            "School ID",
          ]}
        />
      </div>
    );
  } catch (error) {
    setComponentError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
    return null;
  }
}
