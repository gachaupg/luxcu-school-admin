import { useState, useEffect } from "react";
import { Grade } from "../redux/slices/gradesSlice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gradeData: Omit<Grade, "id">) => void;
  schoolId?: number;
  editMode?: boolean;
  grade?: Grade | null;
}

export function GradeModal({
  isOpen,
  onClose,
  onSubmit,
  schoolId,
  editMode = false,
  grade,
}: GradeModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    school: schoolId || 0,
    description: "",
    capacity: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editMode && grade) {
      setFormData({
        name: grade.name || "",
        level: grade.level || "",
        school: grade.school || schoolId || 0,
        description: grade.description || "",
        capacity: grade.capacity || 30,
      });
    } else {
      setFormData({
        name: "",
        level: "",
        school: schoolId || 0,
        description: "",
        capacity: 30,
      });
    }
    setErrors({});
  }, [editMode, grade, schoolId, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Grade name is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show first validation error as toast
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: editMode ? "Grade updated successfully" : "Grade created successfully",
      });
      onClose();
    } catch (error) {
      // Error is handled by the parent component or Redux action
      // Modal stays open to allow user to fix the issue
      console.error("Grade submission error:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Grade" : "Add New Grade"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Grade Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Grade 1A"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleInputChange("level", value)}
              >
                <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the grade level..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Class Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="100"
              placeholder="30"
              value={formData.capacity}
              onChange={(e) =>
                handleInputChange("capacity", parseInt(e.target.value) || 0)
              }
              className={errors.capacity ? "border-red-500" : ""}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editMode ? "Update Grade" : "Create Grade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
