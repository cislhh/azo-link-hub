/**
 * 验证 schemas 单元测试
 *
 * 使用 TDD 方法测试所有 Zod 验证 schemas
 */

import { describe, it, expect } from 'vitest'
import {
  createLinkSchema,
  updateLinkSchema,
  socialLinkSchema,
  extraLinkSchema,
  usernameSchema,
  displayNameSchema,
  bioSchema,
  avatarSchema,
  backgroundValueSchema,
  type CreateLinkInput,
  type UpdateLinkInput,
} from '@/lib/utils/validation'

describe('Validation Schemas', () => {
  describe('usernameSchema', () => {
    it('应该接受有效的用户名', () => {
      const validUsernames = ['user123', 'test_user', 'my-name', 'User_123', 'abc']
      for (const username of validUsernames) {
        const result = usernameSchema.safeParse(username)
        expect(result.success).toBe(true)
      }
    })

    it('应该拒绝少于3个字符的用户名', () => {
      const result = usernameSchema.safeParse('ab')
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0].message).toBe('用户名至少3个字符')
      }
    })

    it('应该拒绝多于20个字符的用户名', () => {
      const result = usernameSchema.safeParse('a'.repeat(21))
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0].message).toBe('用户名最多20个字符')
      }
    })

    it('应该拒绝包含非法字符的用户名', () => {
      const invalidUsernames = ['test user', 'user@name', 'user.name', 'user!', '用户名', 'test#hash']
      for (const username of invalidUsernames) {
        const result = usernameSchema.safeParse(username)
        expect(result.success).toBe(false)
      }
    })

    it('应该拒绝空字符串', () => {
      const result = usernameSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('边界测试: 恰好3个和20个字符', () => {
      const threeChars = usernameSchema.safeParse('abc')
      expect(threeChars.success).toBe(true)

      const twentyChars = usernameSchema.safeParse('a'.repeat(20))
      expect(twentyChars.success).toBe(true)
    })
  })

  describe('displayNameSchema', () => {
    it('应该接受有效的显示名称', () => {
      const validNames = ['Test User', '用户名称', 'John Doe Jr.', 'A']
      for (const name of validNames) {
        const result = displayNameSchema.safeParse(name)
        expect(result.success).toBe(true)
      }
    })

    it('应该接受空值（可选）', () => {
      const result = displayNameSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空字符串', () => {
      const result = displayNameSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('应该拒绝超过50个字符的名称', () => {
      const result = displayNameSchema.safeParse('a'.repeat(51))
      expect(result.success).toBe(false)
    })

    it('边界测试: 恰好50个字符', () => {
      const result = displayNameSchema.safeParse('a'.repeat(50))
      expect(result.success).toBe(true)
    })
  })

  describe('bioSchema', () => {
    it('应该接受有效的简介', () => {
      const validBios = [
        'This is my bio',
        '开发者、作者、创造者',
        'Short bio',
        'a'.repeat(500), // 最大长度
      ]
      for (const bio of validBios) {
        const result = bioSchema.safeParse(bio)
        expect(result.success).toBe(true)
      }
    })

    it('应该接受空值（可选）', () => {
      const result = bioSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('应该接受空字符串', () => {
      const result = bioSchema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('应该拒绝超过500个字符的简介', () => {
      const result = bioSchema.safeParse('a'.repeat(501))
      expect(result.success).toBe(false)
    })
  })

  describe('avatarSchema', () => {
    it('应该接受有效的URL', () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'https://cdn.example.com/images/avatar.png?v=1',
        'http://example.com/path/to/avatar.gif',
      ]
      for (const url of validUrls) {
        const result = avatarSchema.safeParse(url)
        expect(result.success).toBe(true)
      }
    })

    it('应该接受空值（可选）', () => {
      const result = avatarSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      const invalidUrls = ['not-a-url', 'www.example.com', 'ftp://example.com', '/path/to/file']
      for (const url of invalidUrls) {
        const result = avatarSchema.safeParse(url)
        expect(result.success).toBe(false)
      }
    })
  })

  describe('backgroundValueSchema', () => {
    it('应该接受有效的颜色值', () => {
      const validColors = [
        '#ffffff',
        '#000000',
        '#f00',
        'rgb(255, 0, 0)',
        'rgba(255, 0, 0, 0.5)',
        'hsl(120, 100%, 50%)',
        'red',
        'blue',
        'transparent',
      ]
      for (const color of validColors) {
        const result = backgroundValueSchema.safeParse(color)
        expect(result.success).toBe(true)
      }
    })

    it('应该拒绝空字符串', () => {
      const result = backgroundValueSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('socialLinkSchema', () => {
    it('应该接受有效的社交链接', () => {
      const validLinks = [
        { platform: 'twitter', url: 'https://twitter.com/user' },
        { platform: 'github', url: 'https://github.com/user' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/user' },
        { platform: 'instagram', url: 'https://instagram.com/user' },
        { platform: 'youtube', url: 'https://youtube.com/channel/123' },
        { platform: 'tiktok', url: 'https://tiktok.com/@user' },
        { platform: 'website', url: 'https://example.com' },
        { platform: 'email', url: 'mailto:test@example.com' },
      ]
      for (const link of validLinks) {
        const result = socialLinkSchema.safeParse(link)
        expect(result.success).toBe(true)
      }
    })

    it('应该设置 isVisible 默认值为 true', () => {
      const result = socialLinkSchema.safeParse({
        platform: 'twitter',
        url: 'https://twitter.com/user',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isVisible).toBe(true)
      }
    })

    it('应该接受自定义 isVisible 值', () => {
      const result = socialLinkSchema.safeParse({
        platform: 'twitter',
        url: 'https://twitter.com/user',
        isVisible: false,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isVisible).toBe(false)
      }
    })

    it('应该拒绝无效的平台', () => {
      const result = socialLinkSchema.safeParse({
        platform: 'invalid-platform' as any,
        url: 'https://example.com',
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的URL', () => {
      const result = socialLinkSchema.safeParse({
        platform: 'twitter',
        url: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝缺少必需字段', () => {
      const result1 = socialLinkSchema.safeParse({ url: 'https://example.com' } as any)
      expect(result1.success).toBe(false)

      const result2 = socialLinkSchema.safeParse({ platform: 'twitter' } as any)
      expect(result2.success).toBe(false)
    })
  })

  describe('extraLinkSchema', () => {
    it('应该接受有效的额外链接', () => {
      const validLinks = [
        {
          title: 'My Blog',
          url: 'https://blog.example.com',
          description: 'My personal blog',
          icon: 'hi-document-text',
        },
        {
          title: 'Portfolio',
          url: 'https://portfolio.example.com',
          icon: 'hi-briefcase',
        },
        {
          title: 'A',
          url: 'https://a.co',
        },
      ]
      for (const link of validLinks) {
        const result = extraLinkSchema.safeParse(link)
        expect(result.success).toBe(true)
      }
    })

    it('应该设置 isVisible 默认值为 true', () => {
      const result = extraLinkSchema.safeParse({
        title: 'My Link',
        url: 'https://example.com',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isVisible).toBe(true)
      }
    })

    it('应该接受可选字段', () => {
      const result = extraLinkSchema.safeParse({
        title: 'Link',
        url: 'https://example.com',
        description: undefined,
        icon: undefined,
      })
      expect(result.success).toBe(true)
    })

    it('应该拒绝空标题', () => {
      const result = extraLinkSchema.safeParse({
        title: '',
        url: 'https://example.com',
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝超过50个字符的标题', () => {
      const result = extraLinkSchema.safeParse({
        title: 'a'.repeat(51),
        url: 'https://example.com',
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝超过200个字符的描述', () => {
      const result = extraLinkSchema.safeParse({
        title: 'Link',
        url: 'https://example.com',
        description: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的URL', () => {
      const result = extraLinkSchema.safeParse({
        title: 'Link',
        url: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('应该拒绝超过50个字符的图标', () => {
      const result = extraLinkSchema.safeParse({
        title: 'Link',
        url: 'https://example.com',
        icon: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createLinkSchema', () => {
    it('应该接受完整有效的数据', () => {
      const data = {
        username: 'testuser',
        displayName: 'Test User',
        bio: 'This is my bio',
        avatar: 'https://example.com/avatar.jpg',
        backgroundType: 'solid' as const,
        backgroundValue: '#ffffff',
        socialLinks: [
          { platform: 'twitter' as const, url: 'https://twitter.com/user' },
        ],
        extraLinks: [
          { title: 'Blog', url: 'https://blog.example.com' },
        ],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('应该接受最小必需数据', () => {
      const data = {
        username: 'user',
        backgroundType: 'solid' as const,
        backgroundValue: '#000000',
        socialLinks: [],
        extraLinks: [],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('应该设置数组的默认值为空数组', () => {
      const data = {
        username: 'user',
        backgroundType: 'solid' as const,
        backgroundValue: '#000000',
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.socialLinks).toEqual([])
        expect(result.data.extraLinks).toEqual([])
      }
    })

    it('应该拒绝缺少 username', () => {
      const data = {
        backgroundType: 'solid' as const,
        backgroundValue: '#000000',
      } as any

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的 username', () => {
      const invalidUsernames = ['ab', 'a'.repeat(21), 'user@name', 'user name']
      for (const username of invalidUsernames) {
        const data = {
          username,
          backgroundType: 'solid' as const,
          backgroundValue: '#000000',
        }
        const result = createLinkSchema.safeParse(data)
        expect(result.success).toBe(false)
      }
    })

    it('应该拒绝无效的 backgroundType', () => {
      const data = {
        username: 'user',
        backgroundType: 'gradient' as any,
        backgroundValue: '#000000',
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的 socialLinks', () => {
      const data = {
        username: 'user',
        backgroundType: 'solid' as const,
        backgroundValue: '#000000',
        socialLinks: [{ platform: 'invalid' as any, url: 'https://example.com' }],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的 extraLinks', () => {
      const data = {
        username: 'user',
        backgroundType: 'solid' as const,
        backgroundValue: '#000000',
        extraLinks: [{ title: '', url: 'https://example.com' }],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('应该推断正确的类型', () => {
      const data: CreateLinkInput = {
        username: 'testuser',
        displayName: 'Test User',
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: [{ platform: 'twitter', url: 'https://twitter.com/user' }],
        extraLinks: [],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('updateLinkSchema', () => {
    it('应该接受部分更新数据', () => {
      const updates = [
        { displayName: 'New Name' },
        { bio: 'New bio' },
        { backgroundValue: '#000000' },
        { username: 'newuser' },
        { displayName: 'Name', bio: 'Bio' },
      ]

      for (const update of updates) {
        const result = updateLinkSchema.safeParse(update)
        expect(result.success).toBe(true)
      }
    })

    it('应该允许更新 socialLinks', () => {
      const data = {
        socialLinks: [{ platform: 'github' as const, url: 'https://github.com/user' }],
      }

      const result = updateLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('应该允许更新 extraLinks', () => {
      const data = {
        extraLinks: [{ title: 'New Link', url: 'https://example.com' }],
      }

      const result = updateLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空对象', () => {
      const result = updateLinkSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的更新数据', () => {
      const invalidUpdates = [
        { username: 'ab' },
        { displayName: '' },
        { bio: 'a'.repeat(501) },
        { avatar: 'not-a-url' },
      ]

      for (const update of invalidUpdates) {
        const result = updateLinkSchema.safeParse(update)
        expect(result.success).toBe(false)
      }
    })

    it('应该推断正确的类型', () => {
      const data: UpdateLinkInput = {
        displayName: 'New Name',
        bio: 'Updated bio',
      }

      const result = updateLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理 null 输入', () => {
      const result = createLinkSchema.safeParse(null as any)
      expect(result.success).toBe(false)
    })

    it('应该处理 undefined 输入', () => {
      const result = createLinkSchema.safeParse(undefined as any)
      expect(result.success).toBe(false)
    })

    it('应该提供清晰的错误信息', () => {
      const result = createLinkSchema.safeParse({
        username: 'ab',
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0].message).toBeDefined()
      }
    })

    it('应该处理多个验证错误', () => {
      const result = createLinkSchema.safeParse({
        username: 'ab', // 太短
        displayName: 'a'.repeat(51), // 太长
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: [{ platform: 'invalid' as any, url: 'not-a-url' }], // 无效平台和URL
        extraLinks: [{ title: '', url: 'not-url' }], // 空标题和无效URL
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        // 应该有多个错误
        const issues = result.error.issues
        expect(issues.length).toBeGreaterThan(1)
      }
    })

    it('应该处理包含特殊字符的显示名称', () => {
      const specialNames = [
        'John O\'Brien',
        'Müller',
        'José',
        '张三',
        '🎉 Party User',
        'User & Company',
      ]

      for (const name of specialNames) {
        const result = displayNameSchema.safeParse(name)
        expect(result.success).toBe(true)
      }
    })

    it('应该处理包含换行符的简介', () => {
      const bioWithNewlines = 'Line 1\nLine 2\nLine 3'
      const result = bioSchema.safeParse(bioWithNewlines)
      expect(result.success).toBe(true)
    })

    it('应该处理邮箱URL格式', () => {
      const emailUrls = [
        'mailto:test@example.com',
        'mailto:user.name+tag@domain.co.uk',
      ]

      for (const url of emailUrls) {
        const result = socialLinkSchema.safeParse({
          platform: 'email',
          url,
        })
        expect(result.success).toBe(true)
      }
    })
  })
})
