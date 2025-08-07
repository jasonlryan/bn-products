/**
 * Market Intelligence Compilation Service
 * 
 * Takes the 4 Market Intelligence inputs and compiles them into a unified
 * strategic market intelligence resource using AI.
 */

import type { Product } from '../types/product';
import { MARKET_INTELLIGENCE_COMPILATION_PROMPT } from '../prompts/marketIntelligencePrompt';
import { aiService } from './aiService';
import { getStorageService } from './storage/storageService';

export interface MarketIntelligenceInputs {
  marketOpportunity: string;
  competitiveAnalysis: string;
  targetMarketAnalysis: string;
  industryTrends: string;
}

export interface CompiledMarketIntelligencePage {
  id: string;
  productId: string;
  compiledAt: Date;
  content: {
    marketOverview: {
      marketDefinition: string;
      marketSize: string;
      keyDrivers: string;
      successFactors: string;
    };
    competitiveLandscape: {
      marketMap: string;
      keyPlayers: Array<{
        name: string;
        tier: 'Leader' | 'Challenger' | 'Niche' | 'Emerging';
        positioning: string;
        marketShare: string;
      }>;
      competitiveGaps: string[];
      threatAssessment: string;
    };
    customerIntelligence: {
      buyerPersonas: Array<{
        role: string;
        profile: string;
        painPoints: string[];
        buyingCriteria: string[];
      }>;
      customerJourney: string;
      budgetProcurement: string;
    };
    marketSegmentation: {
      segments: Array<{
        name: string;
        description: string;
        size: string;
        growth: string;
        attractiveness: string;
      }>;
      segmentNeeds: string;
      goToMarketStrategy: string;
      pricingSensitivity: string;
    };
    industryTrends: {
      technologyTrends: string[];
      regulatoryEnvironment: string;
      economicFactors: string;
      socialCulturalShifts: string;
      disruptionRisks: string[];
    };
    opportunityAnalysis: {
      marketGaps: string[];
      emergingOpportunities: string[];
      partnershipOpportunities: string[];
      geographicExpansion: string;
      productServiceExtensions: string;
    };
    strategicRecommendations: {
      marketEntryStrategy: string;
      positioningStrategy: string;
      investmentPriorities: string[];
      riskMitigation: string[];
      successMetrics: string[];
    };
    intelligenceSources: {
      dataSources: string[];
      updateSchedule: string;
      keyIndicators: string[];
      intelligenceGaps: string[];
    };
  };
  rawMarkdown: string;
}

class MarketIntelligenceCompilerService {
  private storage = getStorageService();

  /**
   * Utility function to extract JSON from markdown-formatted responses
   */
  private extractJsonFromResponse(response: string): string {
    // Remove markdown code blocks if present
    let cleanedResponse = response.trim();
    
    // Remove ```json and ``` markers
    cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
    
    // Remove any leading/trailing whitespace
    cleanedResponse = cleanedResponse.trim();
    
    return cleanedResponse;
  }

  /**
   * Extract market intelligence inputs from product data
   */
  private extractMarketIntelligenceInputs(product: Product): MarketIntelligenceInputs {
    const inputs: MarketIntelligenceInputs = {
      marketOpportunity: '',
      competitiveAnalysis: '',
      targetMarketAnalysis: '',
      industryTrends: ''
    };

    // Extract Market Opportunity (from market sizing)
    if (product.richContent?.marketSizing?.sections?.['Generated Output']) {
      inputs.marketOpportunity = product.richContent.marketSizing.sections['Generated Output'];
    } else if (product.richContent?.marketSizing?.fullContent) {
      inputs.marketOpportunity = product.richContent.marketSizing.fullContent;
    }

    // Extract Competitive Analysis
    if (product.richContent?.competitorAnalysis?.sections?.['Generated Output']) {
      inputs.competitiveAnalysis = product.richContent.competitorAnalysis.sections['Generated Output'];
    } else if (product.richContent?.competitorAnalysis?.fullContent) {
      inputs.competitiveAnalysis = product.richContent.competitorAnalysis.fullContent;
    }

    // Extract Target Market Analysis (from audience ICPs)
    if (product.richContent?.audienceICPs?.sections?.['Generated Output']) {
      inputs.targetMarketAnalysis = product.richContent.audienceICPs.sections['Generated Output'];
    } else if (product.richContent?.audienceICPs?.fullContent) {
      inputs.targetMarketAnalysis = product.richContent.audienceICPs.fullContent;
    }

    // Industry Trends - for now use product description or other available data
    inputs.industryTrends = `Industry trends for ${product.name} - AI adoption, digital transformation, market evolution in ${product.type} sector`;

    return inputs;
  }

  /**
   * Generate market intelligence content using AI compilation with the external prompt
   */
  private async generateMarketIntelligenceContent(
    product: Product, 
    inputs: MarketIntelligenceInputs
  ): Promise<CompiledMarketIntelligencePage['content']> {
    // Prepare input data for AI compilation
    const inputData = `
# PRODUCT INFORMATION
Name: ${product.name}
Type: ${product.type}
Description: ${product.content?.description || 'No description available'}

# MARKET INTELLIGENCE INPUTS TO COMPILE

## Market Opportunity
${inputs.marketOpportunity || 'No market opportunity data available'}

## Competitive Analysis  
${inputs.competitiveAnalysis || 'No competitive analysis available'}

## Target Market Analysis
${inputs.targetMarketAnalysis || 'No target market analysis available'}

## Industry Trends
${inputs.industryTrends || 'No industry trends data available'}
`;

    let aiResponse: string;
    try {
      // Use the actual AI service with the external prompt
      aiResponse = await aiService.generateCompiledContent(
        MARKET_INTELLIGENCE_COMPILATION_PROMPT,
        inputData
      );
      
      // Extract JSON from potential markdown formatting
      const cleanedResponse = this.extractJsonFromResponse(aiResponse);
      
      // Debug logging
      console.log('Raw AI response:', aiResponse.substring(0, 200) + '...');
      console.log('Cleaned response:', cleanedResponse.substring(0, 200) + '...');
      
      // Parse the JSON response
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validate the structure matches our interface
      if (!parsedContent.marketOverview || !parsedContent.competitiveLandscape) {
        throw new Error('AI response does not match expected structure');
      }
      
      return parsedContent as CompiledMarketIntelligencePage['content'];
    } catch (error) {
      console.error('AI compilation failed:', error);
      
      // Provide more specific error information
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('JSON parsing failed. Raw response preview:', aiResponse ? aiResponse.substring(0, 500) : 'No response available');
        throw new Error(`Market Intelligence compilation failed: Invalid JSON response from AI. Please try again.`);
      }
      
      throw new Error(`Market Intelligence compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate market intelligence markdown from compiled content
   */
  private generateMarketIntelligenceMarkdown(content: CompiledMarketIntelligencePage['content'], product: Product): string {
    return `# Market Intelligence: ${product.name}

## Market Overview

### Market Definition
${content.marketOverview.marketDefinition}

### Market Size
${content.marketOverview.marketSize}

### Key Drivers
${content.marketOverview.keyDrivers}

### Success Factors
${content.marketOverview.successFactors}

## Competitive Landscape

### Market Map
${content.competitiveLandscape.marketMap}

### Key Players
${content.competitiveLandscape.keyPlayers.map(player => `
**${player.name}** (${player.tier})
- Market Share: ${player.marketShare}
- Positioning: ${player.positioning}
`).join('\n')}

### Competitive Gaps
${content.competitiveLandscape.competitiveGaps.map(gap => `- ${gap}`).join('\n')}

### Threat Assessment
${content.competitiveLandscape.threatAssessment}

## Customer Intelligence

### Buyer Personas
${content.customerIntelligence.buyerPersonas.map(persona => `
**${persona.role}**
- Profile: ${persona.profile}
- Pain Points: ${persona.painPoints.join(', ')}
- Buying Criteria: ${persona.buyingCriteria.join(', ')}
`).join('\n')}

### Customer Journey
${content.customerIntelligence.customerJourney}

### Budget & Procurement
${content.customerIntelligence.budgetProcurement}

## Market Segmentation

### Segments
${content.marketSegmentation.segments.map(segment => `
**${segment.name}**
- Description: ${segment.description}
- Size: ${segment.size}
- Growth: ${segment.growth}
- Attractiveness: ${segment.attractiveness}
`).join('\n')}

### Segment Needs
${content.marketSegmentation.segmentNeeds}

### Go-to-Market Strategy
${content.marketSegmentation.goToMarketStrategy}

### Pricing Sensitivity
${content.marketSegmentation.pricingSensitivity}

## Industry Trends

### Technology Trends
${content.industryTrends.technologyTrends.map(trend => `- ${trend}`).join('\n')}

### Regulatory Environment
${content.industryTrends.regulatoryEnvironment}

### Economic Factors
${content.industryTrends.economicFactors}

### Social/Cultural Shifts
${content.industryTrends.socialCulturalShifts}

### Disruption Risks
${content.industryTrends.disruptionRisks.map(risk => `- ${risk}`).join('\n')}

## Opportunity Analysis

### Market Gaps
${content.opportunityAnalysis.marketGaps.map(gap => `- ${gap}`).join('\n')}

### Emerging Opportunities
${content.opportunityAnalysis.emergingOpportunities.map(opp => `- ${opp}`).join('\n')}

### Partnership Opportunities
${content.opportunityAnalysis.partnershipOpportunities.map(partner => `- ${partner}`).join('\n')}

### Geographic Expansion
${content.opportunityAnalysis.geographicExpansion}

### Product/Service Extensions
${content.opportunityAnalysis.productServiceExtensions}

## Strategic Recommendations

### Market Entry Strategy
${content.strategicRecommendations.marketEntryStrategy}

### Positioning Strategy
${content.strategicRecommendations.positioningStrategy}

### Investment Priorities
${content.strategicRecommendations.investmentPriorities.map(priority => `- ${priority}`).join('\n')}

### Risk Mitigation
${content.strategicRecommendations.riskMitigation.map(risk => `- ${risk}`).join('\n')}

### Success Metrics
${content.strategicRecommendations.successMetrics.map(metric => `- ${metric}`).join('\n')}

## Intelligence Sources

### Data Sources
${content.intelligenceSources.dataSources.map(source => `- ${source}`).join('\n')}

### Update Schedule
${content.intelligenceSources.updateSchedule}

### Key Indicators
${content.intelligenceSources.keyIndicators.map(indicator => `- ${indicator}`).join('\n')}

### Intelligence Gaps
${content.intelligenceSources.intelligenceGaps.map(gap => `- ${gap}`).join('\n')}
`;
  }

  /**
   * Compile market intelligence page from product data using AI
   */
  async compileMarketIntelligencePage(product: Product): Promise<CompiledMarketIntelligencePage> {
    const inputs = this.extractMarketIntelligenceInputs(product);
    const content = await this.generateMarketIntelligenceContent(product, inputs);
    const rawMarkdown = this.generateMarketIntelligenceMarkdown(content, product);

    const compiledPage: CompiledMarketIntelligencePage = {
      id: `market-intelligence-${product.id}-${Date.now()}`,
      productId: product.id,
      compiledAt: new Date(),
      content,
      rawMarkdown
    };

    // Save to storage
    await this.saveCompiledPage(compiledPage);
    
    // Increment compilation count
    await this.incrementCompilationCount(product.id);

    return compiledPage;
  }

  /**
   * Save compiled page to localStorage
   */
  async saveCompiledPage(compiledPage: CompiledMarketIntelligencePage): Promise<void> {
    const key = `bn:compiled:market-intel:${compiledPage.productId}`;
    await this.storage.set(key, compiledPage);
  }

  /**
   * Get compilation count for a product
   */
  async getCompilationCount(productId: string): Promise<number> {
    const key = `bn:count:market-intel:${productId}`;
    const count = await this.storage.get<number>(key);
    return count || 0;
  }

  /**
   * Increment compilation count
   */
  private async incrementCompilationCount(productId: string): Promise<void> {
    const key = `bn:count:market-intel:${productId}`;
    await this.storage.increment(key);
  }

  /**
   * Reset compilation count
   */
  async resetCompilationCount(productId: string): Promise<void> {
    const key = `bn:count:market-intel:${productId}`;
    await this.storage.delete(key);
    
    // Also remove compiled page
    const pageKey = `bn:compiled:market-intel:${productId}`;
    await this.storage.delete(pageKey);
  }

  /**
   * Get all compilation counts
   */
  async getAllCompilationCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const keys = await this.storage.keys('bn:count:market-intel:*');
    
    for (const key of keys) {
      const productId = key.replace('bn:count:market-intel:', '');
      counts[productId] = await this.getCompilationCount(productId);
    }
    
    return counts;
  }

  /**
   * Load compiled page from localStorage
   */
  async loadCompiledPage(productId: string): Promise<CompiledMarketIntelligencePage | null> {
    const key = `bn:compiled:market-intel:${productId}`;
    const data = await this.storage.get<CompiledMarketIntelligencePage>(key);
    
    if (!data) {
      return null;
    }
    
    try {
      // Convert date strings back to Date objects if needed
      if (typeof data.compiledAt === 'string') {
        data.compiledAt = new Date(data.compiledAt);
      }
      return data;
    } catch (error) {
      console.error('Failed to parse compiled market intelligence page:', error);
      return null;
    }
  }

  /**
   * Check if product has compiled page
   */
  async hasCompiledPage(productId: string): Promise<boolean> {
    const key = `bn:compiled:market-intel:${productId}`;
    return await this.storage.exists(key);
  }
}

// Export singleton instance
export const marketIntelligenceCompiler = new MarketIntelligenceCompilerService(); 