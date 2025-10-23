# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Reader View API
- FastAPI-based web service
- Support for HTML, Markdown, and plain text output formats
- Docker and Docker Compose support
- Automatic API documentation with Swagger UI
- Content extraction using BeautifulSoup
- Image URL resolution to absolute URLs
- Clean, readable CSS styling for HTML output

### Features
- `POST /reader/html` - Returns clean HTML with embedded styles
- `POST /reader/markdown` - Returns content in Markdown format
- `POST /reader/text` - Returns plain text content
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative API documentation

### Technical Details
- Pure Python implementation (no Node.js dependencies)
- FastAPI framework for high performance
- BeautifulSoup for HTML parsing
- Multi-step content detection algorithm
- Automatic removal of navigation, ads, and scripts
- Support for semantic HTML elements (`<main>`, `<article>`)
- Fallback content detection strategies

## [1.0.0] - 2025-10-23

### Added
- Initial release
- Core reader view functionality
- Docker containerization
- Comprehensive documentation
- Example usage in multiple languages (cURL, Python, JavaScript)

### Author
- **Alberto Ferrer** - albertof@barrahome.org
- GitHub: [@bet0x](https://github.com/bet0x)

---

## Development Notes

### Content Detection Algorithm
1. Look for semantic HTML elements (`<main>`, `<article>`)
2. Search for common content selectors (`.content`, `.post`, `.entry`)
3. Fall back to `<body>` if no specific content area is found
4. Remove unwanted elements (scripts, styles, navigation, ads)

### Performance Optimizations
- Pure Python implementation for better performance
- Efficient HTML parsing with BeautifulSoup
- Minimal dependencies for faster startup
- Async FastAPI for concurrent request handling

