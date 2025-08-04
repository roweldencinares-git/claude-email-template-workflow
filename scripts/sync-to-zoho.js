#!/usr/bin/env node

const ZohoClient = require('../src/integrations/zoho-client');
require('dotenv').config();

async function syncGitHubEventToZoho() {
  const zohoClient = new ZohoClient(
    process.env.ZOHO_CLIENT_ID,
    process.env.ZOHO_CLIENT_SECRET,
    process.env.ZOHO_REFRESH_TOKEN
  );

  const projectId = process.env.ZOHO_PROJECT_ID;
  const eventName = process.env.GITHUB_EVENT_NAME;
  const githubRef = process.env.GITHUB_REF;
  const githubSha = process.env.GITHUB_SHA;

  console.log(`Syncing GitHub event: ${eventName}`);

  try {
    switch (eventName) {
      case 'push':
        await zohoClient.logActivity(projectId, {
          title: 'GitHub Push Event',
          description: `Push to ${githubRef}\nCommit: ${githubSha}`,
          hours: '0.5'
        });
        break;

      case 'pull_request':
        const prNumber = process.env.GITHUB_EVENT_PATH ? 
          JSON.parse(require('fs').readFileSync(process.env.GITHUB_EVENT_PATH)).number : 
          'unknown';
        
        await zohoClient.createTask(projectId, {
          title: `PR Review Required #${prNumber}`,
          description: `GitHub Pull Request needs review\nRef: ${githubRef}`,
          priority: 'High'
        });
        break;

      case 'issues':
        const issueNumber = process.env.GITHUB_EVENT_PATH ? 
          JSON.parse(require('fs').readFileSync(process.env.GITHUB_EVENT_PATH)).number : 
          'unknown';
        
        await zohoClient.createTask(projectId, {
          title: `GitHub Issue #${issueNumber}`,
          description: `New GitHub issue requires attention\nRef: ${githubRef}`,
          priority: 'Medium'
        });
        break;

      default:
        console.log(`No sync handler for event: ${eventName}`);
    }

    console.log('✅ Successfully synced to Zoho');
  } catch (error) {
    console.error('❌ Failed to sync to Zoho:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  syncGitHubEventToZoho();
}

module.exports = syncGitHubEventToZoho;