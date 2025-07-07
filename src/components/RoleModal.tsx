import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { useEffect } from "react";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId?: number;
  onSubmit: (roleData: {
    name: string;
    description: string;
    school: number;
    permissions: string[];
    is_system_role: boolean;
    parent_role?: number;
  }) => void;
}

const availablePermissions = [
  "manage_staff",
  "manage_students",
  "manage_transport",
  "manage_security",
  "view_reports",
  "manage_finance",
  "manage_attendance",
  "manage_timetable",
  "manage_exams",
  "manage_parents",
  "manage_vehicles",
  "manage_routes",
  "manage_trips",
  "manage_grades",
  "manage_settings",
];

export function RoleModal({
  isOpen,
  onClose,
  schoolId,
  onSubmit,
}: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    school: schoolId || 1, // Default school ID
    permissions: [] as string[],
    is_system_role: false,
    parent_role: undefined as number | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  useEffect(() => {
    if (schoolId) {
      setFormData((prev) => ({ ...prev, school: schoolId }));
    }
  }, [schoolId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., school_admin"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter role description"
                required
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label
                      htmlFor={permission}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_system_role"
                checked={formData.is_system_role}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_system_role: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="is_system_role"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                System Role
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Create Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
