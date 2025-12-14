/**
 * Belbo API Types
 * Based on the Belbo Booking API documentation
 */

// ============================================
// Configuration Types
// ============================================

export interface BelboConfig {
  business: string;  // Business subdomain (e.g., "demo" for demo.belbo.com)
  token: string;     // API token for authentication
}

// ============================================
// API Response Types
// ============================================

export interface BelboApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ============================================
// Appointment Types
// ============================================

export interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  customer?: Customer;
  customerId?: string;
  employee?: Employee;
  employeeId?: string;
  services?: Service[];
  notes?: string;
  status?: AppointmentStatus;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AppointmentCreateInput {
  date: string;           // Format: DD.MM.YYYY
  time: string;           // Format: HH:MM
  customerId?: string;
  customerName?: string;
  employeeId?: string;
  serviceIds?: string[];
  duration?: number;      // Minutes
  notes?: string;
  color?: string;
}

export interface AppointmentUpdateInput extends Partial<AppointmentCreateInput> {
  id: string;
  status?: AppointmentStatus;
}

export interface AppointmentQueryParams {
  date?: string;          // Format: DD.MM.YYYY
  dateFrom?: string;      // Format: DD.MM.YYYY
  dateTo?: string;        // Format: DD.MM.YYYY
  employeeId?: string;
  customerId?: string;
  status?: AppointmentStatus;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: Address;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export interface CustomerCreateInput {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: Address;
  notes?: string;
  tags?: string[];
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {
  id: string;
}

export interface CustomerQueryParams {
  search?: string;
  email?: string;
  phone?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Service Types
// ============================================

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;       // Minutes
  price?: number;
  currency?: string;
  category?: string;
  categoryId?: string;
  color?: string;
  active?: boolean;
}

export interface ServiceQueryParams {
  categoryId?: string;
  active?: boolean;
}

// ============================================
// Employee Types
// ============================================

export interface Employee {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  color?: string;
  services?: string[];    // Service IDs this employee can perform
  active?: boolean;
}

export interface EmployeeQueryParams {
  serviceId?: string;
  active?: boolean;
}

// ============================================
// Availability Types
// ============================================

export interface Availability {
  date: string;
  employeeId?: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;          // Format: HH:MM
  end: string;            // Format: HH:MM
  available: boolean;
}

export interface AvailabilityQueryParams {
  date: string;           // Format: DD.MM.YYYY
  dateFrom?: string;      // Format: DD.MM.YYYY
  dateTo?: string;        // Format: DD.MM.YYYY
  employeeId?: string;
  serviceId?: string;
  duration?: number;      // Minutes
}

// ============================================
// Opening Hours Types
// ============================================

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: boolean;
  slots?: {
    start: string;        // Format: HH:MM
    end: string;          // Format: HH:MM
  }[];
}

// ============================================
// Transaction/Cash Types
// ============================================

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  customerId?: string;
  customer?: Customer;
  appointmentId?: string;
  items: TransactionItem[];
  total: number;
  currency: string;
  paymentMethod?: string;
  status?: TransactionStatus;
  notes?: string;
  createdAt?: string;
}

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export interface TransactionItem {
  serviceId?: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface TransactionQueryParams {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: TransactionStatus;
}

// ============================================
// Error Types
// ============================================

export class BelboApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'BelboApiError';
  }
}

export class BelboAuthError extends BelboApiError {
  constructor(message: string, endpoint: string) {
    super(message, 401, endpoint);
    this.name = 'BelboAuthError';
  }
}

export class BelboConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BelboConfigError';
  }
}
