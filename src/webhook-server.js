const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ZohoClient = require('./integrations/zoho-client');
const GitHubClient = require('./integrations/github-client');
const ZohoFormatter = require('../scripts/format-for-zoho');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const zohoClient = new ZohoClient(
  process.env.ZOHO_CLIENT_ID,
  process.env.ZOHO_CLIENT_SECRET,
  process.env.ZOHO_REFRESH_TOKEN
);

const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);

function verifyGitHubSignature(payload, signature, secret) {
  const computedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

app.post('/webhooks/github', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const payload = JSON.stringify(req.body);

  if (!verifyGitHubSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log(`Received GitHub webhook: ${event}`);

  try {
    switch (event) {
      case 'issues':
        await handleIssueEvent(req.body);
        break;
      case 'pull_request':
        await handlePullRequestEvent(req.body);
        break;
      case 'push':
        await handlePushEvent(req.body);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleIssueEvent(payload) {
  const { action, issue, repository } = payload;
  const projectId = process.env.ZOHO_PROJECT_ID;

  if (action === 'opened') {
    await zohoClient.createTask(projectId, {
      title: `GitHub Issue: ${issue.title}`,
      description: `Issue #${issue.number} from ${repository.full_name}\n\n${issue.body}`,
      assignees: issue.assignee ? [issue.assignee.login] : [],
      priority: issue.labels.some(l => l.name === 'priority:high') ? 'High' : 'Medium'
    });

    await zohoClient.logActivity(projectId, {
      title: 'GitHub Issue Created',
      description: `New issue #${issue.number}: ${issue.title}`,
      hours: '0.1'
    });
  }
}

async function handlePullRequestEvent(payload) {
  const { action, pull_request, repository } = payload;
  const projectId = process.env.ZOHO_PROJECT_ID;

  if (action === 'opened') {
    await zohoClient.createTask(projectId, {
      title: `PR Review: ${pull_request.title}`,
      description: `Pull Request #${pull_request.number} from ${repository.full_name}\n\n${pull_request.body}`,
      priority: 'High'
    });

    await githubClient.addIssueComment(
      repository.owner.login,
      repository.name,
      pull_request.number,
      '🔗 **Zoho Integration**: Task created for PR review tracking in Zoho Projects'
    );
  }

  if (action === 'closed' && pull_request.merged) {
    await zohoClient.logActivity(projectId, {
      title: 'Pull Request Merged',
      description: `PR #${pull_request.number} merged: ${pull_request.title}`,
      hours: '2.0'
    });
  }
}

async function handlePushEvent(payload) {
  const { commits, repository, head_commit } = payload;
  const projectId = process.env.ZOHO_PROJECT_ID;

  // Check if push contains email template updates
  const emailTemplateFiles = [];
  for (const commit of commits) {
    const templateFiles = commit.added.concat(commit.modified)
      .filter(file => file.startsWith('email-templates/generated/') && file.endsWith('.html'));
    emailTemplateFiles.push(...templateFiles);
  }

  // Process email templates if found
  if (emailTemplateFiles.length > 0) {
    console.log(`📧 Email template updates detected: ${emailTemplateFiles.join(', ')}`);
    await handleEmailTemplateUpdate(emailTemplateFiles, repository, head_commit);
  }

  // Log standard commit activities
  for (const commit of commits) {
    await zohoClient.logActivity(projectId, {
      title: 'Code Commit',
      description: `Commit ${commit.id.substring(0, 7)}: ${commit.message}`,
      hours: '1.0'
    });
  }
}

app.post('/webhooks/zoho', async (req, res) => {
  const authToken = req.headers['authorization'];
  
  if (authToken !== `Bearer ${process.env.ZOHO_WEBHOOK_TOKEN}`) {
    return res.status(401).json({ error: 'Invalid authorization' });
  }

  console.log('Received Zoho webhook:', req.body);

  try {
    const { event, data } = req.body;

    switch (event) {
      case 'task_update':
        await handleZohoTaskUpdate(data);
        break;
      case 'milestone_change':
        await handleZohoMilestoneChange(data);
        break;
      default:
        console.log(`Unhandled Zoho event: ${event}`);
    }

    res.status(200).json({ message: 'Zoho webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Zoho webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleZohoTaskUpdate(data) {
  if (data.github_issue_number) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    await githubClient.addIssueComment(
      owner,
      repo,
      data.github_issue_number,
      `📋 **Zoho Update**: Task status changed to "${data.status}" in Zoho Projects`
    );
  }
}

async function handleZohoMilestoneChange(data) {
  console.log('Milestone change received from Zoho:', data);
}

async function handleEmailTemplateUpdate(templateFiles, repository, commit) {
  try {
    const formatter = new ZohoFormatter();
    
    for (const templateFile of templateFiles) {
      console.log(`🔄 Processing email template: ${templateFile}`);
      
      // Download template content from GitHub
      const templateContent = await githubClient.getFileContent(
        repository.owner.login,
        repository.name,
        templateFile,
        commit.id
      );
      
      if (!templateContent) {
        console.log(`⚠️  Could not fetch content for ${templateFile}`);
        continue;
      }
      
      // Format for Zoho compatibility
      const cleaned = formatter.cleanHTML(templateContent);
      const issues = formatter.validateInlineCSS(cleaned);
      
      // Extract template name from file path
      const templateName = path.basename(templateFile, '.html')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Deploy to Zoho CRM
      const deployResult = await zohoClient.createEmailTemplate({
        name: templateName,
        subject: `Template: ${templateName}`,
        content: cleaned,
        description: `Auto-generated from GitHub: ${templateFile}`,
        module: 'Contacts'
      });
      
      if (deployResult.success) {
        console.log(`✅ Successfully deployed ${templateName} to Zoho CRM`);
        
        // Log activity in Zoho Projects
        await zohoClient.logActivity(process.env.ZOHO_PROJECT_ID, {
          title: 'Email Template Deployed',
          description: `Template "${templateName}" auto-deployed to Zoho CRM from ${templateFile}`,
          hours: '0.5'
        });
        
        // Add GitHub comment if this was part of a PR
        if (commit.message.includes('feat:') || commit.message.includes('add:')) {
          const [owner, repo] = repository.full_name.split('/');
          await githubClient.addCommitComment(
            owner,
            repo,
            commit.id,
            `📧 **Email Template Deployed**: "${templateName}" has been automatically deployed to Zoho CRM\n\n` +
            (issues.length > 0 ? `⚠️ **Warnings**: ${issues.join(', ')}` : '✅ No compatibility issues detected')
          );
        }
      } else {
        console.error(`❌ Failed to deploy ${templateName}:`, deployResult.error);
      }
    }
    
  } catch (error) {
    console.error('Error processing email template update:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});

module.exports = app;