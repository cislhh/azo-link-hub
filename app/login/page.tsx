import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * 登录页面
 *
 * 支持的认证方式：
 * - Google OAuth
 *
 * 登录流程：
 * 1. 用户点击"使用 Google 登录"按钮
 * 2. 重定向到 Google OAuth 授权页面
 * 3. 用户授权后重定向回应用
 * 4. 创建会话并重定向到首页或 callbackUrl 指定的页面
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl = '/dashboard' } = await searchParams

  // 检查用户是否已登录
  const session = await auth()
  if (session?.user) {
    // 已登录用户重定向到 dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo 和标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Azo Link Hub</h1>
          <p className="mt-2 text-sm text-gray-600">
            一个简单的链接聚合平台
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="space-y-6">
            {/* 欢迎信息 */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                欢迎回来
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                使用您的 Google 账号登录
              </p>
            </div>

            {/* Google OAuth 登录按钮 */}
            <form
              action={async () => {
                'use server'
                // NextAuth v5 正确的 signIn 调用方式
                await signIn('google', undefined, {
                  redirectTo: callbackUrl,
                  // 通过 queryParams 传递 prompt 参数
                  prompt: 'select_account',
                })
              }}
              className="space-y-4"
            >
              <button
                type="submit"
                className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {/* Google Logo */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>

                <span>使用 Google 继续</span>
              </button>
            </form>

            {/* 提示信息 */}
            <div className="text-center text-xs text-gray-500">
              <p>登录即表示您同意我们的服务条款和隐私政策</p>
            </div>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 Azo Link Hub. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
