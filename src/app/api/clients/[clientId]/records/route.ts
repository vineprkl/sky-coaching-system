import { NextResponse } from 'next/server'
import { recordsApi } from '@/lib/prisma'
import { validateClientAccess, checkRateLimit } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    clientId: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

    // 验证客户端访问权限
    if (!validateClientAccess(clientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid client access' },
        { status: 403 }
      )
    }

    // 速率限制检查
    if (!checkRateLimit(`client:${clientId}:${clientIP}`, 50, 60000)) { // 50次/分钟
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const records = await recordsApi.getByClientId(clientId)

    return NextResponse.json({
      success: true,
      data: records
    })
  } catch (error) {
    console.error('Failed to fetch records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params
    const body = await request.json()

    const newRecord = await recordsApi.create({
      client_id: clientId,
      ...body
    })

    return NextResponse.json({
      success: true,
      data: newRecord
    })
  } catch (error) {
    console.error('Failed to create record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create record' },
      { status: 500 }
    )
  }
}
