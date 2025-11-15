# SFKnowItAll

A Node.js application that integrates Salesforce Knowledge articles with Microsoft Copilot agents, providing intelligent knowledge retrieval and serving capabilities.

## 📚 Quick Links

- **[Microsoft Copilot Integration Guide](COPILOT_INTEGRATION.md)** - Complete setup instructions for Copilot
- **[Quick Start for Copilot](QUICKSTART_COPILOT.md)** - Fast-track guide to get started
- **[API Documentation](openapi.yaml)** - OpenAPI specification

## Features

- 🔐 **Salesforce OAuth Integration**: Secure authentication with Salesforce using OAuth 2.0
- 📚 **Knowledge Article Search**: Search and retrieve Salesforce Knowledge articles
- 🤖 **Microsoft Copilot Agent**: Serve knowledge through an intelligent agent interface
- ⚡ **Caching Layer**: Built-in caching for improved performance
- ✅ **Comprehensive Testing**: Full unit test coverage with Jest
- 🔄 **CI/CD**: GitHub Actions workflows for automated testing and deployment
- 🚀 **REST API Server**: Ready-to-deploy API for Microsoft Copilot integration

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Salesforce account with API access
- Salesforce Connected App credentials
- (Optional) Express.js for API server: `npm install express cors`

## Installation

1. Clone the repository:
```bash
git clone https://github.com/markcoleman/SFKnowItAll.git
cd SFKnowItAll
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Salesforce credentials:
```env
SF_INSTANCE_URL=https://your-instance.salesforce.com
SF_CLIENT_ID=your_client_id_here
SF_CLIENT_SECRET=your_client_secret_here
SF_USERNAME=your_salesforce_username
SF_PASSWORD=your_salesforce_password
SF_SECURITY_TOKEN=your_security_token
```

## Usage

### Running the Application

```bash
npm start
```

### Using the API

```javascript
import { SFKnowItAll } from './src/index.js';

// Initialize the application
const app = new SFKnowItAll();
await app.initialize();

// Search for knowledge articles
const results = await app.search('troubleshooting', 5);
console.log(results);

// Get a specific article
const article = await app.getArticle('article_id');
console.log(article);

// Check cache statistics
const stats = app.getCacheStats();
console.log(stats);

// Clear cache
app.clearCache();
```

## Architecture

### Components

1. **SalesforceClient** (`src/salesforceClient.js`)
   - Handles OAuth authentication
   - Manages API communication with Salesforce
   - Provides methods for searching and retrieving knowledge articles

2. **CopilotAgent** (`src/copilotAgent.js`)
   - Processes user queries
   - Formats responses for Microsoft Copilot
   - Implements caching layer for performance

3. **SFKnowItAll** (`src/index.js`)
   - Main application entry point
   - Coordinates between components
   - Provides simplified API interface

### Data Flow

```
User Query → CopilotAgent → Cache Check → SalesforceClient → Salesforce API
                ↓                              ↓
           Formatted Response ← Cache Store ← Raw Articles
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint:fix
```

## Testing

The project includes comprehensive unit tests with >80% code coverage:

- **salesforceClient.test.js**: Tests for Salesforce API integration
- **copilotAgent.test.js**: Tests for Copilot agent functionality
- **index.test.js**: Tests for main application logic

All external API calls are mocked to ensure fast, reliable tests.

## GitHub Workflows

### CI Workflow (`.github/workflows/ci.yml`)
- Runs on push and pull requests
- Tests on Node.js 18.x and 20.x
- Executes linting, tests, and coverage reporting
- Uploads coverage to Codecov

### Dependency Review (`.github/workflows/dependency-review.yml`)
- Reviews dependencies on pull requests
- Checks for security vulnerabilities
- Fails on moderate or higher severity issues

## Microsoft Copilot Integration

This application serves as a backend service that Microsoft Copilot can query to retrieve Salesforce Knowledge articles. Here's how to integrate it:

### Integration Options

#### Option 1: REST API Service (Recommended)

Deploy SFKnowItAll as a REST API service that Microsoft Copilot can call:

1. **Create an API Wrapper** (example using Express.js):

```javascript
import express from 'express';
import { SFKnowItAll } from './src/index.js';

const app = express();
app.use(express.json());

// Initialize the application
const sfApp = new SFKnowItAll();
await sfApp.initialize();

// Search endpoint for Copilot
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;
    const results = await sfApp.search(query, maxResults);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Article details endpoint
app.get('/api/article/:id', async (req, res) => {
  try {
    const article = await sfApp.getArticle(req.params.id);
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('SFKnowItAll API running on port 3000');
});
```

2. **Deploy the Service**:
   - Azure App Service
   - AWS Lambda + API Gateway
   - Google Cloud Run
   - Docker container on any cloud platform

3. **Configure Microsoft Copilot Plugin**:

Create a `ai-plugin.json` manifest:

```json
{
  "schema_version": "v1",
  "name_for_human": "Salesforce Knowledge Search",
  "name_for_model": "salesforce_knowledge",
  "description_for_human": "Search Salesforce Knowledge articles",
  "description_for_model": "Plugin for searching and retrieving Salesforce Knowledge articles. Use this when users ask questions that might be answered in your organization's knowledge base.",
  "auth": {
    "type": "service_http",
    "authorization_type": "bearer",
    "verification_tokens": {
      "openai": "your-verification-token"
    }
  },
  "api": {
    "type": "openapi",
    "url": "https://your-api-domain.com/openapi.yaml"
  },
  "logo_url": "https://your-domain.com/logo.png",
  "contact_email": "support@your-domain.com",
  "legal_info_url": "https://your-domain.com/legal"
}
```

4. **Create OpenAPI Specification** (`openapi.yaml`):

```yaml
openapi: 3.0.0
info:
  title: Salesforce Knowledge API
  version: 1.0.0
  description: API for searching Salesforce Knowledge articles
servers:
  - url: https://your-api-domain.com
paths:
  /api/search:
    post:
      operationId: searchKnowledge
      summary: Search for knowledge articles
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Search query
                maxResults:
                  type: integer
                  description: Maximum number of results
                  default: 5
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      type: object
                  count:
                    type: integer
                  timestamp:
                    type: string
  /api/article/{id}:
    get:
      operationId: getArticle
      summary: Get article details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Article details
```

#### Option 2: Microsoft Teams Integration

1. **Install Required Dependencies**:
```bash
npm install @microsoft/teams-ai botbuilder
```

2. **Create Teams Bot Integration**:

```javascript
import { Application } from '@microsoft/teams-ai';
import { SFKnowItAll } from './src/index.js';

const sfApp = new SFKnowItAll();
await sfApp.initialize();

const app = new Application({
  // Bot configuration
});

app.message('/search', async (context, state) => {
  const query = context.activity.text.replace('/search', '').trim();
  const results = await sfApp.search(query);
  
  await context.sendActivity({
    type: 'message',
    text: formatResultsForTeams(results)
  });
});

function formatResultsForTeams(results) {
  return results.results.map(r => 
    `**${r.title}**\n${r.summary}\n${r.url || ''}`
  ).join('\n\n');
}
```

#### Option 3: Copilot Studio Custom Connector

1. **In Copilot Studio**:
   - Navigate to your Copilot
   - Go to "Settings" → "Generative AI" 
   - Add a new "Custom connector"

2. **Configure the Connector**:
   - API Endpoint: Your deployed SFKnowItAll API
   - Authentication: API Key or OAuth 2.0
   - Define actions (search, getArticle)

3. **Test the Integration**:
   - Use the test console in Copilot Studio
   - Ask questions like "Search for troubleshooting articles"
   - Verify responses are formatted correctly

### Security Best Practices

When integrating with Microsoft Copilot:

1. **Use HTTPS**: Always deploy with SSL/TLS certificates
2. **Implement Authentication**: 
   - API keys for service-to-service
   - OAuth 2.0 for user-specific queries
3. **Rate Limiting**: Protect your Salesforce API quota
4. **Input Validation**: Sanitize all queries before processing
5. **Audit Logging**: Track all queries for compliance

### Example Copilot Prompts

Once integrated, users can ask Microsoft Copilot:

- "Search Salesforce Knowledge for password reset instructions"
- "Find articles about VPN setup"
- "What knowledge articles discuss email configuration?"
- "Show me the latest troubleshooting guides"

The Copilot will use your SFKnowItAll service to retrieve relevant articles and present them to the user.

### Monitoring and Troubleshooting

1. **Check Cache Statistics**:
```javascript
const stats = sfApp.getCacheStats();
console.log(`Cache size: ${stats.size}`);
```

2. **Clear Cache if Needed**:
```javascript
sfApp.clearCache();
```

3. **Monitor Salesforce API Usage**:
   - Check your Salesforce API limits regularly
   - Implement retry logic for rate limit errors
   - Use the cache to reduce API calls

## Salesforce Setup

### Creating a Connected App

1. Log in to Salesforce
2. Go to Setup → App Manager
3. Click "New Connected App"
4. Configure OAuth settings:
   - Enable OAuth Settings
   - Set callback URL
   - Select OAuth scopes: `api`, `refresh_token`
5. Save and note the Consumer Key and Consumer Secret

### Security Token

If you don't have a security token:
1. Go to Settings → Reset My Security Token
2. Check your email for the token
3. Append it to your password in the configuration

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SF_INSTANCE_URL` | Your Salesforce instance URL | Yes |
| `SF_CLIENT_ID` | Connected App Consumer Key | Yes |
| `SF_CLIENT_SECRET` | Connected App Consumer Secret | Yes |
| `SF_USERNAME` | Salesforce username | Yes |
| `SF_PASSWORD` | Salesforce password | Yes |
| `SF_SECURITY_TOKEN` | Salesforce security token | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review Salesforce API documentation

## Acknowledgments

- Salesforce API documentation
- Microsoft Copilot integration guidelines
- Node.js community