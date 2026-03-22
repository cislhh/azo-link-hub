'use client'

import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

/**
 * 登出按钮组件
 *
 * 在服务器端清除 cookies 后，在客户端清除所有缓存和本地存储
 * 确保下次登录时可以选择不同的 Google 账号
 */
export function LogoutButton() {
  const { pending } = useFormStatus()
  const router = useRouter()

  const handleLogout = async (formData: FormData) => {
    // 1. 调用服务器端的登出 action
    await logoutAction()

    // 2. 清除客户端存储（登出后执行）
    try {
      // 清除 localStorage
      localStorage.clear()

      // 清除 sessionStorage
      sessionStorage.clear()

      // 清除所有 indexedDB
      if (window.indexedDB) {
        const databases = await indexedDB.databases()
        await Promise.all(
          databases.map((db) => {
            const dbName = db.name
            if (dbName) {
              return new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName)
                request.onsuccess = () => resolve()
                request.onerror = () => reject(request.error)
              })
            }
            return Promise.resolve()
          })
        )
      }
    } catch (error) {
      console.error('Error clearing client storage:', error)
    }

    // 3. 使用 replace 而不是 push，避免浏览器历史记录
    router.replace('/')
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {pending ? '登出中...' : '登出'}
      </button>
    </form>
  )
}
