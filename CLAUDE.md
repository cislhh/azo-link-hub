@AGENTS.md

# azo-link-hub 项目规则

## 包管理器规范

**必须使用 pnpm 作为唯一的包管理工具**

- ✅ **允许**: `pnpm install`, `pnpm add`, `pnpm remove`
- ❌ **禁止**: `npm`, `yarn`, `bun` 等其他包管理器命令
- ❌ **禁止**: `npm install`, `yarn add`, `bun install`

### 常用命令

```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>

# 删除依赖
pnpm remove <package-name>

# 运行脚本
pnpm run <script-name>

# 构建项目
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test
pnpm test:ui
pnpm test:coverage

# 数据库操作
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

### 重要提示

1. **禁止使用 npm**: 项目使用 pnpm 锁文件 (`pnpm-lock.yaml`)，不使用 `package-lock.json`
2. **删除 npm 文件**: 如果发现 `package-lock.json` 或 `node_modules`，请立即删除
3. **脚本命令**: 所有 `package.json` 脚本通过 `pnpm run` 执行，而不是 `npm run`

### 强制执行

- 任何 CI/CD 管道必须使用 pnpm
- 所有文档和教程中的 `npm` 命令应替换为 `pnpm`
- PR 检查时确保不包含 npm 相关文件
