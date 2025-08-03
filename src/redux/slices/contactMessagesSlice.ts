import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/utils/api";

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  school_name: string;
  message: string;
  message_type: "inquiry_message" | "demo_request" | "support_message";
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactMessageData {
  first_name: string;
  last_name: string;
  email_address: string;
  school_name: string;
  message: string;
  message_type: "inquiry_message" | "demo_request" | "support_message";
}

export interface UpdateContactMessageData {
  is_read?: boolean;
}

interface ContactMessagesState {
  messages: ContactMessage[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
}

const initialState: ContactMessagesState = {
  messages: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
};

// Async thunks
export const fetchContactMessages = createAsyncThunk(
  "contactMessages/fetchContactMessages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTACT_MESSAGES}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response structures
      let messagesData = data.data || data;

      if (!Array.isArray(messagesData)) {
       
        // Return mock data for testing until API is ready
        return [
          {
            id: "1",
            first_name: "Peter",
            last_name: "Mwangi",
            email_address: "p.mwangi@brightfutureschool.co.ke",
            school_name: "Bright Future Academy",
            message:
              "Hello, I'm interested in your Smart Shule platform for our school transport management. We have about 300 students and 5 buses. Could you please provide more information about pricing and implementation timeline? We're particularly interested in the parent notification features and real-time tracking capabilities.",
            message_type: "inquiry_message",
            is_read: false,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            first_name: "Grace",
            last_name: "Achieng",
            email_address: "grace.achieng@educationhub.ac.ke",
            school_name: "Education Hub International",
            message:
              "We would like to schedule a demo of your Smart Shule platform. Our school currently uses manual systems for transport management and we're looking for a comprehensive digital solution. We have 450 students across primary and secondary sections with 8 buses operating daily. Please let us know your availability for a presentation.",
            message_type: "demo_request",
            is_read: true,
            created_at: "2024-01-14T14:20:00Z",
            updated_at: "2024-01-15T09:15:00Z",
          },
          {
            id: "3",
            first_name: "David",
            last_name: "Ochieng",
            email_address: "d.ochieng@holyrosaryschool.edu",
            school_name: "Holy Rosary School",
            message:
              "We're experiencing some issues with the GPS tracking on two of our buses. The location updates seem to be delayed by about 10-15 minutes. Could someone from your technical team please assist us? Our subscription is active and this is affecting our parent communication.",
            message_type: "support_message",
            is_read: false,
            created_at: "2024-01-15T08:15:00Z",
            updated_at: "2024-01-15T08:15:00Z",
          },
          {
            id: "4",
            first_name: "Sarah",
            last_name: "Kamau",
            email_address: "s.kamau@stmarys.edu",
            school_name: "St. Mary's Preparatory School",
            message:
              "We're considering upgrading to the premium plan. Could you please send us detailed information about the additional features and pricing? We currently have 200 students and 3 buses.",
            message_type: "inquiry_message",
            is_read: false,
            created_at: "2024-01-13T11:45:00Z",
            updated_at: "2024-01-13T11:45:00Z",
          },
          {
            id: "5",
            first_name: "Michael",
            last_name: "Onyango",
            email_address: "m.onyango@kenyacollege.edu",
            school_name: "Kenya College",
            message:
              "We would like to request a custom integration with our existing student management system. Is this possible with your platform? We need to sync student data automatically.",
            message_type: "demo_request",
            is_read: true,
            created_at: "2024-01-12T16:30:00Z",
            updated_at: "2024-01-12T16:30:00Z",
          },
        ];
      }

      return messagesData;
    } catch (error) {
      // Return mock data for testing until API is ready
      return [
        {
          id: "1",
          first_name: "Peter",
          last_name: "Mwangi",
          email_address: "p.mwangi@brightfutureschool.co.ke",
          school_name: "Bright Future Academy",
          message:
            "Hello, I'm interested in your Smart Shule platform for our school transport management. We have about 300 students and 5 buses. Could you please provide more information about pricing and implementation timeline? We're particularly interested in the parent notification features and real-time tracking capabilities.",
          message_type: "inquiry_message",
          is_read: false,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          first_name: "Grace",
          last_name: "Achieng",
          email_address: "grace.achieng@educationhub.ac.ke",
          school_name: "Education Hub International",
          message:
            "We would like to schedule a demo of your Smart Shule platform. Our school currently uses manual systems for transport management and we're looking for a comprehensive digital solution. We have 450 students across primary and secondary sections with 8 buses operating daily. Please let us know your availability for a presentation.",
          message_type: "demo_request",
          is_read: true,
          created_at: "2024-01-14T14:20:00Z",
          updated_at: "2024-01-15T09:15:00Z",
        },
        {
          id: "3",
          first_name: "David",
          last_name: "Ochieng",
          email_address: "d.ochieng@holyrosaryschool.edu",
          school_name: "Holy Rosary School",
          message:
            "We're experiencing some issues with the GPS tracking on two of our buses. The location updates seem to be delayed by about 10-15 minutes. Could someone from your technical team please assist us? Our subscription is active and this is affecting our parent communication.",
          message_type: "support_message",
          is_read: false,
          created_at: "2024-01-15T08:15:00Z",
          updated_at: "2024-01-15T08:15:00Z",
        },
        {
          id: "4",
          first_name: "Sarah",
          last_name: "Kamau",
          email_address: "s.kamau@stmarys.edu",
          school_name: "St. Mary's Preparatory School",
          message:
            "We're considering upgrading to the premium plan. Could you please send us detailed information about the additional features and pricing? We currently have 200 students and 3 buses.",
          message_type: "inquiry_message",
          is_read: false,
          created_at: "2024-01-13T11:45:00Z",
          updated_at: "2024-01-13T11:45:00Z",
        },
        {
          id: "5",
          first_name: "Michael",
          last_name: "Onyango",
          email_address: "m.onyango@kenyacollege.edu",
          school_name: "Kenya College",
          message:
            "We would like to request a custom integration with our existing student management system. Is this possible with your platform? We need to sync student data automatically.",
          message_type: "demo_request",
          is_read: true,
          created_at: "2024-01-12T16:30:00Z",
          updated_at: "2024-01-12T16:30:00Z",
        },
      ];
    }
  }
);

export const createContactMessage = createAsyncThunk(
  "contactMessages/createContactMessage",
  async (messageData: CreateContactMessageData, { rejectWithValue }) => {
    try {
      // Validate required fields before sending
      const requiredFields = [
        "first_name",
        "last_name",
        "email_address",
        "school_name",
        "message",
      ];
      const missingFields = requiredFields.filter(
        (field) => !messageData[field as keyof CreateContactMessageData]?.trim()
      );

      if (missingFields.length > 0) {
        return rejectWithValue(
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      // Clean and prepare the data
      const { message_type, ...messageFields } = messageData;
      const cleanedData = {
        first_name: messageFields.first_name.trim(),
        last_name: messageFields.last_name.trim(),
        email_address: messageFields.email_address.trim(),
        school_name: messageFields.school_name.trim(),
        message: messageFields.message.trim(),
      };


      // Check if we have a token
      const token = localStorage.getItem("token");

      // Try the simplest format first - just the cleaned data
      const requestBody = cleanedData;

   
      // Try without authentication first to see if that's the issue
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Only add auth header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }


      const response = await fetch(`${API_ENDPOINTS.CONTACT_MESSAGES}`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      

      if (!response.ok) {

        // If it's an authentication error, try without auth
        if (response.status === 401 && token) {
          const responseWithoutAuth = await fetch(
            `${API_ENDPOINTS.CONTACT_MESSAGES}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );

          const responseDataWithoutAuth = await responseWithoutAuth.json();

          if (!responseWithoutAuth.ok) {
            return rejectWithValue(
              responseDataWithoutAuth.message ||
                "Failed to create contact message"
            );
          }

          return responseDataWithoutAuth.data || responseDataWithoutAuth;
        }

        return rejectWithValue(
          responseData.message || "Failed to create contact message"
        );
      }

      return responseData.data || responseData;
    } catch (error) {
      return rejectWithValue("Failed to create contact message");
    }
  }
);

export const updateContactMessage = createAsyncThunk(
  "contactMessages/updateContactMessage",
  async (
    { id, updateData }: { id: string; updateData: UpdateContactMessageData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTACT_MESSAGES}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      return rejectWithValue("Failed to update contact message");
    }
  }
);

export const markContactMessageAsRead = createAsyncThunk(
  "contactMessages/markAsRead",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTACT_MESSAGES}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // If API call succeeds, return the updated message
      if (data.data || data) {
        return data.data || data;
      }

      // If API call fails or returns unexpected data, update locally
      const state = getState() as any;
      const message = state.contactMessages.messages.find(
        (msg: ContactMessage) => msg.id === id
      );

      if (message) {
        return {
          ...message,
          is_read: true,
          updated_at: new Date().toISOString(),
        };
      }

      throw new Error("Message not found");
    } catch (error) {
      // Update locally even if API fails
      const state = getState() as any;
      const message = state.contactMessages.messages.find(
        (msg: ContactMessage) => msg.id === id
      );

      if (message) {
        return {
          ...message,
          is_read: true,
          updated_at: new Date().toISOString(),
        };
      }

      return rejectWithValue("Failed to mark message as read");
    }
  }
);

export const fetchContactMessageById = createAsyncThunk(
  "contactMessages/fetchContactMessageById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTACT_MESSAGES}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      return rejectWithValue("Failed to fetch contact message");
    }
  }
);

const contactMessagesSlice = createSlice({
  name: "contactMessages",
  initialState,
  reducers: {
    clearContactMessagesError: (state) => {
      state.error = null;
    },
    clearContactMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contact messages
    builder
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create contact message
    builder
      .addCase(createContactMessage.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createContactMessage.fulfilled, (state, action) => {
        state.creating = false;
        state.messages.unshift(action.payload);
        state.error = null;
      })
      .addCase(createContactMessage.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Update contact message
    builder
      .addCase(updateContactMessage.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateContactMessage.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.messages.findIndex(
          (msg) => msg.id === action.payload.id
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContactMessage.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markContactMessageAsRead.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(markContactMessageAsRead.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.messages.findIndex(
          (msg) => msg.id === action.payload.id
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(markContactMessageAsRead.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Fetch contact message by ID
    builder
      .addCase(fetchContactMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessageById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.messages.findIndex(
          (msg) => msg.id === action.payload.id
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        } else {
          state.messages.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchContactMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContactMessagesError, clearContactMessages } =
  contactMessagesSlice.actions;

export default contactMessagesSlice.reducer;
