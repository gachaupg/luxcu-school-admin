import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Users } from "lucide-react";

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
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  school?: number;
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
}

interface ParentViewModalProps {
  parent: Parent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ParentViewModal({
  parent,
  isOpen,
  onClose,
}: ParentViewModalProps) {
  if (!parent) return null;

  const getContactMethodBadge = (method: string) => {
    const variants = {
      email: "bg-blue-100 text-blue-800",
      phone: "bg-green-100 text-green-800",
      sms: "bg-purple-100 text-purple-800",
    };
    return (
      variants[method as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Parent Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  First Name
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.user_data?.first_name ||
                    parent.user_full_name?.split(" ")[0] ||
                    "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Last Name
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.user_data?.last_name ||
                    parent.user_full_name?.split(" ").slice(1).join(" ") ||
                    "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Address
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.user_data?.email || parent.user_email || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.user_data?.phone_number || parent.phone_number || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Secondary Phone
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.secondary_phone || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Emergency Contact
                </Label>
                <p className="mt-1 text-gray-900">
                  {parent.emergency_contact || "-"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-600">
                Preferred Contact Method
              </Label>
              <div className="mt-1">
                <Badge
                  className={getContactMethodBadge(
                    parent.preferred_contact_method || "email"
                  )}
                >
                  {parent.preferred_contact_method || "email"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h3>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Home Address
              </Label>
              <p className="mt-1 text-gray-900">{parent.address || "-"}</p>
            </div>
          </div>

          <Separator />

          {/* Authorized Pickup Persons */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Authorized Pickup Persons
            </h3>
            {parent.authorized_pickup_persons?.persons &&
            parent.authorized_pickup_persons.persons.length > 0 ? (
              <div className="space-y-3">
                {parent.authorized_pickup_persons.persons.map(
                  (person, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            Name
                          </Label>
                          <p className="mt-1 text-gray-900">
                            {person.name || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            Relation
                          </Label>
                          <p className="mt-1 text-gray-900">
                            {person.relation || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            Phone
                          </Label>
                          <p className="mt-1 text-gray-900">
                            {person.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No authorized pickup persons listed
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
