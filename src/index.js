/**
 * SFKnowItAll - Main Application Entry Point
 * Salesforce Knowledge Integration with Microsoft Copilot
 */

import dotenv from 'dotenv';
import { CopilotAgent } from './copilotAgent.js';

// Load environment variables
dotenv.config();

/**
 * Main application class
 */
class SFKnowItAll {
  constructor() {
    this.agent = null;
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   */
  loadConfig() {
    const requiredVars = [
      'SF_INSTANCE_URL',
      'SF_CLIENT_ID',
      'SF_CLIENT_SECRET',
      'SF_USERNAME',
      'SF_PASSWORD',
      'SF_SECURITY_TOKEN',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
      console.warn('Please configure your .env file. See .env.example for reference.');
    }

    return {
      instanceUrl: process.env.SF_INSTANCE_URL,
      clientId: process.env.SF_CLIENT_ID,
      clientSecret: process.env.SF_CLIENT_SECRET,
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD,
      securityToken: process.env.SF_SECURITY_TOKEN,
    };
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('Initializing SFKnowItAll...');
      this.agent = new CopilotAgent(this.config);
      await this.agent.initialize();
      console.log('SFKnowItAll initialized successfully!');
      return true;
    } catch (error) {
      console.error('Failed to initialize:', error.message);
      return false;
    }
  }

  /**
   * Search for knowledge articles
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results
   */
  async search(query, maxResults = 5) {
    if (!this.agent) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    try {
      const results = await this.agent.processQuery(query, maxResults);
      return results;
    } catch (error) {
      console.error('Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Get details for a specific article
   * @param {string} articleId - Article ID
   */
  async getArticle(articleId) {
    if (!this.agent) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    try {
      const article = await this.agent.getArticleDetails(articleId);
      return article;
    } catch (error) {
      console.error('Failed to get article:', error.message);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    if (!this.agent) {
      throw new Error('Agent not initialized.');
    }
    return this.agent.getCacheStats();
  }

  /**
   * Clear the cache
   */
  clearCache() {
    if (!this.agent) {
      throw new Error('Agent not initialized.');
    }
    this.agent.clearCache();
  }
}

// Example usage
async function main() {
  const app = new SFKnowItAll();
  
  const initialized = await app.initialize();
  
  if (initialized) {
    console.log('\n--- SFKnowItAll is ready! ---');
    console.log('You can now use the Copilot agent to search Salesforce Knowledge articles.');
    
    // Example search (commented out to avoid errors when credentials are not configured)
    // const results = await app.search('troubleshooting');
    // console.log('Search results:', JSON.stringify(results, null, 2));
  }
}

// Run the application if this is the main module
if (typeof process.argv[1] === 'string' && process.argv[1].endsWith('index.js')) {
  main().catch(console.error);
}

export { SFKnowItAll };
