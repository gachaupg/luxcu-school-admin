import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface AuthorizedPerson {
  name: string;
  relation: string;
  phone: string;
}

interface Parent {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  user_phone_number?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  school?: number;
  school_name?: string;
  school_longitude?: number;
  school_latitude?: number;
  preferred_contact_method?: string;
  secondary_phone?: string;
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_type: string;
    profile_image: string | null;
  };
  authorized_pickup_persons?: {
    persons: AuthorizedPerson[];
  };
  children?: unknown[];
}

interface ParentEditModalProps {
  parent: Parent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<Parent>) => Promise<void>;
}

export function ParentEditModal({
  parent,
  isOpen,
  onClose,
  onSave,
}: ParentEditModalProps) {
  const [formData, setFormData] = useState<Partial<Parent>>({});
  const [authorizedPersons, setAuthorizedPersons] = useState<
    AuthorizedPerson[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        address: parent.address || "",
        emergency_contact: parent.emergency_contact || "",
        preferred_contact_method: parent.preferred_contact_method || "email",
        secondary_phone: parent.secondary_phone || "",
        user_data: {
          first_name:
            parent.user_data?.first_name ||
            parent.user_full_name?.split(" ")[0] ||
            "",
          last_name:
            parent.user_data?.last_name ||
            parent.user_full_name?.split(" ").slice(1).join(" ") ||
            "",
          email: parent.user_data?.email || parent.user_email || "",
          phone_number:
            parent.user_data?.phone_number || parent.phone_number || "",
          user_type: parent.user_data?.user_type || "parent",
          profile_image: parent.user_data?.profile_image || null,
        },
        authorized_pickup_persons: parent.authorized_pickup_persons || {
          persons: [],
        },
      });
      // Safely set authorized persons with array checking
      const persons = parent.authorized_pickup_persons?.persons;
      if (persons && Array.isArray(persons)) {
        setAuthorizedPersons(persons);
      } else {
        setAuthorizedPersons([]);
      }
    }
  }, [parent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("user_data.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        user_data: {
          ...prev.user_data,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAuthorizedPerson = () => {
    setAuthorizedPersons([
      ...authorizedPersons,
      { name: "", relation: "", phone: "" },
    ]);
  };

  const removeAuthorizedPerson = (index: number) => {
    setAuthorizedPersons(authorizedPersons.filter((_, i) => i !== index));
  };

  const handleAuthorizedPersonChange = (
    index: number,
    field: keyof AuthorizedPerson,
    value: string
  ) => {
    const newPersons = [...authorizedPersons];
    newPersons[index] = { ...newPersons[index], [field]: value };
    setAuthorizedPersons(newPersons);
    setFormData((prev) => ({
      ...prev,
      authorized_pickup_persons: {
        persons: newPersons,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent?.id) return;

    setLoading(true);
    try {
      await onSave(parent.id, formData);
      onClose();
    } catch (error) {
      // Error updating parent
    } finally {
      setLoading(false);
    }
  };

  if (!parent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_data.first_name">First Name</Label>
              <Input
                id="user_data.first_name"
                name="user_data.first_name"
                value={formData.user_data?.first_name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_data.last_name">Last Name</Label>
              <Input
                id="user_data.last_name"
                name="user_data.last_name"
                value={formData.user_data?.last_name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_data.email">Email</Label>
              <Input
                id="user_data.email"
                name="user_data.email"
                type="email"
                value={formData.user_data?.email || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_data.phone_number">Phone Number</Label>
              <Input
                id="user_data.phone_number"
                name="user_data.phone_number"
                value={formData.user_data?.phone_number || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_phone">Secondary Phone</Label>
              <Input
                id="secondary_phone"
                name="secondary_phone"
                value={formData.secondary_phone || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_contact_method">
              Preferred Contact Method
            </Label>
            <Select
              value={formData.preferred_contact_method || "email"}
              onValueChange={(value) =>
                handleSelectChange("preferred_contact_method", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Authorized Pickup Persons</Label>
              <Button
                type="button"
                variant="outline"
                onClick={addAuthorizedPerson}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Person
              </Button>
            </div>
            {Array.isArray(authorizedPersons) &&
              authorizedPersons.map((person, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={person.name}
                      onChange={(e) =>
                        handleAuthorizedPersonChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relation</Label>
                    <Input
                      value={person.relation}
                      onChange={(e) =>
                        handleAuthorizedPersonChange(
                          index,
                          "relation",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        value={person.phone}
                        onChange={(e) =>
                          handleAuthorizedPersonChange(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                        required
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeAuthorizedPerson(index)}
                          className="px-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
