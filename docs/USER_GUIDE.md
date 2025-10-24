# User Guide

## Getting Started

The Readability Server is a REST API that extracts clean, readable content from web pages. This guide will help you get started quickly.

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/bet0x/readability-server
cd readability-server

# Install dependencies
npm install

# Start the server
npm start
```

The server will be available at `http://localhost:8000`

### 2. Basic Usage

Extract content from a web page:

```bash
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "markdown"
  }'
```

## Configuration

### Environment Variables

Create a `.env` file to customize the server:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# API Key Authentication (optional)
API_KEY_AUTH_ENABLED=false
API_KEY=your-secret-key

# Rate Limiting
API_RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_WINDOW_MS=900000

# Security
CORS_ORIGIN=*
```

### API Key Authentication

To protect your API with authentication:

1. **Enable authentication:**
   ```bash
   export API_KEY_AUTH_ENABLED=true
   export API_KEY=my-secret-key-123
   ```

2. **Include the key in requests:**
   ```bash
   curl -X POST http://localhost:8000/api/parse-url \
     -H "x-api-key: my-secret-key-123" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   ```

## API Usage

### Parse URL Endpoint

**POST** `/api/parse-url`

Extract readable content from a web page URL.

#### Request Body

```json
{
  "url": "string (required)",
  "outputFormat": "html|markdown|text (optional, default: html)",
  "options": {
    "debug": false,
    "charThreshold": 500,
    "keepClasses": false
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "title": "Article Title",
    "content": "Extracted content...",
    "contentType": "markdown",
    "textContent": "Plain text content...",
    "length": 1234,
    "excerpt": "Article excerpt...",
    "byline": "Author Name",
    "siteName": "Site Name",
    "lang": "en",
    "readerable": true,
    "sourceUrl": "https://example.com/article"
  }
}
```

### Output Formats

#### HTML (Default)
Returns clean HTML with preserved structure and styling.

#### Markdown
Converts HTML to Markdown format:
- ATX-style headings (`# ## ###`)
- Fenced code blocks
- Inline links
- Preserved formatting

#### Text
Returns plain text content without HTML markup.

## Examples

### Python

```python
import requests

# Basic usage
response = requests.post('http://localhost:8000/api/parse-url', json={
    'url': 'https://example.com/article',
    'outputFormat': 'markdown'
})

data = response.json()
print(data['data']['content'])

# With authentication
headers = {'x-api-key': 'your-api-key'}
response = requests.post('http://localhost:8000/api/parse-url', 
                        json={'url': 'https://example.com/article'},
                        headers=headers)
```

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

// Basic usage
const response = await fetch('http://localhost:8000/api/parse-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/article',
    outputFormat: 'markdown'
  })
});

const data = await response.json();
console.log(data.data.content);

// With authentication
const response = await fetch('http://localhost:8000/api/parse-url', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({ url: 'https://example.com/article' })
});
```

### PHP

```php
<?php
// Basic usage
$data = [
    'url' => 'https://example.com/article',
    'outputFormat' => 'markdown'
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents('http://localhost:8000/api/parse-url', false, $context);
$response = json_decode($result, true);

echo $response['data']['content'];

// With authentication
$data = ['url' => 'https://example.com/article'];
$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\nx-api-key: your-api-key\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];
?>
```

### cURL

```bash
# Basic usage
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "markdown"
  }'

# With authentication
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"url": "https://example.com/article"}'

# With options
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "html",
    "options": {
      "charThreshold": 1000,
      "keepClasses": true,
      "debug": false
    }
  }'
```

## Advanced Configuration

### Readability Options

Customize the content extraction process:

```json
{
  "url": "https://example.com/article",
  "options": {
    "debug": false,                    // Enable debug logging
    "maxElemsToParse": 0,             // Max elements to parse (0 = no limit)
    "nbTopCandidates": 5,             // Number of top candidates to consider
    "charThreshold": 500,             // Minimum characters to return result
    "classesToPreserve": ["caption"], // CSS classes to preserve
    "keepClasses": false,             // Preserve all CSS classes
    "disableJSONLD": false            // Disable JSON-LD parsing
  }
}
```

### Rate Limiting

The server implements rate limiting to prevent abuse:

- **Default:** 100 requests per 15 minutes per IP
- **Configurable:** Via environment variables
- **Scope:** All `/api/*` endpoints

### CORS Configuration

Configure cross-origin requests:

```bash
# Allow all origins (development)
CORS_ORIGIN=*

# Allow specific origins (production)
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

## Monitoring

### Health Check

Check server status:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "service": "readability-server",
  "version": "1.0.0",
  "uptime": 3600,
  "metrics": {
    "totalRequests": 150,
    "successfulParses": 145,
    "failedParses": 5,
    "successRate": "96.67%"
  }
}
```

### Metrics

Get detailed server metrics:

```bash
curl http://localhost:8000/metrics
```

## Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "error": "Invalid input",
  "message": "URL is required and must be a string"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "API key is required. Please provide it in the x-api-key header."
}
```

#### 422 Unprocessable Entity
```json
{
  "error": "Parse failed",
  "message": "Unable to extract readable content from the provided URL",
  "readerable": false
}
```

#### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### Error Handling in Code

```javascript
try {
  const response = await fetch('http://localhost:8000/api/parse-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.message);
    return;
  }
  
  const data = await response.json();
  console.log('Success:', data.data.content);
} catch (error) {
  console.error('Network Error:', error.message);
}
```

## Best Practices

### Performance

- Use appropriate `charThreshold` values
- Implement caching for frequently requested URLs
- Monitor server metrics and performance

### Security

- Enable API key authentication for production
- Use strong, unique API keys
- Configure proper CORS origins
- Monitor for suspicious activity

### Reliability

- Implement retry logic for failed requests
- Handle rate limiting gracefully
- Use appropriate timeouts
- Monitor server health

## Troubleshooting

### Common Issues

1. **Server won't start:**
   - Check if port 3000 is available
   - Verify Node.js version (14+)
   - Check environment variables

2. **Parse failures:**
   - Verify the URL is accessible
   - Check if the page has readable content
   - Try different `charThreshold` values

3. **Authentication errors:**
   - Verify API key is correct
   - Check if authentication is enabled
   - Ensure proper header format

### Getting Help

- **Documentation:** Check `/docs` endpoint for interactive API docs
- **Issues:** Report bugs on GitHub Issues
- **Email:** Contact albertof@barrahome.org for support

## Next Steps

- Explore the [API Documentation](API.md) for detailed endpoint information
- Check the [Deployment Guide](DEPLOYMENT.md) for production setup
- Review the [Architecture](ARCHITECTURE.md) for technical details
