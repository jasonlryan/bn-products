# Compilation System

## Overview

The compilation system transforms multiple AI-generated content pieces into unified, purpose-specific pages. There are three distinct compilation types, each serving different business needs.

## Compilation Types

### 1. Marketing & Sales Compilation
**Purpose**: Creates comprehensive sales enablement resources

**Source Content**:
- Key Messages (`richContent.keyMessages`)
- Demo Script (`richContent.demoScript`)
- Slide Headlines (`richContent.slideHeadlines`)
- Q&A Prep (`richContent.qaPrep`)

**Output Structure**:
- Executive Summary
- Messaging Framework
- Sales Process Guide
- Objection Handling
- Marketing Assets
- Target Audience Intelligence
- Implementation Guide

### 2. Market Intelligence Compilation
**Purpose**: Provides strategic market analysis

**Source Content**:
- Competitor Analysis (`richContent.competitorAnalysis`)
- Market Sizing (`richContent.marketSizing`)
- Audience ICPs (`richContent.audienceICPs`)
- Investor Deck (`richContent.investorDeck`)

**Output Structure**:
- Market Overview
- Competitive Landscape
- Target Market Analysis
- Growth Opportunities
- Strategic Recommendations

### 3. Product Strategy Compilation
**Purpose**: Defines product vision and roadmap

**Source Content**:
- Product Manifesto (`richContent.manifesto`)
- User Stories (`richContent.userStories`)
- Functional Spec (`richContent.functionalSpec`)
- PRD Skeleton (`richContent.prdSkeleton`)

**Output Structure**:
- Product Vision
- Strategic Roadmap
- Feature Prioritization
- Success Metrics
- Implementation Timeline

## Compilation Workflow

### Step 1: Trigger Compilation
From admin panel, user clicks "Compile" or "Compile All"

```typescript
// AdminPage.tsx
const compileMarketingPage = async (productId: string) => {
  // Update status to 'compiling'
  // Call compiler service
  // Handle success/error
}
```

### Step 2: Extract Content
Compiler service extracts relevant content from product data

```typescript
// marketingCompiler.ts
private extractMarketingInputs(product: Product): MarketingInputs {
  return {
    keyMessages: product.richContent?.keyMessages?.sections['Generated Output'],
    demoScript: product.richContent?.demoScript?.sections['Generated Output'],
    slideHeadlines: product.richContent?.slideHeadlines?.sections['Generated Output'],
    qaPrep: product.richContent?.qaPrep?.sections['Generated Output']
  }
}
```

### Step 3: AI Processing
Content is processed through AI service with custom prompts

```typescript
// Current: Simulated AI processing
private generateSalesEnablementContent(
  product: Product, 
  inputs: MarketingInputs
): CompiledMarketingPage['content']

// Future: Real AI integration
const aiResponse = await aiService.generateCompiledContent(
  MARKETING_COMPILATION_PROMPT,
  inputData
)
```

### Step 4: Structure Output
AI response is structured into defined schema

```typescript
interface CompiledMarketingPage {
  id: string
  productId: string
  compiledAt: Date
  content: {
    executiveSummary: {...}
    messagingFramework: {...}
    salesProcessGuide: {...}
    // ... etc
  }
  rawMarkdown: string
}
```

### Step 5: Save Results
Compiled content saved to localStorage

```typescript
// Save compiled content
localStorage.setItem(
  `compiled-marketing-${productId}`,
  JSON.stringify(compiledPage)
)

// Increment counter
this.incrementCompilationCount(productId)
```

### Step 6: Update UI
Admin panel reflects new status and count

## Compilation Status States

1. **idle** - No compilation or ready for compilation
2. **compiling** - Currently processing
3. **complete** - Successfully compiled
4. **error** - Compilation failed

## Prompt Management

### Custom Prompts
Each compilation type has a customizable prompt:

```typescript
// Default prompts imported from:
import { MARKETING_COMPILATION_PROMPT } from '../prompts/marketingPrompt'
import { MARKET_INTELLIGENCE_COMPILATION_PROMPT } from '../prompts/marketIntelligencePrompt'
import { PRODUCT_STRATEGY_COMPILATION_PROMPT } from '../prompts/productStrategyPrompt'
```

### Prompt Customization
Admin panel allows editing prompts:
1. Click "Edit Prompt" in Prompt Management section
2. Modify prompt text
3. Save changes (stored in admin-settings)
4. Future compilations use custom prompt

## Compilation Tracking

### Count Tracking
Each product tracks compilation count per type:
```
marketing-compilation-count-01_ai_power_hour: "5"
market-intelligence-compilation-count-01_ai_power_hour: "3"
product-strategy-compilation-count-01_ai_power_hour: "2"
```

### History
Last compilation date stored in admin settings:
```json
{
  "lastCompiled": {
    "01_ai_power_hour": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Handling

### Common Errors
1. **Missing Content**: Source content not available
2. **AI Service Failure**: External service timeout/error
3. **Storage Full**: localStorage quota exceeded
4. **Invalid JSON**: Parsing errors

### Error Recovery
- Status set to 'error'
- Error logged to console
- User notified in UI
- Can retry compilation

## Performance Considerations

### Compilation Time
- Simulated: ~1-2 seconds
- With real AI: ~5-30 seconds depending on content size

### Parallel Compilation
"Compile All" processes products sequentially to avoid:
- localStorage race conditions
- UI freezing
- Memory overload

### Storage Impact
Each compiled page ~50-200KB:
- 8 products × 3 types = 24 compiled pages
- Total: ~1-5MB localStorage usage

## Future Enhancements

### Real AI Integration
```typescript
// aiService.ts (planned)
async generateCompiledContent(
  prompt: string,
  inputData: string
): Promise<string> {
  const response = await fetch('/api/ai/compile', {
    method: 'POST',
    body: JSON.stringify({ prompt, data: inputData })
  })
  return response.json()
}
```

### Compilation Queue
- Background processing
- Progress indicators
- Cancel capability
- Retry mechanism

### Version Control
- Track compilation versions
- Compare changes
- Rollback capability
- Diff visualization