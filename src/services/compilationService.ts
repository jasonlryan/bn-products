/**
 * Redis-based Compilation Service
 * Handles compilation workflows and ensures data is saved to Redis
 */

import { getStorageService } from './storage/storageService'
import { productService } from './storage/productService'
import { marketingCompiler } from './marketingCompiler'
import { marketIntelligenceCompiler } from './marketIntelligenceCompiler'
import { productStrategyCompiler } from './productStrategyCompiler'
import type { Product } from '../types/product'

const storage = getStorageService()

export type CompilationType = 'marketing' | 'market-intel' | 'product-strategy'

export interface CompilationJob {
  id: string
  productId: string
  type: CompilationType
  status: 'queued' | 'processing' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  error?: string
}

export class CompilationService {
  /**
   * Compile marketing content and save to Redis
   */
  async compileMarketing(productId: string): Promise<{
    success: boolean
    compiledPage?: any
    error?: string
  }> {
    try {
      console.log(`🚀 Starting marketing compilation for product ${productId}`)
      
      // Get product data
      const product = await productService.getProduct(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      // Convert to legacy format for compiler
      const legacyProduct = this.convertToLegacyProduct(product)
      
      // Compile using existing service
      const compiledPage = await marketingCompiler.compileMarketingPage(legacyProduct)
      
      // Save compiled content to Redis with proper key structure
      await storage.set(`bn:compiled:marketing:${productId}`, {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'marketing'
      })

      // Update compilation count
      await storage.increment(`bn:count:marketing:${productId}`)

      console.log(`✅ Marketing compilation completed for product ${productId}`)
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Marketing compilation failed for product ${productId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Compile market intelligence content and save to Redis
   */
  async compileMarketIntelligence(productId: string): Promise<{
    success: boolean
    compiledPage?: any
    error?: string
  }> {
    try {
      console.log(`🚀 Starting market intelligence compilation for product ${productId}`)
      
      const product = await productService.getProduct(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      const legacyProduct = this.convertToLegacyProduct(product)
      const compiledPage = await marketIntelligenceCompiler.compileMarketIntelligencePage(legacyProduct)
      
      // Save to Redis
      await storage.set(`bn:compiled:market-intel:${productId}`, {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'market-intel'
      })

      await storage.increment(`bn:count:market-intel:${productId}`)

      console.log(`✅ Market intelligence compilation completed for product ${productId}`)
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Market intelligence compilation failed for product ${productId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Compile product strategy content and save to Redis
   */
  async compileProductStrategy(productId: string): Promise<{
    success: boolean
    compiledPage?: any
    error?: string
  }> {
    try {
      console.log(`🚀 Starting product strategy compilation for product ${productId}`)
      
      const product = await productService.getProduct(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      const legacyProduct = this.convertToLegacyProduct(product)
      const compiledPage = await productStrategyCompiler.compileProductStrategy(legacyProduct)
      
      // Save to Redis
      await storage.set(`bn:compiled:product-strategy:${productId}`, {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'product-strategy'
      })

      await storage.increment(`bn:count:product-strategy:${productId}`)

      console.log(`✅ Product strategy compilation completed for product ${productId}`)
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Product strategy compilation failed for product ${productId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get compiled content from Redis
   */
  async getCompiledContent(productId: string, type: CompilationType): Promise<any> {
    const key = `bn:compiled:${type}:${productId}`
    return await storage.get(key)
  }

  /**
   * Get compilation counts
   */
  async getCompilationCounts(productId: string): Promise<{
    marketing: number
    marketIntel: number
    productStrategy: number
  }> {
    const marketing = (await storage.get<number>(`bn:count:marketing:${productId}`)) || 0;
    const marketIntel = (await storage.get<number>(`bn:count:market-intel:${productId}`)) || 0;
    const productStrategy = (await storage.get<number>(`bn:count:product-strategy:${productId}`)) || 0;

    return { marketing, marketIntel, productStrategy }
  }

  /**
   * Check if compiled content exists
   */
  async hasCompiledContent(productId: string, type: CompilationType): Promise<boolean> {
    const key = `bn:compiled:${type}:${productId}`
    return await storage.exists(key)
  }

  /**
   * Delete compiled content
   */
  async deleteCompiledContent(productId: string, type: CompilationType): Promise<void> {
    await storage.delete(`bn:compiled:${type}:${productId}`)
    await storage.delete(`bn:count:${type}:${productId}`)
  }

  /**
   * Convert new ProductDefinition format to legacy Product format for compilers
   */
  private convertToLegacyProduct(product: any): Product {
    // This is a temporary adapter until we fully migrate the compilers
    // The compilers expect a different product structure
    return {
      id: product.id,
      name: product.name,
      type: product.type,
      content: product.content,
      features: product.features || [],
      benefits: product.benefits || [],
      marketing: product.marketing || {},
      pricing: product.pricing,
      // Add rich content from Redis if available
      richContent: {}
    } as Product
  }

  /**
   * Compile by specific type
   */
  async compileByType(productId: string, type: CompilationType): Promise<{
    success: boolean;
    error?: string;
  }> {
    switch (type) {
      case 'marketing':
        return await this.compileMarketing(productId);
      case 'market-intel':
        return await this.compileMarketIntelligence(productId);
      case 'product-strategy':
        return await this.compileProductStrategy(productId);
      default:
        return { success: false, error: `Unknown compilation type: ${type}` };
    }
  }

  /**
   * Batch compile all types for a product
   */
  async compileAll(productId: string): Promise<{
    marketing: { success: boolean; error?: string }
    marketIntel: { success: boolean; error?: string }
    productStrategy: { success: boolean; error?: string }
  }> {
    const [marketing, marketIntel, productStrategy] = await Promise.all([
      this.compileMarketing(productId),
      this.compileMarketIntelligence(productId),
      this.compileProductStrategy(productId)
    ])

    return {
      marketing: { success: marketing.success, error: marketing.error },
      marketIntel: { success: marketIntel.success, error: marketIntel.error },
      productStrategy: { success: productStrategy.success, error: productStrategy.error }
    }
  }
}

// Export singleton instance
export const compilationService = new CompilationService()