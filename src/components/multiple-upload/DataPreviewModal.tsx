import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertTriangle } from "lucide-react";

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  title?: string;
  columns?: string[];
  validationErrors?: { [key: number]: string[] };
}

export const DataPreviewModal: React.FC<DataPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  title = "Data Preview",
  columns,
  validationErrors = {},
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Get columns from data if not provided
  const tableColumns = columns || Object.keys(data[0] || {});

  const getValidationStatus = (rowIndex: number) => {
    const errors = validationErrors[rowIndex];
    if (!errors || errors.length === 0) {
      return {
        status: "valid",
        icon: <Check className="w-4 h-4 text-[#f7c624]" />,
      };
    }
    return { status: "error", icon: <X className="w-4 h-4 text-red-500" /> };
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Empty</span>;
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <p className="text-gray-600">
            Preview of {data.length} records from uploaded file
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valid Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f7c624]">
                  {data.length - Object.keys(validationErrors).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Records with Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {Object.keys(validationErrors).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                      {tableColumns.map((column) => (
                        <TableHead key={column} className="min-w-[150px]">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => {
                      const validation = getValidationStatus(index);
                      const errors = validationErrors[index] || [];

                      return (
                        <TableRow
                          key={index}
                          className={
                            validation.status === "error"
                              ? "bg-red-50 border-red-200"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {validation.icon}
                              {validation.status === "error" && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {errors.length} error
                                  {errors.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          {tableColumns.map((column) => (
                            <TableCell key={column}>
                              {formatCellValue(row[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(validationErrors).map(
                    ([rowIndex, errors]) => (
                      <div
                        key={rowIndex}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <h4 className="font-medium text-red-800 mb-2">
                          Row {parseInt(rowIndex) + 1}:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, errorIndex) => (
                            <li
                              key={errorIndex}
                              className="text-sm text-red-700"
                            >
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {Object.keys(validationErrors).length === 0 && (
              <Button>Continue with Upload</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
