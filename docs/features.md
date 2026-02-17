# Link REIT Membership System - Feature Documentation

> Complete feature list and module documentation for the membership system

---

## Table of Contents

1. [Customer Web (會員端 H5)](#customer-web-會員端-h5)
2. [Merchant Portal (商戶後台)](#merchant-portal-商戶後台)
3. [Mall Management (商場管理)](#mall-management-商場管理)
4. [Backend API Modules](#backend-api-modules)
5. [Database Schema Summary](#database-schema-summary)

---

## Customer Web (會員端 H5)

Mobile-first web application for members to manage their loyalty account.

### Pages & Features

| Page | Route | Features |
|------|-------|----------|
| **Home** | `/` | Dashboard, stamp balance, quick actions, banners, campaigns |
| **Login** | `/login` | SMS OTP login, password login, registration, demo account |
| **Profile** | `/profile` | Member info, tier status, logout |
| **Profile Edit** | `/profile/edit` | Update personal information |
| **Tier Info** | `/profile/tier` | Membership tier benefits, upgrade requirements |
| **Stamps** | `/stamp` | Stamp balance, transaction history |
| **Stamp Detail** | `/stamp/:id` | Transaction details |
| **Gifts** | `/gifts` | Gift redemption catalog |
| **Offers** | `/offers` | Available coupons and campaigns |
| **Coupon Detail** | `/offers/coupon/:id` | Coupon details, usage instructions |
| **Campaign Detail** | `/offers/campaign/:id` | Campaign information |
| **Lottery** | `/offers/lottery` | Lucky draw games |
| **Messages** | `/messages` | Notification center, read status tracking |
| **Parking** | `/parking` | Parking payment, history |
| **Favorites** | `/favorites` | Saved merchants |
| **Scan** | `/scan` | QR code scanner for stamp earning |
| **Mall Directory** | `/mall/directory` | Mall shops and facilities |
| **Merchant Detail** | `/mall/merchant/:id` | Shop information |
| **Check-in** | `/checkin` | Daily check-in for stamps |
| **AI Support** | `/support/ai-customer-service` | AI chatbot for inquiries |
| **Settings** | `/settings` | Language, notifications, theme |

### Key Features Implemented

1. **Theme System**
   - Dynamic theme colors via `useSettingsStore`
   - Configurable primary color palette
   - Theme persists across sessions

2. **Multi-language Support**
   - Traditional Chinese (zh-TW) - Default
   - Simplified Chinese (zh-CN)
   - English (en)

3. **Authentication**
   - SMS OTP verification with country code selection
   - Password login option
   - Demo account quick access
   - Force refresh on logout to clear cached data

4. **Message Center**
   - Read/unread status tracking
   - Dynamic unread count badge
   - localStorage-based persistence

5. **Security Guards**
   - Authentication guards on protected pages
   - Redirect to login with return URL

---

## Merchant Portal (商戶後台)

Web portal for merchant staff to manage stamps and verify coupons.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Merchant account login |
| **Dashboard** | `/` | Overview statistics, quick actions |
| **Issue Stamp** | `/stamp/issue` | Record member purchases and issue stamps |
| **Transaction Records** | `/stamp/records` | View stamp issuance history |
| **Phone Lookup** | `/member/phone` | Find member by phone number |
| **Scan Lookup** | `/member/scan` | QR code member lookup |
| **Coupon Verification** | `/coupon/verify` | Verify and redeem member coupons |
| **Transaction Stats** | `/statistics/transactions` | Transaction analytics |
| **Member Stats** | `/statistics/members` | Member engagement metrics |
| **Offer List** | `/offers` | View available offers |
| **Create Offer** | `/offers/new` | Create merchant-specific offers |
| **Shop Info** | `/settings/shop` | Manage shop information |
| **Staff Management** | `/settings/staff` | Manage staff accounts |

### Mall Management Module

New mall-level management features added to merchant portal:

| Page | Route | Description |
|------|-------|-------------|
| **Member Management** | `/mall/members` | View/edit all mall members |
| **Member Tags** | `/mall/tags` | Create tags, auto-rules, marketing campaigns |
| **Campaign Management** | `/mall/campaigns` | Mall-level campaign configuration |
| **Coupon Management** | `/mall/coupons` | Create and manage coupon templates |
| **Mall Management** | `/mall/management` | Multi-mall and admin user management |

---

## Mall Management (商場管理)

Detailed features for mall-level operations.

### 1. Member Management (`/mall/members`)

```
Features:
├── Member Search
│   ├── By member number
│   ├── By phone number
│   ├── By name
│   └── By registration date range
├── Member List
│   ├── Sortable columns
│   ├── Pagination
│   └── Export to Excel
├── Member Profile View
│   ├── Basic information
│   ├── Contact details
│   ├── Tier and stamps
│   └── Transaction history
├── Member Edit
│   ├── Update profile info
│   ├── Adjust tier manually
│   └── Add/remove tags
└── Statistics
    ├── Total members
    ├── Active members
    ├── New this month
    └── By tier breakdown
```

### 2. Member Tags (`/mall/tags`)

```
Features:
├── Tag Management
│   ├── Create custom tags
│   ├── Tag categories
│   ├── Color coding
│   └── Manual assignment
├── Auto-tagging Rules
│   ├── Spending-based rules
│   ├── Frequency-based rules
│   ├── Category preference rules
│   └── Tier-based rules
├── Marketing Campaigns
│   ├── Target by tag
│   ├── Push notifications
│   ├── SMS campaigns
│   └── Coupon distribution
└── Analytics
    ├── Tag distribution
    ├── Campaign performance
    └── Member segments
```

### 3. Campaign Management (`/mall/campaigns`)

```
Campaign Types:
├── STAMP_MULTIPLIER
│   └── Double/triple stamps for qualifying purchases
├── BONUS_STAMP
│   └── Extra stamps for specific conditions
├── COUPON_DISTRIBUTION
│   └── Auto-distribute coupons to members
├── GIFT_REDEMPTION
│   └── Special gift catalog during campaign
├── LUCKY_DRAW
│   └── Lottery events with prizes
└── SPECIAL_EVENT
    └── Holiday or themed promotions

Configuration:
├── Target Malls (multi-select)
├── Merchant Categories
├── Date Range
├── Member Tier Requirements
├── Budget Limits
└── Approval Workflow
```

### 4. Coupon Management (`/mall/coupons`)

```
Coupon Types:
├── CASH_VOUCHER
│   └── Fixed cash value (e.g., HKD 50 off)
├── DISCOUNT
│   └── Percentage discount (e.g., 20% off)
├── FREE_ITEM
│   └── Free product or service
└── PARKING
    └── Free parking hours

Configuration:
├── Stamp Cost (0 = free coupon)
├── Minimum Spending Requirement
├── Quantity Limits
│   ├── Total available
│   └── Per member limit
├── Validity Period
├── Applicable Merchants
└── Terms & Conditions
```

### 5. Mall & Admin Management (`/mall/management`)

```
Mall Management:
├── Mall List
│   ├── Mall code and name
│   ├── Total merchants
│   ├── Total members
│   └── Status
└── Mall Details
    ├── Basic information
    ├── Contact details
    └── Settings

Admin User Management:
├── User Roles
│   ├── super_admin - Full system access
│   ├── mall_admin - Mall-level management
│   └── mall_viewer - Read-only access
├── User List
│   ├── Name, email, role
│   ├── Assigned malls
│   └── Status
├── Create User
│   ├── Basic info
│   ├── Role assignment
│   └── Mall permissions
└── Permission Management
    └── Granular feature access control
```

---

## Backend API Modules

### Module Structure

```
apps/backend/src/modules/
├── auth/           # Authentication & authorization
├── member/         # Member management
├── stamp/          # Stamp transactions & rules
├── merchant/       # Merchant management
├── campaign/       # Campaigns & promotions
├── content/        # CMS features
├── notification/   # Push, SMS, email
├── parking/        # Parking payment
├── feedback/       # Customer feedback & AI chat
├── lucky-draw/     # Lucky draw games
├── favorite/       # Member favorites
├── report/         # Report generation
├── organization/   # Group/Project hierarchy
├── risk-control/   # Fraud detection
└── smart-marketing/# Auto-tagging & triggers
```

### API Endpoints Summary

#### Authentication (`/api/auth`)
- `POST /login` - Login with credentials
- `POST /sms/send` - Send SMS OTP
- `POST /sms/verify` - Verify OTP and login
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout
- `GET /m365/url` - Get M365 SSO URL
- `GET /m365/callback` - M365 SSO callback

#### Members (`/api/members`)
- `GET /me` - Current member profile
- `PATCH /me` - Update profile
- `GET /:id` - Get member by ID
- `GET /` - List members (paginated)
- `POST /` - Create member
- `POST /lookup` - Lookup by phone/card

#### Stamps (`/api/stamps`)
- `GET /balance` - Get balance
- `GET /transactions` - Transaction history
- `POST /earn` - Record earning
- `POST /redeem` - Redeem stamps
- `POST /adjust` - Manual adjustment
- `GET /expiring` - Expiring stamps

#### Coupons (`/api/coupons`)
- `GET /` - List coupons
- `GET /my` - Member's coupons
- `POST /:id/claim` - Claim coupon
- `POST /:id/use` - Use coupon
- `POST /verify` - Verify (merchant)

#### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PATCH /:id/read` - Mark as read
- `GET /unread-count` - Unread count

---

## Database Schema Summary

### Entity Count: 47 Tables

#### Organization (3 tables)
- Group, OrganizationUnit, Project

#### Users & Auth (6 tables)
- User, Role, Permission, UserRole, LoginLog, AuditLog

#### Members (7 tables)
- Member, MemberCard, MemberTier, MemberLabel
- MemberMemberLabel, MemberChangeRecord, MemberAccountRecord
- SpecialListMember

#### Stamps (9 tables)
- StampAccount, StampTransaction
- StampEarningRule, StampConsumptionRule
- StampExpiryRule, StampUpperLimitRule
- CampaignStampRule, OnlineActivityStampRule, StampInfo

#### Merchants (2 tables)
- Merchant, MerchantAccount

#### Campaigns (8 tables)
- Campaign, Coupon, CouponInstance
- LuckyDraw, LuckyDrawPrize, LuckyDrawEntry
- Gift, GiftRedemption

#### Content (5 tables)
- Venue, FloorPlan, ContentArticle, ServiceDirectory, Banner

#### Notifications (3 tables)
- PushNotification, NotificationTemplate, SmsSendRecord

#### Operations (3 tables)
- InterfaceMonitor, ReportDownload, OperationLog

#### Others (2 tables)
- MemberFavorite, Feedback, FeedbackMessage
- ParkingRecord, ParkingRate

---

## Recent Updates (2026-02)

### Theme Color System
- Dynamic theme colors for logged-out pages
- Updated login page to use `getThemeColors()`
- Updated offers page theme consistency
- Configurable primary/secondary colors

### Profile Page Updates
- Removed settings button from header
- Removed "Edit Profile" from menu
- Added dynamic unread message count badge
- Force page refresh on logout

### Mall Management Portal
- Added comprehensive member management
- Member tagging and auto-rules
- Campaign configuration
- Coupon management
- Multi-mall admin management

### Security Enhancements
- Authentication guards on all protected pages
- Session-based redirect after login
- Cached data cleared on logout

---

## Configuration Files

### Environment Variables

```env
# Server
NODE_ENV=production
APP_PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# M365 SSO
M365_TENANT_ID=
M365_CLIENT_ID=
M365_CLIENT_SECRET=

# SMS
SMS_PROVIDER=twilio
SMS_API_KEY=
SMS_API_SECRET=
SMS_FROM_NUMBER=

# Storage
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

### Theme Configuration

```typescript
// store/settings.ts
const themeColors = {
  primary: '#00694B',      // Link REIT green
  primaryDark: '#004D36',  // Darker shade
  secondary: '#1890ff',    // Accent blue
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
};
```

---

## Demo Accounts

| Portal | Credentials | Member Info |
|--------|-------------|-------------|
| Customer H5 | Phone: 85291234567, Password: demo123 | 陳小明, Gold tier, 2580 stamps |
| Group Admin | admin@linkgroup.com / admin123 | System administrator |
| Mall Admin | admin@festivalwalk.com / admin123 | Festival Walk admin |
| Merchant Portal | merchant@starbucks.com / merchant123 | Starbucks staff |

---

## Deployment URLs

### Development
| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| API Docs | http://localhost:3000/api/docs |
| Group Admin | http://localhost:3001 |
| Mall Admin | http://localhost:3002 |
| Merchant Portal | http://localhost:3003 |
| Customer H5 | http://localhost:3004 |

### Production (with SERVER_IP)
| Service | URL |
|---------|-----|
| Backend API | http://SERVER_IP:3000 |
| Group Admin | http://SERVER_IP:3001 |
| Mall Admin | http://SERVER_IP:3002 |
| Merchant Portal | http://SERVER_IP:3003 |
| Customer H5 | http://SERVER_IP:3004 |

---

*Last updated: 2026-02-17*
