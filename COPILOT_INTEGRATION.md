# Microsoft Copilot Integration Guide

This guide provides step-by-step instructions for integrating SFKnowItAll with Microsoft Copilot to enable knowledge article search capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Integration Approach Overview](#integration-approach-overview)
- [Quick Start: REST API Integration](#quick-start-rest-api-integration)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Microsoft Teams Integration](#microsoft-teams-integration)
- [Copilot Studio Integration](#copilot-studio-integration)
- [Testing Your Integration](#testing-your-integration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating with Microsoft Copilot, ensure you have:

- ✅ SFKnowItAll installed and configured
- ✅ Salesforce Connected App credentials
- ✅ Microsoft 365 account with Copilot access
- ✅ Node.js 18+ installed
- ✅ Basic understanding of REST APIs

## Integration Approach Overview

There are three main ways to integrate SFKnowItAll with Microsoft Copilot:

| Approach | Best For | Complexity | Setup Time |
|----------|----------|------------|------------|
| **REST API Plugin** | General use, maximum flexibility | Medium | 2-4 hours |
| **Teams Bot** | Teams-specific queries | Medium | 3-5 hours |
| **Copilot Studio** | Low-code solution | Low | 1-2 hours |

## Quick Start: REST API Integration

This is the recommended approach for most users.

### Step 1: Create the API Server

Create a new file `api-server.js` in your project root:

```javascript
import express from 'express';
import cors from 'cors';
import { SFKnowItAll } from './src/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SFKnowItAll
let sfApp;

async function initializeApp() {
  sfApp = new SFKnowItAll();
  const initialized = await sfApp.initialize();
  
  if (!initialized) {
    console.error('Failed to initialize SFKnowItAll');
    process.exit(1);
  }
  
  console.log('SFKnowItAll initialized successfully');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await sfApp.search(query, maxResults);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get article by ID endpoint
app.get('/api/article/:id', async (req, res) => {
  try {
    const article = await sfApp.getArticle(req.params.id);
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
  const stats = sfApp.getCacheStats();
  res.json(stats);
});

app.post('/api/cache/clear', (req, res) => {
  sfApp.clearCache();
  res.json({ message: 'Cache cleared successfully' });
});

// Start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`SFKnowItAll API server running on port ${PORT}`);
  });
});
```

### Step 2: Install Additional Dependencies

```bash
npm install express cors
```

### Step 3: Update package.json

Add the following script to your `package.json`:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "start:api": "node api-server.js",
    "test": "jest",
    "lint": "eslint src/ tests/"
  }
}
```

### Step 4: Test the API Server

```bash
npm run start:api
```

Test with curl:

```bash
# Health check
curl http://localhost:3000/health

# Search for articles
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "password reset", "maxResults": 5}'
```

### Step 5: Create OpenAPI Specification

Create `openapi.yaml` in your project root:

```yaml
openapi: 3.0.0
info:
  title: SFKnowItAll - Salesforce Knowledge API
  description: API for searching and retrieving Salesforce Knowledge articles
  version: 1.0.0
  contact:
    name: API Support
    email: support@yourcompany.com

servers:
  - url: https://your-api-domain.com
    description: Production server
  - url: http://localhost:3000
    description: Development server

paths:
  /api/search:
    post:
      summary: Search knowledge articles
      operationId: searchKnowledge
      description: Search for Salesforce Knowledge articles by query text
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - query
              properties:
                query:
                  type: string
                  description: The search query text
                  example: "How to reset password"
                maxResults:
                  type: integer
                  description: Maximum number of results to return
                  default: 5
                  minimum: 1
                  maximum: 50
      responses:
        '200':
          description: Successful search
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        title:
                          type: string
                        summary:
                          type: string
                        url:
                          type: string
                          nullable: true
                  count:
                    type: integer
                  timestamp:
                    type: string
                    format: date-time
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
        '500':
          description: Server error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string

  /api/article/{id}:
    get:
      summary: Get article details
      operationId: getArticle
      description: Retrieve detailed information about a specific knowledge article
      parameters:
        - name: id
          in: path
          required: true
          description: The article ID
          schema:
            type: string
      responses:
        '200':
          description: Article details
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  title:
                    type: string
                  summary:
                    type: string
                  url:
                    type: string
                    nullable: true
                  publishStatus:
                    type: string
                  lastModifiedDate:
                    type: string
                    format: date-time
        '500':
          description: Server error

  /health:
    get:
      summary: Health check
      operationId: healthCheck
      description: Check if the API is running
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  timestamp:
                    type: string
                    format: date-time

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - ApiKeyAuth: []
```

### Step 6: Create Copilot Plugin Manifest

Create `ai-plugin.json`:

```json
{
  "schema_version": "v1",
  "name_for_human": "Salesforce Knowledge",
  "name_for_model": "salesforce_knowledge",
  "description_for_human": "Search and retrieve Salesforce Knowledge articles to answer questions",
  "description_for_model": "Plugin for searching Salesforce Knowledge Base. Use this when users ask questions that might be documented in knowledge articles, help documentation, or FAQs. The plugin can search articles by keywords and retrieve detailed article content.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "https://your-api-domain.com/openapi.yaml",
    "is_user_authenticated": false
  },
  "logo_url": "https://your-domain.com/logo.png",
  "contact_email": "support@yourcompany.com",
  "legal_info_url": "https://your-domain.com/legal"
}
```

## Detailed Setup Instructions

### Deploying to Azure

1. **Create Azure App Service**:
```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name sfknowitall-api \
  --runtime "NODE:18-lts"
```

2. **Configure Environment Variables**:
```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name sfknowitall-api \
  --settings \
    SF_INSTANCE_URL="https://your-instance.salesforce.com" \
    SF_CLIENT_ID="your_client_id" \
    SF_CLIENT_SECRET="your_client_secret" \
    SF_USERNAME="your_username" \
    SF_PASSWORD="your_password" \
    SF_SECURITY_TOKEN="your_token"
```

3. **Deploy the Application**:
```bash
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name sfknowitall-api \
  --src sfknowitall.zip
```

### Deploying to AWS

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "api-server.js"]
```

2. **Build and Push to ECR**:
```bash
aws ecr create-repository --repository-name sfknowitall
docker build -t sfknowitall .
docker tag sfknowitall:latest <account-id>.dkr.ecr.<region>.amazonaws.com/sfknowitall:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/sfknowitall:latest
```

3. **Deploy with ECS or Lambda**

## Microsoft Teams Integration

For Teams-specific integration:

### 1. Install Teams SDK

```bash
npm install @microsoft/teams-ai botbuilder
```

### 2. Create Teams Bot

Create `teams-bot.js`:

```javascript
import { Application, ConversationHistory } from '@microsoft/teams-ai';
import { MemoryStorage } from 'botbuilder';
import { SFKnowItAll } from './src/index.js';

const sfApp = new SFKnowItAll();
await sfApp.initialize();

const app = new Application({
  storage: new MemoryStorage(),
  ai: {
    planner: {
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY
    }
  }
});

// Register knowledge search action
app.ai.action('searchKnowledge', async (context, state, parameters) => {
  const results = await sfApp.search(parameters.query, 5);
  return `Found ${results.count} articles:\n${formatResults(results)}`;
});

function formatResults(results) {
  return results.results
    .map(r => `• **${r.title}**: ${r.summary}`)
    .join('\n');
}
```

### 3. Register in Teams Admin

1. Go to Teams Admin Center
2. Create a new app
3. Configure bot settings
4. Deploy to your organization

## Copilot Studio Integration

### 1. Access Copilot Studio

Navigate to https://copilotstudio.microsoft.com

### 2. Create New Copilot

1. Click "Create" → "New Copilot"
2. Name it "Salesforce Knowledge Assistant"
3. Choose your preferred language

### 3. Add Custom Action

1. Go to "Actions" tab
2. Click "Add an action"
3. Select "From a custom connector"
4. Import your OpenAPI specification

### 4. Configure the Connector

- **Base URL**: Your deployed API URL
- **Authentication**: None (or configure API key if needed)
- **Actions**: search, getArticle

### 5. Create Topics

Create a topic for knowledge search:

```
Trigger phrases:
- "search knowledge"
- "find article"
- "help with"

Action:
Call searchKnowledge action with user's query

Response:
Show results in formatted message
```

## Testing Your Integration

### Unit Testing the API

Create `api-server.test.js`:

```javascript
import request from 'supertest';
import { jest } from '@jest/globals';

// Mock SFKnowItAll
jest.mock('./src/index.js');

describe('API Server', () => {
  it('should search articles', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'test', maxResults: 5 });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
  });
});
```

### Manual Testing

Test with Postman or curl:

```bash
# Search
curl -X POST https://your-api.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "email setup", "maxResults": 3}'

# Get article
curl https://your-api.com/api/article/ka0xx000000xxxx

# Health check
curl https://your-api.com/health
```

### Testing in Copilot

1. Open Microsoft Copilot
2. Enable your plugin
3. Ask: "Search Salesforce Knowledge for password reset"
4. Verify the response contains relevant articles

## Production Deployment

### Security Checklist

- [ ] Enable HTTPS with valid SSL certificate
- [ ] Implement API key authentication
- [ ] Add rate limiting (e.g., express-rate-limit)
- [ ] Set up CORS properly
- [ ] Enable request logging
- [ ] Implement error tracking (e.g., Sentry)
- [ ] Set up monitoring and alerts

### Performance Optimization

1. **Enable Caching**: The built-in cache reduces Salesforce API calls
2. **Use CDN**: For static assets and OpenAPI spec
3. **Implement Connection Pooling**: Reuse HTTP connections
4. **Monitor API Quotas**: Track Salesforce API usage

### Example with API Key Auth

Update `api-server.js`:

```javascript
// API Key middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Apply to protected routes
app.post('/api/search', apiKeyAuth, async (req, res) => {
  // ... search logic
});
```

## Troubleshooting

### Common Issues

**Issue**: "Failed to initialize SFKnowItAll"
- **Solution**: Check Salesforce credentials in environment variables
- Verify SF_INSTANCE_URL is correct
- Ensure security token is appended to password

**Issue**: "CORS errors in browser"
- **Solution**: Configure CORS properly:
```javascript
app.use(cors({
  origin: ['https://copilot.microsoft.com'],
  credentials: true
}));
```

**Issue**: "Rate limit exceeded"
- **Solution**: Implement request throttling
- Increase cache timeout
- Use batch requests when possible

**Issue**: "Plugin not appearing in Copilot"
- **Solution**: 
  - Verify OpenAPI spec is accessible
  - Check ai-plugin.json manifest
  - Ensure DNS and SSL are configured correctly

### Debug Mode

Enable debug logging:

```javascript
// In api-server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

### Support Resources

- [Microsoft Copilot Studio Documentation](https://learn.microsoft.com/copilot-studio/)
- [Salesforce REST API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [OpenAPI Specification](https://swagger.io/specification/)

## Next Steps

After successful integration:

1. Monitor usage metrics
2. Gather user feedback
3. Expand knowledge base coverage
4. Add more sophisticated query handling
5. Implement analytics and reporting

---

For additional help, create an issue in the GitHub repository or contact support.
