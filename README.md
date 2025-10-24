# Readability Server

A production-ready REST API server that provides Mozilla Readability functionality to extract readable content from web pages in HTML, Markdown, or text format.

## 🚀 Features

- **Multiple Output Formats**: HTML, Markdown, or plain text
- **Production Ready**: Rate limiting, compression, security headers, logging
- **Interactive Documentation**: Scalar and Swagger UI
- **Metrics & Monitoring**: Health checks and detailed metrics
- **Docker Support**: Ready for containerized deployment
- **Configurable**: Environment-based configuration
- **Async Processing**: Handles multiple concurrent requests
- **Clean Architecture**: Well-organized, maintainable codebase

## 📦 Installation

### Quick Start with Docker (Recommended)

```bash
# Pull and run the latest image
docker run -d \
  --name readability-server \
  -p 8000:8000 \
  -e API_KEY_AUTH_ENABLED=true \
  -e API_KEY=your-secret-key \
  barrahome/readability-server:latest
```

**Docker Hub**: [https://hub.docker.com/r/barrahome/readability-server](https://hub.docker.com/r/barrahome/readability-server)

### Manual Installation

#### Prerequisites

- Node.js 18+ 
- npm or yarn

#### Setup

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

## 🔧 Configuration

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `NODE_ENV` | development | Environment mode |
| `API_RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `API_RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `API_REQUEST_TIMEOUT` | 30000 | Request timeout (ms) |
| `API_MAX_CONTENT_SIZE` | 10mb | Max request body size |
| `CORS_ORIGIN` | * | CORS allowed origins |
| `USER_AGENT` | Mozilla/5.0... | User agent for requests |
| `FETCH_TIMEOUT` | 10000 | Fetch timeout (ms) |
| `API_KEY_AUTH_ENABLED` | false | Enable API key authentication |
| `API_KEY` | - | Secret API key for authentication |
| `API_KEY_HEADER` | x-api-key | Header name for API key |

## 📚 Documentation

### Interactive Documentation

- **Scalar API Docs**: `http://localhost:8000/docs`
- **Swagger UI**: `http://localhost:8000/swagger`

### Complete Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Quick start and usage examples
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Architecture](docs/ARCHITECTURE.md)** - Project structure
- **[Changelog](docs/CHANGELOG.md)** - Version history

### Endpoints

#### `POST /api/parse-url`

Extract readable content from a URL.

**Authentication:**
- API Key (if enabled): `x-api-key: your-api-key` or `Authorization: Bearer your-api-key`

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "outputFormat": "markdown",
  "options": {
    "debug": false,
    "charThreshold": 500,
    "keepClasses": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Article Title",
    "content": "# Article Title\n\nContent...",
    "contentType": "markdown",
    "textContent": "Article Title\n\nContent...",
    "length": 1234,
    "excerpt": "Article excerpt...",
    "byline": "Author Name",
    "dir": "ltr",
    "siteName": "Site Name",
    "lang": "en",
    "publishedTime": "2024-01-01T00:00:00.000Z",
    "readerable": true,
    "sourceUrl": "https://example.com/article",
    "outputFormat": "markdown"
  }
}
```

#### `GET /health`

Health check with basic metrics.

#### `GET /metrics`

Detailed server metrics and statistics.

## 🏗️ Architecture

The project follows a clean, modular architecture:

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic
├── utils/           # Utility functions
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🐳 Docker Deployment

### Using Pre-built Docker Image (Quickest)

The easiest way to deploy is using the pre-built image from Docker Hub:

```bash
# Pull the latest image
docker pull barrahome/readability-server:latest

# Run the container
docker run -d \
  --name readability-server \
  -p 8000:8000 \
  -e API_KEY_AUTH_ENABLED=true \
  -e API_KEY=your-secret-key \
  barrahome/readability-server:latest
```

**Docker Hub Repository**: [https://hub.docker.com/r/barrahome/readability-server](https://hub.docker.com/r/barrahome/readability-server)

### Using Docker Compose

```bash
# Navigate to docker directory
cd deployments/docker

# Start the server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

### Building from Source

```bash
# Build the image
docker build -f deployments/docker/Dockerfile -t readability-server .

# Run the container
docker run -d \
  --name readability-server \
  -p 8000:8000 \
  -e API_KEY_AUTH_ENABLED=true \
  -e API_KEY=your-secret-key \
  readability-server
```

## 🛠️ Development

### Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run prod       # Start production server with NODE_ENV=production
npm test           # Run tests
npm run lint       # Run linter
npm run lint:fix   # Fix linting issues
```

### Testing

```bash
# Run all tests
npm test

# Run server tests
npm run test:server

# Test with curl
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "outputFormat": "markdown"}'
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics

```bash
curl http://localhost:8000/metrics
```

### Logs

The server uses Morgan for HTTP request logging. In production, consider using a log aggregation service.

## 🔒 Security

- **API Key Authentication**: Optional API key protection
- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents abuse
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Request validation
- **Content Security Policy**: XSS protection

### API Key Authentication

The server supports optional API key authentication to protect your endpoints:

1. **Enable authentication** by setting `API_KEY_AUTH_ENABLED=true` in your environment
2. **Set your API key** with `API_KEY=your-secret-key`
3. **Include the key** in requests using either:
   - Header: `x-api-key: your-secret-key`
   - Authorization header: `Authorization: Bearer your-secret-key`

**Example:**
```bash
# Enable API key authentication
export API_KEY_AUTH_ENABLED=true
export API_KEY=my-super-secret-key-123

# Make authenticated request
curl -X POST http://localhost:8000/api/parse-url \
  -H "x-api-key: my-super-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Note:** When API key authentication is disabled (default), all endpoints are publicly accessible.

## 🚀 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up reverse proxy (nginx/traefik)
4. Configure SSL/TLS
5. Set up monitoring and logging

### Performance

- **Compression**: Gzip compression enabled
- **Rate Limiting**: Configurable rate limits
- **Memory Management**: Efficient memory usage
- **Async Processing**: Non-blocking operations

## 📈 Usage Examples

### Python Client

```python
import requests

# With API key authentication (if enabled)
headers = {
    'x-api-key': 'your-api-key-here',
    'Content-Type': 'application/json'
}

response = requests.post('http://localhost:8000/api/parse-url', 
                        json={
                            'url': 'https://example.com/article',
                            'outputFormat': 'markdown'
                        },
                        headers=headers)

data = response.json()
print(data['data']['content'])
```

### JavaScript Client

```javascript
// With API key authentication (if enabled)
const response = await fetch('http://localhost:8000/api/parse-url', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    url: 'https://example.com/article',
    outputFormat: 'markdown'
  })
});

const data = await response.json();
console.log(data.data.content);
```

### cURL

```bash
# With API key authentication (if enabled)
curl -X POST http://localhost:8000/api/parse-url \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "markdown",
    "options": {
      "charThreshold": 500
    }
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Apache-2.0 License

## 👨‍💻 Author

**Alberto Ferrer**
- Email: albertof@barrahome.org
- GitHub: [@bet0x](https://github.com/bet0x)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/bet0x/readability-server/issues)
- **Documentation**: `/docs` endpoint
- **Health Check**: `/health` endpoint

## 🔄 Migration from Previous Version

If you're migrating from a previous version:

1. Update dependencies: `npm install`
2. Copy your environment variables to `.env`
3. Update any custom configurations
4. Test the new endpoints
5. Update your client applications

The API is backward compatible, but new features are available in v1.0.0.