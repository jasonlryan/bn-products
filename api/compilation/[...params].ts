import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

// Import compilation service types
type CompilationType = 'marketing' | 'market-intel' | 'product-strategy'

// Storage service using Vercel KV
const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get(key)
      return value as T | null
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error)
      return null
    }
  },

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await kv.set(key, value, { ex: ttl })
      } else {
        await kv.set(key, value)
      }
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error)
      throw error
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      return (await kv.exists(key)) > 0
    } catch (error) {
      console.error(`Storage exists error for key ${key}:`, error)
      return false
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await kv.del(key)
    } catch (error) {
      console.error(`Storage delete error for key ${key}:`, error)
      throw error
    }
  },

  async increment(key: string): Promise<number> {
    try {
      return await kv.incr(key)
    } catch (error) {
      console.error(`Storage increment error for key ${key}:`, error)
      throw error
    }
  }
}

// Key factory matching the one in utils/keyFactory.ts
const keyFactory = {
  compiled: (type: CompilationType, productId: string) => `compiled:${type}:${productId}`,
  count: (type: CompilationType, productId: string) => `count:${type}:${productId}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { method, query } = req
    const params = query.params as string[] || []
    
    // Handle different API routes
    if (params[0] === 'status') {
      // GET /api/compilation/status?productId=X
      if (method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
      }

      const productId = query.productId as string
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' })
      }

      // Get compilation counts and status
      const [marketingCount, marketIntelCount, productStrategyCount] = await Promise.all([
        storage.get<number>(keyFactory.count('marketing', productId)),
        storage.get<number>(keyFactory.count('market-intel', productId)),
        storage.get<number>(keyFactory.count('product-strategy', productId))
      ])

      const [hasMarketing, hasMarketIntel, hasProductStrategy] = await Promise.all([
        storage.exists(keyFactory.compiled('marketing', productId)),
        storage.exists(keyFactory.compiled('market-intel', productId)),
        storage.exists(keyFactory.compiled('product-strategy', productId))
      ])

      return res.json({
        counts: {
          marketing: marketingCount || 0,
          marketIntel: marketIntelCount || 0,
          productStrategy: productStrategyCount || 0
        },
        hasCompiled: {
          marketing: hasMarketing,
          marketIntel: hasMarketIntel,
          productStrategy: hasProductStrategy
        }
      })
    }

    // Handle specific compilation types
    const type = params[0] as CompilationType
    if (!type || !['marketing', 'market-intel', 'product-strategy'].includes(type)) {
      return res.status(400).json({ error: 'Invalid compilation type' })
    }

    const productId = query.productId as string

    if (method === 'GET') {
      // GET /api/compilation/{type}?productId=X
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' })
      }

      const content = await storage.get(keyFactory.compiled(type, productId))
      if (!content) {
        return res.status(404).json({ error: 'Compiled content not found' })
      }

      return res.json(content)
    }

    if (method === 'POST') {
      // POST /api/compilation/{type} - trigger compilation
      const { productId: bodyProductId } = req.body
      const targetProductId = bodyProductId || productId

      if (!targetProductId) {
        return res.status(400).json({ error: 'productId is required' })
      }

      // Import and use compilation service
      // Note: This is a simplified version - in production you'd want to
      // import the actual compilation service and handle the full compilation flow
      return res.status(501).json({ 
        error: 'Compilation triggering not yet implemented via API',
        message: 'Use the admin panel for now'
      })
    }

    if (method === 'DELETE') {
      // DELETE /api/compilation/{type}?productId=X
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' })
      }

      await Promise.all([
        storage.delete(keyFactory.compiled(type, productId)),
        storage.delete(keyFactory.count(type, productId))
      ])

      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Compilation API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    })
  }
}