# Microsoft Copilot Integration - Quick Start

This document provides a quick setup guide to integrate SFKnowItAll with Microsoft Copilot.

## Installation

To use the API server for Microsoft Copilot integration, install the additional dependencies:

```bash
npm install express cors
```

Or if you prefer yarn:

```bash
yarn add express cors
```

## Quick Start

1. **Start the API Server**:
```bash
npm run start:api
```

The server will start on port 3000 (or the PORT environment variable if set).

2. **Test the API**:
```bash
# Health check
curl http://localhost:3000/health

# Search for articles
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "password reset", "maxResults": 5}'
```

3. **Deploy to Production**:
   - See [COPILOT_INTEGRATION.md](COPILOT_INTEGRATION.md) for detailed deployment instructions
   - Update `openapi.yaml` with your production URL
   - Update `ai-plugin.json` with your domain and contact info

## Files for Copilot Integration

- **api-server.js**: Express.js REST API server
- **openapi.yaml**: OpenAPI 3.0 specification for your API
- **ai-plugin.json**: Microsoft Copilot plugin manifest
- **COPILOT_INTEGRATION.md**: Complete integration guide

## Next Steps

1. Deploy the API server to your cloud provider (Azure, AWS, etc.)
2. Configure DNS and SSL certificates
3. Register the plugin in Microsoft Copilot Studio or Teams
4. Test with real queries

For detailed instructions, see [COPILOT_INTEGRATION.md](COPILOT_INTEGRATION.md).
