import { getStorageService } from './storageService'
import type { ProductDefinition, RichContentFile } from './types'

export class ProductService {
  private storage = getStorageService()

  async createProduct(product: Omit<ProductDefinition, 'id' | 'metadata'>): Promise<string> {
    // Generate product ID from name
    const productId = this.generateProductId(product.name)
    
    // Create full product definition
    const fullProduct: ProductDefinition = {
      ...product,
      id: productId,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    // Save product definition
    await this.storage.set(`bn:product:definition:${productId}`, fullProduct)
    
    // Update product list
    const productList = await this.listProductIds()
    if (!productList.includes(productId)) {
      productList.push(productId)
      await this.storage.set('bn:product:list', productList)
    }

    return productId
  }

  async getProduct(id: string): Promise<ProductDefinition | null> {
    return this.storage.get<ProductDefinition>(`bn:product:definition:${id}`)
  }

  async updateProduct(id: string, updates: Partial<ProductDefinition>): Promise<void> {
    const existing = await this.getProduct(id)
    if (!existing) {
      throw new Error(`Product ${id} not found`)
    }

    const updated: ProductDefinition = {
      ...existing,
      ...updates,
      id: existing.id, // Ensure ID cannot be changed
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString()
      }
    }

    await this.storage.set(`bn:product:definition:${id}`, updated)
  }

  async deleteProduct(id: string): Promise<void> {
    // Delete product definition
    await this.storage.delete(`bn:product:definition:${id}`)
    
    // Delete all content
    const contentTypes = [
      'manifesto', 'functional-spec', 'audience-icps', 'user-stories',
      'competitor-analysis', 'market-sizing', 'prd-skeleton', 'ui-prompt',
      'screen-generation', 'landing-page-copy', 'key-messages',
      'investor-deck', 'demo-script', 'slide-headlines', 'qa-prep'
    ]
    
    for (const type of contentTypes) {
      await this.storage.delete(`bn:content:${id}:${type}`)
    }
    
    // Delete compiled content
    await this.storage.delete(`bn:compiled:marketing:${id}`)
    await this.storage.delete(`bn:compiled:market-intel:${id}`)
    await this.storage.delete(`bn:compiled:product-strategy:${id}`)
    
    // Delete counts
    await this.storage.delete(`bn:count:marketing:${id}`)
    await this.storage.delete(`bn:count:market-intel:${id}`)
    await this.storage.delete(`bn:count:product-strategy:${id}`)
    
    // Update product list
    const productList = await this.listProductIds()
    const index = productList.indexOf(id)
    if (index > -1) {
      productList.splice(index, 1)
      await this.storage.set('bn:product:list', productList)
    }
  }

  async listProducts(): Promise<ProductDefinition[]> {
    const ids = await this.listProductIds()
    const products = await Promise.all(
      ids.map(id => this.getProduct(id))
    )
    return products.filter((p): p is ProductDefinition => p !== null)
  }

  async listProductIds(): Promise<string[]> {
    const list = await this.storage.get<string[]>('bn:product:list')
    return list || []
  }

  // Content management
  async getContent(productId: string, type: string): Promise<RichContentFile | null> {
    return this.storage.get<RichContentFile>(`bn:content:${productId}:${type}`)
  }

  async setContent(productId: string, type: string, content: RichContentFile): Promise<void> {
    // Ensure product exists
    const product = await this.getProduct(productId)
    if (!product) {
      throw new Error(`Product ${productId} not found`)
    }

    // Save content with updated metadata
    const updatedContent: RichContentFile = {
      ...content,
      metadata: {
        ...content.metadata,
        productId,
        contentType: type,
        lastGenerated: content.metadata.lastGenerated || new Date().toISOString()
      },
      lastModified: new Date().toISOString(),
      version: content.version || '1.0.0'
    }

    await this.storage.set(`bn:content:${productId}:${type}`, updatedContent)
  }

  async getAllContent(productId: string): Promise<Record<string, RichContentFile>> {
    const contentTypes = [
      'manifesto', 'functional-spec', 'audience-icps', 'user-stories',
      'competitor-analysis', 'market-sizing', 'prd-skeleton', 'ui-prompt',
      'screen-generation', 'landing-page-copy', 'key-messages',
      'investor-deck', 'demo-script', 'slide-headlines', 'qa-prep'
    ]

    const content: Record<string, RichContentFile> = {}
    
    for (const type of contentTypes) {
      const file = await this.getContent(productId, type)
      if (file) {
        content[type] = file
      }
    }

    return content
  }

  async cloneProduct(sourceId: string, newName: string): Promise<string> {
    const source = await this.getProduct(sourceId)
    if (!source) {
      throw new Error(`Source product ${sourceId} not found`)
    }

    // Create new product with updated name
    const newProductId = await this.createProduct({
      ...source,
      name: newName
    })

    // Clone all content
    const content = await this.getAllContent(sourceId)
    for (const [type, file] of Object.entries(content)) {
      await this.setContent(newProductId, type, {
        ...file,
        metadata: {
          ...file.metadata,
          productId: newProductId
        }
      })
    }

    // Clone compiled content if exists
    const compiledMarketing = await this.storage.get(`bn:compiled:marketing:${sourceId}`)
    if (compiledMarketing) {
      await this.storage.set(`bn:compiled:marketing:${newProductId}`, compiledMarketing)
    }

    const compiledMarketIntel = await this.storage.get(`bn:compiled:market-intel:${sourceId}`)
    if (compiledMarketIntel) {
      await this.storage.set(`bn:compiled:market-intel:${newProductId}`, compiledMarketIntel)
    }

    const compiledProductStrategy = await this.storage.get(`bn:compiled:product-strategy:${sourceId}`)
    if (compiledProductStrategy) {
      await this.storage.set(`bn:compiled:product-strategy:${newProductId}`, compiledProductStrategy)
    }

    return newProductId
  }

  private generateProductId(name: string): string {
    // Generate ID from name (e.g., "AI Power Hour" -> "ai_power_hour")
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    
    // Add a numeric prefix for sorting
    const timestamp = Date.now()
    const prefix = String(timestamp).slice(-2).padStart(2, '0')
    
    return `${prefix}_${baseId}`
  }
}

// Export singleton instance
let productService: ProductService

export function getProductService(): ProductService {
  if (!productService) {
    productService = new ProductService()
  }
  return productService
}