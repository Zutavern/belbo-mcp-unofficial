# Belbo MCP Server

A robust Model Context Protocol (MCP) server for the [Belbo Booking API](https://belbo.com). Enables AI assistants like **Claude**, **Cursor**, and other MCP-compatible tools to interact with Belbo calendar and booking systems.

## Features

- **Full Belbo API Coverage**: Appointments, Customers, Services, Employees, Availability, Opening Hours, and Transactions
- **Secure Token Authentication**: API token is stored securely and never exposed in logs
- **One-Click Installation**: Easy setup for Claude Desktop and Cursor
- **Robust Error Handling**: Comprehensive error messages with helpful hints
- **TypeScript**: Fully typed for reliability and maintainability

## Quick Start

### Prerequisites

- Node.js 18 or higher
- A Belbo account with API access enabled
- Your Belbo API token (found in Settings > API Access)

### Installation

#### Option 1: NPX (Recommended)

No installation required! Just configure your AI assistant to use:

```bash
npx belbo-mcp-server
```

#### Option 2: Global Install

```bash
npm install -g belbo-mcp-server
```

#### Option 3: From Source

```bash
git clone https://github.com/your-username/belbo-mcp-unofficial.git
cd belbo-mcp-unofficial
npm install
npm run build
```

## Configuration

### For Claude Desktop

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

**Or configure at runtime** (no env variables needed):

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

Then use the `belbo_configure` tool in your first message:
> "Configure Belbo with business 'mysalon' and token 'abc123'"

### For Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

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

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BELBO_BUSINESS` | Your Belbo subdomain (e.g., `demo` for `demo.belbo.com`) | Optional* |
| `BELBO_TOKEN` | Your Belbo API token | Optional* |

*If not set via environment, use `belbo_configure` tool at runtime.

## Getting Your API Token

1. Log in to your Belbo account
2. Go to **Settings** > **API Access**
3. If not visible, enable it via **Settings** > **Add Function**
4. Create a new API access and copy the token

Your Belbo URL: `https://YOUR-BUSINESS.belbo.com`

## Available Tools

### Configuration

| Tool | Description |
|------|-------------|
| `belbo_configure` | Set up API connection with business name and token |
| `belbo_test_connection` | Test if the API connection is working |
| `belbo_get_config_status` | Check current configuration status |

### Appointments

| Tool | Description |
|------|-------------|
| `belbo_get_appointments` | Get appointments with optional filters (date, employee, customer, status) |
| `belbo_get_appointment` | Get a specific appointment by ID |
| `belbo_create_appointment` | Create a new appointment |
| `belbo_update_appointment` | Update an existing appointment |
| `belbo_delete_appointment` | Delete/cancel an appointment |

### Customers

| Tool | Description |
|------|-------------|
| `belbo_get_customers` | Get customers with optional filters |
| `belbo_get_customer` | Get a specific customer by ID |
| `belbo_search_customers` | Search customers by name, email, or phone |
| `belbo_create_customer` | Create a new customer |
| `belbo_update_customer` | Update customer information |
| `belbo_delete_customer` | Delete a customer |

### Services

| Tool | Description |
|------|-------------|
| `belbo_get_services` | Get all available services/treatments |
| `belbo_get_service` | Get a specific service by ID |

### Employees

| Tool | Description |
|------|-------------|
| `belbo_get_employees` | Get all employees/staff members |
| `belbo_get_employee` | Get a specific employee by ID |

### Availability

| Tool | Description |
|------|-------------|
| `belbo_get_availability` | Get available time slots for booking |

### Business Info

| Tool | Description |
|------|-------------|
| `belbo_get_opening_hours` | Get business opening hours |

### Transactions

| Tool | Description |
|------|-------------|
| `belbo_get_transactions` | Get transactions/cash register entries |
| `belbo_get_transaction` | Get a specific transaction by ID |

## Usage Examples

### With Claude

Once configured, you can ask Claude things like:

- *"Show me all appointments for today"*
- *"Find customer Max Mustermann"*
- *"What services are available?"*
- *"Book an appointment for tomorrow at 10:00 for haircut with employee ID xyz"*
- *"Show available time slots for next Monday"*
- *"Get the opening hours"*
- *"Show all transactions from last week"*

### Example Conversation

**You**: Configure Belbo with business 'mysalon' and token 'abc123xyz'

**Claude**: Successfully configured and connected to mysalon.belbo.com

**You**: Show me tomorrow's appointments

**Claude**: *Uses belbo_get_appointments with tomorrow's date*

## Date Format

All dates use the format **DD.MM.YYYY** (German format), e.g.:
- `25.12.2024` for December 25, 2024
- `01.01.2025` for January 1, 2025

Times use **HH:MM** format (24-hour), e.g.:
- `09:00` for 9 AM
- `14:30` for 2:30 PM

## Error Handling

The server provides detailed error messages:

- **Not configured**: Prompts to use `belbo_configure`
- **Authentication failed**: Hints to check API token
- **Network errors**: Includes status codes and endpoints
- **Invalid parameters**: Shows which parameters are missing/invalid

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Security Notes

- API tokens are never logged or exposed in responses
- Use environment variables for production deployments
- Tokens are sent via HTTPS only
- Consider using separate API tokens for different environments

## Troubleshooting

### "Not configured" Error

Use `belbo_configure` with your business name and token, or set environment variables.

### "Authentication failed" Error

1. Check your API token is correct
2. Verify API access is enabled in Belbo settings
3. Ensure the token hasn't expired

### "Network error"

1. Check your internet connection
2. Verify your business subdomain is correct
3. Ensure Belbo services are operational

## API Reference

This server is based on the [Belbo REST API](https://hilfe.belbo.com/api-schnittstellen/). For detailed API documentation, see [Belbo API on Postman](https://documenter.getpostman.com/view/6150978/RzfmESXY).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This is an unofficial, community-maintained MCP server for the Belbo API. It is not affiliated with or endorsed by Belbo GmbH.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/belbo-mcp-unofficial/issues)
- **Belbo Support**: [info@belbo.com](mailto:info@belbo.com)

---

**Sources**:
- [Belbo API Documentation](https://hilfe.belbo.com/api-schnittstellen/)
- [Belbo REST-API on Postman](https://documenter.getpostman.com/view/6150978/RzfmESXY)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
