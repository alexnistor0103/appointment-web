import { User } from './index';

export enum AppointmentStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export enum ScheduleExceptionTypeEnum {
  DAY_OFF = 'DAY_OFF',
  SPECIAL_HOURS = 'SPECIAL_HOURS'
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  imageUrl?: string;
  providerId: number;
  providerName: string;
}

export interface Provider {
  id: number;
  name: string;
  email?: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  providerId: number;
  providerName: string;
  providerEmail: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatusEnum;
  services: Service[];
  notes?: string;
  totalPrice: number;
}

export interface CreateAppointmentRequest {
  clientId: number;
  providerId: number;
  startTime: string;
  serviceIds: number[];
  notes?: string;
}

export interface UpdateAppointmentRequest {
  id: number;
  startTime?: string;
  serviceIds?: number[];
  notes?: string;
  status?: AppointmentStatusEnum;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  available: boolean;
}

export interface AvailableTimeSlotsResponse {
  providerId: number;
  date: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlotConfig {
  id?: number;
  slotDurationMinutes: number;
  bufferTimeMinutes: number;
  bookingLeadDays: number;
  bookingAheadDays: number;
}

export interface WorkSchedule {
  id?: number;
  providerId: number;
  dayOfWeek: string; // 'MONDAY', 'TUESDAY', etc.
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface ScheduleException {
  id?: number;
  providerId: number;
  exceptionDate: string;
  type: ScheduleExceptionTypeEnum;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface WeeklySchedule {
  providerId: number;
  providerName: string;
  regularSchedule: WorkSchedule[];
  exceptions: ScheduleException[];
}

export interface SetWorkScheduleRequest {
  providerId: number;
  scheduleEntries: WorkSchedule[];
}