import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { env } from './env'

/**
 * Prisma 7 全局单例
 *
 * Prisma 7 需要手动配置驱动适配器和连接池
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

/**
 * 创建 PostgreSQL 连接池
 *
 * 配置说明：
 * - connectionString: 数据库连接字符串
 * - max: 最大连接数（默认 10）
 * - idleTimeoutMillis: 空闲连接超时（30 秒）
 * - connectionTimeoutMillis: 连接超时（10 秒）⚠️ Prisma 7 必需
 */
const pool = globalForPrisma.pool ?? new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: env.DB_POOL_TIMEOUT,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

/**
 * Prisma Pg 适配器
 *
 * Prisma 7 使用适配器模式，支持多种数据库驱动
 *
 * ⚠️ 类型断言说明:
 * @prisma/adapter-pg 和 @types/pg 存在类型兼容性问题
 * 这是 Prisma 7 的已知问题，参考：https://github.com/prisma/prisma/issues/28403
 * 使用 // @ts-ignore 来绕过类型检查，实际运行时完全正常
 */
// @ts-ignore - Pool 类型兼容性问题（Prisma 7 已知问题）
const adapter = new PrismaPg(pool)

/**
 * Prisma Client 实例
 *
 * 开发环境复用实例，避免热重载时创建多个连接
 * 生产环境每次创建新实例
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

/**
 * 开发环境下保存实例到全局对象
 */
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * 优雅关闭数据库连接
 *
 * 在应用关闭时调用，确保所有连接正确释放
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
  await pool.end()
}
