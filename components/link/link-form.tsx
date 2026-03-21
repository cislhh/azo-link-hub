'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundSelector } from './background-selector'
import { SocialLinksForm, SocialLink } from './social-links-form'
import { ExtraLinksForm, ExtraLink } from './extra-links-form'
import {
  usernameSchema,
  displayNameSchema,
  bioSchema,
  avatarSchema,
  backgroundTypeEnum,
  backgroundValueSchema,
  socialPlatformEnum,
} from '@/lib/utils/validation'

function toPreviewData(value: Partial<LinkFormData> | undefined): LinkFormData {
  return {
    username: value?.username ?? '',
    displayName: value?.displayName ?? '',
    bio: value?.bio ?? '',
    avatar: value?.avatar ?? '',
    backgroundType: 'solid',
    backgroundValue: value?.backgroundValue ?? '#ffffff',
    socialLinks: value?.socialLinks ?? [],
    extraLinks: value?.extraLinks ?? [],
  }
}

/**
 * 链接表单数据类型（明确定义）
 */
export interface LinkFormData {
  username: string
  displayName?: string
  bio?: string
  avatar?: string
  backgroundType: 'solid'
  backgroundValue: string
  socialLinks: SocialLink[]
  extraLinks: ExtraLink[]
}

/**
 * 链接表单验证 Schema
 */
const linkFormSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  avatar: avatarSchema,
  backgroundType: backgroundTypeEnum,
  backgroundValue: backgroundValueSchema,
  socialLinks: z
    .array(
      z.object({
        platform: socialPlatformEnum,
        url: z.string().url('链接必须是有效的URL'),
        isVisible: z.boolean(),
      })
    )
    .min(0),
  extraLinks: z
    .array(
      z.object({
        title: z.string().min(1, '链接标题至少1个字符').max(50, '链接标题最多50个字符'),
        url: z.string().url('链接必须是有效的URL'),
        description: z.string().max(200, '链接描述最多200个字符').optional(),
        icon: z.string().max(50, '图标名称最多50个字符').optional(),
        isVisible: z.boolean(),
      })
    )
    .min(0),
})

/**
 * 链接表单组件属性
 */
interface LinkFormProps {
  /**
   * 初始表单数据
   */
  defaultValues?: Partial<LinkFormData>
  /**
   * 表单提交回调
   */
  onSubmit: (data: LinkFormData) => void | Promise<void>
  /**
   * 表单提交中状态
   */
  isSubmitting?: boolean
  /**
   * 提交按钮文本
   */
  submitButtonText?: string
  /**
   * 表单数据变化回调（用于实时预览）
   */
  onFormDataChange?: (data: LinkFormData) => void
}

/**
 * 链接表单组件
 *
 * 用于创建和编辑用户链接页面信息
 */
export function LinkForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = '保存',
  onFormDataChange,
}: LinkFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      username: '',
      displayName: '',
      bio: '',
      avatar: '',
      backgroundType: 'solid',
      backgroundValue: '#ffffff',
      socialLinks: [],
      extraLinks: [],
      ...defaultValues,
    },
  })

  const backgroundValue = useWatch({
    control,
    name: 'backgroundValue',
  })
  const watchedFormData = useWatch({ control })
  const socialLinks = useWatch({
    control,
    name: 'socialLinks',
  })
  const extraLinks = useWatch({
    control,
    name: 'extraLinks',
  })

  useEffect(() => {
    if (!onFormDataChange) {
      return
    }

    onFormDataChange(toPreviewData(watchedFormData))
  }, [watchedFormData, onFormDataChange])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>设置您的链接页面基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">
              用户名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="例如: johndoe"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20个字符，只能包含字母、数字、下划线和连字符
            </p>
          </div>

          {/* 显示名称 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">显示名称</Label>
            <Input
              id="displayName"
              placeholder="例如: John Doe"
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              1-50个字符，将显示在您的链接页面上
            </p>
          </div>

          {/* 简介 */}
          <div className="space-y-2">
            <Label htmlFor="bio">简介</Label>
            <Textarea
              id="bio"
              placeholder="介绍一下您自己..."
              rows={3}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">最多500个字符</p>
          </div>

          {/* 头像 */}
          <div className="space-y-2">
            <Label htmlFor="avatar">头像 URL</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatar')}
            />
            {errors.avatar && (
              <p className="text-sm text-destructive">{errors.avatar.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              请输入有效的图片 URL 地址
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 背景设置 */}
      <Card>
        <CardHeader>
          <CardTitle>背景设置</CardTitle>
          <CardDescription>选择您链接页面的背景颜色</CardDescription>
        </CardHeader>
        <CardContent>
          <BackgroundSelector
            value={backgroundValue ?? '#ffffff'}
            onChange={(value) => setValue('backgroundValue', value)}
          />
        </CardContent>
      </Card>

      {/* 社交媒体链接 */}
      <Card>
        <CardHeader>
          <CardTitle>社交媒体链接</CardTitle>
          <CardDescription>添加您的社交媒体账号链接</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLinksForm
            value={socialLinks ?? []}
            onChange={(value) => setValue('socialLinks', value)}
          />
        </CardContent>
      </Card>

      {/* 额外链接 */}
      <Card>
        <CardHeader>
          <CardTitle>额外链接</CardTitle>
          <CardDescription>添加自定义链接到您的页面</CardDescription>
        </CardHeader>
        <CardContent>
          <ExtraLinksForm
            value={extraLinks ?? []}
            onChange={(value) => setValue('extraLinks', value)}
          />
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : submitButtonText}
        </Button>
      </div>
    </form>
  )
}
