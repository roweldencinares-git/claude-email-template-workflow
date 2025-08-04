# Claude Code Project Standards

## Project Overview
Integration project connecting Claude Code, GitHub, and Zoho for automated workflow management.

## Code Standards
- Use clear, descriptive commit messages
- Follow conventional commit format: `type(scope): description`
- Include issue numbers in commit messages when applicable

## Automation Rules
- Auto-create PRs for feature branches
- Sync GitHub activities with Zoho CRM
- Trigger Zoho notifications for PR reviews
- Log development progress in Zoho projects

## Integration Points
1. **GitHub → Zoho**: PR creation, issue updates, commits
2. **Zoho → GitHub**: Project milestones, task assignments
3. **Claude Code**: Automated code reviews, implementation assistance

## Workflow Triggers
- New issues → Zoho task creation
- PR merged → Zoho project update
- Code reviews → Zoho activity log
- Release tags → Zoho milestone tracking