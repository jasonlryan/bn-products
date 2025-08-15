<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: COMPLETED - Redis dual storage architecture successfully implemented with full production deployment
Status: Completed/Reference
Review Notes: Migration successfully completed. System now uses dual storage (Redis + localStorage) in production via Vercel KV. All planned features implemented including dual write system, API routes, and migration tools.
-->

# Architectural Update: localStorage to Redis Migration (Full Product Lifecycle) [COMPLETED]

## Overview
Migrating from browser localStorage to Vercel KV (Redis) to enable:
- **Persistent storage** across sessions
- **Full product lifecycle management** (create, edit, compile)
- **Pipeline integration** for automated product generation
- **Multi-user editing** and collaboration

## Why Redis?
- **Simple key-value storage** - Perfect match for our current localStorage patterns
- **Vercel KV integration** - Native support with minimal setup
- **Low latency** - Fast reads for compiled content
- **No schema migrations** - Unlike Postgres/Supabase
- **Cost effective** - Pay per usage model
- **Scalable** - Handles product creation pipeline

## Current Architecture (localStorage)
```
Browser → localStorage
├── compiled-marketing-{productId}
├── compiled-market-intelligence-{productId}
├── compiled-product-strategy-{productId}
├── marketing-compilation-count-{productId}
├── admin-settings
└── page-edit-mode
```

## New Architecture (Redis + Full Product Management)
```
Browser → API Routes → Vercel KV (Redis)

Product Definitions:
├── bn:product:definition:{productId}     # Full product structure
├── bn:product:list                       # Array of all product IDs
├── bn:product:metadata:{productId}       # Creation date, version, etc.

Rich Content (15 types per product):
├── bn:content:{productId}:manifesto
├── bn:content:{productId}:functional-spec
├── bn:content:{productId}:audience-icps
├── bn:content:{productId}:user-stories
├── bn:content:{productId}:competitor-analysis
├── bn:content:{productId}:market-sizing
├── bn:content:{productId}:prd-skeleton
├── bn:content:{productId}:ui-prompt
├── bn:content:{productId}:screen-generation
├── bn:content:{productId}:landing-page-copy
├── bn:content:{productId}:key-messages
├── bn:content:{productId}:investor-deck
├── bn:content:{productId}:demo-script
├── bn:content:{productId}:slide-headlines
└── bn:content:{productId}:qa-prep

Compiled Content:
├── bn:compiled:marketing:{productId}
├── bn:compiled:market-intel:{productId}
├── bn:compiled:product-strategy:{productId}

Counts & Metadata:
├── bn:count:marketing:{productId}
├── bn:count:market-intel:{productId}
├── bn:count:product-strategy:{productId}
├── bn:settings:admin
├── bn:settings:edit-mode

Pipeline Management:
├── bn:pipeline:status:{productId}        # Generation status
├── bn:pipeline:queue                     # Products awaiting processing
└── bn:version                           # Global config version
```

## Implementation Plan

### Phase 1: Setup Infrastructure
1. **Add Vercel KV**
   ```bash
   npm install @vercel/kv
   npm install swr  # For client-side data fetching
   ```

2. **Environment Variables**
   ```env
   KV_URL="..."
   KV_REST_API_URL="..."
   KV_REST_API_TOKEN="..."
   KV_REST_API_READ_ONLY_TOKEN="..."
   ```

### Phase 2: Create Storage Service
```typescript
// src/services/storage/storageService.ts
interface StorageService {
  // Basic operations
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  
  // Numeric operations
  increment(key: string): Promise<number>
  decrement(key: string): Promise<number>
  
  // Batch operations
  mget<T = any>(keys: string[]): Promise<(T | null)[]>
  mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void>
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>
  deletePattern(pattern: string): Promise<number>
}

// Implementations
class RedisStorageService implements StorageService { }
class LocalStorageService implements StorageService { } // Fallback
```

### Phase 3: Comprehensive API Routes Structure
```
/api/
├── products/
│   ├── index.ts                    # GET (list all), POST (create new)
│   ├── [productId]/
│   │   ├── index.ts               # GET, PUT, DELETE (product definition)
│   │   ├── content/
│   │   │   ├── index.ts           # GET (all content types)
│   │   │   └── [contentType].ts   # GET, PUT (specific content)
│   │   └── clone.ts               # POST (duplicate product)
│   └── bulk.ts                    # POST (import multiple products)
├── compilation/
│   ├── marketing.ts               # GET, POST, DELETE
│   ├── market-intel.ts            # GET, POST, DELETE  
│   ├── product-strategy.ts        # GET, POST, DELETE
│   └── status.ts                  # GET (all compilation statuses)
├── settings/
│   ├── admin.ts                   # GET, PUT
│   ├── edit-mode.ts               # GET, PUT
│   └── prompts.ts                 # GET, PUT (all prompts)
├── pipeline/
│   ├── generate.ts                # POST (trigger AI generation)
│   ├── status/[productId].ts      # GET (generation status)
│   └── queue.ts                   # GET (pipeline queue)
└── migrate.ts                     # POST (one-time migration)
```

### Phase 4: Update Compiler Services
Replace direct localStorage calls with storage service:

```typescript
// Before
localStorage.setItem(key, JSON.stringify(data))

// After  
await storageService.set(key, data)

// New: Full product management
class ProductService {
  async createProduct(product: Product): Promise<string>
  async getProduct(id: string): Promise<Product | null>
  async updateProduct(id: string, updates: Partial<Product>): Promise<void>
  async deleteProduct(id: string): Promise<void>
  async listProducts(): Promise<Product[]>
  
  // Content management
  async getContent(productId: string, type: string): Promise<RichContentFile | null>
  async setContent(productId: string, type: string, content: RichContentFile): Promise<void>
  async getAllContent(productId: string): Promise<Record<string, RichContentFile>>
}
```

### Phase 5: Client-Side Updates
Add React hooks for comprehensive data fetching:

```typescript
// src/hooks/useProducts.ts
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR('/api/products', fetcher)
  return { products: data || [], error, isLoading, refetch: mutate }
}

// src/hooks/useProduct.ts
export function useProduct(productId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher
  )
  return { product: data, error, isLoading, refetch: mutate }
}

// src/hooks/useProductContent.ts
export function useProductContent(productId: string, contentType?: string) {
  const endpoint = contentType 
    ? `/api/products/${productId}/content/${contentType}`
    : `/api/products/${productId}/content`
  
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher)
  return { content: data, error, isLoading, refetch: mutate }
}

// src/hooks/useCompiledContent.ts (enhanced)
export function useCompiledContent(productId: string, type: 'marketing' | 'market-intel' | 'product-strategy') {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/compilation/${type}?productId=${productId}`,
    fetcher
  )
  return { content: data, error, isLoading, refetch: mutate }
}
```

## Enhanced Redis Schema

### Key Naming Convention
- **Namespace**: `bn:` (BrilliantNoise)
- **Categories**: `product:`, `content:`, `compiled:`, `count:`, `settings:`, `pipeline:`
- **Identifiers**: Product ID, content type, setting name

### Data Structures

#### Product Definition
```typescript
// Key: bn:product:definition:{productId}
interface ProductDefinition {
  id: string
  name: string
  type: 'PRODUCT' | 'SERVICE'
  pricing: PricingInfo
  content: ProductContent
  features: string[]
  benefits: string[]
  marketing: MarketingInfo
  metadata: {
    createdAt: string
    lastModified: string
    version: string
    createdBy?: string
  }
}
```

#### Rich Content File
```typescript
// Key: bn:content:{productId}:{contentType}
interface RichContentFile {
  title: string
  metadata: ContentMetadata
  sections: {
    'Original Prompt': string
    'Product Context': string
    'Generated Output': string
    'Context Used': string
  }
  fullContent: string
  lastModified: string
  version: string
}
```

#### Pipeline Status
```typescript
// Key: bn:pipeline:status:{productId}
interface PipelineStatus {
  productId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  currentStage: string
  startedAt: string
  completedAt?: string
  error?: string
}
```

## Migration Strategy

### Step 1: Dual Write System
- Keep localStorage writes for backward compatibility
- Add Redis writes in parallel
- No breaking changes to existing functionality

### Step 2: Data Migration Tool
```typescript
// /api/migrate.ts
interface MigrationResult {
  products: number
  compiledContent: number
  settings: number
  errors: string[]
}

POST /api/migrate
{
  "source": "localStorage",
  "target": "redis",
  "validate": true
}
```

### Step 3: Dual Read with Redis Priority
- Try Redis first for all reads
- Fall back to localStorage if Redis fails
- Log discrepancies for validation

### Step 4: Redis-Only Mode
- Remove localStorage dependencies
- Update all services to use Redis exclusively
- Add comprehensive error handling

## API Examples

### Create New Product
```typescript
POST /api/products
{
  "name": "AI Innovation Workshop",
  "type": "PRODUCT",
  "pricing": {
    "type": "fixed",
    "display": "£5,000"
  },
  "content": {
    "description": "Interactive AI workshop...",
    "perfectFor": "Teams wanting hands-on AI experience"
  },
  "features": ["Interactive sessions", "Real examples"],
  "benefits": ["Practical skills", "Immediate application"]
}

Response: {
  "success": true,
  "productId": "09_ai_innovation_workshop",
  "message": "Product created successfully"
}
```

### Update Product Content
```typescript
PUT /api/products/01_ai_power_hour/content/manifesto
{
  "title": "AI Power Hour • Product Manifesto",
  "sections": {
    "Generated Output": "Updated manifesto content...",
    // ... other sections
  },
  "fullContent": "# Updated manifesto...",
  "metadata": {
    "lastModified": "2024-01-15T10:30:00Z",
    "modifiedBy": "admin"
  }
}
```

### Trigger Content Generation
```typescript
POST /api/pipeline/generate
{
  "productId": "09_ai_innovation_workshop",
  "contentTypes": ["manifesto", "functional-spec", "audience-icps"],
  "regenerate": false  // Skip if content already exists
}

Response: {
  "success": true,
  "jobId": "gen_123456",
  "estimatedTime": 300,  // seconds
  "status": "queued"
}
```

### Get Generation Status
```typescript
GET /api/pipeline/status/09_ai_innovation_workshop

Response: {
  "productId": "09_ai_innovation_workshop",
  "status": "processing",
  "progress": 60,
  "currentStage": "generating user stories",
  "startedAt": "2024-01-15T10:00:00Z",
  "estimatedCompletion": "2024-01-15T10:05:00Z"
}
```

## Performance & Scalability

### Caching Strategy
- **Client-side**: SWR with 5-minute cache
- **Server-side**: Redis with no expiry for core data
- **CDN**: Static assets and compiled content

### Batch Operations
- Bulk product imports
- Parallel content generation
- Efficient pipeline processing

### Error Handling
- Graceful degradation to localStorage
- Retry mechanisms for failed operations
- Comprehensive error logging

## Security Considerations

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration for production

### Data Protection
- No sensitive data in Redis keys
- Secure environment variable handling
- Audit logging for admin operations

## Success Metrics

### Migration Goals
- **Zero data loss** during migration
- **< 100ms latency** for product reads
- **< 500ms latency** for content updates
- **99.9% uptime** for compilation features

### Performance Targets
- Support **50+ products** without performance degradation
- Handle **concurrent editing** by multiple users
- **Pipeline processing** of new products in < 5 minutes

## Timeline

- **Week 1**: Infrastructure setup, storage service, basic API routes
- **Week 2**: Product CRUD operations, content management APIs
- **Week 3**: Pipeline integration, migration tools
- **Week 4**: Client-side integration, testing, production deployment

## Future Enhancements

### Advanced Features
- **Real-time collaboration** with WebSockets
- **Version control** for content changes
- **A/B testing** for different content versions
- **Analytics** for content performance

### Integration Opportunities
- **GitHub integration** for version control
- **Slack notifications** for pipeline completion
- **External AI services** for content generation
- **Export capabilities** to various formats