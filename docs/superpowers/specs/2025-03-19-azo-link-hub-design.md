# azo-link-hub 项目设计文档

**日期**: 2025-03-19
**版本**: 1.1
**状态**: 已通过审查

---

## 目录

1. [项目概述](#第一章项目概述)
2. [系统架构](#第二章系统架构)
3. [数据库设计](#第三章数据库设计)
4. [UI/UX 设计](#第四章uiux-设计)
5. [认证系统设计](#第五章认证系统设计)
6. [核心功能实现](#第六章核心功能实现)
7. [项目规则文件](#第七章项目规则文件)
8. [开发计划](#第八章开发计划和里程碑)

---

## 第一章：项目概述

### 项目定位

azo-link-hub 是一个现代化的链接聚合平台，帮助用户在单一页面集中展示所有社交媒体和个人链接。

### 技术栈

**前端：**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS
- Shadcn/ui

**后端：**
- Prisma 7 + PostgreSQL
- Auth.js (NextAuth.js 5)
- Vercel Blob

**开发工具：**
- Vitest (单元 + 集成测试)
- pnpm (包管理)
- Vercel (部署)

### 核心功能（MVP + OG图片）

1. Google OAuth 认证
2. 创建/编辑个性化链接页面
3. 社交媒体链接（Facebook, Instagram, Twitter, YouTube, GitHub, LinkedIn, Telegram, WhatsApp, Email）
4. 自定义额外链接
5. 8 个精选纯色背景
6. 移动端实时预览
7. 动态 OG 图片生成
8. 二维码生成和下载
9. URL 路由：`domain.com/username`

### 访问安全设计

**安全方案：完全公开访问**

- ✅ 默认公开访问（类似 Linktree、Bio.link）
- ✅ 用户可通过 `isActive` 开关控制页面显示/隐藏
- ✅ 所有人均可访问 `域名/username` 查看公开内容
- ✅ 符合行业惯例，易于分享

**理由：**
1. 链接聚合平台的核心价值在于公开分享
2. 主流竞品（Linktree、Bio.link）均采用公开访问模式
3. 简化用户体验，降低操作成本
4. SEO 友好，搜索引擎可索引
5. 社交媒体友好，可直接粘贴链接

**后续迭代（可选）：**
- 密码保护功能
- 访问统计分析
- 高级访问控制

### 设计原则

- 响应式设计（移动端和桌面端同等优化）
- 简洁美观的 UI
- 类型安全（TypeScript strict mode）
- 测试覆盖率 ≥ 80%
- 性能优化（Next.js 16 特性）
- 无渐变、纯色块设计
- Grid 网格系统 + 黄金比例布局

---

## 第二章：系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  公开页面    │  │  创建页面    │  │  编辑页面    │      │
│  │  /[username] │  │  /create     │  │  /edit       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Server Actions│  │Route Handlers│  │   RSC 页面   │      │
│  │ (数据变更)   │  │  (API 端点)  │  │  (服务渲染)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 认证服务     │  │ 链接服务     │  │ 用户服务     │      │
│  │Auth.js       │  │ (CRUD)       │  │ (Profile)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                             │
│              Prisma 7 + PostgreSQL (驱动适配器)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        存储服务                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ PostgreSQL   │  │ Vercel Blob  │                        │
│  │ (结构化数据) │  │ (文件存储)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

**App Router 结构：**
```
app/
├── (auth)/           # 认证路由组
│   ├── login/
│   └── layout.tsx
├── (dashboard)/      # 仪表板路由组
│   ├── create/
│   ├── edit/
│   └── layout.tsx
├── [username]/       # 动态路由（用户公开页面）
│   ├── page.tsx
│   └── opengraph-image.tsx  # OG 图片生成
├── api/              # API 路由
│   ├── auth/
│   └── ...
├── layout.tsx        # 根布局
└── page.tsx          # 首页
```

**组件组织：**
```
components/
├── ui/              # Shadcn/ui 基础组件
├── auth/            # 认证相关组件
├── link/            # 链接相关组件
├── background/      # 背景组件
└── preview/         # 预览组件
```

### 后端架构

**API 层：**
- Route Handlers：GET/POST/PUT/DELETE 端点
- Server Actions：表单提交和数据变更
- 中间件：认证和路由保护

**服务层：**
```
lib/
├── db.ts           # Prisma 客户端（驱动适配器模式）
├── auth.ts         # Auth.js 配置
├── services/
│   ├── user.service.ts
│   ├── link.service.ts
│   └── storage.service.ts
└── utils/
    ├── validation.ts    # Zod schemas
    └── helpers.ts       # 工具函数
```

### 数据流

1. **读取数据：** PostgreSQL → Prisma → Server Component → UI
2. **写入数据：** Form Submit → Server Action → Prisma → PostgreSQL
3. **文件上传：** Form → Vercel Blob → 返回 URL → 存入 PostgreSQL

---

## 第三章：数据库设计

### Prisma 7 配置文件结构

```
azo-link-hub/
├── prisma.config.ts       # Prisma 7 配置
├── prisma/
│   ├── schema.prisma      # 数据模型定义
│   └── migrations/        # 数据库迁移
└── lib/
    └── db.ts              # Prisma 客户端（驱动适配器模式）
```

### prisma.config.ts

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

### prisma/schema.prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"  // Prisma 7
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  links         Link[]

  @@index([email])
  @@map("users")
}

model Link {
  id            String    @id @default(cuid())
  username      String    @unique
  userId        String

  displayName   String?
  bio           String?
  avatar        String?

  backgroundType String   @default("solid")
  backgroundValue String

  title         String?
  description   String?

  isActive      Boolean   @default(true)
  publishedAt   DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  socialLinks   SocialLink[]
  extraLinks    ExtraLink[]

  @@index([userId])
  @@index([username])
  @@map("links")
}

model SocialLink {
  id            String    @id @default(cuid())
  linkId        String
  platform      String
  url           String
  order         Int       @default(0)
  isVisible     Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  link          Link      @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
  @@index([platform])
  @@map("social_links")
}

model ExtraLink {
  id            String    @id @default(cuid())
  linkId        String
  title         String
  url           String
  icon          String?
  order         Int       @default(0)
  isVisible     Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  link          Link      @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
  @@map("extra_links")
}
```

### lib/db.ts（驱动适配器模式）

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 5000,
})

pool.connect((err, client, done) => {
  if (err) {
    console.error('Database connection failed:', err)
    process.exit(1)
  }
  client.query('SELECT 1', (err) => {
    done()
    if (err) {
      console.error('Database test query failed:', err)
      process.exit(1)
    }
    console.log('Database connected successfully')
  })
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    await pool.end()
  })
}
```

### 数据库关键特性

1. **级联删除：** 用户删除时自动删除关联的链接
2. **索引优化：** 在常用查询字段上建立索引
3. **软删除支持：** `isActive` 字段控制显示/隐藏
4. **时间戳：** 创建和更新时间自动管理
5. **类型安全：** 完整的 TypeScript 类型生成

---

## 第四章：UI/UX 设计

### 设计哲学

- 极简主义：无渐变、纯色块
- 黄金比例布局：1.618 比例分割
- Grid 网格系统：精确对齐
- 微交互：仅颜色变化

### 页面布局

#### 1. 首页

```
┌─────────────────────────────────────────┐
│ [导航栏 - Grid 12列]                     │
├──────────┬──────────────────────────────┤
│ [Hero]   │ [CTA区域]                     │
│ (7列)    │ (5列)                         │
│ 黄金分割 │                               │
├──────────┴──────────────────────────────┤
│ [功能特性 - Grid 3列]                    │
├──────────┬──────────┬──────────┐         │
│ 功能1    │ 功能2    │ 功能3    │         │
├──────────┴──────────┴──────────┤         │
│ [示例预览 - Grid 2列]                   │
│ [示例]              [创建你的]           │
└─────────────────────────────────────────┘
```

#### 2. 创建/编辑页面

```
┌─────────────────────────────────────────────────────────────┐
│ [顶部导航 - 固定高度 64px]                                   │
├──────────────────────────────┬──────────────────────────────┤
│ [编辑表单区]                  │ [实时预览区]                 │
│ 65%                          │ 35%                          │
│                              │                              │
│ height: 100vh                │ height: auto                 │
│ overflow-y: auto             │ display: flex                │
│                              │ align-items: center          │
│                              │ justify-content: center      │
│                              │                              │
│ ┌────────────────────────┐   │                              │
│ │ [个人信息表单]          │   │         ┌──────────────┐    │
│ │                        │   │         │ ┌──────────┐ │    │
│ │ 名称: [_______]        │   │         │ │          │ │    │
│ │ 简介: [_______]        │   │         │ │  [手机]   │ │    │
│ │                        │   │         │ │          │ │    │
│ │ [社交链接表单]          │   │         │ │          │ │    │
│ │ Facebook: [____]       │   │         │ └──────────┘ │    │
│ │ Instagram: [____]      │   │         └──────────────┘    │
│ │                        │   │                              │
│ │ [额外链接表单]          │   │    右侧 flex 垂直居中        │
│ │ [添加链接] 按钮         │   │                              │
│ │                        │   │                              │
│ │ [背景选择]              │   │                              │
│ │ [选项1][选项2][选项3]   │   │                              │
│ │                        │   │                              │
│ │ [保存/发布] 按钮        │   │                              │
│ │                        │   │                              │
│ │ ↑ 可滚动区域           │   │                              │
│ └────────────────────────┘   │                              │
└──────────────────────────────┴──────────────────────────────┘
```

#### 3. 用户公开页面 `/[username]`

```
┌─────────────────────────────────────────┐
│                                         │
│        [内容容器 - 最大宽度 600px]        │
│                                         │
│        [头像 - 120px 圆形]               │
│        [名称 - 32px]                     │
│        [简介 - 16px]                     │
│                                         │
│    ┌───────────────────────────┐        │
│    │ [链接按钮 1]              │        │
│    └───────────────────────────┘        │
│    ┌───────────────────────────┐        │
│    │ [链接按钮 2]              │        │
│    └───────────────────────────┘        │
│    ┌───────────────────────────┐        │
│    │ [链接按钮 3]              │        │
│    └───────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

### 背景设计（纯色方案）

**深色系（3 个）：**
- Carbon Black（#1a1a1a）
- Charcoal（#2d2d2d）
- Navy（#0a1628）

**浅色系（3 个）：**
- Pure White（#ffffff）
- Off White（#f8f9fa）
- Light Gray（#e9ecef）

**强调色（2 个）：**
- Deep Blue（#0a0a23）
- Deep Purple（#1a0a2e）

### 颜色系统

```css
/* 主题色 - 纯色无渐变 */
--primary: #111827;        /* Gray 900 */
--primary-hover: #000000;  /* Black */
--secondary: #6b7280;      /* Gray 500 */
--accent: #6366f1;         /* Indigo 500 */

/* 背景色 */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;

/* 文本色 */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;

/* 边框色 */
--border: #e5e7eb;
--border-dark: #d1d5db;
```

### Grid 网格系统

```css
/* 12列网格系统 */
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 黄金比例布局 */
.grid-golden {
  display: grid;
  grid-template-columns: 65fr 35fr; /* 65% : 35% */
  gap: 24px;
}

/* 三列布局 */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

### 间距系统（8px 基准）

```css
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;
--space-8: 96px;
--space-10: 120px;
```

### 字体系统

```css
--font-xs: 12px;
--font-sm: 14px;
--font-base: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 32px;
--font-4xl: 48px;
```

### 交互设计

- 悬停：仅颜色变化 `background-color: var(--primary-hover)`
- 点击：无 ripple、无缩放
- 加载：纯色进度条
- 表单验证：边框颜色变化

### 可访问性

- WCAG AA 标准（对比度 ≥ 4.5:1）
- 键盘导航支持（Tab 键）
- 屏幕阅读器友好（ARIA 标签）
- 触摸目标 ≥ 44x44px

---

## 第五章：认证系统设计

### 开发流程：Test-Driven Development

```
RED → GREEN → REFACTOR

1. RED:   写测试 → 运行 → 失败
2. GREEN: 写实现 → 运行 → 通过
3. REFACTOR: 重构 → 运行 → 仍通过
4. 重复
```

### 测试文件结构

```
tests/
├── unit/
│   ├── auth/
│   │   ├── auth.config.test.ts
│   │   ├── auth.callbacks.test.ts
│   │   └── auth.utils.test.ts
│   └── services/
│       ├── user.service.test.ts
│       └── session.service.test.ts
├── integration/
│   ├── auth/
│   │   ├── login.flow.test.ts
│   │   ├── session.flow.test.ts
│   │   └── callback.flow.test.ts
│   └── api/
│       └── auth.route.test.ts
├── fixtures/
│   ├── users.ts
│   └── sessions.ts
└── setup.ts
```

### 测试工具配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts'],
    },
    globals: true,
  },
})
```

```typescript
// tests/setup.ts
import { prisma } from '@/lib/db'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  // 清理数据库
  await prisma.user.deleteMany()
  await prisma.link.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.extraLink.deleteMany()
})
```

### 认证配置

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!profile?.email) {
        return false
      }
      return true
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
```

### 测试覆盖率目标

| 文件 | 覆盖率目标 | 测试类型 |
|------|----------|---------|
| `lib/auth.ts` | ≥ 90% | 单元 + 集成 |
| `lib/services/user.service.ts` | ≥ 90% | 单元 |
| `app/api/auth/[...nextauth]/route.ts` | ≥ 80% | 集成 |
| `middleware.ts` | ≥ 80% | 集成 |
| **整体** | **≥ 80%** | - |

---

## 第六章：核心功能实现

### Server Actions（数据变更）

```typescript
// app/actions/links.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createLinkSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  backgroundType: z.enum(['solid']),
  backgroundValue: z.string(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
    isVisible: z.boolean().default(true),
  })),
  extraLinks: z.array(z.object({
    title: z.string().min(1).max(50),
    url: z.string().url(),
    icon: z.string().optional(),
    isVisible: z.boolean().default(true),
  })),
})

export async function createLink(data: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const validated = createLinkSchema.parse(Object.fromEntries(data))

  const existing = await prisma.link.findUnique({
    where: { username: validated.username },
  })

  if (existing) {
    throw new Error('Username already taken')
  }

  const link = await prisma.link.create({
    data: {
      userId: session.user.id,
      username: validated.username,
      displayName: validated.displayName,
      bio: validated.bio,
      avatar: validated.avatar,
      backgroundType: validated.backgroundType,
      backgroundValue: validated.backgroundValue,
      publishedAt: new Date(),
      socialLinks: {
        create: validated.socialLinks.map((link, index) => ({
          ...link,
          order: index,
        })),
      },
      extraLinks: {
        create: validated.extraLinks.map((link, index) => ({
          ...link,
          order: index,
        })),
      },
    },
  })

  revalidatePath(`/${validated.username}`)

  return link
}
```

### Route Handlers（API 端点）

```typescript
// app/api/links/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    const link = await prisma.link.findUnique({
      where: {
        username,
        isActive: true,
      },
      include: {
        socialLinks: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
        extraLinks: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: link,
    })
  } catch (error) {
    console.error('Error fetching link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Server Components（页面渲染）

```typescript
// app/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

async function getUserLink(username: string) {
  const link = await prisma.link.findUnique({
    where: {
      username,
      isActive: true,
    },
    include: {
      socialLinks: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
      extraLinks: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  return link
}

export async function generateMetadata({ params }: { params: { username: string } }) {
  const link = await getUserLink(params.username)

  if (!link) {
    return {}
  }

  return {
    title: link.displayName || link.username,
    description: link.bio,
    openGraph: {
      title: link.displayName || link.username,
      description: link.bio,
      images: [`/api/og/${link.username}`],
    },
  }
}

export default async function UserLinkPage({
  params,
}: {
  params: { username: string }
}) {
  const link = await getUserLink(params.username)

  if (!link) {
    notFound()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: link.backgroundValue,
      }}
    >
      <div className="w-full max-w-md">
        {/* 个人信息 */}
        <div className="flex flex-col items-center mb-8">
          {link.avatar && (
            <img
              src={link.avatar}
              alt={link.displayName || link.username}
              className="w-24 h-24 rounded-full mb-4"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {link.displayName || link.username}
          </h1>
          {link.bio && (
            <p className="text-center text-secondary">
              {link.bio}
            </p>
          )}
        </div>

        {/* 链接列表 */}
        <div className="space-y-3">
          {link.socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="capitalize">{social.platform}</span>
            </a>
          ))}

          {link.extraLinks.map((extra) => (
            <a
              key={extra.id}
              href={extra.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              {extra.title}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
```

### OG 图片生成

```typescript
// app/api/og/[username]/route.ts
import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const link = await prisma.link.findUnique({
    where: { username: params.username },
    select: {
      displayName: true,
      bio: true,
      avatar: true,
    },
  })

  if (!link) {
    return new Response('Not found', { status: 404 })
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            marginBottom: '20px',
          }}
        >
          {link.avatar ? (
            <img
              src={link.avatar}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
              }}
            />
          ) : (
            <span>{link.displayName?.[0] || '?'}</span>
          )}
        </div>
        <div>{link.displayName || params.username}</div>
        {link.bio && (
          <div
            style={{
              fontSize: 30,
              marginTop: '20px',
              color: '#6b7280',
            }}
          >
            {link.bio}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

### 二维码生成

**功能说明：**
- 用户创建/编辑页面后，可生成二维码
- 二维码内容：`https://域名/username`
- 支持下载为 PNG 图片
- 可用于线下分享、打印物料等

**API 端点：**

```typescript
// app/api/qrcode/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // 检查链接是否存在
    const link = await prisma.link.findUnique({
      where: { username: params.username },
      select: { username: true },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // 生成完整 URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://your-domain.com'
    const url = `${baseUrl}/${params.username}`

    // 生成二维码（Base64）
    const qrCode = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        qrCode, // base64 图片数据
        url,
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**前端组件：**

```typescript
// components/qrcode-generator.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QRCodeGeneratorProps {
  username: string
}

export function QRCodeGenerator({ username }: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/qrcode/${username}`)
      const data = await response.json()

      if (data.success) {
        setQrCode(data.data.qrCode)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `${username}-qrcode.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>二维码分享</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <Button
            onClick={generateQRCode}
            disabled={loading}
            className="w-full"
          >
            {loading ? '生成中...' : '生成二维码'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="flex-1"
              >
                下载图片
              </Button>
              <Button
                onClick={() => setQrCode('')}
                variant="ghost"
                className="flex-1"
              >
                重新生成
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**使用位置：**
- 创建页面：预览区下方
- 编辑页面：预览区下方
- 用户仪表板：独立卡片

**依赖安装：**
```bash
npm install qrcode
npm install -D @types/qrcode
```

**特性：**
- ✅ 纯前端生成，无需后端存储
- ✅ Base64 格式，直接显示和下载
- ✅ 高质量 PNG 输出（400x400）
- ✅ 黑白配色，确保可扫描性

---

## 第七章：项目规则文件

### 项目规则文件结构（精简版）

```
azo-link-hub/
└── .claude/
    ├── project-overview.md       # 项目概述
    ├── tech-stack.md             # 技术栈和配置
    └── design-principles.md      # 设计原则
```

### project-overview.md

```markdown
# azo-link-hub 项目概述

## 项目定位
链接聚合平台（类似 Linktree），帮助用户在单一页面展示所有社交媒体和个人链接。

## 核心功能
- Google OAuth 认证
- 创建/编辑个性化链接页面
- 社交媒体链接（9 个平台）
- 自定义额外链接
- 精选纯色背景（8 个选项）
- 实时预览
- 动态 OG 图片生成
- 二维码生成和下载

## URL 结构
- 公开页面: `/[username]`
- 创建页面: `/create`
- 编辑页面: `/edit`

## 引用的全局规则
- ~/.claude/rules/common/prisma7.md
- ~/.claude/rules/common/coding-style.md
- ~/.claude/rules/common/testing.md
```

### tech-stack.md

```markdown
# 技术栈

## 前端
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS
- Shadcn/ui

## 后端
- Prisma 7 + PostgreSQL
- Auth.js (NextAuth.js 5)
- Vercel Blob

## 开发
- Vitest (测试)
- pnpm (包管理)
- Vercel (部署)
```

### design-principles.md

```markdown
# 设计原则

## 布局
- 使用 Grid 网格系统
- 黄金比例分割 (1.618)
- 左侧表单 65%，右侧预览 35%
- 创建页面左侧高度 100vh，超出滚动
- 右侧预览 flex 垂直居中，高度 auto

## 颜色
- 禁用所有渐变
- 仅使用纯色
- 悬停效果仅颜色变化
- 主题色: #111827

## 交互
- 无 ripple 效果
- 无缩放动画
- 仅颜色变化反馈

## 背景系统
- 8 个精选纯色背景
- 深色系 3 个，浅色系 3 个，强调色 2 个
```

### 已创建的全局规则

- ✅ `/Users/azo/.claude/rules/common/prisma7.md` - Prisma 7 配置规范

---

## 第八章：开发计划和里程碑

### 开发阶段

**阶段 1：基础设施（1-2 天）**
- [ ] 初始化 Next.js 16 项目
- [ ] 配置 Prisma 7 + PostgreSQL
- [ ] 设置 Vercel Blob
- [ ] 配置 Tailwind CSS + Shadcn/ui
- [ ] 创建项目规则文件
- [ ] 设置测试环境（Vitest）

**阶段 2：认证系统（2-3 天）**
- [ ] 配置 Auth.js (Google OAuth)
- [ ] 实现用户登录/登出
- [ ] 创建用户数据同步逻辑
- [ ] 编写测试（TDD）
- [ ] 中间件路由保护

**阶段 3：数据库和模型（1-2 天）**
- [ ] 定义 Prisma Schema
- [ ] 创建数据库迁移
- [ ] 实现 Repository 层
- [ ] 编写测试（TDD）

**阶段 4：核心功能（3-4 天）**
- [ ] 创建链接页面表单（Server Actions）
- [ ] 实现社交媒体链接管理
- [ ] 实现额外链接管理
- [ ] 实现背景选择器
- [ ] 实现实时预览
- [ ] 编写测试（TDD）

**阶段 5：公开页面（2-3 天）**
- [ ] 实现动态路由 `/[username]`
- [ ] 实现用户公开页面（Server Component）
- [ ] 实现 OG 图片生成
- [ ] 实现二维码生成功能
- [ ] SEO 优化
- [ ] 编写测试（TDD）

**阶段 6：UI/UX 优化（2-3 天）**
- [ ] 实现响应式设计
- [ ] 优化 Grid 布局
- [ ] 实现 8 个纯色背景
- [ ] 优化交互体验
- [ ] 可访问性检查

**阶段 7：测试和部署（1-2 天）**
- [ ] 集成测试
- [ ] E2E 测试
- [ ] 性能优化
- [ ] 部署到 Vercel
- [ ] 配置自定义域名（可选）

### 关键里程碑

| 里程碑 | 目标 | 预计完成 |
|--------|------|---------|
| M1 | 基础设施完成 | Day 2 |
| M2 | 认证系统可用 | Day 5 |
| M3 | MVP 功能完成 | Day 10 |
| M4 | 测试覆盖率 ≥ 80% | Day 13 |
| M5 | 生产部署 | Day 15 |

### 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Prisma 7 兼容性问题 | 高 | 提前验证配置，使用官方文档 |
| Google OAuth 配置 | 中 | 参考 NextAuth 官方示例 |
| Vercel Blob 限制 | 低 | 后期可迁移到其他存储 |
| 测试覆盖率不足 | 中 | 严格执行 TDD 流程 |
| 性能问题 | 低 | 使用 Next.js 16 优化特性 |

---

## 附录

### 依赖安装

**完整依赖列表：**
```bash
# 核心依赖
npm install next@latest react@latest react-dom@latest
npm install typescript @types/react @types/node
npm install tailwindcss postcss autoprefixer

# 后端
npm install prisma @prisma/client
npm install @prisma/adapter-pg pg
npm install next-auth@beta @auth/prisma-adapter

# 验证
npm install zod

# 二维码生成
npm install qrcode
npm install -D @types/qrcode

# 测试
npm install -D vitest @vitest/ui
npm install -D @vitest/coverage-v8
npm install -D jsdom
npm install -D tsx

# 工具
npm install -D dotenv
npm install -D prisma
```

**最小依赖版本：**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "prisma": "^7.0.0",
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.11.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4",
    "zod": "^3.24.0",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/ui": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "jsdom": "^26.0.0",
    "tsx": "^4.19.0",
    "dotenv": "^16.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/qrcode": "^1.5.5"
  }
}
```

### 环境变量

```bash
# .env
DATABASE_URL=your-database-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Package.json 脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  }
}
```

### 资源链接

- [Next.js 16 文档](https://nextjs.org/docs)
- [Prisma 7 文档](https://www.prisma.io/docs)
- [Prisma 7 升级指南](https://www.prisma.io/docs/v6/orm/more/upgrades/to-v7)
- [Auth.js 文档](https://authjs.dev)
- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)
- [Vitest 文档](https://vitest.dev)

---

**文档版本**: 1.1
**最后更新**: 2025-03-19
**状态**: ✅ 已通过审查
**更新内容**: 添加二维码生成功能和访问安全方案
