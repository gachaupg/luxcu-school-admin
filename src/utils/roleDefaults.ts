export interface DefaultRole {
  name: string;
  description: string;
  school: number;
  permissions: string[];
  is_system_role: boolean;
  parent_role?: number;
}

export const DEFAULT_SCHOOL_ADMIN_ROLE: DefaultRole = {
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

export const DEFAULT_TEACHER_ROLE: DefaultRole = {
  name: "teacher",
  description: "Teacher access for classroom management",
  school: 1,
  permissions: [
    "manage_students",
    "view_reports",
    "manage_attendance",
    "manage_timetable",
    "manage_exams",
    "manage_grades",
  ],
  is_system_role: false,
};

export const DEFAULT_DRIVER_ROLE: DefaultRole = {
  name: "driver",
  description: "Driver access for transport management",
  school: 1,
  permissions: ["manage_transport", "manage_trips", "view_reports"],
  is_system_role: false,
};

export const DEFAULT_SECURITY_ROLE: DefaultRole = {
  name: "security",
  description: "Security personnel access",
  school: 1,
  permissions: ["manage_security", "view_reports"],
  is_system_role: false,
};

export const getDefaultRoles = (schoolId: number): DefaultRole[] => {
  return [
    { ...DEFAULT_SCHOOL_ADMIN_ROLE, school: schoolId },
    { ...DEFAULT_TEACHER_ROLE, school: schoolId },
    { ...DEFAULT_DRIVER_ROLE, school: schoolId },
    { ...DEFAULT_SECURITY_ROLE, school: schoolId },
  ];
};
