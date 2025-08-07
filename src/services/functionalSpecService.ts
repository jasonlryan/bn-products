import { getStorageService } from './storage/storageService';
import { getProductService } from './storage/productService';
import type { RichContentFile } from './storage/types';

export interface FunctionalSpecData {
  productId: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  lastModified: string;
}

class FunctionalSpecService {
  private storage = getStorageService();
  private productService = getProductService();

  /**
   * Get Functional Spec from Redis, fallback to config files
   */
  async getFunctionalSpec(productId: string): Promise<FunctionalSpecData | null> {
    try {
      // Try Redis first
      const redisKey = `bn:content:${productId}:functional-spec`;
      const redisData = await this.storage.get<RichContentFile>(redisKey);
      
      if (redisData) {
        console.log(`✅ [FunctionalSpec] Found in Redis: ${productId}`);
        return {
          productId,
          title: redisData.title || 'Functional Specification',
          content: redisData.sections?.['Generated Output'] || '',
          metadata: redisData.metadata || {},
          lastModified: redisData.lastModified || new Date().toISOString()
        };
      }

      // Fallback to config files (initial load)
      console.log(`🔄 [FunctionalSpec] Not in Redis, checking config files: ${productId}`);
      const configData = await this.getFromConfig(productId);
      
      if (configData) {
        // Store in Redis for future access
        console.log(`💾 [FunctionalSpec] Storing config data in Redis: ${productId}`);
        await this.saveFunctionalSpec(productId, configData.content, configData.title);
        return configData;
      }

      return null;
    } catch (error) {
      console.error(`❌ [FunctionalSpec] Error getting functional spec for ${productId}:`, error);
      return null;
    }
  }

  /**
   * Save Functional Spec to Redis
   */
  async saveFunctionalSpec(productId: string, content: string, title?: string): Promise<void> {
    try {
      const richContentFile: RichContentFile = {
        title: title || 'Functional Specification',
        metadata: {
          productId,
          contentType: 'functional-spec',
          lastGenerated: new Date().toISOString(),
          promptVersion: '1.0.0'
        },
        sections: {
          'Original Prompt': '',
          'Product Context': '',
          'Generated Output': content,
          'Context Used': ''
        },
        fullContent: content,
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      };

      await this.productService.setContent(productId, 'functional-spec', richContentFile);
      console.log(`✅ [FunctionalSpec] Saved to Redis: ${productId}`);
    } catch (error) {
      console.error(`❌ [FunctionalSpec] Error saving functional spec for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get Functional Spec from config files (fallback)
   */
  private async getFromConfig(productId: string): Promise<FunctionalSpecData | null> {
    try {
      // This would need to be implemented to read from config files
      // For now, return null to indicate no config data
      console.log(`📁 [FunctionalSpec] Checking config files for: ${productId}`);
      return null;
    } catch (error) {
      console.error(`❌ [FunctionalSpec] Error reading from config: ${productId}`, error);
      return null;
    }
  }

  /**
   * Check if Functional Spec exists in Redis
   */
  async hasFunctionalSpec(productId: string): Promise<boolean> {
    const redisKey = `bn:content:${productId}:functional-spec`;
    return await this.storage.exists(redisKey);
  }

  /**
   * Delete Functional Spec from Redis
   */
  async deleteFunctionalSpec(productId: string): Promise<void> {
    try {
      const redisKey = `bn:content:${productId}:functional-spec`;
      await this.storage.delete(redisKey);
      console.log(`🗑️ [FunctionalSpec] Deleted from Redis: ${productId}`);
    } catch (error) {
      console.error(`❌ [FunctionalSpec] Error deleting functional spec for ${productId}:`, error);
      throw error;
    }
  }
}

export const functionalSpecService = new FunctionalSpecService(); 