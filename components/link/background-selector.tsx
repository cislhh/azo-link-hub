'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getBackgroundFillStyle,
  getBackgroundPatternLabel,
  isDarkBackground,
} from '@/lib/utils/background'

/**
 * 背景颜色选项
 */
const BACKGROUNDS = [
  { name: '纯白', value: '#ffffff', category: 'light' },
  { name: '米白', value: '#f8f9fa', category: 'light' },
  { name: '浅灰', value: '#e9ecef', category: 'light' },
  { name: '碳黑', value: '#1a1a1a', category: 'dark' },
  { name: '炭灰', value: '#2d2d2d', category: 'dark' },
  { name: '深蓝', value: '#0a1628', category: 'dark' },
  { name: '藏青', value: '#0a0a23', category: 'accent' },
  { name: '深紫', value: '#1a0a2e', category: 'accent' },
] as const

/**
 * 背景选择器组件
 *
 * 用于从预设的背景颜色中选择一个
 */
interface BackgroundSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        背景颜色
      </label>
      <div className="grid grid-cols-4 gap-3">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.value}
            type="button"
            onClick={() => onChange(bg.value)}
            className={cn(
              "relative h-20 rounded-lg border-2 transition-colors hover:border-ring/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              value === bg.value ? "border-primary" : "border-border"
            )}
            style={getBackgroundFillStyle(bg.value)}
            title={bg.name}
          >
            <span className={cn(
              'absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
              isDarkBackground(bg.value)
                ? 'bg-black/35 text-white'
                : 'bg-white/70 text-gray-900'
            )}>
              {bg.name} · {getBackgroundPatternLabel(bg.value)}
            </span>
            {value === bg.value && (
              <Check className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
