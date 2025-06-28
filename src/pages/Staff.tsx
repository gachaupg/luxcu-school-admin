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
} from "lucide-react";
import { fetchStaff, addStaff } from "../redux/slices/staffSlice";
import { fetchSchools } from "../redux/slices/schoolsSlice";
import { fetchRoles, createRole } from "../redux/slices/roleSlice";
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

export default function Staff() {
  const dispatch = useAppDispatch();
  const { staff, loading, error } = useAppSelector((state) => state.staff);
  const { roles } = useAppSelector((state) => state.roles);
  const { schools } = useAppSelector((state) => state.schools);
  const data = JSON.parse(localStorage.getItem("profile") || "{}");
  const user = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Filter schools for the current admin
  const filteredSchools =
    schools?.filter((school) => school.admin === user?.id) || [];
  const schoolId = filteredSchools[0]?.id;

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchStaff({ schoolId }));
      dispatch(fetchRoles(schoolId));
    } else {
      // Fetch schools if we don't have a schoolId yet
      dispatch(fetchSchools());
    }
  }, [dispatch, schoolId]);

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
      console.error("Staff creation error:", err);

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
  }) => {
    if (!schoolId) {
      showToast.error("Error", "No school found for the current admin");
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
      console.error("Error creating role:", err);
    }
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "Unknown Role";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex w-full">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-8 py-6 bg-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">All Staff</h2>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded shadow flex items-center gap-2"
                onClick={() => setIsRoleModalOpen(true)}
              >
                <Shield size={20} />
                Create Role
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded shadow"
                onClick={() => setIsModalOpen(true)}
              >
                Add New Staff
              </button>
            </div>
          </div>

          {loading && <div className="text-center py-4">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          <div className="bg-white rounded-lg shadow p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {staff.map((staffMember) => (
                  <tr key={staffMember.employee_id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {staffMember.user.first_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {staffMember.user.last_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {staffMember.user.phone_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {staffMember.user.email}
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
                        {staffMember.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
              <span>
                Showing 1-{staff.length} of {staff.length}
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-gray-200" disabled>
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
                <button className="p-1 rounded hover:bg-gray-200">
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
          </div>
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
        onSubmit={handleCreateRole}
      />
    </div>
  );
}
