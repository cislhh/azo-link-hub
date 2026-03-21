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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { SocialPlatform } from '@/lib/utils/validation'

/**
 * 支持的社交平台
 */
const PLATFORMS = [
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
        onValueChange={(value) => setSelectedPlatform(value as SocialPlatform)}
      >
        <SelectTrigger>
          <SelectValue placeholder="选择平台" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((platform) => (
            <SelectItem
              key={platform.value}
              value={platform.value}
              disabled={value.some((link) => link.platform === platform.value)}
            >
              {platform.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            暂无社交链接，点击上方"添加"按钮添加
          </div>
        ) : (
          value.map((link, index) => {
            const platform = PLATFORMS.find((p) => p.value === link.platform)
            return (
              <div
                key={index}
                className={cn(
                  "rounded-lg border border-gray-200 p-4 transition-colors",
                  !link.isVisible && "opacity-50"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
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
                <Input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder={`${platform?.label || link.platform} URL`}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
