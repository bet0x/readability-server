/* eslint-env node */
const express = require('express');
const config = require('./config');
const { setupSecurity } = require('./middleware/security');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

/**
 * Create and configure Express application
 */
function createApp() {
  const app = express();

  // Setup security middleware
  setupSecurity(app);

  // Body parsing middleware
  app.use(express.json({ limit: config.api.maxContentSize }));
  app.use(express.urlencoded({ extended: true, limit: config.api.maxContentSize }));

  // Mount routes
  app.use('/', routes);

  // Error handling middleware
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
