import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TableData {
  headers: string[];
  rows: any[][];
  title: string;
  subtitle?: string;
}

interface InvoiceData {
  id: string;
  invoice_id: string;
  school: number;
  school_name: string;
  subscription: string;
  subscription_plan: string;
  amount_due: string;
  amount_paid: string;
  currency: string;
  status: string;
  invoice_date: string;
  due_date: string;
  paid_at: string | null;
  invoice_pdf_url: string | null;
  line_items: any[];
  is_overdue: boolean;
}

interface SubscriptionData {
  id: string;
  school_name: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  price_charged: string;
  current_students_count: number;
  current_buses_count: number;
  current_parents_count: number;
}

export const generateTablePDF = (data: TableData) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(data.title, 14, 22);

  // Add subtitle if provided
  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(data.subtitle, 14, 32);
  }

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);

  // Generate table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: 50,
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  return doc;
};

export const generateInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Invoice details
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${invoice.invoice_id || invoice.id}`, 14, 40);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 50);
  doc.text(
    `School: ${invoice.school_name || `School ${invoice.school}`}`,
    14,
    60
  );
  doc.text(`Subscription Plan: ${invoice.subscription_plan || "N/A"}`, 14, 70);
  doc.text(
    `Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`,
    14,
    80
  );
  doc.text(
    `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`,
    14,
    90
  );

  if (invoice.paid_at) {
    doc.text(
      `Paid Date: ${new Date(invoice.paid_at).toLocaleDateString()}`,
      14,
      100
    );
  }

  // Amount details
  doc.text(`Amount Due: ${invoice.currency} ${invoice.amount_due}`, 14, 110);
  if (parseFloat(invoice.amount_paid) > 0) {
    doc.text(
      `Amount Paid: ${invoice.currency} ${invoice.amount_paid}`,
      14,
      120
    );
  }

  // Line items table
  const lineItemsData = invoice.line_items.map((item) => [
    item.description,
    item.quantity.toString(),
    `${invoice.currency} ${item.unit_price}`,
    `${invoice.currency} ${item.total}`,
  ]);

  autoTable(doc, {
    head: [["Description", "Quantity", "Unit Price", "Total"]],
    body: lineItemsData,
    startY: 140,
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  // Total
  const total = invoice.line_items.reduce((sum, item) => sum + item.total, 0);
  doc.setFontSize(14);
  doc.text(`Total Amount: ${invoice.currency} ${total}`, 14, 200);

  return doc;
};

export const generateSubscriptionPDF = (subscription: SubscriptionData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.text("SUBSCRIPTION DETAILS", 105, 20, { align: "center" });

  // Subscription details
  doc.setFontSize(12);
  doc.text(`Subscription ID: ${subscription.id}`, 14, 40);
  doc.text(`School: ${subscription.school_name}`, 14, 50);
  doc.text(`Plan: ${subscription.plan_name}`, 14, 60);
  doc.text(`Status: ${subscription.status.toUpperCase()}`, 14, 70);
  doc.text(`Billing Cycle: ${subscription.billing_cycle}`, 14, 80);
  doc.text(`Price: ${subscription.price_charged}`, 14, 90);

  // Usage statistics
  doc.setFontSize(14);
  doc.text("Usage Statistics", 14, 110);
  doc.setFontSize(12);
  doc.text(`Students: ${subscription.current_students_count}`, 14, 120);
  doc.text(`Buses: ${subscription.current_buses_count}`, 14, 130);
  doc.text(`Parents: ${subscription.current_parents_count}`, 14, 140);

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};
