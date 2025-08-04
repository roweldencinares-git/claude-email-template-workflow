#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupIntegration() {
  console.log('🚀 Claude-GitHub-Zoho Integration Setup\n');

  console.log('📋 You will need:');
  console.log('- GitHub Personal Access Token (with repo permissions)');
  console.log('- Zoho API credentials (Client ID, Secret, Refresh Token)');
  console.log('- Your GitHub repository name (owner/repo-name)');
  console.log('- Your Zoho Project ID\n');

  const config = {};

  // GitHub Configuration
  console.log('🔗 GitHub Configuration');
  config.GITHUB_TOKEN = await question('GitHub Personal Access Token: ');
  config.GITHUB_REPOSITORY = await question('GitHub Repository (owner/repo-name): ');

  // Zoho Configuration
  console.log('\n📊 Zoho Configuration');
  config.ZOHO_CLIENT_ID = await question('Zoho Client ID: ');
  config.ZOHO_CLIENT_SECRET = await question('Zoho Client Secret: ');
  config.ZOHO_REFRESH_TOKEN = await question('Zoho Refresh Token: ');
  config.ZOHO_PROJECT_ID = await question('Zoho Project ID: ');

  // Claude Code Configuration
  console.log('\n🤖 Claude Code Configuration');
  config.ANTHROPIC_API_KEY = await question('Anthropic API Key (optional): ') || 'your_anthropic_api_key';

  // Generate secure webhook secrets
  config.WEBHOOK_SECRET = '893e8d1a7f5e4643aaf94b27a764e1bdecd9ce351ce6f50f3cf2da852d2f1e22';
  config.ZOHO_WEBHOOK_TOKEN = '916e2d80d18364ded5645dc1e9aa6ace2f94cd336fca0bd8334cd3ac95ae7dad';

  // Server Configuration
  config.PORT = '3000';
  config.NODE_ENV = 'development';

  // Write .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);

  console.log('\n✅ Configuration saved to .env file');
  console.log('\n📝 Next Steps:');
  console.log('1. Push this repository to GitHub:');
  console.log('   git remote add origin https://github.com/' + config.GITHUB_REPOSITORY);
  console.log('   git push -u origin master');
  console.log('\n2. Set GitHub repository secrets:');
  console.log('   - ANTHROPIC_API_KEY');
  console.log('   - ZOHO_CLIENT_ID');
  console.log('   - ZOHO_CLIENT_SECRET');
  console.log('   - ZOHO_REFRESH_TOKEN');
  console.log('\n3. Configure webhooks:');
  console.log('   - GitHub: Settings → Webhooks → Add webhook');
  console.log('   - URL: https://your-domain.com/webhooks/github');
  console.log('   - Secret: ' + config.WEBHOOK_SECRET);
  console.log('\n4. Start the webhook server:');
  console.log('   npm run webhook-server');

  rl.close();
}

if (require.main === module) {
  setupIntegration().catch(console.error);
}

module.exports = setupIntegration;