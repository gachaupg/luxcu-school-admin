import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadCSVTemplate } from "@/services/csvUploadService";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  preview?: Record<string, unknown>[];
  file?: File; // Store the original File object
}

interface MultipleUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  acceptedFileTypes: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onPreview?: (data: Record<string, unknown>[]) => void;
  templateDownloadUrl?: string;
  templateFileName?: string;
  validationSchema?: Record<string, unknown>;
  previewColumns?: string[];
  uploadType: "parents" | "drivers" | "students" | "teachers" | "vehicles" | "staffs";
}

export const MultipleUploadModal: React.FC<MultipleUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  acceptedFileTypes,
  maxFileSize = 10,
  maxFiles = 5,
  onUpload,
  onPreview,
  templateDownloadUrl,
  templateFileName,
  validationSchema,
  previewColumns,
  uploadType,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [allParsedData, setAllParsedData] = useState<Record<string, unknown>[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<{
    total: number;
    completed: number;
    failed: number;
    errors: string[];
  }>({ total: 0, completed: 0, failed: 0, errors: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Prevent multiple processing
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const validFiles = files.filter((file) => {
        // Check file type - support both MIME types and file extensions
        const fileExtension = file.name
          .toLowerCase()
          .substring(file.name.lastIndexOf("."));
        
        // For CSV files, be more lenient with MIME type detection
        const isCSV = fileExtension === ".csv" || 
                      file.type === "text/csv" || 
                      file.type === "application/vnd.ms-excel" ||
                      file.type === "application/csv" ||
                      file.type === "text/plain";
        
        const isValidType = acceptedFileTypes.some((acceptedType) => {
          // Check if it matches the file extension
          if (acceptedType.startsWith(".")) {
            // For CSV, be lenient
            if (acceptedType.toLowerCase() === ".csv" && isCSV) {
              return true;
            }
            return fileExtension === acceptedType.toLowerCase();
          }
          // Check if it matches the MIME type
          return file.type === acceptedType || isCSV;
        });

        if (!isValidType) {
          toast({
            title: "Invalid file type",
            description: `${
              file.name
            } is not a supported file type. Supported types: ${acceptedFileTypes.join(
              ", "
            )}. File extension: ${fileExtension}, MIME type: ${file.type || 'unknown'}`,
            variant: "destructive",
          });
          return false;
        }

        // Check file size
        const isValidSize = file.size <= maxFileSize * 1024 * 1024;
        if (!isValidSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the maximum file size of ${maxFileSize}MB.`,
            variant: "destructive",
          });
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setIsProcessing(false);
        return;
      }

      // Check if adding these files would exceed maxFiles
      if (uploadedFiles.length + validFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${maxFiles} files at once.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Add files to state and process them immediately
      for (const file of validFiles) {
        const fileId = Math.random().toString(36).substr(2, 9);

        // Add file to state
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "uploading",
          progress: 0,
          file: file, // Store the original File object
        };

        setUploadedFiles((prev) => [...prev, newFile]);

        // Process the file immediately
        await processFile(file, fileId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = async (file: File, fileId: string) => {
    // Check if file is already being processed
    if (processingFiles.has(fileId)) {
      return;
    }

    // Add to processing set
    setProcessingFiles((prev) => new Set(prev).add(fileId));

    try {
      // Update status to processing
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f))
      );

      // Quick progress update (no simulation loop)
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 50 } : f))
      );

      // Parse file based on type
      let parsedData: Record<string, string>[] = [];
      if (file.type === "text/csv") {
        parsedData = await parseCSV(file);
      } else if (file.type.includes("pdf")) {
        parsedData = await parsePDF(file);
      } else if (file.type.includes("word") || file.type.includes("document")) {
        parsedData = await parseWord(file);
      } else if (file.type === "text/html") {
        parsedData = await parseHTML(file);
      }

      // Validate data if schema provided
      if (validationSchema) {
        const validationResult = validateData(parsedData, validationSchema);
        if (!validationResult.isValid) {
          throw new Error(validationResult.errors.join(", "));
        }
      }

      // Update status to completed
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "completed", progress: 100, preview: parsedData }
            : f
        )
      );

      // Remove from processing set
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });

      toast({
        title: "File processed successfully",
        description: `${file.name} has been processed and is ready for upload.`,
      });
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "error", error: error.message } : f
        )
      );

      // Remove from processing set even on error
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });

      toast({
        title: "Processing failed",
        description: `Failed to process ${file.name}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Validate parsed data for required fields
  const validateParsedData = (
    data: Record<string, string>[]
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push("No data found in file");
      return { isValid: false, errors };
    }

    // Debug: Log upload type and first row columns
    console.log("Validating data for uploadType:", uploadType);
    if (data.length > 0) {
      console.log("Available columns:", Object.keys(data[0]));
      console.log("First row data:", data[0]);
    }

    // For vehicles and staff, skip frontend validation - let backend handle it
    if (uploadType === "vehicles" || uploadType === "staffs" || uploadType === "staff") {
      console.log("Skipping frontend validation for", uploadType);
      return { isValid: true, errors: [] };
    }

    data.forEach((row, index) => {
      const rowNumber = index + 1;

      // Check for name field (multiple variations)
      const hasName =
        row.name ||
        row["Name"] ||
        row["Full Name"] ||
        row["full_name"] ||
        row["Full_Name"] ||
        row["Parent"] ||
        row["parent"] ||
        row["Parent Name"] ||
        row["parent_name"] ||
        row["Parent_Name"] ||
        row.first_name ||
        row["First Name"] ||
        row["First_Name"] ||
        row.firstName ||
        row["FullName"] ||
        row["Full_Name"] ||
        row["ParentName"] ||
        row["Parent_Name"];

      // Check for phone field (multiple variations including contact)
      const hasPhone =
        row.phone_number ||
        row["Phone Number"] ||
        row["Phone_Number"] ||
        row["phone_number"] ||
        row.phone ||
        row["Phone"] ||
        row["phone"] ||
        row.mobile ||
        row["Mobile"] ||
        row["mobile"] ||
        row["Mobile Number"] ||
        row["mobile_number"] ||
        row["Mobile_Number"] ||
        row.phoneNumber ||
        row.contact ||
        row["Contact"] ||
        row["contact"] ||
        row.tel ||
        row["Tel"] ||
        row["tel"] ||
        row["PhoneNumber"] ||
        row["Phone_Number"] ||
        row["MobileNumber"] ||
        row["Mobile_Number"] ||
        row["ContactNumber"] ||
        row["Contact_Number"] ||
        // Check any field that might contain phone-like data
        Object.values(row).find((value) => {
          if (!value || typeof value !== "string") return false;
          const phonePattern = /^(\+?254|0)?[17]\d{8}$/;
          return phonePattern.test(value.replace(/\s+/g, ""));
        });

      // Check for date of birth field (for students)
      const hasDateOfBirth =
        row.date_of_birth ||
        row["Date of Birth"] ||
        row["Date_of_Birth"] ||
        row["date_of_birth"] ||
        row.dateOfBirth ||
        row["DateOfBirth"] ||
        row.dob ||
        row["DOB"] ||
        row["dob"];

      // Check for driver-specific fields
      const hasLicenseNumber =
        row.license_number ||
        row["License Number"] ||
        row["License_Number"] ||
        row.licenseNumber ||
        row["LicenseNumber"];

      const hasLicenseClass =
        row.license_class ||
        row["License Class"] ||
        row["License_Class"] ||
        row.licenseClass ||
        row["LicenseClass"];

      const hasLicenseExpiry =
        row.license_expiry ||
        row["License Expiry"] ||
        row["License_Expiry"] ||
        row.licenseExpiry ||
        row["LicenseExpiry"];

      const hasHealthCheck =
        row.last_health_check ||
        row["Last Health Check"] ||
        row["Last_Health_Check"] ||
        row.lastHealthCheck ||
        row["LastHealthCheck"];

      const hasBackgroundCheck =
        row.last_background_check ||
        row["Last Background Check"] ||
        row["Last_Background_Check"] ||
        row.lastBackgroundCheck ||
        row["LastBackgroundCheck"];

      // Debug: Log what we found for this row - removed for production

      // Only validate if the row has some data (not completely empty)
      const hasAnyData = Object.values(row).some(
        (value) => value && String(value).trim()
      );

      if (hasAnyData) {
        // Vehicle-specific validation
        if (uploadType === "vehicles") {
          // Check for vehicle-specific required fields
          const hasRegistrationNumber =
            row.registration_number ||
            row["Registration Number"] ||
            row["Registration_Number"] ||
            row.registrationNumber ||
            row["RegistrationNumber"];

          const hasVehicleType =
            row.vehicle_type ||
            row["Vehicle Type"] ||
            row["Vehicle_Type"] ||
            row.vehicleType ||
            row["VehicleType"];

          const hasCapacity =
            row.capacity ||
            row["Capacity"] ||
            row["capacity"];

          // Only add errors if critical fields are missing
          // Be lenient - backend will do the final validation
          if (!hasRegistrationNumber) {
            errors.push(`Row ${rowNumber}: Registration number is required`);
          }

          // Don't fail on missing vehicle type or capacity - backend will handle defaults
        } else if (uploadType === "staffs" || uploadType === "staff") {
          // Staff validation
          const hasEmployeeNumber =
            row.employee_number ||
            row["Employee Number"] ||
            row["Employee_Number"] ||
            row.employeeNumber;

          // Staff just needs basic name and phone like other user types
          if (!hasName) {
            errors.push(`Row ${rowNumber}: Name is required`);
          }

          if (!hasPhone) {
            errors.push(`Row ${rowNumber}: Phone number is required`);
          }
        } else {
          // Common validation for parents, drivers, students, teachers
          if (!hasName) {
            errors.push(`Row ${rowNumber}: Name is required`);
          }

          if (!hasPhone) {
            errors.push(`Row ${rowNumber}: Phone number is required`);
          }

          // Student-specific validation
          if (uploadType === "students") {
            if (!hasDateOfBirth) {
              errors.push(`Row ${rowNumber}: Date of birth is required for students (format: YYYY-MM-DD, e.g., 2015-05-15)`);
            } else {
              // Validate date format
              const dobValue = row.date_of_birth || row["Date of Birth"] || row["Date_of_Birth"] || row.dateOfBirth || row.dob || row["DOB"];
              if (dobValue) {
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!datePattern.test(String(dobValue).trim())) {
                  errors.push(`Row ${rowNumber}: Date of birth must be in YYYY-MM-DD format (e.g., 2015-05-15)`);
                }
              }
            }
          }

          // Driver-specific validation
          if (uploadType === "drivers") {
            // For drivers, all fields are required by the API, but we'll generate defaults
            // Only validate that we have the essential fields that we can't easily generate
            if (!hasLicenseNumber) {
              // License number not provided - will generate default
            }
            if (!hasLicenseClass) {
              // License class not provided - will use default "B"
            }
            if (!hasLicenseExpiry) {
              // License expiry not provided - will use default "2025-12-31"
            }
            if (!hasHealthCheck) {
              // Last health check not provided - will use default "2024-01-01"
            }
            if (!hasBackgroundCheck) {
              // Last background check not provided - will use default "2024-01-01"
            }
          }
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split("\n");

          // Parse headers with proper CSV handling
          const headerLine = lines[0];
          const headers = parseCSVLine(headerLine).map((h) => h.trim());

          // CSV Headers found - logging removed

          const data = lines.slice(1).map((line, lineIndex) => {
            const values = parseCSVLine(line);
            const row: any = {};
            headers.forEach((header, index) => {
              // Remove quotes and clean the value
              const cleanValue = (values[index] || "")
                .replace(/^["']|["']$/g, "")
                .trim();
              row[header] = cleanValue;
            });

            // Debug: Log first few rows - removed for production

            return row;
          });

          const filteredData = data.filter((row) =>
            Object.values(row).some((v) => v)
          );

          // Validate the parsed data
          const validation = validateParsedData(filteredData);
          if (!validation.isValid) {
            reject(
              new Error(
                `File validation failed: ${validation.errors.join(", ")}`
              )
            );
            return;
          }

          resolve(filteredData);
        } catch (error) {
          reject(new Error("Failed to parse CSV file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current);
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  };

  const parsePDF = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For now, we'll use a text-based approach since PDF parsing requires additional libraries
          // This is a simplified version that works with PDFs that contain structured text

          // Convert PDF to text (this is a simplified approach)
          // In a real implementation, you'd use a library like pdf-parse or pdfjs-dist
          const arrayBuffer = e.target?.result as ArrayBuffer;

          // For demonstration, we'll create a mock parsing that looks for patterns
          // In production, you should use a proper PDF parsing library
          const text = await extractTextFromPDF(arrayBuffer);

          // Parse the extracted text into structured data
          const data = parseTextToStructuredData(text);

          // Validate the parsed data
          const validation = validateParsedData(data);
          if (!validation.isValid) {
            reject(
              new Error(
                `File validation failed: ${validation.errors.join(", ")}`
              )
            );
            return;
          }

          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse PDF file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from PDF (basic implementation)
  const extractTextFromPDF = async (
    arrayBuffer: ArrayBuffer
  ): Promise<string> => {
    try {
      // Convert ArrayBuffer to Uint8Array for text processing
      const uint8Array = new Uint8Array(arrayBuffer);

      // Basic text extraction - look for readable text in the PDF
      // This is a simplified approach - in production use pdf-parse or pdfjs-dist
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(uint8Array);

      // Extract text content (this is a basic approach)
      // Look for patterns that might indicate table data
      const lines = text.split("\n").filter((line) => line.trim());

      // Try to find CSV-like patterns in the PDF text
      const csvLines = lines.filter(
        (line) =>
          line.includes(",") &&
          (line.includes("@") || line.includes("+254") || line.includes("07"))
      );

      if (csvLines.length > 0) {
        return csvLines.join("\n");
      }

      // If no CSV pattern found, return the raw text for pattern matching
      return text;
    } catch (error) {
      throw new Error("Failed to extract text from PDF");
    }
  };

  // Parse text to structured data
  const parseTextToStructuredData = (text: string): any[] => {
    try {
      // Split text into lines and filter out empty lines
      const lines = text.split("\n").filter((line) => line.trim());

      // Try to detect if it's CSV-like format (comma-separated)
      if (lines.length > 0 && lines[0].includes(",")) {
        return parseCSVFormat(lines);
      }

      // Try to detect if it's TSV-like format (tab-separated)
      if (lines.length > 0 && lines[0].includes("\t")) {
        return parseTSVFormat(lines);
      }

      // Try to detect if it's space-separated or other delimiters
      return parseFlexibleFormat(lines);
    } catch (error) {
      return [];
    }
  };

  // Parse CSV format
  const parseCSVFormat = (lines: string[]): any[] => {
    // Find the header row by looking for common column names
    const headerRowIndex = findHeaderRow(lines, ",");
    if (headerRowIndex === -1) {
      return [];
    }

    const headers = lines[headerRowIndex].split(",").map((h) => h.trim());

    const data = lines.slice(headerRowIndex + 1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    return data.filter((row) => Object.values(row).some((v) => v));
  };

  // Parse TSV format
  const parseTSVFormat = (lines: string[]): any[] => {
    // Find the header row by looking for common column names
    const headerRowIndex = findHeaderRow(lines, "\t");
    if (headerRowIndex === -1) {
      return [];
    }

    const headers = lines[headerRowIndex].split("\t").map((h) => h.trim());

    const data = lines.slice(headerRowIndex + 1).map((line) => {
      const values = line.split("\t").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    return data.filter((row) => Object.values(row).some((v) => v));
  };

  // Parse flexible format (space-separated or mixed delimiters)
  const parseFlexibleFormat = (lines: string[]): any[] => {
    // Try to find a header row first
    const headerRowIndex = findHeaderRowFlexible(lines);
    let dataLines = lines;

    if (headerRowIndex !== -1) {
      dataLines = lines.slice(headerRowIndex + 1);
    }

    const data: any[] = [];

    for (const line of dataLines) {
      if (line.trim()) {
        // Try to extract data using pattern matching
        const extractedData = extractDataFromTextLine(line);
        if (extractedData) {
          data.push(extractedData);
        }
      }
    }

    return data;
  };

  // Find header row in flexible format
  const findHeaderRowFlexible = (lines: string[]): number => {
    const nameKeywords = ["name", "full", "parent", "first", "last"];
    const phoneKeywords = ["phone", "mobile", "contact", "number", "tel"];
    const emailKeywords = ["email", "mail"];
    const addressKeywords = ["address", "location", "place"];

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].toLowerCase();

      // Check if line contains header keywords
      const hasName = nameKeywords.some((keyword) => line.includes(keyword));
      const hasPhone = phoneKeywords.some((keyword) => line.includes(keyword));
      const hasEmail = emailKeywords.some((keyword) => line.includes(keyword));
      const hasAddress = addressKeywords.some((keyword) =>
        line.includes(keyword)
      );

      // If we find at least 2 of the expected column types, this is likely a header
      const matchCount = [hasName, hasPhone, hasEmail, hasAddress].filter(
        Boolean
      ).length;
      if (matchCount >= 2) {
        return i;
      }
    }

    return -1;
  };

  // Find header row by looking for common column names
  const findHeaderRow = (lines: string[], delimiter: string): number => {
    const nameKeywords = ["name", "full", "parent", "first", "last"];
    const phoneKeywords = ["phone", "mobile", "contact", "number", "tel"];
    const emailKeywords = ["email", "mail"];
    const addressKeywords = ["address", "location", "place"];

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toLowerCase();
      const columns = line.split(delimiter).map((col) => col.trim());

      const hasName = columns.some((col) =>
        nameKeywords.some((keyword) => col.includes(keyword))
      );
      const hasPhone = columns.some((col) =>
        phoneKeywords.some((keyword) => col.includes(keyword))
      );
      const hasEmail = columns.some((col) =>
        emailKeywords.some((keyword) => col.includes(keyword))
      );
      const hasAddress = columns.some((col) =>
        addressKeywords.some((keyword) => col.includes(keyword))
      );

      // If we find at least 2 of the expected column types, this is likely a header
      const matchCount = [hasName, hasPhone, hasEmail, hasAddress].filter(
        Boolean
      ).length;
      if (matchCount >= 2) {
        return i;
      }
    }

    return -1;
  };

  // Extract data from a text line (fallback method)
  const extractDataFromTextLine = (line: string): any | null => {
    try {
      // This is a simplified pattern matching approach
      // In production, you might want to use more sophisticated NLP or regex patterns

      // Look for email pattern
      const emailMatch = line.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
      );
      const email = emailMatch ? emailMatch[0] : "";

      // Look for phone number pattern (Kenyan format) - more flexible
      const phoneMatch = line.match(/(\+254|0|254)?[17]\d{8}/);
      const phone = phoneMatch ? phoneMatch[0] : "";

      // Extract name (simplified - assumes name comes before email/phone)
      // Try to find name patterns
      let name = "";

      // Look for patterns like "FirstName LastName" before email/phone
      const nameBeforeEmail = email ? line.split(email)[0].trim() : line;
      const nameBeforePhone = phone ? line.split(phone)[0].trim() : line;

      // Use the longer name part (likely more complete)
      const potentialName =
        nameBeforeEmail.length > nameBeforePhone.length
          ? nameBeforeEmail
          : nameBeforePhone;

      // Clean up the name (remove extra characters but keep spaces and common punctuation)
      name = potentialName.replace(/[^\w\s\-\.]/g, " ").trim();

      // If no name found, try to extract from the beginning of the line
      if (!name) {
        const nameMatch = line.match(/^([^@\d]+)/);
        name = nameMatch ? nameMatch[1].trim() : "";
      }

      // Extract address (simplified - assumes it's after phone/email)
      let address = "";
      const addressMatch = line.match(/(Nairobi|Kenya|Address:?\s*)([^,]+)/i);
      if (addressMatch) {
        address = addressMatch[2].trim();
      } else {
        // Try to find address after email/phone
        const afterEmail = email ? line.split(email)[1] || "" : "";
        const afterPhone = phone ? line.split(phone)[1] || "" : "";
        const addressPart =
          afterEmail.length > afterPhone.length ? afterEmail : afterPhone;
        address = addressPart.replace(/[^\w\s,\.\-]/g, " ").trim();
      }

      // Only return data if we have at least a name or phone number
      if (name || email || phone) {
        const extractedData = {
          name: name,
          email: email,
          phone: phone,
          address: address,
          "Phone Number": phone,
          Email: email,
          Address: address,
        };

        return extractedData;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const parseWord = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For Word documents, we'll use a similar text-based approach
          // In production, you'd use a library like mammoth or docx

          const arrayBuffer = e.target?.result as ArrayBuffer;

          // Extract text from Word document
          const text = await extractTextFromWord(arrayBuffer);

          // Parse the extracted text into structured data
          const data = parseTextToStructuredData(text);

          // Validate the parsed data
          const validation = validateParsedData(data);
          if (!validation.isValid) {
            reject(
              new Error(
                `File validation failed: ${validation.errors.join(", ")}`
              )
            );
            return;
          }

          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse Word document"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from Word document (basic implementation)
  const extractTextFromWord = async (
    arrayBuffer: ArrayBuffer
  ): Promise<string> => {
    try {
      // Convert ArrayBuffer to Uint8Array for text processing
      const uint8Array = new Uint8Array(arrayBuffer);

      // Try multiple text decoding approaches
      let text = "";

      // Approach 1: Try UTF-8 decoding
      try {
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(uint8Array);
      } catch (error) {
        // UTF-8 decoding failed, trying other approaches
      }

      // Approach 2: If UTF-8 fails or produces no readable text, try other encodings
      if (!text || text.length < 100) {
        try {
          const decoder = new TextDecoder("latin1");
          text = decoder.decode(uint8Array);
        } catch (error) {
          // Latin1 decoding failed
        }
      }

      // Approach 3: Try to find readable text patterns
      if (!text || text.length < 100) {
        // Look for readable ASCII characters
        const readableChars = Array.from(uint8Array)
          .map((byte) =>
            byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : " "
          )
          .join("");

        // Extract continuous readable text blocks
        const textBlocks = readableChars.match(/[a-zA-Z0-9\s@.,+\-()]+/g) || [];
        text = textBlocks.join("\n");
      }

      // Split text into lines and filter out empty lines
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("No readable content found in Word document");
      }

      // Try to find CSV-like patterns in the Word text
      const csvLines = lines.filter(
        (line) =>
          line.includes(",") &&
          (line.includes("@") || line.includes("+254") || line.includes("07"))
      );

      if (csvLines.length > 0) {
        return csvLines.join("\n");
      }

      // If no CSV pattern found, return the raw text for pattern matching
      return text;
    } catch (error) {
      throw new Error("Failed to extract text from Word document");
    }
  };

  const parseHTML = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For HTML files, we'll use a text-based approach to extract tables
          // In production, you'd use a library like cheerio or html-table-parser

          const html = e.target?.result as string;

          // This is a simplified HTML parsing that looks for tables
          // In a real implementation, you'd use a library to parse HTML
          const data = parseHTMLTable(html);

          // Validate the parsed data
          const validation = validateParsedData(data);
          if (!validation.isValid) {
            reject(
              new Error(
                `File validation failed: ${validation.errors.join(", ")}`
              )
            );
            return;
          }

          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse HTML file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // This is a placeholder for actual HTML parsing logic
  const parseHTMLTable = (html: string): any[] => {
    try {
      // In a real application, you'd use a library like cheerio or html-table-parser
      // For now, we'll return a mock parsing that looks for a simple table structure
      // This should be replaced with actual HTML parsing logic

      // Example: Find a table with headers and data rows
      const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
      if (!tableMatch) {
        return [];
      }

      const tableHtml = tableMatch[1];
      const rows = tableHtml
        .split("</tr>")
        .filter((row) => row.includes("<tr>"));

      const headers: string[] = [];
      const data: any[] = [];

      for (const row of rows) {
        if (row.includes("<th>") || row.includes("<td>")) {
          const cells = row
            .split("<td>")
            .filter((cell) => cell.includes("<th>"));
          if (cells.length > 0) {
            headers.push(
              cells[0]
                .replace(/<th[^>]*>/, "")
                .replace(/<\/th>/, "")
                .trim()
            );
          }
        }
      }

      for (const row of rows) {
        if (row.includes("<td>") || row.includes("<th>")) {
          const cells = row
            .split("<td>")
            .filter((cell) => cell.includes("<th>"));
          if (cells.length > 0) {
            const rowData: any = {};
            for (let i = 0; i < headers.length; i++) {
              const cellContent = cells[i]
                .replace(/<td[^>]*>/, "")
                .replace(/<\/td>/, "")
                .trim();
              rowData[headers[i]] = cellContent;
            }
            data.push(rowData);
          }
        }
      }

      return data.filter((row) => Object.values(row).some((value) => value));
    } catch (error) {
      return [];
    }
  };

  const validateData = (data: any[], schema: any) => {
    const errors: string[] = [];
    // Basic validation - you can implement more sophisticated validation
    data.forEach((row, index) => {
      if (!row.name || !row.email) {
        errors.push(`Row ${index + 1}: Missing required fields`);
      }
    });
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Collect all parsed data from completed files
  const collectAllData = () => {
    const allData: any[] = [];
    uploadedFiles.forEach((file) => {
      if (file.status === "completed" && file.preview) {
        allData.push(...file.preview);
      }
    });
    return allData;
  };

  const handlePreview = () => {
    const data = collectAllData();
    if (data.length === 0) {
      toast({
        title: "No data to preview",
        description: "Please wait for files to finish processing.",
        variant: "destructive",
      });
      return;
    }
    setAllParsedData(data);
    setIsPreviewOpen(true);
  };

  const handleUpload = async () => {
    const completedFiles = uploadedFiles.filter(
      (f) => f.status === "completed"
    );
    if (completedFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please wait for files to finish processing.",
        variant: "destructive",
      });
      return;
    }

    // Get the actual File objects from the completed files
    const fileObjects: File[] = completedFiles
      .filter((f) => f.file) // Only include files that have the original File object
      .map((f) => f.file!);

    if (fileObjects.length === 0) {
      toast({
        title: "No files to upload",
        description: "No valid files found for upload.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress(0);
    setSubmissionStatus({
      total: fileObjects.length,
      completed: 0,
      failed: 0,
      errors: [],
    });

    // Starting submission of files

    try {
      // Call the onUpload function with all files
      await onUpload(fileObjects);

      // Show success message
      toast({
        title: "Upload completed successfully",
        description: `Successfully uploaded ${fileObjects.length} files.`,
      });

      // Reset and close
      setUploadedFiles([]);
      setIsSubmitting(false);
      setSubmissionProgress(0);
      setSubmissionStatus({ total: 0, completed: 0, failed: 0, errors: [] });
      onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "text/csv") return <FileSpreadsheet className="w-5 h-5" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5" />;
    if (type.includes("word") || type.includes("document"))
      return <File className="w-5 h-5" />;
    if (type === "text/html") return <FileText className="w-5 h-5" />; // HTML uses the same icon as text/csv
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      case "processing":
        return (
          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        );
      case "completed":
        return <Check className="w-4 h-4 text-[#f7c624]" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to get user-friendly column names based on upload type
  const getDisplayColumnNames = (headers: string[], uploadType: string) => {
    const columnMappings: { [key: string]: { [key: string]: string } } = {
      parents: {
        "First Name": "First Name",
        "first_name": "First Name",
        "school_id": "School ID",
        "Last Name": "Last Name",
        "last_name": "Last Name",
        "Full Name": "Full Name",
        Name: "Name",
        Email: "Email",
        email: "Email",
        "Phone Number": "Phone Number",
        "phone_number": "Phone Number",
        Phone: "Phone Number",
        Mobile: "Phone Number",
        Contact: "Phone Number",
        Address: "Address",
        address: "Address",
        "Emergency Contact": "Emergency Contact",
        "emergency_contact": "Emergency Contact",
        "Secondary Phone": "Secondary Phone",
        "secondary_phone": "Secondary Phone",
        "Preferred Contact Method": "Preferred Contact Method",
        "preferred_contact_method": "Preferred Contact Method",
        "Authorized Pickup Persons": "Authorized Pickup Persons",
        "authorized_pickup_persons": "Authorized Pickup Persons",
      },
      drivers: {
        "First Name": "First Name",
        "first_name": "First Name",
        "school_id": "School ID",
        "Last Name": "Last Name",
        "last_name": "Last Name",
        "Full Name": "Full Name",
        Name: "Name",
        Email: "Email",
        email: "Email",
        "Phone Number": "Phone Number",
        "phone_number": "Phone Number",
        Phone: "Phone Number",
        Mobile: "Phone Number",
        Contact: "Phone Number",
        "License Number": "License Number",
        "license_number": "License Number",
        "License Class": "License Class",
        "license_class": "License Class",
        "License Expiry": "License Expiry",
        "license_expiry": "License Expiry",
        "Last Health Check": "Last Health Check",
        "last_health_check": "Last Health Check",
        "Last Background Check": "Last Background Check",
        "last_background_check": "Last Background Check",
        "is_assistant_driver": "Is Assistant Driver",
      },
      vehicles: {
        "registration_number": "Registration Number",
        "school_id": "School ID",
        "vehicle_type": "Vehicle Type",
        "capacity": "Capacity",
        "model": "Model",
        "year": "Year",
        "fuel_type": "Fuel Type",
        "manufacturer": "Manufacturer",
        "is_active": "Is Active",
        "has_gps": "Has GPS",
        "has_camera": "Has Camera",
        "has_emergency_button": "Has Emergency Button",
        "driver_phone_number": "Driver Phone Number",
      },
      students: {
        "first_name": "First Name",
        "middle_name": "Middle Name",
        "last_name": "Last Name",
        "admission_number": "Admission Number",
        "school_id": "School ID",
        "grade": "Grade",
        "section": "Section",
        "gender": "Gender",
        "date_of_birth": "Date of Birth",
        "parent_name": "Parent Name",
        "parent_phone": "Parent Phone",
      },
      staffs: {
        "first_name": "First Name",
        "middle_name": "Middle Name",
        "last_name": "Last Name",
        "employee_number": "Employee Number",
        "school_id": "School ID",
        "gender": "Gender",
        "mobile_number": "Mobile Number",
        "email": "Email",
        "status": "Status",
        "role": "Role",
        "can_manage_routes": "Can Manage Routes",
        "can_manage_vehicles": "Can Manage Vehicles",
        "can_manage_staff": "Can Manage Staff",
        "can_manage_student_trips": "Can Manage Student Trips",
        "is_on_duty": "Is On Duty",
      },
    };

    const mapping = columnMappings[uploadType] || {};

    return headers.map((header) => {
      // First try exact match
      if (mapping[header]) {
        return mapping[header];
      }

      // Then try case-insensitive match
      const lowerHeader = header.toLowerCase();
      for (const [key, value] of Object.entries(mapping)) {
        if (key.toLowerCase() === lowerHeader) {
          return value;
        }
      }

      // If no match found, format the header nicely
      return header.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </DialogHeader>

        <div className="space-y-0">
          {/* File Upload Area */}
          <Card>
            <h2 className="text-lg font-bold mt-1 mb-1 ml-4">Upload Files</h2>
            <CardContent className="pt-0">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Supported formats: {acceptedFileTypes.join(", ")}
                  <br />
                  Maximum file size: {maxFileSize}MB
                  <br />
                  Maximum files: {maxFiles}
                  <br />
                  <span className="text-blue-600 font-medium">
                    💡 Download the template to see the required format
                  </span>
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose Files
                  </Button>
                  <Button
                    onClick={() => downloadCSVTemplate(uploadType)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedFileTypes.join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div className="flex items-center space-x-2">
                          {file.status === "completed" && file.preview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAllParsedData(file.preview || []);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Preview ({file.preview.length} records)
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {file.status === "uploading" ||
                      file.status === "processing" ? (
                        <Progress value={file.progress} className="w-24" />
                      ) : null}
                      {file.error && (
                        <p className="text-sm text-red-500">{file.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {uploadedFiles.some((f) => f.status === "completed") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ready to Upload</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Data Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Data Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Files:</span>
                        <span className="ml-2 font-medium">
                          {
                            uploadedFiles.filter(
                              (f) => f.status === "completed"
                            ).length
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Records:</span>
                        <span className="ml-2 font-medium">
                          {collectAllData().length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Progress */}
                  {isSubmitting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading records...</span>
                        <span>{Math.round(submissionProgress)}%</span>
                      </div>
                      <Progress value={submissionProgress} />
                      <div className="text-sm text-gray-600">
                        {submissionStatus.completed} completed,{" "}
                        {submissionStatus.failed} failed
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={handlePreview}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview All Data
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isSubmitting}
                      className="bg-[#f7c624] hover:bg-[#f7c624]/90"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload {collectAllData().length} Records
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Data Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] w-full overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle>Data Preview</DialogTitle>
            <DialogDescription>
              Preview of {allParsedData.length} records from uploaded files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex flex-col h-full">
            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
              <div className="overflow-auto h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      {allParsedData.length > 0 &&
                        (() => {
                          const headers = Object.keys(allParsedData[0]);
                          const displayHeaders = getDisplayColumnNames(
                            headers,
                            uploadType
                          );
                          return displayHeaders.map((displayHeader, index) => (
                            <TableHead
                              key={headers[index]}
                              className="whitespace-nowrap bg-white"
                            >
                              {displayHeader}
                            </TableHead>
                          ));
                        })()}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allParsedData.slice(0, 50).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className="max-w-[200px] truncate"
                          >
                            {String(value || "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {allParsedData.length > 50 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                  Showing first 50 records of {allParsedData.length} total
                  records
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleUpload();
                }}
                className="bg-[#f7c624] hover:bg-[#f7c624]/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload All Records
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
