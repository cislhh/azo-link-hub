import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from './db'

describe('Prisma Client', () => {
  it('should be defined', () => {
    expect(prisma).toBeDefined()
  })

  it('should have correct models', () => {
    expect(prisma.user).toBeDefined()
    expect(prisma.account).toBeDefined()
    expect(prisma.session).toBeDefined()
    expect(prisma.verificationToken).toBeDefined()
    expect(prisma.link).toBeDefined()
    expect(prisma.socialLink).toBeDefined()
    expect(prisma.extraLink).toBeDefined()
  })

  // 注意：此测试需要数据库连接，如果没有数据库可以跳过
  it.skip('should connect to database', async () => {
    try {
      await prisma.$connect()
      const result = await prisma.$queryRaw`SELECT 1 as result`
      expect(result).toBeDefined()
      await prisma.$disconnect()
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  })
})
