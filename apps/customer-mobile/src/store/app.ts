import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = 'zh-TW' | 'zh-CN' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppNotificationPrefs {
  pushEnabled: boolean;
  stampUpdates: boolean;
  campaignAlerts: boolean;
  couponReminders: boolean;
  tierUpdates: boolean;
  systemNotices: boolean;
}

export interface AppState {
  // State
  locale: Locale;
  theme: ThemeMode;
  notifications: AppNotificationPrefs;
  isFirstLaunch: boolean;
  lastSyncTimestamp: number | null;
  unreadNotificationCount: number;
  currentMallId: string | null;

  // Actions
  initApp: () => Promise<void>;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setNotificationPrefs: (prefs: Partial<AppNotificationPrefs>) => void;
  setFirstLaunchComplete: () => void;
  setCurrentMall: (mallId: string | null) => void;
  updateUnreadCount: (count: number) => void;
  markSynced: () => void;
}

// ─── i18n Translation Map ────────────────────────────────────────────────────

export const translations: Record<string, Record<Locale, string>> = {
  // Common
  'common.confirm': { 'zh-TW': '確認', 'zh-CN': '确认', en: 'Confirm' },
  'common.cancel': { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
  'common.save': { 'zh-TW': '儲存', 'zh-CN': '保存', en: 'Save' },
  'common.loading': { 'zh-TW': '載入中...', 'zh-CN': '加载中...', en: 'Loading...' },
  'common.retry': { 'zh-TW': '重試', 'zh-CN': '重试', en: 'Retry' },
  'common.search': { 'zh-TW': '搜尋', 'zh-CN': '搜索', en: 'Search' },
  'common.noData': { 'zh-TW': '暫無資料', 'zh-CN': '暂无数据', en: 'No data available' },
  'common.viewAll': { 'zh-TW': '查看全部', 'zh-CN': '查看全部', en: 'View All' },
  'common.done': { 'zh-TW': '完成', 'zh-CN': '完成', en: 'Done' },
  'common.next': { 'zh-TW': '下一步', 'zh-CN': '下一步', en: 'Next' },
  'common.back': { 'zh-TW': '返回', 'zh-CN': '返回', en: 'Back' },
  'common.edit': { 'zh-TW': '編輯', 'zh-CN': '编辑', en: 'Edit' },
  'common.delete': { 'zh-TW': '刪除', 'zh-CN': '删除', en: 'Delete' },
  'common.close': { 'zh-TW': '關閉', 'zh-CN': '关闭', en: 'Close' },
  'common.stamps': { 'zh-TW': '印花', 'zh-CN': '印花', en: 'Stamps' },
  'common.points': { 'zh-TW': '積分', 'zh-CN': '积分', en: 'Points' },

  // Auth
  'auth.login': { 'zh-TW': '登入', 'zh-CN': '登录', en: 'Login' },
  'auth.register': { 'zh-TW': '註冊', 'zh-CN': '注册', en: 'Register' },
  'auth.logout': { 'zh-TW': '登出', 'zh-CN': '退出登录', en: 'Logout' },
  'auth.phone': { 'zh-TW': '手機號碼', 'zh-CN': '手机号码', en: 'Phone Number' },
  'auth.phonePlaceholder': { 'zh-TW': '請輸入手機號碼', 'zh-CN': '请输入手机号码', en: 'Enter phone number' },
  'auth.otp': { 'zh-TW': '驗證碼', 'zh-CN': '验证码', en: 'Verification Code' },
  'auth.otpPlaceholder': { 'zh-TW': '請輸入驗證碼', 'zh-CN': '请输入验证码', en: 'Enter verification code' },
  'auth.sendOtp': { 'zh-TW': '發送驗證碼', 'zh-CN': '发送验证码', en: 'Send Code' },
  'auth.resendOtp': { 'zh-TW': '重新發送', 'zh-CN': '重新发送', en: 'Resend' },
  'auth.loginWithWechat': { 'zh-TW': '微信登入', 'zh-CN': '微信登录', en: 'Login with WeChat' },
  'auth.loginWithApple': { 'zh-TW': 'Apple 登入', 'zh-CN': 'Apple 登录', en: 'Sign in with Apple' },
  'auth.forgotPassword': { 'zh-TW': '忘記密碼', 'zh-CN': '忘记密码', en: 'Forgot Password' },
  'auth.noAccount': { 'zh-TW': '沒有帳戶？', 'zh-CN': '没有账户？', en: "Don't have an account?" },
  'auth.hasAccount': { 'zh-TW': '已有帳戶？', 'zh-CN': '已有账户？', en: 'Already have an account?' },
  'auth.agreeTerms': { 'zh-TW': '我同意服務條款及私隱政策', 'zh-CN': '我同意服务条款及隐私政策', en: 'I agree to the Terms of Service and Privacy Policy' },
  'auth.agreeMarketing': { 'zh-TW': '我同意接收推廣資訊', 'zh-CN': '我同意接收推广信息', en: 'I agree to receive marketing communications' },
  'auth.welcomeTitle': { 'zh-TW': '歡迎加入領展商場', 'zh-CN': '欢迎加入领展商场', en: 'Welcome to Link Mall' },
  'auth.welcomeSubtitle': { 'zh-TW': '享受專屬會員優惠', 'zh-CN': '享受专属会员优惠', en: 'Enjoy exclusive member benefits' },

  // Home
  'home.greeting': { 'zh-TW': '你好', 'zh-CN': '你好', en: 'Hello' },
  'home.memberCard': { 'zh-TW': '會員卡', 'zh-CN': '会员卡', en: 'Member Card' },
  'home.stampBalance': { 'zh-TW': '印花餘額', 'zh-CN': '印花余额', en: 'Stamp Balance' },
  'home.scanReceipt': { 'zh-TW': '掃描小票', 'zh-CN': '扫描小票', en: 'Scan Receipt' },
  'home.myCoupons': { 'zh-TW': '我的優惠券', 'zh-CN': '我的优惠券', en: 'My Coupons' },
  'home.nearbyMall': { 'zh-TW': '附近商場', 'zh-CN': '附近商场', en: 'Nearby Mall' },
  'home.promotions': { 'zh-TW': '最新推廣', 'zh-CN': '最新推广', en: 'Promotions' },
  'home.campaigns': { 'zh-TW': '熱門活動', 'zh-CN': '热门活动', en: 'Campaigns' },
  'home.news': { 'zh-TW': '最新消息', 'zh-CN': '最新消息', en: 'News' },

  // Stamps
  'stamps.title': { 'zh-TW': '我的印花', 'zh-CN': '我的印花', en: 'My Stamps' },
  'stamps.balance': { 'zh-TW': '可用印花', 'zh-CN': '可用印花', en: 'Available Stamps' },
  'stamps.history': { 'zh-TW': '印花紀錄', 'zh-CN': '印花记录', en: 'Stamp History' },
  'stamps.earn': { 'zh-TW': '獲得', 'zh-CN': '获得', en: 'Earned' },
  'stamps.redeem': { 'zh-TW': '兌換', 'zh-CN': '兑换', en: 'Redeemed' },
  'stamps.expire': { 'zh-TW': '過期', 'zh-CN': '过期', en: 'Expired' },
  'stamps.rules': { 'zh-TW': '印花規則', 'zh-CN': '印花规则', en: 'Stamp Rules' },
  'stamps.nextTier': { 'zh-TW': '距下一等級', 'zh-CN': '距下一等级', en: 'To next tier' },
  'stamps.pending': { 'zh-TW': '審核中', 'zh-CN': '审核中', en: 'Pending' },
  'stamps.approved': { 'zh-TW': '已確認', 'zh-CN': '已确认', en: 'Approved' },

  // Scan
  'scan.title': { 'zh-TW': '掃描', 'zh-CN': '扫描', en: 'Scan' },
  'scan.scanReceipt': { 'zh-TW': '拍照換印花', 'zh-CN': '拍照换印花', en: 'Scan Receipt' },
  'scan.showQr': { 'zh-TW': '出示會員碼', 'zh-CN': '出示会员码', en: 'Show Member QR' },
  'scan.scanCoupon': { 'zh-TW': '掃描優惠券', 'zh-CN': '扫描优惠券', en: 'Scan Coupon' },
  'scan.calculating': { 'zh-TW': '計算印花中...', 'zh-CN': '计算印花中...', en: 'Calculating stamps...' },
  'scan.pendingApproval': { 'zh-TW': '等待審核', 'zh-CN': '等待审核', en: 'Pending Approval' },
  'scan.aimCamera': { 'zh-TW': '將相機對準二維碼', 'zh-CN': '将相机对准二维码', en: 'Aim camera at QR code' },

  // Offers
  'offers.title': { 'zh-TW': '優惠活動', 'zh-CN': '优惠活动', en: 'Offers' },
  'offers.campaigns': { 'zh-TW': '活動推廣', 'zh-CN': '活动推广', en: 'Campaigns' },
  'offers.coupons': { 'zh-TW': '優惠券', 'zh-CN': '优惠券', en: 'Coupons' },
  'offers.luckyDraw': { 'zh-TW': '幸運抽獎', 'zh-CN': '幸运抽奖', en: 'Lucky Draw' },
  'offers.gifts': { 'zh-TW': '禮品換購', 'zh-CN': '礼品换购', en: 'Gifts' },
  'offers.active': { 'zh-TW': '進行中', 'zh-CN': '进行中', en: 'Active' },
  'offers.used': { 'zh-TW': '已使用', 'zh-CN': '已使用', en: 'Used' },
  'offers.expired': { 'zh-TW': '已過期', 'zh-CN': '已过期', en: 'Expired' },
  'offers.redeemNow': { 'zh-TW': '立即兌換', 'zh-CN': '立即兑换', en: 'Redeem Now' },
  'offers.stampCost': { 'zh-TW': '所需印花', 'zh-CN': '所需印花', en: 'Stamps Required' },
  'offers.remaining': { 'zh-TW': '剩餘', 'zh-CN': '剩余', en: 'Remaining' },

  // Profile
  'profile.title': { 'zh-TW': '我的', 'zh-CN': '我的', en: 'Profile' },
  'profile.memberSince': { 'zh-TW': '會員自', 'zh-CN': '会员自', en: 'Member since' },
  'profile.editProfile': { 'zh-TW': '編輯資料', 'zh-CN': '编辑资料', en: 'Edit Profile' },
  'profile.tierInfo': { 'zh-TW': '會員等級', 'zh-CN': '会员等级', en: 'Tier Info' },
  'profile.messages': { 'zh-TW': '消息中心', 'zh-CN': '消息中心', en: 'Messages' },
  'profile.favoriteStores': { 'zh-TW': '收藏商戶', 'zh-CN': '收藏商户', en: 'Favorite Stores' },
  'profile.transactionHistory': { 'zh-TW': '交易紀錄', 'zh-CN': '交易记录', en: 'Transaction History' },
  'profile.settings': { 'zh-TW': '設定', 'zh-CN': '设置', en: 'Settings' },
  'profile.helpFaq': { 'zh-TW': '幫助與常見問題', 'zh-CN': '帮助与常见问题', en: 'Help & FAQ' },
  'profile.about': { 'zh-TW': '關於', 'zh-CN': '关于', en: 'About' },
  'profile.name': { 'zh-TW': '姓名', 'zh-CN': '姓名', en: 'Name' },
  'profile.phone': { 'zh-TW': '手機', 'zh-CN': '手机', en: 'Phone' },
  'profile.email': { 'zh-TW': '電郵', 'zh-CN': '邮箱', en: 'Email' },

  // Mall
  'mall.directory': { 'zh-TW': '商場指南', 'zh-CN': '商场指南', en: 'Mall Directory' },
  'mall.floorPlan': { 'zh-TW': '樓層平面圖', 'zh-CN': '楼层平面图', en: 'Floor Plan' },
  'mall.services': { 'zh-TW': '服務指南', 'zh-CN': '服务指南', en: 'Services' },
  'mall.parking': { 'zh-TW': '泊車資訊', 'zh-CN': '停车信息', en: 'Parking' },
  'mall.openingHours': { 'zh-TW': '營業時間', 'zh-CN': '营业时间', en: 'Opening Hours' },

  // Settings
  'settings.language': { 'zh-TW': '語言', 'zh-CN': '语言', en: 'Language' },
  'settings.notifications': { 'zh-TW': '通知', 'zh-CN': '通知', en: 'Notifications' },
  'settings.privacy': { 'zh-TW': '私隱設定', 'zh-CN': '隐私设置', en: 'Privacy Settings' },
  'settings.version': { 'zh-TW': '版本', 'zh-CN': '版本', en: 'Version' },
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  locale: 'zh-TW',
  theme: 'light',
  notifications: {
    pushEnabled: true,
    stampUpdates: true,
    campaignAlerts: true,
    couponReminders: true,
    tierUpdates: true,
    systemNotices: true,
  },
  isFirstLaunch: true,
  lastSyncTimestamp: null,
  unreadNotificationCount: 3,
  currentMallId: null,

  initApp: async () => {
    try {
      // Simulate loading saved preferences from AsyncStorage / SecureStore
      await new Promise((resolve) => setTimeout(resolve, 300));
      // In production, load from storage. For demo, use defaults.
      set({ isFirstLaunch: false });
    } catch (error) {
      console.warn('Failed to init app store:', error);
    }
  },

  setLocale: (locale: Locale) => {
    set({ locale });
  },

  setTheme: (theme: ThemeMode) => {
    set({ theme });
  },

  setNotificationPrefs: (prefs: Partial<AppNotificationPrefs>) => {
    const current = get().notifications;
    set({ notifications: { ...current, ...prefs } });
  },

  setFirstLaunchComplete: () => {
    set({ isFirstLaunch: false });
  },

  setCurrentMall: (mallId: string | null) => {
    set({ currentMallId: mallId });
  },

  updateUnreadCount: (count: number) => {
    set({ unreadNotificationCount: count });
  },

  markSynced: () => {
    set({ lastSyncTimestamp: Date.now() });
  },
}));

// ─── Translation Helper ──────────────────────────────────────────────────────

export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || useAppStore.getState().locale;
  return translations[key]?.[currentLocale] || key;
}
