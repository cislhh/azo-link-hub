/**
 * Link Service 单元测试
 *
 * 使用 TDD 方法测试 Link 服务的所有功能
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { prisma } from '@/lib/db'
import { LinkService } from '@/lib/services/link.service'
import type { SocialLink, ExtraLink } from '@prisma/client'

/**
 * 数据库连接状态
 */
let isDbConnected = false

/**
 * Link 类型（包含关联数据）
 */
type LinkWithRelations = Awaited<ReturnType<typeof prisma.link.findFirst>> & {
  socialLinks?: SocialLink[]
  extraLinks?: ExtraLink[]
}

/**
 * 测试数据库连接
 */
async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

// 在所有测试前检查数据库连接
beforeAll(async () => {
  isDbConnected = await testDbConnection()
  if (!isDbConnected) {
    console.warn('警告: 数据库连接失败，需要数据库的测试将被跳过')
  }
})

// ============================================================================
// 需要数据库的集成测试
// ============================================================================

describe('Link Service (集成测试 - 需要数据库)', () => {
  let linkService: LinkService
  let userId: string
  let linkId: string

  /**
   * 每个测试前清理数据并创建测试用户
   */
  beforeEach(async () => {
    // 如果数据库未连接，跳过测试
    if (!isDbConnected) {
      return
    }

    // 初始化服务
    linkService = new LinkService()

    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    userId = user.id

    // 创建测试 Link
    const link = await prisma.link.create({
      data: {
        userId,
        bio: 'Test bio',
      },
    })
    linkId = link.id
  })

  // 所有测试都需要数据库连接
  const itIfDb = isDbConnected ? it : it.skip

  // ========================================================================
  // getLinkById 测试
  // ========================================================================

  describe('getLinkById', () => {
    itIfDb('应该根据 ID 获取链接', async () => {
      const link = await linkService.getLinkById(linkId)

      expect(link).toBeDefined()
      expect(link?.id).toBe(linkId)
      expect(link?.userId).toBe(userId)
    })

    itIfDb('应该为不存在的 ID 返回 null', async () => {
      const link = await linkService.getLinkById('non-existent-id')
      expect(link).toBeNull()
    })

    itIfDb('应该为无效 ID 返回 null', async () => {
      const link = await linkService.getLinkById('')
      expect(link).toBeNull()
    })
  })

  // ========================================================================
  // getLinkWithRelations 测试
  // ========================================================================

  describe('getLinkWithRelations', () => {
    itIfDb('应该获取包含关联数据的链接', async () => {
      // 创建社交链接
      await prisma.socialLink.create({
        data: {
          linkId,
          platform: 'github',
          url: 'https://github.com/test',
          visible: true,
          order: 0,
        },
      })

      // 创建额外链接
      await prisma.extraLink.create({
        data: {
          linkId,
          title: 'My Blog',
          url: 'https://example.com',
          visible: true,
          order: 0,
        },
      })

      const link = await linkService.getLinkWithRelations(linkId)

      expect(link).toBeDefined()
      expect(link?.id).toBe(linkId)
      expect(link?.socialLinks).toHaveLength(1)
      expect(link?.extraLinks).toHaveLength(1)
      expect(link?.socialLinks?.[0].platform).toBe('github')
      expect(link?.extraLinks?.[0].title).toBe('My Blog')
    })

    itIfDb('应该为不存在的 ID 返回 null', async () => {
      const link = await linkService.getLinkWithRelations('non-existent-id')
      expect(link).toBeNull()
    })

    itIfDb('应该返回空数组的关联数据而不是 undefined', async () => {
      const link = await linkService.getLinkWithRelations(linkId)

      expect(link).toBeDefined()
      expect(link?.socialLinks).toEqual([])
      expect(link?.extraLinks).toEqual([])
    })
  })

  // ========================================================================
  // getLinkByUserId 测试
  // ========================================================================

  describe('getLinkByUserId', () => {
    itIfDb('应该根据用户 ID 获取链接', async () => {
      const link = await linkService.getLinkByUserId(userId)

      expect(link).toBeDefined()
      expect(link?.userId).toBe(userId)
    })

    itIfDb('应该为不存在的用户 ID 返回 null', async () => {
      const link = await linkService.getLinkByUserId('non-existent-user-id')
      expect(link).toBeNull()
    })
  })

  // ========================================================================
  // createLink 测试
  // ========================================================================

  describe('createLink', () => {
    itIfDb('应该创建新链接', async () => {
      // 先删除已存在的 link
      await prisma.link.delete({ where: { id: linkId } })

      const data = {
        bio: 'New bio for testing',
        socialLinks: [
          {
            platform: 'twitter' as const,
            url: 'https://twitter.com/test',
            isVisible: true,
          },
        ],
        extraLinks: [
          {
            title: 'Portfolio',
            url: 'https://portfolio.com',
            isVisible: true,
          },
        ],
      }

      const link = await linkService.createLink(userId, data)

      expect(link).toBeDefined()
      expect(link.userId).toBe(userId)
      expect(link.bio).toBe('New bio for testing')
    })

    itIfDb('应该为用户创建唯一链接', async () => {
      // 先删除已存在的 link
      await prisma.link.delete({ where: { id: linkId } })

      const data = {
        bio: 'Test bio',
        socialLinks: [],
        extraLinks: [],
      }

      const link = await linkService.createLink(userId, data)

      expect(link).toBeDefined()
      expect(link.userId).toBe(userId)

      // 尝试创建第二个 link（应该失败）
      await expect(linkService.createLink(userId, data)).rejects.toThrow()
    })

    itIfDb('应该创建包含社交链接的链接', async () => {
      // 先删除已存在的 link
      await prisma.link.delete({ where: { id: linkId } })

      const data = {
        bio: 'Test bio',
        socialLinks: [
          {
            platform: 'github' as const,
            url: 'https://github.com/test',
            isVisible: true,
          },
          {
            platform: 'linkedin' as const,
            url: 'https://linkedin.com/in/test',
            isVisible: false,
          },
        ],
        extraLinks: [],
      }

      const link = await linkService.createLink(userId, data)

      expect(link).toBeDefined()

      // 验证社交链接已创建
      const socialLinks = await prisma.socialLink.findMany({
        where: { linkId: link.id },
      })

      expect(socialLinks).toHaveLength(2)
      expect(socialLinks[0].platform).toBe('github')
      expect(socialLinks[1].platform).toBe('linkedin')
    })

    itIfDb('应该创建包含额外链接的链接', async () => {
      // 先删除已存在的 link
      await prisma.link.delete({ where: { id: linkId } })

      const data = {
        bio: 'Test bio',
        socialLinks: [],
        extraLinks: [
          {
            title: 'Blog',
            url: 'https://blog.com',
            description: 'My blog',
            icon: 'blog',
            isVisible: true,
          },
        ],
      }

      const link = await linkService.createLink(userId, data)

      expect(link).toBeDefined()

      // 验证额外链接已创建
      const extraLinks = await prisma.extraLink.findMany({
        where: { linkId: link.id },
      })

      expect(extraLinks).toHaveLength(1)
      expect(extraLinks[0].title).toBe('Blog')
    })
  })

  // ========================================================================
  // updateLink 测试
  // ========================================================================

  describe('updateLink', () => {
    itIfDb('应该更新链接的 bio', async () => {
      const updated = await linkService.updateLink(linkId, {
        bio: 'Updated bio',
      })

      expect(updated).toBeDefined()
      expect(updated.bio).toBe('Updated bio')
    })

    itIfDb('应该更新链接并返回 null 对于不存在的 ID', async () => {
      const updated = await linkService.updateLink('non-existent-id', {
        bio: 'Updated bio',
      })

      expect(updated).toBeNull()
    })

    itIfDb('应该更新社交链接', async () => {
      // 先创建一个社交链接
      await prisma.socialLink.create({
        data: {
          linkId,
          platform: 'github',
          url: 'https://github.com/old',
          visible: true,
          order: 0,
        },
      })

      const updated = await linkService.updateLink(linkId, {
        socialLinks: [
          {
            platform: 'twitter' as const,
            url: 'https://twitter.com/new',
            isVisible: true,
          },
        ],
      })

      expect(updated).toBeDefined()

      // 验证社交链接已更新
      const socialLinks = await prisma.socialLink.findMany({
        where: { linkId },
      })

      expect(socialLinks).toHaveLength(1)
      expect(socialLinks[0].platform).toBe('twitter')
    })

    itIfDb('应该更新额外链接', async () => {
      const updated = await linkService.updateLink(linkId, {
        extraLinks: [
          {
            title: 'New Link',
            url: 'https://newlink.com',
            isVisible: true,
          },
        ],
      })

      expect(updated).toBeDefined()

      // 验证额外链接已更新
      const extraLinks = await prisma.extraLink.findMany({
        where: { linkId },
      })

      expect(extraLinks).toHaveLength(1)
      expect(extraLinks[0].title).toBe('New Link')
    })
  })

  // ========================================================================
  // deleteLink 测试
  // ========================================================================

  describe('deleteLink', () => {
    itIfDb('应该删除链接', async () => {
      // 创建社交链接和额外链接
      await prisma.socialLink.create({
        data: {
          linkId,
          platform: 'github',
          url: 'https://github.com/test',
          visible: true,
          order: 0,
        },
      })

      await prisma.extraLink.create({
        data: {
          linkId,
          title: 'Test',
          url: 'https://test.com',
          visible: true,
          order: 0,
        },
      })

      const deleted = await linkService.deleteLink(linkId)

      expect(deleted).toBe(true)

      // 验证链接已删除
      const link = await prisma.link.findUnique({
        where: { id: linkId },
      })
      expect(link).toBeNull()

      // 验证关联数据已级联删除
      const socialLinks = await prisma.socialLink.findMany({
        where: { linkId },
      })
      const extraLinks = await prisma.extraLink.findMany({
        where: { linkId },
      })
      expect(socialLinks).toHaveLength(0)
      expect(extraLinks).toHaveLength(0)
    })

    itIfDb('应该为不存在的 ID 返回 false', async () => {
      const deleted = await linkService.deleteLink('non-existent-id')
      expect(deleted).toBe(false)
    })

    itIfDb('应该为无效 ID 返回 false', async () => {
      const deleted = await linkService.deleteLink('')
      expect(deleted).toBe(false)
    })
  })

  // ========================================================================
  // toggleSocialLinkVisibility 测试
  // ========================================================================

  describe('toggleSocialLinkVisibility', () => {
    itIfDb('应该切换社交链接的可见性', async () => {
      // 创建社交链接
      const socialLink = await prisma.socialLink.create({
        data: {
          linkId,
          platform: 'github',
          url: 'https://github.com/test',
          visible: true,
          order: 0,
        },
      })

      // 切换为不可见
      const updated = await linkService.toggleSocialLinkVisibility(socialLink.id, false)
      expect(updated).toBeDefined()
      expect(updated?.visible).toBe(false)

      // 切换回可见
      const updated2 = await linkService.toggleSocialLinkVisibility(socialLink.id, true)
      expect(updated2?.visible).toBe(true)
    })

    itIfDb('应该为不存在的社交链接 ID 返回 null', async () => {
      const updated = await linkService.toggleSocialLinkVisibility('non-existent-id', true)
      expect(updated).toBeNull()
    })
  })

  // ========================================================================
  // toggleExtraLinkVisibility 测试
  // ========================================================================

  describe('toggleExtraLinkVisibility', () => {
    itIfDb('应该切换额外链接的可见性', async () => {
      // 创建额外链接
      const extraLink = await prisma.extraLink.create({
        data: {
          linkId,
          title: 'Test',
          url: 'https://test.com',
          visible: true,
          order: 0,
        },
      })

      // 切换为不可见
      const updated = await linkService.toggleExtraLinkVisibility(extraLink.id, false)
      expect(updated).toBeDefined()
      expect(updated?.visible).toBe(false)

      // 切换回可见
      const updated2 = await linkService.toggleExtraLinkVisibility(extraLink.id, true)
      expect(updated2?.visible).toBe(true)
    })

    itIfDb('应该为不存在的额外链接 ID 返回 null', async () => {
      const updated = await linkService.toggleExtraLinkVisibility('non-existent-id', true)
      expect(updated).toBeNull()
    })
  })
})

// ============================================================================
// 不需要数据库的单元测试
// ============================================================================

describe('Link Service (单元测试 - 无需数据库)', () => {
  let linkService: LinkService

  beforeEach(() => {
    linkService = new LinkService()
  })

  describe('generateShareImageUrl', () => {
    it('应该生成包含 linkId 的分享图片 URL', () => {
      const linkId = 'cm1234567890ab'
      const url = linkService.generateShareImageUrl(linkId)

      expect(url).toBe('/api/og/cm1234567890ab')
    })

    it('应该为空字符串返回默认占位 URL', () => {
      const url = linkService.generateShareImageUrl('')
      expect(url).toBe('/api/placeholder/qrcode')
    })

    it('应该为 null 或 undefined 返回默认占位 URL', () => {
      const url1 = linkService.generateShareImageUrl(null as any)
      const url2 = linkService.generateShareImageUrl(undefined as any)

      expect(url1).toBe('/api/placeholder/qrcode')
      expect(url2).toBe('/api/placeholder/qrcode')
    })
  })

  describe('getLinkById', () => {
    it('应该为空 ID 返回 null', async () => {
      const link = await linkService.getLinkById('')
      expect(link).toBeNull()
    })

    it('应该为 null ID 返回 null', async () => {
      const link = await linkService.getLinkById(null as any)
      expect(link).toBeNull()
    })
  })

  describe('getLinkWithRelations', () => {
    it('应该为空 ID 返回 null', async () => {
      const link = await linkService.getLinkWithRelations('')
      expect(link).toBeNull()
    })
  })

  describe('getLinkByUserId', () => {
    it('应该为空用户 ID 返回 null', async () => {
      const link = await linkService.getLinkByUserId('')
      expect(link).toBeNull()
    })
  })

  describe('deleteLink', () => {
    it('应该为空 ID 返回 false', async () => {
      const result = await linkService.deleteLink('')
      expect(result).toBe(false)
    })
  })

  describe('toggleSocialLinkVisibility', () => {
    it('应该为空 ID 返回 null', async () => {
      const result = await linkService.toggleSocialLinkVisibility('', true)
      expect(result).toBeNull()
    })
  })

  describe('toggleExtraLinkVisibility', () => {
    it('应该为空 ID 返回 null', async () => {
      const result = await linkService.toggleExtraLinkVisibility('', true)
      expect(result).toBeNull()
    })
  })
})
