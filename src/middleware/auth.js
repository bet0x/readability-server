/* eslint-env node */
const config = require('../config');

/**
 * API Key authentication middleware
 */
const apiKeyAuth = (req, res, next) => {
  // Skip authentication if not enabled
  if (!config.api.keyAuth.enabled) {
    return next();
  }

  // Get API key from header or Authorization header
  const apiKey = req.headers[config.api.keyAuth.headerName] || 
                 req.headers.authorization?.replace('Bearer ', '') ||
                 req.headers.authorization?.replace('ApiKey ', '');

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide it in the ' + config.api.keyAuth.headerName + ' header or Authorization header.',
      hint: 'Example: ' + config.api.keyAuth.headerName + ': your-api-key-here'
    });
  }

  // Validate API key
  if (apiKey !== config.api.keyAuth.apiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key provided.'
    });
  }

  // API key is valid, continue
  next();
};

/**
 * Optional API Key authentication middleware (doesn't fail if no key provided)
 */
const optionalApiKeyAuth = (req, res, next) => {
  // Skip authentication if not enabled
  if (!config.api.keyAuth.enabled) {
    return next();
  }

  // Get API key from header or Authorization header
  const apiKey = req.headers[config.api.keyAuth.headerName] || 
                 req.headers.authorization?.replace('Bearer ', '') ||
                 req.headers.authorization?.replace('ApiKey ', '');

  // If no API key provided, continue without authentication
  if (!apiKey) {
    return next();
  }

  // Validate API key if provided
  if (apiKey !== config.api.keyAuth.apiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key provided.'
    });
  }

  // API key is valid, continue
  next();
};

module.exports = {
  apiKeyAuth,
  optionalApiKeyAuth
};
