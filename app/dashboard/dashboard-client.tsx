'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { LinkForm, type LinkFormData } from '@/components/link'
import { PhonePreview } from '@/components/preview'
import { saveLink } from './actions'
import type { LinkWithRelations } from '@/lib/services/link.service'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Dashboard Client 组件属性
 */
interface DashboardClientProps {
  /**
   * 初始链接数据
   */
  initialData: LinkWithRelations
}

/**
 * 将数据库的 Link 数据转换为表单数据格式
 */
function linkToFormData(link: LinkWithRelations): LinkFormData {
  return {
    username: link.username,
    displayName: link.displayName || link.user.name || undefined,
    bio: link.bio || undefined,
    avatar: link.avatar || link.user.image || undefined,
    backgroundType: 'solid',
    backgroundValue: link.backgroundValue,
    socialLinks: link.socialLinks.map((sl) => ({
      platform: sl.platform as LinkFormData['socialLinks'][number]['platform'],
      url: sl.url,
      isVisible: sl.isVisible,
    })),
    extraLinks: link.extraLinks.map((el) => ({
      title: el.title,
      url: el.url,
      description: el.description || undefined,
      icon: el.icon || undefined,
      isVisible: el.isVisible,
    })),
  }
}

/**
 * Dashboard Client 组件
 *
 * 处理表单提交、状态管理和预览更新
 */
export function DashboardClient({ initialData }: DashboardClientProps) {
  const initialFormData = useMemo(() => linkToFormData(initialData), [initialData])

  // 表单数据状态
  const [formData, setFormData] = useState<LinkFormData>(initialFormData)

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // 移动端预览显示状态
  const [showPreview, setShowPreview] = useState(false)

  // 完整 URL（仅客户端，用于显示）
  const [fullPublicUrl, setFullPublicUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullPublicUrl(`${window.location.origin}/${formData.username}`)
    }
  }, [formData.username])

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(async (data: LinkFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // 保存链接数据
      await saveLink(data)

      // 更新本地状态
      setFormData(data)

      // 显示成功消息
      setSubmitStatus({
        type: 'success',
        message: '保存成功！您的链接页面已更新。',
      })

      // 3秒后清除成功消息
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' })
      }, 3000)
    } catch (error) {
      // 显示错误消息
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '保存失败，请重试。',
      })

      // 5秒后清除错误消息
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' })
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  /**
   * 处理表单数据变化（用于实时预览）
   */
  const handleFormChange = useCallback((data: LinkFormData) => {
    setFormData(data)
    setSubmitStatus((current) =>
      current.type === null && current.message === ''
        ? current
        : { type: null, message: '' }
    )
  }, [])

  /**
   * 获取公开页面 URL（使用相对路径避免 hydration 不匹配）
   */
  const publicPageUrl = `/${formData.username}`

  return (
    <div className="space-y-6">
      {/* 状态消息 */}
      {submitStatus.type && (
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
            submitStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{submitStatus.message}</span>
        </div>
      )}

      {/* 移动端预览切换按钮 */}
      <div className="flex md:hidden justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4" />
              编辑模式
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              预览模式
            </>
          )}
        </Button>
      </div>

      {/* 主内容区域 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 表单区域 - 65% (8/12) */}
        <div className={`lg:col-span-8 ${showPreview ? 'hidden' : 'block'}`}>
          <Card>
            <CardContent className="pt-6">
              <LinkForm
                defaultValues={initialFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitButtonText="保存更改"
                onFormDataChange={handleFormChange}
              />

              {/* 公开页面链接 */}
              <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground mb-2">您的公开页面</p>
                <a
                  href={publicPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:opacity-80"
                >
                  {fullPublicUrl || publicPageUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 预览区域 - 35% (4/12) */}
        <div
          className={`lg:col-span-4 flex items-start justify-center ${showPreview ? 'block' : 'hidden lg:flex'}`}
        >
          <div className="sticky top-6 w-full">
            <Card>
              <CardContent className="pt-6">
                <PhonePreview
                  username={formData.username}
                  displayName={formData.displayName}
                  bio={formData.bio}
                  avatar={formData.avatar}
                  backgroundType={formData.backgroundType}
                  backgroundValue={formData.backgroundValue}
                  socialLinks={formData.socialLinks}
                  extraLinks={formData.extraLinks}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 提交中的遮罩层 */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">保存中...</span>
          </div>
        </div>
      )}
    </div>
  )
}
