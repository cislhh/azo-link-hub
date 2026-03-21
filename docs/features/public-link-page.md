# 公开链接页面功能

## 概述

公开链接页面允许用户通过 `https://yourdomain.com/[username]` 访问他们的链接聚合页面。

## 实现细节

### 1. 数据库模型

#### Link 模型新增字段

```prisma
model Link {
  id               String       @id @default(cuid())
  username         String       @unique  // 用户名（用于 URL）
  userId           String       @unique  // 一对一关系
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  displayName      String?      // 显示名称
  bio              String?      // 简介
  avatar           String?      // 头像 URL

  backgroundType   String       @default("solid")  // 背景类型
  backgroundValue  String       // 背景颜色值

  shareImageUrl    String?      @default("/api/placeholder/qrcode")
  shareImageGenerated Boolean   @default(false)

  isActive         Boolean      @default(true)  // 是否激活
  publishedAt      DateTime?

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  socialLinks      SocialLink[]
  extraLinks       ExtraLink[]

  @@index([userId])
  @@index([username])
  @@map("links")
}
```

#### SocialLink 和 ExtraLink 字段名更新

- `visible` → `isVisible` （统一使用 camelCase）

### 2. API 端点

#### GET /api/links/[username]

获取用户的公开链接数据。

**请求参数：**
- `username`: 用户名（URL 参数）

**响应格式：**

成功（200）：
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "username": "testuser",
    "displayName": "Test User",
    "bio": "This is a test bio",
    "avatar": "https://example.com/avatar.jpg",
    "backgroundValue": "#ffffff",
    "user": {
      "id": "clxxx...",
      "name": "Test User",
      "image": "https://example.com/image.jpg"
    },
    "socialLinks": [
      {
        "id": "clxxx...",
        "platform": "github",
        "url": "https://github.com/test",
        "isVisible": true,
        "order": 0
      }
    ],
    "extraLinks": [
      {
        "id": "clxxx...",
        "title": "My Blog",
        "url": "https://blog.example.com",
        "description": "My personal blog",
        "isVisible": true,
        "order": 0
      }
    ]
  }
}
```

失败（404）：
```json
{
  "success": false,
  "error": "链接不存在或未激活"
}
```

### 3. 页面路由

#### /[username]

动态路由页面，展示用户的公开链接页面。

**特性：**
- Server Component（服务端渲染）
- SEO 优化（动态生成 metadata）
- 只显示 `isVisible: true` 的链接
- 支持响应式设计（移动端优先）
- 自定义背景颜色
- 空状态提示

**错误处理：**
- 用户不存在 → 404 页面
- 链接未激活（`isActive: false`）→ 404 页面

### 4. 组件

#### PublicLinkPage

可复用的公开链接页面组件。

**Props：**
```typescript
interface PublicLinkPageProps {
  username: string
  displayName?: string | null
  bio?: string | null
  avatar?: string | null
  userImage?: string | null
  backgroundColor: string
  socialLinks: SocialLink[]
  extraLinks: ExtraLink[]
}
```

**特性：**
- 移动端优先的单栏布局
- 黄金比例间距（1.618）
- 社交链接带品牌图标
- 额外链接带描述
- 悬停动画效果
- 默认头像占位符

### 5. 服务层

#### LinkService.getLinkByUsername()

根据用户名获取公开链接数据。

```typescript
async getLinkByUsername(username: string): Promise<LinkWithRelations | null>
```

**特性：**
- 只返回 `isActive: true` 的链接
- 只返回 `isVisible: true` 的社交链接和额外链接
- 按 `order` 字段排序
- 包含用户基本信息（name, image）

### 6. SEO 优化

#### Metadata 生成

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const link = await getUserLink(username)

  return {
    title: link.displayName || link.username,
    description: link.bio || `查看 ${link.displayName || link.username} 的链接`,
    openGraph: {
      title: link.displayName || link.username,
      description: link.bio,
      type: 'website',
    },
  }
}
```

## 使用示例

### 1. 创建用户链接

```typescript
import { linkService } from '@/lib/services/link.service'

// 创建新链接
const link = await linkService.createLink(userId, {
  username: 'john_doe',
  displayName: 'John Doe',
  bio: 'Web Developer | Open Source Enthusiast',
  avatar: 'https://example.com/avatar.jpg',
  backgroundType: 'solid',
  backgroundValue: '#f0f9ff',
  socialLinks: [
    {
      platform: 'github',
      url: 'https://github.com/johndoe',
      isVisible: true,
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com/johndoe',
      isVisible: true,
    },
  ],
  extraLinks: [
    {
      title: 'My Portfolio',
      url: 'https://johndoe.dev',
      description: 'Check out my work',
      isVisible: true,
    },
    {
      title: 'Blog',
      url: 'https://blog.johndoe.dev',
      description: 'Tech articles and tutorials',
      isVisible: true,
    },
  ],
})
```

### 2. 访问公开页面

用户访问 `https://yourdomain.com/john_doe` 即可看到该用户的链接页面。

### 3. 更新链接

```typescript
await linkService.updateLink(linkId, {
  bio: 'Updated bio',
  backgroundValue: '#fef3c7',
})
```

### 4. 切换链接激活状态

```typescript
// 手动更新数据库（通过 Prisma）
await prisma.link.update({
  where: { id: linkId },
  data: { isActive: false }, // 暂时禁用页面
})
```

## 支持的社交平台

- GitHub
- LinkedIn
- Twitter
- Instagram
- YouTube
- Facebook
- Telegram
- WhatsApp
- Email
- Website
- TikTok

## 样式定制

### 背景颜色

用户可以选择任何有效的 CSS 颜色值：
- 十六进制：`#ffffff`, `#000000`
- RGB：`rgb(255, 255, 255)`
- RGBA：`rgba(255, 255, 255, 0.5)`
- HSL：`hsl(0, 0%, 100%)`
- 颜色名称：`white`, `black`, `blue`

### 响应式设计

- **移动端**（< 768px）：单栏布局，居中对齐
- **平板/桌面**（≥ 768px）：单栏布局，居中对齐，最大宽度 448px

## 测试

集成测试位于 `tests/integration/public-link-page.test.ts`。

**测试覆盖：**
- ✅ 返回用户的公开链接数据
- ✅ 只返回可见的链接
- ✅ 链接不存在时返回 null
- ✅ 链接未激活时返回 null
- ✅ 链接按 order 字段排序

## 未来改进

- [ ] OG 图片生成（`/api/og/[username]`）
- [ ] QR 码生成（`/api/qrcode/[username]`）
- [ ] 主题选择（渐变背景、图片背景）
- [ ] 自定义字体
- [ ] 自定义按钮样式
- [ ] 分析统计（点击量）
- [ ] 自定义域名支持
