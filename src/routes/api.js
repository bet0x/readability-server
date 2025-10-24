/* eslint-env node */
const express = require('express');
const ReadabilityService = require('../services/readabilityService');
const metricsTracker = require('../utils/metrics');
const config = require('../config');
const { apiKeyAuth } = require('../middleware/auth');

const router = express.Router();
const readabilityService = new ReadabilityService(config);

/**
 * @swagger
 * /api/parse-url:
 *   post:
 *     summary: Parse content from URL
 *     description: Fetch HTML from URL and extract readable content in different formats
 *     tags: [Content Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParseUrlRequest'
 *     responses:
 *       200:
 *         description: Content parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParseResponse'
 *       400:
 *         description: Invalid input or URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Parse failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/parse-url', apiKeyAuth, async (req, res) => {
  metricsTracker.incrementRequests();
  
  try {
    const { url, outputFormat = 'html', options = {} } = req.body;

    // Input validation
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'URL is required and must be a string'
      });
    }

    const result = await readabilityService.processUrl(url, outputFormat, options);
    
    metricsTracker.incrementSuccessfulParses();
    res.json(result);

  } catch (error) {
    metricsTracker.incrementFailedParses();
    console.error('Parse URL error:', error);
    
    // Handle different error types
    if (error.message.includes('Output format must be one of')) {
      return res.status(400).json({
        error: 'Invalid output format',
        message: error.message
      });
    }
    
    if (error.message.includes('Please provide a valid URL')) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: error.message
      });
    }
    
    if (error.message.includes('Failed to fetch URL')) {
      return res.status(400).json({
        error: 'Fetch failed',
        message: error.message
      });
    }
    
    if (error.message.includes('Unable to extract readable content')) {
      return res.status(422).json({
        error: 'Parse failed',
        message: error.message,
        readerable: false
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing the request',
      details: config.server.environment === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
