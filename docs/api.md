# API Reference / API 文檔

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.membership.linkreit.com/api/v1
```

Interactive Swagger UI: `http://localhost:3000/api/docs`

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes (except public endpoints) | `Bearer <access_token>` |
| `X-Portal-Type` | Yes | Portal context: `customer`, `mall`, `group`, `merchant` |
| `Accept-Language` | No | Response language: `zh-TW` (default), `zh-CN`, `en` |
| `X-Request-Id` | No | Client-generated request ID for tracing |
| `Content-Type` | Yes (POST/PUT/PATCH) | `application/json` |

## Response Format

All responses follow a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member with ID xxx not found",
    "details": []
  },
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

Paginated responses:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

## Authentication

### POST `/auth/login`

Login with email/phone and password.

**Request:**
```json
{
  "email": "admin@linkgroup.com",
  "password": "admin123",
  "portalType": "group"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "admin@linkgroup.com",
      "name": { "zh-CN": "管理员", "zh-TW": "管理員", "en": "Admin" },
      "portalType": "GROUP",
      "roles": ["GROUP_ADMIN"]
    }
  }
}
```

### POST `/auth/sms/send`

Send SMS OTP for customer login.

**Request:**
```json
{
  "phone": "+85291234567"
}
```

### POST `/auth/sms/verify`

Verify SMS OTP and issue tokens.

**Request:**
```json
{
  "phone": "+85291234567",
  "code": "123456"
}
```

### POST `/auth/refresh`

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

### GET `/auth/m365`

Redirect to Microsoft 365 AD for SSO login.

### GET `/auth/m365-callback`

M365 OAuth2 callback endpoint (handles code exchange).

---

## Organisation

### GET `/organization/groups`

List all groups (group portal only).

### GET `/organization/groups/:id`

Get group details with organisation units.

### GET `/organization/projects`

List projects. Supports query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20) |
| `search` | string | Search by name |
| `status` | string | Filter by status |

### POST `/organization/projects`

Create a new project (group portal only).

**Request:**
```json
{
  "name": { "zh-CN": "又一城", "zh-TW": "又一城", "en": "Festival Walk" },
  "code": "FW",
  "address": { "zh-CN": "九龙塘达之路80号", "zh-TW": "九龍塘達之路80號", "en": "80 Tat Chee Ave, Kowloon Tong" },
  "phone": "+85223456789",
  "groupId": "uuid"
}
```

---

## Members

### GET `/members`

List members with filtering and pagination.

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `search` | string | Search by name, phone, email, card number |
| `tier` | string | Filter by tier ID |
| `status` | enum | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `CLOSED`, `PENDING` |
| `registrationSource` | enum | `APP`, `WEBSITE`, `COUNTER`, `KIOSK`, `WECHAT_MINI_PROGRAM` |
| `labelIds` | string[] | Filter by label IDs |
| `dateFrom` | ISO date | Registration date range start |
| `dateTo` | ISO date | Registration date range end |

### GET `/members/:id`

Get full member profile including stamp account, cards, labels, recent transactions.

### POST `/members`

Register a new member.

**Request:**
```json
{
  "phone": "+85291234567",
  "name": { "zh-CN": "陈小明", "zh-TW": "陳小明", "en": "Chan Siu Ming" },
  "email": "siuming@example.com",
  "gender": "MALE",
  "dateOfBirth": "1990-05-15",
  "preferredLanguage": "zh-TW",
  "registrationSource": "APP",
  "projectId": "uuid"
}
```

### PUT `/members/:id`

Update member profile.

### POST `/members/:id/suspend`

Suspend a member account.

### POST `/members/:id/reactivate`

Reactivate a suspended member.

### POST `/members/:id/merge`

Merge two member accounts.

**Request:**
```json
{
  "sourceMemberId": "uuid-to-merge-from",
  "strategy": "KEEP_HIGHER_TIER"
}
```

### POST `/members/import`

Bulk import members from Excel file (multipart/form-data).

### GET `/members/export`

Export members to Excel. Accepts same filter parameters as list endpoint.

---

## Member Tiers

### GET `/members/tiers`

List all tier configurations for the current project.

### PUT `/members/tiers/:id`

Update tier configuration (thresholds, benefits).

**Request:**
```json
{
  "name": { "zh-CN": "金卡", "zh-TW": "金卡", "en": "Gold" },
  "stampThreshold": 2000,
  "stampMultiplier": 1.5,
  "benefits": {
    "zh-TW": ["印花獲取 1.5 倍", "生日月份三倍印花", "每月免費泊車2次"],
    "zh-CN": ["印花获取 1.5 倍", "生日月份三倍印花", "每月免费泊车2次"],
    "en": ["1.5x stamp earning", "Triple stamps on birthday month", "2 free parking/month"]
  }
}
```

---

## Stamps

### GET `/stamps/account/:memberId`

Get member's stamp account balance and summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": "uuid",
    "balance": 2580,
    "monthEarned": 320,
    "monthRedeemed": 150,
    "expiringSoon": 200,
    "tier": {
      "id": "uuid",
      "name": { "zh-TW": "金卡", "en": "Gold" },
      "nextTier": { "name": { "zh-TW": "白金", "en": "Platinum" }, "stampsRequired": 4000 },
      "progress": 2580
    }
  }
}
```

### GET `/stamps/transactions`

List stamp transactions with filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `memberId` | uuid | Filter by member |
| `merchantId` | uuid | Filter by merchant |
| `type` | enum | `EARN`, `REDEEM`, `BONUS`, `ADJUST_ADD`, `ADJUST_DEDUCT`, `EXPIRE`, etc. |
| `dateFrom` | ISO date | Transaction date range start |
| `dateTo` | ISO date | Transaction date range end |
| `page` | number | Page number |
| `pageSize` | number | Items per page |

### POST `/stamps/earn`

Issue stamps for a transaction (merchant portal).

**Request:**
```json
{
  "memberId": "uuid",
  "merchantId": "uuid",
  "receiptAmount": 580.00,
  "receiptNo": "RCP-20260204-001",
  "receiptImage": "https://storage.../receipt.jpg"
}
```

The system automatically applies earning rules (base rate, multiplier, campaign bonuses) and returns the calculated stamp amount.

### POST `/stamps/redeem`

Redeem stamps for a reward.

**Request:**
```json
{
  "memberId": "uuid",
  "type": "COUPON",
  "referenceId": "coupon-instance-uuid",
  "amount": 200,
  "description": { "zh-TW": "兌換: 星巴克 HK$50 優惠券" }
}
```

### POST `/stamps/adjust`

Manual stamp adjustment (admin only).

**Request:**
```json
{
  "memberId": "uuid",
  "type": "ADJUST_ADD",
  "amount": 100,
  "reason": "Compensation for system error",
  "approvedBy": "admin-uuid"
}
```

---

## Stamp Rules

### GET `/stamps/earning-rules`

List stamp earning rules for the current project.

### POST `/stamps/earning-rules`

Create a new earning rule.

**Request:**
```json
{
  "name": { "zh-TW": "基本消費印花", "en": "Basic spending stamps" },
  "type": "BASE_RATE",
  "amountPerStamp": 10.00,
  "currency": "HKD",
  "minTransactionAmount": 20.00,
  "maxStampsPerTransaction": 100,
  "applicableMerchantIds": [],
  "applicableTierIds": [],
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "isActive": true
}
```

### GET `/stamps/expiry-rules`

List stamp expiry rules.

### GET `/stamps/upper-limit-rules`

List stamp upper limit rules (daily/monthly/yearly caps).

---

## Risk Control

### GET `/risk-control/dashboard`

Get risk control dashboard metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingReviews": 7,
    "anomaliesDetected": 23,
    "highRiskMembers": 5,
    "blockedTransactions": 12,
    "recentAlerts": [ ... ]
  }
}
```

### GET `/risk-control/anomalies`

List detected anomalies for review.

### POST `/risk-control/anomalies/:id/review`

Submit review decision for an anomaly.

**Request:**
```json
{
  "decision": "APPROVE",
  "reviewNote": "Verified with merchant - legitimate bulk purchase"
}
```

### GET `/risk-control/rules`

List risk control rules.

### POST `/risk-control/rules`

Create a risk detection rule.

**Request:**
```json
{
  "name": "High velocity stamp earning",
  "type": "VELOCITY",
  "condition": {
    "maxTransactions": 10,
    "timeWindowMinutes": 60
  },
  "severity": "HIGH",
  "action": "FLAG_FOR_REVIEW"
}
```

### GET `/risk-control/special-list`

List whitelist/blacklist entries.

### POST `/risk-control/special-list`

Add member to whitelist or blacklist.

---

## Merchants

### GET `/merchants`

List merchants with filtering.

### GET `/merchants/:id`

Get merchant details.

### POST `/merchants`

Register a new merchant.

### PUT `/merchants/:id`

Update merchant info.

### GET `/merchants/:id/staff`

List merchant staff accounts.

### POST `/merchants/:id/staff`

Add a staff account to a merchant.

---

## Campaigns

### GET `/campaigns`

List campaigns.

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `DRAFT`, `ACTIVE`, `PAUSED`, `ENDED` |
| `type` | enum | `STAMP_BONUS`, `COUPON`, `LUCKY_DRAW`, `GIFT` |
| `projectId` | uuid | Filter by project |

### POST `/campaigns`

Create a new campaign.

### GET `/campaigns/:id`

Get campaign details with performance metrics.

### PUT `/campaigns/:id/status`

Update campaign status (activate, pause, end).

### GET `/campaigns/:id/coupons`

List coupons for a campaign.

### POST `/campaigns/:id/coupons/distribute`

Distribute coupons to members.

**Request:**
```json
{
  "targetType": "TIER",
  "targetValue": "gold",
  "couponId": "uuid",
  "quantity": 1,
  "message": { "zh-TW": "金卡會員專屬優惠" }
}
```

### POST `/campaigns/lucky-draw/:id/enter`

Enter a lucky draw (customer portal).

### POST `/campaigns/lucky-draw/:id/draw`

Execute lucky draw and determine winners (admin portal).

---

## Content

### GET `/content/articles`

List published articles/news.

### GET `/content/banners`

List active banners for a given placement.

### GET `/content/venues`

List venues (malls) with floor plans.

### GET `/content/venues/:id/merchants`

List merchants in a venue with floor/category filtering.

---

## Reports

### GET `/reports/clearing`

Generate clearing report for stamp settlements.

| Parameter | Type | Description |
|-----------|------|-------------|
| `projectId` | uuid | Project scope |
| `dateFrom` | ISO date | Period start |
| `dateTo` | ISO date | Period end |
| `format` | enum | `json`, `xlsx` |

### GET `/reports/member-analytics`

Member growth, retention, and activity analytics.

### GET `/reports/downloads`

List available report downloads.

### POST `/reports/downloads`

Request async report generation.

---

## Notifications

### POST `/notifications/push`

Send push notification.

**Request:**
```json
{
  "targetType": "SEGMENT",
  "targetValue": "gold_tier_members",
  "title": { "zh-TW": "新年活動通知", "en": "CNY Campaign Notice" },
  "body": { "zh-TW": "新春三倍印花活動已開始！", "en": "Triple stamp CNY campaign starts now!" },
  "channels": ["PUSH", "IN_APP"],
  "scheduledAt": "2026-02-08T00:00:00+08:00"
}
```

### GET `/notifications/templates`

List notification templates.

### POST `/notifications/sms/send`

Send SMS message.

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired |
| `AUTH_INSUFFICIENT_PERMISSION` | 403 | User lacks required permission |
| `MEMBER_NOT_FOUND` | 404 | Member ID does not exist |
| `MEMBER_SUSPENDED` | 403 | Member account is suspended |
| `MEMBER_DUPLICATE_PHONE` | 409 | Phone number already registered |
| `STAMP_INSUFFICIENT_BALANCE` | 400 | Not enough stamps for redemption |
| `STAMP_RULE_VIOLATION` | 400 | Transaction violates stamp rules (cap, cooldown) |
| `STAMP_TRANSACTION_FLAGGED` | 400 | Transaction flagged by risk control |
| `CAMPAIGN_NOT_ACTIVE` | 400 | Campaign is not in active status |
| `COUPON_ALREADY_USED` | 400 | Coupon has already been verified |
| `COUPON_EXPIRED` | 400 | Coupon has expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Rate Limiting

Default limits (configurable via environment):

| Scope | Limit |
|-------|-------|
| Global | 100 requests / 60 seconds per IP |
| SMS OTP | 5 requests / 300 seconds per phone |
| Login | 10 attempts / 300 seconds per account |
| Stamp earn | 30 requests / 60 seconds per merchant |
