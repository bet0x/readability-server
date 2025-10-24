# MCP Integration Guide

## What is MCP?

Model Context Protocol (MCP) is a standard that enables AI models to interact with external tools and services. With MCP support, your Reader View API can be used directly by AI assistants like Claude, Cursor, and other MCP-compatible tools.

## Features

- **AI Integration**: Use your API directly from AI assistants
- **Authentication Preserved**: MCP endpoints respect your existing API key authentication
- **Zero Configuration**: Works out of the box with your existing FastAPI setup
- **Tool Discovery**: AI models can automatically discover and use your endpoints

## How It Works

The MCP server exposes your FastAPI endpoints as tools that AI models can call. Each endpoint becomes a tool with:

- **Name**: Based on your endpoint function names
- **Description**: From your FastAPI documentation
- **Parameters**: Automatically extracted from your Pydantic models
- **Authentication**: Uses your existing Bearer token system

## Available MCP Tools

When connected to an MCP-compatible AI assistant, the following tools will be available:

### `reader_html`
- **Description**: Extract clean HTML content from a web page
- **Parameters**: `url` (string) - The URL to extract content from
- **Returns**: Clean HTML with embedded styles

### `reader_markdown`
- **Description**: Extract content from a web page in Markdown format
- **Parameters**: `url` (string) - The URL to extract content from
- **Returns**: Markdown formatted content

### `reader_text`
- **Description**: Extract plain text content from a web page
- **Parameters**: `url` (string) - The URL to extract content from
- **Returns**: Plain text content

## Setup Instructions

### For AI Assistants (Claude, Cursor, etc.)

1. **Add MCP Server**: Configure your AI assistant to connect to your Reader View API
2. **Server URL**: `https://your-api-domain.com/mcp`
3. **Authentication**: Use your API token as Bearer token

### Example Configuration

#### For Claude Desktop
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "readability-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch", "https://your-api-domain.com/mcp"],
      "env": {
        "AUTHORIZATION": "Bearer your-api-key-here"
      }
    }
  }
}
```

#### For Cursor
Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "readability-server": {
      "url": "https://your-api-domain.com/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key-here"
      }
    }
  }
}
```

## Usage Examples

### With Claude
```
Claude, please extract the main content from this article: https://example.com/article
```

### With Cursor
```
@readability-server Can you convert this webpage to markdown: https://example.com/page
```

## Authentication

MCP endpoints use the same authentication as your regular API:

- **Header**: `Authorization: Bearer your-api-key-here`
- **Environment Variable**: Set `API_TOKEN` when configuring your MCP client
- **Security**: Same security model as your existing API endpoints

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your API token is correct
   - Check that the token is being passed in the Authorization header

2. **Connection Refused**
   - Ensure your API server is running
   - Verify the MCP endpoint is accessible at `/mcp`

3. **Tool Not Found**
   - Check that the MCP server is properly mounted
   - Verify your FastAPI app is running with MCP support

### Debug Mode

Enable debug logging by setting:
```bash
export LOG_LEVEL=DEBUG
```

## Advanced Configuration

### Custom MCP Mount Path

You can customize the MCP endpoint path:

```python
# In your server.py
mcp.mount(path="/custom-mcp")
```

### Selective Endpoint Exposure

To expose only specific endpoints to MCP:

```python
# In your server.py
mcp = FastApiMCP(app, include_endpoints=["reader_markdown", "reader_text"])
```

## Security Considerations

- **API Keys**: Always use strong, unique API keys
- **HTTPS**: Use HTTPS in production for secure communication
- **Rate Limiting**: Consider implementing rate limiting for MCP endpoints
- **Access Control**: Monitor MCP usage and implement access controls as needed

## Support

For issues with MCP integration:

1. Check the [FastAPI-MCP documentation](https://github.com/tadata-org/fastapi_mcp)
2. Review your AI assistant's MCP configuration
3. Verify your API server logs for errors
4. Test your API endpoints directly before using MCP
