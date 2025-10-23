# Configuration Guide

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_TOKEN` | API key for authentication | `"your-secret-api-key-here"` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |

## Setting up Authentication

### Local Development

```bash
# Set your API token
export API_TOKEN="your-secure-api-key-here"

# Run the server
python server.py
```

### Docker with Authentication

```bash
# Run with custom API token
docker run -p 8000:8000 \
  -e API_TOKEN="your-secure-api-key" \
  readability-server

# Or with docker-compose
API_TOKEN="your-secure-api-key" docker-compose up
```

### Production Setup

```bash
# Create a secure API token
export API_TOKEN=$(openssl rand -hex 32)

# Start the service
docker-compose up -d
```

## Security Best Practices

### API Token Security

1. **Use Strong Tokens**: Generate cryptographically secure random tokens
2. **Rotate Regularly**: Change API tokens periodically
3. **Environment Variables**: Never hardcode tokens in source code
4. **Access Control**: Limit token access to necessary services only

### Example Token Generation

```bash
# Generate a secure 32-byte hex token
openssl rand -hex 32

# Or using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## Content Processing Configuration

The API automatically handles:

- **Content Detection**: Identifies main content areas using semantic HTML
- **URL Resolution**: Converts relative URLs to absolute URLs
- **Content Cleaning**: Removes navigation, ads, and scripts
- **Format Conversion**: Supports HTML, Markdown, and plain text output

### Content Detection Algorithm

1. Look for semantic HTML elements (`<main>`, `<article>`)
2. Search for common content selectors (`.content`, `.post`, `.entry`)
3. Fall back to `<body>` if no specific content area is found
4. Remove unwanted elements (scripts, styles, navigation, ads)

## Performance Tuning

### Memory Optimization

- The API processes HTML in memory
- Large pages may require more memory
- Consider setting memory limits in Docker

### Request Timeout

- Default timeout is handled by FastAPI
- Large pages may take longer to process
- Consider implementing request timeouts for production

## Monitoring

### Health Checks

The API provides built-in health endpoints:

- `GET /docs` - API documentation
- `GET /redoc` - Alternative documentation

### Logging

Enable detailed logging by setting:

```bash
export LOG_LEVEL=DEBUG
```

### Metrics

Consider adding monitoring for:
- Request count and response times
- Memory usage
- Error rates
- Content processing success rates
