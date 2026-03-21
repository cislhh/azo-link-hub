/**
 * 分享图片服务测试
 *
 * 使用 TDD 方法开发分享图片生成功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateShareImage, ShareImageOptions } from '@/lib/services/share-image.service'

describe('ShareImageService', () => {
  describe('generateShareImage', () => {
    const mockOptions: ShareImageOptions = {
      displayName: '张三',
      username: 'zhangsan',
      bio: '这是我的个人简介',
      avatar: null,
      qrCode: 'https://example.com/qrcode',
      siteUrl: 'https://example.com',
    }

    it('应该生成分享图片 Buffer', async () => {
      const buffer = await generateShareImage(mockOptions)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该生成指定尺寸的图片', async () => {
      const buffer = await generateShareImage(mockOptions, { width: 1080, height: 1920 })

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该支持自定义尺寸', async () => {
      const small = await generateShareImage(mockOptions, { width: 540, height: 960 })
      const large = await generateShareImage(mockOptions, { width: 1080, height: 1920 })

      expect(Buffer.isBuffer(small)).toBe(true)
      expect(Buffer.isBuffer(large)).toBe(true)
      expect(small.length).toBeLessThan(large.length)
    })

    it('应该处理缺少 bio 的情况', async () => {
      const options = { ...mockOptions, bio: null }
      const buffer = await generateShareImage(options)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该处理空 bio 的情况', async () => {
      const options = { ...mockOptions, bio: '' }
      const buffer = await generateShareImage(options)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该处理缺少 displayName 的情况', async () => {
      const options = { ...mockOptions, displayName: null }
      const buffer = await generateShareImage(options)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该处理缺少 avatar 的情况', async () => {
      const buffer = await generateShareImage(mockOptions)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该处理长 bio（需要截断）', async () => {
      const longBio = '这是一段非常长的个人简介，超过了显示区域的最大限制，应该被自动截断以适应布局。'.repeat(5)
      const options = { ...mockOptions, bio: longBio }
      const buffer = await generateShareImage(options)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该处理特殊字符', async () => {
      const options = {
        ...mockOptions,
        displayName: '测试用户🎉',
        bio: '包含特殊字符：@#$%^&*()_+',
      }
      const buffer = await generateShareImage(options)

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该支持自定义背景色', async () => {
      const buffer = await generateShareImage(mockOptions, {
        width: 1080,
        height: 1920,
        backgroundColor: '#f0f0f0',
      })

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('格式验证', () => {
    it('应该生成 PNG 格式图片', async () => {
      const buffer = await generateShareImage({
        displayName: '测试',
        username: 'test',
        bio: null,
        avatar: null,
        qrCode: 'https://example.com/qr',
        siteUrl: 'https://example.com',
      })

      expect(Buffer.isBuffer(buffer)).toBe(true)
      // PNG 文件签名
      expect(buffer[0]).toBe(0x89) // PNG 签名第一个字节
      expect(buffer[1]).toBe(0x50) // 'P'
      expect(buffer[2]).toBe(0x4e) // 'N'
      expect(buffer[3]).toBe(0x47) // 'G'
    })
  })

  describe('边界情况', () => {
    it('应该处理所有字段为 null 的情况', async () => {
      const buffer = await generateShareImage({
        displayName: null,
        username: '',
        bio: null,
        avatar: null,
        qrCode: '',
        siteUrl: '',
      })

      expect(Buffer.isBuffer(buffer)).toBe(true)
    })

    it('应该处理非常长的用户名', async () => {
      const buffer = await generateShareImage({
        displayName: '用户',
        username: 'a'.repeat(100),
        bio: null,
        avatar: null,
        qrCode: 'https://example.com',
        siteUrl: 'https://example.com',
      })

      expect(Buffer.isBuffer(buffer)).toBe(true)
    })
  })
})
