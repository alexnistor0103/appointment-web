import api from './axios';
import { 
  Appointment, 
  Service, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  AvailableTimeSlotsResponse,
  TimeSlotConfig,
  WeeklySchedule,
  SetWorkScheduleRequest,
  ScheduleException
} from '../types/appointment';

// Appointment API calls
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const response = await api.get<Appointment>(`/appointments/${id}`);
  return response.data;
};

export const getClientAppointments = async (clientId: number): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/appointments/client/${clientId}`);
  return response.data;
};

export const getProviderAppointments = async (providerId: number): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/appointments/provider/${providerId}`);
  return response.data;
};

export const getAppointmentsByDateRange = async (startDate: string, endDate: string): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/appointments/date-range`, {
    params: { startDate, endDate }
  });
  return response.data;
};

export const createAppointment = async (request: CreateAppointmentRequest): Promise<Appointment> => {
  const response = await api.post<Appointment>('/appointments', request);
  return response.data;
};

export const updateAppointment = async (id: number, request: UpdateAppointmentRequest): Promise<Appointment> => {
  const response = await api.put<Appointment>(`/appointments/${id}`, request);
  return response.data;
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const response = await api.delete<Appointment>(`/appointments/${id}`);
  return response.data;
};

export const getAvailableTimeSlots = async (
  providerId: number, 
  date: string
): Promise<AvailableTimeSlotsResponse> => {
  const response = await api.get<AvailableTimeSlotsResponse>(
    `/appointments/available-slots/${providerId}`,
    { params: { date } }
  );
  return response.data;
};

// Service API calls
export const getAllServices = async (activeOnly: boolean = false): Promise<Service[]> => {
  const response = await api.get<Service[]>('/services', {
    params: { activeOnly }
  });
  return response.data;
};

export const getServiceById = async (id: number): Promise<Service> => {
  const response = await api.get<Service>(`/services/${id}`);
  return response.data;
};

export const createService = async (service: Service): Promise<Service> => {
  const response = await api.post<Service>('/services', service);
  return response.data;
};

export const updateService = async (id: number, service: Service): Promise<Service> => {
  const response = await api.put<Service>(`/services/${id}`, service);
  return response.data;
};

export const setServiceActiveStatus = async (id: number, active: boolean): Promise<Service> => {
  const response = await api.patch<Service>(`/services/${id}/status`, null, {
    params: { active }
  });
  return response.data;
};

// Time Slot Configuration API calls
export const getTimeSlotConfig = async (): Promise<TimeSlotConfig> => {
  const response = await api.get<TimeSlotConfig>('/time-slots/config');
  return response.data;
};

export const updateTimeSlotConfig = async (config: TimeSlotConfig): Promise<TimeSlotConfig> => {
  const response = await api.put<TimeSlotConfig>('/time-slots/config', config);
  return response.data;
};

export const createDefaultTimeSlotConfig = async (): Promise<TimeSlotConfig> => {
  const response = await api.post<TimeSlotConfig>('/time-slots/config/default');
  return response.data;
};

// Work Schedule API calls
export const getProviderSchedule = async (providerId: number): Promise<WeeklySchedule> => {
  const response = await api.get<WeeklySchedule>(`/work-schedules/${providerId}`);
  return response.data;
};

export const setProviderSchedule = async (request: SetWorkScheduleRequest): Promise<WeeklySchedule> => {
  const response = await api.put<WeeklySchedule>('/work-schedules', request);
  return response.data;
};

export const addScheduleException = async (exception: ScheduleException): Promise<ScheduleException> => {
  const response = await api.post<ScheduleException>('/work-schedules/exceptions', exception);
  return response.data;
};

export const updateScheduleException = async (
  id: number, 
  exception: ScheduleException
): Promise<ScheduleException> => {
  const response = await api.put<ScheduleException>(`/work-schedules/exceptions/${id}`, exception);
  return response.data;
};

export const deleteScheduleException = async (id: number): Promise<void> => {
  await api.delete(`/work-schedules/exceptions/${id}`);
};

export const getScheduleExceptionsForDateRange = async (
  providerId: number,
  startDate: string,
  endDate: string
): Promise<ScheduleException[]> => {
  const response = await api.get<ScheduleException[]>(`/work-schedules/exceptions/date-range`, {
    params: { providerId, startDate, endDate }
  });
  return response.data;
};