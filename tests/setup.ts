import { beforeAll, beforeEach } from 'vitest'
import { config } from 'dotenv'
import { prisma } from '@/lib/db'

// 加载环境变量
config({ path: '.env' })

/**
 * 数据库连接状态
 */
let isDbConnected = true

/**
 * 测试数据库连接
 */
async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

// 在所有测试前检查数据库连接
beforeAll(async () => {
  isDbConnected = await testDbConnection()
  if (!isDbConnected) {
    console.warn('警告: 数据库连接失败，需要数据库的测试将被跳过')
  }
})

/**
 * 导出数据库连接状态供测试使用
 */
export { isDbConnected }

beforeEach(async () => {
  if (!isDbConnected) {
    return
  }

  try {
    // 每个测试前清理数据库
    // 必须按照外键依赖顺序删除
    await prisma.socialLink.deleteMany()
    await prisma.extraLink.deleteMany()
    await prisma.link.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  } catch (error: any) {
    // 数据库连接失败时静默忽略
    if (error.code?.startsWith('P') || error.message?.includes('database') || error.message?.includes('denied access')) {
      isDbConnected = false
      return
    }
    throw error
  }
})
