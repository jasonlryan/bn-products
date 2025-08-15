<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: VERIFIED CURRENT - User stories align with current system capabilities and business objectives
Status: Current
Review Notes: Comprehensive user stories cover all key personas and use cases, with clear technical implementation notes
-->

# User Stories for BrilliantNoise Product Dashboard

## Overview

This document contains consolidated user stories for the BrilliantNoise Product Dashboard, a React/Vite application that serves as a comprehensive product management and sales enablement tool. The dashboard provides access to AI products and services with detailed information, pricing, and marketing materials.

## User Personas

### Primary Users

1. **Account Managers** - Responsible for client relationships and sales
2. **Sales Team Members** - Handle discovery calls and proposals
3. **Consultants** - Deliver services and manage client projects
4. **New Team Members** - Learning about company offerings
5. **Product Managers** - Managing and updating product information

---

## Epic 1: Quick Quote Response

### User Story 1.1: Rapid Product Lookup

**As an** Account Manager  
**I want to** search by product name or type and see pricing, features, and benefits at a glance  
**So that** I can respond confidently within minutes

**Acceptance Criteria:**

- Search and filter by type
- Instant pricing display
- One-click to detailed info
- Responsive interface

**Technical Notes:**

- Uses the Dashboard's product grid with search functionality
- Leverages the `getAllProducts()` and `getAllServices()` functions
- Displays pricing from `product.pricing.display`
- Shows features and benefits from `product.features` and `product.benefits`

### User Story 1.2: Standard Pricing Reference

**As an** Account Manager  
**I want to** see clear standard pricing and inclusions for each product  
**So that** I can avoid underselling or overpromising

**Acceptance Criteria:**

- Pricing displayed on card
- Inclusions shown
- Multiple tiers visible if applicable

**Technical Notes:**

- Uses `product.pricing.type` to determine pricing model
- Displays `product.pricing.display` for user-friendly pricing
- Shows `product.content.primaryDeliverables` for inclusions

---

## Epic 2: Discovery Call Support

### User Story 2.1: Solution Matching

**As a** Sales Team Member  
**I want to** filter products by type, "perfect for" use cases, and ideal client profiles  
**So that** I can recommend the right mix on the spot

**Acceptance Criteria:**

- Filter by product type (PRODUCT vs SERVICE)
- Filter by "perfect for" use cases
- Access to ideal client profiles
- Quick recommendation engine

**Technical Notes:**

- Uses the tab navigation between Products and Services
- Leverages `product.content.perfectFor` for client matching
- Accesses `product.content.idealClient` for target audience info
- Uses `product.type` to distinguish between PRODUCT and SERVICE

### User Story 2.2: Real-time Product Information

**As a** Sales Team Member  
**I want to** open detailed product pages with technical, marketing, and competitive info  
**So that** I can answer questions confidently and show a structured approach

**Acceptance Criteria:**

- Quick access to detailed product pages
- Technical specifications available
- Marketing materials accessible
- Competitive information visible

**Technical Notes:**

- Uses the ProductPage component with multiple view tabs
- Accesses `product.richContent` for detailed information
- Leverages the tab system: Home, Functional Spec, Marketing & Sales, etc.

---

## Epic 3: Proposal Quality Assurance

### User Story 3.1: Scope Verification

**As a** Consultant  
**I want to** compare my proposal scope against standard deliverables  
**So that** I can prevent misaligned pricing or scope creep

**Acceptance Criteria:**

- Standard deliverables clearly listed
- Scope comparison tools
- Pricing alignment verification
- Best practice checklists

**Technical Notes:**

- Uses `product.content.primaryDeliverables` for scope verification
- Accesses `product.richContent.functionalSpec` for technical details
- Leverages `product.pricing` for cost verification

### User Story 3.2: Best Practice Alignment

**As a** New Team Member  
**I want to** access standardized descriptions, approved key messages, and examples of past work  
**So that** I can feel confident my proposal meets company standards

**Acceptance Criteria:**

- Standardized product descriptions
- Approved key messages
- Examples of past work
- Best practice guidelines

**Technical Notes:**

- Uses `product.marketing.keyMessages` for approved messaging
- Accesses `product.richContent.competitorAnalysis` for positioning
- Leverages `product.content.description` for value propositions

---

## Epic 4: Cross-Selling Opportunities

### User Story 4.1: Natural Service Introduction

**As a** Team Member  
**I want to** quickly find related services with benefits and key messages  
**So that** I can introduce them naturally during a meeting

**Acceptance Criteria:**

- Related services suggestions
- Clear benefit statements
- Key messages for each service
- Quick access during meetings

**Technical Notes:**

- Uses the Dashboard's service filtering and search
- Leverages `product.benefits` for quick benefit statements
- Accesses `product.marketing.keyMessages` for messaging
- Uses `product.richContent.audienceICPs` for client targeting

### User Story 4.2: Benefit-Focused Presentation

**As a** Team Member  
**I want to** show clear benefits, outcomes, and relevant case studies  
**So that** I can communicate value effectively

**Acceptance Criteria:**

- Clear benefit statements
- Outcome metrics
- Relevant case studies
- Value communication tools

**Technical Notes:**

- Uses `product.benefits` array for key benefits
- Accesses `product.richContent` for detailed information
- Leverages the Marketing & Sales tab for presentation materials

---

## Epic 5: New Team Member Onboarding

### User Story 5.1: Self-Directed Learning

**As a** New Team Member  
**I want to** explore the full offer with descriptions, pricing, and use cases  
**So that** I can quickly learn how to talk about our products

**Acceptance Criteria:**

- Comprehensive product exploration
- Clear descriptions and pricing
- Use case examples
- Learning path guidance

**Technical Notes:**

- Uses the Dashboard's intuitive navigation
- Leverages `product.content.description` for product understanding
- Accesses `product.richContent` for comprehensive learning
- Uses the tab system for organized information access

### User Story 5.2: Reference Material Access

**As a** New Team Member  
**I want to** use the dashboard as a "live crib sheet" during client calls  
**So that** I can answer accurately without having to check with others

**Acceptance Criteria:**

- Quick reference mode
- Live client call support
- Accurate information access
- No need for external verification

**Technical Notes:**

- Uses the search and navigation features
- Leverages `product.marketing.keyMessages` for approved messaging
- Accesses `product.richContent.qaPrep` for common questions
- Uses the organized tab structure for easy reference

---

## Epic 6: Product Management

### User Story 6.1: Content Management

**As a** Product Manager  
**I want to** edit descriptions, pricing, benefits, and marketing materials  
**So that** information stays current

**Acceptance Criteria:**

- Edit product descriptions
- Update pricing information
- Modify benefits and features
- Update marketing materials

**Technical Notes:**

- Uses the EditableSection components for content editing
- Leverages the AdminPage for bulk management
- Accesses the product configuration system
- Uses the panel configuration for content organization

### User Story 6.2: Content Organization

**As a** Product Manager  
**I want to** structure content panels and tabs logically  
**So that** team members can find information quickly

**Acceptance Criteria:**

- Logical content organization
- Easy information discovery
- Consistent structure
- Efficient navigation

**Technical Notes:**

- Uses the DraggableTabPanel system for content organization
- Leverages the panel configuration management
- Accesses the tab-based content organization
- Uses the rich content structure for detailed information

---

## Epic 7: Future Potential

### Future User Stories

1. **CRM Integration** - Track what's been shared with each client
2. **Proposal Generation** - Create proposals from dashboard data
3. **Case Study Builder** - Integrated case study creation
4. **Analytics Dashboard** - Usage and performance metrics
5. **AI-Powered Recommendations** - Intelligent upselling suggestions
6. **Client Portal** - Direct access to approved information
7. **Video and Interactive Demos** - Richer sales conversations

---

## Technical Implementation Notes

### Key Components Used

- **Dashboard.tsx**: Main product listing and navigation
- **ProductPage.tsx**: Detailed product information with multiple views
- **EditableSection.tsx**: Content editing capabilities
- **DraggableTabPanel.tsx**: Reorganizable content panels
- **LandingPageView.tsx**: Marketing-focused product presentation

### Data Sources

- **product-config.json**: Main product configuration
- **CSV data**: Product information from external sources
- **Rich content files**: Detailed documentation and specifications

### Key Features

- Tab-based navigation for different content types
- Drag-and-drop panel organization
- Real-time content editing
- Responsive design for mobile and desktop
- Search and filtering capabilities
- Admin interface for content management

---

## Success Metrics

### User Experience Metrics

- Time to find product information (target: <30 seconds)
- Time to generate accurate quote (target: <5 minutes)
- User satisfaction with information completeness
- Reduction in proposal inconsistencies
- Increased cross-selling success rate

### Business Metrics

- Faster response times to client inquiries
- Improved proposal quality and consistency
- Increased team confidence in client conversations
- Reduced onboarding time for new team members
- Higher conversion rates from discovery calls

---

## Development Roadmap

### NOW (Immediate Priorities)

- Make dashboard public and accessible
- Ensure rapid search/filter and quick-quote capabilities (Epic 1)
- Standard pricing/inclusion display (Epic 1)
- Basic discovery call support with solution matching and "perfect for" filtering (Epic 2)

### NEAR (Next Phase)

- Testing plan (Antony & Katie red team) to validate:
  - Scope verification and best practice alignment (Epic 3)
  - Cross-sell search and benefit-focused presentation (Epic 4)
  - Reference mode for live client calls (Epic 5.2)
- Team training session where everyone brings a real use-case
- Add related service linking for natural upsell opportunities (Epic 4)
- Build lightweight content editing (Epic 6.1)

### FAR (Future Vision)

- Integrate case study builder, proposal builder, and demo toolkit into one sales & marketing dashboard
- CRM integration and client tracking (Epic 7)
- AI product recommendations (Epic 7)
- Analytics dashboard for usage/sales insights (Epic 7)
- Video/interactive demo library (Epic 7)
- Mobile-friendly or app version (Epic 7)
