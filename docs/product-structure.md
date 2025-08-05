# Product Structure

## Product Overview

The system manages **8 products** (4 Products + 4 Services) representing AI consultancy offerings. Each product has comprehensive content generated across **15 different content types**.

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

## Content Type Breakdown

Each product has 15 AI-generated content pieces covering the complete product development lifecycle:

### Foundation Phase (3 types)
1. **Product Manifesto** (`01_big_idea_product_manifesto`)
   - Problem definition
   - Target audience
   - Solution approach
   - Magic moment
   - Why we're excited

2. **Functional Spec** (`02_idea_exploration_functional_spec`)
   - Overview
   - Inputs required
   - Process description
   - Expected outputs
   - Limitations

3. **Audience ICPs** (`03_idea_exploration_audience_icps`)
   - 3 Ideal Customer Profiles
   - Motivations and pain points
   - Typical day descriptions
   - Success definitions

### Planning Phase (3 types)
4. **User Stories** (`04_idea_exploration_user_stories`)
   - As a [role] I want [goal] so that [benefit]
   - Acceptance criteria
   - Priority levels

5. **Competitor Analysis** (`05_plan_competitor_sweep`)
   - 3-5 competing products
   - Value propositions
   - Pricing models
   - Strengths/weaknesses
   - Gaps we exploit

6. **Market Sizing** (`06_plan_tam_sizing`)
   - Total Addressable Market calculation
   - Assumptions and equations
   - Market opportunity assessment

### Research Phase (2 types)
7. **PRD Skeleton** (`07_research_prd_skeleton`)
   - Goal definition
   - User personas
   - MVP requirements
   - Success metrics
   - Risk assessment

8. **UI Prompt** (`08_research_prd_ui_prompt`)
   - Interface design requirements
   - User experience guidelines
   - Visual design direction

### Build Phase (3 types)
9. **Screen Generation** (`09_build_generate_screens`)
   - Key application screens
   - User interface mockups
   - Interaction flows

10. **Landing Page Copy** (`10_build_ui_landing_page_copy`)
    - Hero headlines
    - Feature descriptions
    - Call-to-action text
    - Benefit statements

11. **Key Messages** (`11_build_ui_key_messages`)
    - Core value propositions
    - Messaging hierarchy
    - Audience-specific messaging

### Demo Phase (4 types)
12. **Investor Deck** (`12_demo_investor_deck`)
    - Pitch deck structure
    - Key slides content
    - Financial projections
    - Investment ask

13. **Demo Script** (`13_demo_demo_script`)
    - Demonstration flow
    - Key talking points
    - Feature highlights
    - Closing techniques

14. **Slide Headlines** (`14_demo_slide_headlines`)
    - Presentation structure
    - Compelling headlines
    - Story narrative

15. **Q&A Prep** (`15_demo_qa_prep`)
    - Anticipated questions
    - Prepared responses
    - Objection handling

## File Naming Convention

All content files follow this pattern:
```
{product_number}_{product_slug}_{content_number}_{content_type}.md
```

Examples:
```
01_ai_power_hour_01_big_idea_product_manifesto.md
02_ai_b_c_05_plan_competitor_sweep.md
08_social_intelligence_dashboard_15_demo_qa_prep.md
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

Each content file includes generation metadata:

```json
{
  "file_metadata": {
    "file_path": "01_ai_power_hour_01_big_idea_product_manifesto.md",
    "generated_date": "2025-06-10 12:26:40",
    "model": "GPT-4o (creative)",
    "status": "draft"
  },
  "generation_metadata": {
    "prompt_used": "You are a startup co-founder. Draft a Product Manifesto...",
    "context_used": [
      "Product data from CSV",
      "No previous outputs (first prompt)"
    ],
    "previous_outputs": 3
  }
}
```

## Content Structure

### Markdown File Format
```markdown
# Product Name • Content Type

**Generated using:** Stage • Content Type
**Model:** GPT-4o (variant)
**Date:** January 2025
**Product:** Product Name (£Price)

---

## Original Prompt
[The prompt used to generate this content]

---

## Product Context
[Relevant product information provided to AI]

---

## Generated Output
[The actual AI-generated content]

---

## Context Used
[Information about what context was available]
```

### Structured Content Sections
Each rich content file has consistent sections:

1. **Original Prompt** - The instruction given to AI
2. **Product Context** - Product information provided
3. **Generated Output** - Main AI-generated content
4. **Context Used** - Metadata about generation context

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
- All 15 content types generated for each product
- Rich metadata for traceability
- Structured format consistency

### Relevance
- Content aligned with product positioning
- Audience-appropriate language
- Industry-specific examples

### Usability
- Clear section breaks
- Scannable format
- Actionable insights

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