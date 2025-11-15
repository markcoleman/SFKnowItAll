# SFKnowItAll Architecture Diagram

## Overall Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Microsoft Copilot                          │
│                    (User Interface)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    SFKnowItAll API Server                       │
│                     (api-server.js)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Endpoints:                                              │  │
│  │  • POST /api/search      - Search articles              │  │
│  │  • GET  /api/article/:id - Get article details         │  │
│  │  • GET  /health          - Health check                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Node.js Module
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     CopilotAgent                                │
│                  (src/copilotAgent.js)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Query Processing                                      │  │
│  │  • Response Formatting                                   │  │
│  │  • Cache Management (5-min TTL)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Internal API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   SalesforceClient                              │
│                (src/salesforceClient.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • OAuth 2.0 Authentication                              │  │
│  │  • SOQL Query Execution                                  │  │
│  │  • Token Management                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                  Salesforce Knowledge Base                      │
│                    (Knowledge__kav)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Knowledge Articles                                    │  │
│  │  • Article Metadata                                      │  │
│  │  • Publish Status                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Options

### Option 1: REST API Plugin (Recommended)
```
User → Microsoft Copilot → Plugin Manifest → API Server → Salesforce
```

### Option 2: Microsoft Teams
```
User → Teams Chat → Teams Bot → SFKnowItAll Core → Salesforce
```

### Option 3: Copilot Studio
```
User → Copilot Studio → Custom Connector → API Server → Salesforce
```

## Data Flow Example

### Search Query Flow

1. **User asks Microsoft Copilot**: "Find articles about password reset"

2. **Copilot calls API**:
   ```
   POST /api/search
   Body: { "query": "password reset", "maxResults": 5 }
   ```

3. **CopilotAgent processes**:
   - Checks cache for existing results
   - If not cached, calls SalesforceClient

4. **SalesforceClient queries**:
   ```sql
   SELECT Id, Title, Summary, UrlName 
   FROM Knowledge__kav 
   WHERE PublishStatus = 'Online' 
   AND Title LIKE '%password reset%' 
   LIMIT 5
   ```

5. **Response formatted**:
   ```json
   {
     "results": [
       {
         "id": "ka0xx000000xxxx",
         "title": "How to Reset Your Password",
         "summary": "Step-by-step password reset guide",
         "url": "knowledge/article/password-reset"
       }
     ],
     "count": 1,
     "timestamp": "2024-01-01T12:00:00.000Z"
   }
   ```

6. **Copilot presents** formatted results to user

## Security Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: HTTPS/TLS Encryption             │
├─────────────────────────────────────────────┤
│  Layer 2: API Key Authentication (Optional)│
├─────────────────────────────────────────────┤
│  Layer 3: Salesforce OAuth 2.0             │
├─────────────────────────────────────────────┤
│  Layer 4: Environment Variable Protection   │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

### Cloud Deployment Example (Azure)

```
┌──────────────────────────────────────────────────────────┐
│                    Azure App Service                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │         SFKnowItAll API Container                  │ │
│  │  • Node.js 18 Runtime                              │ │
│  │  • Environment Variables (from Azure Key Vault)   │ │
│  │  • Auto-scaling enabled                            │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
      ┌─────▼─────┐ ┌──▼────┐ ┌───▼────────┐
      │  Azure    │ │ App   │ │  Azure     │
      │ Monitor   │ │Insights│ │  Key Vault│
      └───────────┘ └────────┘ └────────────┘
```

## Cache Architecture

```
┌─────────────────────────────────────────┐
│         In-Memory Cache (Map)           │
├─────────────────────────────────────────┤
│  Key: "query_maxResults"                │
│  Value: {                               │
│    data: { results, count, timestamp }, │
│    timestamp: Date.now()                │
│  }                                      │
├─────────────────────────────────────────┤
│  TTL: 5 minutes (300000ms)             │
│  Auto-cleanup: On access                │
└─────────────────────────────────────────┘
```

## Performance Metrics

| Metric | Without Cache | With Cache |
|--------|---------------|------------|
| Response Time | ~500-1000ms | ~10-50ms |
| Salesforce API Calls | Every request | 1 per 5 min |
| Throughput | ~10 req/sec | ~100 req/sec |

## Error Handling Flow

```
Error occurs
    │
    ├─ Salesforce API Error
    │   └─ Return 500 with message
    │
    ├─ Authentication Error
    │   └─ Retry with new token
    │
    ├─ Validation Error
    │   └─ Return 400 with details
    │
    └─ Unknown Error
        └─ Log and return 500
```
