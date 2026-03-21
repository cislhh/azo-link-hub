import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config } from 'dotenv'
import { NextRequest } from 'next/server'

// 在导入任何模块之前加载环境变量
config({ path: '.env.test' })

// 设置测试环境变量（在模块导入前）
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.NODE_ENV = 'test'

// Mock auth 函数（必须在导入前定义）
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { middleware } from '@/middleware'
import { auth } from '@/lib/auth'

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('公开路由', () => {
    it('应该允许访问登录页面', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/login')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })

    it('应该允许访问首页', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })

    it('应该允许访问 API 认证路由', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/signin')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })

    it('应该允许访问静态资源', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/favicon.ico')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })

    it('应该允许访问公开的静态文件', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/_next/static/test.js')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })
  })

  describe('受保护路由', () => {
    it('未登录用户访问 dashboard 应该重定向到登录页', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/dashboard')
      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('未登录用户访问 profile 应该重定向到登录页', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/profile')
      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('已登录用户访问 dashboard 应该允许', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      })

      const request = new NextRequest('http://localhost:3000/dashboard')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })

    it('已登录用户访问 profile 应该允许', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      })

      const request = new NextRequest('http://localhost:3000/profile')
      const response = await middleware(request)

      expect(response).toBeUndefined()
    })
  })

  describe('重定向行为', () => {
    it('重定向到登录页时应该保留原始 URL', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/dashboard')
      const response = await middleware(request)

      const redirectUrl = response?.headers.get('location')
      expect(redirectUrl).toContain('/login')
      expect(redirectUrl).toContain('callbackUrl')
    })
  })
})
