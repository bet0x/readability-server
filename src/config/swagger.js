/* eslint-env node */
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Readability Server API',
      version: '0.6.0',
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
                debug: {
                  type: 'boolean',
                  description: 'Enable debug logging',
                  default: false
                },
                maxElemsToParse: {
                  type: 'integer',
                  description: 'Maximum number of elements to parse (0 = no limit)',
                  default: 0,
                  minimum: 0
                },
                nbTopCandidates: {
                  type: 'integer',
                  description: 'Number of top candidates to consider',
                  default: 5,
                  minimum: 1
                },
                charThreshold: {
                  type: 'integer',
                  description: 'Minimum number of characters to return result',
                  default: 500,
                  minimum: 0
                },
                classesToPreserve: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'CSS classes to preserve',
                  example: ['caption', 'highlight']
                },
                keepClasses: {
                  type: 'boolean',
                  description: 'Preserve all CSS classes',
                  default: false
                },
                disableJSONLD: {
                  type: 'boolean',
                  description: 'Disable JSON-LD parsing',
                  default: false
                }
              }
            }
          }
        },
        ParseResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the operation was successful',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Article title',
                  example: 'Article Title'
                },
                content: {
                  type: 'string',
                  description: 'Extracted HTML content',
                  example: '<div><h1>Title</h1><p>Content...</p></div>'
                },
                textContent: {
                  type: 'string',
                  description: 'Plain text content',
                  example: 'Title\nContent...'
                },
                length: {
                  type: 'integer',
                  description: 'Content length in characters',
                  example: 1234
                },
                excerpt: {
                  type: 'string',
                  description: 'Article excerpt',
                  example: 'This is an article excerpt...'
                },
                byline: {
                  type: 'string',
                  description: 'Article author',
                  example: 'John Doe'
                },
                dir: {
                  type: 'string',
                  description: 'Text direction (ltr/rtl)',
                  example: 'ltr'
                },
                siteName: {
                  type: 'string',
                  description: 'Website name',
                  example: 'My Blog'
                },
                lang: {
                  type: 'string',
                  description: 'Content language',
                  example: 'en'
                },
                publishedTime: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Publication date',
                  example: '2024-01-01T00:00:00.000Z'
                },
                readerable: {
                  type: 'boolean',
                  description: 'Indicates if content is probably readable',
                  example: true
                },
                sourceUrl: {
                  type: 'string',
                  format: 'uri',
                  description: 'Source URL',
                  example: 'https://example.com/article'
                },
                contentType: {
                  type: 'string',
                  description: 'Content type of the returned content',
                  example: 'markdown'
                },
                outputFormat: {
                  type: 'string',
                  description: 'Requested output format',
                  example: 'markdown'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Invalid input'
            },
            message: {
              type: 'string',
              description: 'Descriptive error message',
              example: 'HTML content is required and must be a string'
            },
            details: {
              type: 'string',
              description: 'Additional error details (development only)',
              example: 'Validation failed'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Server status',
              example: 'ok'
            },
            service: {
              type: 'string',
              description: 'Service name',
              example: 'readability-server'
            },
            version: {
              type: 'string',
              description: 'Service version',
              example: '0.6.0'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Files where endpoints are defined
};

const specs = swaggerJSDoc(options);

module.exports = specs;