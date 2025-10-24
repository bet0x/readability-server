# Deployment Guide

## Docker Deployment

### Using Pre-built Images (Recommended)

The easiest way to deploy is using pre-built Docker images:

#### Docker Hub

```bash
# Pull and run the latest image
docker run -d -p 8000:8000 \
  -e API_TOKEN="your-secure-api-key" \
  barrahome/readability-server:latest

# Or with custom port
docker run -d -p 3000:8000 \
  -e API_TOKEN="your-secure-api-key" \
  -e PORT=8000 \
  barrahome/readability-server:latest
```

#### GitHub Container Registry

```bash
# Pull and run from GitHub Container Registry
docker run -d -p 8000:8000 \
  -e API_TOKEN="your-secure-api-key" \
  ghcr.io/bet0x/readability-server:latest
```

**Available Images:**
- [Docker Hub](https://hub.docker.com/r/barrahome/readability-server) - `barrahome/readability-server`
- [GitHub Container Registry](https://github.com/bet0x/readability-server/pkgs/container/readability-server) - `ghcr.io/bet0x/readability-server`

### Docker Compose (Build from Source)

The project includes a `docker-compose.yml` file in the `deployments/docker/` directory:

```yaml
version: '3.8'
services:
  readability-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    restart: unless-stopped
```

**Deploy with Docker Compose:**
```bash
# Navigate to the docker directory
cd deployments/docker

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Manual Docker

```bash
# Build the image
docker build -f deployments/docker/Dockerfile -t readability-server .

# Run the container
docker run -p 8000:8000 readability-server

# Run with custom environment variables
docker run -p 8000:8000 \
  -e API_TOKEN="your-secure-api-key" \
  -e PORT=8000 \
  readability-server
```

## Production Deployment

### Environment Variables

Set these environment variables for production:

```bash
export API_TOKEN="your-secure-production-api-key"
export PORT=8000
```

### Docker Compose for Production

```yaml
version: '3.8'
services:
  readability-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - API_TOKEN=${API_TOKEN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Scaling

### Horizontal Scaling

You can run multiple instances behind a load balancer:

```yaml
version: '3.8'
services:
  readability-api:
    build: .
    ports:
      - "8000-8002:8000"
    environment:
      - PORT=8000
      - API_TOKEN=${API_TOKEN}
    restart: unless-stopped
    deploy:
      replicas: 3
```

### Performance Considerations

- The API is stateless and can be horizontally scaled
- Each instance can handle multiple concurrent requests
- Consider using a reverse proxy for SSL termination
- Monitor memory usage as HTML parsing can be memory-intensive
