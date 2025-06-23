import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'

async function handler(request: Request, context: Record<string, unknown>) {
  const { user } = context

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

export const GET = requireAdminAuth(handler)
export const POST = requireAdminAuth(handler)
