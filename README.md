# Claude Email Template Workflow

🤖 **Automated workflow for generating, versioning, and deploying email templates from Claude to Zoho CRM via GitHub.**

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/roweldencinares-git/claude-email-template-workflow.git
   cd claude-email-template-workflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Interactive setup**
   ```bash
   node setup.js
   ```

4. **Start the webhook server**
   ```bash
   npm run webhook-server
   ```

---

## 🔄 How It Works

### Automated Workflow: Claude → GitHub → Zoho CRM

1. **Generate Template with Claude**
   - Use prompt templates from `email-templates/prompts/`
   - Request mobile-responsive HTML with inline CSS
   - Ensure Zoho compatibility (no JS, external CSS)

2. **Commit to GitHub**
   - Save generated HTML to `email-templates/generated/`
   - Use descriptive commit message: `feat: add newsletter template`
   - Push to repository

3. **Automatic Integration**
   - GitHub Actions trigger Claude Code reviews
   - Webhook detects email template changes
   - Formats HTML for Zoho compatibility
   - Deploys directly to Zoho CRM Email Templates
   - Creates Zoho project tasks for tracking

---

## 📂 Project Structure

```
claude-email-template-workflow/
├── .github/workflows/              # GitHub Actions for automation
├── src/
│   ├── integrations/              # API clients
│   │   ├── github-client.js
│   │   └── zoho-client.js
│   └── webhook-server.js          # Express server for webhooks
├── scripts/                       # Automation scripts
├── email-templates/               # Template storage
│   ├── prompts/                   # Claude prompt templates
│   └── generated/                 # Generated HTML templates
├── config/integration.json        # Integration configuration
├── setup.js                      # Interactive setup script
└── README.md
```

---

## 🔧 Setup & Configuration

### Option 1: Interactive Setup (Recommended)
```bash
node setup.js
```

### Option 2: Manual Configuration
1. **Environment Variables** - Copy `.env.example` to `.env` and fill in:
   ```env
   GITHUB_TOKEN=your_github_token
   GITHUB_REPOSITORY=roweldencinares-git/claude-email-template-workflow
   ZOHO_CLIENT_ID=your_zoho_client_id
   ZOHO_CLIENT_SECRET=your_zoho_client_secret
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
   ZOHO_PROJECT_ID=your_zoho_project_id
   WEBHOOK_SECRET=your_webhook_secret
   ZOHO_WEBHOOK_TOKEN=your_zoho_webhook_token
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

2. **GitHub Repository Secrets** - Set in repository settings:
   - `ANTHROPIC_API_KEY`
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET` 
   - `ZOHO_REFRESH_TOKEN`

3. **Webhooks** - Configure in GitHub repository settings:
   - URL: `https://your-domain.com/webhooks/github`
   - Events: Push, Issues, Pull Requests
   - Secret: Use generated `WEBHOOK_SECRET`

---

## 🤖 Claude Code Integration Features

- **Automatic Code Reviews** - Claude reviews all PRs for security, performance, integration
- **Auto-PR Creation** - Feature branches automatically create PRs
- **Zoho Activity Logging** - All GitHub activities logged in Zoho Projects
- **Email Template Deployment** - Automatic formatting and deployment to Zoho CRM

---

## 📋 Available Scripts

```bash
npm run webhook-server    # Start webhook server
npm run sync-zoho        # Sync GitHub events to Zoho
npm start               # Start main application
npm run dev             # Development mode with nodemon
npm test               # Run tests
npm run lint           # Check code style
npm run typecheck      # TypeScript checking
```

---

## 🔧 Troubleshooting

### Integration Not Working
1. Check GitHub Actions logs in repository
2. Verify all repository secrets are set
3. Test webhook server: `npm run webhook-server`
4. Check Zoho API credentials and permissions

### Template Deployment Issues
1. Ensure file is in `email-templates/generated/` folder
2. Use commit messages with keywords: `feat:`, `add:`, `update:`
3. Check webhook delivery logs in GitHub

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤖 Generated with Claude Code

This integration was built with [Claude Code](https://claude.ai/code) - Anthropic's official CLI for Claude.
