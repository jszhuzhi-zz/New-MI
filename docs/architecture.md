# System Architecture / 系統架構

## Overview

The Link REIT Membership System follows a multi-tier architecture designed for the organisational hierarchy of a commercial REIT: **Group (集團)** → **Project (項目/商場)** → **Merchant (商戶)**. The backend is a single NestJS application serving multiple frontend portals, with PostgreSQL for persistence and Redis for caching and background job processing.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Layer                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │ Group    │  │ Mall     │  │ Merchant │  │ Customer │  │ Mini  ││
│  │ Admin    │  │ Admin    │  │ Portal   │  │ H5 / App │  │ Prog  ││
│  │ React+AD │  │ React+AD │  │ React+AD │  │ React+AM │  │ Vue3  ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬───┘│
│       │              │              │              │            │    │
└───────┼──────────────┼──────────────┼──────────────┼────────────┼────┘
        │              │              │              │            │
        └──────────────┴──────────────┴──────┬───────┴────────────┘
                                             │
┌────────────────────────────────────────────┼─────────────────────────┐
│                     Nginx Reverse Proxy    │                         │
│                     (SSL termination,      │                         │
│                      routing, rate limit)  │                         │
└────────────────────────────────────────────┼─────────────────────────┘
                                             │
┌────────────────────────────────────────────┼─────────────────────────┐
│                     API Layer (NestJS)     │                         │
│  ┌─────────────────────────────────────────┴──────────────────────┐  │
│  │                      API Gateway                               │  │
│  │  • JWT / M365 AD Authentication                                │  │
│  │  • Portal-type Header (X-Portal-Type)                          │  │
│  │  • Locale Detection (Accept-Language)                          │  │
│  │  • Rate Limiting & CORS                                        │  │
│  │  • Request Validation & Transformation                         │  │
│  │  • Audit Logging                                               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Auth   │ │  Member  │ │  Stamp   │ │ Campaign │ │ Content  │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Org     │ │   Risk   │ │ Merchant │ │  Report  │ │ Notif    │  │
│  │  Module  │ │ Control  │ │  Module  │ │  Module  │ │  Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────────────────────────────────────────────────┘
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────┐
│ PostgreSQL   │      │    Redis     │
│ 16-alpine    │      │  7-alpine    │
│              │      │              │
│ 47 tables    │      │ • Sessions   │
│ Multi-tenant │      │ • Bull Queue │
│ JSON i18n    │      │ • Rate Limit │
└──────────────┘      └──────────────┘
```

## Multi-Tenant Hierarchy

The system models a **three-level** organisational structure:

```
Group (集團) ─── Link REIT
  ├── Project (項目) ─── Festival Walk (又一城)
  │     ├── Merchant ─── Starbucks (G-G12)
  │     ├── Merchant ─── Pacific Coffee (L1-102)
  │     ├── Merchant ─── UNIQLO (L2-201)
  │     └── ...
  └── Project (項目) ─── T Town (樂富廣場)
        ├── Merchant ─── BreadTalk (G-05)
        ├── Merchant ─── Watsons (L1-18)
        └── ...
```

### Data Isolation

- **Group level** has full visibility across all projects and merchants
- **Project level** can only see members, stamps, and merchants within its own project
- **Merchant level** can only see its own transactions and verified member info
- **Customer level** sees their personal data across all enrolled projects

Each API request carries an `X-Portal-Type` header (`group` | `mall` | `merchant` | `customer`) which determines the scope of data access via guards and interceptors.

## Backend Modules

### Auth Module (`/api/v1/auth`)
- JWT-based authentication with access + refresh token pair
- Microsoft 365 AD SSO for admin portals
- SMS OTP for customer mobile / mini program login
- Apple Sign In support
- Session management and login audit

### Organisation Module (`/api/v1/organization`)
- Group and project CRUD
- Organisation unit (department) management
- Role-based access control (RBAC)
- Permission assignment at group/project level

### Member Module (`/api/v1/members`)
- Member registration from multiple channels
- 5-tier system: Standard → Silver → Gold → Platinum → Diamond
- Member card lifecycle (issue, replace, suspend, close)
- Label system with auto-tagging
- Member search, filter, import/export
- Account merge for duplicate resolution

### Stamp Module (`/api/v1/stamps`)
- Stamp earning: rule-based calculation per transaction
- Stamp consumption: coupon/gift/parking redemption
- Earning rules: base rate, multiplier, cap, category-specific
- Expiry rules: rolling window / fixed date / no expiry
- Upper limit: daily, monthly, yearly caps
- Campaign-specific and online-activity bonus rules
- Full transaction ledger with double-entry bookkeeping

### Risk Control Module (`/api/v1/risk-control`)
- Anomaly detection engine (velocity checks, amount thresholds)
- Configurable rule engine with scoring model
- Alert generation and manual review workflow
- Whitelist/blacklist management
- Dashboard with risk metrics

### Merchant Module (`/api/v1/merchants`)
- Merchant onboarding and profile management
- Staff account management
- Stamp issuance from merchant POS
- Transaction reconciliation

### Campaign Module (`/api/v1/campaigns`)
- Campaign lifecycle: draft → active → paused → ended
- Electronic coupon distribution and verification
- Lucky draw with configurable prize pools and probability
- Gift catalogue and redemption tracking
- Multi-channel push (in-app, SMS, email, push notification)

### Content Module (`/api/v1/content`)
- Article/banner CMS with scheduling
- Venue and floor plan management
- Service directory
- Multi-language content with JSON fields

### Report Module (`/api/v1/reports`)
- Clearing reports for stamp settlement
- Member analytics and growth metrics
- Download centre for async report generation
- Operation log and audit trail

### Notification Module (`/api/v1/notifications`)
- Push notification (APNs + FCM + HMS)
- SMS delivery via Twilio
- Email via SMTP
- Template management with variable substitution

## Database Design

### Key Design Decisions

1. **Multi-language JSON fields**: Name/description columns use `Json` type to store `{ "zh-CN": "...", "zh-TW": "...", "en": "..." }` instead of separate tables, reducing JOIN complexity.

2. **Stamp as double-entry ledger**: Every stamp transaction creates a record with `type` (EARN/REDEEM/BONUS/ADJUST/EXPIRE/etc.) and `amount` (positive or negative). The `StampAccount` table holds the current balance as a cached aggregate.

3. **Soft deletes**: Tables use `deletedAt` (nullable timestamp) for soft deletion, preserving audit history.

4. **Polymorphic audit**: The `AuditLog` table records all mutations across the system with `entityType` + `entityId` + JSON `oldValues`/`newValues`.

5. **Configuration as data**: Stamp earning rules, expiry rules, and risk control rules are stored as database records rather than code, enabling runtime configuration by admins.

### Entity Relationship Diagram (Core)

```
Group ──1:N──> Project ──1:N──> Merchant
                  │                  │
                  │                  ├── MerchantAccount
                  │                  │
                  ├── MemberTier     ├── StampTransaction ──> StampAccount
                  │                  │
                  ├── StampEarningRule
                  ├── StampExpiryRule
                  ├── StampUpperLimitRule
                  │
                  └── Campaign ──1:N──> Coupon ──1:N──> CouponInstance
                               ──1:N──> LuckyDraw ──1:N──> LuckyDrawEntry

Member ──1:1──> StampAccount
       ──1:N──> MemberCard
       ──N:M──> MemberLabel (via MemberMemberLabel)
       ──1:N──> StampTransaction
       ──1:N──> CouponInstance
       ──1:N──> GiftRedemption
```

## Frontend Architecture

### Shared Packages

All frontends share code through pnpm workspace packages:

| Package | Path | Purpose |
|---------|------|---------|
| `@link-reit/types` | `packages/shared/types` | TypeScript interfaces for all entities |
| `@link-reit/i18n` | `packages/shared/i18n` | Translation strings (zh-CN, zh-TW, en) |
| `@link-reit/utils` | `packages/shared/utils` | Crypto, formatting, pagination, validation |
| `@link-reit/api-client` | `packages/shared/api-client` | Axios-based API client with interceptors |

### Admin Portals (Group / Mall / Merchant)

- **Framework**: React 18 + TypeScript
- **UI Library**: Ant Design 5
- **Routing**: React Router v6
- **State**: React Context + hooks
- **Auth**: JWT stored in localStorage, auto-refresh, M365 SSO redirect
- **Layout**: ProLayout with sidebar navigation, breadcrumb, header with locale/user menu

### Customer H5 Web App

- **Framework**: React 18 + TypeScript
- **UI Library**: antd-mobile 5 (mobile-first)
- **Routing**: React Router v6 with TabBar layout
- **State**: Zustand
- **Viewport**: 430px max-width, centered, mobile meta tags
- **Theme**: Link REIT brand green (#00694B) + gold (#C4A962)

### Customer Mobile App

- **Framework**: React Native + Expo
- **Navigation**: React Navigation (stack + tab)
- **State**: Zustand
- **Platform**: iOS / Android / HarmonyOS (via Expo)

### WeChat Mini Program

- **Framework**: uni-app + Vue 3 + TypeScript
- **UI Library**: uni-ui
- **State**: Pinia
- **Build**: Vite + @dcloudio/vite-plugin-uni

## Security Architecture

### Authentication Flow

```
Customer Login:
  Phone + SMS OTP  ─→  Verify OTP  ─→  Issue JWT pair  ─→  Set auth header

Admin Login:
  Email + Password ─→  Verify hash ─→  Issue JWT pair  ─→  Set auth header
       OR
  M365 AD SSO     ─→  OAuth2 code  ─→  Exchange token ─→  Issue JWT pair

All Requests:
  Authorization: Bearer <access_token>
  X-Portal-Type: customer | mall | group | merchant
  Accept-Language: zh-TW | zh-CN | en
```

### Security Controls

- **CORS**: Restricted origins per environment
- **Rate limiting**: Configurable TTL and max requests per window
- **Input validation**: DTO-level validation with class-validator
- **SQL injection**: Prevented via Prisma parameterised queries
- **XSS**: React's built-in escaping + CSP headers
- **Audit trail**: All mutations logged with user, timestamp, old/new values
- **Password**: bcrypt hashing with configurable rounds

## Data Sync Architecture

The system supports two modes for shop/merchant data:

1. **Local mode**: Merchant data is managed directly in the membership system
2. **Sync mode**: Merchant data is pulled from the Group Data Center via scheduled sync

```
Group Data Center (external)
        │
        │  REST API (scheduled every 30min)
        ▼
  Data Sync Service
        │
        ├── Upsert merchants
        ├── Update floor plans
        └── Sync venue data
```

Configuration: `GROUP_DATA_CENTER_URL`, `GROUP_DATA_CENTER_API_KEY`, `DATA_SYNC_INTERVAL_MINUTES` in `.env`.
