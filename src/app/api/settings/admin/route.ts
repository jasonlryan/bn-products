import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/settings/admin
export async function GET() {
  try {
    const settings = await storage.get('bn:settings:admin')
    
    return NextResponse.json({
      settings: settings || {
        theme: 'light',
        language: 'en',
        features: {
          autoSave: true,
          notifications: true
        }
      }
    })
  } catch (error) {
    console.error('Error getting admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to get admin settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/admin
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    await storage.set('bn:settings:admin', body)

    return NextResponse.json({
      success: true,
      message: 'Admin settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    )
  }
}