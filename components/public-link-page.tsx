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
} from 'lucide-react'
import type { SocialLink, ExtraLink } from '@prisma/client'

/**
 * 公开链接页面属性
 */
export interface PublicLinkPageProps {
  /**
   * 用户名
   */
  username: string
  /**
   * 显示名称
   */
  displayName?: string | null
  /**
   * 简介
   */
  bio?: string | null
  /**
   * 头像 URL
   */
  avatar?: string | null
  /**
   * 用户图片（来自 Auth.js）
   */
  userImage?: string | null
  /**
   * 背景颜色值
   */
  backgroundColor: string
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
 * 获取社交平台显示名称
 */
function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
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
  }
  return names[platform] || platform
}

/**
 * 公开链接页面组件
 *
 * 移动端优先的单栏布局，展示用户的社交链接和额外链接
 */
export function PublicLinkPage({
  username,
  displayName,
  bio,
  avatar,
  userImage,
  backgroundColor,
  socialLinks,
  extraLinks,
}: PublicLinkPageProps) {
  /**
   * 黄金比例间距（约 1.618）
   */
  const goldenRatio = 1.618
  const baseSpacing = 12 // 基础间距
  const linkSpacing = Math.round(baseSpacing * goldenRatio) // 约 19px，取整为 20px

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-md">
        {/* 个人信息区域 */}
        <div className="mb-8 flex flex-col items-center">
          {/* 头像 */}
          {(avatar || userImage) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar || userImage!}
              alt={displayName || username}
              className="mb-4 h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white/50"
            />
          ) : (
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg ring-4 ring-white/50">
              <span className="text-3xl font-bold text-gray-500">
                {(displayName || username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* 用户名/显示名称 */}
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {displayName || username}
          </h1>

          {/* 简介 */}
          {bio && (
            <p className="text-center text-sm text-gray-700 leading-relaxed max-w-[280px]">
              {bio}
            </p>
          )}
        </div>

        {/* 链接区域 */}
        <div className="space-y-0">
          {/* 社交链接 */}
          {socialLinks.map((link) => {
            const Icon = getSocialIcon(link.platform)
            const platformName = getPlatformName(link.platform)

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                style={{ marginBottom: `${linkSpacing}px` }}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{platformName}</span>
              </a>
            )
          })}

          {/* 额外链接 */}
          {extraLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              style={{ marginBottom: `${linkSpacing}px` }}
            >
              {link.title}
              {link.description && (
                <p className="mt-1 text-xs text-gray-500">{link.description}</p>
              )}
            </a>
          ))}

          {/* 空状态提示 */}
          {socialLinks.length === 0 && extraLinks.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white/50 px-6 py-8 text-center text-sm text-gray-500">
              暂无链接
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
