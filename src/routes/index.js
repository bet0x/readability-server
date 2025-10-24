/* eslint-env node */
const express = require('express');
const healthRoutes = require('./health');
const apiRoutes = require('./api');
const docsRoutes = require('./docs');

const router = express.Router();

// Mount route modules
router.use('/', docsRoutes);
router.use('/', healthRoutes);
router.use('/api', apiRoutes);

module.exports = router;
