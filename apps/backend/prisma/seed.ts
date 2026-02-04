/**
 * Prisma Seed Script - Link REIT (領展) Membership System
 *
 * Seeds the database with:
 * - Default group (Link REIT / 領展)
 * - 2 sample projects (malls)
 * - Default roles (super-admin, group-admin, project-admin, merchant-admin, customer-service)
 * - Default permissions tree
 * - Sample member tiers (Standard, Silver, Gold, Platinum, Diamond)
 * - Sample stamp earning rules
 */

import { PrismaClient, DataSyncMode, StampRuleStatus, StampExpiryMode } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Pre-generated UUIDs so we can reference them across seed data
// ---------------------------------------------------------------------------
const GROUP_ID = randomUUID();
const PROJECT_FESTIVAL_WALK_ID = randomUUID();
const PROJECT_T_TOWN_ID = randomUUID();

const TIER_STANDARD_ID = randomUUID();
const TIER_SILVER_ID = randomUUID();
const TIER_GOLD_ID = randomUUID();
const TIER_PLATINUM_ID = randomUUID();
const TIER_DIAMOND_ID = randomUUID();

const ROLE_SUPER_ADMIN_ID = randomUUID();
const ROLE_GROUP_ADMIN_ID = randomUUID();
const ROLE_PROJECT_ADMIN_ID = randomUUID();
const ROLE_MERCHANT_ADMIN_ID = randomUUID();
const ROLE_CUSTOMER_SERVICE_ID = randomUUID();

// ---------------------------------------------------------------------------
// Permission IDs (top-level modules)
// ---------------------------------------------------------------------------
const PERM_DASHBOARD_ID = randomUUID();
const PERM_MEMBER_ID = randomUUID();
const PERM_MEMBER_LIST_ID = randomUUID();
const PERM_MEMBER_CREATE_ID = randomUUID();
const PERM_MEMBER_EDIT_ID = randomUUID();
const PERM_MEMBER_DELETE_ID = randomUUID();
const PERM_MEMBER_IMPORT_ID = randomUUID();
const PERM_MEMBER_EXPORT_ID = randomUUID();
const PERM_MEMBER_TIER_ID = randomUUID();
const PERM_MEMBER_LABEL_ID = randomUUID();
const PERM_MEMBER_SPECIAL_LIST_ID = randomUUID();
const PERM_STAMP_ID = randomUUID();
const PERM_STAMP_ACCOUNT_ID = randomUUID();
const PERM_STAMP_TRANSACTION_ID = randomUUID();
const PERM_STAMP_ADJUST_ID = randomUUID();
const PERM_STAMP_EARNING_RULE_ID = randomUUID();
const PERM_STAMP_CONSUMPTION_RULE_ID = randomUUID();
const PERM_STAMP_EXPIRY_RULE_ID = randomUUID();
const PERM_STAMP_LIMIT_RULE_ID = randomUUID();
const PERM_MERCHANT_ID = randomUUID();
const PERM_MERCHANT_LIST_ID = randomUUID();
const PERM_MERCHANT_CREATE_ID = randomUUID();
const PERM_MERCHANT_EDIT_ID = randomUUID();
const PERM_CAMPAIGN_ID = randomUUID();
const PERM_CAMPAIGN_LIST_ID = randomUUID();
const PERM_CAMPAIGN_CREATE_ID = randomUUID();
const PERM_CAMPAIGN_EDIT_ID = randomUUID();
const PERM_CAMPAIGN_APPROVE_ID = randomUUID();
const PERM_COUPON_ID = randomUUID();
const PERM_LUCKY_DRAW_ID = randomUUID();
const PERM_GIFT_ID = randomUUID();
const PERM_CONTENT_ID = randomUUID();
const PERM_CONTENT_ARTICLE_ID = randomUUID();
const PERM_CONTENT_BANNER_ID = randomUUID();
const PERM_CONTENT_VENUE_ID = randomUUID();
const PERM_NOTIFICATION_ID = randomUUID();
const PERM_SYSTEM_ID = randomUUID();
const PERM_SYSTEM_ROLE_ID = randomUUID();
const PERM_SYSTEM_USER_ID = randomUUID();
const PERM_SYSTEM_AUDIT_ID = randomUUID();
const PERM_SYSTEM_INTERFACE_ID = randomUUID();
const PERM_SYSTEM_REPORT_ID = randomUUID();

// ---------------------------------------------------------------------------
// Helper: multilingual JSON
// ---------------------------------------------------------------------------
function ml(zhCN: string, zhTW: string, en: string) {
  return { 'zh-CN': zhCN, 'zh-TW': zhTW, en };
}

// ---------------------------------------------------------------------------
// Seed: Group
// ---------------------------------------------------------------------------
async function seedGroup() {
  console.log('Seeding group...');
  await prisma.group.create({
    data: {
      id: GROUP_ID,
      code: 'LINK_REIT',
      name: ml('领展房地产投资信托基金', '領展房地產投資信託基金', 'Link Real Estate Investment Trust'),
      description: ml(
        '领展是亚太地区规模最大的房地产投资信托基金之一',
        '領展是亞太地區規模最大的房地產投資信託基金之一',
        'Link REIT is one of the largest REITs in Asia Pacific',
      ),
      logo: '/assets/logos/link-reit.png',
      contactEmail: 'info@linkreit.com',
      contactPhone: '+852-2175-1800',
      website: 'https://www.linkreit.com',
      timezone: 'Asia/Hong_Kong',
      currency: 'HKD',
      settings: {
        brandColor: '#E31937',
        secondaryColor: '#003366',
        defaultLanguage: 'zh-TW',
        supportedLanguages: ['zh-CN', 'zh-TW', 'en'],
        features: {
          stampSystem: true,
          couponSystem: true,
          luckyDraw: true,
          giftRedemption: true,
          pushNotification: true,
          smsNotification: true,
        },
      },
      stampModeConfig: {
        displayName: ml('印花', '印花', 'Stamps'),
        icon: '/assets/icons/stamp.png',
        baseRatio: 1, // 1 stamp per HKD unit configured in earning rules
        roundingMode: 'floor',
        displayFormat: '0',
        decimalPlaces: 0,
        enableTransfer: false,
        enablePartialRedeem: true,
      },
      isActive: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Seed: Projects (Malls)
// ---------------------------------------------------------------------------
async function seedProjects() {
  console.log('Seeding projects...');

  await prisma.project.createMany({
    data: [
      {
        id: PROJECT_FESTIVAL_WALK_ID,
        groupId: GROUP_ID,
        code: 'FESTIVAL_WALK',
        name: ml('又一城', '又一城', 'Festival Walk'),
        description: ml(
          '又一城是位于九龙塘的大型购物中心，提供时尚购物、餐饮及娱乐体验',
          '又一城是位於九龍塘的大型購物中心，提供時尚購物、餐飲及娛樂體驗',
          'Festival Walk is a premier shopping mall in Kowloon Tong offering fashion, dining and entertainment',
        ),
        address: ml(
          '香港九龙塘达之路80号',
          '香港九龍塘達之路80號',
          '80 Tat Chee Avenue, Kowloon Tong, Hong Kong',
        ),
        logo: '/assets/logos/festival-walk.png',
        coverImage: '/assets/covers/festival-walk.jpg',
        latitude: 22.3374,
        longitude: 114.1747,
        phone: '+852-2844-2222',
        email: 'info@festivalwalk.com.hk',
        settings: {
          openingHours: { weekday: '10:00-22:00', weekend: '10:00-22:00' },
          facilities: ['parking', 'baby_care', 'atm', 'customer_service', 'ice_rink'],
          dataSyncMode: 'GROUP_SYNC',
        },
        dataSyncMode: DataSyncMode.GROUP_SYNC,
        region: 'Kowloon',
        isActive: true,
      },
      {
        id: PROJECT_T_TOWN_ID,
        groupId: GROUP_ID,
        code: 'T_TOWN',
        name: ml('T Town', 'T Town', 'T Town'),
        description: ml(
          'T Town是领展旗下位于天水围的社区购物中心',
          'T Town是領展旗下位於天水圍的社區購物中心',
          'T Town is a community shopping centre in Tin Shui Wai under Link REIT',
        ),
        address: ml(
          '香港新界天水围天华路33号',
          '香港新界天水圍天華路33號',
          '33 Tin Wa Road, Tin Shui Wai, New Territories, Hong Kong',
        ),
        logo: '/assets/logos/t-town.png',
        coverImage: '/assets/covers/t-town.jpg',
        latitude: 22.4531,
        longitude: 114.0027,
        phone: '+852-2123-4567',
        email: 'info@ttown.com.hk',
        settings: {
          openingHours: { weekday: '09:00-22:00', weekend: '09:00-22:00' },
          facilities: ['parking', 'baby_care', 'atm', 'customer_service'],
          dataSyncMode: 'LOCAL_ONLY',
        },
        dataSyncMode: DataSyncMode.LOCAL_ONLY,
        region: 'New Territories',
        isActive: true,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Seed: Member Tiers
// ---------------------------------------------------------------------------
async function seedMemberTiers() {
  console.log('Seeding member tiers...');

  await prisma.memberTier.createMany({
    data: [
      {
        id: TIER_STANDARD_ID,
        groupId: GROUP_ID,
        code: 'STANDARD',
        name: ml('普通会员', '普通會員', 'Standard'),
        description: ml('基础会员等级', '基礎會員等級', 'Basic membership tier'),
        level: 1,
        minStamps: 0,
        maxStamps: 99,
        benefits: {
          parkingDiscount: 0,
          birthdayBonus: 5,
          welcomeStamps: 10,
          exclusiveEvents: false,
          loungeAccess: false,
          personalShopper: false,
        },
        cardDesign: {
          backgroundColor: '#808080',
          textColor: '#FFFFFF',
          template: 'standard',
          backgroundImage: '/assets/cards/standard-bg.png',
        },
        stampMultiplier: 1.0,
        icon: '/assets/icons/tier-standard.png',
        color: '#808080',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: TIER_SILVER_ID,
        groupId: GROUP_ID,
        code: 'SILVER',
        name: ml('银卡会员', '銀卡會員', 'Silver'),
        description: ml('银卡会员享有更多优惠', '銀卡會員享有更多優惠', 'Silver members enjoy more benefits'),
        level: 2,
        minStamps: 100,
        maxStamps: 299,
        benefits: {
          parkingDiscount: 10,
          birthdayBonus: 15,
          welcomeStamps: 20,
          exclusiveEvents: false,
          loungeAccess: false,
          personalShopper: false,
        },
        cardDesign: {
          backgroundColor: '#C0C0C0',
          textColor: '#333333',
          template: 'silver',
          backgroundImage: '/assets/cards/silver-bg.png',
        },
        stampMultiplier: 1.0,
        icon: '/assets/icons/tier-silver.png',
        color: '#C0C0C0',
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
      {
        id: TIER_GOLD_ID,
        groupId: GROUP_ID,
        code: 'GOLD',
        name: ml('金卡会员', '金卡會員', 'Gold'),
        description: ml(
          '金卡会员享有专属活动及更多优惠',
          '金卡會員享有專屬活動及更多優惠',
          'Gold members enjoy exclusive events and more benefits',
        ),
        level: 3,
        minStamps: 300,
        maxStamps: 599,
        benefits: {
          parkingDiscount: 20,
          birthdayBonus: 30,
          welcomeStamps: 50,
          exclusiveEvents: true,
          loungeAccess: false,
          personalShopper: false,
          priorityParking: true,
        },
        cardDesign: {
          backgroundColor: '#FFD700',
          textColor: '#333333',
          template: 'gold',
          backgroundImage: '/assets/cards/gold-bg.png',
        },
        stampMultiplier: 1.2,
        icon: '/assets/icons/tier-gold.png',
        color: '#FFD700',
        isDefault: false,
        isActive: true,
        sortOrder: 3,
      },
      {
        id: TIER_PLATINUM_ID,
        groupId: GROUP_ID,
        code: 'PLATINUM',
        name: ml('白金卡会员', '白金卡會員', 'Platinum'),
        description: ml(
          '白金卡会员享有贵宾室及专属礼遇',
          '白金卡會員享有貴賓室及專屬禮遇',
          'Platinum members enjoy lounge access and exclusive privileges',
        ),
        level: 4,
        minStamps: 600,
        maxStamps: 999,
        benefits: {
          parkingDiscount: 30,
          birthdayBonus: 50,
          welcomeStamps: 100,
          exclusiveEvents: true,
          loungeAccess: true,
          personalShopper: false,
          priorityParking: true,
          freeWrapping: true,
        },
        cardDesign: {
          backgroundColor: '#E5E4E2',
          textColor: '#333333',
          template: 'platinum',
          backgroundImage: '/assets/cards/platinum-bg.png',
        },
        stampMultiplier: 1.5,
        icon: '/assets/icons/tier-platinum.png',
        color: '#E5E4E2',
        isDefault: false,
        isActive: true,
        sortOrder: 4,
      },
      {
        id: TIER_DIAMOND_ID,
        groupId: GROUP_ID,
        code: 'DIAMOND',
        name: ml('钻石卡会员', '鑽石卡會員', 'Diamond'),
        description: ml(
          '钻石卡会员尊享最高级别礼遇，包括私人购物顾问',
          '鑽石卡會員尊享最高級別禮遇，包括私人購物顧問',
          'Diamond members enjoy the highest level of privileges including personal shopping consultant',
        ),
        level: 5,
        minStamps: 1000,
        maxStamps: null,
        benefits: {
          parkingDiscount: 50,
          birthdayBonus: 100,
          welcomeStamps: 200,
          exclusiveEvents: true,
          loungeAccess: true,
          personalShopper: true,
          priorityParking: true,
          freeWrapping: true,
          vipParking: true,
          conciergeService: true,
        },
        cardDesign: {
          backgroundColor: '#B9F2FF',
          textColor: '#1A1A2E',
          template: 'diamond',
          backgroundImage: '/assets/cards/diamond-bg.png',
        },
        stampMultiplier: 2.0,
        icon: '/assets/icons/tier-diamond.png',
        color: '#B9F2FF',
        isDefault: false,
        isActive: true,
        sortOrder: 5,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Seed: Permissions
// ---------------------------------------------------------------------------
async function seedPermissions() {
  console.log('Seeding permissions...');

  const permissionsData = [
    // Dashboard
    {
      id: PERM_DASHBOARD_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'dashboard',
      name: ml('仪表盘', '儀表板', 'Dashboard'),
      module: 'dashboard',
      type: 'menu',
      sortOrder: 1,
    },

    // Member management
    {
      id: PERM_MEMBER_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'member',
      name: ml('会员管理', '會員管理', 'Member Management'),
      module: 'member',
      type: 'menu',
      sortOrder: 10,
    },
    {
      id: PERM_MEMBER_LIST_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:list',
      name: ml('会员列表', '會員列表', 'Member List'),
      module: 'member',
      type: 'menu',
      sortOrder: 11,
    },
    {
      id: PERM_MEMBER_CREATE_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:create',
      name: ml('创建会员', '建立會員', 'Create Member'),
      module: 'member',
      type: 'button',
      sortOrder: 12,
    },
    {
      id: PERM_MEMBER_EDIT_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:edit',
      name: ml('编辑会员', '編輯會員', 'Edit Member'),
      module: 'member',
      type: 'button',
      sortOrder: 13,
    },
    {
      id: PERM_MEMBER_DELETE_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:delete',
      name: ml('删除会员', '刪除會員', 'Delete Member'),
      module: 'member',
      type: 'button',
      sortOrder: 14,
    },
    {
      id: PERM_MEMBER_IMPORT_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:import',
      name: ml('导入会员', '匯入會員', 'Import Members'),
      module: 'member',
      type: 'button',
      sortOrder: 15,
    },
    {
      id: PERM_MEMBER_EXPORT_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:export',
      name: ml('导出会员', '匯出會員', 'Export Members'),
      module: 'member',
      type: 'button',
      sortOrder: 16,
    },
    {
      id: PERM_MEMBER_TIER_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:tier',
      name: ml('会员等级管理', '會員等級管理', 'Member Tier Management'),
      module: 'member',
      type: 'menu',
      sortOrder: 17,
    },
    {
      id: PERM_MEMBER_LABEL_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:label',
      name: ml('会员标签管理', '會員標籤管理', 'Member Label Management'),
      module: 'member',
      type: 'menu',
      sortOrder: 18,
    },
    {
      id: PERM_MEMBER_SPECIAL_LIST_ID,
      groupId: GROUP_ID,
      parentId: PERM_MEMBER_ID,
      code: 'member:special_list',
      name: ml('黑白名单管理', '黑白名單管理', 'Special List Management'),
      module: 'member',
      type: 'menu',
      sortOrder: 19,
    },

    // Stamp management
    {
      id: PERM_STAMP_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'stamp',
      name: ml('印花管理', '印花管理', 'Stamp Management'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 20,
    },
    {
      id: PERM_STAMP_ACCOUNT_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:account',
      name: ml('印花账户', '印花帳戶', 'Stamp Accounts'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 21,
    },
    {
      id: PERM_STAMP_TRANSACTION_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:transaction',
      name: ml('印花交易记录', '印花交易記錄', 'Stamp Transactions'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 22,
    },
    {
      id: PERM_STAMP_ADJUST_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:adjust',
      name: ml('印花调整', '印花調整', 'Stamp Adjustment'),
      module: 'stamp',
      type: 'button',
      sortOrder: 23,
    },
    {
      id: PERM_STAMP_EARNING_RULE_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:earning_rule',
      name: ml('印花获取规则', '印花獲取規則', 'Stamp Earning Rules'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 24,
    },
    {
      id: PERM_STAMP_CONSUMPTION_RULE_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:consumption_rule',
      name: ml('印花使用规则', '印花使用規則', 'Stamp Consumption Rules'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 25,
    },
    {
      id: PERM_STAMP_EXPIRY_RULE_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:expiry_rule',
      name: ml('印花过期规则', '印花過期規則', 'Stamp Expiry Rules'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 26,
    },
    {
      id: PERM_STAMP_LIMIT_RULE_ID,
      groupId: GROUP_ID,
      parentId: PERM_STAMP_ID,
      code: 'stamp:limit_rule',
      name: ml('印花上限规则', '印花上限規則', 'Stamp Upper Limit Rules'),
      module: 'stamp',
      type: 'menu',
      sortOrder: 27,
    },

    // Merchant management
    {
      id: PERM_MERCHANT_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'merchant',
      name: ml('商户管理', '商戶管理', 'Merchant Management'),
      module: 'merchant',
      type: 'menu',
      sortOrder: 30,
    },
    {
      id: PERM_MERCHANT_LIST_ID,
      groupId: GROUP_ID,
      parentId: PERM_MERCHANT_ID,
      code: 'merchant:list',
      name: ml('商户列表', '商戶列表', 'Merchant List'),
      module: 'merchant',
      type: 'menu',
      sortOrder: 31,
    },
    {
      id: PERM_MERCHANT_CREATE_ID,
      groupId: GROUP_ID,
      parentId: PERM_MERCHANT_ID,
      code: 'merchant:create',
      name: ml('创建商户', '建立商戶', 'Create Merchant'),
      module: 'merchant',
      type: 'button',
      sortOrder: 32,
    },
    {
      id: PERM_MERCHANT_EDIT_ID,
      groupId: GROUP_ID,
      parentId: PERM_MERCHANT_ID,
      code: 'merchant:edit',
      name: ml('编辑商户', '編輯商戶', 'Edit Merchant'),
      module: 'merchant',
      type: 'button',
      sortOrder: 33,
    },

    // Campaign management
    {
      id: PERM_CAMPAIGN_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'campaign',
      name: ml('活动管理', '活動管理', 'Campaign Management'),
      module: 'campaign',
      type: 'menu',
      sortOrder: 40,
    },
    {
      id: PERM_CAMPAIGN_LIST_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:list',
      name: ml('活动列表', '活動列表', 'Campaign List'),
      module: 'campaign',
      type: 'menu',
      sortOrder: 41,
    },
    {
      id: PERM_CAMPAIGN_CREATE_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:create',
      name: ml('创建活动', '建立活動', 'Create Campaign'),
      module: 'campaign',
      type: 'button',
      sortOrder: 42,
    },
    {
      id: PERM_CAMPAIGN_EDIT_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:edit',
      name: ml('编辑活动', '編輯活動', 'Edit Campaign'),
      module: 'campaign',
      type: 'button',
      sortOrder: 43,
    },
    {
      id: PERM_CAMPAIGN_APPROVE_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:approve',
      name: ml('审批活动', '審批活動', 'Approve Campaign'),
      module: 'campaign',
      type: 'button',
      sortOrder: 44,
    },
    {
      id: PERM_COUPON_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:coupon',
      name: ml('优惠券管理', '優惠券管理', 'Coupon Management'),
      module: 'campaign',
      type: 'menu',
      sortOrder: 45,
    },
    {
      id: PERM_LUCKY_DRAW_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:lucky_draw',
      name: ml('抽奖管理', '抽獎管理', 'Lucky Draw Management'),
      module: 'campaign',
      type: 'menu',
      sortOrder: 46,
    },
    {
      id: PERM_GIFT_ID,
      groupId: GROUP_ID,
      parentId: PERM_CAMPAIGN_ID,
      code: 'campaign:gift',
      name: ml('礼品管理', '禮品管理', 'Gift Management'),
      module: 'campaign',
      type: 'menu',
      sortOrder: 47,
    },

    // Content management
    {
      id: PERM_CONTENT_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'content',
      name: ml('内容管理', '內容管理', 'Content Management'),
      module: 'content',
      type: 'menu',
      sortOrder: 50,
    },
    {
      id: PERM_CONTENT_ARTICLE_ID,
      groupId: GROUP_ID,
      parentId: PERM_CONTENT_ID,
      code: 'content:article',
      name: ml('文章管理', '文章管理', 'Article Management'),
      module: 'content',
      type: 'menu',
      sortOrder: 51,
    },
    {
      id: PERM_CONTENT_BANNER_ID,
      groupId: GROUP_ID,
      parentId: PERM_CONTENT_ID,
      code: 'content:banner',
      name: ml('横幅管理', '橫幅管理', 'Banner Management'),
      module: 'content',
      type: 'menu',
      sortOrder: 52,
    },
    {
      id: PERM_CONTENT_VENUE_ID,
      groupId: GROUP_ID,
      parentId: PERM_CONTENT_ID,
      code: 'content:venue',
      name: ml('场地管理', '場地管理', 'Venue Management'),
      module: 'content',
      type: 'menu',
      sortOrder: 53,
    },

    // Notification
    {
      id: PERM_NOTIFICATION_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'notification',
      name: ml('消息通知', '訊息通知', 'Notifications'),
      module: 'notification',
      type: 'menu',
      sortOrder: 60,
    },

    // System management
    {
      id: PERM_SYSTEM_ID,
      groupId: GROUP_ID,
      parentId: null,
      code: 'system',
      name: ml('系统管理', '系統管理', 'System Management'),
      module: 'system',
      type: 'menu',
      sortOrder: 90,
    },
    {
      id: PERM_SYSTEM_ROLE_ID,
      groupId: GROUP_ID,
      parentId: PERM_SYSTEM_ID,
      code: 'system:role',
      name: ml('角色管理', '角色管理', 'Role Management'),
      module: 'system',
      type: 'menu',
      sortOrder: 91,
    },
    {
      id: PERM_SYSTEM_USER_ID,
      groupId: GROUP_ID,
      parentId: PERM_SYSTEM_ID,
      code: 'system:user',
      name: ml('用户管理', '使用者管理', 'User Management'),
      module: 'system',
      type: 'menu',
      sortOrder: 92,
    },
    {
      id: PERM_SYSTEM_AUDIT_ID,
      groupId: GROUP_ID,
      parentId: PERM_SYSTEM_ID,
      code: 'system:audit',
      name: ml('审计日志', '稽核日誌', 'Audit Logs'),
      module: 'system',
      type: 'menu',
      sortOrder: 93,
    },
    {
      id: PERM_SYSTEM_INTERFACE_ID,
      groupId: GROUP_ID,
      parentId: PERM_SYSTEM_ID,
      code: 'system:interface',
      name: ml('接口监控', '介面監控', 'Interface Monitor'),
      module: 'system',
      type: 'menu',
      sortOrder: 94,
    },
    {
      id: PERM_SYSTEM_REPORT_ID,
      groupId: GROUP_ID,
      parentId: PERM_SYSTEM_ID,
      code: 'system:report',
      name: ml('报表下载', '報表下載', 'Report Downloads'),
      module: 'system',
      type: 'menu',
      sortOrder: 95,
    },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.create({ data: perm });
  }
}

// ---------------------------------------------------------------------------
// Seed: Roles
// ---------------------------------------------------------------------------
async function seedRoles() {
  console.log('Seeding roles...');

  // Collect all permission codes for super admin
  const allPermissions = await prisma.permission.findMany({
    where: { groupId: GROUP_ID },
    select: { code: true },
  });
  const allPermCodes = allPermissions.map((p) => p.code);

  // Group admin: everything except system management internals
  const groupAdminCodes = allPermCodes.filter((c) => c !== 'system:interface');

  // Project admin: member, stamp, merchant, campaign, content, notification
  const projectAdminCodes = allPermCodes.filter(
    (c) =>
      c.startsWith('dashboard') ||
      c.startsWith('member') ||
      c.startsWith('stamp') ||
      c.startsWith('merchant') ||
      c.startsWith('campaign') ||
      c.startsWith('content') ||
      c.startsWith('notification'),
  );

  // Merchant admin: limited set
  const merchantAdminCodes = [
    'dashboard',
    'stamp:transaction',
    'merchant:list',
    'merchant:edit',
  ];

  // Customer service: member and stamp viewing
  const customerServiceCodes = [
    'dashboard',
    'member:list',
    'member:edit',
    'member:special_list',
    'stamp:account',
    'stamp:transaction',
    'stamp:adjust',
    'campaign:coupon',
    'campaign:gift',
  ];

  await prisma.role.createMany({
    data: [
      {
        id: ROLE_SUPER_ADMIN_ID,
        groupId: GROUP_ID,
        code: 'SUPER_ADMIN',
        name: ml('超级管理员', '超級管理員', 'Super Admin'),
        description: ml(
          '系统最高权限，可管理所有功能和数据',
          '系統最高權限，可管理所有功能和資料',
          'Full system access to all features and data',
        ),
        permissionCodes: allPermCodes,
        isSystem: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: ROLE_GROUP_ADMIN_ID,
        groupId: GROUP_ID,
        code: 'GROUP_ADMIN',
        name: ml('集团管理员', '集團管理員', 'Group Admin'),
        description: ml(
          '集团级别管理员，可管理所有项目',
          '集團級別管理員，可管理所有項目',
          'Group-level administrator managing all projects',
        ),
        permissionCodes: groupAdminCodes,
        isSystem: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        id: ROLE_PROJECT_ADMIN_ID,
        groupId: GROUP_ID,
        code: 'PROJECT_ADMIN',
        name: ml('项目管理员', '項目管理員', 'Project Admin'),
        description: ml(
          '项目/商场级别管理员，管理单个商场',
          '項目/商場級別管理員，管理單個商場',
          'Project/mall-level administrator managing a single mall',
        ),
        permissionCodes: projectAdminCodes,
        isSystem: true,
        isActive: true,
        sortOrder: 3,
      },
      {
        id: ROLE_MERCHANT_ADMIN_ID,
        groupId: GROUP_ID,
        code: 'MERCHANT_ADMIN',
        name: ml('商户管理员', '商戶管理員', 'Merchant Admin'),
        description: ml(
          '商户管理员，管理商户自身的数据和印花操作',
          '商戶管理員，管理商戶自身的資料和印花操作',
          'Merchant administrator managing their own data and stamp operations',
        ),
        permissionCodes: merchantAdminCodes,
        isSystem: true,
        isActive: true,
        sortOrder: 4,
      },
      {
        id: ROLE_CUSTOMER_SERVICE_ID,
        groupId: GROUP_ID,
        code: 'CUSTOMER_SERVICE',
        name: ml('客服人员', '客服人員', 'Customer Service'),
        description: ml(
          '客服人员，处理会员咨询和印花调整',
          '客服人員，處理會員諮詢和印花調整',
          'Customer service staff handling member inquiries and stamp adjustments',
        ),
        permissionCodes: customerServiceCodes,
        isSystem: true,
        isActive: true,
        sortOrder: 5,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Seed: Stamp Earning Rules
// ---------------------------------------------------------------------------
async function seedStampEarningRules() {
  console.log('Seeding stamp earning rules...');

  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  await prisma.stampEarningRule.createMany({
    data: [
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null, // Group-wide
        code: 'BASE_EARNING',
        name: ml('基础消费获取印花', '基礎消費獲取印花', 'Base Spending Stamp Earning'),
        description: ml(
          '每消费港币200元即可获得1个印花（适用于所有参与商户）',
          '每消費港幣200元即可獲得1個印花（適用於所有參與商戶）',
          'Earn 1 stamp for every HKD 200 spent at participating merchants',
        ),
        spendingPerStamp: 200,
        minSpending: 50,
        maxStampsPerTx: 50,
        merchantCategories: null,
        merchantIds: [],
        applicableTierIds: [],
        applicableDays: [],
        roundingMode: 'floor',
        priority: 0,
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: now,
        effectiveTo: oneYearLater,
        ruleConfig: {
          description: 'Default earning rule for all malls',
          includeServiceCharge: false,
          includeTips: false,
          receiptRequired: true,
          maxReceiptAge: 7, // days
        },
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: PROJECT_FESTIVAL_WALK_ID,
        code: 'FW_DINING_BONUS',
        name: ml(
          '又一城餐饮额外印花',
          '又一城餐飲額外印花',
          'Festival Walk Dining Bonus Stamps',
        ),
        description: ml(
          '于又一城餐饮商户消费，每港币150元即可获得1个印花',
          '於又一城餐飲商戶消費，每港幣150元即可獲得1個印花',
          'Earn 1 stamp for every HKD 150 spent at Festival Walk dining merchants',
        ),
        spendingPerStamp: 150,
        minSpending: 50,
        maxStampsPerTx: 30,
        merchantCategories: { include: ['F&B', 'Restaurant', 'Cafe'] },
        merchantIds: [],
        applicableTierIds: [],
        applicableDays: [],
        roundingMode: 'floor',
        priority: 10,
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: now,
        effectiveTo: oneYearLater,
        ruleConfig: {
          description: 'Better earning rate for dining at Festival Walk',
          overrideBaseRule: true,
          receiptRequired: true,
        },
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null,
        code: 'WEEKEND_BONUS',
        name: ml('周末双倍印花', '週末雙倍印花', 'Weekend Double Stamps'),
        description: ml(
          '周六、周日消费可获双倍印花',
          '週六、週日消費可獲雙倍印花',
          'Earn double stamps on Saturday and Sunday',
        ),
        spendingPerStamp: 100, // Effectively HKD 100 per stamp (double the base)
        minSpending: 50,
        maxStampsPerTx: 100,
        merchantCategories: null,
        merchantIds: [],
        applicableTierIds: [],
        applicableDays: [0, 6], // Sunday = 0, Saturday = 6
        roundingMode: 'floor',
        priority: 20,
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: now,
        effectiveTo: oneYearLater,
        ruleConfig: {
          description: 'Weekend promotion - double stamps',
          overrideBaseRule: true,
          receiptRequired: true,
        },
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: PROJECT_T_TOWN_ID,
        code: 'TT_SUPERMARKET',
        name: ml(
          'T Town超市消费印花',
          'T Town超市消費印花',
          'T Town Supermarket Stamps',
        ),
        description: ml(
          '于T Town超市消费，每港币300元即可获得1个印花',
          '於T Town超市消費，每港幣300元即可獲得1個印花',
          'Earn 1 stamp for every HKD 300 spent at T Town supermarkets',
        ),
        spendingPerStamp: 300,
        minSpending: 100,
        maxStampsPerTx: 20,
        merchantCategories: { include: ['Supermarket', 'Grocery'] },
        merchantIds: [],
        applicableTierIds: [],
        applicableDays: [],
        roundingMode: 'floor',
        priority: 10,
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: now,
        effectiveTo: oneYearLater,
        ruleConfig: {
          description: 'Supermarket earning rate at T Town',
          overrideBaseRule: true,
          receiptRequired: true,
        },
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null,
        code: 'GOLD_PLUS_BONUS',
        name: ml(
          '金卡及以上额外印花',
          '金卡及以上額外印花',
          'Gold+ Tier Bonus Stamps',
        ),
        description: ml(
          '金卡、白金卡、钻石卡会员每消费港币150元即可获得1个印花',
          '金卡、白金卡、鑽石卡會員每消費港幣150元即可獲得1個印花',
          'Gold, Platinum and Diamond members earn 1 stamp per HKD 150 spent',
        ),
        spendingPerStamp: 150,
        minSpending: 50,
        maxStampsPerTx: 80,
        merchantCategories: null,
        merchantIds: [],
        applicableTierIds: [TIER_GOLD_ID, TIER_PLATINUM_ID, TIER_DIAMOND_ID],
        applicableDays: [],
        roundingMode: 'floor',
        priority: 5,
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: now,
        effectiveTo: oneYearLater,
        ruleConfig: {
          description: 'Better earning rate for Gold tier and above',
          overrideBaseRule: true,
          receiptRequired: true,
        },
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Seed: Stamp Expiry Rule
// ---------------------------------------------------------------------------
async function seedStampExpiryRule() {
  console.log('Seeding stamp expiry rules...');

  const now = new Date();
  const fiveYearsLater = new Date(now);
  fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);

  await prisma.stampExpiryRule.create({
    data: {
      id: randomUUID(),
      groupId: GROUP_ID,
      projectId: null,
      code: 'DEFAULT_EXPIRY',
      name: ml('默认印花过期规则', '預設印花過期規則', 'Default Stamp Expiry Rule'),
      expiryMode: StampExpiryMode.END_OF_YEAR,
      rollingPeriods: 1,
      gracePeriodDays: 30,
      notifyBeforeExpiry: true,
      notifyDaysBefore: 30,
      status: StampRuleStatus.ACTIVE,
      effectiveFrom: now,
      effectiveTo: fiveYearsLater,
    },
  });
}

// ---------------------------------------------------------------------------
// Seed: Stamp Info
// ---------------------------------------------------------------------------
async function seedStampInfos() {
  console.log('Seeding stamp info...');

  await prisma.stampInfo.createMany({
    data: [
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null,
        code: 'HOW_TO_EARN',
        title: ml('如何赚取印花', '如何賺取印花', 'How to Earn Stamps'),
        content: ml(
          '<p>在参与商户消费满港币200元即可获得1个印花。请在付款后凭电子或纸质收据到服务台或通过App提交，印花将在验证后自动存入您的账户。</p>',
          '<p>在參與商戶消費滿港幣200元即可獲得1個印花。請在付款後憑電子或紙質收據到服務台或透過App提交，印花將在驗證後自動存入您的帳戶。</p>',
          '<p>Earn 1 stamp for every HKD 200 spent at participating merchants. Present your electronic or paper receipt at the service counter or submit via the App after payment. Stamps will be credited automatically after verification.</p>',
        ),
        category: 'guide',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null,
        code: 'STAMP_EXPIRY',
        title: ml('印花有效期', '印花有效期', 'Stamp Validity'),
        content: ml(
          '<p>印花于获取当年的年底过期。例如，2025年1月至12月获取的印花将于2025年12月31日过期，届时将有30天宽限期。请务必在过期前使用您的印花。</p>',
          '<p>印花於獲取當年的年底過期。例如，2025年1月至12月獲取的印花將於2025年12月31日過期，届時將有30天寬限期。請務必在過期前使用您的印花。</p>',
          '<p>Stamps expire at the end of the calendar year in which they were earned. For example, stamps earned between January and December 2025 will expire on 31 December 2025, with a 30-day grace period. Please redeem your stamps before expiry.</p>',
        ),
        category: 'faq',
        sortOrder: 2,
        isActive: true,
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        projectId: null,
        code: 'STAMP_TERMS',
        title: ml('印花条款及细则', '印花條款及細則', 'Stamp Terms & Conditions'),
        content: ml(
          '<p>1. 印花不可转让、不可兑换现金。<br/>2. 印花只能在指定的参与商户获取。<br/>3. 管理方保留随时修改印花计划条款的权利。<br/>4. 如有任何争议，管理方保留最终决定权。</p>',
          '<p>1. 印花不可轉讓、不可兌換現金。<br/>2. 印花只能在指定的參與商戶獲取。<br/>3. 管理方保留隨時修改印花計劃條款的權利。<br/>4. 如有任何爭議，管理方保留最終決定權。</p>',
          '<p>1. Stamps are non-transferable and cannot be exchanged for cash.<br/>2. Stamps can only be earned at designated participating merchants.<br/>3. Management reserves the right to amend the stamp programme terms at any time.<br/>4. In case of any dispute, management reserves the right to make the final decision.</p>',
        ),
        category: 'terms',
        sortOrder: 3,
        isActive: true,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Seed: Notification Templates
// ---------------------------------------------------------------------------
async function seedNotificationTemplates() {
  console.log('Seeding notification templates...');

  await prisma.notificationTemplate.createMany({
    data: [
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        code: 'WELCOME',
        name: ml('欢迎注册', '歡迎註冊', 'Welcome Registration'),
        titleTemplate: ml(
          '欢迎加入{{projectName}}会员计划！',
          '歡迎加入{{projectName}}會員計劃！',
          'Welcome to {{projectName}} Membership!',
        ),
        bodyTemplate: ml(
          '亲爱的{{memberName}}，感谢您注册成为{{projectName}}会员。您已获得{{welcomeStamps}}个欢迎印花！',
          '親愛的{{memberName}}，感謝您註冊成為{{projectName}}會員。您已獲得{{welcomeStamps}}個歡迎印花！',
          'Dear {{memberName}}, thank you for joining {{projectName}} membership. You have received {{welcomeStamps}} welcome stamps!',
        ),
        channels: ['PUSH', 'EMAIL'],
        variables: {
          memberName: { type: 'string', required: true },
          projectName: { type: 'string', required: true },
          welcomeStamps: { type: 'number', required: true },
        },
        category: 'transactional',
        isActive: true,
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        code: 'STAMP_EARNED',
        name: ml('印花获取通知', '印花獲取通知', 'Stamp Earned Notification'),
        titleTemplate: ml(
          '您获得了{{stampAmount}}个印花！',
          '您獲得了{{stampAmount}}個印花！',
          'You earned {{stampAmount}} stamps!',
        ),
        bodyTemplate: ml(
          '您在{{merchantName}}消费港币{{spendingAmount}}元，获得{{stampAmount}}个印花。当前余额：{{balance}}个印花。',
          '您在{{merchantName}}消費港幣{{spendingAmount}}元，獲得{{stampAmount}}個印花。當前餘額：{{balance}}個印花。',
          'You spent HKD {{spendingAmount}} at {{merchantName}} and earned {{stampAmount}} stamps. Current balance: {{balance}} stamps.',
        ),
        channels: ['PUSH', 'IN_APP'],
        variables: {
          stampAmount: { type: 'number', required: true },
          merchantName: { type: 'string', required: true },
          spendingAmount: { type: 'number', required: true },
          balance: { type: 'number', required: true },
        },
        category: 'transactional',
        isActive: true,
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        code: 'STAMP_EXPIRY_REMINDER',
        name: ml('印花到期提醒', '印花到期提醒', 'Stamp Expiry Reminder'),
        titleTemplate: ml(
          '您有{{expiringAmount}}个印花即将过期',
          '您有{{expiringAmount}}個印花即將過期',
          '{{expiringAmount}} stamps expiring soon',
        ),
        bodyTemplate: ml(
          '您有{{expiringAmount}}个印花将于{{expiryDate}}过期，请尽快使用。立即兑换精选礼品或优惠券！',
          '您有{{expiringAmount}}個印花將於{{expiryDate}}過期，請盡快使用。立即兌換精選禮品或優惠券！',
          'You have {{expiringAmount}} stamps expiring on {{expiryDate}}. Redeem them now for gifts or coupons!',
        ),
        channels: ['PUSH', 'SMS', 'EMAIL'],
        variables: {
          expiringAmount: { type: 'number', required: true },
          expiryDate: { type: 'string', required: true },
        },
        category: 'transactional',
        isActive: true,
      },
      {
        id: randomUUID(),
        groupId: GROUP_ID,
        code: 'TIER_UPGRADE',
        name: ml('等级升级通知', '等級升級通知', 'Tier Upgrade Notification'),
        titleTemplate: ml(
          '恭喜！您已升级为{{tierName}}会员',
          '恭喜！您已升級為{{tierName}}會員',
          'Congratulations! You are now a {{tierName}} member',
        ),
        bodyTemplate: ml(
          '恭喜{{memberName}}！您已成功升级为{{tierName}}会员，享受更多专属礼遇。查看您的新权益 →',
          '恭喜{{memberName}}！您已成功升級為{{tierName}}會員，享受更多專屬禮遇。查看您的新權益 →',
          'Congratulations {{memberName}}! You have been upgraded to {{tierName}} membership. Enjoy your new exclusive benefits. View your benefits →',
        ),
        channels: ['PUSH', 'EMAIL', 'IN_APP'],
        variables: {
          memberName: { type: 'string', required: true },
          tierName: { type: 'string', required: true },
        },
        category: 'transactional',
        isActive: true,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  console.log('==============================================');
  console.log('  Link REIT Membership System - Database Seed');
  console.log('==============================================');
  console.log('');

  await seedGroup();
  await seedProjects();
  await seedMemberTiers();
  await seedPermissions();
  await seedRoles();
  await seedStampEarningRules();
  await seedStampExpiryRule();
  await seedStampInfos();
  await seedNotificationTemplates();

  console.log('');
  console.log('Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  Group:              1 (Link REIT)`);
  console.log(`  Projects:           2 (Festival Walk, T Town)`);
  console.log(`  Member Tiers:       5 (Standard, Silver, Gold, Platinum, Diamond)`);
  console.log(`  Permissions:        ${await prisma.permission.count()} items`);
  console.log(`  Roles:              5 (Super Admin, Group Admin, Project Admin, Merchant Admin, Customer Service)`);
  console.log(`  Stamp Earning Rules: ${await prisma.stampEarningRule.count()} rules`);
  console.log(`  Stamp Expiry Rules: ${await prisma.stampExpiryRule.count()} rule`);
  console.log(`  Stamp Info:         ${await prisma.stampInfo.count()} items`);
  console.log(`  Notification Templates: ${await prisma.notificationTemplate.count()} templates`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
