import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// POST /api/products/[productId]/clone - Clone a product
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const newProductId = await productService.cloneProduct(params.productId, body.name)

    return NextResponse.json({
      success: true,
      productId: newProductId,
      message: 'Product cloned successfully'
    })
  } catch (error) {
    console.error('Error cloning product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clone product' },
      { status: 500 }
    )
  }
}