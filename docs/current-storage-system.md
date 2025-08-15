<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: MAJOR UPDATE - Updated to reflect current dual storage architecture (Redis + localStorage)
Status: Current
Review Notes: Completely rewritten to document the actual dual storage implementation rather than localStorage-only system
-->

# Current Storage System (Dual Storage: Redis + localStorage)

## Overview

The application uses a **dual storage architecture** with Redis (Vercel KV) as the primary storage and localStorage as a fallback. This approach provides production-grade persistence while maintaining development simplicity and offline capability.

## Storage Architecture

### Key Patterns

All localStorage keys follow specific naming conventions:

```
compiled-{type}-{productId}        # Compiled content
{type}-compilation-count-{productId} # Compilation counters
admin-settings                      # Admin configuration
page-edit-mode                      # Global edit flag
```

### Storage Types

#### 1. Compiled Content
Stores the AI-compiled content for each product and compilation type.

**Key format**: `compiled-marketing-01_ai_power_hour`

**Value structure**:
```json
{
  "id": "compiled-01_ai_power_hour-1234567890",
  "productId": "01_ai_power_hour",
  "compiledAt": "2024-01-15T10:30:00.000Z",
  "content": {
    "executiveSummary": { ... },
    "messagingFramework": { ... },
    "salesProcessGuide": { ... },
    "objectionHandling": { ... },
    "marketingAssets": { ... },
    "targetAudienceIntel": { ... },
    "implementationGuide": { ... }
  },
  "rawMarkdown": "# Sales & Marketing Guide..."
}
```

#### 2. Compilation Counts
Tracks how many times each product has been compiled.

**Key format**: `marketing-compilation-count-01_ai_power_hour`

**Value**: Simple numeric string (e.g., "5")

#### 3. Admin Settings
Stores all administrative configuration.

**Key**: `admin-settings`

**Value structure**:
```json
{
  "editModeEnabled": true,
  "lastCompiled": {
    "01_ai_power_hour": "2024-01-15T10:30:00.000Z"
  },
  "compilationStatus": {
    "01_ai_power_hour": "complete"
  },
  "compilationCount": {
    "01_ai_power_hour": 5
  },
  "marketingPrompt": "Custom prompt...",
  "marketIntelligencePrompt": "Custom prompt...",
  "productStrategyPrompt": "Custom prompt..."
}
```

#### 4. Edit Mode Flag
Global flag for content editing capability.

**Key**: `page-edit-mode`

**Value**: "true" or "false" (string)

## Storage Operations

### Reading Data
```typescript
// Get compiled content
const key = `compiled-marketing-${productId}`;
const stored = localStorage.getItem(key);
const compiled = stored ? JSON.parse(stored) : null;

// Get compilation count
const countKey = `marketing-compilation-count-${productId}`;
const count = parseInt(localStorage.getItem(countKey) || '0');
```

### Writing Data
```typescript
// Save compiled content
localStorage.setItem(
  `compiled-marketing-${productId}`,
  JSON.stringify(compiledContent)
);

// Increment count
const newCount = currentCount + 1;
localStorage.setItem(
  `marketing-compilation-count-${productId}`,
  newCount.toString()
);
```

### Deleting Data
```typescript
// Reset compilation
localStorage.removeItem(`compiled-marketing-${productId}`);
localStorage.removeItem(`marketing-compilation-count-${productId}`);
```

## Storage Limits

- **Size limit**: ~5-10MB per origin (browser-dependent)
- **Synchronous API**: Can block UI for large operations
- **String-only values**: Requires JSON serialization

## Data Lifecycle

1. **Initial State**: No localStorage data exists
2. **First Compilation**: Creates compiled content and sets count to 1
3. **Subsequent Compilations**: Overwrites content, increments count
4. **Reset**: Removes both content and count entries
5. **Browser Clear**: All data lost (no recovery)

## Current Issues

### Limitations
- **Browser-specific**: Data doesn't sync across devices
- **Volatile**: Can be cleared by user or browser
- **Single-user**: No conflict resolution for multiple users
- **No backup**: Data loss is permanent

### Performance Impacts
- Large compiled content can slow down saves
- Synchronous API blocks the main thread
- No partial updates (must save entire object)

## localStorage Usage by Component

### MarketingCompiler Service
- Saves: `compiled-marketing-{productId}`
- Tracks: `marketing-compilation-count-{productId}`
- Methods: `saveCompiledPage()`, `loadCompiledPage()`

### MarketIntelligenceCompiler Service
- Saves: `compiled-market-intelligence-{productId}`
- Tracks: `market-intelligence-compilation-count-{productId}`

### ProductStrategyCompiler Service
- Saves: `compiled-product-strategy-{productId}`
- Tracks: `product-strategy-compilation-count-{productId}`

### AdminPage Component
- Manages: `admin-settings`
- Updates: All compilation statuses and counts
- Controls: Global edit mode flag

### EditableSection Component
- Reads: `page-edit-mode`
- Updates: Individual content sections (indirect)

## Migration Considerations

When migrating to Redis or another storage system:

1. **Key Translation**: Map localStorage keys to new naming scheme
2. **Data Format**: Ensure JSON compatibility
3. **Async Operations**: Convert synchronous calls to async
4. **Error Handling**: Add network error resilience
5. **Caching**: Implement client-side cache for performance