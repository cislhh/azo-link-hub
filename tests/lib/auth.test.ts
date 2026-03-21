import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config } from 'dotenv'

// 在导入任何模块之前加载环境变量
config({ path: '.env.test' })

// 设置测试环境变量（在模块导入前）
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.NODE_ENV = 'test'

// Mock Prisma（必须在导入 @/lib/db 之前）
vi.mock('@/lib/db', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    link: {
      deleteMany: vi.fn(),
    },
    socialLink: {
      deleteMany: vi.fn(),
    },
    extraLink: {
      deleteMany: vi.fn(),
    },
  }

  return {
    prisma: mockPrisma,
  }
})

// Mock NextAuth 和相关模块
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({
    id: 'google',
    name: 'Google',
  })),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({
    createUser: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
  })),
}))

import { getNextAuthConfig } from '@/lib/auth'

// Mock 环境变量
const mockEnv = {
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
}

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 设置测试环境变量
    process.env.NEXTAUTH_URL = mockEnv.NEXTAUTH_URL
    process.env.NEXTAUTH_SECRET = mockEnv.NEXTAUTH_SECRET
    process.env.GOOGLE_CLIENT_ID = mockEnv.GOOGLE_CLIENT_ID
    process.env.GOOGLE_CLIENT_SECRET = mockEnv.GOOGLE_CLIENT_SECRET
  })

  describe('getNextAuthConfig', () => {
    it('应该返回有效的 Auth.js 配置对象', () => {
      const config = getNextAuthConfig()

      expect(config).toBeDefined()
      expect(config).toHaveProperty('providers')
      expect(config).toHaveProperty('adapter')
      expect(config).toHaveProperty('callbacks')
      expect(config).toHaveProperty('pages')
      expect(config).toHaveProperty('session')
      expect(config).toHaveProperty('trustHost')
    })

    it('应该配置 Google OAuth 提供商', () => {
      const config = getNextAuthConfig()

      expect(config.providers).toBeDefined()
      expect(config.providers).toHaveLength(1)
      expect(config.providers[0]).toHaveProperty('id', 'google')
      expect(config.providers[0]).toHaveProperty('name', 'Google')
    })

    it('应该使用 Prisma 适配器', () => {
      const config = getNextAuthConfig()

      expect(config.adapter).toBeDefined()
      expect(config.adapter).toHaveProperty('createUser')
      expect(config.adapter).toHaveProperty('getUser')
      expect(config.adapter).toHaveProperty('getSession')
    })

    it('应该配置自定义回调函数', () => {
      const config = getNextAuthConfig()

      expect(config.callbacks).toBeDefined()
      expect(config.callbacks).toHaveProperty('signIn')
      expect(config.callbacks).toHaveProperty('session')
      expect(config.callbacks).toHaveProperty('jwt')
    })

    it('应该配置自定义页面', () => {
      const config = getNextAuthConfig()

      expect(config.pages).toBeDefined()
      expect(config.pages).toHaveProperty('signIn', '/login')
      expect(config.pages).toHaveProperty('error', '/login')
    })

    it('应该配置会话策略为 JWT', () => {
      const config = getNextAuthConfig()

      expect(config.session).toBeDefined()
      expect(config.session).toHaveProperty('strategy', 'jwt')
      expect(config.session).toHaveProperty('maxAge')
      expect(config.session.maxAge).toBe(30 * 24 * 60 * 60) // 30 天
    })

    it('应该在开发环境启用 trustHost', () => {
      const config = getNextAuthConfig()

      expect(config.trustHost).toBe(true)
    })
  })

  describe('signIn 回调函数', () => {
    it('应该允许 Google OAuth 登录', async () => {
      const config = getNextAuthConfig()
      const signInCallback = config.callbacks!.signIn!

      const result = await signInCallback({
        user: { id: '123', email: 'test@example.com', name: 'Test User' },
        account: { provider: 'google', type: 'oauth' },
      } as any)

      expect(result).toBe(true)
    })

    it('应该拒绝非 Google OAuth 登录', async () => {
      const config = getNextAuthConfig()
      const signInCallback = config.callbacks!.signIn!

      const result = await signInCallback({
        user: { id: '123', email: 'test@example.com', name: 'Test User' },
        account: { provider: 'github', type: 'oauth' },
      } as any)

      expect(result).toBe(false)
    })
  })

  describe('session 回调函数', () => {
    it('应该将用户信息添加到会话中', async () => {
      const config = getNextAuthConfig()
      const sessionCallback = config.callbacks!.session!

      const token = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      }

      const session = await sessionCallback({
        session: {} as any,
        token,
      } as any)

      expect(session.user).toBeDefined()
      expect(session.user.id).toBe('user-123')
      expect(session.user.email).toBe('test@example.com')
      expect(session.user.name).toBe('Test User')
      expect(session.user.image).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('jwt 回调函数', () => {
    it('应该将用户 ID 添加到 token', async () => {
      const config = getNextAuthConfig()
      const jwtCallback = config.callbacks!.jwt!

      const token = await jwtCallback({
        token: {} as any,
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      expect(token.sub).toBe('user-123')
    })

    it('应该保留现有 token 信息', async () => {
      const config = getNextAuthConfig()
      const jwtCallback = config.callbacks!.jwt!

      const token = await jwtCallback({
        token: { sub: 'existing-user' } as any,
        user: null,
      } as any)

      expect(token.sub).toBe('existing-user')
    })
  })
})
