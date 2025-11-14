# SFKnowItAll

A Node.js application that integrates Salesforce Knowledge articles with Microsoft Copilot agents, providing intelligent knowledge retrieval and serving capabilities.

## Features

- 🔐 **Salesforce OAuth Integration**: Secure authentication with Salesforce using OAuth 2.0
- 📚 **Knowledge Article Search**: Search and retrieve Salesforce Knowledge articles
- 🤖 **Microsoft Copilot Agent**: Serve knowledge through an intelligent agent interface
- ⚡ **Caching Layer**: Built-in caching for improved performance
- ✅ **Comprehensive Testing**: Full unit test coverage with Jest
- 🔄 **CI/CD**: GitHub Actions workflows for automated testing and deployment

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Salesforce account with API access
- Salesforce Connected App credentials

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