import { handlers } from '@/lib/auth'

/**
 * NextAuth.js API 路由处理器
 *
 * 这是 NextAuth.js 的主要 API 路由，处理所有认证相关的请求：
 * - GET: 处理认证页面的渲染和会话获取
 * - POST: 处理登录、登出和其他认证操作
 *
 * 路由模式: /api/auth/[...nextauth]
 * - [...nextauth] 是一个捕获所有路由段的动态路由
 * - 它匹配所有以 /api/auth/ 开头的路径
 *
 * 示例路径：
 * - /api/auth/signin - 登录页面
 * - /api/auth/signout - 登出
 * - /api/auth/session - 获取当前会话
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - 可用的认证提供商
 * - /api/auth/callback/google - Google OAuth 回调
 */

/**
 * GET 请求处理器
 *
 * 处理所有 GET 请求到 /api/auth/*
 *
 * @param request - Next.js Request 对象
 * @returns Next.js Response 对象
 */
export const GET = handlers.GET

/**
 * POST 请求处理器
 *
 * 处理所有 POST 请求到 /api/auth/*
 *
 * @param request - Next.js Request 对象
 * @returns Next.js Response 对象
 */
export const POST = handlers.POST
