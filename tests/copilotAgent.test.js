/**
 * Unit tests for CopilotAgent
 */

import { CopilotAgent } from '../src/copilotAgent.js';
import { SalesforceClient } from '../src/salesforceClient.js';

// Mock SalesforceClient
jest.mock('../src/salesforceClient.js');

describe('CopilotAgent', () => {
  let agent;
  const mockConfig = {
    instanceUrl: 'https://test.salesforce.com',
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    username: 'test@example.com',
    password: 'testpassword',
    securityToken: 'testtoken',
  };

  beforeEach(() => {
    SalesforceClient.mockClear();
    agent = new CopilotAgent(mockConfig);
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const mockAuthenticate = jest.fn().mockResolvedValue('token');
      agent.sfClient.authenticate = mockAuthenticate;

      await agent.initialize();

      expect(mockAuthenticate).toHaveBeenCalled();
    });

    it('should throw error when initialization fails', async () => {
      const mockAuthenticate = jest.fn().mockRejectedValue(new Error('Auth failed'));
      agent.sfClient.authenticate = mockAuthenticate;

      await expect(agent.initialize()).rejects.toThrow(
        'Failed to initialize Copilot Agent'
      );
    });
  });

  describe('processQuery', () => {
    it('should process query and return formatted results', async () => {
      const mockArticles = [
        {
          Id: '123',
          Title: 'Test Article',
          Summary: 'Test Summary',
          UrlName: 'test-article',
        },
      ];

      const mockSearch = jest.fn().mockResolvedValue(mockArticles);
      agent.sfClient.searchKnowledgeArticles = mockSearch;

      const results = await agent.processQuery('test', 5);

      expect(mockSearch).toHaveBeenCalledWith('test', 5);
      expect(results.results).toHaveLength(1);
      expect(results.results[0].title).toBe('Test Article');
      expect(results.count).toBe(1);
    });

    it('should use cached results when available', async () => {
      const mockArticles = [{ Id: '123', Title: 'Cached' }];
      const mockSearch = jest.fn().mockResolvedValue(mockArticles);
      agent.sfClient.searchKnowledgeArticles = mockSearch;

      // First call
      await agent.processQuery('test', 5);
      // Second call (should use cache)
      await agent.processQuery('test', 5);

      expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after timeout', async () => {
      // Set a very short cache timeout for testing
      agent.cacheTimeout = 10; // 10ms

      const mockArticles = [{ Id: '123', Title: 'Test' }];
      const mockSearch = jest.fn().mockResolvedValue(mockArticles);
      agent.sfClient.searchKnowledgeArticles = mockSearch;

      // First call
      await agent.processQuery('test', 5);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Second call (should not use cache)
      await agent.processQuery('test', 5);

      expect(mockSearch).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatArticlesForCopilot', () => {
    it('should format articles correctly', () => {
      const articles = [
        {
          Id: '123',
          Title: 'Test Article',
          Summary: 'Test Summary',
          UrlName: 'test-article',
        },
        {
          Id: '456',
          Title: 'Another Article',
          UrlName: null,
        },
      ];

      const formatted = agent.formatArticlesForCopilot(articles);

      expect(formatted.results).toHaveLength(2);
      expect(formatted.results[0].id).toBe('123');
      expect(formatted.results[0].title).toBe('Test Article');
      expect(formatted.results[0].summary).toBe('Test Summary');
      expect(formatted.results[1].summary).toBe('No summary available');
      expect(formatted.results[1].url).toBeNull();
      expect(formatted.count).toBe(2);
    });
  });

  describe('getArticleDetails', () => {
    it('should retrieve and format article details', async () => {
      const mockArticle = {
        Id: '123',
        Title: 'Test Article',
        Summary: 'Summary',
        UrlName: 'test',
        PublishStatus: 'Online',
        LastModifiedDate: '2024-01-01',
      };

      const mockGet = jest.fn().mockResolvedValue(mockArticle);
      agent.sfClient.getKnowledgeArticle = mockGet;

      const result = await agent.getArticleDetails('123');

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(result.id).toBe('123');
      expect(result.publishStatus).toBe('Online');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const mockArticles = [{ Id: '123', Title: 'Test' }];
      const mockSearch = jest.fn().mockResolvedValue(mockArticles);
      agent.sfClient.searchKnowledgeArticles = mockSearch;

      // Add something to cache
      await agent.processQuery('test', 5);
      expect(agent.cache.size).toBe(1);

      // Clear cache
      agent.clearCache();
      expect(agent.cache.size).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockArticles = [{ Id: '123', Title: 'Test' }];
      const mockSearch = jest.fn().mockResolvedValue(mockArticles);
      agent.sfClient.searchKnowledgeArticles = mockSearch;

      await agent.processQuery('test1', 5);
      await agent.processQuery('test2', 5);

      const stats = agent.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toContain('test1_5');
      expect(stats.entries).toContain('test2_5');
    });
  });
});
