import { NextResponse } from 'next/server'
import { recordsApi } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    recordId: string
  }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { recordId } = await params
    
    await recordsApi.delete(recordId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Record deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { recordId } = await params
    const body = await request.json()
    
    const updatedRecord = await recordsApi.update(recordId, body)
    
    return NextResponse.json({ 
      success: true, 
      data: updatedRecord 
    })
  } catch (error) {
    console.error('Failed to update record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update record' },
      { status: 500 }
    )
  }
}
