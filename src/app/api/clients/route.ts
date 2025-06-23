import { NextResponse } from 'next/server'
import { clientsApi } from '@/lib/supabase'

export async function GET() {
  try {
    const clients = await clientsApi.getAll()

    return NextResponse.json({
      success: true,
      data: clients
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, avatar } = body

    const newClient = await clientsApi.create({ name, avatar })

    return NextResponse.json({
      success: true,
      data: newClient
    })
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
