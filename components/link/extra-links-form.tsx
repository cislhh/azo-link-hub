'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/**
 * 额外链接数据类型
 */
export interface ExtraLink {
  title: string
  url: string
  description?: string
  icon?: string
  isVisible: boolean
}

/**
 * 额外链接表单组件
 *
 * 用于添加和管理自定义链接
 */
interface ExtraLinksFormProps {
  value: ExtraLink[]
  onChange: (links: ExtraLink[]) => void
}

export function ExtraLinksForm({ value, onChange }: ExtraLinksFormProps) {
  /**
   * 添加新链接
   */
  const addLink = () => {
    onChange([
      ...value,
      {
        title: '',
        url: '',
        description: '',
        icon: '',
        isVisible: true,
      },
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
  const updateLink = (index: number, updates: Partial<ExtraLink>) => {
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
        <Label htmlFor="extra-links" className="text-base">
          额外链接
        </Label>
        <Button type="button" variant="default" size="sm" onClick={addLink}>
          <Plus className="mr-1 h-4 w-4" />
          添加
        </Button>
      </div>

      <div className="space-y-3">
        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            暂无额外链接，点击上方“添加”按钮添加
          </div>
        ) : (
          value.map((link, index) => (
            <div
              key={index}
              className={cn(
                "space-y-3 rounded-lg border border-border bg-card p-4 transition-colors",
                !link.isVisible && "opacity-50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    链接 #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">可见</span>
                    <Switch
                      checked={link.isVisible}
                      onCheckedChange={() => toggleVisibility(index)}
                    />
                  </div>
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

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`extra-title-${index}`}>链接标题</Label>
                  <Input
                    id={`extra-title-${index}`}
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(index, { title: e.target.value })}
                    placeholder="例如: 我的博客"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`extra-url-${index}`}>链接地址</Label>
                  <Input
                    id={`extra-url-${index}`}
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder="example.com 或 https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`extra-desc-${index}`}>链接描述</Label>
                  <Textarea
                    id={`extra-desc-${index}`}
                    value={link.description || ''}
                    onChange={(e) => updateLink(index, { description: e.target.value })}
                    placeholder="简短描述这个链接（可选）"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`extra-icon-${index}`}>图标名称</Label>
                  <Input
                    id={`extra-icon-${index}`}
                    type="text"
                    value={link.icon || ''}
                    onChange={(e) => updateLink(index, { icon: e.target.value })}
                    placeholder="例如: link, calendar, star（可选）"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
