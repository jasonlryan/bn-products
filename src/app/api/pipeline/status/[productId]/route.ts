import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'
import { PipelineStatus } from '@/services/storage/types'

const storage = getStorageService()

// GET /api/pipeline/status/[productId] - Get generation status
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const status = await storage.get<PipelineStatus>(`bn:pipeline:status:${params.productId}`)
    
    if (!status) {
      return NextResponse.json(
        { error: 'No generation status found for this product' },
        { status: 404 }
      )
    }

    // Calculate estimated completion if still processing
    let estimatedCompletion
    if (status.status === 'processing' && status.startedAt) {
      const elapsedTime = Date.now() - new Date(status.startedAt).getTime()
      const estimatedTotal = 300000 // 5 minutes total estimate
      const remainingTime = Math.max(0, estimatedTotal - elapsedTime)
      estimatedCompletion = new Date(Date.now() + remainingTime).toISOString()
    }

    return NextResponse.json({
      ...status,
      estimatedCompletion
    })
  } catch (error) {
    console.error('Error getting pipeline status:', error)
    return NextResponse.json(
      { error: 'Failed to get pipeline status' },
      { status: 500 }
    )
  }
}