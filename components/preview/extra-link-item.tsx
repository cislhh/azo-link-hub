import { ExtraLink } from '../link/extra-links-form'

/**
 * 额外链接项组件属性
 */
interface ExtraLinkItemProps {
  link: ExtraLink
  index: number
  linkSpacing: number
  cardClass: string
  cardSubTextClass: string
  totalLinks?: number // 总链接数，用于判断是否需要 content-visibility
}

/**
 * 额外链接项组件
 *
 * 单独的额外链接显示组件，从 PhonePreview 中提取
 */
export function ExtraLinkItem({ link, index, linkSpacing, cardClass, cardSubTextClass, totalLinks = 0 }: ExtraLinkItemProps) {
  if (!link.isVisible) return null

  return (
    <a
      key={`extra-${index}`}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm transition-all hover:shadow-md ${cardClass}`}
      style={{
        marginBottom: `${linkSpacing}px`,
        // 优化长列表渲染：超过 10 个链接时启用 content-visibility
        contentVisibility: totalLinks > 10 ? 'auto' : 'visible'
      }}
    >
      {link.title}
      {link.description && (
        <p className={`mt-1 text-xs ${cardSubTextClass}`}>{link.description}</p>
      )}
    </a>
  )
}
