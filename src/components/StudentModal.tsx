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
import { Student } from "../redux/slices/studentsSlice";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Student, "id"> | { id: number; data: Partial<Student> }
  ) => void;
  schoolId?: number;
  editMode?: boolean;
  student?: Student | null;
}

export function StudentModal({
  isOpen,
  onClose,
  onSubmit,
  schoolId,
  editMode = false,
  student = null,
}: StudentModalProps) {
  console.log(
    "StudentModal render - isOpen:",
    isOpen,
    "editMode:",
    editMode,
    "student:",
    student
  );
  const { parents } = useSelector((state: RootState) => state.parents);
  const schoolId1 = localStorage.getItem("schoolId");
  const [parentsId, setParentsId] = useState(0);
  const filteredParents = (parents || []).filter(
    (parent) => parent.school === Number(schoolId)
  );

  console.log(schoolId1);
  console.log(parentsId);

  const [formData, setFormData] = useState<Omit<Student, "id">>({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    school: Number(schoolId1) || 0,
    parent: 0,
    admission_number: "",
    grade: 0,
    gender: "",
    section: "",
    medical_conditions: "",
    emergency_contacts: [{ name: "", phone: "" }],
    transport_enabled: true,
  });

  // Initialize form data when editing
  useEffect(() => {
    console.log(
      "Form data initialization effect - editMode:",
      editMode,
      "student:",
      student
    );
    if (editMode && student) {
      console.log("Initializing form with student data:", student);
      const newFormData = {
        first_name: student.first_name || "",
        middle_name: student.middle_name || "",
        last_name: student.last_name || "",
        date_of_birth: student.date_of_birth || "",
        school: student.school || Number(schoolId1) || 0,
        parent: student.parent || 0,
        admission_number: student.admission_number || "",
        grade: student.grade || 0,
        gender: student.gender || "",
        section: student.section || "",
        medical_conditions: student.medical_conditions || "",
        emergency_contacts: student.emergency_contacts || [
          { name: "", phone: "" },
        ],
        transport_enabled: student.transport_enabled ?? true,
      };
      console.log("Setting form data to:", newFormData);
      setFormData(newFormData);
      setParentsId(student.parent || 0);
    } else {
      // Reset form for create mode
      const resetFormData = {
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        school: Number(schoolId1) || 0,
        parent: 0,
        admission_number: "",
        grade: 0,
        gender: "",
        section: "",
        medical_conditions: "",
        emergency_contacts: [{ name: "", phone: "" }],
        transport_enabled: true,
      };
      console.log("Resetting form data to:", resetFormData);
      setFormData(resetFormData);
      setParentsId(0);
    }
  }, [editMode, student, schoolId1]);

  // Update parent when parentsId changes
  useEffect(() => {
    if (parentsId > 0) {
      setFormData((prev) => ({ ...prev, parent: parentsId }));
    }
  }, [parentsId]);

  // Debug form data changes
  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    console.log("Edit mode:", editMode);
    console.log("Student ID:", student?.id);
    console.log("Grade type:", typeof formData.grade, "Value:", formData.grade);
    console.log(
      "Parent type:",
      typeof formData.parent,
      "Value:",
      formData.parent
    );

    // Basic validation
    if (!formData.first_name || !formData.last_name) {
      alert("First name and last name are required");
      return;
    }

    if (!formData.admission_number) {
      alert("Admission number is required");
      return;
    }

    if (!formData.grade || formData.grade === 0) {
      alert("Please select a grade");
      return;
    }

    if (!formData.parent || formData.parent === 0) {
      alert("Please select a parent");
      return;
    }

    if (editMode && student?.id) {
      console.log("Submitting update for student ID:", student.id);
      onSubmit({ id: student.id, data: formData });
    } else {
      console.log("Submitting create request");
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(
      `handleSelectChange - name: ${name}, value: ${value}, type: ${typeof value}`
    );
    const convertedValue =
      name === "grade" || name === "parent" ? Number(value) : value;
    console.log(
      `Converted value: ${convertedValue}, type: ${typeof convertedValue}`
    );
    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue,
    }));
  };

  const handleEmergencyContactChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newContacts = [...prev.emergency_contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, emergency_contacts: newContacts };
    });
  };

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: "", phone: "" }],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admission_number">Admission Number</Label>
              <Input
                id="admission_number"
                name="admission_number"
                value={formData.admission_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent">Parent</Label>
              <Select
                value={formData.parent ? formData.parent.toString() : ""}
                onValueChange={(value) => {
                  const parentId = Number(value);
                  setParentsId(parentId);
                  handleSelectChange("parent", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {filteredParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.user_full_name ||
                        `${parent.user_data?.first_name || ""} ${
                          parent.user_data?.last_name || ""
                        }`.trim() ||
                        "Unknown Parent"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade ? formData.grade.toString() : ""}
                onValueChange={(value) => handleSelectChange("grade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={formData.section || ""}
                onValueChange={(value) => handleSelectChange("section", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Input
              id="medical_conditions"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="Enter any medical conditions or 'None'"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport_enabled">Transport Status</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transport_enabled"
                name="transport_enabled"
                checked={formData.transport_enabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transport_enabled: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <Label htmlFor="transport_enabled" className="text-sm">
                Enable transport for this student
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Contacts</Label>
            {formData.emergency_contacts.map((contact, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Contact Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, "phone", e.target.value)
                  }
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addEmergencyContact}
              className="mt-2"
            >
              Add Emergency Contact
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editMode ? "Update Student" : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
