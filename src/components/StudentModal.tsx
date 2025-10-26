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
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Student } from "../redux/slices/studentsSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { fetchAllRouteStops } from "../redux/slices/routesSlice";
import { cn } from "@/lib/utils";
import { useModalErrorHandler } from "../hooks/useModalErrorHandler";

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
  const dispatch = useDispatch();
  const { handleModalSubmit, showValidationError } = useModalErrorHandler({
    onSuccess: onClose,
    successMessage: editMode ? "Student updated successfully" : "Student created successfully",
  });
  const { parents } = useSelector((state: RootState) => state.parents);
  const { grades } = useSelector((state: RootState) => state.grades);
  const { allRouteStops } = useSelector((state: RootState) => state.routes);
  const schoolId1 = localStorage.getItem("schoolId");
  const [parentsId, setParentsId] = useState(0);
  const [open, setOpen] = useState(false);
  const [routeStopOpen, setRouteStopOpen] = useState(false);
  const [routeStopSearchTerm, setRouteStopSearchTerm] = useState("");
  
  // Popover states for searchable selects
  const [gradePopoverOpen, setGradePopoverOpen] = useState(false);
  const [sectionPopoverOpen, setSectionPopoverOpen] = useState(false);
  const [genderPopoverOpen, setGenderPopoverOpen] = useState(false);
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
    route_stops: [],
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
        route_stops: student.route_stops || [],
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
        route_stops: [],
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

  // Fetch route stops when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      dispatch(fetchAllRouteStops(schoolId));
    }
  }, [isOpen, schoolId, dispatch]);

  // Filter route stops based on search term
  const filteredRouteStops = (allRouteStops || []).filter((stop) =>
    stop.name.toLowerCase().includes(routeStopSearchTerm.toLowerCase())
  );

  // Debug form data changes
  useEffect(() => {
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.first_name) {
      showValidationError("First name is required");
      return;
    }

    if (!formData.admission_number) {
      showValidationError("Admission number is required");
      return;
    }

    if (!formData.grade || formData.grade === 0) {
      if (filteredGrades.length === 0) {
        showValidationError("No grades are available for this school. Please add grades first in the Grades tab.");
      } else {
        showValidationError("Please select a grade");
      }
      return;
    }

    if (!formData.parent || formData.parent === 0) {
      showValidationError("Please select a parent");
      return;
    }

    if (!formData.route_stops || formData.route_stops.length === 0) {
      showValidationError("Please select a route stop");
      return;
    }

    // Use the modal error handler for consistent error handling
    await handleModalSubmit(async () => {
      if (editMode && student?.id) {
        await onSubmit({ id: student.id, data: formData });
      } else {
        await onSubmit(formData);
      }
    });
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
              <Label htmlFor="middle_name">Middle Name (Optional)</Label>
              <Input
                id="middle_name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name (Optional)</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
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
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0]}
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
                <PopoverContent className="w-[calc(100%-3rem)] p-0" align="start" side="bottom">
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
              <Popover open={gradePopoverOpen} onOpenChange={setGradePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={gradePopoverOpen}
                    className="w-full justify-between"
                    disabled={filteredGrades.length === 0}
                  >
                    {formData.grade
                      ? (() => {
                          const grade = filteredGrades.find((g) => g.id === formData.grade);
                          return grade ? `${grade.name} - ${grade.level}` : "Select grade";
                        })()
                      : filteredGrades.length > 0 ? "Select grade" : "No grades available"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100%-3rem)] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search grades..." />
                    <CommandList>
                      <CommandEmpty>
                        {filteredGrades.length === 0
                          ? "No grades available for this school"
                          : "No grade found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredGrades.map((grade) => (
                          <CommandItem
                            key={grade.id}
                            value={`${grade.name} ${grade.level}`}
                            onSelect={() => {
                              handleSelectChange("grade", grade.id?.toString() || "");
                              setGradePopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.grade === grade.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {grade.name} - {grade.level}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              <Popover open={sectionPopoverOpen} onOpenChange={setSectionPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sectionPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.section ? `Section ${formData.section}` : "Select section"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100%-3rem)] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search sections..." />
                    <CommandList>
                      <CommandEmpty>No section found.</CommandEmpty>
                      <CommandGroup>
                        {["A", "B", "C", "D"].map((section) => (
                          <CommandItem
                            key={section}
                            value={`Section ${section}`}
                            onSelect={() => {
                              handleSelectChange("section", section);
                              setSectionPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.section === section ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Section {section}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Popover open={genderPopoverOpen} onOpenChange={setGenderPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genderPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.gender 
                      ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
                      : "Select gender"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100%-3rem)] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search gender..." />
                    <CommandList>
                      <CommandEmpty>No gender found.</CommandEmpty>
                      <CommandGroup>
                        {[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" }
                        ].map((gender) => (
                          <CommandItem
                            key={gender.value}
                            value={gender.label}
                            onSelect={() => {
                              handleSelectChange("gender", gender.value);
                              setGenderPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.gender === gender.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {gender.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="route_stops">Route Stop *</Label>
            <Popover open={routeStopOpen} onOpenChange={setRouteStopOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={routeStopOpen}
                  className="w-full justify-between"
                >
                  {formData.route_stops && formData.route_stops.length > 0
                    ? filteredRouteStops.find((stop) => stop.id === formData.route_stops[0])?.name || "Unknown Stop"
                    : "Select route stop..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search route stops..." 
                    value={routeStopSearchTerm}
                    onValueChange={setRouteStopSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>No route stop found.</CommandEmpty>
                    <CommandGroup>
                      {filteredRouteStops.map((stop) => (
                        <CommandItem
                          key={stop.id}
                          value={`${stop.name} - Route ${stop.route}`}
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, route_stops: [stop.id || 0] }));
                            setRouteStopOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.route_stops.includes(stop.id || 0) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <MapPin className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{stop.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Route {stop.route} • {stop.is_pickup && stop.is_dropoff ? "Pickup & Dropoff" : stop.is_pickup ? "Pickup" : "Dropoff"}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {allRouteStops.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                ⚠️ No route stops are available for this school yet. Please add routes and route stops first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions (Optional)</Label>
            <Input
              id="medical_conditions"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="Enter any medical conditions or leave blank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport_enabled">Transport Status (Optional)</Label>
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
