import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { roleService } from "@/services/roleService";
import { showToast } from "@/utils/toast";

export function RoleTestComponent() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testCreateSchoolAdminRole = async () => {
    setLoading(true);
    try {
      addTestResult("Testing school admin role creation...");

      const roleData = {
        name: "school_admin",
        description: "Full administrative access for school management",
        school: 1,
        permissions: [
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
        ],
        is_system_role: false,
      };

      const result = await roleService.createRole(roleData);
      addTestResult(
        `✅ School admin role created successfully: ${result.name}`
      );
      showToast.success(
        "Test Success",
        "School admin role created successfully"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult(`❌ Failed to create school admin role: ${errorMessage}`);
      showToast.error("Test Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testGetRoles = async () => {
    setLoading(true);
    try {
      addTestResult("Testing get roles...");
      const roles = await roleService.getRoles(1);
      addTestResult(`✅ Retrieved ${roles.length} roles successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult(`❌ Failed to get roles: ${errorMessage}`);
      showToast.error("Test Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testCheckSchoolAdminRole = async () => {
    setLoading(true);
    try {
      addTestResult("Testing school admin role check...");
      const exists = await roleService.checkSchoolAdminRole(1);
      addTestResult(`✅ School admin role exists: ${exists}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult(`❌ Failed to check school admin role: ${errorMessage}`);
      showToast.error("Test Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Role API Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testCreateSchoolAdminRole}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600"
          >
            Test Create School Admin Role
          </Button>
          <Button
            onClick={testGetRoles}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Test Get Roles
          </Button>
          <Button
            onClick={testCheckSchoolAdminRole}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Test Check School Admin Role
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-2">Test Results:</h4>
          {testResults.length === 0 ? (
            <p className="text-gray-500">
              No test results yet. Run a test to see results.
            </p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
