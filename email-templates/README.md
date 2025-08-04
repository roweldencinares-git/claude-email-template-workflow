# Email Template Workflow

## 🔄 Automated Workflow (Recommended)

### Claude → GitHub → Zoho CRM

1. **Generate Template with Claude**
   - Use prompt templates from `/prompts/` folder
   - Request mobile-responsive HTML with inline CSS
   - Ensure Zoho compatibility (no JS, external CSS)

2. **Commit to GitHub**
   - Save generated HTML to `/generated/` folder
   - Use descriptive commit message: `feat: add Q3 reset invitation template`
   - Push to repository

3. **Automatic Deployment**
   - Webhook detects email template changes
   - Formats HTML for Zoho compatibility
   - Deploys directly to Zoho CRM Email Templates
   - Logs activity in Zoho Projects

---

## 📋 Manual Workflow (Backup)

### When automation isn't available

1. **Generate Template with Claude**
   ```
   Use prompts from /prompts/ folder to generate HTML
   ```

2. **Format for Zoho**
   ```bash
   node scripts/format-for-zoho.js path/to/template.html
   ```

3. **Manual Deployment to Zoho CRM**
   - Login to Zoho CRM
   - Go to **Setup** → **Templates** → **Email Templates**
   - Click **Create Template**
   - Fill in details:
     - **Name**: Descriptive template name
     - **Subject**: Email subject line
     - **Module**: Select appropriate module (Contacts, Leads, etc.)
   - Paste formatted HTML into **Content** field
   - Save template

---

## 📁 Directory Structure

```
email-templates/
├── prompts/                    # Claude prompt templates
│   ├── event-invitation.md
│   ├── newsletter.md
│   └── product-announcement.md
├── generated/                  # Generated HTML templates
│   └── q3-reset-invite.html
└── README.md                   # This documentation
```

---

## 🛠️ Available Prompt Templates

### Event Invitation (`prompts/event-invitation.md`)
For conferences, webinars, company events
- Event details with date/time/location
- Calendar integration CTA
- Professional styling

### Newsletter (`prompts/newsletter.md`)
For regular company updates
- Article grid layout
- Featured content section
- Social media integration

### Product Announcement (`prompts/product-announcement.md`)
For new feature launches
- Product hero image
- Feature highlights
- Launch date information

---

## ✅ Zoho Compatibility Checklist

- ✅ Inline CSS only (no external stylesheets)
- ✅ No JavaScript code
- ✅ No external resources (fonts, images should be hosted)
- ✅ Mobile-responsive design
- ✅ Maximum width: 600px
- ✅ Table-based layout for email clients

---

## 🔧 Troubleshooting

### Template Not Deploying Automatically
1. Check webhook server logs
2. Verify file is in `/generated/` folder
3. Ensure commit message includes keywords: `feat:`, `add:`

### Formatting Issues in Zoho
1. Run format script: `node scripts/format-for-zoho.js template.html`
2. Review compatibility warnings
3. Test in Zoho CRM preview

### Manual Upload Problems
1. Verify HTML is properly formatted
2. Check for unsupported CSS properties
3. Ensure no JavaScript or external dependencies

---

## 🚀 Quick Start

1. **Choose a prompt template** from `/prompts/`
2. **Generate HTML with Claude** using the prompt
3. **Save to `/generated/`** with descriptive filename
4. **Commit and push** - automation handles the rest!

For manual deployment, use the format script then copy/paste into Zoho CRM.