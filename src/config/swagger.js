/* eslint-env node */
const config = require('./index');

const specs = {
  openapi: '3.0.0',
  info: {
    title: 'Readability Server API',
    version: config.app.version,
    description: 'A REST API server that provides Mozilla Readability functionality to extract readable content from web pages.',
    contact: {
      name: 'Alberto Ferrer',
      email: 'albertof@barrahome.org',
      url: 'https://github.com/bet0x/readability-server'
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://opensource.org/licenses/Apache-2.0'
    },
    externalDocs: {
      description: 'GitHub Repository',
      url: 'https://github.com/bet0x/readability-server'
    }
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'Content Processing', description: 'URL parsing and content extraction' },
    { name: 'System', description: 'Health, metrics, and documentation' }
  ],
  paths: {
    '/': {
      get: {
        summary: 'API information',
        description: 'Get API information and available endpoints',
        tags: ['System'],
        responses: {
          200: { description: 'API information' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check endpoint',
        description: 'Check server status and basic metrics',
        tags: ['System'],
        responses: {
          200: {
            description: 'Server running correctly',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' }
              }
            }
          }
        }
      }
    },
    '/metrics': {
      get: {
        summary: 'Server metrics',
        description: 'Get detailed server metrics and statistics',
        tags: ['System'],
        responses: {
          200: { description: 'Server metrics' }
        }
      }
    },
    '/api/parse-url': {
      post: {
        summary: 'Parse content from URL',
        description: 'Fetch HTML from URL and extract readable content in different formats',
        tags: ['Content Processing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParseUrlRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Content parsed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ParseResponse' }
              }
            }
          },
          400: {
            description: 'Invalid input or URL',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          422: {
            description: 'Parse failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key as Bearer token'
      }
    },
    schemas: {
      ParseUrlRequest: {
        type: 'object',
        required: ['url'],
        properties: {
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL of the article to process',
            example: 'https://example.com/article'
          },
          outputFormat: {
            type: 'string',
            enum: ['html', 'markdown', 'text'],
            description: 'Output format for the extracted content',
            default: 'html',
            example: 'markdown'
          },
          options: {
            type: 'object',
            description: 'Configuration options for the parser',
            properties: {
              debug: { type: 'boolean', description: 'Enable debug logging', default: false },
              maxElemsToParse: { type: 'integer', description: 'Maximum elements to parse (0 = no limit)', default: 0, minimum: 0 },
              nbTopCandidates: { type: 'integer', description: 'Number of top candidates to consider', default: 5, minimum: 1 },
              charThreshold: { type: 'integer', description: 'Minimum characters to return result', default: 500, minimum: 0 },
              classesToPreserve: { type: 'array', items: { type: 'string' }, description: 'CSS classes to preserve', example: ['caption', 'highlight'] },
              keepClasses: { type: 'boolean', description: 'Preserve all CSS classes', default: false },
              disableJSONLD: { type: 'boolean', description: 'Disable JSON-LD parsing', default: false }
            }
          }
        }
      },
      ParseResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              title: { type: 'string', example: 'Article Title' },
              content: { type: 'string', example: '<div><h1>Title</h1><p>Content...</p></div>' },
              contentType: { type: 'string', example: 'markdown' },
              textContent: { type: 'string', example: 'Title\nContent...' },
              length: { type: 'integer', example: 1234 },
              excerpt: { type: 'string', example: 'This is an article excerpt...' },
              byline: { type: 'string', example: 'John Doe' },
              dir: { type: 'string', example: 'ltr' },
              siteName: { type: 'string', example: 'My Blog' },
              lang: { type: 'string', example: 'en' },
              publishedTime: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
              readerable: { type: 'boolean', example: true },
              sourceUrl: { type: 'string', format: 'uri', example: 'https://example.com/article' },
              outputFormat: { type: 'string', example: 'markdown' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid input' },
          message: { type: 'string', example: 'URL is required and must be a string' },
          details: { type: 'string', description: 'Additional error details (development only)' }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'readability-server' },
          version: { type: 'string', example: '1.0.0' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

module.exports = specs;
