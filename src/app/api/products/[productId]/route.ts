import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// GET /api/products/[productId] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await productService.getProduct(params.productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error getting product:', error)
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[productId] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await request.json()
    
    await productService.updateProduct(params.productId, body)

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await productService.deleteProduct(params.productId)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}