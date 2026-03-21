import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { linkService } from '@/lib/services/link.service'
import { PublicLinkPage } from '@/components/public-link-page'

/**
 * 根据 username 获取链接数据
 *
 * @param username - 用户名
 * @returns 包含关联数据的 Link 对象或 null
 */
async function getUserLink(username: string) {
  const link = await linkService.getLinkByUsername(username)
  return link
}

/**
 * 生成页面元数据（SEO）
 *
 * @param params - 路由参数（Promise）
 * @returns 元数据对象
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const link = await getUserLink(username)

  if (!link) {
    return {
      title: '链接不存在',
    }
  }

  const title = link.displayName || link.username
  const description = link.bio || `查看 ${title} 的链接`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      // TODO: 添加 OG 图片生成后使用
      // images: link.shareImageUrl ? [{ url: link.shareImageUrl }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      // TODO: 添加 OG 图片生成后使用
      // images: link.shareImageUrl ? [link.shareImageUrl] : [],
    },
  }
}

/**
 * 公开链接页面
 *
 * 动态路由页面，展示用户的链接聚合页面
 *
 * @param params - 路由参数（Promise）
 * @returns 页面 JSX 或 404
 */
export default async function UserLinkPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const link = await getUserLink(username)

  // 如果链接不存在或未激活，返回 404
  if (!link) {
    notFound()
  }

  return (
    <PublicLinkPage
      username={link.username}
      displayName={link.displayName}
      bio={link.bio}
      avatar={link.avatar}
      userImage={link.user.image}
      backgroundColor={link.backgroundValue}
      socialLinks={link.socialLinks}
      extraLinks={link.extraLinks}
    />
  )
}
