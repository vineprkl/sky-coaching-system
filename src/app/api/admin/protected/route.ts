import { NextResponse } from 'next/server'
import { isValidAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const user = isValidAdminToken(token)

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Access granted to protected admin resource',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  })
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const user = isValidAdminToken(token)

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Access granted to protected admin resource',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  })
}
