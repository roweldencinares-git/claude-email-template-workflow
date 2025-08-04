#!/usr/bin/env node

const ZohoClient = require('../src/integrations/zoho-client');
require('dotenv').config();

async function logCodeReview() {
  const args = process.argv.slice(2);
  const prNumber = args.find(arg => arg.startsWith('--pr-number='))?.split('=')[1];
  const reviewer = args.find(arg => arg.startsWith('--reviewer='))?.split('=')[1] || 'Claude Code';
  const status = args.find(arg => arg.startsWith('--status='))?.split('=')[1] || 'completed';

  if (!prNumber) {
    console.error('❌ PR number is required');
    process.exit(1);
  }

  const zohoClient = new ZohoClient(
    process.env.ZOHO_CLIENT_ID,
    process.env.ZOHO_CLIENT_SECRET,
    process.env.ZOHO_REFRESH_TOKEN
  );

  const projectId = process.env.ZOHO_PROJECT_ID;

  console.log(`Logging code review for PR #${prNumber}`);

  try {
    await zohoClient.logActivity(projectId, {
      title: `Code Review - PR #${prNumber}`,
      description: `Code review ${status} by ${reviewer}\n\nPR: #${prNumber}\nReviewer: ${reviewer}\nStatus: ${status}`,
      hours: '1.0'
    });

    await zohoClient.createTask(projectId, {
      title: `Follow-up: PR #${prNumber} Review`,
      description: `Code review completed for PR #${prNumber}. Address any feedback and merge when ready.`,
      priority: 'Medium'
    });

    console.log('✅ Code review logged to Zoho successfully');
  } catch (error) {
    console.error('❌ Failed to log code review:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  logCodeReview();
}

module.exports = logCodeReview;