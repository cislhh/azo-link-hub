import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 路由保护 Proxy
 *
 * Next.js 16.1.6+ 使用 proxy.ts 替代 middleware.ts
 *
 * 功能：
 * - 保护需要认证的路由
 * - 重定向未登录用户到登录页
 * - 允许已登录用户访问受保护路由
 *
 * 公开路由（不需要认证）：
 * - / (首页)
 * - /login (登录页)
 * - /api/auth/* (NextAuth API 路由)
 * - /_next/* (Next.js 内部路由)
 * - /favicon.ico, 静态资源
 *
 * 受保护路由（需要认证）：
 * - /dashboard (仪表盘)
 * - /profile (个人资料)
 * - /settings (设置)
 * - /account/* (账户相关)
 */
export async function proxy(request: NextRequest) {
  // 获取请求路径
  const path = request.nextUrl.pathname

  // 定义公开路由（不需要认证）
  const isPublicRoute =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/static') ||
    path.includes('.')

  // 如果是公开路由，直接放行（不加载 auth）
  if (isPublicRoute) {
    return undefined
  }

  // 定义受保护路由（需要认证）
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/profile') ||
    path.startsWith('/settings') ||
    path.startsWith('/account')

  // 只有受保护路由才检查会话
  if (isProtectedRoute) {
    // 动态导入 auth，避免在 Edge Runtime 中加载 Prisma
    const { auth } = await import('@/lib/auth')
    const session = await auth()

    // 如果访问受保护路由但未登录，重定向到登录页
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      // 保存原始 URL，登录后重定向回来
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 公开路由或已登录用户，放行
  return undefined
}

/**
 * 配置 Proxy 匹配的路由
 *
 * matcher 配置说明：
 * - 使用正则表达式匹配需要 Proxy 处理的路由
 * - 排除静态资源、_next 内部路由、API 路由等
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
