/**
 * SFKnowItAll API Server
 * Express.js REST API for Microsoft Copilot integration
 */

import express from 'express';
import cors from 'cors';
import { SFKnowItAll } from './src/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Initialize SFKnowItAll
let sfApp;

async function initializeApp() {
  try {
    sfApp = new SFKnowItAll();
    const initialized = await sfApp.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize SFKnowItAll');
      process.exit(1);
    }
    
    console.log('✓ SFKnowItAll initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error.message);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Search endpoint for Copilot
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required' 
      });
    }
    
    if (maxResults < 1 || maxResults > 50) {
      return res.status(400).json({ 
        error: 'maxResults must be between 1 and 50' 
      });
    }
    
    console.log(`Searching for: "${query}" (max ${maxResults} results)`);
    const results = await sfApp.search(query, maxResults);
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get article by ID endpoint
app.get('/api/article/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Article ID is required' 
      });
    }
    
    console.log(`Fetching article: ${id}`);
    const article = await sfApp.getArticle(id);
    
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
  try {
    const stats = sfApp.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cache/clear', (req, res) => {
  try {
    sfApp.clearCache();
    res.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve OpenAPI specification
app.get('/openapi.yaml', (req, res) => {
  res.sendFile('openapi.yaml', { root: '.' });
});

// Serve plugin manifest
app.get('/ai-plugin.json', (req, res) => {
  res.sendFile('ai-plugin.json', { root: '.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 SFKnowItAll API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Search endpoint: POST http://localhost:${PORT}/api/search`);
    console.log(`📄 OpenAPI spec: http://localhost:${PORT}/openapi.yaml`);
    console.log(`🤖 Plugin manifest: http://localhost:${PORT}/ai-plugin.json\n`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
