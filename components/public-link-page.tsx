import type { SocialLink, ExtraLink } from '@prisma/client'
import { getBackgroundFillStyle, isDarkBackground } from '@/lib/utils/background'
import { getSocialIcon, getPlatformName } from '@/components/preview/social-utils'

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
  const darkBackground = isDarkBackground(backgroundColor)
  const fillStyle = getBackgroundFillStyle(backgroundColor)
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

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={fillStyle}
    >
      <div className="w-full max-w-md animate-in fade-in duration-500">
        {/* 个人信息区域 */}
        <div className="mb-8 flex flex-col items-center">
          {/* 头像 */}
          {(avatar || userImage) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar || userImage!}
              alt={displayName || username}
              className="mb-4 h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white/50 transition-transform duration-200 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ${avatarFallbackClass}`}>
              <span className={`text-3xl font-bold ${avatarFallbackTextClass}`}>
                {(displayName || username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* 用户名/显示名称 */}
          <h1 className={`mb-2 text-center text-2xl font-bold tracking-tight ${profileTitleClass}`}>
            {displayName || username}
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
          {socialLinks.map((link) => {
            const Icon = getSocialIcon(link.platform)
            const platformName = getPlatformName(link.platform)

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${cardClass}`}
                style={{
                  marginBottom: `${linkSpacing}px`,
                  // 优化长列表渲染：content-visibility 允许浏览器跳过不可见内容的渲染
                  contentVisibility: socialLinks.length > 10 ? 'auto' : 'visible'
                }}
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
              className={`block rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${cardClass}`}
              style={{
                marginBottom: `${linkSpacing}px`,
                // 优化长列表渲染：content-visibility 允许浏览器跳过不可见内容的渲染
                contentVisibility: extraLinks.length > 10 ? 'auto' : 'visible'
              }}
            >
              {link.title}
              {link.description && (
                <p className={`mt-1 text-xs ${cardSubTextClass}`}>{link.description}</p>
              )}
            </a>
          ))}

          {/* 空状态提示 */}
          {socialLinks.length === 0 && extraLinks.length === 0 && (
            <div className={`rounded-lg border-2 border-dashed px-6 py-8 text-center text-sm ${emptyStateClass}`}>
              暂无链接
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
