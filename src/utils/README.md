# Role Management System

This document describes the role management system implemented for the school admin application.

## Overview

The role management system allows administrators to create and manage different roles for staff members with specific permissions. The system is designed to work with the API endpoint at `https://api.eujimsolutions.com/api/staff/`.

## Role Structure

Each role follows this structure:

```typescript
interface Role {
  id: number;
  name: string;
  description: string;
  school: number;
  permissions: string[];
  is_system_role: boolean;
  parent_role?: number;
}
```

## Default Roles

The system includes several predefined roles:

### 1. School Admin Role

```json
{
  "name": "school_admin",
  "description": "Full administrative access for school management",
  "school": 1,
  "permissions": [
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
    "manage_settings"
  ],
  "is_system_role": false
}
```

### 2. Teacher Role

- Permissions: manage_students, view_reports, manage_attendance, manage_timetable, manage_exams, manage_grades

### 3. Driver Role

- Permissions: manage_transport, manage_trips, view_reports

### 4. Security Role

- Permissions: manage_security, view_reports

## Available Permissions

The system supports the following permissions:

- `manage_staff` - Manage staff members
- `manage_students` - Manage student records
- `manage_transport` - Manage transportation
- `manage_security` - Manage security settings
- `view_reports` - View system reports
- `manage_finance` - Manage financial records
- `manage_attendance` - Manage attendance records
- `manage_timetable` - Manage class timetables
- `manage_exams` - Manage exam schedules
- `manage_parents` - Manage parent accounts
- `manage_vehicles` - Manage school vehicles
- `manage_routes` - Manage transport routes
- `manage_trips` - Manage transport trips
- `manage_grades` - Manage student grades
- `manage_settings` - Manage system settings

## API Endpoints

### Get Roles

```
GET /api/schools-roles?school={schoolId}
```

### Create Role

```
POST /api/schools-roles/
```

### Update Role

```
PUT /api/schools-roles/{roleId}/
```

### Delete Role

```
DELETE /api/schools-roles/{roleId}/
```

## Usage

### Creating Default Roles

To create default roles for a school:

```typescript
import { createDefaultRoles } from "../redux/slices/roleSlice";

// In your component
const handleCreateDefaultRoles = async () => {
  const resultAction = await dispatch(createDefaultRoles(schoolId));
  if (createDefaultRoles.fulfilled.match(resultAction)) {
    console.log("Default roles created successfully");
  }
};
```

### Creating Custom Roles

To create a custom role:

```typescript
import { createRole } from "../redux/slices/roleSlice";

const roleData = {
  name: "custom_role",
  description: "Custom role description",
  school: schoolId,
  permissions: ["manage_students", "view_reports"],
  is_system_role: false,
};

const resultAction = await dispatch(createRole(roleData));
```

### Using the Role Service

```typescript
import { roleService } from "../services/roleService";

// Get all roles for a school
const roles = await roleService.getRoles(schoolId);

// Create a new role
const newRole = await roleService.createRole(roleData);

// Check if school admin role exists
const hasAdminRole = await roleService.checkSchoolAdminRole(schoolId);
```

## Components

### RoleModal

A modal component for creating and editing roles with permission selection.

### RoleTestComponent

A test component for verifying role creation functionality.

## Redux State

The role management uses Redux with the following state structure:

```typescript
interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
}
```

## Error Handling

The system includes comprehensive error handling for:

- API communication errors
- Validation errors
- Network timeouts
- Authentication failures

## Testing

Use the `RoleTestComponent` to test the role management functionality:

1. Import the component
2. Add it to your page
3. Use the test buttons to verify API integration

## Best Practices

1. Always validate role data before submission
2. Use the role service for API calls
3. Handle loading states appropriately
4. Provide user feedback for all operations
5. Log errors for debugging purposes
