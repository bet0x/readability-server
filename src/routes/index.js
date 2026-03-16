/* eslint-env node */
const express = require('express');
const healthRoutes = require('./health');
const apiRoutes = require('./api');
const docsRoutes = require('./docs');
const mcpRoutes = require('./mcp');

const router = express.Router();

// Mount route modules
router.use('/', docsRoutes);
router.use('/', healthRoutes);
router.use('/api', apiRoutes);
router.use('/', mcpRoutes);

module.exports = router;
