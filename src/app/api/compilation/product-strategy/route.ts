import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/compilation/product-strategy?productId=xxx
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

    const content = await storage.get(`bn:compiled:product-strategy:${productId}`)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Compiled content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error getting compiled product strategy content:', error)
    return NextResponse.json(
      { error: 'Failed to get compiled content' },
      { status: 500 }
    )
  }
}

// POST /api/compilation/product-strategy - Save compiled content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.productId || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, content' },
        { status: 400 }
      )
    }

    await storage.set(`bn:compiled:product-strategy:${body.productId}`, body.content)
    
    // Update compilation count
    const countKey = `bn:count:product-strategy:${body.productId}`
    await storage.increment(countKey)

    return NextResponse.json({
      success: true,
      message: 'Product strategy compilation saved successfully'
    })
  } catch (error) {
    console.error('Error saving compiled product strategy content:', error)
    return NextResponse.json(
      { error: 'Failed to save compiled content' },
      { status: 500 }
    )
  }
}

// DELETE /api/compilation/product-strategy?productId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required parameter: productId' },
        { status: 400 }
      )
    }

    await storage.delete(`bn:compiled:product-strategy:${productId}`)
    await storage.delete(`bn:count:product-strategy:${productId}`)

    return NextResponse.json({
      success: true,
      message: 'Product strategy compilation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting compiled product strategy content:', error)
    return NextResponse.json(
      { error: 'Failed to delete compiled content' },
      { status: 500 }
    )
  }
}