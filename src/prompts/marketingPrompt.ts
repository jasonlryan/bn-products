export const MARKETING_COMPILATION_PROMPT = `# Marketing & Sales Enablement Page Compilation Prompt

## Objective

Transform the 4 separate Marketing & Sales inputs into a unified **sales and marketing enablement resource** that matches the exact template structure for display in the dashboard.

## Input Sources

You will receive 4 inputs containing:

1. **Key Messages** - Core value propositions and messaging frameworks
2. **Demo Script** - 3-minute presentation flow with hook, demo, wow moment, CTA
3. **Slide Headlines** - 5 slide titles for demo deck (Problem, Solution, Market, Demo, Ask)
4. **Q&A Prep** - Anticipated questions and prepared responses for objection handling

## CRITICAL: Output Format

You MUST respond with a valid JSON object that exactly matches this structure:

{
  "executiveSummary": {
    "productOverview": "2-3 sentence product/service description",
    "targetMarket": "Primary audience and use cases", 
    "uniqueValueProp": "What sets this apart from competitors",
    "keyMetrics": "Market size, competition, positioning data"
  },
  "messagingFramework": {
    "primaryValueProps": [
      {
        "title": "Value prop title",
        "description": "Detailed description of the value proposition",
        "evidence": "Supporting data, case studies, or proof points"
      }
    ],
    "elevatorPitches": {
      "thirtySecond": "30-second elevator pitch",
      "sixtySecond": "60-second elevator pitch", 
      "twoMinute": "2-minute elevator pitch"
    },
    "keyDifferentiators": [
      "Differentiator 1",
      "Differentiator 2", 
      "Differentiator 3"
    ],
    "proofPoints": [
      "Proof point 1",
      "Proof point 2",
      "Proof point 3"
    ]
  },
  "salesProcessGuide": {
    "discoveryQuestions": [
      "Discovery question 1",
      "Discovery question 2"
    ],
    "demoFlow": [
      {
        "step": 1,
        "title": "Step title",
        "description": "Step description",
        "talkingPoints": ["Point 1", "Point 2"]
      }
    ],
    "wowMoments": [
      "Wow moment 1",
      "Wow moment 2"
    ],
    "commonUseCases": [
      {
        "scenario": "Use case scenario",
        "application": "How it applies",
        "outcome": "Expected outcome"
      }
    ]
  },
  "objectionHandling": {
    "commonObjections": [
      {
        "objection": "Common objection",
        "category": "price|timing|competition|functionality|other",
        "response": "Prepared response",
        "evidence": "Supporting evidence"
      }
    ],
    "competitiveBattlecards": [
      {
        "competitor": "Competitor name",
        "positioning": "How to position against them",
        "advantages": ["Advantage 1", "Advantage 2"]
      }
    ],
    "pricingJustification": {
      "roiTalkingPoints": ["ROI point 1", "ROI point 2"],
      "valueDemo": "Value demonstration approach"
    }
  },
  "marketingAssets": {
    "presentationMaterials": ["Asset 1", "Asset 2"],
    "collateralLibrary": ["Collateral 1", "Collateral 2"],
    "digitalAssets": ["Digital asset 1", "Digital asset 2"],
    "demoScripts": ["Demo script 1", "Demo script 2"]
  },
  "targetAudienceIntel": {
    "buyerPersonas": [
      {
        "role": "Persona role",
        "painPoints": ["Pain 1", "Pain 2"],
        "motivations": ["Motivation 1", "Motivation 2"]
      }
    ],
    "buyingProcess": "Description of typical buying process",
    "budgetConsiderations": "Budget and procurement insights"
  },
  "implementationGuide": {
    "qualificationCriteria": ["Criteria 1", "Criteria 2"],
    "proposalGuidelines": ["Guideline 1", "Guideline 2"],
    "followUpProcess": ["Step 1", "Step 2"],
    "successMetrics": ["Metric 1", "Metric 2"]
  }
}

## Content Guidelines

### Executive Summary
- **Product Overview**: Clear, concise description focusing on what the product/service does
- **Target Market**: Specific audience segments and primary use cases
- **Unique Value Prop**: What makes this solution different and better
- **Key Metrics**: Relevant market data, competitive position, or traction metrics

### Messaging Framework
- **Primary Value Props**: 3-4 core value propositions with evidence
- **Elevator Pitches**: Progressive depth - 30s hook, 60s overview, 2min detailed
- **Key Differentiators**: Unique advantages vs competitors
- **Proof Points**: Concrete evidence supporting claims

### Sales Process Guide
- **Discovery Questions**: Qualifying questions to identify good prospects
- **Demo Flow**: Step-by-step demonstration sequence
- **Wow Moments**: Key features/benefits that create excitement
- **Common Use Cases**: Real-world scenarios and applications

### Objection Handling
- **Common Objections**: Anticipated pushback with categorization
- **Competitive Battlecards**: Positioning against specific competitors
- **Pricing Justification**: ROI arguments and value demonstration

### Marketing Assets
- List relevant collateral, presentations, and digital assets

### Target Audience Intelligence
- **Buyer Personas**: Key stakeholders in the buying process
- **Buying Process**: Typical sales cycle and decision flow
- **Budget Considerations**: Investment levels and approval processes

### Implementation Guide
- Practical guidance for sales execution and follow-up

## Quality Requirements

- Professional, action-oriented language for internal teams
- Specific, actionable guidance rather than generic statements
- Evidence-based claims with supporting data
- Clear competitive positioning
- Internal team focus (not customer-facing copy)

Respond ONLY with the JSON object. No additional text, explanations, or formatting.`; 