/**
 * QR Code 工具测试
 *
 * 使用 TDD 方法开发二维码生成功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateQRCode, generateQRCodeDataURL, generateQRCodeBuffer } from '@/lib/utils/qrcode'

describe('QRCode Utils', () => {
  describe('generateQRCode', () => {
    it('应该生成二维码 Data URL', async () => {
      const dataUrl = await generateQRCode('https://example.com/test')

      expect(dataUrl).toBeTruthy()
      expect(typeof dataUrl).toBe('string')
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该支持自定义尺寸', async () => {
      const small = await generateQRCode('test', { width: 100 })
      const large = await generateQRCode('test', { width: 300 })

      expect(small).toBeTruthy()
      expect(large).toBeTruthy()
      expect(small.length).toBeLessThan(large.length)
    })

    it('应该支持自定义颜色', async () => {
      const dataUrl = await generateQRCode('test', {
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该支持自定义错误纠正级别', async () => {
      const levels = ['L', 'M', 'Q', 'H'] as const

      for (const level of levels) {
        const dataUrl = await generateQRCode('test', { errorCorrectionLevel: level })
        expect(dataUrl).toBeTruthy()
        expect(dataUrl).toMatch(/^data:image\/png;base64,/)
      }
    })

    it('应该处理空字符串（使用占位符）', async () => {
      // qrcode 库不接受空字符串，函数会使用空格占位符
      const dataUrl = await generateQRCode('')

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该处理特殊字符', async () => {
      const specialChars = '测试中文!@#$%^&*()'
      const dataUrl = await generateQRCode(specialChars)

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该处理长 URL', async () => {
      const longUrl = 'https://example.com/very/long/path/that/goes/on/and/on/with/many/segments?query=value&another=param'
      const dataUrl = await generateQRCode(longUrl)

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('generateQRCodeDataURL', () => {
    it('应该生成 Data URL 格式的二维码', async () => {
      const dataUrl = await generateQRCodeDataURL('https://example.com/user/username')

      expect(dataUrl).toBeTypeOf('string')
      expect(dataUrl).toMatch(/^data:image\/png;base64,/i)
    })

    it('应该使用默认参数', async () => {
      const dataUrl = await generateQRCodeDataURL('test')

      expect(dataUrl).toBeTruthy()
    })
  })

  describe('generateQRCodeBuffer', () => {
    it('应该生成 Buffer 格式的二维码', async () => {
      const buffer = await generateQRCodeBuffer('https://example.com/user/username')

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('应该支持自定义尺寸', async () => {
      const buffer = await generateQRCodeBuffer('test', { width: 300 })

      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 输入（转换为空格）', async () => {
      // qrcode 库将 null/undefined 转换为字符串，然后用空格占位符替换
      const dataUrl = await generateQRCode(null as any)

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该处理 undefined 输入（转换为空格）', async () => {
      const dataUrl = await generateQRCode(undefined as any)

      expect(dataUrl).toBeTruthy()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该处理非常小的尺寸', async () => {
      const dataUrl = await generateQRCode('test', { width: 50 })

      expect(dataUrl).toBeTruthy()
    })

    it('应该处理非常大的尺寸', async () => {
      const dataUrl = await generateQRCode('test', { width: 1000 })

      expect(dataUrl).toBeTruthy()
    })
  })
})
