/* eslint-env node */
require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 8000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  api: {
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      }
    },
    requestTimeout: parseInt(process.env.API_REQUEST_TIMEOUT) || 30000,
    maxContentSize: process.env.API_MAX_CONTENT_SIZE || '10mb',
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (compatible; Mozilla-Readability-Server/1.0.0)',
    fetchTimeout: parseInt(process.env.FETCH_TIMEOUT) || 10000,
    keyAuth: {
      enabled: process.env.API_KEY_AUTH_ENABLED === 'true',
      apiKey: process.env.API_KEY || null,
      headerName: process.env.API_KEY_HEADER || 'x-api-key'
    }
  },

  cors: {
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(','),
    credentials: true
  },

  helmet: {
    contentSecurityPolicy: process.env.HELMET_CSP_ENABLED === 'false' ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.scalar.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    }
  },

  logging: {
    format: process.env.LOG_FORMAT || 'combined'
  },

  app: {
    name: 'readability-server',
    version: '1.0.0',
    description: 'A production-ready REST API server that provides Mozilla Readability functionality to extract readable content from web pages'
  }
};

module.exports = config;
