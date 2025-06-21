import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
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
  const [itemsPerPage] = useState(10);

  // Get school ID from localStorage or find it from schools
  const getSchoolId = () => {
    const storedSchoolId = localStorage.getItem("schoolId");
    if (storedSchoolId) {
      return parseInt(storedSchoolId);
    }

    // Fallback: find school by admin user
    const school = schools.find((school) => school.admin === user?.id);
    return school?.id;
  };

  const schoolId = getSchoolId();

  useEffect(() => {
    // Always fetch schools first
    dispatch(fetchSchools());
  }, [dispatch]);

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchStudents({ schoolId }));
      dispatch(fetchParents({ schoolId }));
      dispatch(fetchGrades({ schoolId }));
    }
  }, [dispatch, schoolId]);

  // Clean up delete dialog when selectedStudent changes
  useEffect(() => {
    if (!selectedStudent && isDeleteDialogOpen) {
      setIsDeleteDialogOpen(false);
    }
  }, [selectedStudent, isDeleteDialogOpen]);

  // Filter students based on search term and status
  const filteredStudents = (students || []).filter((student) => {
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
      (student.section?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && student.transport_enabled) ||
      (statusFilter === "inactive" && !student.transport_enabled);

    return matchesSearch && matchesStatus;
  });

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
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentGradePage(1);
  }, [gradeSearchTerm]);

  const handleCreateStudent = async (studentData: Omit<Student, "id">) => {
    try {
      await dispatch(createStudent(studentData)).unwrap();
      showToast.success("Student created successfully");
      setIsCreateModalOpen(false);
      // Refresh students list
      if (schoolId) {
        dispatch(fetchStudents({ schoolId }));
      }
    } catch (error) {
      showToast.error(error as string);
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
      // Refresh students list
      if (schoolId) {
        dispatch(fetchStudents({ schoolId }));
      }
    } catch (error) {
      showToast.error(error as string);
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
      // Refresh students list
      if (schoolId) {
        dispatch(fetchStudents({ schoolId }));
      }
    } catch (error) {
      showToast.error(error as string);
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

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-6 py-4 bg-gray-50">
          {/* Main Content Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeTab === "students"
                      ? `Showing ${paginatedStudents.length} of ${
                          students?.length || 0
                        } students`
                      : `Showing ${paginatedGrades.length} of ${
                          grades?.length || 0
                        } grades`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "students" ? (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsCreateGradeModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Grade
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
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
                <TabsContent value="students" className="space-y-4">
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students by name, admission number, or section..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Transport</option>
                        <option value="inactive">Inactive Transport</option>
                      </select>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading students...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="text-center py-12">
                      <p className="text-red-500">Error: {error}</p>
                    </div>
                  )}

                  {/* Students Table */}
                  {!loading && !error && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Student
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Admission #
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Grade & Section
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Gender
                            </th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">
                              Status
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
                                    Grade {student.grade || "N/A"}
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
                                      onClick={() => openDeleteDialog(student)}
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
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No students found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Get started by adding your first student"}
                          </p>
                        </div>
                      )}

                      {/* Pagination Controls for Students */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1}-
                            {Math.min(endIndex, filteredStudents.length)} of{" "}
                            {filteredStudents.length} students
                          </div>
                          <div className="flex items-center gap-2">
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
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <Button
                                  key={page}
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
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
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading grades...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {gradesError && (
                    <div className="text-center py-12">
                      <p className="text-red-500">Error: {gradesError}</p>
                    </div>
                  )}

                  {/* Grades Table */}
                  {!gradesLoading && !gradesError && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
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
                          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No grades found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {gradeSearchTerm
                              ? "Try adjusting your search criteria"
                              : "Get started by adding your first grade"}
                          </p>
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStudent}
        schoolId={schoolId}
        editMode={false}
      />

      <StudentModal
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
                student "{selectedStudent?.first_name || "Unknown"}{" "}
                {selectedStudent?.last_name || ""}" and remove their data from
                our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
                disabled={!selectedStudent?.id}
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
