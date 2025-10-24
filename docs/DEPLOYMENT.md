# Deployment Guide

## Overview

This guide covers different deployment options for the Readability Server, from local development to production environments.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

## Local Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bet0x/readability-server
cd readability-server

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start development server
npm run dev
```

The server will be available at `http://localhost:8000`

### Environment Configuration

Create a `.env` file based on `env.example`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
API_REQUEST_TIMEOUT=30000
API_MAX_CONTENT_SIZE=10485760

# Security
CORS_ORIGIN=*
HELMET_CSP_ENABLED=true

# API Key Authentication
API_KEY_AUTH_ENABLED=false
API_KEY=your-secret-api-key-here
API_KEY_HEADER=x-api-key

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Readability Options
DEFAULT_CHAR_THRESHOLD=500
DEFAULT_MAX_ELEMS_TO_PARSE=0
DEFAULT_NB_TOP_CANDIDATES=5
DEFAULT_KEEP_CLASSES=false
DEFAULT_DISABLE_JSONLD=false

# External Services
USER_AGENT=Mozilla/5.0 (compatible; Mozilla-Readability-Server/1.0.0)
FETCH_TIMEOUT=10000
```

## Docker Deployment

### Using Docker Compose (Recommended)

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

### Using Docker

```bash
# Build the image
docker build -f deployments/docker/Dockerfile -t readability-server .

# Run the container
docker run -d \
  --name readability-server \
      -p 8000:8000 \
  -e NODE_ENV=production \
  -e API_KEY_AUTH_ENABLED=true \
  -e API_KEY=your-secret-key \
  readability-server
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  readability-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEY_AUTH_ENABLED=true
      - API_KEY=${API_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN:-*}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Production Deployment

### Environment Setup

1. **Set production environment:**
   ```bash
   export NODE_ENV=production
   ```

2. **Configure security:**
   ```bash
   export API_KEY_AUTH_ENABLED=true
   export API_KEY=your-strong-secret-key
   export CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
   ```

3. **Set up reverse proxy (nginx example):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Configure SSL/TLS:**
   ```bash
   # Using Let's Encrypt with certbot
   certbot --nginx -d yourdomain.com
   ```

### Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/server.js --name readability-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Using systemd

Create `/etc/systemd/system/readability-server.service`:

```ini
[Unit]
Description=Readability Server
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/path/to/readability-server
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable readability-server
sudo systemctl start readability-server
```

### Monitoring and Logging

#### Health Checks

The server provides health check endpoints:

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed metrics
curl http://localhost:8000/metrics
```

#### Log Management

For production, consider using a log aggregation service:

```bash
# Using PM2 with log rotation
pm2 install pm2-logrotate

# Or using logrotate
sudo logrotate -f /etc/logrotate.d/readability-server
```

#### Monitoring

Set up monitoring for:
- Server uptime
- Response times
- Error rates
- Memory usage
- CPU usage

Example monitoring script:

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:8000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Server is healthy"
    exit 0
else
    echo "Server health check failed: $RESPONSE"
    exit 1
fi
```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance:**
   - Ubuntu 20.04 LTS
   - t3.micro (for testing) or t3.small+ (for production)
   - Security group with port 3000 open

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx certbot python3-certbot-nginx
   ```

3. **Deploy application:**
   ```bash
   git clone https://github.com/bet0x/readability-server
   cd readability-server
   npm install
   npm run build
   ```

4. **Configure nginx and SSL**

### Google Cloud Platform

1. **Create Compute Engine instance**
2. **Deploy using Cloud Build:**
   ```yaml
   # cloudbuild.yaml
   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'gcr.io/$PROJECT_ID/readability-server', '.']
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'gcr.io/$PROJECT_ID/readability-server']
   ```

### DigitalOcean

1. **Create Droplet:**
   - Ubuntu 20.04
   - Basic plan ($5/month minimum)

2. **Deploy using Docker:**
   ```bash
   docker run -d \
     --name readability-server \
     -p 80:3000 \
     -e NODE_ENV=production \
     gcr.io/your-project/readability-server
   ```

## Performance Optimization

### Production Settings

```bash
# Optimize for production
export NODE_ENV=production
export API_RATE_LIMIT_MAX_REQUESTS=1000
export API_MAX_CONTENT_SIZE=50mb
export FETCH_TIMEOUT=30000
```

### Caching

Consider implementing caching for frequently requested URLs:

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

// Cache parsed content for 1 hour
const cacheKey = `readability:${url}`;
const cached = await client.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

### Load Balancing

For high-traffic deployments, use a load balancer:

```nginx
upstream readability_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://readability_backend;
    }
}
```

## Security Considerations

### Production Security Checklist

- [ ] Enable API key authentication
- [ ] Use strong, unique API keys
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup configuration and data

### Environment Variables Security

```bash
# Use strong API keys
export API_KEY=$(openssl rand -base64 32)

# Restrict CORS origins
export CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# Enable all security features
export HELMET_CSP_ENABLED=true
export API_KEY_AUTH_ENABLED=true
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   # Fix file permissions
   chmod +x src/server.js
   ```

3. **Memory issues:**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 src/server.js
   ```

### Logs

Check application logs:

```bash
# PM2 logs
pm2 logs readability-server

# Docker logs
docker logs readability-server

# Systemd logs
journalctl -u readability-server -f
```

### Health Checks

```bash
# Check if server is running
curl -f http://localhost:8000/health

# Check detailed metrics
curl http://localhost:8000/metrics
```
