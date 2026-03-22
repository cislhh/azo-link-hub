import { SocialLink } from '../link/social-links-form'
import { getSocialIcon, getPlatformName } from './social-utils'

/**
 * 社交链接项组件属性
 */
interface SocialLinkItemProps {
  link: SocialLink
  index: number
  linkSpacing: number
  cardClass: string
  totalLinks?: number // 总链接数，用于判断是否需要 content-visibility
}

/**
 * 社交链接项组件
 *
 * 单独的社交链接显示组件，从 PhonePreview 中提取
 */
export function SocialLinkItem({ link, index, linkSpacing, cardClass, totalLinks = 0 }: SocialLinkItemProps) {
  if (!link.isVisible) return null

  const Icon = getSocialIcon(link.platform)
  const platformName = getPlatformName(link.platform)

  return (
    <a
      key={`social-${index}`}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm transition-all hover:shadow-md ${cardClass}`}
      style={{
        marginBottom: `${linkSpacing}px`,
        // 优化长列表渲染：超过 10 个链接时启用 content-visibility
        contentVisibility: totalLinks > 10 ? 'auto' : 'visible'
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 text-left">{platformName}</span>
    </a>
  )
}
