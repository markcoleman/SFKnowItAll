/**
 * Salesforce Knowledge API Client
 * Handles authentication and retrieval of Salesforce Knowledge articles
 */

import axios from 'axios';

export class SalesforceClient {
  constructor(config) {
    this.instanceUrl = config.instanceUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.username = config.username;
    this.password = config.password;
    this.securityToken = config.securityToken;
    this.accessToken = null;
  }

  /**
   * Authenticate with Salesforce using OAuth 2.0 password flow
   */
  async authenticate() {
    try {
      const response = await axios.post(
        `${this.instanceUrl}/services/oauth2/token`,
        null,
        {
          params: {
            grant_type: 'password',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            username: this.username,
            password: `${this.password}${this.securityToken}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Salesforce authentication failed: ${error.message}`);
    }
  }

  /**
   * Search for knowledge articles
   * @param {string} searchTerm - The search query
   * @param {number} limit - Maximum number of results
   */
  async searchKnowledgeArticles(searchTerm, limit = 10) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const query = `SELECT Id, Title, Summary, UrlName FROM Knowledge__kav WHERE PublishStatus = 'Online' AND Title LIKE '%${searchTerm}%' LIMIT ${limit}`;
      
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v58.0/query`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.records;
    } catch (error) {
      throw new Error(`Failed to search knowledge articles: ${error.message}`);
    }
  }

  /**
   * Get a specific knowledge article by ID
   * @param {string} articleId - The article ID
   */
  async getKnowledgeArticle(articleId) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v58.0/sobjects/Knowledge__kav/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get knowledge article: ${error.message}`);
    }
  }

  /**
   * Get all published knowledge articles
   * @param {number} limit - Maximum number of results
   */
  async getAllKnowledgeArticles(limit = 100) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const query = `SELECT Id, Title, Summary, UrlName FROM Knowledge__kav WHERE PublishStatus = 'Online' LIMIT ${limit}`;
      
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v58.0/query`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.records;
    } catch (error) {
      throw new Error(`Failed to get knowledge articles: ${error.message}`);
    }
  }
}
