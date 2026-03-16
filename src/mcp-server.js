/* eslint-env node */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const ReadabilityService = require('./services/readabilityService');
const config = require('./config');

/**
 * Factory — creates a fully configured MCP Server instance.
 * Call once per transport connection (stdio or HTTP).
 */
function createMcpServer() {
  const readabilityService = new ReadabilityService(config);

  const server = new Server(
    { name: 'readability-server', version: config.app.version },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'parse_url',
        description:
          'Fetch and extract readable content from a web URL using Mozilla Readability. ' +
          'Removes ads, navigation, and clutter. Returns clean content ready for an LLM.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The web URL to fetch and parse',
            },
            format: {
              type: 'string',
              enum: ['html', 'markdown', 'text'],
              description: 'Output format (default: markdown)',
            },
          },
          required: ['url'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'parse_url') {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const { url, format = 'markdown' } = request.params.arguments ?? {};

    if (!url || typeof url !== 'string') {
      throw new Error('url parameter is required');
    }

    const result = await readabilityService.processUrl(url, format);
    const { title, content, excerpt, siteName, publishedTime, byline } = result.data;

    let text = '';
    if (title) text += `# ${title}\n\n`;
    if (byline) text += `*${byline}*\n\n`;
    if (siteName) text += `**Source:** ${siteName}\n\n`;
    if (publishedTime) text += `**Published:** ${publishedTime}\n\n`;
    if (excerpt) text += `> ${excerpt}\n\n---\n\n`;
    text += content;

    return {
      content: [{ type: 'text', text }],
    };
  });

  return server;
}

module.exports = { createMcpServer };
