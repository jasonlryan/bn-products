import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/compilation/market-intel?productId=xxx
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

    const content = await storage.get(`bn:compiled:market-intel:${productId}`)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Compiled content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error getting compiled market intel content:', error)
    return NextResponse.json(
      { error: 'Failed to get compiled content' },
      { status: 500 }
    )
  }
}

// POST /api/compilation/market-intel - Save compiled content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.productId || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, content' },
        { status: 400 }
      )
    }

    await storage.set(`bn:compiled:market-intel:${body.productId}`, body.content)
    
    // Update compilation count
    const countKey = `bn:count:market-intel:${body.productId}`
    await storage.increment(countKey)

    return NextResponse.json({
      success: true,
      message: 'Market intelligence compilation saved successfully'
    })
  } catch (error) {
    console.error('Error saving compiled market intel content:', error)
    return NextResponse.json(
      { error: 'Failed to save compiled content' },
      { status: 500 }
    )
  }
}

// DELETE /api/compilation/market-intel?productId=xxx
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

    await storage.delete(`bn:compiled:market-intel:${productId}`)
    await storage.delete(`bn:count:market-intel:${productId}`)

    return NextResponse.json({
      success: true,
      message: 'Market intelligence compilation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting compiled market intel content:', error)
    return NextResponse.json(
      { error: 'Failed to delete compiled content' },
      { status: 500 }
    )
  }
}