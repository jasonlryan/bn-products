import type { StorageService } from './types'
import { LocalStorageService } from './localStorageService'

class DualStorageService implements StorageService {
  private redis: StorageService | null
  private localStorage: LocalStorageService

  constructor() {
    this.localStorage = new LocalStorageService()
    this.redis = null
    // Initialize Redis asynchronously
    this.initRedis()
  }

  private async initRedis() {
    try {
      // Dynamic import to avoid SSR issues
      const { RedisStorageService } = await import('./redisStorageService')
      this.redis = new RedisStorageService()
      console.log('✅ [Storage] Redis initialized successfully')
    } catch (error) {
      console.warn('⚠️ [Storage] Redis not available, using localStorage only:', error)
      this.redis = null
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    console.log(`🔍 [Storage] Getting key: ${key}`);
    
    try {
      if (this.redis) {
        console.log(`🔍 [Storage] Redis available, trying Redis first...`);
        // Try Redis first
        const redisValue = await this.redis.get(key)
        if (redisValue !== null) {
          console.log(`✅ [Storage] Found in Redis: ${key}`);
          return redisValue
        } else {
          console.log(`❌ [Storage] Not found in Redis: ${key}`);
        }
      } else {
        console.log(`⚠️ [Storage] Redis not available, using localStorage only`);
      }

      // Fall back to localStorage
      console.log(`🔍 [Storage] Trying localStorage: ${key}`);
      const localValue = await this.localStorage.get<T>(key)
      if (localValue !== null) {
        console.log(`✅ [Storage] Found in localStorage: ${key}`);
        if (this.redis) {
          console.log(`🔄 [Storage] Syncing to Redis for future reads: ${key}`);
          // Sync to Redis for future reads
          await this.redis.set(key, localValue).catch(console.error)
        }
        return localValue
      } else {
        console.log(`❌ [Storage] Not found in localStorage: ${key}`);
      }
      
      console.log(`❌ [Storage] Key not found in any storage: ${key}`);
      return null;
    } catch (error) {
      console.error(`❌ [Storage] DualStorage get error for key ${key}:`, error)
      // If Redis fails, try localStorage
      console.log(`🔄 [Storage] Falling back to localStorage due to error: ${key}`);
      return this.localStorage.get<T>(key)
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    console.log(`💾 [Storage] Setting key: ${key}`);
    console.log(`📦 [Storage] Value type: ${typeof value}, size: ${JSON.stringify(value).length} chars`);
    
    try {
      if (this.redis) {
        console.log(`💾 [Storage] Redis available, writing to both storages...`);
        // Write to both storages
        await Promise.all([
          this.redis.set(key, value, ttl),
          this.localStorage.set(key, value, ttl)
        ])
        console.log(`✅ [Storage] Successfully wrote to both Redis and localStorage: ${key}`);
      } else {
        console.log(`💾 [Storage] Redis not available, writing to localStorage only...`);
        // Only localStorage available
        await this.localStorage.set(key, value, ttl)
        console.log(`✅ [Storage] Successfully wrote to localStorage: ${key}`);
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage set error for key ${key}:`, error)
      // If Redis fails, at least ensure localStorage is updated
      console.log(`🔄 [Storage] Falling back to localStorage only due to error: ${key}`);
      await this.localStorage.set(key, value, ttl)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await Promise.all([
          this.redis.delete(key),
          this.localStorage.delete(key)
        ])
      } else {
        await this.localStorage.delete(key)
      }
    } catch (error) {
      console.error(`DualStorage delete error for key ${key}:`, error)
      // Ensure localStorage is attempted even if Redis fails
      await this.localStorage.delete(key).catch(console.error)
      if (this.redis) {
        await this.redis.delete(key).catch(console.error)
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        const [redisExists, localExists] = await Promise.all([
          this.redis.exists(key),
          this.localStorage.exists(key)
        ])
        return redisExists || localExists
      } else {
        return this.localStorage.exists(key)
      }
    } catch (error) {
      console.error(`DualStorage exists error for key ${key}:`, error)
      return this.localStorage.exists(key)
    }
  }

  async increment(key: string): Promise<number> {
    try {
      if (this.redis) {
        // Use Redis as primary for atomic operations
        const value = await this.redis.increment(key)
        // Update localStorage to match
        await this.localStorage.set(key, value).catch(console.error)
        return value
      } else {
        // Only localStorage available
        return this.localStorage.increment(key)
      }
    } catch (error) {
      console.error(`DualStorage increment error for key ${key}:`, error)
      // Fall back to localStorage
      return this.localStorage.increment(key)
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      if (this.redis) {
        // Use Redis as primary for atomic operations
        const value = await this.redis.decrement(key)
        // Update localStorage to match
        await this.localStorage.set(key, value).catch(console.error)
        return value
      } else {
        // Only localStorage available
        return this.localStorage.decrement(key)
      }
    } catch (error) {
      console.error(`DualStorage decrement error for key ${key}:`, error)
      // Fall back to localStorage
      return this.localStorage.decrement(key)
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.redis) {
        const redisResults = await this.redis.mget<T>(keys)
        const results: (T | null)[] = []

        for (let i = 0; i < keys.length; i++) {
          if (redisResults[i] !== null) {
            results.push(redisResults[i])
          } else {
            // Try localStorage for missing values
            const localValue = await this.localStorage.get<T>(keys[i])
            results.push(localValue)
            if (localValue !== null) {
              // Sync to Redis
              await this.redis.set(keys[i], localValue).catch(console.error)
            }
          }
        }

        return results
      } else {
        // Only localStorage available
        return this.localStorage.mget<T>(keys)
      }
    } catch (error) {
      console.error(`DualStorage mget error:`, error)
      return this.localStorage.mget<T>(keys)
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      if (this.redis) {
        await Promise.all([
          this.redis.mset(entries),
          this.localStorage.mset(entries)
        ])
      } else {
        await this.localStorage.mset(entries)
      }
    } catch (error) {
      console.error('DualStorage mset error:', error)
      // Ensure localStorage is updated
      await this.localStorage.mset(entries)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.redis) {
        const [redisKeys, localKeys] = await Promise.all([
          this.redis.keys(pattern),
          this.localStorage.keys(pattern)
        ])
        // Merge and deduplicate
        return Array.from(new Set([...redisKeys, ...localKeys]))
      } else {
        return this.localStorage.keys(pattern)
      }
    } catch (error) {
      console.error(`DualStorage keys error for pattern ${pattern}:`, error)
      return this.localStorage.keys(pattern)
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      if (this.redis) {
        const [redisCount, localCount] = await Promise.all([
          this.redis.deletePattern(pattern),
          this.localStorage.deletePattern(pattern)
        ])
        return Math.max(redisCount, localCount)
      } else {
        return this.localStorage.deletePattern(pattern)
      }
    } catch (error) {
      console.error(`DualStorage deletePattern error for pattern ${pattern}:`, error)
      return this.localStorage.deletePattern(pattern)
    }
  }
}

// Export singleton instance
let storageService: StorageService

export function getStorageService(): StorageService {
  if (!storageService) {
    // Always use DualStorageService for proper Redis/localStorage handling
    storageService = new DualStorageService()
  }
  
  return storageService
}