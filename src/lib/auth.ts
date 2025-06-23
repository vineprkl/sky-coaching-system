// 简单的认证系统
// 在生产环境中，应该使用更安全的认证方案，如 NextAuth.js 或 Supabase Auth

export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'manager'
}

// 模拟管理员用户数据
const adminUsers: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin'
  },
  {
    id: '2', 
    username: 'manager',
    role: 'manager'
  }
]

// 简单的密码验证（生产环境应使用哈希密码）
const userPasswords: Record<string, string> = {
  'admin': 'sky2024',
  'manager': 'manager123'
}

export function validateCredentials(username: string, password: string): AdminUser | null {
  if (userPasswords[username] === password) {
    return adminUsers.find(user => user.username === username) || null
  }
  return null
}

export function isValidAdminToken(token: string): AdminUser | null {
  try {
    // 简单的 token 验证（生产环境应使用 JWT）
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [username, timestamp] = decoded.split(':')
    
    // 检查 token 是否过期（24小时）
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (now - tokenTime > twentyFourHours) {
      return null
    }
    
    return adminUsers.find(user => user.username === username) || null
  } catch {
    return null
  }
}

export function generateAdminToken(username: string): string {
  // 简单的 token 生成（生产环境应使用 JWT）
  const payload = `${username}:${Date.now()}`
  return Buffer.from(payload).toString('base64')
}

export function getClientFromRequest(request: Request): string | null {
  // 从请求头或查询参数中获取客户端标识
  const url = new URL(request.url)
  const clientId = url.searchParams.get('clientId')
  
  // 简单验证客户端 ID 格式
  if (clientId && /^[1-9]\d*$/.test(clientId)) {
    return clientId
  }
  
  return null
}

// 检查管理员权限的中间件函数
export function requireAdminAuth(handler: Function) {
  return async (request: Request, context: any) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.substring(7)
    const user = isValidAdminToken(token)
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 将用户信息添加到请求上下文
    return handler(request, { ...context, user })
  }
}

// 检查客户端访问权限
export function validateClientAccess(clientId: string, userAgent?: string): boolean {
  // 简单的客户端验证逻辑
  // 在生产环境中，可以实现更复杂的验证，如 IP 白名单、设备指纹等
  
  // 检查客户端 ID 是否有效
  if (!clientId || !/^[1-9]\d*$/.test(clientId)) {
    return false
  }
  
  // 可以添加更多验证逻辑
  // 例如：检查客户端是否在允许的列表中
  // 例如：检查访问频率限制
  
  return true
}

// 速率限制
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}
