export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type IntervalType = 'MILEAGE' | 'DATE' | 'BOTH';

export type MaintenanceCategory =
  | 'ENGINE'
  | 'BRAKES'
  | 'TIRES'
  | 'CHAIN'
  | 'ELECTRICAL'
  | 'COOLING'
  | 'GENERAL'
  | 'REGULATORY';

export type Platform = 'IOS' | 'ANDROID';

export type DashboardStatus = 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';

export type UnitPreference = 'km' | 'mi';

export interface UserProfile {
  email: string;
  displayName: string;
  unitPreference: UnitPreference;
  reminderDigestTime: string;
  reminderThresholdDays: number;
  reminderThresholdPercent: number;
}

export interface SyncProfileRequest {
  displayName?: string;
  email?: string;
  unitPreference?: UnitPreference;
}

export interface UpdateNotificationSettingsRequest {
  reminderThresholdDays: number;
  reminderThresholdPercent: number;
}

export interface Motorcycle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  vin: string | null;
  notes: string | null;
  initialMileage: number;
  currentMileage: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MotorcycleDetail extends Motorcycle {
  schedules: Schedule[];
  recentServiceLogs: ServiceLog[];
  totalSchedules: number;
  overdueCount: number;
  dueSoonCount: number;
  upcomingCount: number;
}

export interface CreateMotorcycleRequest {
  name: string;
  make: string;
  model: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  notes?: string;
  currentMileage: number;
  templateIds?: string[];
}

export interface UpdateMotorcycleRequest {
  name: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  notes?: string;
  currentMileage?: number;
  isActive?: boolean;
}

export interface UpdateMileageRequest {
  mileage: number;
}

export interface Schedule {
  id: string;
  motorcycleId: string;
  templateId: string;
  templateName: string;
  intervalType: IntervalType;
  intervalMileage: number | null;
  intervalDays: number | null;
  lastServiceMileage: number;
  lastServiceDate: string | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  templateId: string;
  intervalType: IntervalType;
  intervalMileage?: number;
  intervalDays?: number;
}

export interface UpdateScheduleRequest {
  intervalType?: IntervalType;
  intervalMileage?: number;
  intervalDays?: number;
  isActive?: boolean;
}

export interface ServiceLog {
  id: string;
  scheduleId: string;
  motorcycleId: string;
  templateId: string;
  templateName: string;
  mileageAtService: number;
  dateOfService: string;
  cost: number | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateServiceLogRequest {
  scheduleId: string;
  dateOfService: string;
  mileageAtService: number;
  cost?: number;
  notes?: string;
}

export interface MaintenanceTemplate {
  id: string;
  name: string;
  category: MaintenanceCategory;
  description: string;
  icon: string;
  defaultIntervalMileage: number | null;
  defaultIntervalDays: number | null;
  isSpecial: boolean;
  isSystem: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  category: MaintenanceCategory;
  description?: string;
  icon?: string;
  defaultIntervalMileage?: number;
  defaultIntervalDays?: number;
}

export interface DashboardResponse {
  totalBikes: number;
  totalActiveSchedules: number;
  overdue: DashboardItem[];
  dueSoon: DashboardItem[];
  upcoming: DashboardItem[];
}

export interface DashboardItem {
  scheduleId: string;
  motorcycleId: string;
  motorcycleName: string;
  templateId: string;
  templateName: string;
  categoryName: string;
  intervalMileage: number | null;
  intervalDays: number | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  currentMileage: number;
  currentDate: string;
  status: DashboardStatus;
  milesRemaining: number | null;
  daysRemaining: number | null;
}

export interface RegisterDeviceTokenRequest {
  token: string;
  platform: Platform;
}
