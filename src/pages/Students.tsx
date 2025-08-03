import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  createStudent,
  fetchStudents,
  updateStudent,
  deleteStudent,
  Student,
} from "../redux/slices/studentsSlice";
import {
  createGrade,
  fetchGrades,
  updateGrade,
  deleteGrade,
  Grade,
} from "../redux/slices/gradesSlice";
import { fetchParents } from "../redux/slices/parentsSlice";
import { fetchSchools } from "../redux/slices/schoolsSlice";
import { showToast } from "../utils/toast";
import { StudentModal } from "../components/StudentModal";
import { StudentViewModal } from "../components/StudentViewModal";
import { GradeModal } from "../components/GradeModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ExportDropdown } from "../components/ExportDropdown";
import { Skeleton } from "../components/ui/skeleton";

export default function Students() {
  const dispatch = useAppDispatch();
  const { students, loading, error } = useAppSelector(
    (state) => state.students
  );
  const {
    grades,
    loading: gradesLoading,
    error: gradesError,
  } = useAppSelector((state) => state.grades);
  const { schools } = useAppSelector((state) => state.schools);
  const { user } = useAppSelector((state) => state.auth);

  // Enhanced state management
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
    new Set()
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Student | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Active tab state
  const [activeTab, setActiveTab] = useState("students");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Grade modal states
  const [isCreateGradeModalOpen, setIsCreateGradeModalOpen] = useState(false);
  const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
  const [isDeleteGradeDialogOpen, setIsDeleteGradeDialogOpen] = useState(false);

  // Selected student for edit/delete operations
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentGradePage, setCurrentGradePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get school ID from localStorage or find it from schools - use useMemo to prevent unnecessary recalculations
  const schoolId = useMemo(() => {
    const storedSchoolId = localStorage.getItem("schoolId");
    if (storedSchoolId) {
      const parsedId = parseInt(storedSchoolId);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }

    // Fallback: find school by admin user
    if (schools.length > 0 && user?.id) {
      const school = schools.find((school) => school.admin === user.id);
      if (school?.id) {
        // Store the found school ID in localStorage for future use
        localStorage.setItem("schoolId", school.id.toString());
        return school.id;
      }
    }

    return undefined;
  }, [schools, user?.id]);

  useEffect(() => {
    // Always fetch schools first
    dispatch(fetchSchools()).catch((error) => {
      // The API interceptor should handle token expiration automatically
    });
  }, [dispatch]);

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchStudents({ schoolId }));
      dispatch(fetchParents({ schoolId }));
      dispatch(fetchGrades({ schoolId }));
    } else {
      // console.log("No schoolId available, skipping data fetch");
    }
  }, [dispatch, schoolId]);

  // Clean up delete dialog when selectedStudent changes
  useEffect(() => {
    if (!selectedStudent && isDeleteDialogOpen) {
      setIsDeleteDialogOpen(false);
    }
  }, [selectedStudent, isDeleteDialogOpen]);

  // Additional safety check - ensure selectedStudent is valid when dialogs are open
  useEffect(() => {
    if (isDeleteDialogOpen && (!selectedStudent || !selectedStudent.id)) {
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  }, [isDeleteDialogOpen, selectedStudent]);

  // Enhanced filtering and sorting logic
  const filteredStudents = useMemo(() => {
    const filtered = (students || []).filter((student) => {
      const matchesSearch =
        (student.first_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.last_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.admission_number?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.section?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.middle_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.transport_enabled) ||
        (statusFilter === "inactive" && !student.transport_enabled);

      const matchesGrade =
        gradeFilter === "all" || student.grade?.toString() === gradeFilter;
      const matchesGender =
        genderFilter === "all" || student.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGrade && matchesGender;
    });

    // Apply sorting
    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [
    students,
    searchTerm,
    statusFilter,
    gradeFilter,
    genderFilter,
    sortConfig,
  ]);

  // Filter grades based on search term
  const filteredGrades = (Array.isArray(grades) ? grades : []).filter(
    (grade) => {
      return (
        grade.name.toLowerCase().includes(gradeSearchTerm.toLowerCase()) ||
        grade.level.toLowerCase().includes(gradeSearchTerm.toLowerCase()) ||
        grade.description.toLowerCase().includes(gradeSearchTerm.toLowerCase())
      );
    }
  );

  // Pagination logic for students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination logic for grades
  const totalGradePages = Math.ceil(filteredGrades.length / itemsPerPage);
  const startGradeIndex = (currentGradePage - 1) * itemsPerPage;
  const endGradeIndex = startGradeIndex + itemsPerPage;
  const paginatedGrades = filteredGrades.slice(startGradeIndex, endGradeIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, gradeFilter, genderFilter]);

  useEffect(() => {
    setCurrentGradePage(1);
  }, [gradeSearchTerm]);

  // Enhanced utility functions
  const handleSort = useCallback((key: keyof Student) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map((s) => s.id!)));
    }
  }, [selectedStudents.size, paginatedStudents]);

  const handleSelectStudent = useCallback((studentId: number) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const handleBulkStatusToggle = useCallback(
    async (enabled: boolean) => {
      try {
        const promises = Array.from(selectedStudents).map((studentId) => {
          const student = students?.find((s) => s.id === studentId);
          if (student) {
            return dispatch(
              updateStudent({
                id: studentId,
                data: { transport_enabled: enabled },
              })
            ).unwrap();
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
        showToast.success(
          `Successfully ${
            enabled ? "activated" : "deactivated"
          } transport for ${selectedStudents.size} students`
        );
        setSelectedStudents(new Set());
      } catch (error) {
        showToast.error(`Failed to update transport status for students`);
      }
    },
    [selectedStudents, students, dispatch]
  );

  const handleBulkDelete = useCallback(async () => {
    try {
      const promises = Array.from(selectedStudents).map((studentId) =>
        dispatch(deleteStudent(studentId)).unwrap()
      );

      await Promise.all(promises);
      showToast.success(
        `Successfully deleted ${selectedStudents.size} students`
      );
      setSelectedStudents(new Set());
    } catch (error) {
      showToast.error(`Failed to delete some students`);
    }
  }, [selectedStudents, dispatch]);

  const handleCreateStudent = async (studentData: Omit<Student, "id">) => {
    try {
     

      await dispatch(createStudent(studentData)).unwrap();
      showToast.success("Student created successfully");
      setIsCreateModalOpen(false);

      // Ensure selectedStudent is reset to prevent any undefined access
      setSelectedStudent(null);

      // No need to refresh - Redux slice automatically updates the state
    } catch (error) {

      // Show the actual database error response
      let errorMessage = "Failed to create student";

      if (error instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(error.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      showToast.error("Error", errorMessage);
    }
  };

  const handleUpdateStudent = async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<Student>;
  }) => {
    try {
      await dispatch(updateStudent({ id, data })).unwrap();
      showToast.success("Student updated successfully");
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      // No need to refresh - Redux slice automatically updates the state
    } catch (error) {

      // Show the actual database error response
      let errorMessage = "Failed to update student";

      if (error instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(error.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      showToast.error("Error", errorMessage);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent?.id) {
      showToast.error("No student selected for deletion");
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      return;
    }

    try {
      await dispatch(deleteStudent(selectedStudent.id)).unwrap();
      showToast.success("Student deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      // No need to refresh - Redux slice automatically updates the state
    } catch (error) {

      // Show the actual database error response
      let errorMessage = "Failed to delete student";

      if (error instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(error.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      showToast.error("Error", errorMessage);
    }
  };

  const openEditModal = (student: Student) => {
    if (!student || !student.id) {
      showToast.error("Invalid student data");
      return;
    }
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const openViewModal = (student: Student) => {
    if (!student || !student.id) {
      showToast.error("Invalid student data");
      return;
    }
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    if (!student || !student.id) {
      showToast.error("Invalid student data");
      return;
    }
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (transportEnabled: boolean) => (
    <Badge
      variant={transportEnabled ? "default" : "secondary"}
      className={
        transportEnabled
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-red-100 text-red-800 hover:bg-red-100"
      }
    >
      {transportEnabled ? "Active" : "Inactive"}
    </Badge>
  );

  // Helper function to get grade name from grade ID
  const getGradeName = (gradeId: number | string) => {
    if (!gradeId) return "N/A";
    const grade = grades.find((g) => g.id === Number(gradeId));
    return grade ? grade.name : `Grade ${gradeId}`;
  };

  const handleCreateGrade = async (gradeData: Omit<Grade, "id">) => {
    try {
      await dispatch(createGrade(gradeData)).unwrap();
      showToast.success("Grade created successfully");
      setIsCreateGradeModalOpen(false);
      // Refresh grades list
      if (schoolId) {
        dispatch(fetchGrades({ schoolId }));
      }
    } catch (error) {
      showToast.error(error as string);
    }
  };

  const handleUpdateGrade = async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<Grade>;
  }) => {
    try {
      await dispatch(updateGrade({ id, data })).unwrap();
      showToast.success("Grade updated successfully");
      setIsEditGradeModalOpen(false);
      setSelectedGrade(null);
      // Refresh grades list
      if (schoolId) {
        dispatch(fetchGrades({ schoolId }));
      }
    } catch (error) {
      showToast.error(error as string);
    }
  };

  const handleDeleteGrade = async () => {
    if (!selectedGrade?.id) return;

    try {
      await dispatch(deleteGrade(selectedGrade.id)).unwrap();
      showToast.success("Grade deleted successfully");
      setIsDeleteGradeDialogOpen(false);
      setSelectedGrade(null);
    } catch (error) {
      showToast.error(error as string);
    }
  };

  const openEditGradeModal = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsEditGradeModalOpen(true);
  };

  const openDeleteGradeDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsDeleteGradeDialogOpen(true);
  };

  const handleEditGradeSubmit = async (gradeData: Omit<Grade, "id">) => {
    if (selectedGrade?.id) {
      await handleUpdateGrade({ id: selectedGrade.id, data: gradeData });
    }
  };

  // Show loading state while determining schoolId
  if (!schoolId && schools.length === 0) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-6 py-4 bg-background">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Initializing
                  </h3>
                  <p className="text-muted-foreground">
                    Setting up your school dashboard...
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // Show error state if no schoolId is available after schools are loaded
  if (!schoolId && schools.length > 0) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-6 py-4 bg-background">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    School Configuration Required
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    We couldn't determine which school you're managing. Please
                    contact your administrator to set up your school access.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="mt-4"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-1 sm:px-2 py-1 w-full max-w-[98vw] mx-auto">
          {/* Main Content Card */}
          <Card className="shadow-lg border-0 rounded-xl">
            <CardHeader className="pb-1 border-b border-border">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-500" />
                  Students List
                </CardTitle>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-all duration-200 ml-auto"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="students"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger
                    value="grades"
                    className="flex items-center gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Grades
                  </TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-3">
                  {/* Enhanced Search and Filter Bar */}
                  <div className="space-y-4">
                    {/* Main Search and Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search students by name, admission number, section, or middle name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center gap-2"
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (schoolId) {
                              dispatch(fetchStudents({ schoolId }));
                              dispatch(fetchParents({ schoolId }));
                              dispatch(fetchGrades({ schoolId }));
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                        <ExportDropdown
                          data={{
                            headers: [
                              "Name",
                              "Admission Number",
                              "Grade",
                              "Section",
                              "Gender",
                              "Transport Status",
                            ],
                            data: filteredStudents.map((student) => ({
                              name: `${student.first_name || ""} ${
                                student.middle_name || ""
                              } ${student.last_name || ""}`,
                              admission_number: student.admission_number || "",
                              grade: getGradeName(student.grade),
                              section: student.section || "",
                              gender: student.gender || "",
                              transport_status: student.transport_enabled
                                ? "Active"
                                : "Inactive",
                            })),
                            fileName: "students_export",
                            title: "Students Directory",
                          }}
                          className="border-border hover:bg-accent px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Status</Label>
                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">
                                Active Transport
                              </SelectItem>
                              <SelectItem value="inactive">
                                Inactive Transport
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Grade</Label>
                          <Select
                            value={gradeFilter}
                            onValueChange={setGradeFilter}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Grades</SelectItem>
                              {grades.map((grade) => (
                                <SelectItem
                                  key={grade.id}
                                  value={grade.id.toString()}
                                >
                                  {grade.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Gender</Label>
                          <Select
                            value={genderFilter}
                            onValueChange={setGenderFilter}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genders</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Per Page
                          </Label>
                          <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                              setItemsPerPage(Number(value));
                              setCurrentPage(1);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedStudents.size > 0 && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedStudents.size} student(s) selected
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkStatusToggle(true)}
                            className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-50"
                          >
                            <UserCheck className="h-4 w-4" />
                            Activate Transport
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkStatusToggle(false)}
                            className="flex items-center gap-2 text-orange-700 border-orange-300 hover:bg-orange-50"
                          >
                            <UserX className="h-4 w-4" />
                            Deactivate Transport
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 text-red-700 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Loading State */}
                  {loading && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-4 p-4 border rounded-lg"
                          >
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="text-center py-12">
                      <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Students
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        We encountered an issue while loading your students.
                        Please try again.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md max-w-md mx-auto">
                          {error}
                        </p>
                        <Button
                          onClick={() =>
                            schoolId && dispatch(fetchStudents({ schoolId }))
                          }
                          variant="outline"
                          className="mt-4"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Students Table */}
                  {!loading && !error && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedStudents.size ===
                                        paginatedStudents.length &&
                                      paginatedStudents.length > 0
                                    }
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                </div>
                              </th>
                              <th
                                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort("first_name")}
                              >
                                <div className="flex items-center gap-1">
                                  Student
                                  {sortConfig.key === "first_name" &&
                                    (sortConfig.direction === "asc" ? (
                                      <SortAsc className="h-4 w-4" />
                                    ) : (
                                      <SortDesc className="h-4 w-4" />
                                    ))}
                                </div>
                              </th>
                              <th
                                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort("admission_number")}
                              >
                                <div className="flex items-center gap-1">
                                  Admission #
                                  {sortConfig.key === "admission_number" &&
                                    (sortConfig.direction === "asc" ? (
                                      <SortAsc className="h-4 w-4" />
                                    ) : (
                                      <SortDesc className="h-4 w-4" />
                                    ))}
                                </div>
                              </th>
                              <th
                                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort("grade")}
                              >
                                <div className="flex items-center gap-1">
                                  Grade & Section
                                  {sortConfig.key === "grade" &&
                                    (sortConfig.direction === "asc" ? (
                                      <SortAsc className="h-4 w-4" />
                                    ) : (
                                      <SortDesc className="h-4 w-4" />
                                    ))}
                                </div>
                              </th>
                              <th
                                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort("gender")}
                              >
                                <div className="flex items-center gap-1">
                                  Gender
                                  {sortConfig.key === "gender" &&
                                    (sortConfig.direction === "asc" ? (
                                      <SortAsc className="h-4 w-4" />
                                    ) : (
                                      <SortDesc className="h-4 w-4" />
                                    ))}
                                </div>
                              </th>
                              <th
                                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort("transport_enabled")}
                              >
                                <div className="flex items-center gap-1">
                                  Status
                                  {sortConfig.key === "transport_enabled" &&
                                    (sortConfig.direction === "asc" ? (
                                      <SortAsc className="h-4 w-4" />
                                    ) : (
                                      <SortDesc className="h-4 w-4" />
                                    ))}
                                </div>
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paginatedStudents.map((student) => (
                              <tr
                                key={student.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-2 px-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.has(student.id!)}
                                    onChange={() =>
                                      handleSelectStudent(student.id!)
                                    }
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="ml-2">
                                      <p className="text-sm font-medium text-gray-900">
                                        {student.first_name || ""}{" "}
                                        {student.middle_name || ""}{" "}
                                        {student.last_name || ""}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        ID: {student.id || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {student.admission_number || "N/A"}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {getGradeName(student.grade)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Section {student.section || "N/A"}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-sm text-gray-900 capitalize">
                                    {student.gender || "N/A"}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  {getStatusBadge(student.transport_enabled)}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => openViewModal(student)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openEditModal(student)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Student
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          openDeleteDialog(student)
                                        }
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Student
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {paginatedStudents.length === 0 && (
                          <div className="text-center py-12">
                            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchTerm || statusFilter !== "all"
                                ? "No Students Found"
                                : "No Students Yet"}
                            </h3>
                            <p className="text-gray-600 mb-4 max-w-md mx-auto">
                              {searchTerm || statusFilter !== "all"
                                ? "No students match your current search or filter criteria. Try adjusting your search terms or filters."
                                : "Get started by adding your first student to the system."}
                            </p>
                            {!searchTerm && statusFilter === "all" && (
                              <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Student
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Pagination Controls - always show at the bottom */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-6 border-t border-gray-200 mt-0">
                        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, filteredStudents.length)} of{" "}
                          {filteredStudents.length} students
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {/* Improved pagination logic with ellipsis */}
                            {(() => {
                              const pages = [];
                              if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(i);
                                }
                              } else {
                                if (currentPage <= 3) {
                                  pages.push(1, 2, 3, 4, "...", totalPages);
                                } else if (currentPage >= totalPages - 2) {
                                  pages.push(
                                    1,
                                    "...",
                                    totalPages - 3,
                                    totalPages - 2,
                                    totalPages - 1,
                                    totalPages
                                  );
                                } else {
                                  pages.push(
                                    1,
                                    "...",
                                    currentPage - 1,
                                    currentPage,
                                    currentPage + 1,
                                    "...",
                                    totalPages
                                  );
                                }
                              }
                              return pages.map((page, idx) =>
                                page === "..." ? (
                                  <span
                                    key={"ellipsis-" + idx}
                                    className="px-2"
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setCurrentPage(Number(page))}
                                    className="w-8 h-8 p-0"
                                  >
                                    {page}
                                  </Button>
                                )
                              );
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <span className="ml-4 text-xs text-gray-500 hidden sm:inline">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="space-y-3">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search grades by name, level, or description..."
                        value={gradeSearchTerm}
                        onChange={(e) => setGradeSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Loading State */}
                  {gradesLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Loading Grades
                      </h3>
                      <p className="text-gray-600">
                        Please wait while we fetch your grade data...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {gradesError && (
                    <div className="text-center py-12">
                      <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Grades
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        We encountered an issue while loading your grades.
                        Please try again.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md max-w-md mx-auto">
                          {gradesError}
                        </p>
                        <Button
                          onClick={() =>
                            schoolId && dispatch(fetchGrades({ schoolId }))
                          }
                          variant="outline"
                          className="mt-4"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Grades Table */}
                  {!gradesLoading && !gradesError && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Grade
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Level
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Description
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Capacity
                            </th>
                            <th className="text-right py-2 px-3 font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedGrades.map((grade) => (
                            <tr
                              key={grade.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-2 px-3">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {grade.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ID: {grade.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <Badge variant="outline" className="text-xs">
                                  {grade.level}
                                </Badge>
                              </td>
                              <td className="py-2 px-3">
                                <p className="text-sm text-gray-900 max-w-xs truncate">
                                  {grade.description}
                                </p>
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {grade.capacity} students
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditGradeModal(grade)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Grade
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        openDeleteGradeDialog(grade)
                                      }
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Grade
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {paginatedGrades.length === 0 && (
                        <div className="text-center py-12">
                          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {gradeSearchTerm
                              ? "No Grades Found"
                              : "No Grades Yet"}
                          </h3>
                          <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            {gradeSearchTerm
                              ? "No grades match your current search criteria. Try adjusting your search terms."
                              : "Get started by adding your first grade to the system."}
                          </p>
                          {!gradeSearchTerm && (
                            <Button
                              onClick={() => setIsCreateGradeModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Grade
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Pagination Controls for Grades */}
                      {totalGradePages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Showing {startGradeIndex + 1}-
                            {Math.min(endGradeIndex, filteredGrades.length)} of{" "}
                            {filteredGrades.length} grades
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentGradePage(currentGradePage - 1)
                              }
                              disabled={currentGradePage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: totalGradePages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <Button
                                  key={page}
                                  variant={
                                    currentGradePage === page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentGradePage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentGradePage(currentGradePage + 1)
                              }
                              disabled={currentGradePage === totalGradePages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modals */}
      <StudentModal
        key="create"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStudent}
        schoolId={schoolId}
        editMode={false}
      />

      <StudentModal
        key={selectedStudent?.id || "create"} // Force re-render when student changes
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleUpdateStudent}
        schoolId={schoolId}
        editMode={true}
        student={selectedStudent}
      />

      <StudentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      {/* Delete Confirmation Dialog */}
      {selectedStudent && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                student "{selectedStudent.first_name || "Unknown"}{" "}
                {selectedStudent.last_name || ""}" and remove their data from
                our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
                disabled={!selectedStudent.id}
              >
                Delete Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <GradeModal
        isOpen={isCreateGradeModalOpen}
        onClose={() => setIsCreateGradeModalOpen(false)}
        onSubmit={handleCreateGrade}
        schoolId={schoolId}
        editMode={false}
      />

      <GradeModal
        isOpen={isEditGradeModalOpen}
        onClose={() => {
          setIsEditGradeModalOpen(false);
          setSelectedGrade(null);
        }}
        onSubmit={handleEditGradeSubmit}
        schoolId={schoolId}
        editMode={true}
        grade={selectedGrade}
      />

      <AlertDialog
        open={isDeleteGradeDialogOpen}
        onOpenChange={setIsDeleteGradeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              grade "{selectedGrade?.name || "Unknown"}" and remove its data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGrade}
              className="bg-red-600 hover:bg-red-700"
              disabled={!selectedGrade?.id}
            >
              Delete Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
