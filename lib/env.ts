import { z } from 'zod'

/**
 * 环境变量验证 Schema
 *
 * 验证所有必需的环境变量，确保应用启动时配置正确
 */
const envSchema = z.object({
  // Node 环境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 数据库配置
  DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z
    .string()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().positive().max(100)),
  DB_POOL_TIMEOUT: z
    .string()
    .default('10000')
    .transform(Number)
    .pipe(z.number().int().positive().max(60000)),

  // NextAuth.js 配置
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET 不能为空'),

  // OAuth 提供商（可选）
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

function resolveAuthEnv(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const resolved: Record<string, string | undefined> = { ...source }

  // NextAuth v5 supports AUTH_* aliases. We normalize here to reduce deploy mistakes.
  resolved.NEXTAUTH_SECRET = source.NEXTAUTH_SECRET ?? source.AUTH_SECRET
  resolved.NEXTAUTH_URL = source.NEXTAUTH_URL ?? source.AUTH_URL

  // In Vercel production, derive a safe default when URL is not explicitly provided.
  if (!resolved.NEXTAUTH_URL && source.NODE_ENV === 'production') {
    const vercelHost = source.VERCEL_PROJECT_PRODUCTION_URL ?? source.VERCEL_URL
    if (vercelHost) {
      resolved.NEXTAUTH_URL = `https://${vercelHost}`
    }
  }

  return resolved
}

/**
 * 解析并验证环境变量
 *
 * 使用 safeParse 避免构建时验证失败（Vercel 构建时没有环境变量）
 * 运行时会验证，并在缺失必需变量时抛出错误
 */
function validateEnv(): z.infer<typeof envSchema> {
  const runtimeEnv = resolveAuthEnv(process.env)
  const result = envSchema.safeParse(runtimeEnv)

  if (!result.success) {
    // 检查是否在构建时（多种构建环境检测）
    const isBuildTime =
      // Next.js 构建阶段
      process.env.NEXT_PHASE === 'build' ||
      // Vercel 构建环境（检查是否有构建相关的环境变量）
      process.env.VERCEL === '1' ||
      process.env.CI === 'true' ||
      // 或者缺少关键运行时环境变量（DATABASE_URL 和 NEXTAUTH_SECRET 都缺失）
      (!process.env.DATABASE_URL && !process.env.NEXTAUTH_SECRET)

    if (isBuildTime) {
      // 构建时：返回默认值，允许构建继续
      console.warn('⚠️  构建时跳过环境变量验证（预期行为）')
      return {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://placeholder',
        DB_POOL_MAX: 10,
        DB_POOL_TIMEOUT: 10000,
        NEXTAUTH_SECRET: 'placeholder-secret',
      } as z.infer<typeof envSchema>
    }

    // 运行时：抛出错误
    const errorDetails = result.error.toString()
    throw new Error(`环境变量验证失败:\n${errorDetails}`)
  }

  return result.data
}

/**
 * 环境变量对象（惰性验证）
 */
export const env = validateEnv()

/**
 * 环境变量类型推断
 */
export type Env = z.infer<typeof envSchema>
