'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Send,
  MessageCircle,
  Mail,
  Globe,
  Link as LinkIcon,
  Clock,
  Wifi,
  Battery,
} from 'lucide-react'
import { SocialLink } from '../link/social-links-form'
import { ExtraLink } from '../link/extra-links-form'
import { getBackgroundFillStyle, isDarkBackground } from '@/lib/utils/background'

/**
 * 手机预览组件属性
 */
export interface PhonePreviewProps {
  /**
   * 用户名
   */
  username?: string
  /**
   * 显示名称
   */
  displayName?: string
  /**
   * 简介
   */
  bio?: string
  /**
   * 头像 URL
   */
  avatar?: string
  /**
   * 背景类型（目前只支持纯色）
   */
  backgroundType?: 'solid'
  /**
   * 背景颜色值
   */
  backgroundValue: string
  /**
   * 社交链接列表
   */
  socialLinks: SocialLink[]
  /**
   * 额外链接列表
   */
  extraLinks: ExtraLink[]
}

/**
 * 社交平台图标映射
 */
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  telegram: Send,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  tiktok: LinkIcon,
}

/**
 * 获取社交平台图标
 */
function getSocialIcon(platform: string): React.ComponentType<{ className?: string }> {
  return SOCIAL_ICONS[platform] || LinkIcon
}

/**
 * 手机预览组件
 *
 * 实时展示用户链接页面的最终效果，使用 iPhone 风格的外框设计
 */
export function PhonePreview({
  username,
  displayName,
  bio,
  avatar,
  backgroundValue,
  socialLinks,
  extraLinks,
}: PhonePreviewProps) {
  /**
   * 当前时间（仅客户端渲染）
   */
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  /**
   * 黄金比例间距（约 1.618）
   */
  const goldenRatio = 1.618
  const baseSpacing = 12 // 基础间距
  const linkSpacing = Math.round(baseSpacing * goldenRatio) // 约 19px，取整为 20px
  const darkBackground = useMemo(
    () => isDarkBackground(backgroundValue),
    [backgroundValue]
  )
  const backgroundFillStyle = useMemo(
    () => getBackgroundFillStyle(backgroundValue),
    [backgroundValue]
  )

  const profileTitleClass = darkBackground ? 'text-white' : 'text-gray-900'
  const profileBioClass = darkBackground ? 'text-gray-100' : 'text-gray-700'
  const cardClass = darkBackground
    ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
    : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
  const cardSubTextClass = darkBackground ? 'text-gray-200' : 'text-gray-500'
  const emptyStateClass = darkBackground
    ? 'border-white/30 bg-white/10 text-gray-100'
    : 'border-gray-300 bg-white/50 text-gray-500'
  const avatarFallbackClass = darkBackground
    ? 'bg-gradient-to-br from-gray-700 to-gray-800 ring-white/20'
    : 'bg-gradient-to-br from-gray-200 to-gray-300 ring-white/50'
  const avatarFallbackTextClass = darkBackground ? 'text-gray-100' : 'text-gray-500'

  /**
   * 渲染社交链接项
   */
  const renderSocialLink = (link: SocialLink, index: number) => {
    if (!link.isVisible) return null

    const Icon = getSocialIcon(link.platform)
    const platformName =
      {
        github: 'GitHub',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        instagram: 'Instagram',
        youtube: 'YouTube',
        facebook: 'Facebook',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
        website: 'Website',
        tiktok: 'TikTok',
      }[link.platform] || link.platform

    return (
      <a
        key={`social-${index}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm transition-all hover:shadow-md ${cardClass}`}
        style={{ marginBottom: `${linkSpacing}px` }}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">{platformName}</span>
      </a>
    )
  }

  /**
   * 渲染额外链接项
   */
  const renderExtraLink = (link: ExtraLink, index: number) => {
    if (!link.isVisible) return null

    return (
      <a
        key={`extra-${index}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm transition-all hover:shadow-md ${cardClass}`}
        style={{ marginBottom: `${linkSpacing}px` }}
      >
        {link.title}
        {link.description && (
          <p className={`mt-1 text-xs ${cardSubTextClass}`}>{link.description}</p>
        )}
      </a>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* 手机外框 */}
      <div className="relative">
        {/* iPhone 风格外框 */}
        <div className="relative w-[320px] rounded-[48px] border-[14px] border-gray-900 bg-white shadow-2xl">
          {/* 侧边按钮 */}
          <div className="absolute -left-[2px] top-[120px] h-[24px] w-[2px] rounded-l-sm bg-gray-800" />
          <div className="absolute -left-[2px] top-[160px] h-[48px] w-[2px] rounded-l-sm bg-gray-800" />
          <div className="absolute -left-[2px] top-[220px] h-[48px] w-[2px] rounded-l-sm bg-gray-800" />
          <div className="absolute -right-[2px] top-[180px] h-[64px] w-[2px] rounded-r-sm bg-gray-800" />

          {/* 屏幕区域 */}
          <div className="overflow-hidden rounded-[34px]">
            {/* 状态栏 */}
            <div className="flex items-center justify-between px-6 py-2 text-xs font-medium text-gray-900">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span suppressHydrationWarning>{currentTime || '--:--'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <Battery className="h-3 w-3" />
              </div>
            </div>

            {/* 内容区域（可滚动） */}
            <div
              className="h-[600px] overflow-y-auto px-4 pb-8"
              style={{
                ...backgroundFillStyle,
                scrollbarWidth: 'thin',
                scrollbarColor: darkBackground
                  ? 'rgba(255, 255, 255, 0.28) transparent'
                  : 'rgba(0, 0, 0, 0.2) transparent',
              }}
            >
              {/* 个人信息区域 */}
              <div className="mb-6 mt-4 flex flex-col items-center">
                {/* 头像 */}
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={displayName || username || 'Avatar'}
                    className="mb-4 h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white/50"
                  />
                ) : (
                  <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ${avatarFallbackClass}`}>
                    <span className={`text-3xl font-bold ${avatarFallbackTextClass}`}>
                      {(displayName || username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}

                {/* 用户名/显示名称 */}
                <h1 className={`mb-2 text-center text-xl font-bold ${profileTitleClass}`}>
                  {displayName || username || '用户名称'}
                </h1>

                {/* 简介 */}
                {bio && (
                  <p className={`max-w-[280px] text-center text-sm leading-relaxed ${profileBioClass}`}>
                    {bio}
                  </p>
                )}
              </div>

              {/* 链接区域 */}
              <div className="space-y-0">
                {/* 社交链接 */}
                {socialLinks
                  .filter((link) => link.isVisible && link.url)
                  .map((link, index) => renderSocialLink(link, index))}

                {/* 额外链接 */}
                {extraLinks
                  .filter((link) => link.isVisible && link.url)
                  .map((link, index) => renderExtraLink(link, index))}

                {/* 空状态提示 */}
                {socialLinks.filter((l) => l.isVisible).length === 0 &&
                  extraLinks.filter((l) => l.isVisible).length === 0 && (
                    <div className={`rounded-lg border-2 border-dashed px-6 py-8 text-center text-sm ${emptyStateClass}`}>
                      暂无链接
                    </div>
                  )}
              </div>

              {/* 底部留白（为 Home Indicator 留出空间） */}
              <div className="h-4" />
            </div>

            {/* Home Indicator */}
            <div className="flex justify-center pb-2">
              <div className="h-1 w-32 rounded-full bg-gray-900" />
            </div>
          </div>
        </div>

        {/* 手机底部标签 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">实时预览</p>
        </div>
      </div>
    </div>
  )
}
