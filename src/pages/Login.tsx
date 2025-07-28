import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login, clearError } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { loading, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // If empty, return empty string
    if (!digits) return "";

    // If it starts with 0757, replace with +2527
    if (digits.startsWith("0757")) {
      return "+2527" + digits.slice(4);
    }

    // If it starts with 0, replace with +254
    if (digits.startsWith("0")) {
      return "+254" + digits.slice(1);
    }

    // If it starts with 254, add + prefix
    if (digits.startsWith("254")) {
      return "+" + digits;
    }

    // If it starts with 2527, add + prefix
    if (digits.startsWith("2527")) {
      return "+" + digits;
    }

    // If it's already 9 digits (Kenyan number without country code), add +254
    if (digits.length === 9) {
      return "+254" + digits;
    }

    // If it's already in international format with +, return as is
    if (value.startsWith("+")) {
      return value;
    }

    // Default: add +254 prefix
    return "+254" + digits;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow user to type freely without automatic formatting
    setPhoneNumber(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure phone number is properly formatted before sending
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid phone number",
      });
      return;
    }

    dispatch(login({ phone_number: formattedPhone, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access LuxCab Admin Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number (e.g., 0757198515 or 0757xxxxxx)"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                required
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Enter local format (e.g., 0757198515 or 0757xxxxxx) - will be
                converted automatically when you login
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* <p className="text-sm text-center text-gray-500">
            Only super admin access is allowed
          </p> */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
