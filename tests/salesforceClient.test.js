/**
 * Unit tests for SalesforceClient
 */

import { SalesforceClient } from '../src/salesforceClient.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('SalesforceClient', () => {
  let client;
  const mockConfig = {
    instanceUrl: 'https://test.salesforce.com',
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    username: 'test@example.com',
    password: 'testpassword',
    securityToken: 'testtoken',
  };

  beforeEach(() => {
    client = new SalesforceClient(mockConfig);
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should successfully authenticate and store access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock_access_token_123',
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const token = await client.authenticate();

      expect(token).toBe('mock_access_token_123');
      expect(client.accessToken).toBe('mock_access_token_123');
      expect(axios.post).toHaveBeenCalledWith(
        'https://test.salesforce.com/services/oauth2/token',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'password',
            client_id: 'test_client_id',
          }),
        })
      );
    });

    it('should throw error when authentication fails', async () => {
      axios.post.mockRejectedValue(new Error('Authentication failed'));

      await expect(client.authenticate()).rejects.toThrow(
        'Salesforce authentication failed'
      );
    });
  });

  describe('searchKnowledgeArticles', () => {
    beforeEach(() => {
      client.accessToken = 'mock_token';
    });

    it('should search for knowledge articles successfully', async () => {
      const mockArticles = {
        data: {
          records: [
            {
              Id: '123',
              Title: 'Test Article',
              Summary: 'Test Summary',
              UrlName: 'test-article',
            },
          ],
        },
      };

      axios.get.mockResolvedValue(mockArticles);

      const results = await client.searchKnowledgeArticles('test', 10);

      expect(results).toHaveLength(1);
      expect(results[0].Title).toBe('Test Article');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/services/data/v58.0/query'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_token',
          }),
        })
      );
    });

    it('should authenticate if no access token exists', async () => {
      client.accessToken = null;
      
      const authResponse = { data: { access_token: 'new_token' } };
      const searchResponse = { data: { records: [] } };

      axios.post.mockResolvedValue(authResponse);
      axios.get.mockResolvedValue(searchResponse);

      await client.searchKnowledgeArticles('test');

      expect(axios.post).toHaveBeenCalled();
      expect(client.accessToken).toBe('new_token');
    });

    it('should throw error when search fails', async () => {
      axios.get.mockRejectedValue(new Error('Search failed'));

      await expect(client.searchKnowledgeArticles('test')).rejects.toThrow(
        'Failed to search knowledge articles'
      );
    });
  });

  describe('getKnowledgeArticle', () => {
    beforeEach(() => {
      client.accessToken = 'mock_token';
    });

    it('should retrieve a specific article by ID', async () => {
      const mockArticle = {
        data: {
          Id: '123',
          Title: 'Test Article',
          Summary: 'Test Summary',
        },
      };

      axios.get.mockResolvedValue(mockArticle);

      const result = await client.getKnowledgeArticle('123');

      expect(result.Id).toBe('123');
      expect(result.Title).toBe('Test Article');
    });

    it('should throw error when article retrieval fails', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));

      await expect(client.getKnowledgeArticle('999')).rejects.toThrow(
        'Failed to get knowledge article'
      );
    });
  });

  describe('getAllKnowledgeArticles', () => {
    beforeEach(() => {
      client.accessToken = 'mock_token';
    });

    it('should retrieve all published articles', async () => {
      const mockResponse = {
        data: {
          records: [
            { Id: '1', Title: 'Article 1' },
            { Id: '2', Title: 'Article 2' },
          ],
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      const results = await client.getAllKnowledgeArticles(100);

      expect(results).toHaveLength(2);
      expect(results[0].Title).toBe('Article 1');
    });
  });
});
