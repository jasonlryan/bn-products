/**
 * Product Strategy Compilation Service
 * 
 * Takes the 4 Product Strategy inputs (Product Manifesto, User Stories, Business Model, Functional Spec)
 * and compiles them into a unified strategic product roadmap and business strategy document using AI.
 */

import type { Product } from '../types/product';
import { PRODUCT_STRATEGY_COMPILATION_PROMPT } from '../prompts/productStrategyPrompt';
import { aiService } from './aiService';

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

    try {
      // Use the actual AI service with the external prompt
      const aiResponse = await aiService.generateCompiledContent(
        PRODUCT_STRATEGY_COMPILATION_PROMPT,
        inputData
      );
      
      // Parse the JSON response
      const parsedContent = JSON.parse(aiResponse);
      
      // Validate the structure matches our interface
      if (!parsedContent.executiveStrategySummary || !parsedContent.productDefinitionPositioning) {
        throw new Error('AI response does not match expected structure');
      }
      
      return parsedContent as CompiledProductStrategyPage['content'];
    } catch (error) {
      console.error('AI compilation failed:', error);
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

    // Save to localStorage
    this.saveCompiledPage(compiledStrategy);
    
    // Increment compilation count
    this.incrementCompilationCount(product.id);

    return compiledStrategy;
  }

  /**
   * Save compiled page to localStorage
   */
  saveCompiledPage(compiledStrategy: CompiledProductStrategyPage): void {
    const key = `compiled-product-strategy-${compiledStrategy.productId}`;
    localStorage.setItem(key, JSON.stringify(compiledStrategy));
  }

  /**
   * Get compilation count for a product
   */
  getCompilationCount(productId: string): number {
    const key = `product-strategy-compilation-count-${productId}`;
    const count = localStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Increment compilation count
   */
  private incrementCompilationCount(productId: string): void {
    const key = `product-strategy-compilation-count-${productId}`;
    const currentCount = this.getCompilationCount(productId);
    localStorage.setItem(key, (currentCount + 1).toString());
  }

  /**
   * Reset compilation count
   */
  resetCompilationCount(productId: string): void {
    const key = `product-strategy-compilation-count-${productId}`;
    localStorage.removeItem(key);
    
    // Also remove compiled page
    const pageKey = `compiled-product-strategy-${productId}`;
    localStorage.removeItem(pageKey);
  }

  /**
   * Get all compilation counts
   */
  getAllCompilationCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('product-strategy-compilation-count-')) {
        const productId = key.replace('product-strategy-compilation-count-', '');
        const count = localStorage.getItem(key);
        counts[productId] = count ? parseInt(count, 10) : 0;
      }
    }
    
    return counts;
  }

  /**
   * Load compiled page from localStorage
   */
  loadCompiledPage(productId: string): CompiledProductStrategyPage | null {
    const key = `compiled-product-strategy-${productId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    try {
      return JSON.parse(data) as CompiledProductStrategyPage;
    } catch (error) {
      console.error('Failed to parse compiled product strategy:', error);
      return null;
    }
  }

  /**
   * Check if product has compiled page
   */
  hasCompiledPage(productId: string): boolean {
    return this.loadCompiledPage(productId) !== null;
  }
}

// Export singleton instance
export const productStrategyCompiler = new ProductStrategyCompilerService(); 