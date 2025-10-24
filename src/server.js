/* eslint-env node */
const createApp = require('./app');
const config = require('./config');
const metricsTracker = require('./utils/metrics');

/**
 * Start the server
 */
function startServer() {
  const app = createApp();
  
  const server = app.listen(config.server.port, config.server.host, () => {
    console.log('🚀 Readability Server v' + config.app.version);
    console.log(`📍 Running on ${config.server.host}:${config.server.port}`);
    console.log(`🌍 Environment: ${config.server.environment}`);
    console.log('');
    console.log('📚 Documentation:');
    console.log(`   • Scalar API Docs: http://localhost:${config.server.port}/docs`);
    console.log(`   • Swagger UI: http://localhost:${config.server.port}/swagger`);
    console.log('');
    console.log('🔧 Endpoints:');
    console.log(`   • Health Check: http://localhost:${config.server.port}/health`);
    console.log(`   • Metrics: http://localhost:${config.server.port}/metrics`);
    console.log(`   • Parse URL: http://localhost:${config.server.port}/api/parse-url`);
    console.log('');
    console.log('✅ Server ready to accept requests!');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      metricsTracker.cleanup();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      metricsTracker.cleanup();
      process.exit(0);
    });
  });

  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer, createApp };
