import { getStorageService } from './storageService';
import type { Product, RichContentFile } from '../../types/product';
import { getAllProducts, getAllServices, getProductById } from '../../config';

class ProductService {
  private storage = getStorageService();
  private readonly PRODUCT_PREFIX = 'bn:product';
  private readonly PRODUCTS_LIST_KEY = 'bn:products:list';
  private readonly SERVICES_LIST_KEY = 'bn:services:list';

  /**
   * Sync all product configuration data to Redis
   */
  async syncConfigToRedis(): Promise<void> {
    console.log('🔄 [ProductService] Syncing config data to Redis...');
    
    try {
      // Get all products and services from config
      const allProducts = getAllProducts();
      const allServices = getAllServices();
      
      // Store each product/service in Redis
      const productPromises = allProducts.map(product => 
        this.storage.set(`${this.PRODUCT_PREFIX}:${product.id}`, product)
      );
      
      const servicePromises = allServices.map(service => 
        this.storage.set(`${this.PRODUCT_PREFIX}:${service.id}`, service)
      );
      
      // Store product and service lists
      const productIds = allProducts.map(p => p.id);
      const serviceIds = allServices.map(s => s.id);
      
      await Promise.all([
        ...productPromises,
        ...servicePromises,
        this.storage.set(this.PRODUCTS_LIST_KEY, productIds),
        this.storage.set(this.SERVICES_LIST_KEY, serviceIds)
      ]);
      
      console.log(`✅ [ProductService] Synced ${allProducts.length} products and ${allServices.length} services to Redis`);
    } catch (error) {
      console.error('❌ [ProductService] Error syncing config to Redis:', error);
      throw error;
    }
  }

  /**
   * Get all products from Redis (with fallback to config)
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      // Try to get from Redis first
      const productIds = await this.storage.get<string[]>(this.PRODUCTS_LIST_KEY);
      
      if (productIds && productIds.length > 0) {
        console.log(`🔍 [ProductService] Found ${productIds.length} products in Redis`);
        const products = await Promise.all(
          productIds.map(id => this.storage.get<Product>(`${this.PRODUCT_PREFIX}:${id}`))
        );
        const validProducts = products.filter(p => p !== null) as Product[];
        console.log(`✅ [ProductService] Retrieved ${validProducts.length} products from Redis`);
        return validProducts;
      } else {
        console.log('⚠️ [ProductService] No products found in Redis, syncing from config...');
        await this.syncConfigToRedis();
        // After sync, get the data directly from config to avoid recursion
        const configProducts = getAllProducts();
        console.log(`✅ [ProductService] Synced and returning ${configProducts.length} products from config`);
        return configProducts;
      }
    } catch (error) {
      console.error('❌ [ProductService] Error getting products from Redis, falling back to config:', error);
      return getAllProducts();
    }
  }

  /**
   * Get all services from Redis (with fallback to config)
   */
  async getAllServices(): Promise<Product[]> {
    try {
      // Try to get from Redis first
      const serviceIds = await this.storage.get<string[]>(this.SERVICES_LIST_KEY);
      
      if (serviceIds && serviceIds.length > 0) {
        console.log(`🔍 [ProductService] Found ${serviceIds.length} services in Redis`);
        const services = await Promise.all(
          serviceIds.map(id => this.storage.get<Product>(`${this.PRODUCT_PREFIX}:${id}`))
        );
        const validServices = services.filter(s => s !== null) as Product[];
        console.log(`✅ [ProductService] Retrieved ${validServices.length} services from Redis`);
        return validServices;
      } else {
        console.log('⚠️ [ProductService] No services found in Redis, syncing from config...');
        await this.syncConfigToRedis();
        // After sync, get the data directly from config to avoid recursion
        const configServices = getAllServices();
        console.log(`✅ [ProductService] Synced and returning ${configServices.length} services from config`);
        return configServices;
      }
    } catch (error) {
      console.error('❌ [ProductService] Error getting services from Redis, falling back to config:', error);
      return getAllServices();
    }
  }

  /**
   * Get a specific product by ID from Redis (with fallback to config)
   */
  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const product = await this.storage.get<Product>(`${this.PRODUCT_PREFIX}:${id}`);
      if (product) {
        console.log(`✅ [ProductService] Retrieved product ${id} from Redis`);
        return product;
      } else {
        console.log(`⚠️ [ProductService] Product ${id} not found in Redis, getting from config...`);
        const configProduct = getProductById(id);
        if (configProduct) {
          // Sync this product to Redis for future access
          await this.storage.set(`${this.PRODUCT_PREFIX}:${id}`, configProduct);
          console.log(`✅ [ProductService] Synced product ${id} to Redis`);
        }
        return configProduct;
      }
    } catch (error) {
      console.error(`❌ [ProductService] Error getting product ${id} from Redis, falling back to config:`, error);
      return getProductById(id);
    }
  }

  /**
   * Update a product in Redis
   */
  async updateProduct(product: Product): Promise<void> {
    try {
      await this.storage.set(`${this.PRODUCT_PREFIX}:${product.id}`, product);
      console.log(`✅ [ProductService] Updated product ${product.id} in Redis`);
    } catch (error) {
      console.error(`❌ [ProductService] Error updating product ${product.id} in Redis:`, error);
      throw error;
    }
  }

  /**
   * Delete a product from Redis
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await this.storage.delete(`${this.PRODUCT_PREFIX}:${id}`);
      console.log(`✅ [ProductService] Deleted product ${id} from Redis`);
    } catch (error) {
      console.error(`❌ [ProductService] Error deleting product ${id} from Redis:`, error);
      throw error;
    }
  }

  /**
   * Get content for a specific product and content type
   */
  async getContent(productId: string, contentType: string): Promise<RichContentFile | null> {
    const key = `bn:content:${productId}:${contentType}`;
    return this.storage.get<RichContentFile>(key);
  }

  /**
   * Set content for a specific product and content type
   */
  async setContent(productId: string, contentType: string, content: RichContentFile): Promise<void> {
    const key = `bn:content:${productId}:${contentType}`;
    await this.storage.set(key, content);
  }
}

export const productService = new ProductService();