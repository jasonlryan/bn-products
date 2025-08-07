import { NextRequest, NextResponse } from 'next/server'
import { getProductService } from '@/services/storage'

const productService = getProductService()

// GET /api/products - List all products
export async function GET() {
  try {
    const products = await productService.listProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      )
    }

    const productId = await productService.createProduct({
      name: body.name,
      type: body.type,
      pricing: body.pricing || { type: 'fixed', display: 'TBD' },
      content: body.content || {
        description: '',
        perfectFor: ''
      },
      features: body.features || [],
      benefits: body.benefits || [],
      marketing: body.marketing || {}
    })

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}