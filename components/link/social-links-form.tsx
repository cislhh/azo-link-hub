'use client'

import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { SocialPlatform } from '@/lib/utils/validation'
import { PlatformCategorySwitch } from './platform-category-switch'

/**
 * 国际社交平台
 */
const INTERNATIONAL_PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter (X)', icon: 'Twitter' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'youtube', label: 'YouTube', icon: 'YouTube' },
  { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { value: 'telegram', label: 'Telegram', icon: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'WhatsApp' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'tiktok', label: 'TikTok', icon: 'TikTok' },
  { value: 'website', label: 'Website', icon: 'Globe' },
] as const

/**
 * 国内社交平台
 */
const DOMESTIC_PLATFORMS = [
  { value: 'wechat', label: '微信', icon: 'MessageCircle' },
  { value: 'weibo', label: '微博', icon: 'Globe' },
  { value: 'qq', label: 'QQ', icon: 'MessageCircle' },
  { value: 'douyin', label: '抖音', icon: 'Video' },
  { value: 'xiaohongshu', label: '小红书', icon: 'BookOpen' },
  { value: 'zhihu', label: '知乎', icon: 'HelpCircle' },
  { value: 'bilibili', label: 'B站', icon: 'Video' },
  { value: 'kuaishou', label: '快手', icon: 'Video' },
] as const

/**
 * 所有平台合并
 */
const ALL_PLATFORMS = [...INTERNATIONAL_PLATFORMS, ...DOMESTIC_PLATFORMS]

/**
 * 社交链接数据类型
 */
export interface SocialLink {
  platform: SocialPlatform
  url: string
  isVisible: boolean
}

/**
 * 社交链接表单组件
 *
 * 用于添加和管理社交媒体链接
 */
interface SocialLinksFormProps {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

export function SocialLinksForm({ value, onChange }: SocialLinksFormProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('github')
  const [platformCategory, setPlatformCategory] = useState<'international' | 'domestic'>('international')

  /**
   * 添加新链接
   */
  const addLink = () => {
    // 检查是否已存在该平台
    const existingLink = value.find((link) => link.platform === selectedPlatform)
    if (existingLink) {
      return // 已存在，不添加
    }

    onChange([
      ...value,
      { platform: selectedPlatform, url: '', isVisible: true },
    ])
  }

  /**
   * 删除链接
   */
  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  /**
   * 更新链接
   */
  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    onChange(value.map((link, i) => (i === index ? { ...link, ...updates } : link)))
  }

  /**
   * 切换可见性
   */
  const toggleVisibility = (index: number) => {
    updateLink(index, { isVisible: !value[index].isVisible })
  }

  /**
   * 获取平台信息
   */
  const getPlatformInfo = (platformValue: string) => {
    return ALL_PLATFORMS.find((p) => p.value === platformValue)
  }

  /**
   * 获取当前分类的平台列表
   */
  const getCurrentPlatforms = () => {
    return platformCategory === 'international' ? INTERNATIONAL_PLATFORMS : DOMESTIC_PLATFORMS
  }

  /**
   * 处理平台选择
   */
  const handlePlatformSelect = (platformValue: string) => {
    setSelectedPlatform(platformValue as SocialPlatform)
  }

  /**
   * 切换分类时，自动选择该分类下的第一个可用平台
   */
  const handleCategoryChange = (category: 'international' | 'domestic') => {
    setPlatformCategory(category)
    const platforms = category === 'international' ? INTERNATIONAL_PLATFORMS : DOMESTIC_PLATFORMS
    // 选择第一个未被添加的平台
    const firstAvailable = platforms.find(p => !value.some(link => link.platform === p.value))
    if (firstAvailable) {
      setSelectedPlatform(firstAvailable.value as SocialPlatform)
    } else {
      setSelectedPlatform(platforms[0].value as SocialPlatform)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="social-links" className="text-base">
          社交媒体链接
        </Label>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={addLink}
          disabled={value.some((link) => link.platform === selectedPlatform)}
        >
          <Plus className="mr-1 h-4 w-4" />
          添加
        </Button>
      </div>

      <Select
        value={selectedPlatform}
        onValueChange={handlePlatformSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="选择平台" />
        </SelectTrigger>
        <SelectContent className="p-0">
          {/* 顶部分类切换 - 使用提取的组件 */}
          <PlatformCategorySwitch
            activeCategory={platformCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* 平台列表，带内部滚动 */}
          <div className="max-h-50 overflow-y-auto">
            {getCurrentPlatforms().map((platform) => {
              const isAdded = value.some((link) => link.platform === platform.value)
              return (
                <SelectItem
                  key={platform.value}
                  value={platform.value}
                  disabled={isAdded}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{platform.label}</span>
                    {isAdded && (
                      <span className="text-xs text-muted-foreground">已添加</span>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </div>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            暂无社交链接，点击上方&ldquo;添加&rdquo;按钮添加
          </div>
        ) : (
          value.map((link, index) => {
            const platform = getPlatformInfo(link.platform)
            return (
              <div
                key={index}
                className={cn(
                  "rounded-lg border border-border bg-card p-4 transition-colors",
                  !link.isVisible && "opacity-50"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {platform?.label || link.platform}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(index)}
                      title={link.isVisible ? '隐藏' : '显示'}
                    >
                      {link.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`social-url-${index}`}>链接地址</Label>
                  <Input
                    id={`social-url-${index}`}
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder={
                      link.platform === 'email' || link.platform === 'wechat' || link.platform === 'qq'
                        ? 'example@email.com'
                        : `${platform?.label || link.platform} URL`
                    }
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
