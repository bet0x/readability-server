/* eslint-env node */
const express = require('express');
const metricsTracker = require('../utils/metrics');
const config = require('../config');
const { optionalApiKeyAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check server status and basic metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server running correctly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', optionalApiKeyAuth, (req, res) => {
  const metrics = metricsTracker.getHealthMetrics();
  
  res.json({ 
    status: 'ok', 
    service: config.app.name,
    version: config.app.version,
    timestamp: new Date().toISOString(),
    uptime: metricsTracker.getMetrics().uptime,
    metrics
  });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Server metrics
 *     description: Get detailed server metrics and statistics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server metrics
 */
router.get('/metrics', optionalApiKeyAuth, (req, res) => {
  res.json(metricsTracker.getDetailedMetrics());
});

module.exports = router;
