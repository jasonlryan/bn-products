import type { StorageService } from './types'
import { LocalStorageService } from './localStorageService'

class DualStorageService implements StorageService {
  private redis: StorageService | null = null
  private localStorage: LocalStorageService
  private redisInitialized: boolean = false

  constructor() {
    this.localStorage = new LocalStorageService()
    // Initialize Redis asynchronously
    this.initRedis()
  }

  private async initRedis() {
    try {
      // Dynamic import to avoid SSR issues
      const { RedisStorageService } = await import('./redisStorageService')
      this.redis = new RedisStorageService()
      this.redisInitialized = true
      console.log('✅ [Storage] Redis initialized successfully')
    } catch (error) {
      console.warn('⚠️ [Storage] Redis not available, using localStorage only:', error)
      this.redis = null
      this.redisInitialized = true
    }
  }

  private async waitForRedisInit(): Promise<void> {
    if (!this.redisInitialized) {
      // Wait for Redis initialization to complete
      await new Promise<void>((resolve) => {
        const checkInit = () => {
          if (this.redisInitialized) {
            resolve()
          } else {
            setTimeout(checkInit, 10)
          }
        }
        checkInit()
      })
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    console.log(`🔍 [Storage] Getting key: ${key}`);
    
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        console.log(`🔍 [Storage] Redis available, trying Redis first...`);
        // Try Redis first - this is the source of truth
        const redisValue = await this.redis.get<T>(key)
        if (redisValue !== null) {
          console.log(`✅ [Storage] Found in Redis: ${key}`);
          // Also sync to localStorage for offline access
          await this.localStorage.set(key, redisValue).catch(console.error)
          return redisValue
        } else {
          console.log(`❌ [Storage] Not found in Redis: ${key}`);
        }
      } else {
        console.log(`⚠️ [Storage] Redis not available, using localStorage only`);
      }

      // Try localStorage as fallback if Redis didn't have the key OR if Redis is not available
      console.log(`🔍 [Storage] Trying localStorage as fallback: ${key}`);
      const localValue = await this.localStorage.get<T>(key)
      if (localValue !== null) {
        console.log(`✅ [Storage] Found in localStorage: ${key}`);
        // Guard against polluting Redis from stale browser data in production
        const allowLocalBackfill =
          typeof window !== 'undefined' && (import.meta as any)?.env?.VITE_ALLOW_LOCAL_TO_REDIS === 'true'
        if (this.redis && allowLocalBackfill) {
          console.log(`🔄 [Storage] Dev backfill: syncing localStorage data to Redis: ${key}`);
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
      // If Redis fails, try localStorage as fallback
      console.log(`🔄 [Storage] Falling back to localStorage due to error: ${key}`);
      return this.localStorage.get<T>(key)
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    console.log(`💾 [Storage] Setting key: ${key}`);
    console.log(`📦 [Storage] Value type: ${typeof value}, size: ${JSON.stringify(value).length} chars`);
    
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        console.log(`💾 [Storage] Redis available, writing to Redis first...`);
        // Write to Redis first (source of truth)
        await this.redis.set(key, value, ttl)
        console.log(`✅ [Storage] Successfully wrote to Redis: ${key}`);
        
        // Also write to localStorage for offline access
        await this.localStorage.set(key, value, ttl).catch(console.error)
        console.log(`✅ [Storage] Also synced to localStorage: ${key}`);
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
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        // Delete from Redis first
        await this.redis.delete(key)
        console.log(`✅ [Storage] Deleted from Redis: ${key}`);
        // Also delete from localStorage
        await this.localStorage.delete(key).catch(console.error)
        console.log(`✅ [Storage] Also deleted from localStorage: ${key}`);
      } else {
        await this.localStorage.delete(key)
        console.log(`✅ [Storage] Deleted from localStorage: ${key}`);
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage delete error for key ${key}:`, error)
      // Ensure localStorage is attempted even if Redis fails
      await this.localStorage.delete(key).catch(console.error)
      if (this.redis) {
        await this.redis.delete(key).catch(console.error)
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        // Check Redis first
        const redisExists = await this.redis.exists(key)
        if (redisExists) {
          console.log(`✅ [Storage] Key exists in Redis: ${key}`);
          return true
        }
        // Only check localStorage if not found in Redis
        const localExists = await this.localStorage.exists(key)
        if (localExists) {
          console.log(`✅ [Storage] Key exists in localStorage: ${key}`);
        }
        return localExists
      } else {
        return this.localStorage.exists(key)
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage exists error for key ${key}:`, error)
      return this.localStorage.exists(key)
    }
  }

  async increment(key: string): Promise<number> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        // Use Redis as primary for atomic operations
        const value = await this.redis.increment(key)
        console.log(`✅ [Storage] Incremented in Redis: ${key} = ${value}`);
        // Update localStorage to match
        await this.localStorage.set(key, value).catch(console.error)
        return value
      } else {
        // Only localStorage available
        const value = await this.localStorage.increment(key)
        console.log(`✅ [Storage] Incremented in localStorage: ${key} = ${value}`);
        return value
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage increment error for key ${key}:`, error)
      // Fall back to localStorage
      return this.localStorage.increment(key)
    }
  }

  async decrement(key: string): Promise<number> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        // Use Redis as primary for atomic operations
        const value = await this.redis.decrement(key)
        console.log(`✅ [Storage] Decremented in Redis: ${key} = ${value}`);
        // Update localStorage to match
        await this.localStorage.set(key, value).catch(console.error)
        return value
      } else {
        // Only localStorage available
        const value = await this.localStorage.decrement(key)
        console.log(`✅ [Storage] Decremented in localStorage: ${key} = ${value}`);
        return value
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage decrement error for key ${key}:`, error)
      // Fall back to localStorage
      return this.localStorage.decrement(key)
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        const redisResults = await this.redis.mget<T>(keys)
        const results: (T | null)[] = []

        for (let i = 0; i < keys.length; i++) {
          if (redisResults[i] !== null) {
            results.push(redisResults[i])
            // Sync to localStorage
            await this.localStorage.set(keys[i], redisResults[i]).catch(console.error)
          } else {
            // Only try localStorage if not found in Redis
            const localValue = await this.localStorage.get<T>(keys[i])
            results.push(localValue)
            if (localValue !== null) {
              // Sync to Redis for future reads
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
      console.error(`❌ [Storage] DualStorage mget error:`, error)
      return this.localStorage.mget<T>(keys)
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        // Write to Redis first
        await this.redis.mset(entries)
        console.log(`✅ [Storage] Successfully wrote ${entries.length} entries to Redis`);
        // Also write to localStorage
        await this.localStorage.mset(entries).catch(console.error)
        console.log(`✅ [Storage] Also synced ${entries.length} entries to localStorage`);
      } else {
        await this.localStorage.mset(entries)
        console.log(`✅ [Storage] Successfully wrote ${entries.length} entries to localStorage`);
      }
    } catch (error) {
      console.error('❌ [Storage] DualStorage mset error:', error)
      // Ensure localStorage is updated
      await this.localStorage.mset(entries)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        const redisKeys = await this.redis.keys(pattern)
        console.log(`✅ [Storage] Found ${redisKeys.length} keys in Redis matching pattern: ${pattern}`);
        return redisKeys
      } else {
        const localKeys = await this.localStorage.keys(pattern)
        console.log(`✅ [Storage] Found ${localKeys.length} keys in localStorage matching pattern: ${pattern}`);
        return localKeys
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage keys error for pattern ${pattern}:`, error)
      return this.localStorage.keys(pattern)
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    // Wait for Redis initialization to complete
    await this.waitForRedisInit()
    
    try {
      if (this.redis) {
        const redisCount = await this.redis.deletePattern(pattern)
        console.log(`✅ [Storage] Deleted ${redisCount} keys from Redis matching pattern: ${pattern}`);
        // Also delete from localStorage
        const localCount = await this.localStorage.deletePattern(pattern).catch(() => 0)
        console.log(`✅ [Storage] Also deleted ${localCount} keys from localStorage matching pattern: ${pattern}`);
        return redisCount
      } else {
        const localCount = await this.localStorage.deletePattern(pattern)
        console.log(`✅ [Storage] Deleted ${localCount} keys from localStorage matching pattern: ${pattern}`);
        return localCount
      }
    } catch (error) {
      console.error(`❌ [Storage] DualStorage deletePattern error for pattern ${pattern}:`, error)
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