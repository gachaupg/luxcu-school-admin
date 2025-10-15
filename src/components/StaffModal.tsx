import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchRoles } from "../redux/slices/roleSlice";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
}

interface FormErrors {
  employee_id?: string;
  role?: string;
  user?: {
    phone_number?: string;
    password?: string;
    confirm_password?: string;
  };
}

export function StaffModal({ isOpen, onClose, onSubmit }: StaffModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { roles, loading: rolesLoading } = useSelector(
    (state: RootState) => state.roles
  );
  const [formData, setFormData] = useState({
    employee_id: "",
    role: "",
    status: "active",
    user: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      confirm_password: "",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRoles());
    }
  }, [isOpen, dispatch]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate employee_id
    if (!formData.employee_id) {
      newErrors.employee_id = "Employee ID is required";
    } else if (!/^EMP\d{3}$/.test(formData.employee_id)) {
      newErrors.employee_id = "Employee ID must be in format EMP001";
    }

    // Validate role
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Validate phone number
    if (!formData.user.phone_number) {
      newErrors.user = {
        ...newErrors.user,
        phone_number: "Phone number is required",
      };
    } else if (!/^\+254\d{9}$/.test(formData.user.phone_number)) {
      newErrors.user = {
        ...newErrors.user,
        phone_number: "Phone number must be in format +254XXXXXXXXX",
      };
    }

    // Validate password
    if (!formData.user.password) {
      newErrors.user = { ...newErrors.user, password: "Password is required" };
    } else if (formData.user.password.length < 8) {
      newErrors.user = {
        ...newErrors.user,
        password: "Password must be at least 8 characters long",
      };
    }

    // Validate confirm password
    if (formData.user.password !== formData.user.confirm_password) {
      newErrors.user = {
        ...newErrors.user,
        confirm_password: "Passwords do not match",
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Validation failed, show first error
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        if (typeof firstError === 'string') {
          toast({
            title: "Validation Error",
            description: firstError,
            variant: "destructive",
          });
        } else if (firstError && typeof firstError === 'object') {
          const firstNestedError = Object.values(firstError).find(error => error);
          if (firstNestedError) {
            toast({
              title: "Validation Error",
              description: firstNestedError,
              variant: "destructive",
            });
          }
        }
      }
      return;
    }

    try {
      await onSubmit({
        ...formData,
        role: parseInt(formData.role),
        school: 0, // This will be set by the parent component
      });
      
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      
      onClose();
    } catch (error) {
      // Error is handled by the parent component or Redux action
      // Modal stays open to allow user to fix the issue
      console.error("Staff submission error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("user.")) {
      const userField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setErrors((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: undefined,
        },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="EMP001"
                required
                className={errors.employee_id ? "border-red-500" : ""}
              />
              {errors.employee_id && (
                <p className="text-sm text-red-500">{errors.employee_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a role</option>
                {rolesLoading ? (
                  <option value="" disabled>
                    Loading roles...
                  </option>
                ) : (
                  Array.isArray(roles) &&
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="user.first_name"
                value={formData.user.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="user.last_name"
                value={formData.user.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="user.email"
              type="email"
              value={formData.user.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="user.phone_number"
              value={formData.user.phone_number}
              onChange={handleChange}
              placeholder="+254XXXXXXXXX"
              required
              className={errors.user?.phone_number ? "border-red-500" : ""}
            />
            {errors.user?.phone_number && (
              <p className="text-sm text-red-500">{errors.user.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="user.password"
                type={showPassword ? "text" : "password"}
                value={formData.user.password}
                onChange={handleChange}
                required
                className={errors.user?.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.user?.password && (
              <p className="text-sm text-red-500">{errors.user.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="user.confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.user.confirm_password}
                onChange={handleChange}
                required
                className={
                  errors.user?.confirm_password ? "border-red-500" : ""
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.user?.confirm_password && (
              <p className="text-sm text-red-500">
                {errors.user.confirm_password}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add Staff
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
