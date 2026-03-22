/**
 * Link Service
 *
 * 提供 Link 模型的 CRUD 操作
 * 使用 TDD 方法开发
 */

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import { cache } from 'react'
import type {
  Link,
  SocialLink,
  ExtraLink,
  User,
} from '@prisma/client'
import type {
  CreateLinkInput,
  UpdateLinkInput,
  SocialLinkInput,
  ExtraLinkInput,
} from '@/lib/utils/validation'

/**
 * Link 关联数据类型
 */
export type LinkWithRelations = Link & {
  user: Pick<User, 'id' | 'name' | 'image'>
  socialLinks: SocialLink[]
  extraLinks: ExtraLink[]
}

/**
 * 创建链接输入类型（简化版，用于服务层）
 */
export type CreateLinkServiceInput = {
  username: string
  displayName?: string | null
  bio?: string | null
  avatar?: string | null
  backgroundType?: string
  backgroundValue: string
  shareImageUrl?: string | null
  socialLinks?: SocialLinkInput[]
  extraLinks?: ExtraLinkInput[]
}

/**
 * 更新链接输入类型（简化版，用于服务层）
 */
export type UpdateLinkServiceInput = {
  username?: string
  displayName?: string | null
  bio?: string | null
  avatar?: string | null
  backgroundType?: string
  backgroundValue?: string
  shareImageUrl?: string | null
  socialLinks?: SocialLinkInput[]
  extraLinks?: ExtraLinkInput[]
}

/**
 * Link 服务类
 *
 * 封装 Link 相关的业务逻辑和数据访问操作
 */
export class LinkService {
  /**
   * 根据 ID 获取链接
   *
   * @param id - Link ID
   * @returns Link 对象或 null
   */
  async getLinkById(id: string): Promise<Link | null> {
    if (!id) {
      return null
    }

    try {
      const link = await prisma.link.findUnique({
        where: { id },
      })
      return link
    } catch (error) {
      throw new AppError('获取链接失败', 'GET_LINK_ERROR', error)
    }
  }

  /**
   * 获取包含关联数据的链接
   *
   * @param id - Link ID
   * @returns 包含社交链接和额外链接的 Link 对象或 null
   */
  async getLinkWithRelations(id: string): Promise<LinkWithRelations | null> {
    if (!id) {
      return null
    }

    try {
      const link = await prisma.link.findUnique({
        where: { id },
        include: {
          user: true,
          socialLinks: {
            orderBy: { order: 'asc' },
          },
          extraLinks: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!link) {
        return null
      }

      // 确保关联数据始终为数组
      return {
        ...link,
        socialLinks: link.socialLinks ?? [],
        extraLinks: link.extraLinks ?? [],
      }
    } catch (error) {
      throw new AppError('获取链接失败', 'GET_LINK_ERROR', error)
    }
  }

  /**
   * 根据用户 ID 获取链接
   *
   * @param userId - 用户 ID
   * @returns Link 对象或 null
   */
  async getLinkByUserId(userId: string): Promise<Link | null> {
    if (!userId) {
      return null
    }

    try {
      const link = await prisma.link.findUnique({
        where: { userId },
      })
      return link
    } catch (error) {
      throw new AppError('获取链接失败', 'GET_LINK_ERROR', error)
    }
  }

  /**
   * 根据 username 获取公开链接
   *
   * @param username - 用户名
   * @returns 包含社交链接和额外链接的 Link 对象或 null
   */
  async getLinkByUsername(username: string): Promise<LinkWithRelations | null> {
    if (!username) {
      return null
    }

    try {
      const link = await prisma.link.findUnique({
        where: { username },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          socialLinks: {
            where: { isVisible: true },
            orderBy: { order: 'asc' },
          },
          extraLinks: {
            where: { isVisible: true },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!link || !link.isActive) {
        return null
      }

      // 确保关联数据始终为数组
      return {
        ...link,
        socialLinks: link.socialLinks ?? [],
        extraLinks: link.extraLinks ?? [],
      }
    } catch (error) {
      throw new AppError('获取链接失败', 'GET_LINK_ERROR', error)
    }
  }

  /**
   * 创建新链接
   *
   * 注意：每个用户只能有一个 Link，如果已存在则抛出错误
   *
   * @param userId - 用户 ID
   * @param data - 链接创建数据
   * @returns 创建的 Link 对象
   */
  async createLink(userId: string, data: CreateLinkServiceInput): Promise<Link> {
    try {
      // 使用事务创建链接及其关联数据
      const link = await prisma.$transaction(async (tx) => {
        // 创建 Link
        const newLink = await tx.link.create({
          data: {
            userId,
            username: data.username,
            displayName: data.displayName ?? null,
            bio: data.bio ?? null,
            avatar: data.avatar ?? null,
            backgroundType: data.backgroundType ?? 'solid',
            backgroundValue: data.backgroundValue,
            shareImageUrl: data.shareImageUrl ?? '/api/placeholder/qrcode',
          },
        })

        // 创建社交链接
        if (data.socialLinks && data.socialLinks.length > 0) {
          await Promise.all(
            data.socialLinks.map((socialLink, index) =>
              tx.socialLink.create({
                data: {
                  linkId: newLink.id,
                  platform: socialLink.platform,
                  url: socialLink.url,
                  isVisible: socialLink.isVisible ?? true,
                  order: index,
                },
              })
            )
          )
        }

        // 创建额外链接
        if (data.extraLinks && data.extraLinks.length > 0) {
          await Promise.all(
            data.extraLinks.map((extraLink, index) =>
              tx.extraLink.create({
                data: {
                  linkId: newLink.id,
                  title: extraLink.title,
                  url: extraLink.url,
                  description: extraLink.description ?? null,
                  icon: extraLink.icon ?? null,
                  isVisible: extraLink.isVisible ?? true,
                  order: index,
                },
              })
            )
          )
        }

        return newLink
      })

      return link
    } catch (error) {
      // 检查是否是唯一约束冲突
      if ((error as any).code === 'P2002') {
        throw new AppError('用户已存在链接', 'LINK_ALREADY_EXISTS', error)
      }
      throw new AppError('创建链接失败', 'CREATE_LINK_ERROR', error)
    }
  }

  /**
   * 更新链接
   *
   * @param id - Link ID
   * @param data - 链接更新数据
   * @returns 更新后的 Link 对象或 null
   */
  async updateLink(id: string, data: UpdateLinkServiceInput): Promise<Link | null> {
    if (!id) {
      return null
    }

    try {
      // 使用事务更新链接及其关联数据
      const updated = await prisma.$transaction(async (tx) => {
        // 更新 Link 基本字段
        const link = await tx.link.update({
          where: { id },
          data: {
            ...(data.username !== undefined && { username: data.username }),
            ...(data.displayName !== undefined && { displayName: data.displayName }),
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.avatar !== undefined && { avatar: data.avatar }),
            ...(data.backgroundType !== undefined && { backgroundType: data.backgroundType }),
            ...(data.backgroundValue !== undefined && { backgroundValue: data.backgroundValue }),
            ...(data.shareImageUrl !== undefined && { shareImageUrl: data.shareImageUrl }),
          },
        })

        // 更新社交链接（替换全部）
        if (data.socialLinks !== undefined) {
          // 删除现有的社交链接
          await tx.socialLink.deleteMany({
            where: { linkId: id },
          })

          // 创建新的社交链接
          if (data.socialLinks.length > 0) {
            await Promise.all(
              data.socialLinks.map((socialLink, index) =>
                tx.socialLink.create({
                  data: {
                    linkId: id,
                    platform: socialLink.platform,
                    url: socialLink.url,
                    isVisible: socialLink.isVisible ?? true,
                    order: index,
                  },
                })
              )
            )
          }
        }

        // 更新额外链接（替换全部）
        if (data.extraLinks !== undefined) {
          // 删除现有的额外链接
          await tx.extraLink.deleteMany({
            where: { linkId: id },
          })

          // 创建新的额外链接
          if (data.extraLinks.length > 0) {
            await Promise.all(
              data.extraLinks.map((extraLink, index) =>
                tx.extraLink.create({
                  data: {
                    linkId: id,
                    title: extraLink.title,
                    url: extraLink.url,
                    description: extraLink.description ?? null,
                    icon: extraLink.icon ?? null,
                    isVisible: extraLink.isVisible ?? true,
                    order: index,
                  },
                })
              )
            )
          }
        }

        return link
      })

      return updated
    } catch (error) {
      // Link 不存在
      if ((error as any).code === 'P2025') {
        return null
      }
      throw new AppError('更新链接失败', 'UPDATE_LINK_ERROR', error)
    }
  }

  /**
   * 删除链接
   *
   * 注意：这会级联删除所有关联的社交链接和额外链接
   *
   * @param id - Link ID
   * @returns 是否删除成功
   */
  async deleteLink(id: string): Promise<boolean> {
    if (!id) {
      return false
    }

    try {
      await prisma.link.delete({
        where: { id },
      })
      return true
    } catch (error) {
      // Link 不存在
      if ((error as any).code === 'P2025') {
        return false
      }
      throw new AppError('删除链接失败', 'DELETE_LINK_ERROR', error)
    }
  }

  /**
   * 生成分享图片 URL
   *
   * @param linkId - Link ID
   * @returns 分享图片 URL
   */
  generateShareImageUrl(linkId: string): string {
    if (!linkId) {
      return '/api/placeholder/qrcode'
    }
    return `/api/og/${linkId}`
  }

  /**
   * 切换社交链接的可见性
   *
   * @param socialLinkId - 社交链接 ID
   * @param visible - 可见性状态
   * @returns 更新后的社交链接或 null
   */
  async toggleSocialLinkVisibility(
    socialLinkId: string,
    visible: boolean
  ): Promise<SocialLink | null> {
    if (!socialLinkId) {
      return null
    }

    try {
      const updated = await prisma.socialLink.update({
        where: { id: socialLinkId },
        data: { isVisible: visible },
      })
      return updated
    } catch (error) {
      // 社交链接不存在
      if ((error as any).code === 'P2025') {
        return null
      }
      throw new AppError('更新社交链接失败', 'UPDATE_SOCIAL_LINK_ERROR', error)
    }
  }

  /**
   * 切换额外链接的可见性
   *
   * @param extraLinkId - 额外链接 ID
   * @param visible - 可见性状态
   * @returns 更新后的额外链接或 null
   */
  async toggleExtraLinkVisibility(
    extraLinkId: string,
    visible: boolean
  ): Promise<ExtraLink | null> {
    if (!extraLinkId) {
      return null
    }

    try {
      const updated = await prisma.extraLink.update({
        where: { id: extraLinkId },
        data: { isVisible: visible },
      })
      return updated
    } catch (error) {
      // 额外链接不存在
      if ((error as any).code === 'P2025') {
        return null
      }
      throw new AppError('更新额外链接失败', 'UPDATE_EXTRA_LINK_ERROR', error)
    }
  }
}

// 导出单例实例
export const linkService = new LinkService()

/**
 * 使用 React.cache 缓存的服务方法
 *
 * 这些方法在同一请求中自动去重，避免重复的数据库查询
 * 遵循 Vercel React Best Practices - server-cache-react 规则
 */

/**
 * 获取链接（带缓存）
 */
export const getLinkByIdCached = cache(async (id: string) => {
  return await linkService.getLinkById(id)
})

/**
 * 获取链接及其关联数据（带缓存）
 */
export const getLinkWithRelationsCached = cache(async (id: string) => {
  return await linkService.getLinkWithRelations(id)
})

/**
 * 根据用户 ID 获取链接（带缓存）
 */
export const getLinkByUserIdCached = cache(async (userId: string) => {
  return await linkService.getLinkByUserId(userId)
})

/**
 * 根据 username 获取公开链接（带缓存）
 */
export const getLinkByUsernameCached = cache(async (username: string) => {
  return await linkService.getLinkByUsername(username)
})
