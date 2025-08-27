import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    }

    const { kv } = await import('@vercel/kv')
    const config = await import('../src/config')
    const products = config.getAllProducts()
    const services = config.getAllServices()

    // Write lists
    await kv.set('bn:products:list', products.map((p: any) => p.id))
    await kv.set('bn:services:list', services.map((s: any) => s.id))

    // Write items via pipeline
    const pipe = kv.pipeline()
    for (const p of products) pipe.set(`bn:product:${p.id}`, p)
    for (const s of services) pipe.set(`bn:product:${s.id}`, s)
    await pipe.exec()

    return res.status(200).json({ ok: true, products: products.length, services: services.length })
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error?.message || 'Internal error' })
  }
}


