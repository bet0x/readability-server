# Installation Guide

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/bet0x/readability-server
cd readability-server

# Start with Docker Compose
docker-compose -f deployments/docker/docker-compose.yml up -d

# The API will be available at http://localhost:8000
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/bet0x/readability-server
cd readability-server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

## Requirements

- Python 3.8+
- Docker (optional, for containerized deployment)

## Dependencies

The project uses minimal dependencies for optimal performance:

- FastAPI - Modern web framework
- BeautifulSoup4 - HTML parsing
- requests - HTTP client
- uvicorn - ASGI server

See `requirements.txt` for exact versions.
