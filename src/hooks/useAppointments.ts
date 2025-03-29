
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchClientAppointments, 
  fetchProviderAppointments,
  fetchAppointmentById,
  createNewAppointment,
  updateExistingAppointment,
  cancelExistingAppointment,
  fetchAvailableTimeSlots,
  fetchServices,
  resetAppointmentError,
  resetCurrentAppointment,
  clearAvailableTimeSlots
} from '../store/appointmentSlice';
import { RootState, AppDispatch } from '../store/store';
import { 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest 
} from '../types/appointment';

export const useAppointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    appointments, 
    currentAppointment, 
    services,
    availableTimeSlots,
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.appointments);
  
  // Client appointments
  const getClientAppointments = async (clientId: number) => {
    try {
      await dispatch(fetchClientAppointments(clientId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Provider appointments
  const getProviderAppointments = async (providerId: number) => {
    try {
      await dispatch(fetchProviderAppointments(providerId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Get specific appointment
  const getAppointment = async (id: number) => {
    try {
      await dispatch(fetchAppointmentById(id)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Create appointment
  const createAppointment = async (request: CreateAppointmentRequest) => {
    try {
      const result = await dispatch(createNewAppointment(request)).unwrap();
      return result;
    } catch (error) {
      return null;
    }
  };
  
  // Update appointment
  const updateAppointment = async (id: number, request: UpdateAppointmentRequest) => {
    try {
      const result = await dispatch(updateExistingAppointment({ id, request })).unwrap();
      return result;
    } catch (error) {
      return null;
    }
  };
  
  // Cancel appointment
  const cancelAppointment = async (id: number) => {
    try {
      const result = await dispatch(cancelExistingAppointment(id)).unwrap();
      return result;
    } catch (error) {
      return null;
    }
  };
  
  // Get available time slots
  const getAvailableTimeSlots = async (providerId: number, date: string) => {
    try {
      await dispatch(fetchAvailableTimeSlots({ providerId, date })).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Get services
  const getServices = async (activeOnly: boolean = true) => {
    try {
      await dispatch(fetchServices(activeOnly)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Reset current appointment
  const resetAppointment = () => {
    dispatch(resetCurrentAppointment());
  };
  
  // Clear available time slots
  const clearTimeSlots = () => {
    dispatch(clearAvailableTimeSlots());
  };
  
  // Clear error
  const clearError = () => {
    dispatch(resetAppointmentError());
  };
  
  return {
    appointments,
    currentAppointment,
    services,
    availableTimeSlots,
    isLoading,
    error,
    getClientAppointments,
    getProviderAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableTimeSlots,
    getServices,
    resetAppointment,
    clearTimeSlots,
    clearError
  };
};