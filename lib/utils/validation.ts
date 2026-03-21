/**
 * Zod 验证 Schemas
 *
 * 用于验证链接表单数据
 */

import { z } from 'zod'

// ============================================================================
// 常量
// ============================================================================

/**
 * 用户名正则表达式
 * - 允许字母、数字、下划线、连字符
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/

/**
 * 支持的社交平台列表
 */
const SUPPORTED_SOCIAL_PLATFORMS = [
  'twitter',
  'github',
  'linkedin',
  'instagram',
  'youtube',
  'facebook',
  'telegram',
  'whatsapp',
  'tiktok',
  'website',
  'email',
] as const

/**
 * 支持的背景类型
 */
const SUPPORTED_BACKGROUND_TYPES = ['solid'] as const

// ============================================================================
// 验证辅助函数
// ============================================================================

/**
 * 检查字符串是否为有效的 HTTP/HTTPS URL
 */
function isValidHttpUrl(val: string): boolean {
  try {
    const url = new URL(val)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 检查对象是否为空
 */
function isNonEmptyObject(data: Record<string, unknown>): boolean {
  return Object.keys(data).length > 0
}

// ============================================================================
// 基础 Schemas
// ============================================================================

/**
 * 社交平台枚举
 */
export const socialPlatformEnum = z.enum(SUPPORTED_SOCIAL_PLATFORMS)

/**
 * 背景类型枚举
 */
export const backgroundTypeEnum = z.enum(SUPPORTED_BACKGROUND_TYPES)

/**
 * 用户名验证 schema
 * - 3-20个字符
 * - 只能包含字母、数字、下划线、连字符
 */
export const usernameSchema = z
  .string()
  .min(3, '用户名至少3个字符')
  .max(20, '用户名最多20个字符')
  .regex(USERNAME_REGEX, '用户名只能包含字母、数字、下划线和连字符')

/**
 * 显示名称验证 schema
 * - 可选
 * - 1-50个字符
 * - 允许任何 Unicode 字符
 */
export const displayNameSchema = z
  .string()
  .min(1, '显示名称至少1个字符')
  .max(50, '显示名称最多50个字符')
  .optional()

/**
 * 简介验证 schema
 * - 可选
 * - 最多500个字符
 * - 允许空字符串
 */
export const bioSchema = z
  .string()
  .max(500, '简介最多500个字符')
  .optional()

/**
 * 头像验证 schema
 * - 可选
 * - 必须是有效的 HTTP/HTTPS URL
 */
export const avatarSchema = z
  .string()
  .refine(isValidHttpUrl, '头像必须是有效的HTTP/HTTPS URL')
  .optional()

/**
 * 背景颜色值验证 schema
 * - 必需
 * - 接受各种颜色格式（hex、rgb、rgba、hsl、颜色名称）
 */
export const backgroundValueSchema = z
  .string()
  .min(1, '背景颜色值不能为空')

/**
 * HTTP/HTTPS URL 验证 schema
 * - 可复用的 URL 验证
 */
export const httpUrlSchema = z.string().refine(isValidHttpUrl, '必须是有效的HTTP/HTTPS URL')

// ============================================================================
// 复合 Schemas
// ============================================================================

/**
 * 社交链接验证 schema
 */
export const socialLinkSchema = z.object({
  platform: socialPlatformEnum,
  url: z.string().url('链接必须是有效的URL'),
  isVisible: z.boolean().default(true),
})

/**
 * 额外链接验证 schema
 */
export const extraLinkSchema = z.object({
  title: z
    .string()
    .min(1, '链接标题至少1个字符')
    .max(50, '链接标题最多50个字符'),
  url: z.string().url('链接必须是有效的URL'),
  description: z
    .string()
    .max(200, '链接描述最多200个字符')
    .optional(),
  icon: z
    .string()
    .max(50, '图标名称最多50个字符')
    .optional(),
  isVisible: z.boolean().default(true),
})

/**
 * 创建链接验证 schema
 */
export const createLinkSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  avatar: avatarSchema,
  backgroundType: backgroundTypeEnum,
  backgroundValue: backgroundValueSchema,
  socialLinks: z.array(socialLinkSchema).default([]),
  extraLinks: z.array(extraLinkSchema).default([]),
})

/**
 * 更新链接验证 schema
 * 所有字段都是可选的，但至少需要一个字段
 */
export const updateLinkSchema = z
  .object({
    username: usernameSchema.optional(),
    displayName: displayNameSchema,
    bio: bioSchema,
    avatar: avatarSchema,
    backgroundType: backgroundTypeEnum.optional(),
    backgroundValue: backgroundValueSchema.optional(),
    socialLinks: z.array(socialLinkSchema).optional(),
    extraLinks: z.array(extraLinkSchema).optional(),
  })
  .refine(isNonEmptyObject, {
    message: '至少需要提供一个要更新的字段',
  })

// ============================================================================
// 类型推断
// ============================================================================

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type SocialPlatform = z.infer<typeof socialPlatformEnum>
export type BackgroundType = z.infer<typeof backgroundTypeEnum>
export type SocialLinkInput = z.infer<typeof socialLinkSchema>
export type ExtraLinkInput = z.infer<typeof extraLinkSchema>
