import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from "@/redux/slices/invoicesSlice";
import {
  FileText,
  Download,
  Send,
  CreditCard,
  Calendar,
  Building2,
} from "lucide-react";
import { generateInvoicePDF, downloadPDF } from "@/utils/pdfGenerator";

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!invoice) return null;

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

  const totalAmount =
    invoice.line_items?.reduce((sum, item) => sum + (item?.total || 0), 0) || 0;

  const handleDownloadPDF = () => {
    try {
      const doc = generateInvoicePDF(invoice);
      downloadPDF(
        doc,
        `invoice-${invoice.id}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of invoice {invoice.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Invoice Information</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice ID:</span>
                    <span className="font-medium">
                      {invoice.invoice_id || invoice.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(invoice.status)}
                      {invoice.is_overdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium">
                      {invoice.school_name || `School ${invoice.school}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subscription Plan:
                    </span>
                    <span className="font-medium">
                      {invoice.subscription_plan || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span className="font-medium">
                      {formatDate(invoice.invoice_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                  {invoice.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span className="font-medium">
                        {formatDate(invoice.paid_at)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{invoice.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Due:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amount_due, invoice.currency)}
                    </span>
                  </div>
                  {parseFloat(invoice.amount_paid || "0") > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Amount Paid:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(invoice.amount_paid, invoice.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">School Information</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School ID:</span>
                    <span className="font-medium">{invoice.school}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscription:</span>
                    <span className="font-medium">{invoice.subscription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Due:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amount_due, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.line_items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {formatCurrency(
                        item.unit_price.toString(),
                        invoice.currency
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total.toString(), invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount.toString(), invoice.currency)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
            {invoice.status === "pending" && (
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsModal;
