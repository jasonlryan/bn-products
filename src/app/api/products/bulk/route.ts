import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// POST /api/products/bulk - Import multiple products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!Array.isArray(body.products)) {
      return NextResponse.json(
        { error: 'Missing required field: products (array)' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const product of body.products) {
      try {
        const productId = await productService.createProduct(product)
        results.push({ 
          success: true, 
          productId, 
          name: product.name 
        })
      } catch (error) {
        errors.push({
          success: false,
          name: product.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: body.products.length,
        successful: results.length,
        failed: errors.length
      }
    })
  } catch (error) {
    console.error('Error bulk importing products:', error)
    return NextResponse.json(
      { error: 'Failed to bulk import products' },
      { status: 500 }
    )
  }
}