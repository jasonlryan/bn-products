import { getStorageService } from './storage/storageService';

export interface CompilationJob {
  id: string;
  productId: string;
  type: 'marketing' | 'market-intel' | 'product-strategy';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  progress?: number; // 0-100
  retryCount: number;
  maxRetries: number;
}

export interface QueueStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageProcessingTime: number;
}

export interface BatchCompilationRequest {
  productIds: string[];
  types: ('marketing' | 'market-intel' | 'product-strategy')[];
  priority?: 'low' | 'normal' | 'high';
  maxConcurrent?: number;
}

class CompilationQueueService {
  private storage = getStorageService();
  private isProcessing = false;
  private maxConcurrentJobs = 2;
  private processingJobs = new Set<string>();

  /**
   * Add jobs to the compilation queue
   */
  async addToQueue(request: BatchCompilationRequest): Promise<CompilationJob[]> {
    const jobs: CompilationJob[] = [];
    const timestamp = new Date().toISOString();

    for (const productId of request.productIds) {
      for (const type of request.types) {
        const job: CompilationJob = {
          id: `${productId}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          type,
          status: 'queued',
          priority: request.priority || 'normal',
          createdAt: timestamp,
          retryCount: 0,
          maxRetries: 3
        };

        jobs.push(job);
      }
    }

    // Save jobs to queue
    const existingQueue = await this.getQueue();
    const updatedQueue = [...existingQueue, ...jobs];
    await this.storage.set('bn:compilation:queue', updatedQueue);

    console.log(`📋 [Queue] Added ${jobs.length} jobs to queue`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return jobs;
  }

  /**
   * Get all jobs in the queue
   */
  async getQueue(): Promise<CompilationJob[]> {
    return await this.storage.get<CompilationJob[]>('bn:compilation:queue') || [];
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const queue = await this.getQueue();
    const completedJobs = await this.getCompletedJobs();
    
    const stats: QueueStats = {
      total: queue.length + completedJobs.length,
      queued: queue.filter(job => job.status === 'queued').length,
      processing: queue.filter(job => job.status === 'processing').length,
      completed: completedJobs.filter(job => job.status === 'completed').length,
      failed: completedJobs.filter(job => job.status === 'failed').length,
      cancelled: completedJobs.filter(job => job.status === 'cancelled').length,
      averageProcessingTime: this.calculateAverageProcessingTime(completedJobs)
    };

    return stats;
  }

  /**
   * Get completed jobs (moved to history)
   */
  async getCompletedJobs(): Promise<CompilationJob[]> {
    return await this.storage.get<CompilationJob[]>('bn:compilation:history') || [];
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 [Queue] Starting queue processing`);

    try {
      while (true) {
        const queue = await this.getQueue();
        const availableSlots = this.maxConcurrentJobs - this.processingJobs.size;
        
        if (availableSlots <= 0) {
          await this.delay(1000);
          continue;
        }

        // Get next jobs to process
        const nextJobs = queue
          .filter(job => job.status === 'queued')
          .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
          .slice(0, availableSlots);

        if (nextJobs.length === 0) {
          // No more jobs to process
          break;
        }

        // Process jobs concurrently
        const processingPromises = nextJobs.map(job => this.processJob(job));
        await Promise.allSettled(processingPromises);
      }
    } catch (error) {
      console.error(`❌ [Queue] Queue processing error:`, error);
    } finally {
      this.isProcessing = false;
      console.log(`✅ [Queue] Queue processing completed`);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: CompilationJob): Promise<void> {
    this.processingJobs.add(job.id);
    
    try {
      // Update job status to processing
      await this.updateJobStatus(job.id, 'processing', { startedAt: new Date().toISOString() });
      
      console.log(`⚡ [Queue] Processing job: ${job.id} (${job.type} for ${job.productId})`);

      // Import compilation service dynamically to avoid circular dependencies
      const { compilationService } = await import('./compilationService');
      
      // Execute compilation
      const result = await compilationService.compileByType(job.productId, job.type);
      
      if (result.success) {
        await this.updateJobStatus(job.id, 'completed', { 
          completedAt: new Date().toISOString(),
          progress: 100
        });
        console.log(`✅ [Queue] Job completed: ${job.id}`);
      } else {
        throw new Error(result.error || 'Compilation failed');
      }

    } catch (error) {
      console.error(`❌ [Queue] Job failed: ${job.id}`, error);
      
      const retryCount = job.retryCount + 1;
      if (retryCount < job.maxRetries) {
        // Retry the job
        await this.updateJobStatus(job.id, 'queued', { 
          retryCount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`🔄 [Queue] Retrying job: ${job.id} (attempt ${retryCount + 1})`);
      } else {
        // Mark as failed after max retries
        await this.updateJobStatus(job.id, 'failed', { 
          completedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount
        });
        console.log(`💀 [Queue] Job failed permanently: ${job.id}`);
      }
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: CompilationJob['status'], updates: Partial<CompilationJob> = {}): Promise<void> {
    const queue = await this.getQueue();
    const jobIndex = queue.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
      console.warn(`⚠️ [Queue] Job not found: ${jobId}`);
      return;
    }

    const updatedJob = { ...queue[jobIndex], status, ...updates };
    queue[jobIndex] = updatedJob;

    // Move completed jobs to history
    if (['completed', 'failed', 'cancelled'].includes(status)) {
      const history = await this.getCompletedJobs();
      history.push(updatedJob);
      await this.storage.set('bn:compilation:history', history);
      
      // Remove from active queue
      queue.splice(jobIndex, 1);
    }

    await this.storage.set('bn:compilation:queue', queue);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const queue = await this.getQueue();
    const job = queue.find(job => job.id === jobId);
    
    if (!job) {
      return false;
    }

    if (job.status === 'processing') {
      // Job is currently processing, can't cancel
      return false;
    }

    await this.updateJobStatus(jobId, 'cancelled', { completedAt: new Date().toISOString() });
    return true;
  }

  /**
   * Cancel all jobs
   */
  async cancelAllJobs(): Promise<number> {
    const queue = await this.getQueue();
    const cancellableJobs = queue.filter(job => job.status === 'queued');
    
    for (const job of cancellableJobs) {
      await this.cancelJob(job.id);
    }

    return cancellableJobs.length;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const history = await this.getCompletedJobs();
    const failedJob = history.find(job => job.id === jobId && job.status === 'failed');
    
    if (!failedJob) {
      return false;
    }

    // Create new job with reset retry count
    const newJob: CompilationJob = {
      ...failedJob,
      id: `${failedJob.productId}_${failedJob.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'queued',
      createdAt: new Date().toISOString(),
      retryCount: 0,
      startedAt: undefined,
      completedAt: undefined,
      error: undefined,
      progress: undefined
    };

    const queue = await this.getQueue();
    queue.push(newJob);
    await this.storage.set('bn:compilation:queue', queue);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return true;
  }

  /**
   * Clear completed jobs from history
   */
  async clearHistory(olderThanDays: number = 30): Promise<number> {
    const history = await this.getCompletedJobs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const filteredHistory = history.filter(job => {
      const jobDate = new Date(job.completedAt || job.createdAt);
      return jobDate > cutoffDate;
    });

    const removedCount = history.length - filteredHistory.length;
    await this.storage.set('bn:compilation:history', filteredHistory);
    
    return removedCount;
  }

  /**
   * Get priority score for sorting
   */
  private getPriorityScore(priority: CompilationJob['priority']): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(jobs: CompilationJob[]): number {
    const completedJobs = jobs.filter(job => 
      job.status === 'completed' && job.startedAt && job.completedAt
    );

    if (completedJobs.length === 0) {
      return 0;
    }

    const totalTime = completedJobs.reduce((sum, job) => {
      const start = new Date(job.startedAt!).getTime();
      const end = new Date(job.completedAt!).getTime();
      return sum + (end - start);
    }, 0);

    return totalTime / completedJobs.length;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const compilationQueue = new CompilationQueueService(); 