/**
 * Unit tests for SFKnowItAll main application
 */

import { SFKnowItAll } from '../src/index.js';
import { CopilotAgent } from '../src/copilotAgent.js';

// Mock the CopilotAgent
jest.mock('../src/copilotAgent.js');

describe('SFKnowItAll', () => {
  let app;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up environment variables for testing
    process.env.SF_INSTANCE_URL = 'https://test.salesforce.com';
    process.env.SF_CLIENT_ID = 'test_id';
    process.env.SF_CLIENT_SECRET = 'test_secret';
    process.env.SF_USERNAME = 'test@example.com';
    process.env.SF_PASSWORD = 'testpass';
    process.env.SF_SECURITY_TOKEN = 'testtoken';

    app = new SFKnowItAll();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SF_INSTANCE_URL;
    delete process.env.SF_CLIENT_ID;
    delete process.env.SF_CLIENT_SECRET;
    delete process.env.SF_USERNAME;
    delete process.env.SF_PASSWORD;
    delete process.env.SF_SECURITY_TOKEN;
  });

  describe('loadConfig', () => {
    it('should load configuration from environment variables', () => {
      const config = app.loadConfig();

      expect(config.instanceUrl).toBe('https://test.salesforce.com');
      expect(config.clientId).toBe('test_id');
      expect(config.username).toBe('test@example.com');
    });

    it('should warn about missing environment variables', () => {
      delete process.env.SF_INSTANCE_URL;
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      new SFKnowItAll();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing environment variables')
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
      }));

      app = new SFKnowItAll();
      const result = await app.initialize();

      expect(result).toBe(true);
      expect(mockInitialize).toHaveBeenCalled();
    });

    it('should return false when initialization fails', async () => {
      const mockInitialize = jest.fn().mockRejectedValue(new Error('Init failed'));
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
      }));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      app = new SFKnowItAll();
      const result = await app.initialize();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const mockProcessQuery = jest.fn().mockResolvedValue({ results: [] });
      
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
        processQuery: mockProcessQuery,
      }));

      app = new SFKnowItAll();
      await app.initialize();
    });

    it('should search for articles successfully', async () => {
      const mockResults = {
        results: [{ id: '123', title: 'Test' }],
        count: 1,
      };

      app.agent.processQuery.mockResolvedValue(mockResults);

      const results = await app.search('test query', 5);

      expect(results).toEqual(mockResults);
      expect(app.agent.processQuery).toHaveBeenCalledWith('test query', 5);
    });

    it('should throw error if agent not initialized', async () => {
      const uninitializedApp = new SFKnowItAll();

      await expect(uninitializedApp.search('test')).rejects.toThrow(
        'Agent not initialized'
      );
    });

    it('should handle search errors', async () => {
      app.agent.processQuery.mockRejectedValue(new Error('Search failed'));

      await expect(app.search('test')).rejects.toThrow('Search failed');
    });
  });

  describe('getArticle', () => {
    beforeEach(async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const mockGetArticleDetails = jest.fn();
      
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
        getArticleDetails: mockGetArticleDetails,
      }));

      app = new SFKnowItAll();
      await app.initialize();
    });

    it('should retrieve article details', async () => {
      const mockArticle = { id: '123', title: 'Test Article' };
      app.agent.getArticleDetails.mockResolvedValue(mockArticle);

      const result = await app.getArticle('123');

      expect(result).toEqual(mockArticle);
      expect(app.agent.getArticleDetails).toHaveBeenCalledWith('123');
    });

    it('should throw error if agent not initialized', async () => {
      const uninitializedApp = new SFKnowItAll();

      await expect(uninitializedApp.getArticle('123')).rejects.toThrow(
        'Agent not initialized'
      );
    });
  });

  describe('getCacheStats', () => {
    beforeEach(async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const mockGetCacheStats = jest.fn().mockReturnValue({ size: 0 });
      
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
        getCacheStats: mockGetCacheStats,
      }));

      app = new SFKnowItAll();
      await app.initialize();
    });

    it('should return cache statistics', () => {
      const mockStats = { size: 5, entries: [] };
      app.agent.getCacheStats.mockReturnValue(mockStats);

      const stats = app.getCacheStats();

      expect(stats).toEqual(mockStats);
    });

    it('should throw error if agent not initialized', () => {
      const uninitializedApp = new SFKnowItAll();

      expect(() => uninitializedApp.getCacheStats()).toThrow(
        'Agent not initialized'
      );
    });
  });

  describe('clearCache', () => {
    beforeEach(async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const mockClearCache = jest.fn();
      
      CopilotAgent.mockImplementation(() => ({
        initialize: mockInitialize,
        clearCache: mockClearCache,
      }));

      app = new SFKnowItAll();
      await app.initialize();
    });

    it('should clear the cache', () => {
      app.clearCache();

      expect(app.agent.clearCache).toHaveBeenCalled();
    });

    it('should throw error if agent not initialized', () => {
      const uninitializedApp = new SFKnowItAll();

      expect(() => uninitializedApp.clearCache()).toThrow(
        'Agent not initialized'
      );
    });
  });
});
