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
  DATABASE_URL: z.string().url('DATABASE_URL 必须是有效的 URL'),
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

/**
 * 解析并验证环境变量
 *
 * @throws {Error} 如果环境变量验证失败
 */
export const env = envSchema.parse(process.env)

/**
 * 环境变量类型推断
 */
export type Env = z.infer<typeof envSchema>
