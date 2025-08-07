import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/compilation/status?productId=xxx - Get all compilation statuses for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required parameter: productId' },
        { status: 400 }
      )
    }

    // Check existence of compiled content
    const [marketing, marketIntel, productStrategy] = await Promise.all([
      storage.exists(`bn:compiled:marketing:${productId}`),
      storage.exists(`bn:compiled:market-intel:${productId}`),
      storage.exists(`bn:compiled:product-strategy:${productId}`)
    ])

    // Get compilation counts
    const [marketingCount, marketIntelCount, productStrategyCount] = await Promise.all([
      storage.get<number>(`bn:count:marketing:${productId}`) || 0,
      storage.get<number>(`bn:count:market-intel:${productId}`) || 0,
      storage.get<number>(`bn:count:product-strategy:${productId}`) || 0
    ])

    return NextResponse.json({
      productId,
      compilations: {
        marketing: {
          exists: marketing,
          count: marketingCount
        },
        marketIntel: {
          exists: marketIntel,
          count: marketIntelCount
        },
        productStrategy: {
          exists: productStrategy,
          count: productStrategyCount
        }
      }
    })
  } catch (error) {
    console.error('Error getting compilation status:', error)
    return NextResponse.json(
      { error: 'Failed to get compilation status' },
      { status: 500 }
    )
  }
}