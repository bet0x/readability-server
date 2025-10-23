# API Reference

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer your-api-key-here
```

## Endpoints

### `POST /reader/html`
Returns clean HTML with embedded styles for optimal reading experience.

**Headers:**
```
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:** HTML content with embedded CSS

### `POST /reader/markdown`
Returns content in Markdown format.

**Headers:**
```
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:** Markdown content

### `POST /reader/text`
Returns plain text content.

**Headers:**
```
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:** Plain text content

### `GET /docs`
Interactive API documentation (Swagger UI)

### `GET /redoc`
Alternative API documentation (ReDoc)

## Response Formats

### HTML Response
- Clean, readable HTML with embedded CSS
- Images converted to absolute URLs
- Navigation and ads removed
- Optimized typography

### Markdown Response
- Standard Markdown format
- Images with absolute URLs
- Clean structure without HTML tags

### Text Response
- Plain text content
- No formatting or markup
- Images referenced by URL
