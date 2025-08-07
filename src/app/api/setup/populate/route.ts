import { NextRequest, NextResponse } from 'next/server'
import { populateRedisWithSampleData } from '../../../../utils/populateRedis'

// POST /api/setup/populate - Populate Redis with sample data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clearExisting = false } = body

    // Clear existing data if requested
    if (clearExisting) {
      const { getStorageService } = await import('../../../../services/storage')
      const storage = getStorageService()
      await storage.deletePattern('bn:product:*')
      await storage.deletePattern('bn:content:*')
      await storage.deletePattern('bn:compiled:*')
      await storage.deletePattern('bn:count:*')
    }

    // Use the utility function to populate data
    const populationResult = await populateRedisWithSampleData()

    return NextResponse.json({
      success: populationResult.success,
      message: populationResult.success ? 'Redis populated successfully' : 'Population completed with errors',
      results: populationResult.results,
      errors: populationResult.errors
    })

  } catch (error) {
    console.error('Error populating Redis:', error)
    return NextResponse.json(
      { error: 'Failed to populate Redis' },
      { status: 500 }
    )
  }
}

// GET /api/setup/populate - Get population status
export async function GET() {
  try {
    const { getStorageService, getProductService } = await import('../../../../services/storage')
    const storage = getStorageService()
    const productService = getProductService()
    
    // Check if data exists
    const products = await productService.listProducts()
    const settings = await storage.get('bn:settings:admin')
    const version = await storage.get('bn:version')
    
    return NextResponse.json({
      isPopulated: products.length > 0,
      status: {
        products: products.length,
        hasSettings: !!settings,
        hasVersion: !!version,
        version: version?.version || 'unknown'
      },
      products: products.map(p => ({ id: p.id, name: p.name, type: p.type }))
    })
  } catch (error) {
    console.error('Error checking population status:', error)
    return NextResponse.json(
      { error: 'Failed to check population status' },
      { status: 500 }
    )
  }
}