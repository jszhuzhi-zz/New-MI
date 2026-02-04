# Development Guide / 開發指南

## Monorepo Structure

This project is a pnpm monorepo managed by Turborepo. All packages share a common TypeScript configuration and can import from shared packages via path aliases.

```
link-reit-membership/
├── apps/                      # Deployable applications
│   ├── backend/               # NestJS API
│   ├── group-admin/           # React admin portal (集團端)
│   ├── mall-admin/            # React admin portal (商場端)
│   ├── merchant-portal/       # React admin portal (商戶端)
│   ├── customer-web/          # React H5 app (顧客端)
│   ├── customer-mobile/       # React Native (Expo) app
│   └── mini-program/          # uni-app WeChat mini program
├── packages/
│   └── shared/
│       ├── types/             # @link-reit/types
│       ├── i18n/              # @link-reit/i18n
│       ├── utils/             # @link-reit/utils
│       └── api-client/        # @link-reit/api-client
├── turbo.json                 # Build pipeline
├── pnpm-workspace.yaml        # Workspace config
└── tsconfig.base.json         # Shared TS config
```

## Available Scripts

Run from the repository root:

| Script | Description |
|--------|-------------|
| `pnpm dev:backend` | Start backend in watch mode (port 3000) |
| `pnpm dev:group-admin` | Start group admin dev server (port 3001) |
| `pnpm dev:mall-admin` | Start mall admin dev server (port 3002) |
| `pnpm dev:merchant-portal` | Start merchant portal dev server (port 3003) |
| `pnpm dev:customer-mobile` | Start Expo dev server |
| `pnpm dev:mini-program` | Start mini program dev server |
| `pnpm build` | Build all apps (via Turborepo) |
| `pnpm build:backend` | Build backend only |
| `pnpm build:shared` | Build shared packages only |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:studio` | Open Prisma Studio (port 5555) |

## Path Aliases

Configured in `tsconfig.base.json`:

```typescript
import { MemberStatus, StampTransactionType } from '@link-reit/types';
import { t, setLocale } from '@link-reit/i18n';
import { formatCurrency, hashPassword } from '@link-reit/utils';
import { apiClient } from '@link-reit/api-client';
```

## Backend Development

### Module Structure

Each backend feature module follows this structure:

```
src/modules/<feature>/
├── <feature>.module.ts        # NestJS module definition
├── <feature>.controller.ts    # REST endpoints
├── <feature>.service.ts       # Business logic
└── dto/                       # Request/response DTOs (optional)
```

### Adding a New Module

1. Create the module directory under `apps/backend/src/modules/`
2. Create module, controller, and service files
3. Register the module in `app.module.ts`
4. Add Prisma models if needed in `prisma/schema.prisma`

Example:

```typescript
// src/modules/parking/parking.module.ts
import { Module } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';

@Module({
  controllers: [ParkingController],
  providers: [ParkingService],
  exports: [ParkingService],
})
export class ParkingModule {}
```

### Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes to database (development)
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. Create migration (production)
npx prisma migrate dev --name <migration-name>
```

### API Versioning

The API uses URI-based versioning. All endpoints are prefixed with `/api/v1/`. To add a v2 endpoint:

```typescript
@Controller({ path: 'members', version: '2' })
export class MembersV2Controller {
  // /api/v2/members
}
```

### Global Middleware

Applied to all requests in `main.ts`:

| Middleware | Purpose |
|-----------|---------|
| `ValidationPipe` | DTO validation with class-validator |
| `HttpExceptionFilter` | Standardised error responses |
| `LocaleInterceptor` | Extract `Accept-Language` header |
| `TransformInterceptor` | Wrap responses in standard envelope |
| `AuditLogInterceptor` | Log all mutations to AuditLog table |

## Frontend Development

### Admin Portals (Group / Mall / Merchant)

All three admin portals share the same tech stack:

- **React 18** + TypeScript
- **Ant Design 5** for UI components
- **React Router v6** for routing
- **Vite** for bundling and HMR

### Adding a New Admin Page

1. Create the page component in `src/pages/`:

```typescript
// src/pages/MyNewPage.tsx
import React from 'react';
import { Card, Table } from 'antd';

export default function MyNewPage() {
  return (
    <Card title="New Page">
      <Table columns={[]} dataSource={[]} />
    </Card>
  );
}
```

2. Register the route in `src/App.tsx`:

```typescript
<Route path="/my-new-page" element={<MyNewPage />} />
```

3. Add the menu item in the sidebar configuration.

### Customer H5 App

Uses **antd-mobile** for mobile-optimised components:

```typescript
import { Card, List, Button, NavBar } from 'antd-mobile';
```

Design guidelines:
- Max width: 430px, centred on desktop
- Use Link REIT brand colours: green `#00694B`, gold `#C4A962`
- Bottom TabBar for main navigation (5 tabs)
- NavBar for sub-pages with back button

### Customer Mobile App (React Native)

```bash
# Start Expo dev server
pnpm dev:customer-mobile

# Run on iOS simulator
cd apps/customer-mobile && npx expo run:ios

# Run on Android emulator
cd apps/customer-mobile && npx expo run:android
```

### WeChat Mini Program

```bash
# Start dev server
pnpm dev:mini-program

# Build for production
cd apps/mini-program && pnpm build

# Import dist/ into WeChat DevTools
```

## Internationalisation (i18n)

### Adding Translations

Edit the locale files in `packages/shared/i18n/src/locales/`:

```typescript
// locales/zh-TW.ts
export default {
  // ... existing translations
  parking: {
    title: '泊車查詢',
    freeHours: '免費泊車時數',
    remaining: '剩餘 {hours} 小時',
  },
};
```

Add matching keys in `zh-CN.ts` and `en.ts`.

### Using Translations

```typescript
import { t } from '@link-reit/i18n';

// Simple key
t('parking.title');            // "泊車查詢"

// With interpolation
t('parking.remaining', { hours: 3 }); // "剩餘 3 小時"
```

### Multi-Language Database Fields

For user-facing text stored in the database, use `Json` type in Prisma:

```prisma
model Campaign {
  name        Json    // { "zh-CN": "...", "zh-TW": "...", "en": "..." }
  description Json
}
```

Resolve the correct language in the API response based on `Accept-Language` header.

## Shared Types

All TypeScript interfaces are defined in `packages/shared/types/src/` and exported from the barrel file `index.ts`:

| File | Entities |
|------|----------|
| `auth.ts` | LoginDto, TokenPayload, UserSession |
| `member.ts` | Member, MemberCard, MemberTier, MemberLabel |
| `stamp.ts` | StampAccount, StampTransaction, StampEarningRule, StampExpiryRule |
| `merchant.ts` | Merchant, MerchantAccount |
| `campaign.ts` | Campaign, Coupon, CouponInstance, LuckyDraw, Gift |
| `content.ts` | Article, Banner, Venue, FloorPlan |
| `organization.ts` | Group, OrganizationUnit |
| `project.ts` | Project |
| `risk-control.ts` | RiskAlert, RiskRule, SpecialListEntry |
| `smart-marketing.ts` | Trigger, AutoTagRule, MemberSegment, MemberJourney |
| `report.ts` | ClearingReport, DownloadTask |
| `notification.ts` | PushNotification, NotificationTemplate |
| `common.ts` | PaginatedResponse, ApiResponse, MultiLangText |

## Coding Conventions

### TypeScript

- Strict mode enabled
- Use interfaces (not types) for object shapes
- Use enums for finite sets of values
- Prefer `const` over `let`; never use `var`
- Async/await over raw Promises

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `stamp-earning-rule.ts` |
| Components | PascalCase | `MemberCardList.tsx` |
| Variables/functions | camelCase | `calculateStamps()` |
| Constants | SCREAMING_SNAKE | `MAX_STAMPS_PER_DAY` |
| Database tables | PascalCase (Prisma convention) | `StampTransaction` |
| API routes | kebab-case | `/api/v1/stamp-transactions` |
| Environment variables | SCREAMING_SNAKE | `DATABASE_URL` |

### Git Conventions

- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Keep commits atomic — one logical change per commit

## Testing

### Backend Unit Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific module
cd apps/backend && npx jest --testPathPattern=member

# Run with coverage
cd apps/backend && npx jest --coverage
```

### Frontend Tests

```bash
# Run tests for an app
cd apps/group-admin && npx vitest
```

## Troubleshooting

### Common Issues

**Prisma: "Cannot find module '.prisma/client'"**
```bash
cd apps/backend && npx prisma generate
```

**pnpm: "ERR_PNPM_PEER_DEP_ISSUES"**
```bash
pnpm install --no-strict-peer-deps
```

**Port already in use**
```bash
lsof -ti :3000 | xargs kill -9
```

**Redis connection refused**
```bash
redis-server --daemonize yes
# or
docker start redis7
```

**TypeScript path alias not resolving**
Ensure `tsconfig.json` in the app extends `../../tsconfig.base.json` and that the Vite config (or NestJS CLI config) has matching alias settings.

**Database seed fails with null errors**
Run with relaxed null checks:
```bash
cd apps/backend && npx ts-node --compiler-options '{"strictNullChecks":false}' prisma/seed.ts
```
