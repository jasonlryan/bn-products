export const MARKET_INTELLIGENCE_COMPILATION_PROMPT = `# Market Intelligence Compilation Prompt

## Objective

Transform the 4 separate Market Intelligence inputs into a unified **strategic market intelligence resource** that matches the exact template structure for display in the dashboard.

## Input Sources

You will receive 4 inputs containing:

1. **Market Opportunity** - Market size, growth trends, and opportunity analysis
2. **Competitive Analysis** - Competitor landscape, positioning, and SWOT analysis  
3. **Target Market Analysis** - Customer segments, buyer behavior, and market dynamics
4. **Industry Trends** - Emerging trends, disruptions, and future market direction

## CRITICAL: Output Format

You MUST respond with a valid JSON object that exactly matches this structure:

{
  "marketOverview": {
    "marketDefinition": "Clear scope and boundaries of the market",
    "marketSize": "TAM, SAM, SOM with historical and projected growth", 
    "keyDrivers": "Primary factors driving market expansion",
    "successFactors": "What it takes to win in this market"
  },
  "competitiveLandscape": {
    "marketMap": "Visual representation of competitive positioning",
    "keyPlayers": [
      {
        "name": "Competitor name",
        "tier": "Leader|Challenger|Niche|Emerging", 
        "positioning": "Market positioning description",
        "marketShare": "Market share information"
      }
    ],
    "competitiveGaps": ["Unmet need 1", "Unmet need 2"],
    "threatAssessment": "New entrants, substitutes, and market disruptions"
  },
  "customerIntelligence": {
    "buyerPersonas": [
      {
        "role": "Decision maker role",
        "profile": "Detailed profile description",
        "painPoints": ["Pain 1", "Pain 2"],
        "buyingCriteria": ["Criteria 1", "Criteria 2"]
      }
    ],
    "customerJourney": "Awareness to purchase decision process",
    "budgetProcurement": "Typical investment levels and approval processes"
  },
  "marketSegmentation": {
    "segments": [
      {
        "name": "Segment name",
        "description": "Segment description", 
        "size": "Market size",
        "growth": "Growth rate",
        "attractiveness": "Attractiveness score/description"
      }
    ],
    "segmentNeeds": "Customer needs by segment",
    "goToMarketStrategy": "Channel preferences and sales approaches",
    "pricingSensitivity": "Price elasticity and value perception"
  },
  "industryTrends": {
    "technologyTrends": ["Technology trend 1", "Technology trend 2"],
    "regulatoryEnvironment": "Current and proposed regulations", 
    "economicFactors": "Macroeconomic influences on market demand",
    "socialCulturalShifts": "Changing customer behaviors and expectations",
    "disruptionRisks": ["Disruption risk 1", "Disruption risk 2"]
  },
  "opportunityAnalysis": {
    "marketGaps": ["Market gap 1", "Market gap 2"],
    "emergingOpportunities": ["Opportunity 1", "Opportunity 2"],
    "partnershipOpportunities": ["Partnership 1", "Partnership 2"],
    "geographicExpansion": "Regional market opportunities",
    "productServiceExtensions": "Adjacent markets and offerings"
  },
  "strategicRecommendations": {
    "marketEntryStrategy": "How to enter or expand in key segments",
    "positioningStrategy": "Optimal competitive positioning",
    "investmentPriorities": ["Priority 1", "Priority 2"],
    "riskMitigation": ["Risk mitigation strategy 1", "Risk mitigation strategy 2"],
    "successMetrics": ["KPI 1", "KPI 2"]
  },
  "intelligenceSources": {
    "dataSources": ["Data source 1", "Data source 2"],
    "updateSchedule": "How often intelligence should be refreshed",
    "keyIndicators": ["Indicator 1", "Indicator 2"], 
    "intelligenceGaps": ["Gap 1", "Gap 2"]
  }
}

## Content Guidelines

### Market Overview
- **Market Definition**: Clear scope and boundaries of the addressable market
- **Market Size**: Quantitative analysis with TAM, SAM, SOM projections
- **Key Drivers**: Primary factors driving market growth and evolution
- **Success Factors**: Critical capabilities needed to succeed in this market

### Competitive Landscape
- **Market Map**: Strategic positioning of key players
- **Key Players**: Direct and indirect competitors with market positioning
- **Competitive Gaps**: Underserved areas and market opportunities
- **Threat Assessment**: Emerging threats and competitive dynamics

### Customer Intelligence
- **Buyer Personas**: Detailed profiles of decision makers and influencers
- **Customer Journey**: End-to-end buying process and touchpoints
- **Budget & Procurement**: Investment patterns and approval processes

### Market Segmentation
- **Segments**: Geographic, demographic, psychographic, behavioral analysis
- **Segment Attractiveness**: Size, growth, competition, accessibility metrics
- **Go-to-Market Strategy**: Channel preferences and sales approaches

### Industry Trends
- **Technology Trends**: Emerging technologies impacting the market
- **Regulatory Environment**: Current and proposed regulatory changes
- **Economic Factors**: Macroeconomic influences on demand
- **Social/Cultural Shifts**: Changing behaviors and expectations
- **Disruption Risks**: Potential threats to market structure

### Opportunity Analysis
- **Market Gaps**: Underserved segments and unmet needs
- **Emerging Opportunities**: New segments or use cases
- **Partnership Opportunities**: Strategic alliances and partnerships
- **Geographic Expansion**: Regional growth opportunities
- **Product/Service Extensions**: Adjacent market opportunities

### Strategic Recommendations
- **Market Entry Strategy**: How to enter or expand market presence
- **Positioning Strategy**: Optimal competitive positioning approach
- **Investment Priorities**: Resource allocation recommendations
- **Risk Mitigation**: Key risks and mitigation strategies
- **Success Metrics**: KPIs to track market performance

### Intelligence Sources
- **Data Sources**: Research methodologies and information sources
- **Update Schedule**: Intelligence refresh frequency
- **Key Indicators**: Metrics to monitor for market changes
- **Intelligence Gaps**: Areas requiring additional research

## Quality Requirements

- Strategic, analytical language for executive decision-making
- Data-driven insights with supporting evidence
- Forward-looking perspective on market evolution
- Actionable recommendations for business planning
- Executive-ready presentation and analysis

Respond ONLY with the JSON object. No additional text, explanations, or formatting.`; 