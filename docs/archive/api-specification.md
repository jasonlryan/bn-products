<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: ARCHIVED - Outdated API planning document not reflecting current system implementation
Status: Archived
Review Notes: This document describes planned API endpoints that don't exist in current system. Current system uses dual storage (Redis + localStorage) via existing API routes at /api/storage. This document should be kept for future API development reference.
-->

# API Specification - Full Product Management [ARCHIVED]

## Overview

This API specification defines all endpoints needed for the Redis migration, covering the complete product lifecycle from creation to compilation.

## Base Configuration

- **Base URL**: `/api`
- **Authentication**: None (internal use)
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/minute per IP

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product name is required",
    "details": {
      "field": "name",
      "value": null
    }
  }
}
```

## Products API

### List All Products
```http
GET /api/products
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "01_ai_power_hour",
      "name": "AI Power Hour",
      "type": "PRODUCT",
      "pricing": {
        "type": "fixed",
        "display": "£300"
      },
      "metadata": {
        "createdAt": "2024-01-15T10:00:00Z",
        "lastModified": "2024-01-15T15:30:00Z",
        "version": "1.2"
      }
    }
  ],
  "count": 8
}
```

### Create New Product
```http
POST /api/products
```

**Request Body**:
```json
{
  "name": "AI Innovation Workshop",
  "type": "PRODUCT",
  "pricing": {
    "type": "fixed", 
    "display": "£5,000"
  },
  "content": {
    "description": "Interactive AI workshop for teams",
    "perfectFor": "Teams wanting hands-on experience",
    "primaryDeliverables": "Workshop materials + follow-up"
  },
  "features": [
    "Interactive sessions",
    "Real examples", 
    "Take-home materials"
  ],
  "benefits": [
    "Practical skills",
    "Immediate application",
    "Team building"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": "09_ai_innovation_workshop",
    "message": "Product created successfully"
  }
}
```

### Get Product by ID
```http
GET /api/products/{productId}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "01_ai_power_hour",
    "name": "AI Power Hour",
    "type": "PRODUCT",
    "pricing": { ... },
    "content": { ... },
    "features": [ ... ],
    "benefits": [ ... ],
    "marketing": { ... },
    "metadata": {
      "createdAt": "2024-01-15T10:00:00Z",
      "lastModified": "2024-01-15T15:30:00Z",
      "version": "1.2",
      "richContentFiles": 15
    }
  }
}
```

### Update Product
```http
PUT /api/products/{productId}
```

**Request Body**: Partial product object
```json
{
  "name": "AI Power Hour Pro",
  "pricing": {
    "type": "fixed",
    "display": "£450"
  }
}
```

### Delete Product
```http
DELETE /api/products/{productId}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully",
    "deletedContent": 15,
    "deletedCompilations": 3
  }
}
```

### Clone Product
```http
POST /api/products/{productId}/clone
```

**Request Body**:
```json
{
  "name": "AI Power Hour Advanced",
  "cloneContent": true,
  "cloneCompilations": false
}
```

### Bulk Import Products
```http
POST /api/products/bulk
```

**Request Body**:
```json
{
  "products": [
    { /* product 1 */ },
    { /* product 2 */ }
  ],
  "overwrite": false
}
```

## Product Content API

### Get All Content for Product
```http
GET /api/products/{productId}/content
```

**Response**:
```json
{
  "success": true,
  "data": {
    "manifesto": {
      "title": "AI Power Hour • Product Manifesto",
      "sections": {
        "Original Prompt": "...",
        "Generated Output": "...",
        "Product Context": "...",
        "Context Used": "..."
      },
      "fullContent": "# Manifesto content...",
      "lastModified": "2024-01-15T12:00:00Z",
      "version": "1.1"
    },
    "functionalSpec": { ... },
    // ... all 15 content types
  }
}
```

### Get Specific Content Type
```http
GET /api/products/{productId}/content/{contentType}
```

**Content Types**: 
- `manifesto`
- `functional-spec`
- `audience-icps`
- `user-stories`
- `competitor-analysis`
- `market-sizing`
- `prd-skeleton`
- `ui-prompt`
- `screen-generation`
- `landing-page-copy`
- `key-messages`
- `investor-deck`
- `demo-script`
- `slide-headlines`
- `qa-prep`

### Update Content
```http
PUT /api/products/{productId}/content/{contentType}
```

**Request Body**:
```json
{
  "title": "AI Power Hour • Updated Manifesto",
  "sections": {
    "Generated Output": "Updated content here...",
    "Original Prompt": "...",
    "Product Context": "...",
    "Context Used": "..."
  },
  "fullContent": "# Updated manifesto markdown...",
  "metadata": {
    "modifiedBy": "admin",
    "changeReason": "Updated value proposition"
  }
}
```

## Compilation API

### Get Compiled Content
```http
GET /api/compilation/{type}?productId={productId}
```

**Types**: `marketing`, `market-intel`, `product-strategy`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "compiled-marketing-01_ai_power_hour-1234567890",
    "productId": "01_ai_power_hour",
    "compiledAt": "2024-01-15T14:30:00Z",
    "content": {
      "executiveSummary": { ... },
      "messagingFramework": { ... },
      "salesProcessGuide": { ... },
      // ... full compiled structure
    },
    "rawMarkdown": "# Sales & Marketing Guide...",
    "compilationCount": 5
  }
}
```

### Trigger Compilation
```http
POST /api/compilation/{type}
```

**Request Body**:
```json
{
  "productId": "01_ai_power_hour",
  "customPrompt": "Optional custom prompt override",
  "regenerate": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "compilationId": "comp_123456",
    "status": "processing",
    "estimatedTime": 30,
    "message": "Compilation started"
  }
}
```

### Delete Compiled Content
```http
DELETE /api/compilation/{type}?productId={productId}
```

### Get All Compilation Statuses
```http
GET /api/compilation/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "01_ai_power_hour": {
      "marketing": {
        "status": "complete",
        "count": 5,
        "lastCompiled": "2024-01-15T14:30:00Z"
      },
      "marketIntel": {
        "status": "idle",
        "count": 0,
        "lastCompiled": null
      },
      "productStrategy": {
        "status": "processing",
        "count": 2,
        "lastCompiled": "2024-01-14T10:00:00Z"
      }
    }
    // ... other products
  }
}
```

## Settings API

### Get Admin Settings
```http
GET /api/settings/admin
```

**Response**:
```json
{
  "success": true,
  "data": {
    "editModeEnabled": true,
    "lastCompiled": {
      "01_ai_power_hour": "2024-01-15T14:30:00Z"
    },
    "compilationStatus": {
      "01_ai_power_hour": "complete"
    },
    "customPrompts": {
      "marketing": "Custom marketing prompt...",
      "marketIntelligence": null,
      "productStrategy": "Custom strategy prompt..."
    }
  }
}
```

### Update Admin Settings
```http
PUT /api/settings/admin
```

**Request Body**:
```json
{
  "editModeEnabled": false,
  "customPrompts": {
    "marketing": "New custom prompt..."
  }
}
```

### Get/Set Edit Mode
```http
GET /api/settings/edit-mode
PUT /api/settings/edit-mode
```

**PUT Request Body**:
```json
{
  "enabled": true
}
```

### Get/Update All Prompts
```http
GET /api/settings/prompts
PUT /api/settings/prompts
```

**PUT Request Body**:
```json
{
  "marketing": "Custom marketing compilation prompt...",
  "marketIntelligence": "Custom intelligence prompt...",
  "productStrategy": "Custom strategy prompt..."
}
```

## Pipeline API

### Trigger Content Generation
```http
POST /api/pipeline/generate
```

**Request Body**:
```json
{
  "productId": "09_ai_innovation_workshop",
  "contentTypes": ["manifesto", "functional-spec", "audience-icps"],
  "regenerate": false,
  "priority": "normal"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobId": "gen_123456",
    "productId": "09_ai_innovation_workshop",
    "contentTypes": 3,
    "estimatedTime": 300,
    "status": "queued",
    "queuePosition": 2
  }
}
```

### Get Generation Status
```http
GET /api/pipeline/status/{productId}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": "09_ai_innovation_workshop",
    "jobId": "gen_123456",
    "status": "processing",
    "progress": 60,
    "currentStage": "generating user stories",
    "startedAt": "2024-01-15T15:00:00Z",
    "estimatedCompletion": "2024-01-15T15:05:00Z",
    "completedTypes": ["manifesto", "functional-spec"],
    "remainingTypes": ["audience-icps"]
  }
}
```

### Get Pipeline Queue
```http
GET /api/pipeline/queue
```

**Response**:
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "jobId": "gen_123456",
        "productId": "09_ai_innovation_workshop",
        "contentTypes": 3,
        "priority": "normal",
        "queuedAt": "2024-01-15T15:00:00Z",
        "estimatedStart": "2024-01-15T15:02:00Z"
      }
    ],
    "processing": {
      "jobId": "gen_123455",
      "productId": "08_social_intelligence_dashboard",
      "progress": 80,
      "startedAt": "2024-01-15T14:58:00Z"
    }
  }
}
```

## Migration API

### Migrate from localStorage
```http
POST /api/migrate
```

**Request Body**:
```json
{
  "source": "localStorage",
  "target": "redis",
  "validate": true,
  "dryRun": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "migrated": {
      "products": 8,
      "compiledContent": 24,
      "settings": 1,
      "counts": 24
    },
    "errors": [],
    "duration": 2.5,
    "validation": {
      "passed": true,
      "checks": 56
    }
  }
}
```

## WebSocket Events (Future)

For real-time updates during compilation and generation:

### Connection
```javascript
const ws = new WebSocket('/api/ws')
```

### Events
```javascript
// Compilation progress
{
  "type": "compilation_progress",
  "productId": "01_ai_power_hour",
  "compilationType": "marketing",
  "progress": 65,
  "stage": "generating objection handling"
}

// Generation complete
{
  "type": "generation_complete",
  "productId": "09_ai_innovation_workshop",
  "contentType": "manifesto",
  "success": true
}

// Pipeline status update
{
  "type": "pipeline_status",
  "queue": 3,
  "processing": "gen_123456"
}
```

## Redis Key Patterns

For reference, here are the Redis keys this API will manage:

```
# Product definitions
bn:product:definition:{productId}
bn:product:list
bn:product:metadata:{productId}

# Rich content
bn:content:{productId}:{contentType}

# Compiled content  
bn:compiled:{type}:{productId}

# Counts and metadata
bn:count:{type}:{productId}
bn:settings:admin
bn:settings:edit-mode

# Pipeline
bn:pipeline:status:{productId}
bn:pipeline:queue
bn:version
```

## Rate Limiting

- **Standard endpoints**: 100 requests/minute
- **Compilation endpoints**: 10 requests/minute
- **Pipeline endpoints**: 5 requests/minute
- **Migration endpoint**: 1 request/hour

## Caching Headers

```http
# Product definitions (cache for 5 minutes)
Cache-Control: public, max-age=300

# Compiled content (cache for 1 hour)
Cache-Control: public, max-age=3600

# Settings (no cache)
Cache-Control: no-cache
```