import { NextRequest, NextResponse } from 'next/server'
import { getStorageService, getProductService } from '@/services/storage'
import { PipelineStatus } from '@/services/storage/types'

const storage = getStorageService()
const productService = getProductService()

// POST /api/pipeline/generate - Trigger content generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.productId || !body.contentTypes || !Array.isArray(body.contentTypes)) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, contentTypes (array)' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await productService.getProduct(body.productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create pipeline status
    const jobId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const pipelineStatus: PipelineStatus = {
      productId: body.productId,
      status: 'queued',
      progress: 0,
      currentStage: 'Initializing',
      startedAt: new Date().toISOString()
    }

    await storage.set(`bn:pipeline:status:${body.productId}`, pipelineStatus)

    // Add to queue
    const queue = await storage.get<string[]>('bn:pipeline:queue') || []
    queue.push(body.productId)
    await storage.set('bn:pipeline:queue', queue)

    // TODO: Trigger actual generation process
    // This would typically be handled by a background job or serverless function
    // For now, we'll just set up the structure

    return NextResponse.json({
      success: true,
      jobId,
      estimatedTime: body.contentTypes.length * 20, // 20 seconds per content type
      status: 'queued'
    })
  } catch (error) {
    console.error('Error triggering content generation:', error)
    return NextResponse.json(
      { error: 'Failed to trigger content generation' },
      { status: 500 }
    )
  }
}