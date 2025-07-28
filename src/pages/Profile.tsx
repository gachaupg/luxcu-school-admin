import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  LogOut,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchProfile,
  updateProfile,
  logout,
} from "../redux/slices/profileSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { RootState } from "../redux/store";

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  user_type: string;
  phone_number: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, error } = useAppSelector((state) => state.profile);
  const { user, token } = useAppSelector((state) => state.auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    user_type: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        user_type: user.user_type || "",
      });
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedProfile = await dispatch(updateProfile(formData)).unwrap();
      setUserData(updatedProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      await axios.post(`${API_URL}/api/change-password/`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description:
          apiError.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchProfile())}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  {userData?.profile_image ? (
                    <img
                      src={userData.profile_image}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                    {userData?.first_name} {userData?.last_name}
                  </h3>
                  <p className="text-gray-600 capitalize">
                    {userData?.user_type}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Details</CardTitle>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        name="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        name="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Change Password</Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user_type">Role</Label>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <Input
                          id="user_type"
                          value={formData.user_type}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
