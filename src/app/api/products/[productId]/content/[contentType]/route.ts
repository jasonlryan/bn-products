import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// GET /api/products/[productId]/content/[contentType] - Get specific content type
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; contentType: string } }
) {
  try {
    const content = await productService.getContent(params.productId, params.contentType)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error getting content:', error)
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[productId]/content/[contentType] - Update specific content
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string; contentType: string } }
) {
  try {
    const body = await request.json()
    
    await productService.setContent(params.productId, params.contentType, body)

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully'
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update content' },
      { status: 500 }
    )
  }
}