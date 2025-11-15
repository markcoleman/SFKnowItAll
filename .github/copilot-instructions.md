# GitHub Copilot Instructions for SFKnowItAll

## Project Overview
SFKnowItAll is a Node.js application that integrates Salesforce Knowledge articles with Microsoft Copilot agents. It provides a seamless way to search and retrieve knowledge articles from Salesforce and serve them through an intelligent agent interface.

## Architecture
- **Salesforce Client**: Handles OAuth authentication and API communication with Salesforce
- **Copilot Agent**: Processes queries and formats responses for Microsoft Copilot consumption
- **Caching Layer**: Improves performance by caching frequently accessed articles

## Code Style Guidelines
- Use ES6+ module syntax (`import`/`export`)
- Follow async/await patterns for asynchronous operations
- Include JSDoc comments for all public methods
- Use descriptive variable and function names
- Keep functions focused and single-purpose

## Key Patterns
1. **Error Handling**: Always wrap Salesforce API calls in try-catch blocks
2. **Authentication**: Token-based authentication with automatic retry on expiration
3. **Caching**: Use Map-based caching with configurable timeout
4. **Formatting**: Transform Salesforce responses to Copilot-friendly format

## Testing
- Unit tests use Jest framework
- Mock external API calls in tests
- Test both success and error scenarios
- Aim for >80% code coverage

## Environment Variables
All Salesforce credentials and configuration should be stored in environment variables:
- `SF_INSTANCE_URL`: Salesforce instance URL
- `SF_CLIENT_ID`: OAuth client ID
- `SF_CLIENT_SECRET`: OAuth client secret
- `SF_USERNAME`: Salesforce username
- `SF_PASSWORD`: Salesforce password
- `SF_SECURITY_TOKEN`: Salesforce security token

## Common Tasks

### Adding New API Methods
When adding new Salesforce API methods:
1. Add method to `SalesforceClient` class
2. Ensure proper authentication check
3. Add error handling
4. Update corresponding agent method if needed
5. Write unit tests

### Extending Agent Functionality
To add new agent features:
1. Add method to `CopilotAgent` class
2. Consider caching implications
3. Format responses consistently
4. Update main application interface
5. Document in README

## Dependencies
- `axios`: HTTP client for API calls
- `dotenv`: Environment variable management
- `jest`: Testing framework
- `eslint`: Code linting

## Security Considerations
- Never commit `.env` files with real credentials
- Use environment variables for all sensitive data
- Validate and sanitize user inputs in search queries
- Keep dependencies updated to patch security vulnerabilities
