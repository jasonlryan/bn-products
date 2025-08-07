import type { StorageService } from './types'

export class LocalStorageService implements StorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isClient()) return null
    
    try {
      const value = window.localStorage.getItem(key)
      if (value === null) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`LocalStorage get error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isClient()) return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      
      // Handle TTL with a separate expiry key
      if (ttl) {
        const expiryKey = `${key}:expiry`
        const expiryTime = Date.now() + (ttl * 1000)
        window.localStorage.setItem(expiryKey, expiryTime.toString())
      }
    } catch (error) {
      console.error(`LocalStorage set error for key ${key}:`, error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isClient()) return
    
    try {
      window.localStorage.removeItem(key)
      window.localStorage.removeItem(`${key}:expiry`)
    } catch (error) {
      console.error(`LocalStorage delete error for key ${key}:`, error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isClient()) return false
    
    try {
      // Check if key exists and hasn't expired
      const exists = window.localStorage.getItem(key) !== null
      
      if (exists) {
        const expiryKey = `${key}:expiry`
        const expiryValue = window.localStorage.getItem(expiryKey)
        
        if (expiryValue) {
          const expiryTime = parseInt(expiryValue)
          if (Date.now() > expiryTime) {
            // Key has expired, remove it
            await this.delete(key)
            return false
          }
        }
      }
      
      return exists
    } catch (error) {
      console.error(`LocalStorage exists error for key ${key}:`, error)
      return false
    }
  }

  async increment(key: string): Promise<number> {
    if (!this.isClient()) return 0
    
    try {
      const current = await this.get<number>(key) || 0
      const newValue = current + 1
      await this.set(key, newValue)
      return newValue
    } catch (error) {
      console.error(`LocalStorage increment error for key ${key}:`, error)
      throw error
    }
  }

  async decrement(key: string): Promise<number> {
    if (!this.isClient()) return 0
    
    try {
      const current = await this.get<number>(key) || 0
      const newValue = current - 1
      await this.set(key, newValue)
      return newValue
    } catch (error) {
      console.error(`LocalStorage decrement error for key ${key}:`, error)
      throw error
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isClient()) return keys.map(() => null)
    
    try {
      return Promise.all(keys.map(key => this.get<T>(key)))
    } catch (error) {
      console.error(`LocalStorage mget error for keys ${keys.join(', ')}:`, error)
      return keys.map(() => null)
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    if (!this.isClient()) return
    
    try {
      for (const entry of entries) {
        await this.set(entry.key, entry.value, entry.ttl)
      }
    } catch (error) {
      console.error('LocalStorage mset error:', error)
      throw error
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isClient()) return []
    
    try {
      const allKeys = Object.keys(window.localStorage)
      
      // Convert pattern to regex
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      
      // Filter keys by pattern and check expiry
      const matchingKeys: string[] = []
      
      for (const key of allKeys) {
        // Skip expiry keys
        if (key.endsWith(':expiry')) continue
        
        if (regex.test(key)) {
          // Check if key has expired
          if (await this.exists(key)) {
            matchingKeys.push(key)
          }
        }
      }
      
      return matchingKeys
    } catch (error) {
      console.error(`LocalStorage keys error for pattern ${pattern}:`, error)
      return []
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.isClient()) return 0
    
    try {
      const keysToDelete = await this.keys(pattern)
      
      for (const key of keysToDelete) {
        await this.delete(key)
      }
      
      return keysToDelete.length
    } catch (error) {
      console.error(`LocalStorage deletePattern error for pattern ${pattern}:`, error)
      return 0
    }
  }
}