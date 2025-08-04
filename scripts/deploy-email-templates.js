#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ZohoClient = require('../src/integrations/zoho-client');

async function deployEmailTemplates() {
  console.log('📧 Deploying Email Templates to Zoho CRM...\n');

  const zohoClient = new ZohoClient(
    process.env.ZOHO_CLIENT_ID,
    process.env.ZOHO_CLIENT_SECRET,
    process.env.ZOHO_REFRESH_TOKEN
  );

  const templatesDir = path.join(__dirname, '../email-templates/generated');
  
  if (!fs.existsSync(templatesDir)) {
    console.log('📁 No email templates directory found');
    return;
  }

  const templateFiles = fs.readdirSync(templatesDir)
    .filter(file => file.endsWith('.html'));

  if (templateFiles.length === 0) {
    console.log('📭 No HTML templates found to deploy');
    return;
  }

  console.log(`📧 Found ${templateFiles.length} template(s) to deploy:`);
  templateFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');

  for (const templateFile of templateFiles) {
    const filePath = path.join(templatesDir, templateFile);
    const templateContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract template name from filename
    const templateName = path.basename(templateFile, '.html')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    console.log(`🔄 Deploying: ${templateName}`);

    try {
      const result = await zohoClient.createEmailTemplate({
        name: templateName,
        subject: `Template: ${templateName}`,
        content: templateContent,
        description: `Auto-deployed from GitHub: ${templateFile}`,
        module: 'Contacts'
      });

      if (result.success) {
        console.log(`✅ Successfully deployed: ${templateName}`);
        
        // Log to Zoho Projects if configured
        if (process.env.ZOHO_PROJECT_ID) {
          await zohoClient.logActivity(process.env.ZOHO_PROJECT_ID, {
            title: 'Email Template Deployed',
            description: `Template "${templateName}" deployed to Zoho CRM from GitHub`,
            hours: '0.5'
          });
        }
      } else {
        console.log(`❌ Failed to deploy ${templateName}:`, result.error);
      }
    } catch (error) {
      console.log(`❌ Error deploying ${templateName}:`, error.message);
    }
  }

  console.log('\n🎉 Email template deployment completed!');
}

if (require.main === module) {
  deployEmailTemplates().catch(console.error);
}

module.exports = deployEmailTemplates;