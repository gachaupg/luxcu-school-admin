import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/utils/api";
import { apiRequestWithRetry } from "@/utils/api";

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
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
  line_items: LineItem[];
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  school: number;
  subscription: string;
  amount_due: string;
  currency: string;
  due_date: string;
  line_items: LineItem[];
}

export interface PaymentData {
  invoice_id: string;
  payment_reference: string;
  payment_method: string;
  transaction_id: string;
}

export interface UpdateInvoiceData {
  status?: "pending" | "paid" | "overdue" | "cancelled";
  amount_due?: string;
  due_date?: string;
  line_items?: LineItem[];
}

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
}

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequestWithRetry(`${API_ENDPOINTS.INVOICES}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("Invoices API response:", data);
      console.log("Invoices API response type:", typeof data);
      console.log("Invoices API response keys:", Object.keys(data));
      console.log("Invoices data field:", data.data);
      console.log("Invoices data type:", typeof data.data);

      return data.data || data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch invoices"
      );
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchInvoiceById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiRequestWithRetry(
        `${API_ENDPOINTS.INVOICES}/${id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch invoice"
      );
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async (invoiceData: CreateInvoiceData, { rejectWithValue }) => {
    try {
      const response = await apiRequestWithRetry(`${API_ENDPOINTS.INVOICES}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    }
  }
);

export const processPayment = createAsyncThunk(
  "invoices/processPayment",
  async (paymentData: PaymentData, { rejectWithValue }) => {
    try {
      const response = await apiRequestWithRetry(
        `${API_ENDPOINTS.INVOICES}${paymentData.invoice_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error processing payment:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoices/updateInvoice",
  async (
    { id, updateData }: { id: string; updateData: UpdateInvoiceData },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiRequestWithRetry(
        `${API_ENDPOINTS.INVOICES}/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update invoice"
      );
    }
  }
);

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoicesError: (state) => {
      state.error = null;
    },
    clearInvoices: (state) => {
      state.invoices = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch invoice by ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        } else {
          state.invoices.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.creating = false;
        state.invoices.unshift(action.payload);
        state.error = null;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.updating = false;
        // Update the invoice status to paid
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.invoice_id
        );
        if (index !== -1) {
          state.invoices[index].status = "paid";
        }
        state.error = null;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Update invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInvoicesError, clearInvoices } = invoicesSlice.actions;

export default invoicesSlice.reducer;
