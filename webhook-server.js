const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ZohoClient = require('./zoho-client');
const GitHubClient = require('./github-client');
const ZohoFormatter = require('./format-for-zoho');

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

  console.log(`📧 Received GitHub webhook: ${event}`);

  try {
    if (event === 'push') {
      await handlePushEvent(req.body);
    } else {
      console.log(`ℹ️  Ignoring event: ${event} - only processing push events for email templates`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handlePushEvent(payload) {
  const { commits, repository, head_commit } = payload;

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
  } else {
    console.log('ℹ️  No email template changes detected in this push');
  }
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
      
      // Check if template already exists
      const existingTemplate = await zohoClient.findTemplateByName(templateName);
      
      let deployResult;
      if (existingTemplate) {
        console.log(`🔄 Updating existing template: ${templateName}`);
        deployResult = await zohoClient.updateEmailTemplate(existingTemplate.id, {
          name: templateName,
          subject: `Template: ${templateName}`,
          content: cleaned,
          description: `Auto-updated from GitHub: ${templateFile}`,
          module: 'Contacts'
        });
      } else {
        console.log(`➕ Creating new template: ${templateName}`);
        deployResult = await zohoClient.createEmailTemplate({
          name: templateName,
          subject: `Template: ${templateName}`,
          content: cleaned,
          description: `Auto-generated from GitHub: ${templateFile}`,
          module: 'Contacts'
        });
      }
      
      if (deployResult.success) {
        console.log(`✅ Successfully deployed ${templateName} to Zoho CRM`);
        
        // Add GitHub comment with deployment status
        if (commit.message.includes('feat:') || commit.message.includes('add:') || commit.message.includes('update:')) {
          const [owner, repo] = repository.full_name.split('/');
          await githubClient.addCommitComment(
            owner,
            repo,
            commit.id,
            `📧 **Email Template Deployed**: "${templateName}" has been automatically ${existingTemplate ? 'updated' : 'created'} in Zoho CRM\n\n` +
            (issues.length > 0 ? `⚠️ **Warnings**: ${issues.join(', ')}` : '✅ No compatibility issues detected')
          );
        }
      } else {
        console.error(`❌ Failed to deploy ${templateName}:`, deployResult.error);
        
        // Add error comment to GitHub
        const [owner, repo] = repository.full_name.split('/');
        await githubClient.addCommitComment(
          owner,
          repo,
          commit.id,
          `❌ **Email Template Deployment Failed**: "${templateName}" could not be deployed to Zoho CRM\n\nError: ${deployResult.error}`
        );
      }
    }
    
  } catch (error) {
    console.error('Error processing email template update:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Claude Email Template Workflow',
    timestamp: new Date().toISOString() 
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Claude Email Template Workflow',
    description: 'Automated deployment of Claude-generated email templates to Zoho CRM',
    endpoints: {
      '/webhooks/github': 'GitHub webhook for email template updates',
      '/health': 'Health check endpoint'
    },
    repository: 'https://github.com/roweldencinares-git/claude-email-template-workflow'
  });
});

app.listen(PORT, () => {
  console.log(`📧 Claude Email Template Workflow server running on port ${PORT}`);
  console.log(`🔗 GitHub webhook endpoint: http://localhost:${PORT}/webhooks/github`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;