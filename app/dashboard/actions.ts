'use server'

import { auth } from '@/lib/auth'
import { linkService, type LinkWithRelations } from '@/lib/services/link.service'
import { createLinkSchema, type CreateLinkInput } from '@/lib/utils/validation'
import { AppError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'

/**
 * 获取当前用户的链接数据
 *
 * 如果用户不存在链接，则返回 null
 *
 * @returns 用户的链接数据（包含关联的社交链接和额外链接）
 */
export async function getUserLink(): Promise<LinkWithRelations | null> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AppError('用户未登录', 'UNAUTHORIZED')
    }

    const link = await linkService.getLinkByUserId(session.user.id)

    if (!link) {
      return null
    }

    // 获取包含关联数据的完整链接
    return await linkService.getLinkWithRelations(link.id)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('获取链接失败', 'GET_LINK_ERROR', error)
  }
}

/**
 * 获取或创建用户的链接
 *
 * 如果用户不存在链接，则创建一个默认链接
 *
 * @returns 用户的链接数据
 */
export async function getOrCreateUserLink(): Promise<LinkWithRelations> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AppError('用户未登录', 'UNAUTHORIZED')
    }

    let link = await linkService.getLinkByUserId(session.user.id)

    if (!link) {
      // 创建默认链接
      // 使用用户的 email 作为默认 username（移除特殊字符）
      const defaultUsername = session.user.email
        ? session.user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '')
        : `user_${Date.now()}`

      link = await linkService.createLink(session.user.id, {
        username: defaultUsername,
        backgroundValue: '#ffffff',
        bio: '',
        socialLinks: [],
        extraLinks: [],
      })
    }

    // 获取包含关联数据的完整链接
    const linkWithRelations = await linkService.getLinkWithRelations(link.id)

    if (!linkWithRelations) {
      throw new AppError('获取链接数据失败', 'GET_LINK_ERROR')
    }

    return linkWithRelations
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('获取或创建链接失败', 'GET_OR_CREATE_LINK_ERROR', error)
  }
}

/**
 * 保存用户的链接数据
 *
 * 如果链接不存在，则创建新链接
 * 如果链接已存在，则更新现有链接
 *
 * @param data - 链接数据
 * @returns 保存后的链接数据
 */
export async function saveLink(data: CreateLinkInput): Promise<LinkWithRelations> {
  try {
    // 验证数据
    const validatedData = createLinkSchema.parse(data)

    const session = await auth()

    if (!session?.user?.id) {
      throw new AppError('用户未登录', 'UNAUTHORIZED')
    }

    // 检查用户是否已有链接
    let existingLink = await linkService.getLinkByUserId(session.user.id)

    if (existingLink) {
      // 更新现有链接
      await linkService.updateLink(existingLink.id, {
        username: validatedData.username,
        displayName: validatedData.displayName,
        bio: validatedData.bio,
        avatar: validatedData.avatar,
        backgroundType: validatedData.backgroundType,
        backgroundValue: validatedData.backgroundValue,
        shareImageUrl: null, // 暂不处理
        socialLinks: validatedData.socialLinks,
        extraLinks: validatedData.extraLinks,
      })

      // 重新验证缓存
      revalidatePath(`/${validatedData.username}`)
      revalidatePath('/dashboard')

      // 获取更新后的完整数据
      const updatedLink = await linkService.getLinkWithRelations(existingLink.id)

      if (!updatedLink) {
        throw new AppError('获取更新后的链接失败', 'GET_UPDATED_LINK_ERROR')
      }

      return updatedLink
    } else {
      // 创建新链接
      const newLink = await linkService.createLink(session.user.id, {
        username: validatedData.username,
        displayName: validatedData.displayName,
        bio: validatedData.bio,
        avatar: validatedData.avatar,
        backgroundType: validatedData.backgroundType,
        backgroundValue: validatedData.backgroundValue,
        shareImageUrl: null,
        socialLinks: validatedData.socialLinks,
        extraLinks: validatedData.extraLinks,
      })

      // 重新验证缓存
      revalidatePath(`/${validatedData.username}`)
      revalidatePath('/dashboard')

      // 获取新创建的完整数据
      const linkWithRelations = await linkService.getLinkWithRelations(newLink.id)

      if (!linkWithRelations) {
        throw new AppError('获取新创建的链接失败', 'GET_NEW_LINK_ERROR')
      }

      return linkWithRelations
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    if (error instanceof Error && error.name === 'ZodError') {
      throw new AppError('数据验证失败', 'VALIDATION_ERROR', error)
    }
    throw new AppError('保存链接失败', 'SAVE_LINK_ERROR', error)
  }
}

/**
 * 删除用户的链接
 *
 * @returns 是否删除成功
 */
export async function deleteUserLink(): Promise<boolean> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AppError('用户未登录', 'UNAUTHORIZED')
    }

    const link = await linkService.getLinkByUserId(session.user.id)

    if (!link) {
      return false
    }

    return await linkService.deleteLink(link.id)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('删除链接失败', 'DELETE_LINK_ERROR', error)
  }
}
