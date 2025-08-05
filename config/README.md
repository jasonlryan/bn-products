# Configuration Files

## Current Structure (Consolidated)

After consolidation, we now have only **2 essential config files**:

### 1. `product-config-master.json` (1.36MB)
**Purpose**: The single source of truth for all product data
**Used by**: React application via `src/config/product-config-adapter.ts`
**Structure**: React-compatible format with flat product structure

```json
{
  "metadata": {
    "extractedFrom": "CSV + Product Files",
    "extractedAt": "2025-06-11T20:33:40.452208",
    "totalProducts": 8,
    "totalProductFiles": 120,
    "version": "3.0"
  },
  "products": {
    "01_ai_power_hour": {
      "id": "01_ai_power_hour",
      "name": "AI Power Hour",
      "type": "PRODUCT",
      "pricing": { ... },
      "content": { ... },
      "richContent": { ... }
    }
    // ... 7 more products
  }
}
```

### 2. `product-config.schema.json` (16KB)
**Purpose**: JSON schema for validating product configuration structure
**Used by**: Development tools and validation scripts
**Structure**: JSON Schema Draft 7 specification

## Archived Files

Moved to `/archive/` to maintain history but clean up active workspace:

- `product-config.json` - Original raw AI content format (nested stages structure)
- `product-config-clean.json` - Cleaned version of raw format  
- `dashboard-react-product-config.json` - Original React-compatible version (now `product-config-master.json`)
- Various backup and test config files

## Config File Comparison

| File | Size | Structure | Used By | Status |
|------|------|-----------|---------|--------|
| `product-config-master.json` | 1.36MB | Flat, React-compatible | React app | ✅ Active |
| `product-config.schema.json` | 16KB | JSON Schema | Validation | ✅ Active |
| `product-config.json` | 348KB | Nested stages | None | 📦 Archived |
| `product-config-clean.json` | 330KB | Nested stages | None | 📦 Archived |

## Key Differences Explained

### Raw Format (Archived)
```json
{
  "products": {
    "01_ai_power_hour": {
      "name": "Ai Power Hour",
      "type": "PRODUCT", 
      "stages": {
        "foundation": {
          "manifesto": {
            "file_metadata": { ... },
            "content": { ... }
          }
        }
      }
    }
  }
}
```

### React Format (Active)
```json
{
  "metadata": { ... },
  "products": {
    "01_ai_power_hour": {
      "id": "01_ai_power_hour",
      "name": "AI Power Hour",
      "type": "PRODUCT",
      "pricing": { ... },
      "content": { ... },
      "richContent": {
        "manifesto": {
          "title": "...",
          "sections": { ... },
          "fullContent": "..."
        }
      }
    }
  }
}
```

## Usage

### In React Application
```typescript
// src/config/product-config-adapter.ts
import productConfigData from '../../config/product-config-master.json';

// Transform to Product interface
const products = getAllProducts(); // Uses master config
```

### For Validation
```bash
# Validate config structure
ajv validate -s config/product-config.schema.json -d config/product-config-master.json
```

## Redis Migration Impact

When migrating to Redis, `product-config-master.json` will be:
1. **Parsed** into individual product records
2. **Stored** as separate Redis keys per product
3. **Maintained** as fallback/seed data
4. **Version controlled** for configuration changes

The consolidated structure makes this migration much cleaner since we have:
- ✅ Single authoritative source
- ✅ React-compatible format
- ✅ Clear product boundaries
- ✅ Rich content properly structured

## Regenerating Config

If you need to regenerate the master config from source data:

```bash
# From project root
cd scripts
python3 extract_csv_to_config.py

# This will generate a new config that needs to be renamed to product-config-master.json
```

## Maintenance

- **Update frequency**: Only when new products are added or existing products change significantly
- **Validation**: Always validate against schema after manual edits
- **Backup**: Archive previous versions before major updates
- **Size monitoring**: File is large (1.36MB) - consider splitting if it grows much larger