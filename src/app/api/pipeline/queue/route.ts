import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/pipeline/queue - Get pipeline queue
export async function GET() {
  try {
    const queue = await storage.get<string[]>('bn:pipeline:queue') || []
    
    // Get status for each item in queue
    const queueStatus = await Promise.all(
      queue.map(async (productId) => {
        const status = await storage.get(`bn:pipeline:status:${productId}`)
        return {
          productId,
          status: status || { status: 'unknown' }
        }
      })
    )

    return NextResponse.json({
      queue: queueStatus,
      count: queue.length
    })
  } catch (error) {
    console.error('Error getting pipeline queue:', error)
    return NextResponse.json(
      { error: 'Failed to get pipeline queue' },
      { status: 500 }
    )
  }
}