<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: MAJOR UPDATE - Updated to reflect new 14-stage pipeline and reorganized content structure
Status: Current
Review Notes: Updated for new canonical pipeline (00→01→02→03), new prompt structure, and current file organization
-->

# Product Structure

## Product Overview

The system manages **8 products** (4 Products + 4 Services) representing AI consultancy offerings. Each product has comprehensive content generated across **14 different content types** using the canonical 4-stage pipeline.

## Product List

### Products (4)
1. **AI Power Hour** - £300 consultation session
2. **AI-B-C™** - £2,000-£17,500 transformation program
3. **AI-Powered Research Sprint** - £10,000 research service
4. **AI Innovation Day** - £8,800 prototype workshop

### Services (4)
1. **AI Innovation Programme** - £25,000+ innovation setup
2. **AI Leadership Partner** - £8,000/month fractional CAIO
3. **AI Consultancy Retainer** - £12,000/month ongoing support
4. **Social Intelligence Dashboard** - Market analysis platform

## Content Generation Pipeline

Each product has 14 AI-generated content pieces created through the canonical 4-stage processing pipeline:

**Pipeline:** `00_clean_csv.py` → `01_csv_to_products.py` → `02_products_to_config.py` → `03_config_to_redis.py`

### Foundation & Product (5 types)
1. **Executive Positioning** (`01_executive_positioning`)
   - Market problem definition
   - Solution approach
   - Target executive buyer
   - Unique market position
   - Business impact statement

2. **Product Capabilities** (`02_product_capabilities`)
   - Core functionality overview
   - Technical capabilities
   - Integration possibilities
   - Scalability features

3. **Audience ICPs** (`03_audience_icps`)
   - 3 Ideal Customer Profiles
   - Motivations and pain points
   - Success definitions
   - Budget authority and buying process

4. **User Stories** (`04_user_stories`)
   - As a [role] I want [goal] so that [benefit]
   - Acceptance criteria
   - Priority levels

5. **Functional Specification** (`05_functional_specification`)
   - Detailed process description
   - Inputs and outputs
   - Success metrics
   - Implementation requirements

### Market Intelligence (2 types)
6. **Competitor Analysis** (`06_competitor_analysis`)
   - 5 direct and indirect competitors
   - Value propositions and pricing
   - Strengths/weaknesses analysis
   - Market gaps we exploit

7. **Market Sizing** (`07_market_sizing`)
   - Total Addressable Market calculation
   - Market assumptions and equations
   - Growth opportunity assessment

### Sales Enablement (4 types)
8. **Key Messages** (`08_key_messages`)
   - Core value propositions
   - Messaging framework
   - Audience-specific messaging

9. **Demo Script** (`09_demo_script`)
   - Demonstration flow
   - Key talking points
   - Feature highlights
   - Closing techniques

10. **Presentation Structure** (`10_presentation_structure`)
    - Slide structure and headlines
    - Story narrative flow
    - Compelling presentation framework

11. **Discovery Qualification** (`11_discovery_qualification`)
    - Qualification framework
    - Discovery questions
    - Buying criteria assessment

### Strategic Planning (3 types)
12. **Q&A Prep** (`12_qa_prep`)
    - Anticipated questions
    - Prepared responses
    - Objection handling

13. **Pricing & ROI** (`13_pricing_roi`)
    - ROI calculations
    - Pricing justification
    - Value demonstration

14. **Go-to-Market Strategy** (`14_gtm_strategy`)
    - Market entry strategy
    - Channel approach
    - Launch planning

## File Organization Structure

Content is organized in product-specific directories with structured naming:

```
products/
├── {product_id}/
│   ├── product_context.json           # Product metadata and context
│   ├── generation_metadata.json       # Generation tracking and stats
│   ├── 01_executive_positioning.md
│   ├── 02_product_capabilities.md
│   ├── ...
│   └── 14_gtm_strategy.md
```

### File Naming Pattern
```
{content_number}_{content_type}.md
```

### Examples
```
products/01_ai_power_hour/01_executive_positioning.md
products/02_ai_b_c/06_competitor_analysis.md  
products/08_social_intelligence_dashboard/14_gtm_strategy.md
```

## Product ID Schema

Products use consistent ID format:
```
{number}_{product_name_slug}
```

Current IDs:
- `01_ai_power_hour`
- `02_ai_b_c`
- `03_ai_innovation_programme`
- `04_ai_leadership_partner_fractional_caio`
- `05_ai_powered_research_and_insight_sprint`
- `06_ai_consultancy_retainer`
- `07_ai_innovation_day`
- `08_social_intelligence_dashboard`

## Content Generation Metadata

### Product Context (product_context.json)
```json
{
  "id": "01_ai_power_hour",
  "name": "AI Power Hour",
  "type": "PRODUCT",
  "price": "£300",
  "primaryDeliverables": "60-minute breakthrough session + personalized AI roadmap + implementation toolkit",
  "description": "Get unstuck on your biggest AI challenge in 60 minutes...",
  "keyFeatures": "- One-on-one expert guidance\n- Real-world solutions\n- Personalized roadmap",
  "benefits": "- Skip 3-6 months of research\n- Build confidence\n- See results within days",
  "extractedAt": "2025-08-15 14:30:00",
  "source": "CSV"
}
```

### Generation Metadata (generation_metadata.json)
```json
{
  "generatedAt": "2025-08-15 14:30:00",
  "totalPrompts": 14,
  "model": "gpt-5-mini",
  "prompts": [
    {
      "prompt_number": 1,
      "prompt_name": "executive_positioning",
      "prompt_file": "01_executive_positioning.md",
      "generated_at": "2025-08-15 14:30:15",
      "content_length": 2847,
      "filename": "01_executive_positioning.md",
      "context_used": 0
    }
  ]
}
```

## Content Structure

### Markdown File Format
```markdown
# Product Name • Content Type

[AI-generated content directly - clean format without metadata headers]

## Key Section Headers
- ## 🎯 Problem (for Executive Positioning)
- ## 💡 Solution  
- ## ✨ Magic Moment
- ## ICP 1 — [Title] (for Audience ICPs)
- Competitor 1 — [Name] (for Competitor Analysis)

```

### Rich Content Structure in Config
Each content file is stored in the master config as:

```typescript
interface RichContentFile {
  metadata: {
    title: string
    contentType: string  
    source: string
    extractedAt: string
  }
  sections: {
    [key: string]: string  // Parsed content sections
  }
  fullContent: string     // Complete markdown content
}
```

## Pricing Structure

### Fixed Pricing
- AI Power Hour: £300
- AI Innovation Day: £8,800

### Tiered Pricing
- AI-B-C™: £2,000 (briefing) → £8,800 (workshop) → £17,500 (complete)

### Subscription Pricing
- AI Leadership Partner: £8,000/month
- AI Consultancy Retainer: £12,000/month

### Variable Pricing
- AI Innovation Programme: From £25,000
- AI Research Sprint: £10,000
- Social Intelligence Dashboard: Market analysis from £15,000

## Target Audiences

### Primary Audiences
- Senior executives and C-level leaders
- Innovation and transformation heads
- Marketing and customer experience leaders
- Team leads responsible for operations

### Industry Focus
- Technology companies
- Financial services
- Retail and e-commerce
- Professional services
- Manufacturing

### Company Size
- Small businesses (50-200 employees)
- Mid-market (200-1000 employees)
- Enterprise (1000+ employees)

## Content Quality Metrics

### Completeness
- All 14 content types generated for each product
- Rich metadata for traceability (product_context.json, generation_metadata.json)
- Structured format consistency across pipeline

### Processing Pipeline
- **Stage 0**: CSV cleaning and validation (`00_clean_csv.py`)
- **Stage 1**: CSV to product files with LLM generation (`01_csv_to_products.py`)
- **Stage 2**: Product files to master config JSON (`02_products_to_config.py`)  
- **Stage 3**: Config to Redis deployment (`03_config_to_redis.py`)

### Data Quality
- Smart list extraction prevents feature splitting ("Real-world solutions" stays intact)
- Proper markdown parsing for sections (Problem, Solution, Magic Moment, ICPs, Competitors)
- Frontend parsing handles new markdown structure correctly
- Improved error handling and validation throughout pipeline

### Relevance
- Content aligned with product positioning
- Audience-appropriate language
- Industry-specific examples
- Context-aware generation using previous prompts

## Future Enhancements

### Content Versioning
- Track content evolution
- A/B testing different versions
- Performance-based optimization

### Dynamic Content
- Real-time content updates
- Personalized content generation
- Context-aware messaging

### Integration Opportunities
- CRM system integration
- Marketing automation
- Sales enablement platforms