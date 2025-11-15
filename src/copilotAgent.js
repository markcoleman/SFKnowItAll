/**
 * Microsoft Copilot Agent Connector
 * Handles integration with Microsoft Copilot to serve knowledge articles
 */

import { SalesforceClient } from './salesforceClient.js';

export class CopilotAgent {
  constructor(salesforceConfig) {
    this.sfClient = new SalesforceClient(salesforceConfig);
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Initialize the agent by authenticating with Salesforce
   */
  async initialize() {
    try {
      await this.sfClient.authenticate();
      console.log('Copilot Agent initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Copilot Agent: ${error.message}`);
    }
  }

  /**
   * Process a user query and return relevant knowledge articles
   * @param {string} query - User's search query
   * @param {number} maxResults - Maximum number of results to return
   */
  async processQuery(query, maxResults = 5) {
    const cacheKey = `${query}_${maxResults}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached results');
        return cached.data;
      }
    }

    try {
      const articles = await this.sfClient.searchKnowledgeArticles(query, maxResults);
      
      const formattedResults = this.formatArticlesForCopilot(articles);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: formattedResults,
        timestamp: Date.now(),
      });

      return formattedResults;
    } catch (error) {
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  /**
   * Format articles for Copilot consumption
   * @param {Array} articles - Raw Salesforce knowledge articles
   */
  formatArticlesForCopilot(articles) {
    return {
      results: articles.map(article => ({
        id: article.Id,
        title: article.Title,
        summary: article.Summary || 'No summary available',
        url: article.UrlName ? `knowledge/article/${article.UrlName}` : null,
      })),
      count: articles.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a specific article by ID for detailed view
   * @param {string} articleId - The article ID
   */
  async getArticleDetails(articleId) {
    try {
      const article = await this.sfClient.getKnowledgeArticle(articleId);
      return this.formatArticleDetails(article);
    } catch (error) {
      throw new Error(`Failed to get article details: ${error.message}`);
    }
  }

  /**
   * Format detailed article information
   * @param {Object} article - Raw Salesforce article
   */
  formatArticleDetails(article) {
    return {
      id: article.Id,
      title: article.Title,
      summary: article.Summary || 'No summary available',
      url: article.UrlName ? `knowledge/article/${article.UrlName}` : null,
      publishStatus: article.PublishStatus,
      lastModifiedDate: article.LastModifiedDate,
    };
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}
