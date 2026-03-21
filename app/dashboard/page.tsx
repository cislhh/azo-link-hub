import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOrCreateUserLink } from './actions'
import { DashboardClient } from './dashboard-client'

/**
 * Dashboard 页面
 *
 * 用户可以在这里编辑他们的链接页面信息
 * - 左侧 65%：表单编辑区域
 * - 右侧 35%：实时预览区域
 */
export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 获取或创建用户的链接数据
  const linkData = await getOrCreateUserLink()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {session.user.name && (
                <span className="text-sm text-gray-600">{session.user.name}</span>
              )}
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  登出
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardClient initialData={linkData} userName={session.user.name ?? ''} />
      </main>
    </div>
  )
}
