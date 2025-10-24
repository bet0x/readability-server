/* eslint-env node */

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
};

/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
