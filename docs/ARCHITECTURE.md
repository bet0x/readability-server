# Project Architecture

## Directory Structure

```
readability-server/
├── src/                          # Main source code
│   ├── config/                   # Application configuration
│   │   ├── index.js             # Main configuration
│   │   └── swagger.js           # Swagger/OpenAPI configuration
│   ├── middleware/              # Custom middleware
│   │   ├── security.js          # Security middleware
│   │   └── errorHandler.js      # Error handling
│   ├── routes/                  # Route definitions
│   │   ├── index.js            # Main router
│   │   ├── health.js           # Health and metrics routes
│   │   ├── api.js              # Main API routes
│   │   └── docs.js             # Documentation routes
│   ├── services/               # Business logic
│   │   └── readabilityService.js # Readability service
│   ├── utils/                  # Utilities and helpers
│   │   └── metrics.js          # Metrics tracker
│   ├── app.js                  # Express app configuration
│   ├── cli.js                  # Unified entry point (CLI / HTTP server / MCP)
│   ├── mcp.js                  # MCP stdio server (Model Context Protocol)
│   └── server.js               # HTTP server
├── test/                       # Tests
├── docs/                       # Documentation
├── deployments/                # Deployment configs
│   └── docker/                 # Docker & Compose files
├── server.js                   # Legacy entry point (compatibility)
├── package.json
└── README.md
```

## Main Components

### Configuration (`src/config/`)
- **index.js**: Centralized application configuration
- **swagger.js**: API documentation configuration

### Middleware (`src/middleware/`)
- **security.js**: Security configuration (CORS, Helmet, Rate Limiting)
- **errorHandler.js**: Centralized error handling

### Routes (`src/routes/`)
- **index.js**: Main router that mounts all routes
- **health.js**: Health and system metrics endpoints
- **api.js**: Main API endpoints (parse-url)
- **docs.js**: Documentation endpoints (Swagger, Scalar)

### Services (`src/services/`)
- **readabilityService.js**: Business logic for processing web content

### Utilities (`src/utils/`)
- **metrics.js**: Metrics and statistics tracking system

## Application Flow

### HTTP server mode (`node src/cli.js --server` or `npm start`)
1. **cli.js** → Detects `--server` flag (or no args) and delegates to server.js
2. **server.js** → Starts the Express HTTP server
3. **app.js** → Configures Express, middleware, routes
4. **middleware/security.js** → Rate limiting, CORS, Helmet
5. **routes/api.js** → POST /api/parse-url
6. **services/readabilityService.js** → Fetches URL, runs Readability, converts format

### CLI mode (`node src/cli.js <url>`)
1. **cli.js** → Detects URL argument, calls ReadabilityService directly
2. **services/readabilityService.js** → Processes URL
3. stdout → Receives formatted content

### MCP mode (`node src/cli.js --mcp`)
1. **cli.js** → Delegates to mcp.js
2. **mcp.js** → Starts MCP Server with stdio transport
3. Exposes tool `parse_url` → calls ReadabilityService on each invocation
4. Communicates with LLM clients via JSON-RPC over stdin/stdout

## Refactoring Benefits

- **Separation of concerns**: Each file has a specific responsibility
- **Maintainability**: Code that's easier to maintain and debug
- **Scalability**: Structure that allows adding new features easily
- **Testability**: Isolated components that are easier to test
- **Reusability**: Reusable services and utilities
- **Centralized configuration**: All configuration in one place
