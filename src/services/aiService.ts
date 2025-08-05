import type { Product } from '../types/product';

interface AIUpgradeRequest {
  currentContent: string;
  contentType: 'heroTitle' | 'heroSubtitle' | 'description' | 'perfectFor' | 'feature' | 'benefit' | 'whatClientBuys' | 'idealClient';
  productContext: Product;
  upgradeType: 'polish' | 'expand' | 'persuasive' | 'technical' | 'emotional';
}

interface AIUpgradeResponse {
  upgradedContent: string;
  reasoning: string;
  suggestions: string[];
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // Get API key from environment or localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private buildPrompt(request: AIUpgradeRequest): string {
    const { currentContent, contentType, productContext, upgradeType } = request;

    // Extract rich context from product using new structure
    const richContext = {
      manifesto: productContext.richContent?.manifesto?.sections?.['Generated Output'],
      audienceICPs: productContext.richContent?.audienceICPs?.sections?.['Generated Output'],
      competitors: productContext.richContent?.competitorAnalysis?.sections?.['Generated Output'],
      marketSizing: productContext.richContent?.marketSizing?.sections?.['Generated Output'],
      userStories: productContext.richContent?.userStories?.sections?.['Generated Output'],
      features: productContext.features,
      benefits: productContext.benefits,
      pricing: productContext.pricing,
      marketing: productContext.marketing
    };

    const contextPrompt = `
PRODUCT CONTEXT:
- Name: ${productContext.name}
- Type: ${productContext.type}
- Pricing: ${productContext.pricing?.display || 'Contact for pricing'}

RICH PRODUCT DATA:
${richContext.manifesto ? `
MANIFESTO:
${richContext.manifesto.substring(0, 1000)}...
` : ''}

${richContext.audienceICPs ? `
AUDIENCE PROFILES:
${richContext.audienceICPs.substring(0, 1000)}...
` : ''}

${richContext.competitors ? `
COMPETITIVE ANALYSIS:
${richContext.competitors.substring(0, 1000)}...
` : ''}

${richContext.marketSizing ? `
MARKET SIZING:
${richContext.marketSizing.substring(0, 500)}...
` : ''}

FEATURES: ${richContext.features?.join(', ') || 'None specified'}
BENEFITS: ${richContext.benefits?.join(', ') || 'None specified'}

CURRENT CONTENT TO UPGRADE:
"${currentContent}"

CONTENT TYPE: ${contentType}
UPGRADE TYPE: ${upgradeType}
`;

    const upgradeInstructions = {
      polish: 'Polish and refine the content for clarity, flow, and professional tone while maintaining the core message.',
      expand: 'Expand the content with more detail, examples, and compelling information using the rich product data.',
      persuasive: 'Make the content more persuasive and compelling, focusing on benefits and emotional triggers.',
      technical: 'Add more technical depth and specificity, highlighting unique capabilities and differentiators.',
      emotional: 'Enhance emotional appeal and connection, focusing on customer pain points and aspirations.'
    };

    const contentTypeGuidance = {
      heroTitle: 'Create a compelling, memorable headline that captures attention and communicates core value.',
      heroSubtitle: 'Write a supporting subtitle that expands on the headline and creates interest.',
      description: 'Provide a comprehensive overview that educates and persuades.',
      perfectFor: 'Clearly define the ideal customer using specific, relatable characteristics.',
      feature: 'Describe the feature in terms of capabilities and user benefits.',
      benefit: 'Focus on the outcome and value the customer receives.',
      whatClientBuys: 'Explain the tangible deliverable and transformation the client receives.',
      idealClient: 'Paint a detailed picture of the perfect customer for this product.'
    };

    return `${contextPrompt}

TASK: ${upgradeInstructions[upgradeType]}

CONTENT TYPE GUIDANCE: ${contentTypeGuidance[contentType]}

REQUIREMENTS:
1. Use the rich product data to inform your upgrade
2. Maintain authenticity and avoid over-promising
3. Keep the tone professional but engaging
4. Make it specific to this product and market
5. Ensure it aligns with the overall product positioning

RESPONSE FORMAT:
{
  "upgradedContent": "Your improved content here",
  "reasoning": "Brief explanation of changes made and why",
  "suggestions": ["Additional suggestion 1", "Additional suggestion 2", "Additional suggestion 3"]
}

Respond with valid JSON only.`;
  }

  async upgradeContent(request: AIUpgradeRequest): Promise<AIUpgradeResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert marketing copywriter specializing in AI products and services. You create compelling, authentic marketing copy that converts prospects into customers.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          upgradedContent: parsed.upgradedContent,
          reasoning: parsed.reasoning,
          suggestions: parsed.suggestions || []
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          upgradedContent: content,
          reasoning: 'AI upgrade completed',
          suggestions: []
        };
      }

    } catch (error) {
      console.error('AI upgrade failed:', error);
      throw error;
    }
  }

  // Generate compiled content using prompts
  async generateCompiledContent(prompt: string, inputData: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert business analyst and content compiler. You transform raw business inputs into comprehensive, strategic documents following specific prompts and frameworks.'
            },
            {
              role: 'user',
              content: `${prompt}\n\n## INPUT DATA TO COMPILE:\n\n${inputData}`
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return content;

    } catch (error) {
      console.error('AI compilation failed:', error);
      throw error;
    }
  }

  // Batch upgrade multiple content pieces
  async batchUpgrade(requests: AIUpgradeRequest[]): Promise<AIUpgradeResponse[]> {
    const results = await Promise.allSettled(
      requests.map(request => this.upgradeContent(request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Batch upgrade failed for request ${index}:`, result.reason);
        return {
          upgradedContent: requests[index].currentContent,
          reasoning: 'Upgrade failed, content unchanged',
          suggestions: []
        };
      }
    });
  }
}

export const aiService = new AIService();
export type { AIUpgradeRequest, AIUpgradeResponse }; 