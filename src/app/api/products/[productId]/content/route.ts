import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// GET /api/products/[productId]/content - Get all content for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const content = await productService.getAllContent(params.productId)
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error getting product content:', error)
    return NextResponse.json(
      { error: 'Failed to get product content' },
      { status: 500 }
    )
  }
}