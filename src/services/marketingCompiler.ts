/**
 * Marketing & Sales Enablement Page Compilation Service
 * 
 * Takes the 4 Marketing & Sales inputs (Key Messages, Demo Script, Slide Headlines, Q&A Prep)
 * and compiles them into a unified sales and marketing enablement resource page using AI.
 */

import type { Product } from '../types/product';
import { MARKETING_COMPILATION_PROMPT } from '../prompts/marketingPrompt';
import { aiService } from './aiService';
import { getStorageService } from './storage/storageService';

export interface MarketingInputs {
  keyMessages: string;
  demoScript: string;
  slideHeadlines: string;
  qaPrep: string;
}

export interface CompiledMarketingPage {
  id: string;
  productId: string;
  compiledAt: Date;
  content: {
    executiveSummary: {
      productOverview: string;
      targetMarket: string;
      uniqueValueProp: string;
      keyMetrics: string;
    };
    messagingFramework: {
      primaryValueProps: Array<{
        title: string;
        description: string;
        evidence: string;
      }>;
      elevatorPitches: {
        thirtySecond: string;
        sixtySecond: string;
        twoMinute: string;
      };
      keyDifferentiators: string[];
      proofPoints: string[];
    };
    salesProcessGuide: {
      discoveryQuestions: string[];
      demoFlow: Array<{
        step: number;
        title: string;
        description: string;
        talkingPoints: string[];
      }>;
      wowMoments: string[];
      commonUseCases: Array<{
        scenario: string;
        application: string;
        outcome: string;
      }>;
    };
    objectionHandling: {
      commonObjections: Array<{
        objection: string;
        category: 'price' | 'timing' | 'competition' | 'functionality' | 'other';
        response: string;
        evidence: string;
      }>;
      competitiveBattlecards: Array<{
        competitor: string;
        positioning: string;
        advantages: string[];
      }>;
      pricingJustification: {
        roiTalkingPoints: string[];
        valueDemo: string;
      };
    };
    marketingAssets: {
      presentationMaterials: string[];
      collateralLibrary: string[];
      digitalAssets: string[];
      demoScripts: string[];
    };
    targetAudienceIntel: {
      buyerPersonas: Array<{
        role: string;
        painPoints: string[];
        motivations: string[];
      }>;
      buyingProcess: string;
      budgetConsiderations: string;
    };
    implementationGuide: {
      qualificationCriteria: string[];
      proposalGuidelines: string[];
      followUpProcess: string[];
      successMetrics: string[];
    };
  };
  rawMarkdown: string;
}

class MarketingCompilerService {
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
   * Sanitize content to ensure consistent product naming
   */
  private sanitizeProductReferences(content: string, currentProductName: string): string {
    if (!content) return content;
    
    // Map of old product names to clean up
    const nameReplacements: Record<string, string> = {
      'AI-Powered Research and Insight Sprint': 'AI Insight Sprint',
      'AI Consultancy Retainer': 'AI Sherpa',
      'AI Innovation Day': 'AI Acceleration Day',
      'Social Intelligence Dashboard': 'AI Market Intelligence Dashboard'
    };
    
    let sanitizedContent = content;
    
    // Replace old names with current product name if it matches
    for (const [oldName, newName] of Object.entries(nameReplacements)) {
      if (currentProductName.includes(newName) || newName === currentProductName) {
        // Use global regex to replace all instances
        const regex = new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        sanitizedContent = sanitizedContent.replace(regex, currentProductName);
      }
    }
    
    return sanitizedContent;
  }

  /**
   * Extract marketing inputs from product data with name hygiene check
   */
  private extractMarketingInputs(product: Product): MarketingInputs {
    const inputs: MarketingInputs = {
      keyMessages: '',
      demoScript: '',
      slideHeadlines: '',
      qaPrep: ''
    };

    // Extract Key Messages with name sanitization
    if (product.richContent?.keyMessages?.sections?.['Generated Output']) {
      inputs.keyMessages = this.sanitizeProductReferences(
        product.richContent.keyMessages.sections['Generated Output'], 
        product.name
      );
    } else if (product.richContent?.keyMessages?.fullContent) {
      inputs.keyMessages = this.sanitizeProductReferences(
        product.richContent.keyMessages.fullContent, 
        product.name
      );
    }

    // Extract Demo Script with name sanitization
    if (product.richContent?.demoScript?.sections?.['Generated Output']) {
      inputs.demoScript = this.sanitizeProductReferences(
        product.richContent.demoScript.sections['Generated Output'], 
        product.name
      );
    } else if (product.richContent?.demoScript?.fullContent) {
      inputs.demoScript = this.sanitizeProductReferences(
        product.richContent.demoScript.fullContent, 
        product.name
      );
    }

    // Extract Slide Headlines with name sanitization
    if (product.richContent?.slideHeadlines?.sections?.['Generated Output']) {
      inputs.slideHeadlines = this.sanitizeProductReferences(
        product.richContent.slideHeadlines.sections['Generated Output'], 
        product.name
      );
    } else if (product.richContent?.slideHeadlines?.fullContent) {
      inputs.slideHeadlines = this.sanitizeProductReferences(
        product.richContent.slideHeadlines.fullContent, 
        product.name
      );
    }

    // Extract Q&A Prep with name sanitization
    if (product.richContent?.qaPrep?.sections?.['Generated Output']) {
      inputs.qaPrep = this.sanitizeProductReferences(
        product.richContent.qaPrep.sections['Generated Output'], 
        product.name
      );
    } else if (product.richContent?.qaPrep?.fullContent) {
      inputs.qaPrep = this.sanitizeProductReferences(
        product.richContent.qaPrep.fullContent, 
        product.name
      );
    }

    // Log sanitization activity for debugging
    console.log(`🧹 [Marketing Compiler] Applied name hygiene check for ${product.name}`);

    return inputs;
  }

  /**
   * Generate sales enablement content using AI compilation with the external prompt
   */
  private async generateSalesEnablementContent(
    product: Product, 
    inputs: MarketingInputs
  ): Promise<CompiledMarketingPage['content']> {
    console.log('🔍 [Marketing Compiler] Starting generateSalesEnablementContent');
    console.log('📦 [Marketing Compiler] Product:', { id: product.id, name: product.name, type: product.type });
    console.log('📝 [Marketing Compiler] Inputs:', {
      keyMessagesLength: inputs.keyMessages?.length || 0,
      demoScriptLength: inputs.demoScript?.length || 0,
      slideHeadlinesLength: inputs.slideHeadlines?.length || 0,
      qaPrepLength: inputs.qaPrep?.length || 0
    });

    // Prepare input data for AI compilation
    const inputData = `
# PRODUCT INFORMATION
Name: ${product.name}
Type: ${product.type}
Description: ${product.content?.description || 'No description available'}

# MARKETING INPUTS TO COMPILE

## Key Messages
${inputs.keyMessages || 'No key messages available'}

## Demo Script  
${inputs.demoScript || 'No demo script available'}

## Slide Headlines
${inputs.slideHeadlines || 'No slide headlines available'}

## Q&A Prep
${inputs.qaPrep || 'No Q&A prep available'}
`;

    console.log('📤 [Marketing Compiler] Prepared input data for AI:', inputData.substring(0, 500) + '...');

    try {
      console.log('🤖 [Marketing Compiler] Calling AI service...');
      
      // Use the actual AI service with the external prompt
      const aiResponse = await aiService.generateCompiledContent(
        MARKETING_COMPILATION_PROMPT,
        inputData
      );
      
      console.log('📥 [Marketing Compiler] Received AI response length:', aiResponse?.length || 0);
      console.log('📥 [Marketing Compiler] Raw AI response preview:', aiResponse?.substring(0, 300) + '...');
      
      // Extract JSON from potential markdown formatting
      const cleanedResponse = this.extractJsonFromResponse(aiResponse);
      
      console.log('🧹 [Marketing Compiler] Cleaned response length:', cleanedResponse?.length || 0);
      console.log('🧹 [Marketing Compiler] Cleaned response preview:', cleanedResponse?.substring(0, 300) + '...');
      
      // Parse the JSON response
      console.log('🔧 [Marketing Compiler] Attempting JSON parse...');
      const parsedContent = JSON.parse(cleanedResponse);
      
      console.log('✅ [Marketing Compiler] JSON parse successful');
      console.log('📊 [Marketing Compiler] Parsed content structure:', {
        hasExecutiveSummary: !!parsedContent.executiveSummary,
        hasMessagingFramework: !!parsedContent.messagingFramework,
        hasSalesProcessGuide: !!parsedContent.salesProcessGuide,
        hasObjectionHandling: !!parsedContent.objectionHandling,
        hasMarketingAssets: !!parsedContent.marketingAssets,
        hasTargetAudienceIntel: !!parsedContent.targetAudienceIntel,
        hasImplementationGuide: !!parsedContent.implementationGuide
      });
      
      // Validate the structure matches our interface
      if (!parsedContent.executiveSummary || !parsedContent.messagingFramework) {
        console.error('❌ [Marketing Compiler] AI response missing required fields');
        throw new Error('AI response does not match expected structure');
      }
      
      console.log('✅ [Marketing Compiler] Content validation passed');
      return parsedContent as CompiledMarketingPage['content'];
    } catch (error) {
      console.error('❌ [Marketing Compiler] AI compilation failed:', error);
      
      // Provide more specific error information
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        // Note: aiResponse is not available in catch scope, so we can't show the raw response here
        console.error('🔍 [Marketing Compiler] JSON parsing failed. Check the logs above for raw response details.');
        throw new Error(`Marketing compilation failed: Invalid JSON response from AI. Please try again.`);
      }
      
      throw new Error(`Marketing compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * DEPRECATED: Old fake compilation method - keeping for reference
   * @ts-ignore - Keeping for reference, not used in current implementation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateSalesEnablementContentOld(
    product: Product, 
    inputs: MarketingInputs
  ): CompiledMarketingPage['content'] {
    // Parse inputs intelligently
    const keyMessages = this.parseKeyMessages(inputs.keyMessages);
    const demoElements = this.parseDemoScript(inputs.demoScript);
    const slideElements = this.parseSlideHeadlines(inputs.slideHeadlines);
    const qaElements = this.parseQAPrep(inputs.qaPrep);

    return {
      executiveSummary: {
        productOverview: `${product.name} is ${product.content?.description || 'a comprehensive solution designed to address key business challenges'}`,
        targetMarket: product.marketing?.targetAudience || `Organizations seeking to improve their ${product.type.toLowerCase()} capabilities`,
        uniqueValueProp: keyMessages[0] || `${product.name} delivers unique value through innovative approach and proven results`,
        keyMetrics: slideElements.marketInfo || 'Strong market opportunity with growing demand'
      },
      messagingFramework: {
        primaryValueProps: keyMessages.slice(0, 3).map((message, index) => ({
          title: message,
          description: `${message} through our proven methodology and expert guidance`,
          evidence: product.benefits?.[index] || 'Demonstrated success across multiple client engagements'
        })),
        elevatorPitches: {
          thirtySecond: `${product.name} ${keyMessages[0] || 'delivers exceptional results'} for ${product.marketing?.targetAudience || 'organizations'}.`,
          sixtySecond: `${product.name} ${keyMessages[0] || 'provides comprehensive solutions'}. ${keyMessages[1] || 'Our approach is proven effective'} with ${keyMessages[2] || 'measurable outcomes'}.`,
          twoMinute: `${product.name} addresses the challenge of ${demoElements.problem || 'business inefficiencies'}. ${demoElements.solution || 'Our solution provides comprehensive capabilities'} through ${demoElements.approach || 'expert guidance and proven methodologies'}. ${demoElements.outcome || 'Results include improved performance and measurable ROI'}.`
        },
        keyDifferentiators: [
          slideElements.uniqueApproach || 'Unique methodology and approach',
          'Expert team with proven track record',
          'Customized solutions for specific needs',
          'Measurable results and ROI focus'
        ],
        proofPoints: [
          product.socialProof?.testimonial?.quote || 'Client testimonials demonstrate success',
          'Industry expertise and specialization',
          'Proven methodology and frameworks',
          'Measurable outcomes and ROI'
        ]
      },
      salesProcessGuide: {
        discoveryQuestions: [
          demoElements.discoveryQuestion1 || 'What are your current challenges in this area?',
          'What approaches have you tried before?',
          'What would success look like for your organization?',
          'What is your timeline for implementation?',
          'Who are the key stakeholders in this decision?'
        ],
        demoFlow: demoElements.steps.map((step, index) => ({
          step: index + 1,
          title: step,
          description: `Demonstrate ${step.toLowerCase()} capabilities and benefits`,
          talkingPoints: [
            `Highlight key features of ${step}`,
            'Show practical application and benefits',
            'Address specific client needs and use cases'
          ]
        })),
        wowMoments: [
          demoElements.wowMoment || 'Demonstrate unique capabilities and immediate impact',
          'Show unique capabilities not available elsewhere',
          'Highlight specific ROI and measurable outcomes'
        ],
        commonUseCases: [
          {
            scenario: 'Initial implementation',
            application: 'Getting started with foundational capabilities',
            outcome: 'Immediate improvement in key metrics'
          },
          {
            scenario: 'Scaling existing efforts',
            application: 'Expanding successful initiatives',
            outcome: 'Accelerated growth and enhanced results'
          },
          {
            scenario: 'Transformation initiative',
            application: 'Comprehensive organizational change',
            outcome: 'Fundamental improvement in capabilities'
          }
        ]
      },
      objectionHandling: {
        commonObjections: qaElements.map(qa => ({
          objection: qa.question,
          category: this.categorizeObjection(qa.question),
          response: qa.answer,
          evidence: 'Supporting evidence and proof points'
        })),
        competitiveBattlecards: [
          {
            competitor: 'Alternative Approach A',
            positioning: 'While they focus on X, we provide comprehensive Y',
            advantages: ['Deeper expertise', 'Proven methodology', 'Better outcomes']
          },
          {
            competitor: 'Alternative Approach B',
            positioning: 'They offer basic solutions, we deliver transformation',
            advantages: ['More comprehensive', 'Better support', 'Faster results']
          }
        ],
        pricingJustification: {
          roiTalkingPoints: [
            'Investment pays for itself through improved efficiency',
            'Measurable impact on key business metrics',
            'Long-term value far exceeds initial investment'
          ],
          valueDemo: 'ROI calculator showing specific financial benefits'
        }
      },
      marketingAssets: {
        presentationMaterials: [
          'Executive overview presentation',
          'Detailed capability demonstration',
          'Case study presentations',
          'ROI and value proposition slides'
        ],
        collateralLibrary: [
          'Product overview brochure',
          'Detailed capability guide',
          'Case studies and success stories',
          'Implementation roadmap'
        ],
        digitalAssets: [
          'Email templates for outreach',
          'Social media content and posts',
          'Web page content and copy',
          'Digital proposal templates'
        ],
        demoScripts: [
          'Standard demo script and flow',
          'Technical setup instructions',
          'Customization guidelines',
          'Q&A response guide'
        ]
      },
      targetAudienceIntel: {
        buyerPersonas: [
          {
            role: 'Decision Maker',
            painPoints: ['Budget constraints', 'Need for proven ROI', 'Risk mitigation'],
            motivations: ['Business growth', 'Competitive advantage', 'Operational efficiency']
          },
          {
            role: 'Technical Evaluator',
            painPoints: ['Implementation complexity', 'Integration challenges', 'Technical requirements'],
            motivations: ['Technical excellence', 'Ease of implementation', 'Ongoing support']
          },
          {
            role: 'End User',
            painPoints: ['Learning curve', 'Change management', 'Day-to-day usability'],
            motivations: ['Improved efficiency', 'Better outcomes', 'Professional development']
          }
        ],
        buyingProcess: 'Typical sales cycle involves initial awareness, evaluation, proposal, and implementation phases',
        budgetConsiderations: 'Investment levels vary based on scope and organizational size'
      },
      implementationGuide: {
        qualificationCriteria: [
          'Clear business need and pain points',
          'Budget availability and timing',
          'Stakeholder buy-in and support',
          'Implementation capacity and readiness'
        ],
        proposalGuidelines: [
          'Include executive summary and business case',
          'Detail implementation approach and timeline',
          'Provide clear pricing and ROI analysis',
          'Address specific client needs and concerns'
        ],
        followUpProcess: [
          'Send thank you and recap within 24 hours',
          'Provide additional information as requested',
          'Schedule follow-up meetings with stakeholders',
          'Maintain regular communication and updates'
        ],
        successMetrics: [
          'Proposal acceptance and closure rates',
          'Time from initial contact to close',
          'Client satisfaction and retention',
          'Referral generation and repeat business'
        ]
      }
    };
  }

  /**
   * Parse key messages from input text
   */
  private parseKeyMessages(input: string): string[] {
    if (!input.trim()) return [];
    
    const messages: string[] = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Look for numbered items, bullets, or quoted messages
      const match = line.match(/^\d+\.\s*(.+)/) || 
                   line.match(/^[•\-\*]\s*(.+)/) || 
                   line.match(/^["']([^"']+)["']/) ||
                   line.match(/^(.+)$/);
      if (match) {
        const message = match[1].trim();
        if (message.length > 10) { // Filter out very short items
          messages.push(message);
        }
      }
    }
    
    return messages.length > 0 ? messages : [input.trim()];
  }

  /**
   * Parse demo script for key elements
   */
  private parseDemoScript(input: string): {
    problem: string;
    solution: string;
    approach: string;
    outcome: string;
    steps: string[];
    wowMoment: string;
    discoveryQuestion1: string;
  } {
    if (!input.trim()) {
      return {
        problem: '',
        solution: '',
        approach: '',
        outcome: '',
        steps: [],
        wowMoment: '',
        discoveryQuestion1: ''
      };
    }

    const lines = input.split('\n').filter(line => line.trim());
    
    let problem = '';
    let solution = '';
    let approach = '';
    let outcome = '';
    let wowMoment = '';
    let discoveryQuestion1 = '';
    const steps: string[] = [];

    // Extract content intelligently from demo script
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const content = lines[i];
      
      if (line.includes('problem') || line.includes('challenge') || line.includes('pain')) {
        problem = content;
      } else if (line.includes('solution') || line.includes('solve')) {
        solution = content;
      } else if (line.includes('approach') || line.includes('method')) {
        approach = content;
      } else if (line.includes('result') || line.includes('outcome') || line.includes('benefit')) {
        outcome = content;
      } else if (line.includes('wow') || line.includes('amazing') || line.includes('impressive')) {
        wowMoment = content;
      } else if (line.includes('?') && !discoveryQuestion1) {
        discoveryQuestion1 = content;
      } else if (line.match(/^\d+\./) || line.match(/^step/i)) {
        steps.push(content);
      }
    }

    return {
      problem: problem || 'Organizations face significant challenges in this area',
      solution: solution || 'Our solution addresses these challenges comprehensively',
      approach: approach || 'Through proven methodology and expert guidance',
      outcome: outcome || 'Delivering measurable results and ROI',
      steps: steps.length > 0 ? steps : ['Introduction', 'Core Capabilities', 'Benefits', 'Implementation'],
      wowMoment: wowMoment || 'Demonstrate unique capabilities and immediate impact',
      discoveryQuestion1: discoveryQuestion1 || 'What are your biggest challenges in this area?'
    };
  }

  /**
   * Parse slide headlines for structure elements
   */
  private parseSlideHeadlines(input: string): {
    marketInfo: string;
    uniqueApproach: string;
  } {
    if (!input.trim()) {
      return {
        marketInfo: '',
        uniqueApproach: ''
      };
    }

    const lines = input.split('\n').filter(line => line.trim());
    
    let marketInfo = '';
    let uniqueApproach = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('market') || lower.includes('opportunity') || lower.includes('size')) {
        marketInfo = line;
      } else if (lower.includes('unique') || lower.includes('different') || lower.includes('approach')) {
        uniqueApproach = line;
      }
    }

    return {
      marketInfo: marketInfo || 'Significant market opportunity with growing demand',
      uniqueApproach: uniqueApproach || 'Unique approach differentiating from alternatives'
    };
  }

  /**
   * Parse Q&A prep into structured objections and responses
   */
  private parseQAPrep(input: string): Array<{ question: string; answer: string }> {
    if (!input.trim()) return [];

    const qaPairs: Array<{ question: string; answer: string }> = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    let currentQuestion = '';
    let currentAnswer = '';
    
    for (const line of lines) {
      if (line.includes('?')) {
        // If we have a previous Q&A pair, save it
        if (currentQuestion && currentAnswer) {
          qaPairs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim()
          });
        }
        currentQuestion = line;
        currentAnswer = '';
      } else if (currentQuestion) {
        currentAnswer += (currentAnswer ? ' ' : '') + line;
      }
    }
    
    // Don't forget the last pair
    if (currentQuestion && currentAnswer) {
      qaPairs.push({
        question: currentQuestion.trim(),
        answer: currentAnswer.trim()
      });
    }
    
    return qaPairs;
  }

  /**
   * Categorize objection type
   */
  private categorizeObjection(question: string): 'price' | 'timing' | 'competition' | 'functionality' | 'other' {
    const lower = question.toLowerCase();
    
    if (lower.includes('cost') || lower.includes('price') || lower.includes('budget') || lower.includes('expensive')) {
      return 'price';
    } else if (lower.includes('time') || lower.includes('when') || lower.includes('schedule') || lower.includes('deadline')) {
      return 'timing';
    } else if (lower.includes('competitor') || lower.includes('alternative') || lower.includes('other') || lower.includes('vs')) {
      return 'competition';
    } else if (lower.includes('feature') || lower.includes('function') || lower.includes('capability') || lower.includes('how')) {
      return 'functionality';
    } else {
      return 'other';
    }
  }

  /**
   * Generate markdown for sales enablement page
   */
  private generateSalesEnablementMarkdown(content: CompiledMarketingPage['content'], product: Product): string {
    return `# ${product.name} - Sales & Marketing Enablement Guide

## Executive Summary

**Product Overview:** ${content.executiveSummary.productOverview}

**Target Market:** ${content.executiveSummary.targetMarket}

**Unique Value Proposition:** ${content.executiveSummary.uniqueValueProp}

**Key Metrics:** ${content.executiveSummary.keyMetrics}

## Messaging Framework

### Primary Value Propositions

${content.messagingFramework.primaryValueProps.map(vp => 
  `**${vp.title}**
- ${vp.description}
- Evidence: ${vp.evidence}`
).join('\n\n')}

### Elevator Pitches

**30-Second Pitch:** ${content.messagingFramework.elevatorPitches.thirtySecond}

**60-Second Pitch:** ${content.messagingFramework.elevatorPitches.sixtySecond}

**2-Minute Pitch:** ${content.messagingFramework.elevatorPitches.twoMinute}

### Key Differentiators
${content.messagingFramework.keyDifferentiators.map(diff => `- ${diff}`).join('\n')}

### Proof Points
${content.messagingFramework.proofPoints.map(point => `- ${point}`).join('\n')}

## Sales Process & Demo Guide

### Discovery Questions
${content.salesProcessGuide.discoveryQuestions.map(q => `- ${q}`).join('\n')}

### Demo Flow
${content.salesProcessGuide.demoFlow.map(step => 
  `**Step ${step.step}: ${step.title}**
- ${step.description}
- Talking Points: ${step.talkingPoints.join(', ')}`
).join('\n\n')}

### Wow Moments
${content.salesProcessGuide.wowMoments.map(moment => `- ${moment}`).join('\n')}

### Common Use Cases
${content.salesProcessGuide.commonUseCases.map(useCase =>
  `**${useCase.scenario}**
- Application: ${useCase.application}
- Outcome: ${useCase.outcome}`
).join('\n\n')}

## Objection Handling

### Common Objections & Responses
${content.objectionHandling.commonObjections.map(obj =>
  `**${obj.objection}** (${obj.category})
- Response: ${obj.response}
- Evidence: ${obj.evidence}`
).join('\n\n')}

### Competitive Positioning
${content.objectionHandling.competitiveBattlecards.map(comp =>
  `**vs ${comp.competitor}**
- Positioning: ${comp.positioning}
- Advantages: ${comp.advantages.join(', ')}`
).join('\n\n')}

### Pricing Justification
**ROI Talking Points:**
${content.objectionHandling.pricingJustification.roiTalkingPoints.map(point => `- ${point}`).join('\n')}

**Value Demonstration:** ${content.objectionHandling.pricingJustification.valueDemo}

## Marketing Assets & Resources

### Presentation Materials
${content.marketingAssets.presentationMaterials.map(asset => `- ${asset}`).join('\n')}

### Collateral Library
${content.marketingAssets.collateralLibrary.map(asset => `- ${asset}`).join('\n')}

### Digital Assets
${content.marketingAssets.digitalAssets.map(asset => `- ${asset}`).join('\n')}

### Demo Scripts
${content.marketingAssets.demoScripts.map(script => `- ${script}`).join('\n')}

## Target Audience Intelligence

### Buyer Personas
${content.targetAudienceIntel.buyerPersonas.map(persona =>
  `**${persona.role}**
- Pain Points: ${persona.painPoints.join(', ')}
- Motivations: ${persona.motivations.join(', ')}`
).join('\n\n')}

**Buying Process:** ${content.targetAudienceIntel.buyingProcess}

**Budget Considerations:** ${content.targetAudienceIntel.budgetConsiderations}

## Implementation & Next Steps

### Qualification Criteria
${content.implementationGuide.qualificationCriteria.map(criteria => `- ${criteria}`).join('\n')}

### Proposal Guidelines
${content.implementationGuide.proposalGuidelines.map(guideline => `- ${guideline}`).join('\n')}

### Follow-up Process
${content.implementationGuide.followUpProcess.map(step => `- ${step}`).join('\n')}

### Success Metrics
${content.implementationGuide.successMetrics.map(metric => `- ${metric}`).join('\n')}

---

*Compiled on ${new Date().toLocaleDateString()} from Marketing & Sales inputs*`;
  }

  /**
   * Main compilation method - now using real AI compilation
   */
  async compileMarketingPage(product: Product): Promise<CompiledMarketingPage> {
    console.log('🚀 [Marketing Compiler] Starting compileMarketingPage for product:', product.id);
    
    try {
      console.log('📋 [Marketing Compiler] Extracting marketing inputs...');
      // Extract inputs from product data
      const inputs = this.extractMarketingInputs(product);
      console.log('✅ [Marketing Compiler] Inputs extracted successfully');
      
      console.log('🤖 [Marketing Compiler] Generating AI-compiled structured content...');
      // Generate AI-compiled structured content using the external prompt
      const content = await this.generateSalesEnablementContent(product, inputs);
      console.log('✅ [Marketing Compiler] Content generation completed');
      
      console.log('📝 [Marketing Compiler] Generating markdown representation...');
      // Generate markdown representation of the structured content
      const rawMarkdown = this.generateSalesEnablementMarkdown(content, product);
      console.log('✅ [Marketing Compiler] Markdown generation completed');
      
      const compiledPage: CompiledMarketingPage = {
        id: `compiled-${product.id}-${Date.now()}`,
        productId: product.id,
        compiledAt: new Date(),
        content,
        rawMarkdown
      };
      
      console.log('🎉 [Marketing Compiler] Compilation completed successfully');
      return compiledPage;
    } catch (error) {
      console.error('❌ [Marketing Compiler] Marketing compilation failed:', error);
      throw new Error(`Failed to compile marketing page for ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Writes are centralised in compilationService. This method is kept for backward compatibility but should not be used.
  async saveCompiledPage(_compiledPage: CompiledMarketingPage): Promise<void> { /* no-op */ }

  /**
   * Get compilation count for a product
   */
  async getCompilationCount(productId: string): Promise<number> {
    try {
      const key = `bn:count:marketing:${productId}`;
      const count = await this.storage.get<number>(key);
      return count || 0;
    } catch (error) {
      console.error('Failed to load compilation count:', error);
      return 0;
    }
  }

  /**
   * Increment compilation count for a product
   */
  // Writes are centralised in compilationService. This method is kept for backward compatibility but should not be used.
  private async incrementCompilationCount(_productId: string): Promise<void> { /* no-op */ }

  /**
   * Reset compilation count for a product
   */
  async resetCompilationCount(productId: string): Promise<void> {
    try {
      const key = `bn:count:marketing:${productId}`;
      await this.storage.delete(key);
    } catch (error) {
      console.error('Failed to reset compilation count:', error);
    }
  }

  /**
   * Get all compilation counts
   */
  async getAllCompilationCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    try {
      const keys = await this.storage.keys('bn:count:marketing:*');
      for (const key of keys) {
        const productId = key.replace('bn:count:marketing:', '');
        counts[productId] = await this.getCompilationCount(productId);
      }
    } catch (error) {
      console.error('Failed to load all compilation counts:', error);
    }
    return counts;
  }

  /**
   * Load compiled page from storage
   */
  async loadCompiledPage(productId: string): Promise<CompiledMarketingPage | null> {
    try {
      const key = `bn:compiled:marketing:${productId}`;
      const stored = await this.storage.get<CompiledMarketingPage>(key);
      if (stored) {
        // Convert date strings back to Date objects
        stored.compiledAt = new Date(stored.compiledAt);
        return stored;
      }
    } catch (error) {
      console.error('Failed to load compiled page:', error);
    }
    return null;
  }

  /**
   * Check if a compiled page exists
   */
  async hasCompiledPage(productId: string): Promise<boolean> {
    const key = `bn:compiled:marketing:${productId}`;
    return await this.storage.exists(key);
  }
}

export const marketingCompiler = new MarketingCompilerService(); 