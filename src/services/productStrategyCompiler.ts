/**
 * Product Strategy Compilation Service
 * 
 * Takes the 4 Product Strategy inputs (Product Manifesto, User Stories, Business Model, Functional Spec)
 * and compiles them into a unified strategic product roadmap and business strategy document using AI.
 */

import type { Product } from '../types/product';
import { PRODUCT_STRATEGY_COMPILATION_PROMPT } from '../prompts/productStrategyPrompt';
import { aiService } from './aiService';
import { getStorageService } from './storage/storageService';

export interface ProductStrategyInputs {
  productManifesto: string;
  userStories: string;
  businessModel: string;
  functionalSpec: string;
}

export interface CompiledProductStrategyPage {
  id: string;
  productId: string;
  compiledAt: Date;
  content: {
    executiveStrategySummary: {
      productVision: string;
      productMission: string;
      strategicObjectives: string[];
      marketPositioning: string;
      successMetrics: string[];
    };
    productDefinitionPositioning: {
      problemSolutionFit: string;
      uniqueValueProposition: string;
      magicMomentArticulation: string;
      competitiveDifferentiation: string[];
    };
    userExperienceStrategy: {
      userPersonas: Array<{
        name: string;
        description: string;
        needs: string[];
        goals: string[];
      }>;
      userJourneyMapping: string;
      experiencePrioritization: string;
      featureUserAlignment: string;
    };
    businessModelFramework: {
      revenueStrategy: string;
      marketEntryScaling: string;
      businessCase: string;
      riskAssessment: string[];
    };
    productDevelopmentRoadmap: {
      featurePrioritization: string;
      developmentPhases: Array<{
        phase: string;
        timeline: string;
        milestones: string[];
        dependencies: string[];
      }>;
      technicalArchitecture: string;
      implementationTimeline: string;
    };
    goToMarketStrategy: {
      launchStrategy: string;
      distributionChannels: string[];
      marketingPositioning: string;
      successMeasurement: string[];
    };
    strategicImplementationGuide: {
      resourceRequirements: string[];
      teamStructure: string;
      keyDecisionPoints: string[];
      continuousImprovement: string;
    };
  };
  rawMarkdown: string;
}

class ProductStrategyCompilerService {
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
   * Extract product strategy inputs from product data
   */
  private extractProductStrategyInputs(product: Product): ProductStrategyInputs {
    const inputs: ProductStrategyInputs = {
      productManifesto: '',
      userStories: '',
      businessModel: '',
      functionalSpec: ''
    };

    // Extract Product Manifesto
    if (product.richContent?.manifesto?.sections?.['Generated Output']) {
      inputs.productManifesto = product.richContent.manifesto.sections['Generated Output'];
    } else if (product.richContent?.manifesto?.fullContent) {
      inputs.productManifesto = product.richContent.manifesto.fullContent;
    }

    // Extract User Stories
    if (product.richContent?.userStories?.sections?.['Generated Output']) {
      inputs.userStories = product.richContent.userStories.sections['Generated Output'];
    } else if (product.richContent?.userStories?.fullContent) {
      inputs.userStories = product.richContent.userStories.fullContent;
    }

    // Extract Business Model (combine multiple product properties)
    const businessModelParts = [];
    if (product.type) businessModelParts.push(`**Product Type:** ${product.type}`);
    if (product.pricing?.display) businessModelParts.push(`**Pricing:** ${product.pricing.display}`);
    if (product.pricing?.type) businessModelParts.push(`**Revenue Model:** ${product.pricing.type}`);
    if (product.content?.description) businessModelParts.push(`**Value Proposition:** ${product.content.description}`);
    inputs.businessModel = businessModelParts.join('\n\n');

    // Extract Functional Specification
    if (product.richContent?.functionalSpec?.sections?.['Generated Output']) {
      inputs.functionalSpec = product.richContent.functionalSpec.sections['Generated Output'];
    } else if (product.richContent?.functionalSpec?.fullContent) {
      inputs.functionalSpec = product.richContent.functionalSpec.fullContent;
    }

    return inputs;
  }

  /**
   * Generate product strategy content using AI compilation with the external prompt
   */
  private async generateProductStrategyContent(
    product: Product, 
    inputs: ProductStrategyInputs
  ): Promise<CompiledProductStrategyPage['content']> {
    // Prepare input data for AI compilation
    const inputData = `
# PRODUCT INFORMATION
Name: ${product.name}
Type: ${product.type}
Description: ${product.content?.description || 'No description available'}

# PRODUCT STRATEGY INPUTS TO COMPILE

## Product Manifesto
${inputs.productManifesto || 'No product manifesto available'}

## User Stories
${inputs.userStories || 'No user stories available'}

## Business Model
${inputs.businessModel || 'No business model available'}

## Functional Specification
${inputs.functionalSpec || 'No functional specification available'}
`;

    let aiResponse: string;
    try {
      // Use the actual AI service with the external prompt
      aiResponse = await aiService.generateCompiledContent(
        PRODUCT_STRATEGY_COMPILATION_PROMPT,
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
      if (!parsedContent.executiveStrategySummary || !parsedContent.productDefinitionPositioning) {
        throw new Error('AI response does not match expected structure');
      }
      
      return parsedContent as CompiledProductStrategyPage['content'];
    } catch (error) {
      console.error('AI compilation failed:', error);
      
      // Provide more specific error information
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('JSON parsing failed. Raw response preview:', aiResponse ? aiResponse.substring(0, 500) : 'No response available');
        throw new Error(`Product Strategy compilation failed: Invalid JSON response from AI. Please try again.`);
      }
      
      throw new Error(`Product Strategy compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate product strategy markdown from compiled content
   */
  private generateStrategyMarkdown(content: CompiledProductStrategyPage['content'], product: Product): string {
    return `# Product Strategy: ${product.name}

## Executive Strategy Summary

### Product Vision
${content.executiveStrategySummary.productVision}

### Product Mission
${content.executiveStrategySummary.productMission}

### Strategic Objectives
${content.executiveStrategySummary.strategicObjectives.map(obj => `- ${obj}`).join('\n')}

### Market Positioning
${content.executiveStrategySummary.marketPositioning}

### Success Metrics
${content.executiveStrategySummary.successMetrics.map(metric => `- ${metric}`).join('\n')}

## Product Definition & Positioning

### Problem-Solution Fit
${content.productDefinitionPositioning.problemSolutionFit}

### Unique Value Proposition
${content.productDefinitionPositioning.uniqueValueProposition}

### Magic Moment Articulation
${content.productDefinitionPositioning.magicMomentArticulation}

### Competitive Differentiation
${content.productDefinitionPositioning.competitiveDifferentiation.map(diff => `- ${diff}`).join('\n')}

## User Experience Strategy

### User Personas
${content.userExperienceStrategy.userPersonas.map(persona => `
**${persona.name}**
- Description: ${persona.description}
- Needs: ${persona.needs.join(', ')}
- Goals: ${persona.goals.join(', ')}
`).join('\n')}

### User Journey Mapping
${content.userExperienceStrategy.userJourneyMapping}

### Experience Prioritization
${content.userExperienceStrategy.experiencePrioritization}

### Feature-User Alignment
${content.userExperienceStrategy.featureUserAlignment}

## Business Model Framework

### Revenue Strategy
${content.businessModelFramework.revenueStrategy}

### Market Entry & Scaling
${content.businessModelFramework.marketEntryScaling}

### Business Case
${content.businessModelFramework.businessCase}

### Risk Assessment
${content.businessModelFramework.riskAssessment.map(risk => `- ${risk}`).join('\n')}

## Product Development Roadmap

### Feature Prioritization
${content.productDevelopmentRoadmap.featurePrioritization}

### Development Phases
${content.productDevelopmentRoadmap.developmentPhases.map(phase => `
**${phase.phase}**
- Timeline: ${phase.timeline}
- Milestones: ${phase.milestones.join(', ')}
- Dependencies: ${phase.dependencies.join(', ')}
`).join('\n')}

### Technical Architecture
${content.productDevelopmentRoadmap.technicalArchitecture}

### Implementation Timeline
${content.productDevelopmentRoadmap.implementationTimeline}

## Go-to-Market Strategy

### Launch Strategy
${content.goToMarketStrategy.launchStrategy}

### Distribution Channels
${content.goToMarketStrategy.distributionChannels.map(channel => `- ${channel}`).join('\n')}

### Marketing & Positioning
${content.goToMarketStrategy.marketingPositioning}

### Success Measurement
${content.goToMarketStrategy.successMeasurement.map(metric => `- ${metric}`).join('\n')}

## Strategic Implementation Guide

### Resource Requirements
${content.strategicImplementationGuide.resourceRequirements.map(req => `- ${req}`).join('\n')}

### Team Structure
${content.strategicImplementationGuide.teamStructure}

### Key Decision Points
${content.strategicImplementationGuide.keyDecisionPoints.map(point => `- ${point}`).join('\n')}

### Continuous Improvement
${content.strategicImplementationGuide.continuousImprovement}
`;
  }

  /**
   * Compile product strategy page from product data using AI
   */
  async compileProductStrategy(product: Product): Promise<CompiledProductStrategyPage> {
    const inputs = this.extractProductStrategyInputs(product);
    const content = await this.generateProductStrategyContent(product, inputs);
    const rawMarkdown = this.generateStrategyMarkdown(content, product);

    const compiledStrategy: CompiledProductStrategyPage = {
      id: `product-strategy-${product.id}-${Date.now()}`,
      productId: product.id,
      compiledAt: new Date(),
      content,
      rawMarkdown
    };

    // Save to storage
    await this.saveCompiledPage(compiledStrategy);
    
    // Increment compilation count
    await this.incrementCompilationCount(product.id);

    return compiledStrategy;
  }

  /**
   * Save compiled page to localStorage
   */
  async saveCompiledPage(compiledStrategy: CompiledProductStrategyPage): Promise<void> {
    const key = `bn:compiled:product-strategy:${compiledStrategy.productId}`;
    await this.storage.set(key, compiledStrategy);
  }

  /**
   * Get compilation count for a product
   */
  async getCompilationCount(productId: string): Promise<number> {
    const key = `bn:count:product-strategy:${productId}`;
    const count = await this.storage.get<number>(key);
    return count || 0;
  }

  /**
   * Increment compilation count
   */
  private async incrementCompilationCount(productId: string): Promise<void> {
    const key = `bn:count:product-strategy:${productId}`;
    await this.storage.increment(key);
  }

  /**
   * Reset compilation count
   */
  async resetCompilationCount(productId: string): Promise<void> {
    const key = `bn:count:product-strategy:${productId}`;
    await this.storage.delete(key);
    
    // Also remove compiled page
    const pageKey = `bn:compiled:product-strategy:${productId}`;
    await this.storage.delete(pageKey);
  }

  /**
   * Get all compilation counts
   */
  async getAllCompilationCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const keys = await this.storage.keys('bn:count:product-strategy:*');
    
    for (const key of keys) {
      const productId = key.replace('bn:count:product-strategy:', '');
      counts[productId] = await this.getCompilationCount(productId);
    }
    
    return counts;
  }

  /**
   * Load compiled page from localStorage
   */
  async loadCompiledPage(productId: string): Promise<CompiledProductStrategyPage | null> {
    const key = `bn:compiled:product-strategy:${productId}`;
    const data = await this.storage.get<CompiledProductStrategyPage>(key);
    
    if (!data) {
      return null;
    }
    
    try {
      // Convert date strings back to Date objects
      if (typeof data.compiledAt === 'string') {
        data.compiledAt = new Date(data.compiledAt);
      }
      return data;
    } catch (error) {
      console.error('Failed to parse compiled product strategy:', error);
      return null;
    }
  }

  /**
   * Check if product has compiled page
   */
  async hasCompiledPage(productId: string): Promise<boolean> {
    const key = `bn:compiled:product-strategy:${productId}`;
    return await this.storage.exists(key);
  }
}

// Export singleton instance
export const productStrategyCompiler = new ProductStrategyCompilerService(); 