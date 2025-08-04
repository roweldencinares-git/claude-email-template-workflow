const { Octokit } = require('@octokit/rest');

class GitHubClient {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async createPullRequest(owner, repo, data) {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title: data.title,
        head: data.head,
        base: data.base || 'main',
        body: data.body,
        draft: data.draft || false
      });

      console.log(`PR created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create PR:', error.message);
      throw error;
    }
  }

  async addIssueComment(owner, repo, issueNumber, comment) {
    try {
      const response = await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: comment
      });

      console.log(`Comment added to issue #${issueNumber}`);
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error.message);
      throw error;
    }
  }

  async getIssue(owner, repo, issueNumber) {
    try {
      const response = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get issue:', error.message);
      throw error;
    }
  }

  async getPullRequest(owner, repo, pullNumber) {
    try {
      const response = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get pull request:', error.message);
      throw error;
    }
  }

  async requestReviewers(owner, repo, pullNumber, reviewers) {
    try {
      const response = await this.octokit.rest.pulls.requestReviewers({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers: reviewers
      });

      console.log(`Reviewers requested for PR #${pullNumber}`);
      return response.data;
    } catch (error) {
      console.error('Failed to request reviewers:', error.message);
      throw error;
    }
  }
}

module.exports = GitHubClient;