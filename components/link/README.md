# 链接表单组件

用于创建和编辑用户链接页面的可复用表单组件。

## 组件列表

### 1. LinkForm

主表单组件，包含所有链接页面设置。

#### 使用示例

```tsx
'use client'

import { LinkForm, LinkFormData } from '@/components/link'
import { createLink } from '@/app/actions/links'

export default function CreateLinkPage() {
  const handleSubmit = async (data: LinkFormData) => {
    await createLink(data)
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <LinkForm
        onSubmit={handleSubmit}
        submitButtonText="创建链接页面"
      />
    </div>
  )
}
```

#### Props

- `defaultValues?: Partial<LinkFormData>` - 初始表单数据
- `onSubmit: (data: LinkFormData) => void | Promise<void>` - 表单提交回调
- `isSubmitting?: boolean` - 提交中状态
- `submitButtonText?: string` - 提交按钮文本（默认："保存"）

### 2. SocialLinksForm

社交媒体链接表单组件。

#### 使用示例

```tsx
'use client'

import { useState } from 'react'
import { SocialLinksForm, SocialLink } from '@/components/link'

export default function MyForm() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  return (
    <SocialLinksForm
      value={socialLinks}
      onChange={setSocialLinks}
    />
  )
}
```

#### 支持的平台

- GitHub
- LinkedIn
- Twitter (X)
- Instagram
- YouTube
- Facebook
- Telegram
- WhatsApp
- Email
- TikTok
- Website

### 3. ExtraLinksForm

额外链接表单组件，用于添加自定义链接。

#### 使用示例

```tsx
'use client'

import { useState } from 'react'
import { ExtraLinksForm, ExtraLink } from '@/components/link'

export default function MyForm() {
  const [extraLinks, setExtraLinks] = useState<ExtraLink[]>([])

  return (
    <ExtraLinksForm
      value={extraLinks}
      onChange={setExtraLinks}
    />
  )
}
```

#### ExtraLink 接口

```typescript
interface ExtraLink {
  title: string          // 链接标题（必需）
  url: string           // 链接地址（必需）
  description?: string  // 链接描述（可选）
  icon?: string         // 图标名称（可选）
  isVisible: boolean    // 是否可见
}
```

### 4. BackgroundSelector

背景颜色选择器组件。

#### 使用示例

```tsx
'use client'

import { useState } from 'react'
import { BackgroundSelector } from '@/components/link'

export default function MyForm() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

  return (
    <BackgroundSelector
      value={backgroundColor}
      onChange={setBackgroundColor}
    />
  )
}
```

#### 预设颜色

- 纯白 (#ffffff)
- 米白 (#f8f9fa)
- 浅灰 (#e9ecef)
- 碳黑 (#1a1a1a)
- 炭灰 (#2d2d2d)
- 深蓝 (#0a1628)
- 藏青 (#0a0a23)
- 深紫 (#1a0a2e)

## 类型定义

所有组件都导出了相应的 TypeScript 类型：

```typescript
import type {
  LinkFormData,
  SocialLink,
  ExtraLink,
} from '@/components/link'
```

## 表单验证

表单组件使用 Zod schemas 进行验证，验证规则定义在 `/lib/utils/validation.ts`：

- 用户名：3-20个字符，只能包含字母、数字、下划线和连字符
- 显示名称：1-50个字符（可选）
- 简介：最多500个字符（可选）
- 头像：有效的 HTTP/HTTPS URL（可选）
- 社交链接：有效的 URL
- 额外链接：有效的 URL，标题1-50个字符

## 样式

组件使用 Tailwind CSS 和 Shadcn/ui 组件库，确保样式一致性。所有组件都是响应式设计，支持移动端和桌面端。

## 依赖

- `react-hook-form` - 表单状态管理
- `@hookform/resolvers` - Zod 集成
- `zod` - 表单验证
- `lucide-react` - 图标库
- Shadcn/ui 组件（Button, Input, Textarea, Label, Select, Switch, Card）
