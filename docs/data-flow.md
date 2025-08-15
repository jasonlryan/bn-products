<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: MINOR UPDATE - Updated content type count to 14 stages, fixed outdated file references
Status: Current
Review Notes: Updated to reflect 14-stage pipeline (was 15), corrected script references and content organization
-->

# Data Flow and Product Structure

## Data Flow Overview

The system follows a clear data flow from source files through configuration to the user interface:

```
CSV Data → Python Scripts → JSON Config → React App → localStorage → User Interface
```

## Detailed Data Flow

### 1. Source Data (CSV)
**File**: `data/BN Products List - 2025.csv`

Contains 8 products with basic information:
- Type (PRODUCT/SERVICE)
- Name
- Price
- Description
- Features
- Benefits
- Target audience

### 2. AI-Generated Content
**Directory**: `products/`

112 files (8 products × 14 content types):
```
01_ai_power_hour_01_big_idea_product_manifesto.md
01_ai_power_hour_02_idea_exploration_functional_spec.md
...
08_social_intelligence_dashboard_15_demo_qa_prep.md
```

**Content Types** (14 per product):
1. Executive Positioning
2. Product Capabilities
3. Audience ICPs
4. User Stories
5. Functional Specification
6. Competitor Analysis
7. Market Sizing
8. Key Messages
9. Demo Script
10. Presentation Structure
11. Discovery Qualification
12. Q&A Prep
13. Pricing & ROI
14. GTM Strategy

### 3. Configuration Generation
**Script**: `scripts/02_products_to_config.py` (Stage 2 of canonical pipeline)

Processes CSV + markdown files → Structured JSON:

```python
# Extract from CSV
csv_products = self.read_csv_data()

# Load rich content from markdown files
for product_id in products:
    self.load_rich_content(product_id)

# Generate unified config
config = self.build_config()
```

### 4. Product Configuration
**File**: `config/dashboard-react-product-config.json`

Unified product data structure:
```json
{
  "metadata": {
    "extractedFrom": "CSV + Product Files",
    "totalProducts": 8,
    "totalProductFiles": 112
  },
  "products": {
    "01_ai_power_hour": {
      "id": "01_ai_power_hour",
      "name": "AI Power Hour",
      "type": "PRODUCT",
      "pricing": {...},
      "content": {...},
      "richContent": {...}
    }
  }
}
```

### 5. React Application Load
**Adapter**: `src/config/product-config-adapter.ts`

Transforms config data to React-friendly format:
```typescript
import productConfigData from '../../config/dashboard-react-product-config.json'

function transformToProduct(rawProduct: any): Product {
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    type: rawProduct.type,
    // ... transform all fields
  }
}
```

### 6. Component Data Flow

#### Dashboard → Product List
```typescript
// Dashboard.tsx
const products = getAllProducts()  // From config adapter
const services = getAllServices()  // Filtered by type

// Render product cards
{products.map(product => (
  <ProductCard key={product.id} product={product} />
))}
```

#### Product Page → Rich Content
```typescript
// ProductPage.tsx
const product = getProductById(productId)  // From config

// Display tabs with different content types
<Tab label="Marketing">
  <CompiledMarketingView product={product} />
</Tab>
```

#### Compilation → Storage
```typescript
// Compiler services
const compiled = await compileMarketingPage(product)
localStorage.setItem(`compiled-marketing-${productId}`, JSON.stringify(compiled))
```

## Product Data Structure

### Core Product Schema
```typescript
interface Product {
  id: string                    // e.g., "01_ai_power_hour"
  name: string                  // e.g., "AI Power Hour"
  type: 'PRODUCT' | 'SERVICE'   // Classification
  pricing: {
    type: string                // "fixed", "tiered", "contact"
    display: string             // e.g., "£300"
    options?: PricingOption[]   // For tiered pricing
  }
  content: {
    heroTitle: string
    heroSubtitle: string
    description: string
    primaryDeliverables: string
    perfectFor: string
    whatClientBuys: string
    idealClient: string
    nextProduct: string
  }
  features: string[]
  benefits: string[]
  marketing: {
    tagline: string
    valueProposition: string
    keyMessages: string[]
  }
  richContent: RichContentFiles
  metadata: {
    extractedAt: string
    source: string
    editable: boolean
    lastModified: string
    richContentFiles: number
  }
}
```

### Rich Content Structure
```typescript
interface RichContentFiles {
  manifesto?: RichContentFile
  functionalSpec?: RichContentFile
  audienceICPs?: RichContentFile
  userStories?: RichContentFile
  competitorAnalysis?: RichContentFile
  marketSizing?: RichContentFile
  prdSkeleton?: RichContentFile
  uiPrompt?: RichContentFile
  screenGeneration?: RichContentFile
  landingPageCopy?: RichContentFile
  keyMessages?: RichContentFile
  investorDeck?: RichContentFile
  demoScript?: RichContentFile
  slideHeadlines?: RichContentFile
  qaPrep?: RichContentFile
}

interface RichContentFile {
  title: string
  metadata: {}
  sections: {
    'Original Prompt': string
    'Product Context': string
    'Generated Output': string
    'Context Used': string
  }
  fullContent: string
}
```

## State Management

### Configuration State
- **Static**: Loaded once from JSON config
- **Immutable**: Product definitions don't change at runtime
- **Cached**: Stored in module scope after first load

### Application State
- **Admin Settings**: Stored in localStorage, managed by AdminPage
- **Edit Mode**: Global flag affecting all pages
- **Compilation State**: Per-product status tracking

### Component State
- **Local State**: Individual component state (React hooks)
- **URL State**: Router params for current product/tab
- **UI State**: Loading, error, and interaction states

## Data Transformation Points

### 1. CSV → Structured Data
```python
# Python script transformation
product_data = {
    'name': row['NAME'].strip(),
    'type': row['Type'].strip().upper(),
    'pricing': self.extract_pricing_info(row['PRICE']),
    'features': self.format_list_items(row['KEY FEATURES']),
    'benefits': self.format_list_items(row['BENEFITS'])
}
```

### 2. Config → React Props
```typescript
// TypeScript adapter transformation
const transformToProduct = (rawProduct: ConfigProduct): Product => ({
  id: rawProduct.id,
  name: rawProduct.name,
  type: rawProduct.type,
  pricing: {
    type: rawProduct.pricing?.type || "contact",
    display: rawProduct.pricing?.display || "Contact for Pricing"
  },
  // ... more transformations
})
```

### 3. Rich Content → Display Format
```typescript
// Component rendering transformation
const displayContent = useMemo(() => {
  if (product.richContent?.manifesto?.sections?.['Generated Output']) {
    return product.richContent.manifesto.sections['Generated Output']
  }
  return product.richContent?.manifesto?.fullContent || 'No content available'
}, [product])
```

## Data Validation

### Config Schema Validation
- JSON schema file: `config/product-config.schema.json`
- Validates structure and required fields
- Ensures data consistency

### Runtime Type Checking
- TypeScript interfaces enforce structure
- Runtime checks in adapter functions
- Error boundaries catch data issues

### Content Validation
- Missing content handled gracefully
- Fallback values for empty fields
- User-friendly error messages

## Performance Optimizations

### Data Loading
- Lazy loading of rich content
- Memoized transformations
- Component-level caching

### Memory Management
- Large content strings stored efficiently
- Unused data garbage collected
- localStorage size monitoring

### Rendering Optimization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers