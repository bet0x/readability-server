/* eslint-env node */

const express = require('express');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createMcpServer } = require('../mcp-server');

const router = express.Router();

// Stateless: each request gets its own server + transport instance.
// No session management needed — parse_url has no persistent state.
async function handleMcp(req, res) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createMcpServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  res.on('close', () => server.close().catch(() => {}));
}

router.post('/mcp', express.json(), handleMcp);
router.get('/mcp', handleMcp);
router.delete('/mcp', handleMcp);

module.exports = router;
