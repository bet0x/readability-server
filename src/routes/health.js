/* eslint-env node */
const express = require('express');
const metricsTracker = require('../utils/metrics');
const config = require('../config');
const { optionalApiKeyAuth } = require('../middleware/auth');

const router = express.Router();

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

router.get('/metrics', optionalApiKeyAuth, (req, res) => {
  res.json(metricsTracker.getDetailedMetrics());
});

module.exports = router;
