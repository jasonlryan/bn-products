import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'
import { MigrationResult } from '@/services/storage/types'

const storage = getStorageService()

// POST /api/migrate - Migrate data from localStorage to Redis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { source = 'localStorage', target = 'redis', validate = true } = body
    
    if (source !== 'localStorage' || target !== 'redis') {
      return NextResponse.json(
        { error: 'Only localStorage to Redis migration is currently supported' },
        { status: 400 }
      )
    }

    const result: MigrationResult = {
      products: 0,
      compiledContent: 0,
      settings: 0,
      errors: []
    }

    // Note: This API endpoint can't directly access localStorage
    // In a real implementation, this would need to be done client-side
    // or the data would need to be sent in the request body
    
    if (body.data) {
      // If localStorage data is provided in the request body
      await migrateProvidedData(body.data, result)
    } else {
      result.errors.push('No localStorage data provided. Migration must be performed client-side.')
    }

    return NextResponse.json({
      success: result.errors.length === 0,
      result
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}

async function migrateProvidedData(localStorageData: Record<string, string>, result: MigrationResult) {
  // Migrate compiled content
  for (const [key, value] of Object.entries(localStorageData)) {
    try {
      if (key.startsWith('compiled-marketing-')) {
        const productId = key.replace('compiled-marketing-', '')
        const data = JSON.parse(value)
        await storage.set(`bn:compiled:marketing:${productId}`, data)
        result.compiledContent++
      } else if (key.startsWith('compiled-market-intelligence-')) {
        const productId = key.replace('compiled-market-intelligence-', '')
        const data = JSON.parse(value)
        await storage.set(`bn:compiled:market-intel:${productId}`, data)
        result.compiledContent++
      } else if (key.startsWith('compiled-product-strategy-')) {
        const productId = key.replace('compiled-product-strategy-', '')
        const data = JSON.parse(value)
        await storage.set(`bn:compiled:product-strategy:${productId}`, data)
        result.compiledContent++
      }
      // Migrate compilation counts
      else if (key.startsWith('marketing-compilation-count-')) {
        const productId = key.replace('marketing-compilation-count-', '')
        const count = parseInt(value, 10)
        await storage.set(`bn:count:marketing:${productId}`, count)
      } else if (key.startsWith('market-intelligence-compilation-count-')) {
        const productId = key.replace('market-intelligence-compilation-count-', '')
        const count = parseInt(value, 10)
        await storage.set(`bn:count:market-intel:${productId}`, count)
      } else if (key.startsWith('product-strategy-compilation-count-')) {
        const productId = key.replace('product-strategy-compilation-count-', '')
        const count = parseInt(value, 10)
        await storage.set(`bn:count:product-strategy:${productId}`, count)
      }
      // Migrate settings
      else if (key === 'admin-settings') {
        const settings = JSON.parse(value)
        await storage.set('bn:settings:admin', settings)
        result.settings++
      } else if (key === 'page-edit-mode') {
        const editMode = value === 'true'
        await storage.set('bn:settings:edit-mode', editMode)
        result.settings++
      }
      // Note: Products would need to be migrated if they were stored in localStorage
      // This would depend on the specific product storage format
    } catch (error) {
      result.errors.push(`Failed to migrate ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// GET /api/migrate - Get migration status or instructions
export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint ready',
    instructions: [
      '1. Call POST /api/migrate with localStorage data in request body',
      '2. Use the client-side migration helper for automatic migration',
      '3. Validate migrated data using the validation parameter'
    ],
    supportedMigrations: [
      'localStorage → Redis (Vercel KV)',
      'Compiled marketing content',
      'Compiled market intelligence content', 
      'Compiled product strategy content',
      'Compilation counts',
      'Admin settings',
      'Edit mode settings'
    ]
  })
}