/**
 * 公开链接页面集成测试
 *
 * 测试 /[username] 路由和 API 端点
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { linkService } from '@/lib/services/link.service'

describe('Public Link Page', () => {
  let testUserId: string
  let testUsername: string

  beforeEach(async () => {
    // 清理测试数据
    await prisma.socialLink.deleteMany({})
    await prisma.extraLink.deleteMany({})
    await prisma.link.deleteMany({})
    await prisma.user.deleteMany({})

    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    testUserId = user.id
    testUsername = 'testuser'
  })

  describe('getLinkByUsername', () => {
    it('应该返回用户的公开链接数据', async () => {
      // 创建测试链接
      await linkService.createLink(testUserId, {
        username: testUsername,
        displayName: 'Test User',
        bio: 'This is a test bio',
        backgroundValue: '#ffffff',
        socialLinks: [
          {
            platform: 'github',
            url: 'https://github.com/test',
            isVisible: true,
          },
        ],
        extraLinks: [
          {
            title: 'My Blog',
            url: 'https://blog.example.com',
            description: 'My personal blog',
            isVisible: true,
          },
        ],
      })

      // 获取链接
      const link = await linkService.getLinkByUsername(testUsername)

      expect(link).not.toBeNull()
      expect(link?.username).toBe(testUsername)
      expect(link?.displayName).toBe('Test User')
      expect(link?.bio).toBe('This is a test bio')
      expect(link?.socialLinks).toHaveLength(1)
      expect(link?.socialLinks[0].platform).toBe('github')
      expect(link?.extraLinks).toHaveLength(1)
      expect(link?.extraLinks[0].title).toBe('My Blog')
    })

    it('应该只返回可见的链接', async () => {
      // 创建测试链接（包含不可见的链接）
      await linkService.createLink(testUserId, {
        username: testUsername,
        displayName: 'Test User',
        backgroundValue: '#ffffff',
        socialLinks: [
          {
            platform: 'github',
            url: 'https://github.com/test',
            isVisible: true,
          },
          {
            platform: 'twitter',
            url: 'https://twitter.com/test',
            isVisible: false, // 不可见
          },
        ],
        extraLinks: [
          {
            title: 'Visible Link',
            url: 'https://visible.com',
            isVisible: true,
          },
          {
            title: 'Hidden Link',
            url: 'https://hidden.com',
            isVisible: false, // 不可见
          },
        ],
      })

      // 获取链接
      const link = await linkService.getLinkByUsername(testUsername)

      expect(link?.socialLinks).toHaveLength(1)
      expect(link?.socialLinks[0].platform).toBe('github')
      expect(link?.extraLinks).toHaveLength(1)
      expect(link?.extraLinks[0].title).toBe('Visible Link')
    })

    it('应该在链接不存在时返回 null', async () => {
      const link = await linkService.getLinkByUsername('nonexistent')
      expect(link).toBeNull()
    })

    it('应该在链接未激活时返回 null', async () => {
      // 创建未激活的链接
      const createdLink = await linkService.createLink(testUserId, {
        username: testUsername,
        displayName: 'Test User',
        backgroundValue: '#ffffff',
      })

      // 手动设置为未激活
      await prisma.link.update({
        where: { id: createdLink.id },
        data: { isActive: false },
      })

      // 获取链接应该返回 null
      const link = await linkService.getLinkByUsername(testUsername)
      expect(link).toBeNull()
    })
  })

  describe('链接排序', () => {
    it('应该按照 order 字段排序返回链接', async () => {
      await linkService.createLink(testUserId, {
        username: testUsername,
        displayName: 'Test User',
        backgroundValue: '#ffffff',
        socialLinks: [
          {
            platform: 'twitter',
            url: 'https://twitter.com/test',
            isVisible: true,
          },
          {
            platform: 'github',
            url: 'https://github.com/test',
            isVisible: true,
          },
        ],
        extraLinks: [
          {
            title: 'Third Link',
            url: 'https://third.com',
            isVisible: true,
          },
          {
            title: 'First Link',
            url: 'https://first.com',
            isVisible: true,
          },
          {
            title: 'Second Link',
            url: 'https://second.com',
            isVisible: true,
          },
        ],
      })

      const link = await linkService.getLinkByUsername(testUsername)

      // 验证社交链接按 order 排序（默认按创建顺序）
      expect(link?.socialLinks[0].platform).toBe('twitter')
      expect(link?.socialLinks[1].platform).toBe('github')

      // 验证额外链接按 order 排序
      expect(link?.extraLinks[0].title).toBe('Third Link')
      expect(link?.extraLinks[1].title).toBe('First Link')
      expect(link?.extraLinks[2].title).toBe('Second Link')
    })
  })
})
