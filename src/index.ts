#!/usr/bin/env node

/**
 * Belbo MCP Server
 * Model Context Protocol server for the Belbo Booking API
 *
 * Enables AI assistants like Claude, Cursor, and others to interact
 * with Belbo calendar and booking systems.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { BelboClient } from './belbo-client.js';
import {
  BelboApiError,
  BelboAuthError,
  BelboConfigError,
  AppointmentQueryParams,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  CustomerQueryParams,
  CustomerCreateInput,
  CustomerUpdateInput,
  ServiceQueryParams,
  EmployeeQueryParams,
  AvailabilityQueryParams,
  TransactionQueryParams,
} from './types.js';

// ============================================
// Configuration
// ============================================

const client = new BelboClient();

// Try to load config from environment variables
const envBusiness = process.env.BELBO_BUSINESS;
const envToken = process.env.BELBO_TOKEN;

if (envBusiness && envToken) {
  try {
    client.setConfig({ business: envBusiness, token: envToken });
    console.error(`[Belbo MCP] Configured for business: ${envBusiness}`);
  } catch (error) {
    console.error(`[Belbo MCP] Failed to configure from environment: ${error}`);
  }
}

// ============================================
// Tool Definitions
// ============================================

const tools: Tool[] = [
  // Configuration Tools
  {
    name: 'belbo_configure',
    description: `Configure the Belbo API connection. This must be called first before using any other Belbo tools.

Required parameters:
- business: Your Belbo business subdomain (e.g., "demo" for demo.belbo.com)
- token: Your Belbo API token (found in Settings > API Access)

Example: For URL https://mysalon.belbo.com, use business="mysalon"`,
    inputSchema: {
      type: 'object',
      properties: {
        business: {
          type: 'string',
          description: 'Your Belbo business subdomain (e.g., "demo" for demo.belbo.com)',
        },
        token: {
          type: 'string',
          description: 'Your Belbo API token',
        },
      },
      required: ['business', 'token'],
    },
  },
  {
    name: 'belbo_test_connection',
    description: 'Test the connection to the Belbo API. Use this to verify your credentials are working.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'belbo_get_config_status',
    description: 'Check if the Belbo API is configured and which business is connected.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Appointment Tools
  {
    name: 'belbo_get_appointments',
    description: `Get appointments from the Belbo calendar with optional filters.

Optional parameters:
- date: Specific date (format: DD.MM.YYYY)
- dateFrom: Start date for range (format: DD.MM.YYYY)
- dateTo: End date for range (format: DD.MM.YYYY)
- employeeId: Filter by employee
- customerId: Filter by customer
- status: Filter by status (scheduled, confirmed, completed, cancelled, no_show)`,
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Specific date (format: DD.MM.YYYY)',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date for range (format: DD.MM.YYYY)',
        },
        dateTo: {
          type: 'string',
          description: 'End date for range (format: DD.MM.YYYY)',
        },
        employeeId: {
          type: 'string',
          description: 'Filter by employee ID',
        },
        customerId: {
          type: 'string',
          description: 'Filter by customer ID',
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
          description: 'Filter by appointment status',
        },
      },
    },
  },
  {
    name: 'belbo_get_appointment',
    description: 'Get details of a specific appointment by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The appointment ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'belbo_create_appointment',
    description: `Create a new appointment in the Belbo calendar.

Required parameters:
- date: Appointment date (format: DD.MM.YYYY)
- time: Appointment time (format: HH:MM)

Optional parameters:
- customerId: ID of existing customer
- customerName: Name for new/lookup customer
- employeeId: Assigned employee ID
- serviceIds: Array of service IDs to include
- duration: Duration in minutes
- notes: Additional notes
- color: Color code for the appointment`,
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Appointment date (format: DD.MM.YYYY)',
        },
        time: {
          type: 'string',
          description: 'Appointment time (format: HH:MM)',
        },
        customerId: {
          type: 'string',
          description: 'ID of existing customer',
        },
        customerName: {
          type: 'string',
          description: 'Customer name (for lookup or creation)',
        },
        employeeId: {
          type: 'string',
          description: 'ID of the assigned employee',
        },
        serviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of service IDs',
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
        color: {
          type: 'string',
          description: 'Color code for the appointment',
        },
      },
      required: ['date', 'time'],
    },
  },
  {
    name: 'belbo_update_appointment',
    description: `Update an existing appointment.

Required parameters:
- id: The appointment ID to update

Optional parameters (at least one required):
- date: New date (format: DD.MM.YYYY)
- time: New time (format: HH:MM)
- customerId: New customer ID
- employeeId: New employee ID
- serviceIds: New service IDs
- duration: New duration in minutes
- notes: Updated notes
- status: New status (scheduled, confirmed, completed, cancelled, no_show)
- color: New color code`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The appointment ID to update',
        },
        date: {
          type: 'string',
          description: 'New date (format: DD.MM.YYYY)',
        },
        time: {
          type: 'string',
          description: 'New time (format: HH:MM)',
        },
        customerId: {
          type: 'string',
          description: 'New customer ID',
        },
        employeeId: {
          type: 'string',
          description: 'New employee ID',
        },
        serviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'New service IDs',
        },
        duration: {
          type: 'number',
          description: 'New duration in minutes',
        },
        notes: {
          type: 'string',
          description: 'Updated notes',
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
          description: 'New appointment status',
        },
        color: {
          type: 'string',
          description: 'New color code',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'belbo_delete_appointment',
    description: 'Delete/cancel an appointment from the calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The appointment ID to delete',
        },
      },
      required: ['id'],
    },
  },

  // Customer Tools
  {
    name: 'belbo_get_customers',
    description: `Get customers from Belbo with optional filters.

Optional parameters:
- search: Search term for name/email/phone
- email: Filter by email
- phone: Filter by phone number
- limit: Maximum number of results
- offset: Pagination offset`,
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search term for name/email/phone',
        },
        email: {
          type: 'string',
          description: 'Filter by email address',
        },
        phone: {
          type: 'string',
          description: 'Filter by phone number',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
        },
      },
    },
  },
  {
    name: 'belbo_get_customer',
    description: 'Get details of a specific customer by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The customer ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'belbo_search_customers',
    description: 'Search for customers by name, email, or phone number.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (name, email, or phone)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'belbo_create_customer',
    description: `Create a new customer in Belbo.

Optional parameters (at least name or firstName+lastName recommended):
- firstName: Customer's first name
- lastName: Customer's last name
- name: Full name
- email: Email address
- phone: Phone number
- mobile: Mobile phone number
- address: Address object with street, city, zipCode, country
- notes: Additional notes
- tags: Array of tags`,
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "Customer's first name",
        },
        lastName: {
          type: 'string',
          description: "Customer's last name",
        },
        name: {
          type: 'string',
          description: 'Full name',
        },
        email: {
          type: 'string',
          description: 'Email address',
        },
        phone: {
          type: 'string',
          description: 'Phone number',
        },
        mobile: {
          type: 'string',
          description: 'Mobile phone number',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
          },
          description: 'Address information',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
        },
      },
    },
  },
  {
    name: 'belbo_update_customer',
    description: 'Update an existing customer\'s information.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The customer ID to update',
        },
        firstName: {
          type: 'string',
          description: 'New first name',
        },
        lastName: {
          type: 'string',
          description: 'New last name',
        },
        name: {
          type: 'string',
          description: 'New full name',
        },
        email: {
          type: 'string',
          description: 'New email address',
        },
        phone: {
          type: 'string',
          description: 'New phone number',
        },
        mobile: {
          type: 'string',
          description: 'New mobile phone number',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
          },
          description: 'New address information',
        },
        notes: {
          type: 'string',
          description: 'New notes',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'belbo_delete_customer',
    description: 'Delete a customer from the system.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The customer ID to delete',
        },
      },
      required: ['id'],
    },
  },

  // Service Tools
  {
    name: 'belbo_get_services',
    description: `Get all available services/treatments.

Optional parameters:
- categoryId: Filter by category
- active: Filter by active status (true/false)`,
    inputSchema: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          description: 'Filter by category ID',
        },
        active: {
          type: 'boolean',
          description: 'Filter by active status',
        },
      },
    },
  },
  {
    name: 'belbo_get_service',
    description: 'Get details of a specific service by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The service ID',
        },
      },
      required: ['id'],
    },
  },

  // Employee Tools
  {
    name: 'belbo_get_employees',
    description: `Get all employees/staff members.

Optional parameters:
- serviceId: Filter by employees who can perform a specific service
- active: Filter by active status (true/false)`,
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'Filter by service ID',
        },
        active: {
          type: 'boolean',
          description: 'Filter by active status',
        },
      },
    },
  },
  {
    name: 'belbo_get_employee',
    description: 'Get details of a specific employee by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The employee ID',
        },
      },
      required: ['id'],
    },
  },

  // Availability Tools
  {
    name: 'belbo_get_availability',
    description: `Get available time slots for booking.

Required parameters:
- date: The date to check (format: DD.MM.YYYY)

Optional parameters:
- dateFrom: Start date for range
- dateTo: End date for range
- employeeId: Filter by specific employee
- serviceId: Filter by service (considers duration)
- duration: Required duration in minutes`,
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'The date to check (format: DD.MM.YYYY)',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date for range',
        },
        dateTo: {
          type: 'string',
          description: 'End date for range',
        },
        employeeId: {
          type: 'string',
          description: 'Filter by employee ID',
        },
        serviceId: {
          type: 'string',
          description: 'Filter by service ID',
        },
        duration: {
          type: 'number',
          description: 'Required duration in minutes',
        },
      },
      required: ['date'],
    },
  },

  // Opening Hours Tools
  {
    name: 'belbo_get_opening_hours',
    description: 'Get the business opening hours for all days of the week.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Transaction Tools
  {
    name: 'belbo_get_transactions',
    description: `Get transactions/cash register entries.

Optional parameters:
- date: Specific date (format: DD.MM.YYYY)
- dateFrom: Start date for range
- dateTo: End date for range
- customerId: Filter by customer
- status: Filter by status (pending, completed, refunded, cancelled)`,
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Specific date (format: DD.MM.YYYY)',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date for range',
        },
        dateTo: {
          type: 'string',
          description: 'End date for range',
        },
        customerId: {
          type: 'string',
          description: 'Filter by customer ID',
        },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'refunded', 'cancelled'],
          description: 'Filter by transaction status',
        },
      },
    },
  },
  {
    name: 'belbo_get_transaction',
    description: 'Get details of a specific transaction by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The transaction ID',
        },
      },
      required: ['id'],
    },
  },
];

// ============================================
// Tool Handler
// ============================================

type ToolInput = Record<string, unknown>;

async function handleToolCall(name: string, args: ToolInput): Promise<string> {
  try {
    switch (name) {
      // Configuration
      case 'belbo_configure': {
        const { business, token } = args as { business: string; token: string };
        client.setConfig({ business, token });

        // Test the connection
        const testResult = await client.testConnection();
        if (testResult.success) {
          return JSON.stringify({
            success: true,
            message: `Successfully configured and connected to ${business}.belbo.com`,
          });
        } else {
          return JSON.stringify({
            success: false,
            message: `Configured for ${business}.belbo.com but connection test failed: ${testResult.error}`,
          });
        }
      }

      case 'belbo_test_connection': {
        if (!client.isConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'Not configured. Please use belbo_configure first.',
          });
        }
        const result = await client.testConnection();
        return JSON.stringify(result);
      }

      case 'belbo_get_config_status': {
        const info = client.getConfigInfo();
        return JSON.stringify({
          configured: info.configured,
          business: info.business || null,
          message: info.configured
            ? `Connected to ${info.business}.belbo.com`
            : 'Not configured. Use belbo_configure to set up the connection.',
        });
      }

      // Appointments
      case 'belbo_get_appointments': {
        const result = await client.getAppointments(args as AppointmentQueryParams);
        return JSON.stringify(result);
      }

      case 'belbo_get_appointment': {
        const { id } = args as { id: string };
        const result = await client.getAppointment(id);
        return JSON.stringify(result);
      }

      case 'belbo_create_appointment': {
        const result = await client.createAppointment(args as AppointmentCreateInput);
        return JSON.stringify(result);
      }

      case 'belbo_update_appointment': {
        const result = await client.updateAppointment(args as AppointmentUpdateInput);
        return JSON.stringify(result);
      }

      case 'belbo_delete_appointment': {
        const { id } = args as { id: string };
        const result = await client.deleteAppointment(id);
        return JSON.stringify(result);
      }

      // Customers
      case 'belbo_get_customers': {
        const result = await client.getCustomers(args as CustomerQueryParams);
        return JSON.stringify(result);
      }

      case 'belbo_get_customer': {
        const { id } = args as { id: string };
        const result = await client.getCustomer(id);
        return JSON.stringify(result);
      }

      case 'belbo_search_customers': {
        const { query } = args as { query: string };
        const result = await client.searchCustomers(query);
        return JSON.stringify(result);
      }

      case 'belbo_create_customer': {
        const result = await client.createCustomer(args as CustomerCreateInput);
        return JSON.stringify(result);
      }

      case 'belbo_update_customer': {
        const result = await client.updateCustomer(args as CustomerUpdateInput);
        return JSON.stringify(result);
      }

      case 'belbo_delete_customer': {
        const { id } = args as { id: string };
        const result = await client.deleteCustomer(id);
        return JSON.stringify(result);
      }

      // Services
      case 'belbo_get_services': {
        const result = await client.getServices(args as ServiceQueryParams);
        return JSON.stringify(result);
      }

      case 'belbo_get_service': {
        const { id } = args as { id: string };
        const result = await client.getService(id);
        return JSON.stringify(result);
      }

      // Employees
      case 'belbo_get_employees': {
        const result = await client.getEmployees(args as EmployeeQueryParams);
        return JSON.stringify(result);
      }

      case 'belbo_get_employee': {
        const { id } = args as { id: string };
        const result = await client.getEmployee(id);
        return JSON.stringify(result);
      }

      // Availability
      case 'belbo_get_availability': {
        const result = await client.getAvailability(args as AvailabilityQueryParams);
        return JSON.stringify(result);
      }

      // Opening Hours
      case 'belbo_get_opening_hours': {
        const result = await client.getOpeningHours();
        return JSON.stringify(result);
      }

      // Transactions
      case 'belbo_get_transactions': {
        const result = await client.getTransactions(args as TransactionQueryParams);
        return JSON.stringify(result);
      }

      case 'belbo_get_transaction': {
        const { id } = args as { id: string };
        const result = await client.getTransaction(id);
        return JSON.stringify(result);
      }

      default:
        return JSON.stringify({
          success: false,
          error: `Unknown tool: ${name}`,
        });
    }
  } catch (error) {
    if (error instanceof BelboConfigError) {
      return JSON.stringify({
        success: false,
        error: error.message,
        hint: 'Use belbo_configure to set up the connection first.',
      });
    }

    if (error instanceof BelboAuthError) {
      return JSON.stringify({
        success: false,
        error: error.message,
        hint: 'Check your API token in Belbo Settings > API Access.',
      });
    }

    if (error instanceof BelboApiError) {
      return JSON.stringify({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        endpoint: error.endpoint,
      });
    }

    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

// ============================================
// Server Setup
// ============================================

const server = new Server(
  {
    name: 'belbo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const result = await handleToolCall(name, (args ?? {}) as ToolInput);

  return {
    content: [
      {
        type: 'text',
        text: result,
      },
    ],
  };
});

// ============================================
// Main Entry Point
// ============================================

async function main() {
  console.error('[Belbo MCP] Starting server...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Belbo MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Belbo MCP] Fatal error:', error);
  process.exit(1);
});
