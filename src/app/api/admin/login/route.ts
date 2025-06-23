import { NextResponse } from 'next/server'
import { validateCredentials, generateAdminToken, checkRateLimit } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // 速率限制检查
    if (!checkRateLimit(`login:${clientIP}`, 5, 300000)) { // 5次/5分钟
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const user = validateCredentials(username, password)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const token = generateAdminToken(username)
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
