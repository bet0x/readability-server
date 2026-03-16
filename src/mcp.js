/* eslint-env node */

// In MCP stdio mode all stdout is reserved for JSON-RPC; redirect console to stderr
console.log = (...a) => process.stderr.write(a.join(' ') + '\n');
console.warn = (...a) => process.stderr.write(a.join(' ') + '\n');
console.info = (...a) => process.stderr.write(a.join(' ') + '\n');

const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createMcpServer } = require('./mcp-server');

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP server fatal error: ${err.message}\n`);
  process.exit(1);
});
