const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function testConnections() {
  console.log('🔍 Testing API Connections...\n');
  
  // Test GitHub configuration
  console.log('GitHub Configuration:');
  console.log('- Token:', process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET');
  console.log('- Repository:', process.env.GITHUB_REPOSITORY || 'NOT SET');
  
  // Test Zoho configuration
  console.log('\nZoho Configuration:');
  console.log('- Client ID:', process.env.ZOHO_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('- Client Secret:', process.env.ZOHO_CLIENT_SECRET ? 'SET' : 'NOT SET');
  console.log('- Refresh Token:', process.env.ZOHO_REFRESH_TOKEN ? 'SET' : 'NOT SET');
  console.log('- Project ID:', process.env.ZOHO_PROJECT_ID ? 'SET' : 'NOT SET');
  
  // Test webhook configuration
  console.log('\nWebhook Configuration:');
  console.log('- GitHub Secret:', process.env.WEBHOOK_SECRET ? 'SET' : 'NOT SET');
  console.log('- Zoho Token:', process.env.ZOHO_WEBHOOK_TOKEN ? 'SET' : 'NOT SET');
  
  console.log('\nIntegration Status:');
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_personal_access_token') {
    console.log('✅ GitHub: Ready');
  } else {
    console.log('❌ GitHub: Needs configuration');
  }
  
  if (process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_ID !== 'your_zoho_client_id') {
    console.log('✅ Zoho: Ready');
  } else {
    console.log('❌ Zoho: Needs configuration');
  }
}

testConnections().catch(console.error);