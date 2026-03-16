# Changelog

All notable changes to the Readability Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-03-16

### Added
- **MCP over HTTP**: `POST /mcp` endpoint using Streamable HTTP transport — exposes `parse_url` remotely to any MCP-compatible client without a separate process
- **MCP SSE stream**: `GET /mcp` for clients that support Server-Sent Events streaming
- Docker deployments now serve both REST API and MCP from the same container on port 8000
- `src/mcp-server.js` shared factory used by both stdio and HTTP transports
- `/mcp` endpoint documented in OpenAPI spec (Scalar + Swagger UI)
- Remote MCP configuration documented in DEPLOYMENT.md (`{ "url": "https://your-server/mcp" }`)

### Changed
- `src/mcp.js` refactored to use shared `createMcpServer()` factory

## [1.1.0] - 2026-03-16

### Added
- **CLI mode**: parse a URL directly from the terminal via `node src/cli.js <url>`
  - `--format html|markdown|text` flag (default: markdown)
  - `--no-verify` flag to skip SSL certificate verification
- **MCP server**: expose `parse_url` tool via Model Context Protocol stdio transport (`--mcp` flag)
  - Compatible with Claude Desktop, Continue, and any MCP client
  - Default output format is markdown, optimised for LLM consumption
- Unified entry point `src/cli.js` — single binary for CLI, HTTP server, and MCP modes
- `bin` field in `package.json` for global install via `npm install -g`

### Changed
- Replaced `swagger-jsdoc` with a static OpenAPI spec object — eliminates `url.parse` deprecation warning and removes the `swagger-parser` dependency chain
- Upgraded `jsdom` from `20.0.2` to `29.0.0` — eliminates `punycode` deprecation warning
- Docker base image updated from `node:20` to `node:22-slim`
- Docker `npm ci --only=production` updated to `npm ci --omit=dev` (flag was deprecated in npm 7+)
- `npm start`, `dev`, and `prod` scripts now use `src/cli.js --server`
- Fixed `pushRepo` in `.release-it.json` (was pointing to Mozilla's upstream repo)
- Fixed `filename` path in `.release-it.json` to `docs/CHANGELOG.md`

### Removed
- `swagger-jsdoc` dependency and all `@swagger` JSDoc annotations from route files
- Debug `console.log('Response content:', ...)` leftover in `readabilityService.js`

## [1.0.0] - 2024-01-24

### Added
- Initial release of Readability Server
- REST API for content extraction
- Multiple output formats (HTML, Markdown, Text)
- Health check and metrics endpoints
- Rate limiting and security middleware
- Docker support
- Comprehensive documentation

### Features
- **Content Processing:** Extract readable content from web pages
- **Multiple Formats:** HTML, Markdown, and plain text output
- **API Documentation:** Interactive Scalar and Swagger UI
- **Monitoring:** Health checks and detailed metrics
- **Security:** Rate limiting, CORS, security headers
- **Docker:** Containerized deployment support

### Technical Details
- Built with Node.js and Express
- Uses Mozilla's Readability algorithm
- Supports async processing
- Configurable via environment variables
- Production-ready with proper error handling

## [0.6.0] - 2025-03-03 (Mozilla Readability)

### Added
- Parsely tags as a fallback metadata source
- Improved data table support
- Link density value modification option
- Better HTML character unescaping
- Jekyll footnotes support
- Schema.org context objects handling
- Article author metadata inclusion
- JSONLD Arrays handling

### Fixed
- JSONLD parse process when context URL includes trailing slash
- Short paragraphs of legitimate content exclusion
- Byline metadata leading to deletion of lookalike content
- Headers removal on GitLab
- Broken JSONLD context handling
- Invalid attributes breaking parsing

### Performance
- Various performance improvements
- Optimized parsing algorithms
- Reduced memory usage
- Faster content processing

## [0.5.0] - 2023-12-15 (Mozilla Readability)

### Added
- Published time metadata
- Expanded comma detection to non-Latin commas

### Fixed
- Detection of elements hidden with `style="visibility: hidden"`

## [0.4.4] - 2023-03-31 (Mozilla Readability)

### Fixed
- Undefined `li_count` variable breaking use in Cloudflare workers

## [0.4.3] - 2023-03-22 (Mozilla Readability)

### Added
- AllowedVideoRegex option to override default
- Updated TypeScript type information

### Fixed
- `aria-modal` cookie dialogs interfering with readability
- Lists of images not showing
- Script and noscript removal simplification

### Changed
- Updated dependencies

## [0.4.2] - 2022-02-09 (Mozilla Readability)

### Added
- Root element's `lang` attribute in parse() output
- Article tags support in `isProbablyReadable`

### Fixed
- Compatibility with DOM implementations where `childNodes` property is not live
- Lazily-loaded image references no longer use `alt` attribute

### Improved
- JSON-LD support with better element parsing
- Prefer using headline for article title

## [0.4.1] - 2021-01-13 (Mozilla Readability)

### Added
- TypeScript type definition file (`.d.ts`)

## [0.4.0] - 2020-12-23 (Mozilla Readability)

### Added
- `isProbablyReaderable` options object configuration
- Better support for deeply-nested content
- Tables of content support
- Better support for content in `<code>` tags
- H1 tags preservation

### Changed
- JSON-LD support for multiple authors improved
- Elements with specific roles (menu, menubar, complementary, navigation, alert, alertdialog, dialog) are now removed

## [0.3.0] - 2020-08-05 (Mozilla Readability)

### Added
- First NPM published version
- Consistent versioning system

---

**Note:** Versions 0.3.0 through 0.6.0 are based on Mozilla's Readability library. The Readability Server (v1.0.0+) is a separate project that uses Mozilla's Readability algorithm in a REST API server implementation.