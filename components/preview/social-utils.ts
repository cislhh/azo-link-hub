import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Send,
  MessageCircle,
  Mail,
  Globe,
  Link as LinkIcon,
} from 'lucide-react'
import type { SocialPlatform } from '@/lib/utils/validation'

/**
 * 社交平台图标映射
 */
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  telegram: Send,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  tiktok: LinkIcon,
}

/**
 * 获取社交平台图标
 */
export function getSocialIcon(platform: SocialPlatform | string): React.ComponentType<{ className?: string }> {
  return SOCIAL_ICONS[platform] || LinkIcon
}

/**
 * 获取社交平台显示名称
 */
export function getPlatformName(platform: SocialPlatform | string): string {
  const names: Record<string, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    email: 'Email',
    website: 'Website',
    tiktok: 'TikTok',
  }
  return names[platform] || platform
}
