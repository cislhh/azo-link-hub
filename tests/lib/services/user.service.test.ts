import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { config } from 'dotenv'
import { prisma } from '@/lib/db'
import { UserService } from '@/lib/services/user.service'

// 在导入任何模块之前加载环境变量
config({ path: '.env.test' })

// 设置测试环境变量（在模块导入前）
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.NODE_ENV = 'test'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    link: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    account: {
      deleteMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
  },
}))

import { prisma as prismaImport } from '@/lib/db'

describe('UserService', () => {
  const userService = new UserService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    try {
      // 清理测试数据
      await prisma.user.deleteMany()
      await prisma.link.deleteMany()
    } catch (error) {
      // 忽略清理错误
    }
  })

  describe('getUserById', () => {
    it('应该根据 ID 获取用户', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(mockUser as any)

      const user = await userService.getUserById('user-123')

      expect(user).toBeDefined()
      expect(user?.id).toBe('user-123')
      expect(user?.email).toBe('test@example.com')
      expect(prismaImport.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      })
    })

    it('用户不存在时应该返回 null', async () => {
      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(null)

      const user = await userService.getUserById('non-existent')

      expect(user).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('应该根据邮箱获取用户', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(mockUser as any)

      const user = await userService.getUserByEmail('test@example.com')

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
      expect(prismaImport.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    it('邮箱不存在时应该返回 null', async () => {
      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(null)

      const user = await userService.getUserByEmail('nonexistent@example.com')

      expect(user).toBeNull()
    })
  })

  describe('createUser', () => {
    it('应该创建新用户', async () => {
      const newUser = {
        id: 'new-user-123',
        email: 'new@example.com',
        name: 'New User',
        image: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaImport.user.create).mockResolvedValue(newUser as any)

      const user = await userService.createUser({
        email: 'new@example.com',
        name: 'New User',
      })

      expect(user).toBeDefined()
      expect(user.email).toBe('new@example.com')
      expect(prismaImport.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          name: 'New User',
        },
      })
    })
  })

  describe('updateUser', () => {
    it('应该更新用户信息', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaImport.user.update).mockResolvedValue(updatedUser as any)

      const user = await userService.updateUser('user-123', {
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
      })

      expect(user).toBeDefined()
      expect(user?.name).toBe('Updated Name')
      expect(prismaImport.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'Updated Name',
          image: 'https://example.com/new-avatar.jpg',
        },
      })
    })

    it('用户不存在时应该返回 null', async () => {
      const prismaError = new Error('User not found') as any
      prismaError.code = 'P2025'
      vi.mocked(prismaImport.user.update).mockRejectedValue(prismaError)

      const user = await userService.updateUser('non-existent', {
        name: 'Test',
      })

      expect(user).toBeNull()
    })
  })

  describe('deleteUser', () => {
    it('应该删除用户', async () => {
      const deletedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaImport.user.delete).mockResolvedValue(deletedUser as any)

      const user = await userService.deleteUser('user-123')

      expect(user).toBeDefined()
      expect(user?.id).toBe('user-123')
      expect(prismaImport.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      })
    })

    it('用户不存在时应该返回 null', async () => {
      const prismaError = new Error('User not found') as any
      prismaError.code = 'P2025'
      vi.mocked(prismaImport.user.delete).mockRejectedValue(prismaError)

      const user = await userService.deleteUser('non-existent')

      expect(user).toBeNull()
    })
  })

  describe('getUserWithLink', () => {
    it('应该获取用户及其关联的 Link', async () => {
      const mockUserWithLink = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        link: {
          id: 'link-123',
          userId: 'user-123',
          bio: 'Test bio',
          shareImageUrl: null,
          shareImageGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(mockUserWithLink as any)

      const user = await userService.getUserWithLink('user-123')

      expect(user).toBeDefined()
      expect(user?.id).toBe('user-123')
      expect(user?.link).toBeDefined()
      expect(user?.link?.bio).toBe('Test bio')
      expect(prismaImport.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: { link: true },
      })
    })

    it('用户没有 Link 时应该只返回用户信息', async () => {
      const mockUserWithoutLink = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        link: null,
      }

      vi.mocked(prismaImport.user.findUnique).mockResolvedValue(mockUserWithoutLink as any)

      const user = await userService.getUserWithLink('user-123')

      expect(user).toBeDefined()
      expect(user?.id).toBe('user-123')
      expect(user?.link).toBeNull()
    })
  })
})
