// In browser/Vite client on Vercel, direct @vercel/kv access is not available.
// We route through an API endpoint when window is present; server code can still import kv.
let kv: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  kv = require('@vercel/kv')?.kv
} catch {
  kv = null
}

async function callApi(body: any) {
  const response = await fetch('/api/storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`Storage API error ${response.status}`)
  }
  return response.json()
}
import type { StorageService } from './types'

export class RedisStorageService implements StorageService {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        const { value } = await callApi({ action: 'get', key })
        return value as T | null
      }
      const value = await kv.get<T>(key)
      return value
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        await callApi({ action: 'set', key, value, ttl })
        return
      }
      if (ttl) await kv.set(key, value, { ex: ttl })
      else await kv.set(key, value)
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        await callApi({ action: 'delete', key })
        return
      }
      await kv.del(key)
    } catch (error) {
      console.error(`Redis delete error for key ${key}:`, error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        const { exists } = await callApi({ action: 'exists', key })
        return !!exists
      }
      const result = await kv.exists(key)
      return result > 0
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error)
      return false
    }
  }

  async increment(key: string): Promise<number> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        const { value } = await callApi({ action: 'increment', key })
        return value as number
      }
      const result = await kv.incr(key)
      return result
    } catch (error) {
      console.error(`Redis increment error for key ${key}:`, error)
      throw error
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        const { value } = await callApi({ action: 'decrement', key })
        return value as number
      }
      const result = await kv.decr(key)
      return result
    } catch (error) {
      console.error(`Redis decrement error for key ${key}:`, error)
      throw error
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return []
      if (typeof window !== 'undefined' || !kv) {
        const { values } = await callApi({ action: 'mget', keys })
        return values as (T | null)[]
      }
      const results = await kv.mget(...keys)
      return results as (T | null)[]
    } catch (error) {
      console.error(`Redis mget error for keys ${keys.join(', ')}:`, error)
      return keys.map(() => null)
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      if (typeof window !== 'undefined' || !kv) {
        await callApi({ action: 'mset', entries })
        return
      }
      const pipeline = kv.pipeline()
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
      if (typeof window !== 'undefined' || !kv) {
        const { keys } = await callApi({ action: 'keys', pattern: redisPattern })
        return keys as string[]
      }
      const keys = await kv.keys(redisPattern)
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
      if (typeof window !== 'undefined' || !kv) {
        const { count } = await callApi({ action: 'deletePattern', pattern })
        return count as number
      }
      await kv.del(...keysToDelete)
      return keysToDelete.length
    } catch (error) {
      console.error(`Redis deletePattern error for pattern ${pattern}:`, error)
      return 0
    }
  }
}