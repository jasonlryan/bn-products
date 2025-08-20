export interface FeedbackData {
  id: string;
  page: string;
  productId?: string;
  rating?: number;
  comment: string;
  category: 'general' | 'bug' | 'feature' | 'content' | 'ui';
  timestamp: string;
  userAgent?: string;
  url: string;
}

import { getStorageService } from './storage/storageService';

class FeedbackStorage {
  private readonly FEEDBACK_PREFIX = 'bn:feedback';
  private storage = getStorageService();

  async submitFeedback(feedback: Omit<FeedbackData, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const feedbackData: FeedbackData = {
        ...feedback,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      // Store primary record
      const key = `${this.FEEDBACK_PREFIX}:${feedbackData.id}`;
      await this.storage.set(key, feedbackData);

      // Maintain simple index arrays (no server-side lists needed)
      await this.appendId(`${this.FEEDBACK_PREFIX}:list`, feedbackData.id);
      await this.appendId(`${this.FEEDBACK_PREFIX}:page:${feedbackData.page}`, feedbackData.id);
      if (feedbackData.productId) {
        await this.appendId(`${this.FEEDBACK_PREFIX}:product:${feedbackData.productId}`, feedbackData.id);
      }

      return true;
    } catch (error) {
      console.error('❌ [Feedback] Error storing feedback:', error);
      return false;
    }
  }

  private async appendId(listKey: string, id: string): Promise<void> {
    const existing = (await this.storage.get<string[]>(listKey)) || [];
    existing.push(id);
    await this.storage.set(listKey, existing);
  }

  async getFeedbackByPage(page: string): Promise<FeedbackData[]> {
    try {
      const ids = (await this.storage.get<string[]>(`${this.FEEDBACK_PREFIX}:page:${page}`)) || [];
      return await this.fetchByIds(ids);
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving feedback by page:', error);
      return [];
    }
  }

  async getFeedbackByProduct(productId: string): Promise<FeedbackData[]> {
    try {
      const ids = (await this.storage.get<string[]>(`${this.FEEDBACK_PREFIX}:product:${productId}`)) || [];
      return await this.fetchByIds(ids);
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving product feedback:', error);
      return [];
    }
  }

  async getAllFeedback(): Promise<FeedbackData[]> {
    try {
      const ids = (await this.storage.get<string[]>(`${this.FEEDBACK_PREFIX}:list`)) || [];
      return await this.fetchByIds(ids);
    } catch (error) {
      console.error('❌ [Feedback] Error retrieving all feedback:', error);
      return [];
    }
  }

  private async fetchByIds(ids: string[]): Promise<FeedbackData[]> {
    if (!ids.length) return [];
    const keys = ids.map(id => `${this.FEEDBACK_PREFIX}:${id}`);
    const results = await this.storage.mget<FeedbackData>(keys);
    const items = results.filter((x): x is FeedbackData => !!x);
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
      allFeedback.forEach(f => {
        byPage[f.page] = (byPage[f.page] || 0) + 1;
        if (f.productId) byProduct[f.productId] = (byProduct[f.productId] || 0) + 1;
        byCategory[f.category] = (byCategory[f.category] || 0) + 1;
        if (f.rating) totalRating += f.rating;
      });
      return {
        total: allFeedback.length,
        byPage,
        byProduct,
        byCategory,
        averageRating: allFeedback.filter(f => f.rating).length ? totalRating / allFeedback.filter(f => f.rating).length : 0,
      };
    } catch (error) {
      console.error('❌ [Feedback] Error getting feedback stats:', error);
      return { total: 0, byPage: {}, byProduct: {}, byCategory: {}, averageRating: 0 };
    }
  }

  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const feedbackStorage = new FeedbackStorage();