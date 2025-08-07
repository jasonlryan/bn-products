export interface FeedbackData {
  id: string;
  page: string;
  productId?: string;
  rating: number;
  comment: string;
  category: 'general' | 'bug' | 'feature' | 'content' | 'ui';
  timestamp: string;
  userAgent?: string;
  url: string;
}

class FeedbackStorage {
  private readonly FEEDBACK_PREFIX = 'bn:feedback';

  async submitFeedback(feedback: Omit<FeedbackData, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const feedbackData: FeedbackData = {
        ...feedback,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      // Try Vercel KV first, fallback to localStorage
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Development: use localStorage
        return this.saveToLocalStorage(feedbackData);
      } else {
        // Production: use Vercel KV
        return await this.saveToVercelKV(feedbackData);
      }
    } catch (error) {
      console.error('❌ [Feedback] Error storing feedback:', error);
      return false;
    }
  }

  private async saveToVercelKV(feedbackData: FeedbackData): Promise<boolean> {
    try {
      const { kv } = await import('@vercel/kv');
      
      // Store in Redis with a unique key
      const key = `${this.FEEDBACK_PREFIX}:${feedbackData.id}`;
      await kv.set(key, feedbackData);

      // Also store in a list for easy retrieval
      const listKey = `${this.FEEDBACK_PREFIX}:list`;
      await kv.lpush(listKey, feedbackData.id);

      // Store by page for page-specific feedback
      const pageKey = `${this.FEEDBACK_PREFIX}:page:${feedbackData.page}`;
      await kv.lpush(pageKey, feedbackData.id);

      // Store by product if applicable
      if (feedbackData.productId) {
        const productKey = `${this.FEEDBACK_PREFIX}:product:${feedbackData.productId}`;
        await kv.lpush(productKey, feedbackData.id);
      }

      console.log(`✅ [Feedback] Stored to Vercel KV: ${feedbackData.id}`);
      return true;
    } catch (error) {
      console.error('❌ [Feedback] Vercel KV error, falling back to localStorage:', error);
      return this.saveToLocalStorage(feedbackData);
    }
  }

  private saveToLocalStorage(feedbackData: FeedbackData): boolean {
    try {
      // Get existing feedback
      const existingFeedback = this.getFromLocalStorage();
      existingFeedback.push(feedbackData);
      
      // Save back to localStorage
      localStorage.setItem('bn_feedback', JSON.stringify(existingFeedback));
      
      console.log(`✅ [Feedback] Stored to localStorage: ${feedbackData.id}`);
      return true;
    } catch (error) {
      console.error('❌ [Feedback] localStorage error:', error);
      return false;
    }
  }

  async getFeedbackByPage(page: string): Promise<FeedbackData[]> {
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Development: use localStorage
        const allFeedback = this.getFromLocalStorage();
        return allFeedback
          .filter(f => f.page === page)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        // Production: use Vercel KV
        return await this.getFromVercelKVByPage(page);
      }
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving feedback:', error);
      return [];
    }
  }

  async getFeedbackByProduct(productId: string): Promise<FeedbackData[]> {
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Development: use localStorage
        const allFeedback = this.getFromLocalStorage();
        return allFeedback
          .filter(f => f.productId === productId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        // Production: use Vercel KV
        return await this.getFromVercelKVByProduct(productId);
      }
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving product feedback:', error);
      return [];
    }
  }

  async getAllFeedback(): Promise<FeedbackData[]> {
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Development: use localStorage
        const allFeedback = this.getFromLocalStorage();
        return allFeedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        // Production: use Vercel KV
        return await this.getFromVercelKV();
      }
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving all feedback:', error);
      return [];
    }
  }

  private async getFromVercelKVByPage(page: string): Promise<FeedbackData[]> {
    try {
      const { kv } = await import('@vercel/kv');
      const pageKey = `${this.FEEDBACK_PREFIX}:page:${page}`;
      const feedbackIds = await kv.lrange(pageKey, 0, -1);
      
      const feedback: FeedbackData[] = [];
      for (const id of feedbackIds) {
        const key = `${this.FEEDBACK_PREFIX}:${id}`;
        const data = await kv.get<FeedbackData>(key);
        if (data) {
          feedback.push(data);
        }
      }

      return feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ [Feedback] Vercel KV error:', error);
      return [];
    }
  }

  private async getFromVercelKVByProduct(productId: string): Promise<FeedbackData[]> {
    try {
      const { kv } = await import('@vercel/kv');
      const productKey = `${this.FEEDBACK_PREFIX}:product:${productId}`;
      const feedbackIds = await kv.lrange(productKey, 0, -1);
      
      const feedback: FeedbackData[] = [];
      for (const id of feedbackIds) {
        const key = `${this.FEEDBACK_PREFIX}:${id}`;
        const data = await kv.get<FeedbackData>(key);
        if (data) {
          feedback.push(data);
        }
      }

      return feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ [Feedback] Vercel KV error:', error);
      return [];
    }
  }

  private async getFromVercelKV(): Promise<FeedbackData[]> {
    try {
      const { kv } = await import('@vercel/kv');
      const listKey = `${this.FEEDBACK_PREFIX}:list`;
      const feedbackIds = await kv.lrange(listKey, 0, -1);
      
      const feedback: FeedbackData[] = [];
      for (const id of feedbackIds) {
        const key = `${this.FEEDBACK_PREFIX}:${id}`;
        const data = await kv.get<FeedbackData>(key);
        if (data) {
          feedback.push(data);
        }
      }

      return feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ [Feedback] Vercel KV error:', error);
      return [];
    }
  }

  private getFromLocalStorage(): FeedbackData[] {
    try {
      const stored = localStorage.getItem('bn_feedback');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ [Feedback] localStorage error:', error);
      return [];
    }
  }

  async getFeedbackStats(): Promise<{
    total: number;
    byPage: Record<string, number>;
    byProduct: Record<string, number>;
    byCategory: Record<string, number>;
    averageRating: number;
  }> {
    try {
      const allFeedback = await this.getAllFeedback();
      
      const byPage: Record<string, number> = {};
      const byProduct: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let totalRating = 0;

      allFeedback.forEach(feedback => {
        // Count by page
        byPage[feedback.page] = (byPage[feedback.page] || 0) + 1;
        
        // Count by product
        if (feedback.productId) {
          byProduct[feedback.productId] = (byProduct[feedback.productId] || 0) + 1;
        }
        
        // Count by category
        byCategory[feedback.category] = (byCategory[feedback.category] || 0) + 1;
        
        // Sum ratings
        totalRating += feedback.rating;
      });

      return {
        total: allFeedback.length,
        byPage,
        byProduct,
        byCategory,
        averageRating: allFeedback.length > 0 ? totalRating / allFeedback.length : 0,
      };
    } catch (error) {
      console.error('❌ [Feedback] Error getting feedback stats:', error);
      return {
        total: 0,
        byPage: {},
        byProduct: {},
        byCategory: {},
        averageRating: 0,
      };
    }
  }

  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const feedbackStorage = new FeedbackStorage(); 