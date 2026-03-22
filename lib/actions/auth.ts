'use server'

import { signOut } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * 登出 Server Action
 *
 * 功能：
 * 1. 清除所有 NextAuth cookies（服务器端）
 * 2. 清除所有相关认证 cookies
 * 3. 调用 NextAuth signOut
 * 4. 重定向到首页并强制刷新，确保清除客户端状态
 *
 * 确保完全清除认证状态，防止刷新页面后自动登录
 */
export async function logoutAction() {
  const cookieStore = await cookies()

  // 1. 清除所有 NextAuth 相关的 cookies（服务器端）
  const allCookies = cookieStore.getAll()

  // 清除所有认证相关的 cookies
  for (const cookie of allCookies) {
    const name = cookie.name

    // 清除所有包含以下关键词的 cookies
    if (
      name.includes('next-auth') ||      // NextAuth cookies
      name.includes('__Secure') ||        // Secure cookies
      name.includes('auth') ||            // 其他 auth cookies
      name.startsWith('pk_test_') ||      // Clerk keys (根据你的 cookie)
      name.startsWith('sk_test_') ||      // Clerk secrets
      name.includes('__clerk') ||         // Clerk cookies
      name.includes('active_theme')       // 主题 cookies（可选）
    ) {
      try {
        cookieStore.delete(name)
      } catch (error) {
        // 忽略删除失败的 cookie
        console.debug(`Failed to delete cookie ${name}:`, error)
      }
    }
  }

  // 2. 调用 NextAuth signOut
  try {
    await signOut({ redirect: false })
  } catch (error) {
    // 即使 signOut 失败也继续（cookie 已手动清除）
    console.error('SignOut error:', error)
  }

  // 3. 重定向到首页，添加时间戳防止缓存
  const timestamp = Date.now()
  redirect(`/?t=${timestamp}`)
}
