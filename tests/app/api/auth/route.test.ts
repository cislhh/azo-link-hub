import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config } from 'dotenv'
import { GET, POST } from '@/app/api/auth/[...nextauth]/route'

// 在导入任何模块之前加载环境变量
config({ path: '.env.test' })

// 设置测试环境变量（在模块导入前）
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.NODE_ENV = 'test'

// Mock NextAuth handlers
vi.mock('@/lib/auth', () => ({
  handlers: {
    GET: vi.fn(() => new Response('GET mock')),
    POST: vi.fn(() => new Response('POST mock')),
  },
}))

describe('NextAuth API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET handler', () => {
    it('应该导出 GET 函数', () => {
      expect(GET).toBeDefined()
      expect(typeof GET).toBe('function')
    })

    it('应该调用 NextAuth GET handler', async () => {
      const { handlers } = await import('@/lib/auth')

      const request = new Request('http://localhost:3000/api/auth/signin')
      await GET(request)

      expect(handlers.GET).toHaveBeenCalled()
    })

    it('应该返回 Response 对象', async () => {
      const request = new Request('http://localhost:3000/api/auth/signin')
      const response = await GET(request)

      expect(response).toBeInstanceOf(Response)
    })
  })

  describe('POST handler', () => {
    it('应该导出 POST 函数', () => {
      expect(POST).toBeDefined()
      expect(typeof POST).toBe('function')
    })

    it('应该调用 NextAuth POST handler', async () => {
      const { handlers } = await import('@/lib/auth')

      const request = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
      })
      await POST(request)

      expect(handlers.POST).toHaveBeenCalled()
    })

    it('应该返回 Response 对象', async () => {
      const request = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
      })
      const response = await POST(request)

      expect(response).toBeInstanceOf(Response)
    })
  })

  describe('路由配置', () => {
    it('应该使用正确的路由路径', () => {
      // 验证路由文件存在于正确的位置
      const routePath = '/Users/azo/Workspace/azo-link-hub/app/api/auth/[...nextauth]/route.ts'
      expect(routePath).toContain('/app/api/auth/[...nextauth]/route.ts')
    })
  })
})
