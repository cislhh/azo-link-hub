# azo-link-hub Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern link aggregation platform (like Linktree) using Next.js 16, Prisma 7, and PostgreSQL, with Google OAuth authentication, real-time preview, QR code generation, and OG image support.

**Architecture:**
- Frontend: Next.js 16 App Router with Server Components and Server Actions
- Backend: Prisma 7 with driver adapter pattern + PostgreSQL
- Auth: Auth.js (NextAuth.js 5) with Google OAuth
- Storage: Vercel Blob for file uploads
- Testing: Vitest with TDD methodology (≥80% coverage)

**Tech Stack:**
- Next.js 16, React 19, TypeScript 5
- Prisma 7, PostgreSQL, pg driver adapter
- Auth.js, Google OAuth
- Tailwind CSS, Shadcn/ui
- Vitest, Zod validation

---

## File Structure Overview

```
azo-link-hub/
├── prisma.config.ts              # Prisma 7 configuration
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── lib/
│   ├── db.ts                     # Prisma client with driver adapter
│   ├── auth.ts                   # Auth.js configuration
│   ├── env.ts                    # Environment variable validation
│   ├── errors.ts                 # Error handling utilities
│   ├── services/
│   │   ├── user.service.ts       # User business logic
│   │   ├── link.service.ts       # Link business logic
│   │   └── storage.service.ts    # File upload logic
│   └── utils/
│       ├── validation.ts         # Zod schemas
│       └── helpers.ts            # Utility functions
├── app/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── create/
│   │   └── page.tsx              # Create link page
│   ├── edit/
│   │   └── page.tsx              # Edit link page
│   ├── [username]/
│   │   ├── page.tsx              # Public user link page
│   │   └── opengraph-image.tsx   # OG image generation
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # Auth API routes
│   │   ├── links/
│   │   │   └── [username]/
│   │   │       └── route.ts      # Get link API
│   │   ├── qrcode/
│   │   │   └── [username]/
│   │   │       └── route.ts      # QR code generation
│   │   └── og/
│   │       └── [username]/
│   │           └── route.ts      # OG image API
│   └── actions/
│       ├── links.ts              # Link server actions
│       └── upload.ts             # Upload server actions
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── link/
│   │   ├── link-form.tsx         # Link form component
│   │   ├── social-links-form.tsx # Social links form
│   │   ├── extra-links-form.tsx  # Extra links form
│   │   ├── background-selector.tsx # Background selector
│   │   └── qr-code-generator.tsx # QR code component
│   └── preview/
│       └── phone-preview.tsx     # Phone mockup preview
├── middleware.ts                 # Auth middleware
├── tests/
│   ├── setup.ts                  # Test setup
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
└── .claude/
    ├── project-overview.md       # Project overview
    ├── tech-stack.md             # Tech stack documentation
    └── design-principles.md      # Design principles
```

---

## Chunk 1: Foundation Setup

### Task 1: Initialize Next.js 16 Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Create package.json with all dependencies**

```bash
# Initialize Next.js 16 project
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-pnpm

# Install additional dependencies
pnpm add prisma @prisma/client @prisma/adapter-pg pg
pnpm add next-auth@beta @auth/prisma-adapter
pnpm add zod qrcode
pnpm add -D @types/qrcode
pnpm add -D vitest @vitest/ui @vitest/coverage-v8 jsdom tsx
pnpm add -D dotenv
```

Expected: Project initialized with Next.js 16, React 19, TypeScript 5

- [ ] **Step 2: Configure Next.js**

Create `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
```

- [ ] **Step 3: Configure TypeScript**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Configure Tailwind CSS**

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

- [ ] **Step 5: Initialize Shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Select options:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 16 project with TypeScript and Tailwind"
```

---

### Task 2: Configure Prisma 7

**Files:**
- Create: `prisma.config.ts`
- Create: `prisma/schema.prisma`
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Create Prisma 7 config file**

Create `prisma.config.ts`:

```typescript
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

- [ ] **Step 2: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
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

  shareImageUrl String?   // 分享图片 URL（包含头像、名称、简介、二维码的综合图片）

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

- [ ] **Step 3: Create environment variables file**

Create `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/azo_link_hub?schema=public"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-long"
```

Create `.env.example`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/azo_link_hub?schema=public"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-long"
```

- [ ] **Step 4: Create Prisma client with driver adapter**

Create `lib/db.ts`:

```typescript
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

- [ ] **Step 5: Add database scripts to package.json**

Add to `package.json` scripts section:

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

- [ ] **Step 6: Generate Prisma client and push schema**

```bash
pnpm db:generate
pnpm db:push
```

Expected: Database tables created successfully

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: configure Prisma 7 with PostgreSQL driver adapter"
```

---

### Task 3: Setup Environment Variable Validation

**Files:**
- Create: `lib/env.ts`
- Create: `lib/errors.ts`

- [ ] **Step 1: Create environment variable validation**

Create `lib/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>
```

- [ ] **Step 2: Create error handling utilities**

Create `lib/errors.ts`:

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export function createError(code: keyof typeof ERROR_CODES, message?: string): AppError {
  const messages: Record<typeof code, string> = {
    UNAUTHORIZED: '未授权访问',
    FORBIDDEN: '无权限访问',
    NOT_FOUND: '资源不存在',
    USERNAME_TAKEN: '用户名已被占用',
    VALIDATION_ERROR: '数据验证失败',
    INTERNAL_ERROR: '服务器内部错误',
  }

  return new AppError(
    ERROR_CODES[code],
    code === 'UNAUTHORIZED' ? 401 :
    code === 'FORBIDDEN' ? 403 :
    code === 'NOT_FOUND' ? 404 :
    code === 'USERNAME_TAKEN' ? 409 :
    code === 'VALIDATION_ERROR' ? 400 : 500,
    message || messages[code]
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add environment variable validation and error handling"
```

---

### Task 4: Setup Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/env.ts`

- [ ] **Step 1: Create Vitest configuration**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts', '**/*.test.tsx'],
    },
    globals: true,
  },
})
```

- [ ] **Step 2: Create test setup file**

Create `tests/setup.ts`:

```typescript
import { prisma } from '@/lib/db'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  // Clean database before each test
  await prisma.user.deleteMany()
  await prisma.link.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.extraLink.deleteMany()
})
```

- [ ] **Step 3: Create test environment configuration**

Create `tests/env.ts`:

```typescript
import { config } from '@dotenvx/vscode'

export const testEnv = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret-min-32-chars-long-for-testing',
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
}
```

- [ ] **Step 4: Write first test to verify setup**

Create `tests/integration/setup.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'

describe('Database Setup', () => {
  it('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`
    expect(result).toBeDefined()
  })

  it('should create a user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })

    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })
})
```

- [ ] **Step 5: Run tests to verify setup**

```bash
pnpm test
```

Expected: Tests pass successfully

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: setup testing infrastructure with Vitest"
```

---

### Task 5: Create Project Rules Files

**Files:**
- Create: `.claude/project-overview.md`
- Create: `.claude/tech-stack.md`
- Create: `.claude/design-principles.md`

- [ ] **Step 1: Create project overview**

Create `.claude/project-overview.md`:

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

- [ ] **Step 2: Create tech stack documentation**

Create `.claude/tech-stack.md`:

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

- [ ] **Step 3: Create design principles**

Create `.claude/design-principles.md`:

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

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "docs: add project rules and documentation"
```

---

## Chunk 2: Authentication System

### Task 6: Configure Auth.js

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `middleware.ts`

- [ ] **Step 1: Write test for auth configuration**

Create `tests/unit/auth.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Auth Configuration', () => {
  it('should have GOOGLE_CLIENT_ID configured', () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined()
  })

  it('should have GOOGLE_CLIENT_SECRET configured', () => {
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined()
  })

  it('should have NEXTAUTH_SECRET configured', () => {
    expect(process.env.NEXTAUTH_SECRET).toBeDefined()
    expect(process.env.NEXTAUTH_SECRET!.length).toBeGreaterThanOrEqual(32)
  })
})
```

- [ ] **Step 2: Run test**

```bash
pnpm test tests/unit/auth.test.ts
```

Expected: PASS (if env vars are set) or FAIL with clear message

- [ ] **Step 3: Create Auth.js configuration**

Create `lib/auth.ts`:

```typescript
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
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
```

- [ ] **Step 4: Create auth API route**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 5: Create TypeScript type definitions**

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

- [ ] **Step 6: Create middleware**

Create `middleware.ts`:

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/create") ||
                       req.nextUrl.pathname.startsWith("/edit")
  const isOnLogin = req.nextUrl.pathname === "/login"

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/create", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 7: Run tests**

```bash
pnpm test tests/unit/auth.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: configure Auth.js with Google OAuth"
```

---

### Task 7: Create User Service

**Files:**
- Create: `lib/services/user.service.ts`
- Create: `tests/unit/user.service.test.ts`

- [ ] **Step 1: Write failing test for user service**

Create `tests/unit/user.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { getOrCreateUser } from '@/lib/services/user.service'

describe('User Service', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  it('should create a new user', async () => {
    const user = await getOrCreateUser('test@example.com', 'Test User')

    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')
  })

  it('should return existing user', async () => {
    // Create user first
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        name: 'Existing User',
      },
    })

    // Get or create should return existing user
    const user = await getOrCreateUser('existing@example.com')

    expect(user.email).toBe('existing@example.com')

    // Verify no duplicate created
    const count = await prisma.user.count({
      where: { email: 'existing@example.com' }
    })
    expect(count).toBe(1)
  })

  it('should throw error for invalid email', async () => {
    await expect(getOrCreateUser('invalid-email')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/user.service.test.ts
```

Expected: FAIL - "getOrCreateUser is not defined"

- [ ] **Step 3: Implement user service**

Create `lib/services/user.service.ts`:

```typescript
import { prisma } from '@/lib/db'
import { createError } from '@/lib/errors'

export async function getOrCreateUser(
  email: string,
  name?: string,
  image?: string
) {
  // Validate email
  if (!email || !email.includes('@')) {
    throw createError('VALIDATION_ERROR', '无效的邮箱地址')
  }

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      ...(name && { name }),
      ...(image && { image }),
    },
    create: { email, name, image },
  })

  return user
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/user.service.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement user service with TDD"
```

---

### Task 8: Create Login Page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `app/login/page.tsx`:

```typescript
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">azo-link-hub</h1>
          <p className="mt-2 text-sm text-gray-600">
            创建你的专属链接页面
          </p>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("google")
          }}
          className="mt-8 space-y-6"
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            使用 Google 登录
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test login page**

```bash
pnpm dev
```

Visit `http://localhost:3000/login`

Expected: Login page displays with Google sign-in button

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add login page with Google OAuth"
```

---

## Chunk 3: Core Link Management

### Task 9: Create Validation Schemas

**Files:**
- Create: `lib/utils/validation.ts`
- Create: `tests/unit/validation.test.ts`

- [ ] **Step 1: Write failing tests for validation**

Create `tests/unit/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createLinkSchema, updateLinkSchema } from '@/lib/utils/validation'

describe('Validation Schemas', () => {
  describe('createLinkSchema', () => {
    it('should validate valid data', () => {
      const data = {
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: [],
        extraLinks: [],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid username', () => {
      const data = {
        username: 'ab', // too short
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: [],
        extraLinks: [],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject username with invalid characters', () => {
      const data = {
        username: 'test user!', // invalid chars
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: [],
        extraLinks: [],
      }

      const result = createLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/validation.test.ts
```

Expected: FAIL - validation schemas not defined

- [ ] **Step 3: Implement validation schemas**

Create `lib/utils/validation.ts`:

```typescript
import { z } from 'zod'

const socialLinkSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'youtube', 'github', 'linkedin', 'telegram', 'whatsapp', 'email']),
  url: z.string().url(),
  isVisible: z.boolean().default(true),
})

const extraLinkSchema = z.object({
  title: z.string().min(1).max(50),
  url: z.string().url(),
  icon: z.string().optional(),
  isVisible: z.boolean().default(true),
})

export const createLinkSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  backgroundType: z.enum(['solid']),
  backgroundValue: z.string(),
  socialLinks: z.array(socialLinkSchema).default([]),
  extraLinks: z.array(extraLinkSchema).default([]),
})

export const updateLinkSchema = createLinkSchema.partial()

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/validation.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add validation schemas with TDD"
```

---

### Task 10: Create Link Service

**Files:**
- Create: `lib/services/link.service.ts`
- Create: `tests/unit/link.service.test.ts`

- [ ] **Step 1: Write failing tests for link service**

Create `tests/unit/link.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { createLink, getLinkByUsername, updateLink } from '@/lib/services/link.service'

describe('Link Service', () => {
  let userId: string

  beforeEach(async () => {
    await prisma.link.deleteMany()
    await prisma.user.deleteMany()

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    userId = user.id
  })

  it('should create a new link', async () => {
    const data = {
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Test bio',
      backgroundType: 'solid' as const,
      backgroundValue: '#ffffff',
      socialLinks: [],
      extraLinks: [],
    }

    const link = await createLink(userId, data)

    expect(link).toBeDefined()
    expect(link.username).toBe('testuser')
    expect(link.displayName).toBe('Test User')
  })

  it('should throw error for duplicate username', async () => {
    // Create first link
    await prisma.link.create({
      data: {
        username: 'taken',
        userId,
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
      },
    })

    // Try to create duplicate
    const data = {
      username: 'taken',
      backgroundType: 'solid' as const,
      backgroundValue: '#ffffff',
      socialLinks: [],
      extraLinks: [],
    }

    await expect(createLink(userId, data)).rejects.toThrow()
  })

  it('should get link by username', async () => {
    await prisma.link.create({
      data: {
        username: 'testuser',
        userId,
        displayName: 'Test User',
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        socialLinks: {
          create: {
            platform: 'github',
            url: 'https://github.com/test',
          },
        },
      },
    })

    const link = await getLinkByUsername('testuser')

    expect(link).toBeDefined()
    expect(link.username).toBe('testuser')
    expect(link.socialLinks).toHaveLength(1)
  })

  it('should return null for non-existent username', async () => {
    const link = await getLinkByUsername('nonexistent')
    expect(link).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/link.service.test.ts
```

Expected: FAIL - link service not implemented

- [ ] **Step 3: Implement link service**

Create `lib/services/link.service.ts`:

```typescript
import { prisma } from '@/lib/db'
import { createError } from '@/lib/errors'
import type { CreateLinkInput, UpdateLinkInput } from '@/lib/utils/validation'

export async function createLink(userId: string, data: CreateLinkInput) {
  // Check if username already exists
  const existing = await prisma.link.findUnique({
    where: { username: data.username },
  })

  if (existing) {
    throw createError('USERNAME_TAKEN')
  }

  // Create link with social and extra links
  const link = await prisma.link.create({
    data: {
      userId,
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatar: data.avatar,
      backgroundType: data.backgroundType,
      backgroundValue: data.backgroundValue,
      publishedAt: new Date(),
      socialLinks: {
        create: data.socialLinks.map((link, index) => ({
          platform: link.platform,
          url: link.url,
          isVisible: link.isVisible,
          order: index,
        })),
      },
      extraLinks: {
        create: data.extraLinks.map((link, index) => ({
          title: link.title,
          url: link.url,
          icon: link.icon,
          isVisible: link.isVisible,
          order: index,
        })),
      },
    },
  })

  return link
}

export async function getLinkByUsername(username: string) {
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

export async function getLinkById(id: string) {
  const link = await prisma.link.findUnique({
    where: { id },
    include: {
      socialLinks: true,
      extraLinks: true,
    },
  })

  return link
}

export async function updateLink(id: string, data: UpdateLinkInput) {
  const link = await prisma.link.update({
    where: { id },
    data: {
      displayName: data.displayName,
      bio: data.bio,
      avatar: data.avatar,
      backgroundType: data.backgroundType,
      backgroundValue: data.backgroundValue,
      socialLinks: {
        deleteMany: {},
        create: data.socialLinks?.map((link, index) => ({
          platform: link.platform,
          url: link.url,
          isVisible: link.isVisible,
          order: index,
        })) || [],
      },
      extraLinks: {
        deleteMany: {},
        create: data.extraLinks?.map((link, index) => ({
          title: link.title,
          url: link.url,
          icon: link.icon,
          isVisible: link.isVisible,
          order: index,
        })) || [],
      },
    },
    include: {
      socialLinks: true,
      extraLinks: true,
    },
  })

  return link
}

export async function getUserLinks(userId: string) {
  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return links
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/link.service.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement link service with TDD"
```

---

## Chunk 4: UI Components and Pages

### Task 11: Create Link Form Components

**Files:**
- Create: `components/link/link-form.tsx`
- Create: `components/link/social-links-form.tsx`
- Create: `components/link/extra-links-form.tsx`
- Create: `components/link/background-selector.tsx`

- [ ] **Step 1: Create background selector component**

Create `components/link/background-selector.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const BACKGROUNDS = [
  { name: 'Pure White', value: '#ffffff', category: 'light' },
  { name: 'Off White', value: '#f8f9fa', category: 'light' },
  { name: 'Light Gray', value: '#e9ecef', category: 'light' },
  { name: 'Carbon Black', value: '#1a1a1a', category: 'dark' },
  { name: 'Charcoal', value: '#2d2d2d', category: 'dark' },
  { name: 'Navy', value: '#0a1628', category: 'dark' },
  { name: 'Deep Blue', value: '#0a0a23', category: 'accent' },
  { name: 'Deep Purple', value: '#1a0a2e', category: 'accent' },
]

interface BackgroundSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900">
        背景颜色
      </label>
      <div className="grid grid-cols-4 gap-3">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.value}
            type="button"
            onClick={() => onChange(bg.value)}
            className="relative h-20 rounded-lg border-2 transition-colors hover:border-gray-400"
            style={{
              backgroundColor: bg.value,
              borderColor: value === bg.value ? '#6366f1' : '#e5e7eb',
            }}
            title={bg.name}
          >
            {value === bg.value && (
              <Check className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create social links form component**

Create `components/link/social-links-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'telegram', label: 'Telegram', icon: 'telegram' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'email', label: 'Email', icon: 'mail' },
] as const

interface SocialLink {
  platform: string
  url: string
  isVisible: boolean
}

interface SocialLinksFormProps {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

export function SocialLinksForm({ value, onChange }: SocialLinksFormProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('github')

  const addLink = () => {
    onChange([...value, { platform: selectedPlatform, url: '', isVisible: true }])
  }

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    onChange(value.map((link, i) => (i === index ? { ...link, ...updates } : link)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          社交媒体链接
        </label>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          添加
        </button>
      </div>

      <select
        value={selectedPlatform}
        onChange={(e) => setSelectedPlatform(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        {PLATFORMS.map((platform) => (
          <option key={platform.value} value={platform.value}>
            {platform.label}
          </option>
        ))}
      </select>

      <div className="space-y-3">
        {value.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              placeholder={`${PLATFORMS.find(p => p.value === link.platform)?.label} URL`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create extra links form component**

Create `components/link/extra-links-form.tsx`:

```typescript
'use client'

import { Plus, Trash2 } from 'lucide-react'

interface ExtraLink {
  title: string
  url: string
  icon?: string
  isVisible: boolean
}

interface ExtraLinksFormProps {
  value: ExtraLink[]
  onChange: (links: ExtraLink[]) => void
}

export function ExtraLinksForm({ value, onChange }: ExtraLinksFormProps) {
  const addLink = () => {
    onChange([...value, { title: '', url: '', isVisible: true }])
  }

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, updates: Partial<ExtraLink>) => {
    onChange(value.map((link, i) => (i === index ? { ...link, ...updates } : link)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          额外链接
        </label>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          添加
        </button>
      </div>

      <div className="space-y-3">
        {value.map((link, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              value={link.title}
              onChange={(e) => updateLink(index, { title: e.target.value })}
              placeholder="链接标题"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              placeholder="链接地址 (https://...)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add link form components"
```

---

### Task 12: Create Phone Preview Component

**Files:**
- Create: `components/preview/phone-preview.tsx`

- [ ] **Step 1: Create phone preview component**

Create `components/preview/phone-preview.tsx`:

```typescript
'use client'

interface PhonePreviewProps {
  displayName?: string
  bio?: string
  avatar?: string
  backgroundValue: string
  socialLinks: Array<{ platform: string; url: string }>
  extraLinks: Array<{ title: string; url: string }>
}

export function PhonePreview({
  displayName,
  bio,
  avatar,
  backgroundValue,
  socialLinks,
  extraLinks,
}: PhonePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[320px] rounded-[32px] border-[12px] border-gray-900 bg-white shadow-xl">
        <div
          className="h-[640px] overflow-y-auto p-6"
          style={{ backgroundColor: backgroundValue }}
        >
          {/* Personal Info */}
          <div className="mb-8 flex flex-col items-center">
            {avatar && (
              <img
                src={avatar}
                alt={displayName || 'Avatar'}
                className="mb-4 h-24 w-24 rounded-full object-cover"
              />
            )}
            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
              {displayName || '用户名称'}
            </h1>
            {bio && (
              <p className="text-center text-sm text-gray-600">
                {bio}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-300 bg-white p-4 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {link.platform}
              </a>
            ))}

            {extraLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-300 bg-white p-4 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add phone preview component"
```

---

### Task 13: Create Create/Edit Pages

**Files:**
- Create: `app/create/page.tsx`
- Create: `app/edit/page.tsx`

- [ ] **Step 1: Create create page**

Create `app/create/page.tsx`:

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreatePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">创建链接页面</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Form Section - 65% */}
          <div className="col-span-8 overflow-y-auto pr-6">
            <form className="space-y-8">
              {/* Personal Info */}
              <section className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">个人信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      显示名称
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      placeholder="你的名称"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      个人简介
                    </label>
                    <textarea
                      name="bio"
                      placeholder="介绍一下自己..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </section>

              {/* Username */}
              <section className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">用户名</h2>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    你的链接地址
                  </label>
                  <div className="flex rounded-lg border border-gray-300">
                    <span className="flex items-center border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      {process.env.NEXTAUTH_URL?.replace('https://', '').replace('http://', '')}/
                    </span>
                    <input
                      type="text"
                      name="username"
                      placeholder="username"
                      className="flex-1 rounded-lg px-3 py-2"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    3-20 个字符，仅限字母、数字、下划线和连字符
                  </p>
                </div>
              </section>
            </form>
          </div>

          {/* Preview Section - 35% */}
          <div className="col-span-4 flex items-center justify-center">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-center text-sm font-medium text-gray-900">
                实时预览
              </h3>
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">预览将在这里显示</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Test create page**

```bash
pnpm dev
```

Visit `http://localhost:3000/create`

Expected: Create page with form layout (65% form, 35% preview)

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add create page with form layout"
```

---

## Chunk 5: Public Pages and API

### Task 14: Create Public Link Page

**Files:**
- Create: `app/[username]/page.tsx`
- Create: `app/api/links/[username]/route.ts`

- [ ] **Step 1: Create API route for fetching links**

Create `app/api/links/[username]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const link = await prisma.link.findUnique({
      where: {
        username: params.username,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
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

- [ ] **Step 2: Create public link page**

Create `app/[username]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Metadata } from 'next'

async function getUserLink(username: string) {
  const link = await prisma.link.findUnique({
    where: {
      username,
      isActive: true,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
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

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const link = await getUserLink(params.username)

  if (!link) {
    return {}
  }

  return {
    title: link.displayName || link.username,
    description: link.bio || `查看 ${link.displayName || link.username} 的链接`,
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
        {/* Personal Info */}
        <div className="mb-8 flex flex-col items-center">
          {(link.avatar || link.user.image) && (
            <img
              src={link.avatar || link.user.image!}
              alt={link.displayName || link.username}
              className="mb-4 h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {link.displayName || link.username}
          </h1>
          {link.bio && (
            <p className="text-center text-sm text-gray-600">
              {link.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {link.socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-300 bg-white p-4 text-center font-medium text-gray-900 hover:bg-gray-50"
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
              className="block rounded-lg border border-gray-300 bg-white p-4 text-center font-medium text-gray-900 hover:bg-gray-50"
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

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add public link page and API route"
```

---

### Task 15: Create QR Code Generation

**Files:**
- Create: `app/api/qrcode/[username]/route.ts`
- Create: `components/link/qr-code-generator.tsx`

- [ ] **Step 1: Create QR code API route**

Create `app/api/qrcode/[username]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
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

    const baseUrl = process.env.NEXTAUTH_URL || 'https://your-domain.com'
    const url = `${baseUrl}/${params.username}`

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
        qrCode,
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

- [ ] **Step 2: Create QR code generator component**

Create `components/link/qr-code-generator.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">二维码分享</h3>

      {!qrCode ? (
        <button
          onClick={generateQRCode}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? '生成中...' : '生成二维码'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt="QR Code"
              className="h-64 w-64 rounded-lg border-2 border-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadQRCode}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              下载图片
            </button>
            <button
              onClick={() => setQrCode('')}
              className="flex flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add QR code generation"
```

---

### Task 16: Create Share Image Generation

**Files:**
- Create: `app/api/share-image/[username]/route.ts`
- Modify: `components/link/qr-code-generator.tsx`

- [ ] **Step 1: Install canvas package**

```bash
pnpm add canvas
pnpm add -D @types/canvas
```

- [ ] **Step 2: Create share image API route**

Create `app/api/share-image/[username]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCanvas, loadImage } from 'canvas'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const link = await prisma.link.findUnique({
      where: { username: params.username },
      select: {
        displayName: true,
        bio: true,
        avatar: true,
        backgroundValue: true,
        user: {
          select: {
            image: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    const avatarUrl = link.avatar || link.user.image
    const displayName = link.displayName || params.username
    const bio = link.bio
    const bgColor = link.backgroundValue || '#ffffff'

    // Create canvas (800x1200 - mobile friendly size)
    const canvas = createCanvas(800, 1200)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load avatar if exists
    if (avatarUrl) {
      try {
        const avatar = await loadImage(avatarUrl)
        const avatarSize = 200
        const avatarX = (canvas.width - avatarSize) / 2
        const avatarY = 150

        // Draw circle clip
        ctx.save()
        ctx.beginPath()
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2,
          0,
          Math.PI * 2
        )
        ctx.closePath()
        ctx.clip()

        // Draw avatar
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
        ctx.restore()
      } catch (error) {
        console.error('Error loading avatar:', error)
      }
    }

    // Display name
    ctx.fillStyle = isLightColor(bgColor) ? '#111827' : '#ffffff'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(displayName, canvas.width / 2, 450)

    // Bio
    if (bio) {
      ctx.fillStyle = isLightColor(bgColor) ? '#6b7280' : '#d1d5db'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'

      // Wrap text
      const maxWidth = 700
      const words = bio.split('')
      let line = ''
      let y = 510

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[i]
          y += 35
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)
    }

    // Generate QR code
    const QRCode = (await import('qrcode')).default
    const baseUrl = process.env.NEXTAUTH_URL || 'https://your-domain.com'
    const url = `${baseUrl}/${params.username}`

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: isLightColor(bgColor) ? '#000000' : '#ffffff',
        light: isLightColor(bgColor) ? '#ffffff' : '#000000',
      },
    })

    // Load QR code image
    const qrImage = await loadImage(qrCodeDataUrl)
    const qrSize = 400
    const qrX = (canvas.width - qrSize) / 2
    const qrY = 600

    // Draw QR code with white border
    ctx.fillStyle = isLightColor(bgColor) ? '#ffffff' : '#1a1a1a'
    const padding = 20
    ctx.fillRect(qrX - padding, qrY - padding, qrSize + padding * 2, qrSize + padding * 2)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Add "扫描二维码" text
    ctx.fillStyle = isLightColor(bgColor) ? '#6b7280' : '#d1d5db'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫描二维码查看我的链接', canvas.width / 2, 1060)

    // Convert to PNG
    const buffer = canvas.toBuffer('image/png')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${params.username}-share.png"`,
      },
    })
  } catch (error) {
    console.error('Error generating share image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine if color is light
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}
```

- [ ] **Step 3: Update QR code generator component to include share image**

Update `components/link/qr-code-generator.tsx` to add share image button:

```typescript
// Add after the download button in the component:

{qrCode && (
  <>
    {/* Add this button */}
    <button
      onClick={downloadShareImage}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
    >
      <Download className="h-4 w-4" />
      下载分享图片
    </button>
  </>
)}

// Add this function before the return statement:

const downloadShareImage = async () => {
  try {
    const response = await fetch(`/api/share-image/${username}`)

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${username}-share.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error downloading share image:', error)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add share image generation with avatar and QR code"
```

---

### Task 17: Create OG Image Generation

**Files:**
- Create: `app/api/og/[username]/route.ts`

- [ ] **Step 1: Create OG image API route**

Create `app/api/og/[username]/route.ts`:

```typescript
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
      user: {
        select: {
          image: true,
        },
      },
    },
  })

  if (!link) {
    return new Response('Not found', { status: 404 })
  }

  const avatar = link.avatar || link.user?.image

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
          {avatar ? (
            <img
              src={avatar}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
              }}
            />
          ) : (
            <span>{(link.displayName || params.username)[0]}</span>
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

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add OG image generation"
```

---

## Chunk 6: Server Actions

### Task 18: Create Link Server Actions

**Files:**
- Create: `app/actions/links.ts`
- Create: `tests/integration/links.test.ts`

- [ ] **Step 1: Write integration tests for link actions**

Create `tests/integration/links.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { createLink, updateLink } from '@/app/actions/links'

describe('Link Server Actions', () => {
  let userId: string

  beforeEach(async () => {
    await prisma.link.deleteMany()
    await prisma.user.deleteMany()

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    userId = user.id
  })

  it('should create a link with social and extra links', async () => {
    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('displayName', 'Test User')
    formData.append('bio', 'Test bio')
    formData.append('backgroundType', 'solid')
    formData.append('backgroundValue', '#ffffff')

    const result = await createLink(userId, formData)

    expect(result).toBeDefined()
    expect(result.username).toBe('testuser')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/integration/links.test.ts
```

Expected: FAIL - actions not implemented

- [ ] **Step 3: Implement link server actions**

Create `app/actions/links.ts`:

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createLinkSchema, updateLinkSchema } from '@/lib/utils/validation'
import { createError } from '@/lib/errors'
import { redirect } from 'next/navigation'

export async function createLink(userId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw createError('UNAUTHORIZED')
  }

  // Extract and validate data
  const data = {
    username: formData.get('username') as string,
    displayName: formData.get('displayName') as string | undefined,
    bio: formData.get('bio') as string | undefined,
    avatar: formData.get('avatar') as string | undefined,
    backgroundType: 'solid' as const,
    backgroundValue: formData.get('backgroundValue') as string,
    socialLinks: [],
    extraLinks: [],
  }

  const validated = createLinkSchema.parse(data)

  // Check if username exists
  const existing = await prisma.link.findUnique({
    where: { username: validated.username },
  })

  if (existing) {
    throw createError('USERNAME_TAKEN')
  }

  // Create link
  const link = await prisma.link.create({
    data: {
      userId,
      username: validated.username,
      displayName: validated.displayName,
      bio: validated.bio,
      avatar: validated.avatar,
      backgroundType: validated.backgroundType,
      backgroundValue: validated.backgroundValue,
      publishedAt: new Date(),
    },
  })

  revalidatePath(`/${validated.username}`)

  return link
}

export async function updateLink(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw createError('UNAUTHORIZED')
  }

  // Check ownership
  const link = await prisma.link.findUnique({
    where: { id },
  })

  if (!link || link.userId !== session.user.id) {
    throw createError('FORBIDDEN')
  }

  // Extract and validate data
  const data = {
    username: formData.get('username') as string | undefined,
    displayName: formData.get('displayName') as string | undefined,
    bio: formData.get('bio') as string | undefined,
    avatar: formData.get('avatar') as string | undefined,
    backgroundType: 'solid' as const,
    backgroundValue: formData.get('backgroundValue') as string,
    socialLinks: [],
    extraLinks: [],
  }

  const validated = updateLinkSchema.parse(data)

  // Update link
  const updated = await prisma.link.update({
    where: { id },
    data: {
      displayName: validated.displayName,
      bio: validated.bio,
      avatar: validated.avatar,
      backgroundType: validated.backgroundType,
      backgroundValue: validated.backgroundValue,
    },
  })

  revalidatePath(`/${link.username}`)

  return updated
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/integration/links.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement link server actions with TDD"
```

---

## Chunk 7: Finalization

### Task 19: Create Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Create homepage**

Replace `app/page.tsx` with:

```typescript
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect('/create')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-7">
              <h1 className="text-5xl font-bold text-gray-900">
                一个链接，展示你的所有世界
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                创建你的专属链接页面，集中展示社交媒体、个人网站、作品集等所有内容
              </p>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
                >
                  立即开始
                </Link>
              </div>
            </div>
            <div className="col-span-5">
              <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
                <p className="text-center text-sm font-medium text-gray-900 mb-4">
                  预览示例
                </p>
                <div className="flex justify-center">
                  <div className="w-48 rounded-lg border-8 border-gray-900 bg-white p-4">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-200 mb-3"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-8 bg-gray-100 rounded"></div>
                        <div className="h-8 bg-gray-100 rounded"></div>
                        <div className="h-8 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            简单、快速、专业
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                创建页面
              </h3>
              <p className="text-gray-600">
                使用 Google 账号登录，填写个人信息和链接
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                自定义样式
              </h3>
              <p className="text-gray-600">
                选择背景颜色，实时预览效果
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                分享链接
              </h3>
              <p className="text-gray-600">
                生成二维码，轻松分享到社交媒体
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Test homepage**

```bash
pnpm dev
```

Visit `http://localhost:3000`

Expected: Homepage with hero section and features

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add homepage"
```

---

### Task 20: Run Full Test Suite and Verify Coverage

**Files:**
- No files created

- [ ] **Step 1: Run all tests**

```bash
pnpm test:coverage
```

Expected: All tests pass, coverage ≥ 80%

- [ ] **Step 2: Check coverage report**

Open `coverage/index.html` in browser

Expected: Coverage report displays

- [ ] **Step 3: Run type checking**

```bash
pnpm tsc --noEmit
```

Expected: No type errors

- [ ] **Step 4: Run linting**

```bash
pnpm lint
```

Expected: No lint errors

- [ ] **Step 5: Test production build**

```bash
pnpm build
```

Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: verify test coverage and build"
```

---

### Task 21: Final Documentation and Cleanup

**Files:**
- Create: `README.md`
- Update: `.gitignore`

- [ ] **Step 1: Create README**

Create `README.md`:

```markdown
# azo-link-hub

现代化的链接聚合平台，帮助用户在单一页面集中展示所有社交媒体和个人链接。

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript 5, Tailwind CSS
- **后端**: Prisma 7, PostgreSQL, Auth.js
- **部署**: Vercel

## 功能特性

- ✅ Google OAuth 认证
- ✅ 创建/编辑个性化链接页面
- ✅ 社交媒体链接集成（9 个平台）
- ✅ 自定义额外链接
- ✅ 8 个精选纯色背景
- ✅ 实时预览
- ✅ 动态 OG 图片生成
- ✅ 二维码生成和下载

## 快速开始

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 配置环境变量

复制 \`.env.example\` 到 \`.env\` 并填写配置：

\`\`\`bash
cp .env.example .env
\`\`\`

### 数据库设置

\`\`\`bash
pnpm db:push
\`\`\`

### 启动开发服务器

\`\`\`bash
pnpm dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

## 测试

\`\`\`bash
pnpm test              # 运行测试
pnpm test:coverage     # 查看覆盖率
pnpm test:watch        # 监听模式
\`\`\`

## 构建

\`\`\`bash
pnpm build
\`\`\`

## 项目文档

- [设计文档](./docs/superpowers/specs/2025-03-19-azo-link-hub-design.md)
- [实施计划](./docs/superpowers/plans/2025-03-19-azo-link-hub-implementation.md)
- [Prisma 7 规则](~/.claude/rules/common/prisma7.md)

## License

MIT
```

- [ ] **Step 2: Update .gitignore**

Update `.gitignore`:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "docs: add README and finalize documentation"
```

---

## Summary

This implementation plan covers:

✅ **Foundation Setup** (Tasks 1-5)
- Next.js 16 with TypeScript and Tailwind
- Prisma 7 with PostgreSQL driver adapter
- Environment validation and error handling
- Testing infrastructure with Vitest
- Project rules and documentation

✅ **Authentication System** (Tasks 6-8)
- Auth.js configuration with Google OAuth
- User service with TDD
- Login page

✅ **Core Link Management** (Tasks 9-10)
- Validation schemas with Zod
- Link service with TDD

✅ **UI Components and Pages** (Tasks 11-13)
- Link form components
- Phone preview component
- Create page with proper layout

✅ **Public Pages and API** (Tasks 14-17)
- Public link page
- API routes for links
- QR code generation
- Share image generation（类似微信/QQ添加好友图片）
- OG image generation

✅ **Server Actions** (Task 18)
- Create/update link actions with TDD

✅ **Finalization** (Tasks 19-21)
- Homepage
- Full test suite verification
- Documentation

**Total Estimated Time:** 13-16 days

**Testing Approach:** TDD throughout, with ≥80% coverage requirement

**Key Principles:**
- DRY (Don't Repeat Yourself)
- YAGNI (You Aren't Gonna Need It)
- TDD (Test-Driven Development)
- Frequent commits
- Small, focused files with clear responsibilities
