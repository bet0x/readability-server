#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup environment file if it doesn't exist
 */
function setupEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }

  // Check if env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ env.example file not found');
    process.exit(1);
  }

  try {
    // Copy env.example to .env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('📝 Please review and update the .env file with your specific configuration');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupEnv();
}

module.exports = { setupEnv };
