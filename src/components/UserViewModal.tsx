import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AllUser } from "@/services/allUsersService";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface UserViewModalProps {
  user: AllUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  const getStatusBadge = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getUserTypeBadge = (userType: string | null | undefined) => {
    if (!userType) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      );
    }
    
    const colors = {
      staff: "bg-blue-100 text-blue-800",
      student: "bg-purple-100 text-purple-800",
      parent: "bg-green-100 text-green-800",
      admin: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[userType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </Badge>
    );
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  const getTwoFactorBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge className="bg-blue-100 text-blue-800">
        <Shield className="w-3 h-3 mr-1" />
        Enabled
      </Badge>
    ) : (
      <Badge variant="outline">
        <AlertCircle className="w-3 h-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {user.first_name} {user.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg font-semibold">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Type</label>
                  <div className="mt-1">{getUserTypeBadge(user.user_type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.phone_number || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(user.is_active, user.is_deleted)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification</label>
                  <div className="mt-1">{getVerificationBadge(user.account_verified)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">2FA</label>
                  <div className="mt-1">{getTwoFactorBadge(user.two_factor_enabled)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School and Role Information */}
          {(user.school || user.role) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  School & Role Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.school && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">School</label>
                      <p className="font-semibold">{user.school.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.school.location}
                      </p>
                    </div>
                  )}
                  {user.role && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="font-semibold">{user.role.name}</p>
                      <p className="text-sm text-muted-foreground">{user.role.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Specific Information */}
          {(user.staff_profile || user.student_profile || user.parent_profile) && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                {user.staff_profile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Employee ID:</span>
                      <span>{user.staff_profile.employee_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant={user.staff_profile.status === "active" ? "default" : "secondary"}>
                        {user.staff_profile.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">On Duty:</span>
                      <Badge variant={user.staff_profile.is_on_duty ? "default" : "secondary"}>
                        {user.staff_profile.is_on_duty ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                )}

                {user.student_profile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Student ID:</span>
                      <span>{user.student_profile.student_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Grade:</span>
                      <span>{user.student_profile.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant={user.student_profile.status === "active" ? "default" : "secondary"}>
                        {user.student_profile.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {user.parent_profile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant={user.parent_profile.status === "active" ? "default" : "secondary"}>
                        {user.parent_profile.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Joined</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.date_joined).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                  </p>
                </div>
                {user.last_login_ip && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login IP</label>
                    <p className="font-mono text-sm">{user.last_login_ip}</p>
                  </div>
                )}
                {user.failed_login_attempts > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Failed Login Attempts</label>
                    <p className="text-red-600 font-semibold">{user.failed_login_attempts}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserViewModal;
