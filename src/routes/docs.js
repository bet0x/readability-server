/* eslint-env node */
const express = require('express');
const { apiReference } = require('@scalar/express-api-reference');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');
const config = require('../config');

const router = express.Router();

// API Documentation endpoints
router.use('/docs', apiReference({
  theme: 'purple',
  spec: {
    content: swaggerSpecs,
  },
  configuration: {
    theme: 'purple',
    showSidebar: true,
    hideDownloadButton: false,
    hideTryItPanel: false
  }
}));

router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Readability Server API',
  swaggerOptions: {
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    showRequestHeaders: true,
    showCommonExtensions: true
  }
}));

/**
 * @swagger
 * /:
 *   get:
 *     summary: API documentation
 *     description: Get API information and available endpoints
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 */
router.get('/', (req, res) => {
  res.json({
    service: 'Readability Server',
    version: config.app.version,
    description: config.app.description,
    documentation: {
      scalar: '/docs',
      swagger: '/swagger'
    },
    endpoints: {
      'GET /health': 'Health check endpoint with basic metrics',
      'GET /metrics': 'Detailed server metrics and statistics',
      'POST /parse-url': 'Fetch HTML from URL and extract readable content in HTML, Markdown, or text format'
    },
    examples: {
      parseUrlHtml: {
        method: 'POST',
        url: '/parse-url',
        body: {
          url: 'https://example.com/article',
          outputFormat: 'html',
          options: {
            debug: false,
            charThreshold: 500
          }
        }
      },
      parseUrlMarkdown: {
        method: 'POST',
        url: '/parse-url',
        body: {
          url: 'https://example.com/article',
          outputFormat: 'markdown',
          options: {
            debug: false,
            charThreshold: 500
          }
        }
      },
      parseUrlText: {
        method: 'POST',
        url: '/parse-url',
        body: {
          url: 'https://example.com/article',
          outputFormat: 'text',
          options: {
            debug: false,
            charThreshold: 500
          }
        }
      }
    }
  });
});

module.exports = router;
