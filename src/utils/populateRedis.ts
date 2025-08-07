import { getStorageService, getProductService } from '../services/storage'
import type { ProductDefinition } from '../services/storage/types'

const storage = getStorageService()
const productService = getProductService()

// Sample product data
const sampleProducts: Array<Omit<ProductDefinition, 'id' | 'metadata'>> = [
  {
    name: "AI Power Hour",
    type: "PRODUCT",
    pricing: {
      type: "fixed",
      display: "£2,500",
      value: 2500
    },
    content: {
      description: "Fast-track your AI adoption with expert-led intensive workshop designed for busy executives and teams who need practical AI implementation strategies.",
      perfectFor: "Senior leadership teams and decision-makers who want to understand AI's business impact and create actionable implementation plans.",
      keyBenefits: [
        "Rapid AI literacy for leadership teams",
        "Clear implementation roadmap",
        "Immediate practical applications"
      ],
      outcomes: [
        "AI strategy clarity in 60 minutes",
        "Practical implementation plan",
        "Team alignment on AI priorities"
      ]
    },
    features: [
      "60-minute intensive workshop",
      "Executive-focused content",
      "Practical implementation framework",
      "Follow-up action plan",
      "Industry-specific examples"
    ],
    benefits: [
      "Fast AI adoption",
      "Strategic clarity", 
      "Team alignment",
      "Practical outcomes",
      "Expert guidance"
    ],
    marketing: {
      headline: "AI Power Hour: Executive AI Strategy in 60 Minutes",
      tagline: "From AI confusion to clarity in one focused hour",
      positioning: "The fastest way for executives to develop practical AI strategy"
    }
  },
  {
    name: "AI Innovation Workshop",
    type: "PRODUCT",
    pricing: {
      type: "fixed",
      display: "£5,000",
      value: 5000
    },
    content: {
      description: "Comprehensive AI innovation workshop that transforms teams from AI-curious to AI-capable through hands-on learning and practical implementation.",
      perfectFor: "Innovation teams, product managers, and technical leaders who need to integrate AI into their products and processes.",
      keyBenefits: [
        "Hands-on AI implementation experience",
        "Team capability building",
        "Real-world project outcomes"
      ],
      outcomes: [
        "AI-capable team",
        "Working AI prototype",
        "Implementation roadmap"
      ]
    },
    features: [
      "Full-day workshop format",
      "Hands-on AI building",
      "Team-based learning",
      "Real project focus",
      "Expert mentorship"
    ],
    benefits: [
      "Practical AI skills",
      "Team transformation",
      "Tangible outcomes",
      "Ongoing support",
      "Innovation acceleration"
    ],
    marketing: {
      headline: "AI Innovation Workshop: Build AI Solutions in One Day",
      tagline: "Transform your team from AI-curious to AI-capable",
      positioning: "The most practical way to build AI capabilities in your team"
    }
  },
  {
    name: "Strategic AI Consulting",
    type: "SERVICE",
    pricing: {
      type: "custom",
      display: "Custom pricing"
    },
    content: {
      description: "Comprehensive AI strategy consulting for organizations ready to make AI a core competitive advantage through systematic transformation.",
      perfectFor: "Large organizations and enterprises that need comprehensive AI transformation strategy and implementation support.",
      keyBenefits: [
        "Enterprise-scale AI strategy",
        "Systematic transformation approach",
        "Long-term competitive advantage"
      ],
      outcomes: [
        "Complete AI transformation",
        "Competitive AI advantage",
        "Scalable AI operations"
      ]
    },
    features: [
      "Multi-month engagement",
      "C-suite advisory",
      "Enterprise architecture",
      "Change management",
      "ROI optimization"
    ],
    benefits: [
      "Strategic transformation",
      "Enterprise expertise",
      "Sustained impact",
      "Competitive advantage",
      "Scalable solutions"
    ],
    marketing: {
      headline: "Strategic AI Consulting: Enterprise AI Transformation",
      tagline: "Turn AI from buzzword to business advantage",
      positioning: "Enterprise AI transformation for sustainable competitive advantage"
    }
  }
]

export async function populateRedisWithSampleData(): Promise<{
  success: boolean
  results: {
    products: number
    contentFiles: number
    settings: number
    productIds: string[]
  }
  errors: string[]
}> {
  const results = {
    products: 0,
    contentFiles: 0,
    settings: 0,
    productIds: [] as string[]
  }
  const errors: string[] = []

  try {
    console.log('🚀 Starting Redis population...')

    // Create products
    for (const productData of sampleProducts) {
      try {
        const productId = await productService.createProduct(productData)
        results.products++
        results.productIds.push(productId)
        console.log(`✅ Created product: ${productData.name} (ID: ${productId})`)
      } catch (error) {
        const errorMsg = `Failed to create product ${productData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // Add sample content for the first product
    if (results.productIds.length > 0) {
      const firstProductId = results.productIds[0]
      
      try {
        // Add manifesto
        await productService.setContent(firstProductId, 'manifesto', {
          title: 'AI Power Hour • Product Manifesto',
          metadata: {
            productId: firstProductId,
            contentType: 'manifesto',
            lastGenerated: new Date().toISOString(),
            promptVersion: '1.0'
          },
          sections: {
            'Original Prompt': 'Create a product manifesto for AI Power Hour',
            'Product Context': 'Executive AI workshop for rapid strategy development',
            'Generated Output': `# AI Power Hour Manifesto

## Our Belief
We believe that AI transformation shouldn't be overwhelming, time-consuming, or theoretical. Leaders need practical, actionable AI strategies that can be implemented immediately.

## Our Mission
To transform executive teams from AI-confused to AI-confident in exactly 60 minutes, providing clear direction and practical next steps.

## Our Promise
Every participant leaves with:
- Crystal-clear understanding of AI's business impact
- Specific implementation roadmap for their organization
- Confidence to lead AI initiatives
- Practical tools for immediate action

## Our Approach
- Executive-focused, no technical jargon
- Practical over theoretical
- Industry-specific examples
- Immediate actionability
- Expert guidance throughout`,
            'Context Used': 'Product definition, target audience, business model'
          },
          fullContent: 'Complete manifesto content with detailed vision and approach...',
          lastModified: new Date().toISOString(),
          version: '1.0.0'
        })
        results.contentFiles++

        // Add user stories
        await productService.setContent(firstProductId, 'user-stories', {
          title: 'AI Power Hour • User Stories',
          metadata: {
            productId: firstProductId,
            contentType: 'user-stories',
            lastGenerated: new Date().toISOString(),
            promptVersion: '1.0'
          },
          sections: {
            'Original Prompt': 'Create user stories for AI Power Hour workshop',
            'Product Context': 'Executive workshop targeting senior leadership',
            'Generated Output': `# User Stories for AI Power Hour

## Executive Participant
**As a** busy CEO/CTO/VP
**I want to** quickly understand AI's business impact and get a clear implementation plan
**So that** I can make informed decisions about AI investments and lead my team confidently

**Acceptance Criteria:**
- Complete workshop in exactly 60 minutes
- Receive industry-specific AI use cases
- Get actionable implementation roadmap
- Understand ROI and resource requirements

## Innovation Manager
**As an** innovation manager or product leader
**I want to** identify specific AI opportunities for my products/processes
**So that** I can create competitive advantages and drive business growth

**Acceptance Criteria:**
- Identify 3-5 specific AI opportunities
- Understand implementation complexity
- Get technical guidance and next steps
- Connect with expert resources`,
            'Context Used': 'Target personas, workshop format, business objectives'
          },
          fullContent: 'Complete user stories with detailed acceptance criteria...',
          lastModified: new Date().toISOString(),
          version: '1.0.0'
        })
        results.contentFiles++

        console.log(`✅ Added sample content for product ${firstProductId}`)
      } catch (error) {
        const errorMsg = `Failed to add content: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // Set up application settings
    try {
      await storage.set('bn:settings:admin', {
        theme: 'light',
        language: 'en',
        features: {
          autoSave: true,
          notifications: true,
          analytics: false
        },
        lastUpdated: new Date().toISOString()
      })

      await storage.set('bn:settings:edit-mode', false)

      await storage.set('bn:settings:prompts', {
        manifesto: 'Create a compelling product manifesto that articulates the vision, mission, and core beliefs behind this product...',
        'functional-spec': 'Develop a comprehensive functional specification that outlines the core features, user interactions, and technical requirements...',
        'audience-icps': 'Define the ideal customer profiles and target audience segments for this product...',
        'user-stories': 'Create detailed user stories that capture the needs, goals, and workflows of different user personas...',
        lastUpdated: new Date().toISOString()
      })
      results.settings = 3

      console.log('✅ Application settings configured')
    } catch (error) {
      const errorMsg = `Failed to set up settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(errorMsg)
    }

    // Set version info
    try {
      await storage.set('bn:version', {
        version: '2.0.0',
        migrationDate: new Date().toISOString(),
        features: ['redis-storage', 'product-management', 'pipeline-processing', 'compilation-system']
      })
    } catch (error) {
      console.error('Failed to set version info:', error)
    }

    console.log('🎉 Redis population complete!')
    console.log(`📊 Results: ${results.products} products, ${results.contentFiles} content files, ${results.settings} settings`)

    return {
      success: errors.length === 0,
      results,
      errors
    }

  } catch (error) {
    const errorMsg = `Population failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    errors.push(errorMsg)
    console.error(errorMsg)
    
    return {
      success: false,
      results,
      errors
    }
  }
}