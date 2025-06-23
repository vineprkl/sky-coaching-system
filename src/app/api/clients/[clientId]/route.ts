import { NextResponse } from 'next/server'
import { clientsApi } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    clientId: string
  }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params

    await clientsApi.delete(clientId)

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params
    const body = await request.json()

    const updatedClient = await clientsApi.update(clientId, body)

    return NextResponse.json({
      success: true,
      data: updatedClient
    })
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    )
  }
}
