# Phone Preview Component

## 概述

`PhonePreview` 是一个实时手机预览组件，用于展示用户链接页面的最终效果。采用 iPhone 风格设计，包含完整的手机外框、状态栏、Home Indicator 等细节。

## 特性

- ✅ **iPhone 风格设计**: 真实的手机外框、圆角、侧边按钮
- ✅ **完整状态栏**: 时间、WiFi、电池图标
- ✅ **Home Indicator**: 底部主屏幕指示器
- ✅ **实时预览**: 响应式更新，无需刷新
- ✅ **滚动支持**: 内容超出时可以滚动查看
- ✅ **黄金比例间距**: 使用 1.618 黄金比例布局链接
- ✅ **社交平台图标**: 支持所有主流社交平台
- ✅ **自定义背景**: 支持自定义背景颜色
- ✅ **空状态处理**: 无链接时显示友好提示
- ✅ **头像占位符**: 无头像时显示首字母占位

## 安装依赖

```bash
npm install lucide-react
```

## 快速开始

### 基础用法

```tsx
'use client'

import { PhonePreview } from '@/components/preview/phone-preview'
import { SocialLink } from '@/components/link/social-links-form'
import { ExtraLink } from '@/components/link/extra-links-form'

function MyPage() {
  return (
    <PhonePreview
      username="johndoe"
      displayName="John Doe"
      bio="全栈开发者 | 开源爱好者"
      avatar="https://example.com/avatar.jpg"
      backgroundValue="#f0f9ff"
      socialLinks={[
        { platform: 'github', url: 'https://github.com/johndoe', isVisible: true },
      ]}
      extraLinks={[
        { title: '我的博客', url: 'https://blog.com', isVisible: true },
      ]}
    />
  )
}
```

### 与表单集成（实时预览）

```tsx
'use client'

import { useState } from 'react'
import { PhonePreview } from '@/components/preview/phone-preview'
import { LinkForm } from '@/components/link/link-form'

function CreatePage() {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatar: '',
    backgroundType: 'solid' as const,
    backgroundValue: '#ffffff',
    socialLinks: [],
    extraLinks: [],
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 左侧表单 */}
      <LinkForm
        defaultValues={formData}
        onSubmit={(data) => {
          setFormData(data)
          // 保存到后端
        }}
      />

      {/* 右侧预览 */}
      <div className="lg:sticky lg:top-8">
        <PhonePreview {...formData} />
      </div>
    </div>
  )
}
```

## API 文档

### PhonePreviewProps

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `username` | `string` | 否 | - | 用户名 |
| `displayName` | `string` | 否 | - | 显示名称 |
| `bio` | `string` | 否 | - | 个人简介 |
| `avatar` | `string` | 否 | - | 头像 URL |
| `backgroundType` | `'solid'` | 否 | - | 背景类型（目前仅支持纯色） |
| `backgroundValue` | `string` | **是** | `'#ffffff'` | 背景颜色值（十六进制） |
| `socialLinks` | `SocialLink[]` | **是** | `[]` | 社交链接数组 |
| `extraLinks` | `ExtraLink[]` | **是** | `[]` | 额外链接数组 |

### SocialLink 类型

```typescript
interface SocialLink {
  platform: SocialPlatform  // 社交平台类型
  url: string              // 链接地址
  isVisible: boolean       // 是否可见
}
```

### ExtraLink 类型

```typescript
interface ExtraLink {
  title: string           // 链接标题
  url: string             // 链接地址
  description?: string    // 链接描述（可选）
  icon?: string           // 图标名称（可选）
  isVisible: boolean      // 是否可见
}
```

## 支持的社交平台

| 平台 | 值 | 图标 |
|------|-----|------|
| GitHub | `github` | `Github` |
| LinkedIn | `linkedin` | `Linkedin` |
| Twitter (X) | `twitter` | `Twitter` |
| Instagram | `instagram` | `Instagram` |
| YouTube | `youtube` | `Youtube` |
| Facebook | `facebook` | `Facebook` |
| Telegram | `telegram` | `Send` |
| WhatsApp | `whatsapp` | `MessageCircle` |
| Email | `email` | `Mail` |
| Website | `website` | `Globe` |
| TikTok | `tiktok` | `Link` |

## 样式定制

### 手机尺寸

默认手机尺寸为 `320px` 宽度，可通过修改组件中的 `w-[320px]` 类名调整：

```tsx
// 更大的预览
<div className="w-[375px] ...">  // iPhone SE 尺寸
```

### 链接间距

使用黄金比例（1.618）计算链接间距：

```typescript
const goldenRatio = 1.618
const baseSpacing = 12
const linkSpacing = Math.round(baseSpacing * goldenRatio) // 约 20px
```

### 滚动条样式

自定义滚动条样式（仅 Webkit 浏览器）：

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

## 示例

更多使用示例请参考 [`phone-preview.example.tsx`](./phone-preview.example.tsx)：

1. **基础用法**: 简单的预览展示
2. **与表单集成**: 实时预览表单数据
3. **不同背景色**: 展示多种背景色效果
4. **所有社交平台**: 展示所有支持的社交平台图标

## 技术细节

### 状态栏

- 左侧: 当前时间（动态获取）
- 右侧: WiFi 和电池图标
- 使用 `lucide-react` 图标库

### 手机外框

- 圆角: `rounded-[48px]`
- 边框: `border-[14px] border-gray-900`
- 侧边按钮: 使用绝对定位模拟音量和电源键

### 响应式设计

- 默认固定宽度（320px）
- 在大屏幕上使用 `sticky` 定位保持预览可见
- 支持垂直滚动（内容超出时）

### 性能优化

- 使用 `filter` 过滤不可见链接
- 图标组件映射缓存
- 最小化重渲染

## 注意事项

1. **客户端组件**: 必须使用 `'use client'` 指令
2. **图片 URL**: 头像必须是有效的 URL 地址
3. **链接验证**: 组件不验证 URL 有效性，需在使用前验证
4. **浏览器兼容**: 滚动条样式仅支持 Webkit 浏览器

## 故障排查

### 头像不显示

确保头像 URL 是有效的图片地址：

```tsx
avatar="https://example.com/avatar.jpg"  // ✅ 正确
avatar="/avatar.jpg"                      // ❌ 相对路径可能不工作
```

### 图标不显示

确保社交平台名称正确：

```tsx
platform: 'github'   // ✅ 正确（小写）
platform: 'GitHub'   // ❌ 错误（大小写敏感）
```

### 链接点击无反应

确保链接包含协议：

```tsx
url="https://github.com/user"  // ✅ 正确
url="github.com/user"          // ❌ 错误（缺少协议）
```

## 许可证

MIT
