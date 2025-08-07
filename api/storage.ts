import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

type Action =
  | 'get'
  | 'set'
  | 'delete'
  | 'exists'
  | 'increment'
  | 'decrement'
  | 'mget'
  | 'mset'
  | 'keys'
  | 'deletePattern'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    }

    const { action, key, value, ttl, keys, entries, pattern } = req.body as {
      action: Action
      key?: string
      value?: unknown
      ttl?: number
      keys?: string[]
      entries?: Array<{ key: string; value: unknown; ttl?: number }>
      pattern?: string
    }

    switch (action) {
      case 'get': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        const v = await kv.get(key)
        return res.json({ ok: true, value: v ?? null })
      }
      case 'set': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        if (ttl) await kv.set(key, value, { ex: ttl })
        else await kv.set(key, value)
        return res.json({ ok: true })
      }
      case 'delete': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        await kv.del(key)
        return res.json({ ok: true })
      }
      case 'exists': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        const exists = (await kv.exists(key)) > 0
        return res.json({ ok: true, exists })
      }
      case 'increment': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        const result = await kv.incr(key)
        return res.json({ ok: true, value: result })
      }
      case 'decrement': {
        if (!key) return res.status(400).json({ ok: false, error: 'key required' })
        const result = await kv.decr(key)
        return res.json({ ok: true, value: result })
      }
      case 'mget': {
        if (!keys) return res.status(400).json({ ok: false, error: 'keys required' })
        const values = (await kv.mget(...keys)) as unknown[]
        return res.json({ ok: true, values })
      }
      case 'mset': {
        if (!entries) return res.status(400).json({ ok: false, error: 'entries required' })
        const pipeline = kv.pipeline()
        for (const e of entries) {
          if (e.ttl) pipeline.set(e.key, e.value, { ex: e.ttl })
          else pipeline.set(e.key, e.value)
        }
        await pipeline.exec()
        return res.json({ ok: true })
      }
      case 'keys': {
        if (!pattern) return res.status(400).json({ ok: false, error: 'pattern required' })
        const redisPattern = pattern.replace(/\*/g, '*')
        const found = await kv.keys(redisPattern)
        return res.json({ ok: true, keys: found })
      }
      case 'deletePattern': {
        if (!pattern) return res.status(400).json({ ok: false, error: 'pattern required' })
        const redisPattern = pattern.replace(/\*/g, '*')
        const found = await kv.keys(redisPattern)
        if (found.length) await kv.del(...found)
        return res.json({ ok: true, count: found.length })
      }
      default:
        return res.status(400).json({ ok: false, error: `Unknown action: ${action}` })
    }
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error?.message || 'Internal error' })
  }
}


