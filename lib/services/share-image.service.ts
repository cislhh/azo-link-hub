/**
 * 分享图片服务
 *
 * 使用 Canvas 生成类似微信/QQ 添加好友的分享图片
 * 包含头像、名称、简介、二维码
 */

import sharp from 'sharp'
import { generateQRCodeBuffer } from '@/lib/utils/qrcode'

/**
 * 分享图片内容选项
 */
export interface ShareImageOptions {
  /** 用户显示名称 */
  displayName: string | null
  /** 用户名（@username） */
  username: string
  /** 用户简介 */
  bio: string | null
  /** 头像 URL（可选，为 null 时使用默认头像） */
  avatar: string | null
  /** 二维码 URL */
  qrCode: string
  /** 网站地址（用于生成二维码） */
  siteUrl: string
}

/**
 * 分享图片尺寸选项
 */
export interface ShareImageSizeOptions {
  /** 图片宽度（像素） */
  width?: number
  /** 图片高度（像素） */
  height?: number
  /** 背景颜色 */
  backgroundColor?: string
}

/**
 * 默认图片尺寸
 */
const DEFAULT_SIZE = {
  width: 1080,
  height: 1920,
}

/**
 * 布局常量（基于 1080x1920 尺寸）
 */
const LAYOUT = {
  padding: 80,
  avatarSize: 240,
  qrCodeSize: 400,
  spacing: 60,
  smallSpacing: 40,
} as const

/**
 * 文字样式常量
 */
const TEXT_STYLE = {
  displayNameSize: 64,
  usernameSize: 44,
  bioSize: 40,
  scanTipSize: 36,
  color: '#333333',
  secondaryColor: '#666666',
} as const

/**
 * 生成分享图片
 *
 * @param options - 分享图片内容选项
 * @param sizeOptions - 图片尺寸选项
 * @returns PNG 格式的 Buffer
 *
 * @example
 * ```ts
 * const buffer = await generateShareImage({
 *   displayName: '张三',
 *   username: 'zhangsan',
 *   bio: '这是我的个人简介',
 *   avatar: null,
 *   qrCode: 'https://example.com/qrcode',
 *   siteUrl: 'https://example.com',
 * })
 * ```
 */
export async function generateShareImage(
  options: ShareImageOptions,
  sizeOptions: ShareImageSizeOptions = {}
): Promise<Buffer> {
  const { width = DEFAULT_SIZE.width, height = DEFAULT_SIZE.height, backgroundColor = '#ffffff' } = sizeOptions

  // 计算缩放比例（基于默认宽度 1080）
  const scale = width / DEFAULT_SIZE.width

  // 生成二维码
  const qrCodeBuffer = await generateQRCodeBuffer(options.siteUrl || options.qrCode, {
    width: Math.round(LAYOUT.qrCodeSize * scale),
    margin: 2,
  })

  // 构建完整的 SVG
  const svg = buildSVG(options, width, height, backgroundColor, scale)

  // 计算二维码位置
  const qrCodeSize = Math.round(LAYOUT.qrCodeSize * scale)
  const qrCodeX = (width - qrCodeSize) / 2
  const qrCodeY = calculateQRCodeY(options, scale, height)

  // 使用 sharp 渲染 SVG 并添加二维码
  const result = await sharp(Buffer.from(svg))
    .resize(width, height) // 确保尺寸正确
    .composite([
      {
        input: qrCodeBuffer,
        top: qrCodeY,
        left: qrCodeX,
      },
    ])
    .png()
    .toBuffer()

  return result
}

/**
 * 计算二维码 Y 坐标
 */
function calculateQRCodeY(options: ShareImageOptions, scale: number, height: number): number {
  const avatarY = Math.round(300 * scale)
  const avatarSize = Math.round(LAYOUT.avatarSize * scale)
  let currentY = avatarY + avatarSize / 2 + Math.round(LAYOUT.spacing * scale)

  if (options.displayName) {
    currentY += Math.round((TEXT_STYLE.displayNameSize + LAYOUT.smallSpacing) * scale)
  }
  currentY += Math.round(TEXT_STYLE.usernameSize * scale)
  currentY += Math.round(LAYOUT.spacing * 1.5 * scale)

  if (options.bio) {
    currentY += Math.round((TEXT_STYLE.bioSize + 15) * scale * 2)
  }

  return currentY + Math.round(LAYOUT.spacing * 2 * scale)
}

/**
 * 构建 SVG 字符串
 */
function buildSVG(
  options: ShareImageOptions,
  width: number,
  height: number,
  backgroundColor: string,
  scale: number
): string {
  const elements: string[] = []

  // 1. 背景矩形
  elements.push(`<rect width="100%" height="100%" fill="${backgroundColor}"/>`)

  // 2. 头像圆形和文字
  const avatarY = Math.round(300 * scale)
  const avatarSize = Math.round(LAYOUT.avatarSize * scale)
  const avatarRadius = avatarSize / 2

  // 头像背景圆
  elements.push(
    `<circle cx="${width / 2}" cy="${avatarY}" r="${avatarRadius}" fill="#e5e7eb"/>`
  )

  // 头像首字母
  const avatarLetter = options.displayName?.[0] || options.username[0] || '?'
  elements.push(
    `<text x="${width / 2}" y="${avatarY}" ` +
      `font-size="${Math.round(avatarSize * 0.4)}" ` +
      `fill="#9ca3af" ` +
      `text-anchor="middle" ` +
      `dominant-baseline="middle" ` +
      `font-family="sans-serif">${escapeHtml(avatarLetter)}</text>`
  )

  // 3. 显示名称
  let currentY = avatarY + avatarRadius + Math.round(LAYOUT.spacing * scale)
  if (options.displayName) {
    elements.push(
      `<text x="${width / 2}" y="${currentY}" ` +
        `font-size="${Math.round(TEXT_STYLE.displayNameSize * scale)}" ` +
        `fill="${TEXT_STYLE.color}" ` +
        `text-anchor="middle" ` +
        `font-family="sans-serif" ` +
        `font-weight="bold">${escapeHtml(truncateText(options.displayName, 20))}</text>`
    )
    currentY += Math.round((TEXT_STYLE.displayNameSize + LAYOUT.smallSpacing) * scale)
  }

  // 4. 用户名
  elements.push(
    `<text x="${width / 2}" y="${currentY}" ` +
      `font-size="${Math.round(TEXT_STYLE.usernameSize * scale)}" ` +
      `fill="${TEXT_STYLE.secondaryColor}" ` +
      `text-anchor="middle" ` +
      `font-family="sans-serif">@${escapeHtml(truncateText(options.username, 30))}</text>`
  )
  currentY += Math.round((TEXT_STYLE.usernameSize + LAYOUT.spacing * 1.5) * scale)

  // 5. 简介（如果有）
  if (options.bio) {
    const bioLines = wrapText(options.bio, 18)
    const lineHeight = Math.round((TEXT_STYLE.bioSize + 15) * scale)
    for (const line of bioLines.slice(0, 2)) {
      elements.push(
        `<text x="${width / 2}" y="${currentY}" ` +
          `font-size="${Math.round(TEXT_STYLE.bioSize * scale)}" ` +
          `fill="${TEXT_STYLE.secondaryColor}" ` +
          `text-anchor="middle" ` +
          `font-family="sans-serif">${escapeHtml(line)}</text>`
      )
      currentY += lineHeight
    }
  }

  // 6. 二维码区域（二维码由 composite 添加，这里只添加文字）
  const qrCodeY = currentY + Math.round(LAYOUT.spacing * 2 * scale)
  const qrCodeSize = Math.round(LAYOUT.qrCodeSize * scale)
  const scanTipY = qrCodeY + qrCodeSize + Math.round(LAYOUT.spacing * 1.5 * scale)

  elements.push(
    `<text x="${width / 2}" y="${scanTipY}" ` +
      `font-size="${Math.round(TEXT_STYLE.scanTipSize * scale)}" ` +
      `fill="${TEXT_STYLE.secondaryColor}" ` +
      `text-anchor="middle" ` +
      `font-family="sans-serif">扫码查看我的主页</text>`
  )

  // 7. 底部 Logo
  const footerY = height - Math.round(60 * scale)
  elements.push(
    `<text x="${width / 2}" y="${footerY}" ` +
      `font-size="${Math.round(32 * scale)}" ` +
      `fill="#9ca3af" ` +
      `text-anchor="middle" ` +
      `font-family="sans-serif">LinkHub</text>`
  )

  // 包装成完整的 SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${elements.join('\n    ')}
  </svg>`
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * 截断文本
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 1) + '…'
}

/**
 * 文本换行（简单实现）
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text) {
    return []
  }

  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''

  for (const char of words) {
    if (currentLine.length < maxCharsPerLine) {
      currentLine += char
    } else {
      lines.push(currentLine)
      currentLine = char
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
