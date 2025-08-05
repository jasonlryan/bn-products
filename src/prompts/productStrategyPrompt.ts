export const PRODUCT_STRATEGY_COMPILATION_PROMPT = `# Product Strategy Compilation Prompt

## Objective

Transform the 4 separate Product Strategy inputs into a unified **strategic product roadmap and business strategy** that matches the exact template structure for display in the dashboard.

## Input Sources

You will receive 4 inputs containing:

1. **Product Manifesto** - Problem statement, solution overview, and magic moment definition
2. **User Stories** - Detailed user requirements, personas, and usage scenarios
3. **Business Model** - Product type, pricing strategy, revenue model, and value proposition
4. **Functional Specification** - Technical requirements, features, and implementation details

## CRITICAL: Output Format

You MUST respond with a valid JSON object that exactly matches this structure:

{
  "executiveStrategySummary": {
    "productVision": "Clear product vision statement",
    "productMission": "Product mission and purpose",
    "strategicObjectives": ["Objective 1", "Objective 2", "Objective 3"],
    "marketPositioning": "Market positioning statement",
    "successMetrics": ["KPI 1", "KPI 2", "KPI 3"]
  },
  "productDefinitionPositioning": {
    "problemSolutionFit": "Problem-solution fit analysis",
    "uniqueValueProposition": "Unique value proposition framework",
    "magicMomentArticulation": "Magic moment description",
    "competitiveDifferentiation": ["Differentiator 1", "Differentiator 2"]
  },
  "userExperienceStrategy": {
    "userPersonas": [
      {
        "name": "Persona name",
        "description": "Persona description",
        "needs": ["Need 1", "Need 2"],
        "goals": ["Goal 1", "Goal 2"]
      }
    ],
    "userJourneyMapping": "User journey description",
    "experiencePrioritization": "Experience prioritization framework",
    "featureUserAlignment": "Feature-user alignment analysis"
  },
  "businessModelFramework": {
    "revenueStrategy": "Revenue strategy and pricing rationale",
    "marketEntryScaling": "Market entry and scaling approach",
    "businessCase": "Business case and financial projections",
    "riskAssessment": ["Risk 1", "Risk 2"]
  },
  "productDevelopmentRoadmap": {
    "featurePrioritization": "Feature prioritization framework",
    "developmentPhases": [
      {
        "phase": "Phase name",
        "timeline": "Timeline",
        "milestones": ["Milestone 1", "Milestone 2"],
        "dependencies": ["Dependency 1", "Dependency 2"]
      }
    ],
    "technicalArchitecture": "Technical architecture strategy",
    "implementationTimeline": "Implementation timeline overview"
  },
  "goToMarketStrategy": {
    "launchStrategy": "Launch strategy and rollout phases",
    "distributionChannels": ["Channel 1", "Channel 2"],
    "marketingPositioning": "Marketing and positioning approach",
    "successMeasurement": ["Metric 1", "Metric 2"]
  },
  "strategicImplementationGuide": {
    "resourceRequirements": ["Resource 1", "Resource 2"],
    "teamStructure": "Team structure and responsibilities",
    "keyDecisionPoints": ["Decision point 1", "Decision point 2"],
    "continuousImprovement": "Continuous improvement methodology"
  }
}

## Content Guidelines

### Executive Strategy Summary
- **Product Vision**: Clear, inspiring vision statement
- **Product Mission**: Purpose and mission statement
- **Strategic Objectives**: 3-5 key strategic objectives
- **Market Positioning**: Competitive positioning statement
- **Success Metrics**: Measurable KPIs and success criteria

### Product Definition & Positioning
- **Problem-Solution Fit**: Analysis of problem-solution alignment
- **Unique Value Proposition**: What makes this product unique
- **Magic Moment**: Key moment of value realization
- **Competitive Differentiation**: Key differentiators vs competitors

### User Experience Strategy
- **User Personas**: Key user types and their characteristics
- **User Journey**: End-to-end user experience flow
- **Experience Prioritization**: Framework for prioritizing UX improvements
- **Feature-User Alignment**: How features align with user needs

### Business Model Framework
- **Revenue Strategy**: How the product will generate revenue
- **Market Entry & Scaling**: Approach to market entry and growth
- **Business Case**: Financial projections and business rationale
- **Risk Assessment**: Key risks and mitigation strategies

### Product Development Roadmap
- **Feature Prioritization**: Framework for prioritizing features
- **Development Phases**: Phased approach to product development
- **Technical Architecture**: Technical strategy and architecture
- **Implementation Timeline**: Timeline for development and delivery

### Go-to-Market Strategy
- **Launch Strategy**: Product launch and rollout approach
- **Distribution Channels**: How the product will reach customers
- **Marketing & Positioning**: Marketing strategy and positioning
- **Success Measurement**: Metrics to track go-to-market success

### Strategic Implementation Guide
- **Resource Requirements**: Resources needed for execution
- **Team Structure**: Organizational structure and responsibilities
- **Key Decision Points**: Critical decisions and approval gates
- **Continuous Improvement**: Framework for ongoing optimization

## Quality Requirements

- Strategic, executive-level language for business planning
- Clear, actionable guidance for product development
- Evidence-based recommendations with supporting rationale
- Comprehensive coverage of all strategic elements
- Forward-looking perspective on product evolution

Respond ONLY with the JSON object. No additional text, explanations, or formatting.`; 