# API Documentation

## Overview

The Readability Server provides a REST API for extracting clean, readable content from web pages using Mozilla's Readability algorithm.

## Base URL

```
http://localhost:8000
```

## Authentication

### API Key Authentication (Optional)

The API supports optional API key authentication to protect endpoints:

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_KEY_AUTH_ENABLED` | `false` | Enable/disable API key authentication |
| `API_KEY` | - | Secret API key for authentication |
| `API_KEY_HEADER` | `x-api-key` | Header name for API key |

#### Authentication Methods

1. **Header Authentication:**
   ```
   x-api-key: your-api-key-here
   ```

2. **Bearer Token Authentication:**
   ```
   Authorization: Bearer your-api-key-here
   ```

#### Example

```bash
# Enable authentication
export API_KEY_AUTH_ENABLED=true
export API_KEY=my-secret-key-123

# Make authenticated request
curl -X POST http://localhost:8000/api/parse-url \
  -H "x-api-key: my-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Endpoints

### Content Processing

#### Parse URL

Extract readable content from a web page URL.

**Endpoint:** `POST /api/parse-url`

**Authentication:** Required (if enabled)

**Request Body:**

```json
{
  "url": "string (required)",
  "outputFormat": "html|markdown|text (optional, default: html)",
  "options": {
    "debug": "boolean (optional, default: false)",
    "maxElemsToParse": "number (optional, default: 0)",
    "nbTopCandidates": "number (optional, default: 5)",
    "charThreshold": "number (optional, default: 500)",
    "classesToPreserve": "array (optional, default: [])",
    "keepClasses": "boolean (optional, default: false)",
    "disableJSONLD": "boolean (optional, default: false)"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "title": "string",
    "content": "string",
    "contentType": "html|markdown|text",
    "textContent": "string",
    "length": "number",
    "excerpt": "string",
    "byline": "string",
    "dir": "ltr|rtl",
    "siteName": "string",
    "lang": "string",
    "publishedTime": "ISO 8601 date string",
    "readerable": "boolean",
    "sourceUrl": "string",
    "outputFormat": "string"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input or URL
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - Invalid API key
- `422 Unprocessable Entity` - Parse failed
- `500 Internal Server Error` - Server error

### System

#### Health Check

Check server status and basic metrics.

**Endpoint:** `GET /health`

**Authentication:** Optional

**Response (200 OK):**

```json
{
  "status": "ok",
  "service": "readability-server",
  "version": "1.0.0",
  "timestamp": "ISO 8601 date string",
  "uptime": "number (seconds)",
  "metrics": {
    "totalRequests": "number",
    "successfulParses": "number",
    "failedParses": "number",
    "successRate": "string (percentage)"
  }
}
```

#### Metrics

Get detailed server metrics and statistics.

**Endpoint:** `GET /metrics`

**Authentication:** Optional

**Response (200 OK):**

```json
{
  "service": "readability-server",
  "version": "1.0.0",
  "timestamp": "ISO 8601 date string",
  "uptime": "number (seconds)",
  "startTime": "ISO 8601 date string",
  "metrics": {
    "totalRequests": "number",
    "successfulParses": "number",
    "failedParses": "number",
    "successRate": "string (percentage)",
    "averageRequestsPerMinute": "string"
  },
  "system": {
    "nodeVersion": "string",
    "platform": "string",
    "arch": "string",
    "memoryUsage": "object",
    "cpuUsage": "object"
  }
}
```

### Documentation

#### API Information

Get API information and available endpoints.

**Endpoint:** `GET /`

**Authentication:** None

**Response (200 OK):**

```json
{
  "service": "Readability Server",
  "version": "1.0.0",
  "description": "string",
  "documentation": {
    "scalar": "/docs",
    "swagger": "/swagger"
  },
  "endpoints": "object",
  "examples": "object"
}
```

#### Interactive Documentation

- **Scalar API Docs:** `GET /docs`
- **Swagger UI:** `GET /swagger`

## Error Handling

All error responses follow this format:

```json
{
  "error": "string (error type)",
  "message": "string (descriptive message)",
  "details": "string (optional, development only)"
}
```

### Common Error Types

- `Invalid input` - Missing or invalid request parameters
- `Invalid URL` - Malformed URL provided
- `Invalid output format` - Unsupported output format
- `Fetch failed` - Unable to fetch content from URL
- `Parse failed` - Unable to extract readable content
- `Unauthorized` - Missing API key
- `Forbidden` - Invalid API key
- `Too many requests` - Rate limit exceeded
- `Internal server error` - Unexpected server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (configurable)
- **Limit:** 100 requests per IP per window (configurable)
- **Scope:** All `/api/*` endpoints

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Content Types

### HTML Output

Returns clean HTML with preserved structure and styling.

### Markdown Output

Converts HTML to Markdown format with:
- ATX-style headings (`# ## ###`)
- Fenced code blocks
- Inline links
- Preserved formatting

### Text Output

Returns plain text content without HTML markup.

## Examples

### Basic Usage

```bash
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "markdown"
  }'
```

### With Authentication

```bash
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "html",
    "options": {
      "charThreshold": 1000,
      "keepClasses": true
    }
  }'
```

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics

```bash
curl http://localhost:8000/metrics
```
