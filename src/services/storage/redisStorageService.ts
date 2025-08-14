import type { StorageService } from './types'

// In browser/Vite client on Vercel, direct @vercel/kv access is not available.
// We route through an API endpoint when window is present; server code can still import kv.
let kv: any = null

// Lazy-load kv when needed on server-side
async function getKv() {
  if (kv !== null || typeof window !== 'undefined') {
    return kv
  }
  
  try {
    // Dynamic import for server-side only
    const kvModule = await import('@vercel/kv')
    kv = kvModule.kv
    return kv
  } catch {
    kv = null
    return null
  }
}

const API_BASE = (typeof window !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL)
  ? (import.meta as any).env.VITE_API_BASE_URL
  : ''

async function callApi(body: any) {
  const url = `${API_BASE}/api/storage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`Storage API error ${response.status}`)
  }
  return response.json()
}

export class RedisStorageService implements StorageService {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        // In browser, try API call but handle development gracefully
        try {
          const { value } = await callApi({ action: 'get', key })
          return value as T | null
        } catch (apiError) {
          console.warn(`Redis API call failed for key ${key}:`, (apiError as Error).message)
          // In development, API might not be available - this is expected
          return null
        }
      }
      const value = await kvInstance.get<T>(key)
      return value
    } catch (error) {
      console.warn(`Redis get error for key ${key}:`, (error as Error).message)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        // In browser, try API call but handle development gracefully
        try {
          await callApi({ action: 'set', key, value, ttl })
          return
        } catch (apiError) {
          console.warn(`Redis API call failed for key ${key}:`, (apiError as Error).message)
          // In development, API might not be available - this is expected, just fail silently
          throw apiError
        }
      }
      if (ttl) await kvInstance.set(key, value, { ex: ttl })
      else await kvInstance.set(key, value)
    } catch (error) {
      console.warn(`Redis set error for key ${key}:`, (error as Error).message)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        await callApi({ action: 'delete', key })
        return
      }
      await kvInstance.del(key)
    } catch (error) {
      console.error(`Redis delete error for key ${key}:`, error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { exists } = await callApi({ action: 'exists', key })
        return !!exists
      }
      const result = await kvInstance.exists(key)
      return result > 0
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error)
      return false
    }
  }

  async increment(key: string): Promise<number> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { value } = await callApi({ action: 'increment', key })
        return value as number
      }
      const result = await kvInstance.incr(key)
      return result
    } catch (error) {
      console.error(`Redis increment error for key ${key}:`, error)
      throw error
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { value } = await callApi({ action: 'decrement', key })
        return value as number
      }
      const result = await kvInstance.decr(key)
      return result
    } catch (error) {
      console.error(`Redis decrement error for key ${key}:`, error)
      throw error
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return []
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { values } = await callApi({ action: 'mget', keys })
        return values as (T | null)[]
      }
      const results = await kvInstance.mget(...keys)
      return results as (T | null)[]
    } catch (error) {
      console.error(`Redis mget error for keys ${keys.join(', ')}:`, error)
      return keys.map(() => null)
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        await callApi({ action: 'mset', entries })
        return
      }
      const pipeline = kvInstance.pipeline()
      for (const entry of entries) {
        if (entry.ttl) pipeline.set(entry.key, entry.value, { ex: entry.ttl })
        else pipeline.set(entry.key, entry.value)
      }
      await pipeline.exec()
    } catch (error) {
      console.error('Redis mset error:', error)
      throw error
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      // Convert simple patterns to Redis patterns
      const redisPattern = pattern.replace(/\*/g, '*')
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { keys } = await callApi({ action: 'keys', pattern: redisPattern })
        return keys as string[]
      }
      const keys = await kvInstance.keys(redisPattern)
      return keys
    } catch (error) {
      console.error(`Redis keys error for pattern ${pattern}:`, error)
      return []
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keysToDelete = await this.keys(pattern)
      if (keysToDelete.length === 0) return 0
      const kvInstance = await getKv()
      if (typeof window !== 'undefined' || !kvInstance) {
        const { count } = await callApi({ action: 'deletePattern', pattern })
        return count as number
      }
      await kvInstance.del(...keysToDelete)
      return keysToDelete.length
    } catch (error) {
      console.error(`Redis deletePattern error for pattern ${pattern}:`, error)
      return 0
    }
  }
}