/**
 * QR Code 生成工具
 *
 * 使用 qrcode 库生成二维码图片
 * 支持多种格式和自定义选项
 */

import QRCode from 'qrcode'

/**
 * QR Code 生成选项
 */
export interface QRCodeOptions {
  /** 二维码宽度（像素） */
  width?: number
  /** 错误纠正级别: L(7%), M(15%), Q(25%), H(30%) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  /** 颜色配置 */
  color?: {
    /** 前景色（二维码颜色） */
    dark?: string
    /** 背景色 */
    light?: string
  }
  /** 边距（像素） */
  margin?: number
}

/**
 * 默认 QR Code 选项
 */
const DEFAULT_OPTIONS: Required<Omit<QRCodeOptions, 'color'>> & {
  color: { dark: string; light: string }
} = {
  width: 200,
  errorCorrectionLevel: 'M',
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
}

/**
 * 生成二维码 Data URL
 *
 * @param content - 二维码内容（URL 或文本）
 * @param options - 生成选项
 * @returns Data URL 字符串
 *
 * @example
 * ```ts
 * const dataUrl = await generateQRCode('https://example.com')
 * // => "data:image/png;base64,iVBORw0KGgo..."
 * ```
 */
export async function generateQRCode(
  content: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // qrcode 库不接受空字符串，使用占位符
  if (!content || content.trim() === '') {
    content = ' '
  }

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    color: {
      ...DEFAULT_OPTIONS.color,
      ...options.color,
    },
  }

  try {
    return await QRCode.toDataURL(content, mergedOptions)
  } catch (error) {
    throw new Error(`生成二维码失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 生成二维码 Data URL（别名函数）
 *
 * @param content - 二维码内容
 * @param options - 生成选项
 * @returns Data URL 字符串
 */
export async function generateQRCodeDataURL(
  content: string,
  options?: QRCodeOptions
): Promise<string> {
  return generateQRCode(content, options)
}

/**
 * 生成二维码 Buffer
 *
 * @param content - 二维码内容
 * @param options - 生成选项
 * @returns PNG 格式的 Buffer
 *
 * @example
 * ```ts
 * const buffer = await generateQRCodeBuffer('https://example.com')
 * // => Buffer<...>
 * ```
 */
export async function generateQRCodeBuffer(
  content: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  // qrcode 库不接受空字符串，使用占位符
  if (!content || content.trim() === '') {
    content = ' '
  }

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    color: {
      ...DEFAULT_OPTIONS.color,
      ...options.color,
    },
  }

  try {
    return await QRCode.toBuffer(content, mergedOptions)
  } catch (error) {
    throw new Error(`生成二维码失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}
