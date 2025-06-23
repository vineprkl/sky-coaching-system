// 安全配置和工具函数

export const SECURITY_CONFIG = {
  // 速率限制配置
  RATE_LIMITS: {
    CLIENT_API: {
      maxRequests: 50,
      windowMs: 60000 // 1分钟
    },
    ADMIN_LOGIN: {
      maxRequests: 5,
      windowMs: 300000 // 5分钟
    },
    ADMIN_API: {
      maxRequests: 200,
      windowMs: 60000 // 1分钟
    }
  },
  
  // Token 配置
  TOKEN: {
    expirationTime: 24 * 60 * 60 * 1000, // 24小时
    algorithm: 'base64' // 简单编码，生产环境应使用 JWT
  },
  
  // 客户端访问配置
  CLIENT_ACCESS: {
    allowedClientIdPattern: /^[1-9]\d*$/, // 只允许正整数
    maxClientId: 1000 // 最大客户端 ID
  }
}

// 输入验证函数
export function validateInput(input: any, rules: ValidationRules): ValidationResult {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = input[field]
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`)
      continue
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`)
      }
      
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`)
      }
      
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`)
      }
      
      if (rule.min && typeof value === 'number' && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`)
      }
      
      if (rule.max && typeof value === 'number' && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`)
      }
      
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
}

export interface ValidationRules {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// 数据清理函数
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // 移除潜在的恶意字符
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// 记录 API 访问日志
export function logAPIAccess(request: Request, clientId?: string, userId?: string) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  // 在生产环境中，应该将日志写入文件或数据库
  console.log(`[${timestamp}] ${method} ${url} - Client: ${clientId || 'N/A'} - User: ${userId || 'N/A'} - IP: ${ip} - UA: ${userAgent}`)
}

// 检查可疑活动
export function detectSuspiciousActivity(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  
  // 检查是否为已知的恶意 User-Agent
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'python-requests',
    'curl' // 在生产环境中可能需要允许某些 curl 请求
  ]
  
  for (const suspicious of suspiciousUserAgents) {
    if (userAgent.toLowerCase().includes(suspicious)) {
      return true
    }
  }
  
  // 检查是否有可疑的 referer
  if (referer && !referer.includes(process.env.NEXT_PUBLIC_SITE_URL || 'localhost')) {
    // 外部 referer 可能是可疑的
    return true
  }
  
  return false
}

// CORS 配置
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL
  ].filter(Boolean)
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  } else {
    headers['Access-Control-Allow-Origin'] = allowedOrigins[0] || '*'
  }
  
  return headers
}
