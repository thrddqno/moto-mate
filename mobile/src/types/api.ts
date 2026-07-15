export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface UserProfile {
  email: string;
  displayName: string;
  unitPreference: string;
  reminderDigestTime: string;
  reminderThresholdDays: number;
  reminderThresholdPercent: number;
}

export interface Motorcycle {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
  vin: string | null;
  notes: string | null;
  initialMileage: number;
  currentMileage: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface MotorcycleDetail extends Motorcycle {
  schedules: Schedule[];
  recentServiceLogs: ServiceLog[];
  totalSchedules: number;
  overdueCount: number;
  dueSoonCount: number;
  upcomingCount: number;
}

export interface Schedule {
  id: string;
  motorcycleId: string;
  templateId: string;
  templateName: string;
  intervalType: 'MILEAGE' | 'DATE' | 'BOTH';
  intervalMileage: number | null;
  intervalDays: number | null;
  lastServiceMileage: number | null;
  lastServiceDate: string | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
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

export interface MaintenanceTemplate {
  id: string;
  name: string;
  category: MaintenanceCategory;
  description: string | null;
  icon: string | null;
  defaultIntervalMileage: number | null;
  defaultIntervalDays: number | null;
  isSpecial: boolean;
  isSystem: boolean;
}

export type MaintenanceCategory =
  | 'ENGINE'
  | 'BRAKES'
  | 'TIRES'
  | 'CHAIN'
  | 'ELECTRICAL'
  | 'COOLING'
  | 'GENERAL'
  | 'REGULATORY';

export type IntervalType = 'MILEAGE' | 'DATE' | 'BOTH';

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
  status: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';
  milesRemaining: number | null;
  daysRemaining: number | null;
}

export interface DashboardResponse {
  totalBikes: number;
  totalActiveSchedules: number;
  overdue: DashboardItem[];
  dueSoon: DashboardItem[];
  upcoming: DashboardItem[];
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
