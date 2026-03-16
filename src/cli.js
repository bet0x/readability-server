#!/usr/bin/env node
/* eslint-env node */

// Suppress known deprecation warnings from third-party dependencies
process.on('warning', (warning) => {
  if (warning.code === 'DEP0040' || warning.code === 'DEP0169') return;
  process.stderr.write(`Warning: ${warning.message}\n`);
});

const args = process.argv.slice(2);

function getFlag(name) {
  return args.includes(name);
}

function getFlagValue(name) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  const eq = args.find(a => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  return null;
}

const urlArg = args.find(a => a.startsWith('http://') || a.startsWith('https://'));
const isServer = getFlag('--server');
const isMcp = getFlag('--mcp');
const format = getFlagValue('--format') || 'markdown';
const noVerify = getFlag('--no-verify');

if (noVerify) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (isMcp) {
  require('./mcp');
} else if (urlArg) {
  const config = require('./config');
  const ReadabilityService = require('./services/readabilityService');

  (async () => {
    const service = new ReadabilityService(config);
    try {
      const result = await service.processUrl(urlArg, format);
      process.stdout.write(result.data.content + '\n');
    } catch (err) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
  })();
} else if (isServer || args.length === 0) {
  require('./server').startServer();
} else {
  process.stderr.write(
    'Usage:\n' +
    '  readability-server                                    # start HTTP server\n' +
    '  readability-server --server                           # start HTTP server\n' +
    '  readability-server --mcp                              # start MCP server (stdio)\n' +
    '  readability-server <url>                              # parse URL, output markdown\n' +
    '  readability-server <url> --format <fmt>               # fmt: html | markdown | text\n' +
    '  readability-server <url> --no-verify                  # skip SSL certificate check\n'
  );
  process.exit(1);
}
