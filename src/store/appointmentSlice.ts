import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as appointmentApi from '../utils/appointmentApi';
import { 
  Appointment, 
  Service, 
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AvailableTimeSlotsResponse,
  TimeSlot
} from '../types/appointment';

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  services: Service[];
  availableTimeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  services: [],
  availableTimeSlots: [],
  isLoading: false,
  error: null
};

// Async thunks for appointments
export const fetchClientAppointments = createAsyncThunk(
  'appointments/fetchClientAppointments',
  async (clientId: number, { rejectWithValue }) => {
    try {
      return await appointmentApi.getClientAppointments(clientId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointments');
    }
  }
);

export const fetchProviderAppointments = createAsyncThunk(
  'appointments/fetchProviderAppointments',
  async (providerId: number, { rejectWithValue }) => {
    try {
      return await appointmentApi.getProviderAppointments(providerId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAppointmentById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointment');
    }
  }
);

export const createNewAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (request: CreateAppointmentRequest, { rejectWithValue }) => {
    try {
      return await appointmentApi.createAppointment(request);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create appointment');
    }
  }
);

export const updateExistingAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, request }: { id: number, request: UpdateAppointmentRequest }, { rejectWithValue }) => {
    try {
      return await appointmentApi.updateAppointment(id, request);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update appointment');
    }
  }
);

export const cancelExistingAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id: number, { rejectWithValue }) => {
    try {
      return await appointmentApi.cancelAppointment(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel appointment');
    }
  }
);

export const fetchAvailableTimeSlots = createAsyncThunk(
  'appointments/fetchAvailableTimeSlots',
  async ({ providerId, date }: { providerId: number, date: string }, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAvailableTimeSlots(providerId, date);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch available time slots');
    }
  }
);

// Async thunks for services
export const fetchServices = createAsyncThunk(
  'appointments/fetchServices',
  async (activeOnly: boolean = true, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAllServices(activeOnly);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch services');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    resetAppointmentError: (state) => {
      state.error = null;
    },
    resetCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAvailableTimeSlots: (state) => {
      state.availableTimeSlots = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch client appointments
    builder
      .addCase(fetchClientAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchClientAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Fetch provider appointments
    builder
      .addCase(fetchProviderAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchProviderAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Fetch appointment by ID
    builder
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.isLoading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Create appointment
    builder
      .addCase(createNewAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.isLoading = false;
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
      })
      .addCase(createNewAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Update appointment
    builder
      .addCase(updateExistingAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        state.currentAppointment = action.payload;
      })
      .addCase(updateExistingAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Cancel appointment
    builder
      .addCase(cancelExistingAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelExistingAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(cancelExistingAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Fetch available time slots
    builder
      .addCase(fetchAvailableTimeSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTimeSlots.fulfilled, (state, action: PayloadAction<AvailableTimeSlotsResponse>) => {
        state.isLoading = false;
        state.availableTimeSlots = action.payload.availableSlots;
      })
      .addCase(fetchAvailableTimeSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  resetAppointmentError, 
  resetCurrentAppointment,
  clearAvailableTimeSlots
} = appointmentSlice.actions;

export default appointmentSlice.reducer;