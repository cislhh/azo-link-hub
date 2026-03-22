import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOrCreateUserLink } from './actions'
import { DashboardClient } from './dashboard-client'
import { LogoutButton } from '@/components/logout-button'

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {session.user.name && (
                <span className="text-sm text-muted-foreground">{session.user.name}</span>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardClient initialData={linkData} />
      </main>
    </div>
  )
}
