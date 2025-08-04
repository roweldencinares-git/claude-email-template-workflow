# Integration Setup Guide

## Phase 1: GitHub Setup
1. Create GitHub repository from this project
2. Install Claude Code GitHub App:
   - Go to repository Settings → GitHub Apps
   - Install "Claude Code" app
   - Grant necessary permissions

## Phase 2: Zapier Automation Setup

### Workflow 1: PR Creation → Zoho CRM
**Trigger:** GitHub - New Pull Request
**Action:** Zoho CRM - Create/Update Record
**Data Mapping:**
- PR Title → Lead Name
- PR Author → Contact Person
- Repository → Company/Project
- PR URL → Reference Link

### Workflow 2: Issue Tracking → Zoho Projects
**Trigger:** GitHub - New Issue
**Action:** Zoho Projects - Create Task
**Data Mapping:**
- Issue Title → Task Name
- Issue Body → Task Description
- Labels → Task Tags
- Assignee → Task Owner

### Workflow 3: Commit Activity → Zoho Logs
**Trigger:** GitHub - New Commit
**Action:** Zoho CRM - Create Activity
**Data Mapping:**
- Commit Message → Activity Subject
- Author → Activity Owner
- Changed Files → Activity Details

## Phase 3: Testing & Validation
1. Create test PR and verify Zoho record creation
2. Open test issue and confirm task generation
3. Make commit and check activity logging

## Configuration URLs
- Zapier: https://zapier.com/app/dashboard
- GitHub Apps: https://github.com/settings/installations
- Zoho API: https://www.zoho.com/developer/