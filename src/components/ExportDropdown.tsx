import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ExportData {
  headers: string[];
  data: any[];
  fileName: string;
  title?: string;
}

interface ExportDropdownProps {
  data: ExportData;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  className = "",
  variant = "outline",
  size = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToExcel = () => {
    try {
      console.log("📊 Starting CSV export with data:", data);

      const csvContent = [
        data.headers.join(","),
        ...data.data.map((row, index) => {
          const rowData = data.headers
            .map((header) => {
              const value =
                row[header.toLowerCase().replace(/\s+/g, "_")] ||
                row[header] ||
                "";
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(",");

          // Debug: Log first few rows
          if (index < 3) {
            console.log(`📊 CSV Row ${index + 1}:`, rowData);
          }

          return rowData;
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${data.fileName}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Data exported to Excel (CSV) successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      console.log("📄 Starting PDF export with data:", data);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${data.title || "Report"}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; }
            .header { margin-bottom: 20px; }
            .date { color: #666; font-size: 14px; }
            .summary { margin: 20px 0; padding: 10px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || "Report"}</h1>
            <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Records: ${data.data.length}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                ${data.headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.data
                .map((row, index) => {
                  // Debug: Log first few rows
                  if (index < 3) {
                    console.log(`📄 PDF Row ${index + 1}:`, row);
                  }

                  return `
                <tr>
                  ${data.headers
                    .map((header) => {
                      const value =
                        row[header.toLowerCase().replace(/\s+/g, "_")] ||
                        row[header] ||
                        "";
                      return `<td>${String(value)}</td>`;
                    })
                    .join("")}
                </tr>
              `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], {
        type: "text/html;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${data.fileName}_${new Date().toISOString().split("T")[0]}.html`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description:
          "Report exported to HTML (can be opened in browser and saved as PDF)",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const exportToWord = () => {
    try {
      console.log("📝 Starting Word export with data:", data);

      const wordContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${data.title || "Report"}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h1 { color: #000; text-align: center; }
            .header { margin-bottom: 20px; text-align: center; }
            .date { color: #666; font-size: 14px; text-align: center; }
            .summary { margin: 20px 0; padding: 10px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || "Report"}</h1>
            <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Records: ${data.data.length}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                ${data.headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.data
                .map((row, index) => {
                  // Debug: Log first few rows
                  if (index < 3) {
                    console.log(`📝 Word Row ${index + 1}:`, row);
                  }

                  return `
                <tr>
                  ${data.headers
                    .map((header) => {
                      const value =
                        row[header.toLowerCase().replace(/\s+/g, "_")] ||
                        row[header] ||
                        "";
                      return `<td>${String(value)}</td>`;
                    })
                    .join("")}
                </tr>
              `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([wordContent], {
        type: "application/msword;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${data.fileName}_${new Date().toISOString().split("T")[0]}.doc`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Report exported to Word document successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            exportToExcel();
            setIsOpen(false);
          }}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            exportToPDF();
            setIsOpen(false);
          }}
        >
          <FileText className="h-4 w-4" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            exportToWord();
            setIsOpen(false);
          }}
        >
          <File className="h-4 w-4" />
          Export to Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
