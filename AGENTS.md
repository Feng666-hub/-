# Vue Vben Admin - Agent Guide

## Project Overview

Vue 3 monorepo admin template with 3 app variants (Ant Design Vue, Element Plus, Naive UI). Uses pnpm workspaces + Turborepo. Node >= 20.10.0, pnpm >= 9.12.0.

## Key Commands

```bash
pnpm dev              # Interactive app selector (turbo-run)
pnpm dev:antd         # Run Ant Design variant on port 5666
pnpm dev:ele          # Run Element Plus variant
pnpm dev:naive        # Run Naive UI variant
pnpm dev:play         # Run playground

pnpm build            # Build all apps (needs 8GB heap)
pnpm build:antd       # Build specific app

pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test:unit        # Vitest unit tests
pnpm check:type       # vue-tsc typecheck
pnpm check            # All checks (circular + dep + type + cspell)
```

## Monorepo Structure

```
apps/
  web-antd/        # @vben/web-antd - Ant Design Vue app
  web-ele/         # @vben/web-ele - Element Plus app
  web-naive/       # @vben/web-naive - Naive UI app
  backend-mock/    # @vben/backend-mock - Nitro mock API server
packages/
  @core/           # Foundation layer (ui-kit, composables, preferences, base)
  effects/         # Higher-level features (access, layouts, plugins, request)
  utils/           # Shared utilities
  locales/         # i18n translations
  stores/          # Pinia stores
  constants/       # Shared constants
internal/
  vite-config/     # Shared Vite config
  tailwind-config/ # Shared Tailwind config
  lint-configs/    # ESLint, Prettier, Stylelint, Commitlint configs
  tsconfig/        # Shared TypeScript configs
scripts/           # Build tools (turbo-run, vsh)
```

## Code Conventions

- **Formatting**: Prettier (2-space indent, no semicolons), enforces Tailwind class sorting
- **Linting**: ESLint + Stylelint run on save via lint-staged
- **Commits**: Angular convention enforced by commitlint (`feat:`, `fix:`, `docs:`, etc.)
- **Types**: `vue-tsc --noEmit --skipLibCheck` for type checking
- **Tests**: Vitest with happy-dom environment. Unit tests in `__tests__/` directories.
- **E2E**: Playwright (only in `playground/__tests__/e2e/`)
- **Path aliases**: Apps use `#/*` → `./src/*` (e.g., `import { x } from '#/api'`)

## Dev Server Notes

- Backend mock runs on port 5320, proxied from app dev server
- `VITE_NITRO_MOCK=true` enables mock API in development
- Each app has `.env`, `.env.development`, `.env.production` for environment config

## Pre-commit Workflow

1. `pre-commit` hook runs `pnpm vsh code-workspace --auto-commit`
2. Then runs `lint-staged`: ESLint + Prettier + Stylelint on staged files
3. `commit-msg` hook validates commit message format

## Common Gotchas

- `pnpm build` uses `--max-old-space-size=8192` - builds are memory-intensive
- Apps share workspace packages via `workspace:*` references
- Tailwind config is shared from `internal/tailwind-config/src/index.ts`
- CSS variables defined in `packages/@core/base/design/src/**/*.css`
- i18n files in `packages/locales/src/langs` and `apps/*/src/locales/langs`

## Backend API Documentation

- Swagger UI: http://gxcah.com:8077/swagger/index.html
- Swagger JSON: http://gxcah.com:8077/swagger/v1/swagger.json
- API Definition: 管理员 V1 (OAS 3.0)
- Base URL: http://gxcah.com:8077
- Auth: Bearer Token (通过 Authorize 按钮配置)

### API Modules

| Module                | Description    |
| --------------------- | -------------- |
| Acceptance            | 验收单管理     |
| AlarmInformation      | 报警信息       |
| Alarminformationpush  | 报警信息推送   |
| AlarmRuleDetails      | 报警规则详情   |
| CompanyRegional       | 公司区域       |
| DeepSeek              | DeepSeek 相关  |
| DeviceParameter       | 设备参数       |
| Equipment             | 设备管理       |
| EquipmentData         | 设备数据       |
| FileUploadPDF         | PDF文件上传    |
| HistoryList           | 历史记录       |
| Image                 | 图片相关       |
| Login                 | 登录认证       |
| Menu2                 | 菜单管理       |
| Messages              | 消息管理       |
| Notification          | 通知管理       |
| OnlineDevice          | 在线设备       |
| Organizationstructure | 组织架构       |
| PermissionGroup       | 权限组         |
| RealtimeTest          | 实时测试       |
| Role                  | 角色管理       |
| Role_Menu             | 角色菜单权限   |
| Satff                 | 员工管理       |
| Sse                   | SSE 推送       |
| store                 | 门店管理       |
| StoreAnnotation       | 门店标注       |
| StoreInstallation     | 门店安装       |
| StoreTree             | 门店树         |
| sys_menu              | 系统菜单       |
| SystemMenu            | 系统菜单       |
| SystemMenuBackup      | 系统菜单备份   |
| systemresourcemodule  | 系统资源模块   |
| Template              | 模板管理       |
| UserMenu              | 用户菜单       |
| VerificationCode      | 验证码         |
| WebSocket             | WebSocket 通信 |
| Workflow              | 工作流         |
