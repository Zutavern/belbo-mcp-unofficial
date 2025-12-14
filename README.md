# Belbo MCP Server

[![npm version](https://img.shields.io/npm/v/belbo-mcp-server.svg)](https://www.npmjs.com/package/belbo-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A robust Model Context Protocol (MCP) server for the [Belbo Booking API](https://belbo.com). Enables AI assistants like **Claude**, **Cursor**, and other MCP-compatible tools to interact with Belbo calendar and booking systems.

---

## Quick Installation

Choose your preferred AI assistant for one-click installation:

### Install in Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=belbo&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJiZWxiby1tY3Atc2VydmVyIl0sImVudiI6eyJCRUxCT19CVVNJTkVTUyI6InlvdXItYnVzaW5lc3MtbmFtZSIsIkJFTEJPX1RPS0VOIjoieW91ci1hcGktdG9rZW4ifX0%3D)

> Click the button above to install directly in Cursor. You'll need to update the environment variables with your actual Belbo credentials after installation.

### Install in VS Code

```bash
# Run this command in VS Code terminal
code --add-mcp '{"name":"belbo","command":"npx","args":["belbo-mcp-server"],"env":{"BELBO_BUSINESS":"your-business-name","BELBO_TOKEN":"your-api-token"}}'
```

### Install in Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "belbo": {
      "command": "npx",
      "args": ["belbo-mcp-server"],
      "env": {
        "BELBO_BUSINESS": "your-business-name",
        "BELBO_TOKEN": "your-api-token"
      }
    }
  }
}
```

---

## Features

- **Full Belbo API Coverage**: Appointments, Customers, Services, Employees, Availability, Opening Hours, and Transactions
- **Secure Token Authentication**: API token is stored securely and never exposed in logs
- **One-Click Installation**: Easy setup for Claude Desktop, Cursor, and VS Code
- **Runtime Configuration**: Configure credentials via tool call if not set via environment
- **Robust Error Handling**: Comprehensive error messages with helpful hints
- **TypeScript**: Fully typed for reliability and maintainability

---

## Prerequisites

Before you start, make sure you have:

1. **Node.js 18 or higher** - [Download here](https://nodejs.org/)
2. **A Belbo account** with API access enabled
3. **Your Belbo API token** - See [Getting Your API Token](#getting-your-api-token)

---

## Installation Options

### Option 1: NPX (Recommended)

No installation required! The MCP server runs directly via npx:

```bash
npx belbo-mcp-server
```

### Option 2: Global Install

```bash
npm install -g belbo-mcp-server
```

Then run with:
```bash
belbo-mcp-server
```

### Option 3: From Source

```bash
git clone https://github.com/Zutavern/belbo-mcp-unofficial.git
cd belbo-mcp-unofficial
npm install
npm run build
npm start
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BELBO_BUSINESS` | Your Belbo subdomain (e.g., `demo` for `demo.belbo.com`) | Optional* |
| `BELBO_TOKEN` | Your Belbo API token | Optional* |

*\*If not set via environment, use the `belbo_configure` tool at runtime.*

### Runtime Configuration (Alternative)

If you prefer not to set environment variables, you can configure the connection in your first message:

```json
{
  "mcpServers": {
    "belbo": {
      "command": "npx",
      "args": ["belbo-mcp-server"]
    }
  }
}
```

Then tell your AI assistant:
> "Configure Belbo with business 'mysalon' and token 'abc123'"

---

## 🔑 Getting Your API Token

1. Log in to your Belbo account at `https://YOUR-BUSINESS.belbo.com`
2. Go to **Settings** → **API Access**
3. If the option is not visible, enable it via **Settings** → **Add Function** → **API Access**
4. Click **Create New API Access**
5. Copy the generated token

> **Important**: Store your API token securely. Never commit it to version control or share it publicly.

---

## 🛠️ Available Tools

### Configuration Tools

| Tool | Description |
|------|-------------|
| `belbo_configure` | Set up API connection with business name and token |
| `belbo_test_connection` | Test if the API connection is working |
| `belbo_get_config_status` | Check current configuration status |

### Appointment Management

| Tool | Description |
|------|-------------|
| `belbo_get_appointments` | Get appointments with optional filters (date, employee, customer, status) |
| `belbo_get_appointment` | Get a specific appointment by ID |
| `belbo_create_appointment` | Create a new appointment |
| `belbo_update_appointment` | Update an existing appointment |
| `belbo_delete_appointment` | Delete/cancel an appointment |

### Customer Management

| Tool | Description |
|------|-------------|
| `belbo_get_customers` | Get customers with optional filters |
| `belbo_get_customer` | Get a specific customer by ID |
| `belbo_search_customers` | Search customers by name, email, or phone |
| `belbo_create_customer` | Create a new customer |
| `belbo_update_customer` | Update customer information |
| `belbo_delete_customer` | Delete a customer |

### Services & Employees

| Tool | Description |
|------|-------------|
| `belbo_get_services` | Get all available services/treatments |
| `belbo_get_service` | Get a specific service by ID |
| `belbo_get_employees` | Get all employees/staff members |
| `belbo_get_employee` | Get a specific employee by ID |

### Availability & Scheduling

| Tool | Description |
|------|-------------|
| `belbo_get_availability` | Get available time slots for booking |
| `belbo_get_opening_hours` | Get business opening hours |

### Transactions

| Tool | Description |
|------|-------------|
| `belbo_get_transactions` | Get transactions/cash register entries |
| `belbo_get_transaction` | Get a specific transaction by ID |

---

## Usage Examples

Once configured, you can interact with Belbo using natural language:

### Viewing Appointments

> "Show me all appointments for today"

> "What appointments are scheduled for next Monday?"

> "Show me appointments for employee Maria this week"

### Managing Customers

> "Find customer Max Mustermann"

> "Search for customers with email @gmail.com"

> "Create a new customer: Anna Schmidt, phone 0171-1234567"

### Booking Appointments

> "What time slots are available tomorrow?"

> "Book an appointment for haircut tomorrow at 10:00 for customer ID 123"

> "Show available slots for service ID 456 next week"

### Business Information

> "What are the opening hours?"

> "List all available services"

> "Show me all employees"

### Transactions

> "Show all transactions from last week"

> "Get today's cash register entries"

---

## Date and Time Formats

All dates use **German format** (DD.MM.YYYY):
- `25.12.2024` → December 25, 2024
- `01.01.2025` → January 1, 2025

Times use **24-hour format** (HH:MM):
- `09:00` → 9:00 AM
- `14:30` → 2:30 PM

---

## ⚠️ Error Handling

The server provides detailed error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "Not configured" | Missing API credentials | Use `belbo_configure` or set environment variables |
| "Authentication failed" | Invalid API token | Check your API token in Belbo settings |
| "Business not found" | Invalid business subdomain | Verify your Belbo URL |
| "Network error" | Connection issues | Check internet connection and Belbo service status |

---

## 👨‍💻 Development

```bash
# Clone the repository
git clone https://github.com/Zutavern/belbo-mcp-unofficial.git
cd belbo-mcp-unofficial

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## Security Best Practices

- **Never commit tokens**: Use environment variables or `.env` files (add to `.gitignore`)
- **Use separate tokens**: Create different API tokens for development and production
- **Rotate tokens regularly**: Regenerate API tokens periodically
- **Monitor usage**: Check API access logs in Belbo settings

---

## 🔧 Troubleshooting

### "Not configured" Error

**Problem**: The server doesn't have API credentials.

**Solutions**:
1. Set environment variables `BELBO_BUSINESS` and `BELBO_TOKEN`
2. Or use the `belbo_configure` tool in your first message

### "Authentication failed" Error

**Problem**: The API token is invalid or expired.

**Solutions**:
1. Verify your API token in Belbo Settings → API Access
2. Generate a new token if needed
3. Ensure API Access is enabled in your Belbo account

### "Network error" Error

**Problem**: Cannot connect to Belbo servers.

**Solutions**:
1. Check your internet connection
2. Verify the business subdomain is correct
3. Try accessing `https://YOUR-BUSINESS.belbo.com` in a browser

### MCP Server Not Starting

**Problem**: The server fails to initialize.

**Solutions**:
1. Ensure Node.js 18+ is installed: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Try reinstalling: `npm install -g belbo-mcp-server`

---

## 📚 API Reference

This server is built on the [Belbo REST API](https://hilfe.belbo.com/api-schnittstellen/). For detailed API documentation:

- [Belbo API Help (German)](https://hilfe.belbo.com/api-schnittstellen/)
- [Belbo REST-API on Postman](https://documenter.getpostman.com/view/6150978/RzfmESXY)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ Disclaimer

This is an **unofficial**, community-maintained MCP server for the Belbo API. It is not affiliated with or endorsed by Belbo GmbH.

---

## 💡 Support

- **Issues**: [GitHub Issues](https://github.com/Zutavern/belbo-mcp-unofficial/issues)
- **Belbo Support**: [info@belbo.com](mailto:info@belbo.com)
- **Belbo Help Center**: [hilfe.belbo.com](https://hilfe.belbo.com/)
