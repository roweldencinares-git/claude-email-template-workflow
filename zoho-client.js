const axios = require('axios');

class ZohoClient {
  constructor(clientId, clientSecret, refreshToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this.accessToken = null;
    this.baseUrl = 'https://www.zohoapis.com';
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Zoho access token:', error.message);
      throw error;
    }
  }

  async createEmailTemplate(templateData) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v2/settings/email_templates`,
        {
          email_templates: [{
            name: templateData.name,
            subject: templateData.subject,
            content: templateData.content,
            description: templateData.description,
            module: templateData.module || 'Contacts',
            mail_format: 'html',
            folder: {
              id: process.env.ZOHO_EMAIL_FOLDER_ID || 'default'
            }
          }]
        },
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.email_templates && response.data.email_templates.length > 0) {
        const template = response.data.email_templates[0];
        console.log(`Email template created in Zoho CRM: ${template.id}`);
        return { success: true, template };
      } else {
        throw new Error('No template data returned from Zoho');
      }
    } catch (error) {
      console.error('Failed to create email template:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async updateEmailTemplate(templateId, templateData) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.put(
        `${this.baseUrl}/crm/v2/settings/email_templates/${templateId}`,
        {
          email_templates: [{
            name: templateData.name,
            subject: templateData.subject,
            content: templateData.content,
            description: templateData.description,
            module: templateData.module || 'Contacts',
            mail_format: 'html'
          }]
        },
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Email template updated in Zoho CRM: ${templateId}`);
      return { success: true, template: response.data.email_templates[0] };
    } catch (error) {
      console.error('Failed to update email template:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getEmailTemplates() {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/crm/v2/settings/email_templates`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`
          }
        }
      );

      return response.data.email_templates || [];
    } catch (error) {
      console.error('Failed to get email templates:', error.response?.data || error.message);
      return [];
    }
  }

  async findTemplateByName(templateName) {
    const templates = await this.getEmailTemplates();
    return templates.find(template => template.name === templateName);
  }
}

module.exports = ZohoClient;