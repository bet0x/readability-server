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
│   └── server.js               # Server entry point
├── test/                       # Tests
├── docs/                       # Documentation
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

1. **server.js** → Entry point that starts the server
2. **app.js** → Configures the Express application
3. **config/index.js** → Loads configuration
4. **middleware/security.js** → Applies security middleware
5. **routes/index.js** → Mounts all routes
6. **services/readabilityService.js** → Processes content requests

## Refactoring Benefits

- **Separation of concerns**: Each file has a specific responsibility
- **Maintainability**: Code that's easier to maintain and debug
- **Scalability**: Structure that allows adding new features easily
- **Testability**: Isolated components that are easier to test
- **Reusability**: Reusable services and utilities
- **Centralized configuration**: All configuration in one place
