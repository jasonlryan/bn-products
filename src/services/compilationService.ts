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
import { keyFactory } from '../utils/keyFactory'
import { fingerprintObject } from '../utils/fingerprint'
import { eventBus } from '../utils/events'

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
  private readonly SCHEMA_VERSION = 'v1'
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
      eventBus.publish('compilation:started', { productId, type: 'marketing' })
      
      // Get product data
      const product = await productService.getProductById(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      // Convert to legacy format for compiler
      const legacyProduct = this.convertToLegacyProduct(product)
      
      // Compile using existing service
      const compiledPage = await marketingCompiler.compileMarketingPage(legacyProduct)
      
      // Build metadata and save compiled content
      const sourceFingerprint = fingerprintObject({
        features: product.features,
        benefits: product.benefits,
        marketing: product.marketing,
      })
      await storage.set(keyFactory.compiled('marketing', productId), {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'marketing',
        schemaVersion: this.SCHEMA_VERSION,
        sourceFingerprint,
        sourceUpdatedAt: new Date().toISOString(),
      })

      // Update compilation count
      await storage.increment(keyFactory.count('marketing', productId))

      console.log(`✅ Marketing compilation completed for product ${productId}`)
      eventBus.publish('compilation:completed', { productId, type: 'marketing' })
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Marketing compilation failed for product ${productId}:`, error)
      eventBus.publish('compilation:failed', { productId, type: 'marketing', error: error instanceof Error ? error.message : 'Unknown error' })
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
      eventBus.publish('compilation:started', { productId, type: 'market-intel' })
      
      const product = await productService.getProductById(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      const legacyProduct = this.convertToLegacyProduct(product)
      const compiledPage = await marketIntelligenceCompiler.compileMarketIntelligencePage(legacyProduct)
      
      const sourceFingerprint = fingerprintObject({
        richContent: legacyProduct.richContent,
      })
      await storage.set(keyFactory.compiled('market-intel', productId), {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'market-intel',
        schemaVersion: this.SCHEMA_VERSION,
        sourceFingerprint,
        sourceUpdatedAt: new Date().toISOString(),
      })

      await storage.increment(keyFactory.count('market-intel', productId))

      console.log(`✅ Market intelligence compilation completed for product ${productId}`)
      eventBus.publish('compilation:completed', { productId, type: 'market-intel' })
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Market intelligence compilation failed for product ${productId}:`, error)
      eventBus.publish('compilation:failed', { productId, type: 'market-intel', error: error instanceof Error ? error.message : 'Unknown error' })
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
      eventBus.publish('compilation:started', { productId, type: 'product-strategy' })
      
      const product = await productService.getProductById(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      const legacyProduct = this.convertToLegacyProduct(product)
      const compiledPage = await productStrategyCompiler.compileProductStrategy(legacyProduct)
      
      const sourceFingerprint = fingerprintObject({
        richContent: legacyProduct.richContent,
      })
      await storage.set(keyFactory.compiled('product-strategy', productId), {
        id: compiledPage.id,
        productId: compiledPage.productId,
        compiledAt: compiledPage.compiledAt,
        content: compiledPage.content,
        rawMarkdown: compiledPage.rawMarkdown,
        type: 'product-strategy',
        schemaVersion: this.SCHEMA_VERSION,
        sourceFingerprint,
        sourceUpdatedAt: new Date().toISOString(),
      })

      await storage.increment(keyFactory.count('product-strategy', productId))

      console.log(`✅ Product strategy compilation completed for product ${productId}`)
      eventBus.publish('compilation:completed', { productId, type: 'product-strategy' })
      
      return {
        success: true,
        compiledPage
      }
    } catch (error) {
      console.error(`❌ Product strategy compilation failed for product ${productId}:`, error)
      eventBus.publish('compilation:failed', { productId, type: 'product-strategy', error: error instanceof Error ? error.message : 'Unknown error' })
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
    const key = keyFactory.compiled(type, productId)
    const data = await storage.get<any>(key)
    if (!data) return null
    try {
      if (typeof data.compiledAt === 'string') {
        data.compiledAt = new Date(data.compiledAt)
      }
    } catch {
      // noop – leave as-is if parsing fails
    }
    return data
  }

  /**
   * Get compilation counts
   */
  async getCompilationCounts(productId: string): Promise<{
    marketing: number
    marketIntel: number
    productStrategy: number
  }> {
    const marketing = (await storage.get<number>(keyFactory.count('marketing', productId))) || 0;
    const marketIntel = (await storage.get<number>(keyFactory.count('market-intel', productId))) || 0;
    const productStrategy = (await storage.get<number>(keyFactory.count('product-strategy', productId))) || 0;

    return { marketing, marketIntel, productStrategy }
  }

  /**
   * Check if compiled content exists
   */
  async hasCompiledContent(productId: string, type: CompilationType): Promise<boolean> {
    const key = keyFactory.compiled(type, productId)
    return await storage.exists(key)
  }

  /**
   * Delete compiled content
   */
  async deleteCompiledContent(productId: string, type: CompilationType): Promise<void> {
    await storage.delete(keyFactory.compiled(type, productId))
    await storage.delete(keyFactory.count(type, productId))
  }

  /** Determine if compiled content is stale compared to current product source */
  async isCompiledStale(productId: string, type: CompilationType): Promise<boolean> {
    const compiled = await this.getCompiledContent(productId, type)
    if (!compiled) return true
    if (compiled.schemaVersion && compiled.schemaVersion !== this.SCHEMA_VERSION) return true

    const product = await productService.getProductById(productId)
    if (!product) return true

    const currentFingerprint = this.computeFingerprintForType(product, type)
    return compiled.sourceFingerprint !== currentFingerprint
  }

  private computeFingerprintForType(product: any, type: CompilationType): string {
    switch (type) {
      case 'marketing':
        return fingerprintObject({
          features: product.features,
          benefits: product.benefits,
          marketing: product.marketing,
        })
      case 'market-intel':
      case 'product-strategy':
        return fingerprintObject({
          richContent: product.richContent,
        })
      default:
        return fingerprintObject(product)
    }
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