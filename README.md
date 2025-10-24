# Reader View API

A modern, fast API for extracting clean, readable content from web pages - similar to Firefox's Reader View.

## Features

- 🚀 **FastAPI** - Modern, fast web framework with automatic documentation
- 📖 **Reader View** - Extract main content from any web page
- 🎨 **Multiple Formats** - HTML, Markdown, and plain text output
- 🖼️ **Image Support** - Preserves images with absolute URLs
- 🔐 **API Key Protection** - Secure endpoints with Bearer token authentication
- 🌐 **CORS Support** - Cross-origin resource sharing enabled
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose
- ⚡ **High Performance** - Pure Python implementation, no Node.js required
- 🤖 **MCP Support** - Model Context Protocol integration for AI assistants

## Quick Start

### Using Pre-built Docker Image (Recommended)

```bash
# Pull and run the latest image from Docker Hub
docker run -d -p 8000:8000 \
  -e API_TOKEN="your-secret-api-key-here" \
  barrahome/readability-server:latest
```

### Using Docker Compose

```bash
# Clone and start with Docker Compose
git clone https://github.com/bet0x/readability-server
cd readability-server
docker-compose -f deployments/docker/docker-compose.yml up -d
```

### Using GitHub Container Registry

```bash
# Pull from GitHub Container Registry
docker run -d -p 8000:8000 \
  -e API_TOKEN="your-secret-api-key-here" \
  ghcr.io/bet0x/readability-server:latest
```

The API will be available at http://localhost:8000

**🐳 Docker Images Available:**
- [Docker Hub](https://hub.docker.com/r/barrahome/readability-server) - `barrahome/readability-server`
- [GitHub Container Registry](https://github.com/bet0x/readability-server/pkgs/container/readability-server) - `ghcr.io/bet0x/readability-server`

## Documentation

- [Installation Guide](docs/installation.md) - Setup and installation instructions
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Usage Examples](docs/usage-examples.md) - Code examples in multiple languages
- [Deployment Guide](docs/deployment.md) - Docker and production deployment
- [Configuration](docs/configuration.md) - Environment variables and settings
- [MCP Integration](docs/mcp-integration.md) - Model Context Protocol for AI assistants

## How It Works

1. **Content Extraction**: Uses BeautifulSoup to parse HTML and identify main content areas
2. **Content Cleaning**: Removes navigation, ads, and other non-essential elements
3. **URL Resolution**: Converts relative URLs to absolute URLs for images and links
4. **Format Conversion**: Converts HTML to Markdown or plain text as requested
5. **Styling**: Applies clean, readable CSS for HTML output
6. **MCP Integration**: Exposes endpoints as tools for AI assistants via Model Context Protocol

## Performance

- **Pure Python**: No Node.js dependencies
- **FastAPI**: High-performance async framework
- **Efficient Parsing**: Optimized HTML parsing with BeautifulSoup
- **Minimal Dependencies**: Only essential packages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Alberto Ferrer**
- Email: albertof@barrahome.org
- GitHub: [@bet0x](https://github.com/bet0x)

## Acknowledgments

- Inspired by Mozilla's Readability algorithm
- Built with [FastAPI](https://fastapi.tiangolo.com/)
- HTML parsing powered by [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/)