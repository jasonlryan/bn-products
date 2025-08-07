import { NextRequest, NextResponse } from 'next/server'
import { getStorageService } from '@/services/storage'

const storage = getStorageService()

// GET /api/settings/prompts
export async function GET() {
  try {
    const prompts = await storage.get('bn:settings:prompts')
    
    return NextResponse.json({
      prompts: prompts || {
        manifesto: 'Default manifesto prompt...',
        functionalSpec: 'Default functional spec prompt...',
        audienceIcps: 'Default audience ICPs prompt...',
        // Add other default prompts as needed
      }
    })
  } catch (error) {
    console.error('Error getting prompts:', error)
    return NextResponse.json(
      { error: 'Failed to get prompts' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/prompts
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    await storage.set('bn:settings:prompts', body)

    return NextResponse.json({
      success: true,
      message: 'Prompts updated successfully'
    })
  } catch (error) {
    console.error('Error updating prompts:', error)
    return NextResponse.json(
      { error: 'Failed to update prompts' },
      { status: 500 }
    )
  }
}