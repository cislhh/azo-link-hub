import { beforeEach } from 'vitest'
import { prisma } from '@/lib/db'

describe('测试环境设置', () => {
  beforeEach(async () => {
    // 清理数据库
    await prisma.user.deleteMany()
    await prisma.link.deleteMany()
    await prisma.socialLink.deleteMany()
    await prisma.extraLink.deleteMany()
  })

  it('应该能够连接到数据库', async () => {
    const result = await prisma.$queryRaw`SELECT 1`
    expect(result).toBeDefined()
  })

  it('应该能够在 beforeEach 中清理数据', async () => {
    // 创建测试数据
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })

    // 验证数据存在
    const count = await prisma.user.count()
    expect(count).toBe(1)

    // beforeEach 会自动清理，所以这个测试独立运行
  })
})
