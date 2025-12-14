/**
 * Belbo API Client
 * Handles all communication with the Belbo Booking API
 */

import {
  BelboConfig,
  BelboApiResponse,
  BelboApiError,
  BelboAuthError,
  BelboConfigError,
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AppointmentQueryParams,
  Customer,
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerQueryParams,
  Service,
  ServiceQueryParams,
  Employee,
  EmployeeQueryParams,
  Availability,
  AvailabilityQueryParams,
  OpeningHours,
  Transaction,
  TransactionQueryParams,
} from './types.js';

export class BelboClient {
  private config: BelboConfig | null = null;
  private baseUrl: string = '';

  constructor(config?: BelboConfig) {
    if (config) {
      this.setConfig(config);
    }
  }

  /**
   * Set or update the client configuration
   */
  setConfig(config: BelboConfig): void {
    if (!config.business) {
      throw new BelboConfigError('Business name is required');
    }
    if (!config.token) {
      throw new BelboConfigError('API token is required');
    }

    this.config = config;
    this.baseUrl = `https://${config.business}.belbo.com/office/api`;
  }

  /**
   * Check if the client is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get current configuration (without exposing the token)
   */
  getConfigInfo(): { business: string; configured: boolean } {
    return {
      business: this.config?.business ?? '',
      configured: this.isConfigured(),
    };
  }

  /**
   * Build the full URL with token and query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    if (!this.config) {
      throw new BelboConfigError('Client not configured. Please set business name and token first.');
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.set('token', this.config.token);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make an HTTP request to the Belbo API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    body?: unknown
  ): Promise<BelboApiResponse<T>> {
    const url = this.buildUrl(endpoint, method === 'GET' ? params : undefined);

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new BelboAuthError(
          'Authentication failed. Please check your API token.',
          endpoint
        );
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new BelboApiError(
          `API request failed: ${response.statusText}. ${errorText}`,
          response.status,
          endpoint
        );
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json() as T;
        return {
          success: true,
          data,
          statusCode: response.status,
        };
      }

      // Handle non-JSON responses
      const text = await response.text();
      return {
        success: true,
        data: text as unknown as T,
        statusCode: response.status,
      };
    } catch (error) {
      if (error instanceof BelboApiError) {
        throw error;
      }

      // Handle network errors
      throw new BelboApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        endpoint,
        error
      );
    }
  }

  // ============================================
  // Appointment Methods
  // ============================================

  /**
   * Get appointments with optional filters
   */
  async getAppointments(params?: AppointmentQueryParams): Promise<BelboApiResponse<Appointment[]>> {
    return this.request<Appointment[]>('GET', 'appointments', params as Record<string, string>);
  }

  /**
   * Get a single appointment by ID
   */
  async getAppointment(id: string): Promise<BelboApiResponse<Appointment>> {
    return this.request<Appointment>('GET', `appointments/${id}`);
  }

  /**
   * Create a new appointment
   */
  async createAppointment(data: AppointmentCreateInput): Promise<BelboApiResponse<Appointment>> {
    return this.request<Appointment>('POST', 'appointments', undefined, data);
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(data: AppointmentUpdateInput): Promise<BelboApiResponse<Appointment>> {
    const { id, ...updateData } = data;
    return this.request<Appointment>('PUT', `appointments/${id}`, undefined, updateData);
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<BelboApiResponse<void>> {
    return this.request<void>('DELETE', `appointments/${id}`);
  }

  // ============================================
  // Customer Methods
  // ============================================

  /**
   * Get customers with optional filters
   */
  async getCustomers(params?: CustomerQueryParams): Promise<BelboApiResponse<Customer[]>> {
    return this.request<Customer[]>('GET', 'customers', params as Record<string, string | number>);
  }

  /**
   * Get a single customer by ID
   */
  async getCustomer(id: string): Promise<BelboApiResponse<Customer>> {
    return this.request<Customer>('GET', `customers/${id}`);
  }

  /**
   * Search customers by name or other criteria
   */
  async searchCustomers(query: string): Promise<BelboApiResponse<Customer[]>> {
    return this.request<Customer[]>('GET', 'customers', { search: query });
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CustomerCreateInput): Promise<BelboApiResponse<Customer>> {
    return this.request<Customer>('POST', 'customers', undefined, data);
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(data: CustomerUpdateInput): Promise<BelboApiResponse<Customer>> {
    const { id, ...updateData } = data;
    return this.request<Customer>('PUT', `customers/${id}`, undefined, updateData);
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<BelboApiResponse<void>> {
    return this.request<void>('DELETE', `customers/${id}`);
  }

  // ============================================
  // Service Methods
  // ============================================

  /**
   * Get all services
   */
  async getServices(params?: ServiceQueryParams): Promise<BelboApiResponse<Service[]>> {
    return this.request<Service[]>('GET', 'services', params as Record<string, string | boolean>);
  }

  /**
   * Get a single service by ID
   */
  async getService(id: string): Promise<BelboApiResponse<Service>> {
    return this.request<Service>('GET', `services/${id}`);
  }

  // ============================================
  // Employee Methods
  // ============================================

  /**
   * Get all employees
   */
  async getEmployees(params?: EmployeeQueryParams): Promise<BelboApiResponse<Employee[]>> {
    return this.request<Employee[]>('GET', 'employees', params as Record<string, string | boolean>);
  }

  /**
   * Get a single employee by ID
   */
  async getEmployee(id: string): Promise<BelboApiResponse<Employee>> {
    return this.request<Employee>('GET', `employees/${id}`);
  }

  /**
   * Get employees that can perform a specific service
   */
  async getEmployeesForService(serviceId: string): Promise<BelboApiResponse<Employee[]>> {
    return this.request<Employee[]>('GET', 'employees', { serviceId });
  }

  // ============================================
  // Availability Methods
  // ============================================

  /**
   * Get availability for booking
   */
  async getAvailability(params: AvailabilityQueryParams): Promise<BelboApiResponse<Availability[]>> {
    return this.request<Availability[]>('GET', 'availability', params as Record<string, string | number>);
  }

  /**
   * Get available time slots for a specific date and service
   */
  async getAvailableSlots(
    date: string,
    serviceId?: string,
    employeeId?: string
  ): Promise<BelboApiResponse<Availability[]>> {
    return this.request<Availability[]>('GET', 'availability', {
      date,
      serviceId,
      employeeId,
    });
  }

  // ============================================
  // Opening Hours Methods
  // ============================================

  /**
   * Get business opening hours
   */
  async getOpeningHours(): Promise<BelboApiResponse<OpeningHours>> {
    return this.request<OpeningHours>('GET', 'openinghours');
  }

  // ============================================
  // Transaction Methods
  // ============================================

  /**
   * Get transactions/cash register entries
   */
  async getTransactions(params?: TransactionQueryParams): Promise<BelboApiResponse<Transaction[]>> {
    return this.request<Transaction[]>('GET', 'transactions', params as Record<string, string>);
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: string): Promise<BelboApiResponse<Transaction>> {
    return this.request<Transaction>('GET', `transactions/${id}`);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Test the API connection
   */
  async testConnection(): Promise<BelboApiResponse<boolean>> {
    try {
      // Try to fetch services as a simple connectivity test
      await this.request<unknown>('GET', 'services');
      return {
        success: true,
        data: true,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof BelboAuthError) {
        return {
          success: false,
          error: 'Authentication failed. Please check your API token.',
          statusCode: 401,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        statusCode: 0,
      };
    }
  }
}

// Export a singleton instance for convenience
export const belboClient = new BelboClient();
