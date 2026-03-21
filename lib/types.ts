/**
 * 类型定义
 *
 * 导出 Prisma 生成的类型和其他应用类型
 */

export type { User, Account, Session, VerificationToken, Link, SocialLink, ExtraLink } from '@prisma/client'

/**
 * API 响应通用格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * 社交平台类型
 */
export type SocialPlatform = 'twitter' | 'github' | 'linkedin' | 'instagram' | 'youtube' | 'facebook' | 'telegram' | 'whatsapp' | 'tiktok' | 'website' | 'email'

/**
 * 创建社交链接输入
 */
export interface CreateSocialLinkInput {
  platform: SocialPlatform
  url: string
  visible?: boolean
  order?: number
}

/**
 * 创建额外链接输入
 */
export interface CreateExtraLinkInput {
  title: string
  url: string
  description?: string
  icon?: string
  visible?: boolean
  order?: number
}
