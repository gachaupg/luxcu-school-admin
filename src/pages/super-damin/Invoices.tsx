import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchInvoices,
  updateInvoice,
  Invoice,
} from "@/redux/slices/invoicesSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Download,
  Send,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";
import {
  generateTablePDF,
  generateInvoicePDF,
  downloadPDF,
} from "@/utils/pdfGenerator";

const Invoices = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { invoices, loading, error } = useAppSelector(
    (state) => state.invoices
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Debug: Log invoice data structure
  useEffect(() => {
    if (invoices.length > 0) {
      
    }
  }, [invoices]);

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    // Refresh invoices after creating a new one
    dispatch(fetchInvoices());
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDownloadAllInvoices = () => {
    try {
      const headers = [
        "Invoice ID",
        "School",
        "Subscription Plan",
        "Amount Due",
        "Amount Paid",
        "Status",
        "Due Date",
        "Overdue",
        "Line Items",
      ];
      const rows = filteredInvoices.map((invoice) => [
        invoice.invoice_id || invoice.id || "N/A",
        invoice.school_name || `School ${invoice.school || "N/A"}`,
        invoice.subscription_plan || "N/A",
        formatCurrency(invoice.amount_due || "0", invoice.currency || "KES"),
        formatCurrency(invoice.amount_paid || "0", invoice.currency || "KES"),
        invoice.status || "N/A",
        invoice.due_date ? formatDate(invoice.due_date) : "N/A",
        invoice.is_overdue ? "Yes" : "No",
        `${invoice.line_items?.length || 0} items`,
      ]);

      const doc = generateTablePDF({
        headers,
        rows,
        title: "Invoices Report",
        subtitle: `Total Invoices: ${filteredInvoices.length}`,
      });

      downloadPDF(
        doc,
        `invoices-report-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast({
        title: "PDF Downloaded",
        description: "Invoices report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      const doc = generateInvoicePDF(invoice);
      downloadPDF(
        doc,
        `invoice-${invoice.id}-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast({
        title: "Invoice Downloaded",
        description: "Invoice PDF has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (invoice.currency?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    try {
      if (!amount || !currency) return "N/A";
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: currency,
      }).format(parseFloat(amount));
    } catch (error) {
      return "N/A";
    }
  };

  const handleProcessPayment = async (invoiceId: string) => {

    if (!invoiceId) {
      toast({
        title: "Error",
        description: "Invoice ID is missing. Cannot process payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        status: "paid" as const,
      };


      await dispatch(updateInvoice({ id: invoiceId, updateData })).unwrap();

      toast({
        title: "Payment Processed",
        description: "Invoice payment has been processed successfully.",
      });
    } catch (error) {
      // console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadAllInvoices}>
            <Download size={16} className="mr-2" />
            Export All
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FileText size={16} className="mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((i) => i.status === "paid").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((i) => i.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .reduce(
                    (sum, invoice) => sum + parseFloat(invoice.amount_due),
                    0
                  )
                  .toString(),
                "KES"
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter invoices by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            All invoices and their payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Invoices
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
              <p className="text-muted-foreground">
                {invoices.length === 0
                  ? "No invoices have been created yet."
                  : "No invoices match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Subscription Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Line Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const invoiceId =
                    invoice.id || invoice.invoice_id || invoice.uuid;

                  return (
                    <TableRow key={invoiceId || invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoiceId || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          Subscription: {invoice.subscription || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.school_name || `School ${invoice.school}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {invoice.school}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.subscription_plan || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {invoice.subscription}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(
                            invoice.amount_due || "0",
                            invoice.currency || "KES"
                          )}
                        </div>
                        {parseFloat(invoice.amount_paid || "0") > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Paid:{" "}
                            {formatCurrency(
                              invoice.amount_paid || "0",
                              invoice.currency || "KES"
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(invoice.status)}
                          {invoice.is_overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {invoice.due_date
                            ? formatDate(invoice.due_date)
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {invoice.line_items?.length || 0} items
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total:{" "}
                          {invoice.line_items?.reduce(
                            (sum, item) => sum + (item?.total || 0),
                            0
                          ) || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Invoice
                            </DropdownMenuItem>
                            {invoice.status === "pending" && invoiceId && (
                              <DropdownMenuItem
                                onClick={() => handleProcessPayment(invoiceId)}
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Process Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
      />
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
      />
    </div>
  );
};

export default Invoices;
