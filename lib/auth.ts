import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { env } from './env'

/**
 * NextAuth.js 配置
 *
 * 配置项说明：
 * - providers: OAuth 提供商（当前仅支持 Google）
 * - adapter: Prisma 适配器，用于数据库持久化
 * - callbacks: 认证回调函数（signIn, session, jwt）
 * - pages: 自定义页面（登录页、错误页）
 * - session: 会话策略（JWT）
 * - trustHost: 信任主机（开发环境）
 */
export const nextAuthConfig: NextAuthConfig = {
  // 配置 OAuth 提供商
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      // 允许测试环境使用 HTTP
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // 使用 Prisma 适配器
  adapter: PrismaAdapter(prisma),

  // 自定义回调函数
  callbacks: {
    /**
     * signIn 回调
     *
     * 控制用户是否可以登录
     * - 仅允许 Google OAuth 登录
     */
    async signIn({ account }) {
      // 仅允许 Google OAuth 登录
      if (account?.provider !== 'google') {
        return false
      }
      return true
    },

    /**
     * session 回调
     *
     * 将用户信息添加到会话对象中
     */
    async session({ session, token }) {
      // 确保 session.user 存在
      if (!session.user) {
        session.user = {} as any
      }

      // 将用户 ID 添加到会话
      if (token.sub) {
        session.user.id = token.sub
      }

      // 将用户信息添加到会话
      if (token.email) {
        session.user.email = token.email
      }
      if (token.name) {
        session.user.name = token.name
      }
      if (token.picture) {
        session.user.image = token.picture as string
      }

      return session
    },

    /**
     * jwt 回调
     *
     * 在 JWT token 中存储用户信息
     */
    async jwt({ token, user }) {
      // 首次登录时，将用户 ID 添加到 token
      if (user) {
        token.sub = user.id
      }

      // 保留 token 中的其他信息
      if (token.email) {
        token.email = token.email
      }
      if (token.name) {
        token.name = token.name
      }
      if (token.picture) {
        token.picture = token.picture
      }

      return token
    },
  },

  // 自定义页面
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // 会话配置
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 信任主机（开发环境）
  trustHost: true,
}

/**
 * 导出 NextAuth 配置获取函数
 *
 * 用于 API 路由和中间件
 */
export function getNextAuthConfig() {
  return nextAuthConfig
}

/**
 * 导出 NextAuth 处理程序
 *
 * 用于 API 路由
 */
export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig)
