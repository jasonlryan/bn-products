import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/settings/edit-mode
export async function GET() {
  try {
    const editMode = await storage.get<boolean>('bn:settings:edit-mode')
    
    return NextResponse.json({
      editMode: editMode !== null ? editMode : false
    })
  } catch (error) {
    console.error('Error getting edit mode:', error)
    return NextResponse.json(
      { error: 'Failed to get edit mode' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/edit-mode
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (typeof body.editMode !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid edit mode value' },
        { status: 400 }
      )
    }

    await storage.set('bn:settings:edit-mode', body.editMode)

    return NextResponse.json({
      success: true,
      message: 'Edit mode updated successfully'
    })
  } catch (error) {
    console.error('Error updating edit mode:', error)
    return NextResponse.json(
      { error: 'Failed to update edit mode' },
      { status: 500 }
    )
  }
}