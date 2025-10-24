/* eslint-env node */
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const config = require('../config');

/**
 * Security middleware setup
 */
const setupSecurity = (app) => {
  // Compression middleware
  app.use(compression());
  
  // Logging middleware
  app.use(morgan(config.logging.format));

  // Rate limiting
  const limiter = rateLimit(config.api.rateLimit);
  app.use('/api/', limiter);

  // Helmet for security headers
  app.use(helmet(config.helmet));

  // CORS configuration
  app.use(cors(config.cors));
};

module.exports = {
  setupSecurity
};
