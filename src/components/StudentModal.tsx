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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Student } from "../redux/slices/studentsSlice";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { cn } from "@/lib/utils";

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

  const { parents } = useSelector((state: RootState) => state.parents);
  const { grades } = useSelector((state: RootState) => state.grades);
  const schoolId1 = localStorage.getItem("schoolId");
  const [parentsId, setParentsId] = useState(0);
  const [open, setOpen] = useState(false);
  const filteredParents = (parents || []).filter(
    (parent) => parent.school === Number(schoolId)
  );
  const filteredGrades = (grades || []).filter(
    (grade) => grade.school === Number(schoolId)
  );

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

    if (editMode && student) {
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
    // console.log("Form data changed:", formData);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   

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
      if (filteredGrades.length === 0) {
        alert(
          "No grades are available for this school. Please add grades first in the Grades tab."
        );
      } else {
        alert("Please select a grade");
      }
      return;
    }

    if (!formData.parent || formData.parent === 0) {
      alert("Please select a parent");
      return;
    }

    if (editMode && student?.id) {
      // console.log("Submitting update for student ID:", student.id);
      onSubmit({ id: student.id, data: formData });
    } else {
      // console.log("Submitting create request");
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // Log data: handleSelectChange - name, value, type
    const convertedValue =
      name === "grade" || name === "parent" ? Number(value) : value;
   
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.parent
                      ? filteredParents.find((parent) => parent.id === formData.parent)?.user_full_name || "Unknown Parent"
                      : "Select parent..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search parent..." />
                    <CommandList>
                      <CommandEmpty>No parent found.</CommandEmpty>
                      <CommandGroup>
                        {filteredParents.map((parent) => (
                          <CommandItem
                            key={parent.id}
                            value={`${parent.user_full_name || "Unknown Parent"} ${parent.user_phone_number || parent.phone_number || parent.user_data?.phone_number || ""}`}
                            onSelect={() => {
                              setParentsId(parent.id);
                              handleSelectChange("parent", parent.id.toString());
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.parent === parent.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {parent.user_full_name || "Unknown Parent"} -{" "}
                            {parent.user_phone_number ||
                              parent.phone_number ||
                              parent.user_data?.phone_number ||
                              "No phone"}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade ? formData.grade.toString() : ""}
                onValueChange={(value) => handleSelectChange("grade", value)}
                disabled={filteredGrades.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      filteredGrades.length > 0
                        ? "Select grade"
                        : "No grades available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((grade) => (
                      <SelectItem
                        key={grade.id}
                        value={grade.id?.toString() || ""}
                      >
                        {grade.name} - {grade.level}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No grades available for this school
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {filteredGrades.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                  ⚠️ No grades have been created for this school yet. Please add
                  grades first in the Grades tab.
                </p>
              )}
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
