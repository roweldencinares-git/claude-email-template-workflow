const axios = require('axios');

class GitHubClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.github.com';
  }

  async getFileContent(owner, repo, path, ref = 'main') {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3.raw'
          },
          params: { ref }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get file content:', error.message);
      return null;
    }
  }

  async addCommitComment(owner, repo, sha, body) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}/comments`,
        { body },
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      console.log(`Comment added to commit ${sha}: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to add commit comment:', error.message);
      throw error;
    }
  }
}

module.exports = GitHubClient;