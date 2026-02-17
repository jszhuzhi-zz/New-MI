import { useSettingsStore, type Locale } from '../store/settings';

type TranslationKeys = {
  // Common
  'common.home': string;
  'common.stamp': string;
  'common.scan': string;
  'common.offers': string;
  'common.profile': string;
  'common.back': string;
  'common.save': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.loading': string;
  'common.success': string;
  'common.error': string;
  'common.viewAll': string;

  // Home
  'home.hello': string;
  'home.member': string;
  'home.availableStamps': string;
  'home.goldMember': string;
  'home.scanCode': string;
  'home.coupons': string;
  'home.mall': string;
  'home.gifts': string;
  'home.hotEvents': string;
  'home.latestNews': string;

  // Scan/Collect
  'scan.title': string;
  'scan.showMemberCode': string;
  'scan.forMerchant': string;
  'scan.scanReceipt': string;
  'scan.scanReceiptQR': string;
  'scan.photoRecognition': string;
  'scan.aiRecognition': string;
  'scan.showCodeToMerchant': string;
  'scan.merchantWillScan': string;
  'scan.pointCamera': string;
  'scan.takePhoto': string;
  'scan.aiTip': string;
  'scan.startScan': string;
  'scan.scanning': string;
  'scan.selectPhoto': string;
  'scan.aiProcessing': string;
  'scan.earnSuccess': string;
  'scan.earnedVia': string;
  'scan.great': string;
  'scan.monthlyEarned': string;
  'scan.transactions': string;
  'scan.recentRecords': string;

  // Profile
  'profile.title': string;
  'profile.editProfile': string;
  'profile.settings': string;
  'profile.language': string;
  'profile.theme': string;
  'profile.myOrders': string;
  'profile.myCoupons': string;
  'profile.myGifts': string;
  'profile.stampHistory': string;
  'profile.help': string;
  'profile.about': string;
  'profile.logout': string;
  'profile.name': string;
  'profile.phone': string;
  'profile.email': string;
  'profile.birthday': string;
  'profile.uploadAvatar': string;
  'profile.registerBirthday': string;
  'profile.completed': string;
  'profile.earnStamps': string;

  // Offers
  'offers.title': string;
  'offers.myCoupons': string;
  'offers.available': string;
  'offers.used': string;
  'offers.expired': string;
  'offers.validUntil': string;
  'offers.useNow': string;

  // Gifts
  'gifts.title': string;
  'gifts.stampMall': string;
  'gifts.search': string;
  'gifts.all': string;
  'gifts.voucher': string;
  'gifts.lifestyle': string;
  'gifts.entertainment': string;
  'gifts.experience': string;
  'gifts.dining': string;
  'gifts.service': string;
  'gifts.popular': string;
  'gifts.redeem': string;
  'gifts.insufficient': string;
  'gifts.confirmRedeem': string;
  'gifts.redeemSuccess': string;
  'gifts.viewCoupon': string;
  'gifts.onlyLeft': string;

  // Settings
  'settings.title': string;
  'settings.languageSettings': string;
  'settings.themeSettings': string;
  'settings.traditionalChinese': string;
  'settings.simplifiedChinese': string;
  'settings.english': string;
  'settings.greenTheme': string;
  'settings.blueTheme': string;
  'settings.purpleTheme': string;
  'settings.goldTheme': string;

  // Messages
  'messages.title': string;
  'messages.noMessages': string;
  'messages.markAllRead': string;
  'messages.system': string;
  'messages.promotion': string;
  'messages.transaction': string;

  // Favorites
  'favorites.title': string;
  'favorites.noFavorites': string;
  'favorites.merchants': string;
  'favorites.campaigns': string;
  'favorites.remove': string;

  // AI Customer Service
  'support.aiService': string;
  'support.askQuestion': string;
  'support.placeholder': string;

  // Profile extras
  'profile.logoutConfirm': string;
  'profile.logoutSuccess': string;
  'profile.featureInDev': string;
  'profile.defaultName': string;
  'profile.goldMember': string;

  // Campaign
  'campaign.details': string;
  'campaign.howToJoin': string;
  'campaign.step': string;
  'campaign.rewards': string;
  'campaign.stampRedeem': string;
  'campaign.freeRedeem': string;
  'campaign.remaining': string;
  'campaign.redeem': string;
  'campaign.participatingMerchants': string;
  'campaign.terms': string;
  'campaign.joined': string;
  'campaign.joinNow': string;
  'campaign.linkCopied': string;
  'campaign.alreadyJoined': string;
  'campaign.confirmJoin': string;
  'campaign.confirmJoinContent': string;
  'campaign.joinSuccess': string;
  'campaign.participantsCount': string;
  'campaign.quota': string;
};

const translations: Record<Locale, TranslationKeys> = {
  'zh-TW': {
    'common.home': '首頁',
    'common.stamp': '印花',
    'common.scan': '掃碼',
    'common.offers': '優惠',
    'common.profile': '我的',
    'common.back': '返回',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '確認',
    'common.loading': '載入中...',
    'common.success': '成功',
    'common.error': '錯誤',
    'common.viewAll': '查看全部',
    'home.hello': '你好',
    'home.member': '會員',
    'home.availableStamps': '可用印花',
    'home.goldMember': 'Gold 金卡',
    'home.scanCode': '掃碼',
    'home.coupons': '優惠券',
    'home.mall': '商場',
    'home.gifts': '禮品',
    'home.hotEvents': '熱門活動',
    'home.latestNews': '最新消息',
    'scan.title': '印花收集',
    'scan.showMemberCode': '出示會員碼',
    'scan.forMerchant': '給商戶掃描',
    'scan.scanReceipt': '掃描小票',
    'scan.scanReceiptQR': '掃描小票二維碼',
    'scan.photoRecognition': '拍照識別',
    'scan.aiRecognition': 'AI自動識別積分',
    'scan.showCodeToMerchant': '出示此碼給商戶掃描',
    'scan.merchantWillScan': '商戶掃描後即可為您累積印花',
    'scan.pointCamera': '將相機對準小票上的二維碼即可獲取印花',
    'scan.takePhoto': '拍攝完整小票，AI自動識別消費金額並積分',
    'scan.aiTip': '請確保小票清晰完整，包含商戶名稱、消費金額和日期',
    'scan.startScan': '開始掃描',
    'scan.scanning': '正在掃描小票上的二維碼...',
    'scan.selectPhoto': '拍照 / 選擇圖片',
    'scan.aiProcessing': 'AI識別中...',
    'scan.earnSuccess': '積分成功！',
    'scan.earnedVia': '通過',
    'scan.great': '太好了',
    'scan.monthlyEarned': '本月獲得',
    'scan.transactions': '交易次數',
    'scan.recentRecords': '最近記錄',
    'profile.title': '我的',
    'profile.editProfile': '編輯資料',
    'profile.settings': '設置',
    'profile.language': '語言',
    'profile.theme': '主題',
    'profile.myOrders': '我的訂單',
    'profile.myCoupons': '我的優惠券',
    'profile.myGifts': '我的禮品',
    'profile.stampHistory': '印花記錄',
    'profile.help': '幫助中心',
    'profile.about': '關於我們',
    'profile.logout': '退出登錄',
    'profile.name': '姓名',
    'profile.phone': '手機號碼',
    'profile.email': '電郵地址',
    'profile.birthday': '生日',
    'profile.uploadAvatar': '上傳頭像',
    'profile.registerBirthday': '登記生日',
    'profile.completed': '已完成',
    'profile.earnStamps': '完善資料賺印花',
    'offers.title': '優惠',
    'offers.myCoupons': '我的優惠券',
    'offers.available': '可用',
    'offers.used': '已使用',
    'offers.expired': '已過期',
    'offers.validUntil': '有效期至',
    'offers.useNow': '立即使用',
    'gifts.title': '禮品',
    'gifts.stampMall': '印花商城',
    'gifts.search': '搜尋禮品',
    'gifts.all': '全部',
    'gifts.voucher': '禮券',
    'gifts.lifestyle': '生活',
    'gifts.entertainment': '娛樂',
    'gifts.experience': '體驗',
    'gifts.dining': '餐飲',
    'gifts.service': '服務',
    'gifts.popular': '熱門兌換',
    'gifts.redeem': '兌換',
    'gifts.insufficient': '不足',
    'gifts.confirmRedeem': '確認兌換',
    'gifts.redeemSuccess': '兌換成功',
    'gifts.viewCoupon': '查看優惠券',
    'gifts.onlyLeft': '僅剩',
    'settings.title': '設置',
    'settings.languageSettings': '語言設置',
    'settings.themeSettings': '主題風格',
    'settings.traditionalChinese': '繁體中文',
    'settings.simplifiedChinese': '简体中文',
    'settings.english': 'English',
    'settings.greenTheme': '森林綠',
    'settings.blueTheme': '海洋藍',
    'settings.purpleTheme': '優雅紫',
    'settings.goldTheme': '尊貴金',
    'messages.title': '消息中心',
    'messages.noMessages': '暫無消息',
    'messages.markAllRead': '全部標記已讀',
    'messages.system': '系統通知',
    'messages.promotion': '優惠推廣',
    'messages.transaction': '交易通知',
    'favorites.title': '我的收藏',
    'favorites.noFavorites': '暫無收藏',
    'favorites.merchants': '商戶',
    'favorites.campaigns': '活動',
    'favorites.remove': '取消收藏',
    'support.aiService': 'AI智能客服',
    'support.askQuestion': '請輸入您的問題',
    'support.placeholder': '例如：如何查詢印花餘額？',
    'profile.logoutConfirm': '確定要退出登入嗎？',
    'profile.logoutSuccess': '已退出登入',
    'profile.featureInDev': '功能開發中',
    'profile.defaultName': '會員',
    'profile.goldMember': 'Gold 金卡會員',
    'campaign.details': '活動詳情',
    'campaign.howToJoin': '如何參加',
    'campaign.step': '步驟',
    'campaign.rewards': '活動獎賞',
    'campaign.stampRedeem': '{stamps} 印花兌換',
    'campaign.freeRedeem': '免費領取',
    'campaign.remaining': '剩餘',
    'campaign.redeem': '兌換',
    'campaign.participatingMerchants': '適用商戶',
    'campaign.terms': '條款及細則',
    'campaign.joined': '已參加',
    'campaign.joinNow': '立即參加',
    'campaign.linkCopied': '已複製活動連結',
    'campaign.alreadyJoined': '您已參加此活動',
    'campaign.confirmJoin': '確認參加',
    'campaign.confirmJoinContent': '確定要參加「{title}」嗎？',
    'campaign.joinSuccess': '成功參加活動！',
    'campaign.participantsCount': '已有 {count} 人參加',
    'campaign.quota': '名額',
  },

  'zh-CN': {
    'common.home': '首页',
    'common.stamp': '印花',
    'common.scan': '扫码',
    'common.offers': '优惠',
    'common.profile': '我的',
    'common.back': '返回',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',
    'common.viewAll': '查看全部',
    'home.hello': '你好',
    'home.member': '会员',
    'home.availableStamps': '可用印花',
    'home.goldMember': 'Gold 金卡',
    'home.scanCode': '扫码',
    'home.coupons': '优惠券',
    'home.mall': '商场',
    'home.gifts': '礼品',
    'home.hotEvents': '热门活动',
    'home.latestNews': '最新消息',
    'scan.title': '印花收集',
    'scan.showMemberCode': '出示会员码',
    'scan.forMerchant': '给商户扫描',
    'scan.scanReceipt': '扫描小票',
    'scan.scanReceiptQR': '扫描小票二维码',
    'scan.photoRecognition': '拍照识别',
    'scan.aiRecognition': 'AI自动识别积分',
    'scan.showCodeToMerchant': '出示此码给商户扫描',
    'scan.merchantWillScan': '商户扫描后即可为您累积印花',
    'scan.pointCamera': '将相机对准小票上的二维码即可获取印花',
    'scan.takePhoto': '拍摄完整小票，AI自动识别消费金额并积分',
    'scan.aiTip': '请确保小票清晰完整，包含商户名称、消费金额和日期',
    'scan.startScan': '开始扫描',
    'scan.scanning': '正在扫描小票上的二维码...',
    'scan.selectPhoto': '拍照 / 选择图片',
    'scan.aiProcessing': 'AI识别中...',
    'scan.earnSuccess': '积分成功！',
    'scan.earnedVia': '通过',
    'scan.great': '太好了',
    'scan.monthlyEarned': '本月获得',
    'scan.transactions': '交易次数',
    'scan.recentRecords': '最近记录',
    'profile.title': '我的',
    'profile.editProfile': '编辑资料',
    'profile.settings': '设置',
    'profile.language': '语言',
    'profile.theme': '主题',
    'profile.myOrders': '我的订单',
    'profile.myCoupons': '我的优惠券',
    'profile.myGifts': '我的礼品',
    'profile.stampHistory': '印花记录',
    'profile.help': '帮助中心',
    'profile.about': '关于我们',
    'profile.logout': '退出登录',
    'profile.name': '姓名',
    'profile.phone': '手机号码',
    'profile.email': '邮箱地址',
    'profile.birthday': '生日',
    'profile.uploadAvatar': '上传头像',
    'profile.registerBirthday': '登记生日',
    'profile.completed': '已完成',
    'profile.earnStamps': '完善资料赚印花',
    'offers.title': '优惠',
    'offers.myCoupons': '我的优惠券',
    'offers.available': '可用',
    'offers.used': '已使用',
    'offers.expired': '已过期',
    'offers.validUntil': '有效期至',
    'offers.useNow': '立即使用',
    'gifts.title': '礼品',
    'gifts.stampMall': '印花商城',
    'gifts.search': '搜索礼品',
    'gifts.all': '全部',
    'gifts.voucher': '礼券',
    'gifts.lifestyle': '生活',
    'gifts.entertainment': '娱乐',
    'gifts.experience': '体验',
    'gifts.dining': '餐饮',
    'gifts.service': '服务',
    'gifts.popular': '热门兑换',
    'gifts.redeem': '兑换',
    'gifts.insufficient': '不足',
    'gifts.confirmRedeem': '确认兑换',
    'gifts.redeemSuccess': '兑换成功',
    'gifts.viewCoupon': '查看优惠券',
    'gifts.onlyLeft': '仅剩',
    'settings.title': '设置',
    'settings.languageSettings': '语言设置',
    'settings.themeSettings': '主题风格',
    'settings.traditionalChinese': '繁體中文',
    'settings.simplifiedChinese': '简体中文',
    'settings.english': 'English',
    'settings.greenTheme': '森林绿',
    'settings.blueTheme': '海洋蓝',
    'settings.purpleTheme': '优雅紫',
    'settings.goldTheme': '尊贵金',
    'messages.title': '消息中心',
    'messages.noMessages': '暂无消息',
    'messages.markAllRead': '全部标记已读',
    'messages.system': '系统通知',
    'messages.promotion': '优惠推广',
    'messages.transaction': '交易通知',
    'favorites.title': '我的收藏',
    'favorites.noFavorites': '暂无收藏',
    'favorites.merchants': '商户',
    'favorites.campaigns': '活动',
    'favorites.remove': '取消收藏',
    'support.aiService': 'AI智能客服',
    'support.askQuestion': '请输入您的问题',
    'support.placeholder': '例如：如何查询印花余额？',
    'profile.logoutConfirm': '确定要退出登录吗？',
    'profile.logoutSuccess': '已退出登录',
    'profile.featureInDev': '功能开发中',
    'profile.defaultName': '会员',
    'profile.goldMember': 'Gold 金卡会员',
    'campaign.details': '活动详情',
    'campaign.howToJoin': '如何参加',
    'campaign.step': '步骤',
    'campaign.rewards': '活动奖赏',
    'campaign.stampRedeem': '{stamps} 印花兑换',
    'campaign.freeRedeem': '免费领取',
    'campaign.remaining': '剩余',
    'campaign.redeem': '兑换',
    'campaign.participatingMerchants': '适用商户',
    'campaign.terms': '条款及细则',
    'campaign.joined': '已参加',
    'campaign.joinNow': '立即参加',
    'campaign.linkCopied': '已复制活动链接',
    'campaign.alreadyJoined': '您已参加此活动',
    'campaign.confirmJoin': '确认参加',
    'campaign.confirmJoinContent': '确定要参加「{title}」吗？',
    'campaign.joinSuccess': '成功参加活动！',
    'campaign.participantsCount': '已有 {count} 人参加',
    'campaign.quota': '名额',
  },

  en: {
    'common.home': 'Home',
    'common.stamp': 'Stamps',
    'common.scan': 'Scan',
    'common.offers': 'Offers',
    'common.profile': 'Profile',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.viewAll': 'View All',
    'home.hello': 'Hello',
    'home.member': 'Member',
    'home.availableStamps': 'Available Stamps',
    'home.goldMember': 'Gold Member',
    'home.scanCode': 'Scan',
    'home.coupons': 'Coupons',
    'home.mall': 'Mall',
    'home.gifts': 'Gifts',
    'home.hotEvents': 'Hot Events',
    'home.latestNews': 'Latest News',
    'scan.title': 'Collect Stamps',
    'scan.showMemberCode': 'Show Member Code',
    'scan.forMerchant': 'For Merchant to Scan',
    'scan.scanReceipt': 'Scan Receipt',
    'scan.scanReceiptQR': 'Scan Receipt QR Code',
    'scan.photoRecognition': 'Photo Recognition',
    'scan.aiRecognition': 'AI Auto Recognition',
    'scan.showCodeToMerchant': 'Show this code to merchant',
    'scan.merchantWillScan': 'Merchant will scan to credit your stamps',
    'scan.pointCamera': 'Point camera at receipt QR code to earn stamps',
    'scan.takePhoto': 'Take photo of receipt for AI to recognize and credit stamps',
    'scan.aiTip': 'Ensure receipt is clear with merchant name, amount, and date',
    'scan.startScan': 'Start Scanning',
    'scan.scanning': 'Scanning receipt QR code...',
    'scan.selectPhoto': 'Take Photo / Select Image',
    'scan.aiProcessing': 'AI Processing...',
    'scan.earnSuccess': 'Stamps Earned!',
    'scan.earnedVia': 'Earned via',
    'scan.great': 'Great!',
    'scan.monthlyEarned': 'Monthly Earned',
    'scan.transactions': 'Transactions',
    'scan.recentRecords': 'Recent Records',
    'profile.title': 'Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.theme': 'Theme',
    'profile.myOrders': 'My Orders',
    'profile.myCoupons': 'My Coupons',
    'profile.myGifts': 'My Gifts',
    'profile.stampHistory': 'Stamp History',
    'profile.help': 'Help Center',
    'profile.about': 'About Us',
    'profile.logout': 'Logout',
    'profile.name': 'Name',
    'profile.phone': 'Phone',
    'profile.email': 'Email',
    'profile.birthday': 'Birthday',
    'profile.uploadAvatar': 'Upload Avatar',
    'profile.registerBirthday': 'Register Birthday',
    'profile.completed': 'Completed',
    'profile.earnStamps': 'Complete profile to earn stamps',
    'offers.title': 'Offers',
    'offers.myCoupons': 'My Coupons',
    'offers.available': 'Available',
    'offers.used': 'Used',
    'offers.expired': 'Expired',
    'offers.validUntil': 'Valid until',
    'offers.useNow': 'Use Now',
    'gifts.title': 'Gifts',
    'gifts.stampMall': 'Stamp Mall',
    'gifts.search': 'Search gifts',
    'gifts.all': 'All',
    'gifts.voucher': 'Voucher',
    'gifts.lifestyle': 'Lifestyle',
    'gifts.entertainment': 'Entertainment',
    'gifts.experience': 'Experience',
    'gifts.dining': 'Dining',
    'gifts.service': 'Service',
    'gifts.popular': 'Popular',
    'gifts.redeem': 'Redeem',
    'gifts.insufficient': 'Insufficient',
    'gifts.confirmRedeem': 'Confirm Redemption',
    'gifts.redeemSuccess': 'Redeemed Successfully',
    'gifts.viewCoupon': 'View Coupon',
    'gifts.onlyLeft': 'Only',
    'settings.title': 'Settings',
    'settings.languageSettings': 'Language Settings',
    'settings.themeSettings': 'Theme Settings',
    'settings.traditionalChinese': '繁體中文',
    'settings.simplifiedChinese': '简体中文',
    'settings.english': 'English',
    'settings.greenTheme': 'Forest Green',
    'settings.blueTheme': 'Ocean Blue',
    'settings.purpleTheme': 'Elegant Purple',
    'settings.goldTheme': 'Premium Gold',
    'messages.title': 'Messages',
    'messages.noMessages': 'No messages',
    'messages.markAllRead': 'Mark all as read',
    'messages.system': 'System',
    'messages.promotion': 'Promotions',
    'messages.transaction': 'Transactions',
    'favorites.title': 'My Favorites',
    'favorites.noFavorites': 'No favorites yet',
    'favorites.merchants': 'Merchants',
    'favorites.campaigns': 'Campaigns',
    'favorites.remove': 'Remove',
    'support.aiService': 'AI Assistant',
    'support.askQuestion': 'Ask a question',
    'support.placeholder': 'e.g., How do I check my stamp balance?',
    'profile.logoutConfirm': 'Are you sure you want to logout?',
    'profile.logoutSuccess': 'Logged out successfully',
    'profile.featureInDev': 'Feature in development',
    'profile.defaultName': 'Member',
    'profile.goldMember': 'Gold Member',
    'campaign.details': 'Campaign Details',
    'campaign.howToJoin': 'How to Join',
    'campaign.step': 'Step',
    'campaign.rewards': 'Rewards',
    'campaign.stampRedeem': '{stamps} stamps to redeem',
    'campaign.freeRedeem': 'Free to redeem',
    'campaign.remaining': 'Remaining',
    'campaign.redeem': 'Redeem',
    'campaign.participatingMerchants': 'Participating Merchants',
    'campaign.terms': 'Terms & Conditions',
    'campaign.joined': 'Joined',
    'campaign.joinNow': 'Join Now',
    'campaign.linkCopied': 'Link copied',
    'campaign.alreadyJoined': 'You have already joined this campaign',
    'campaign.confirmJoin': 'Confirm Join',
    'campaign.confirmJoinContent': 'Are you sure you want to join "{title}"?',
    'campaign.joinSuccess': 'Successfully joined the campaign!',
    'campaign.participantsCount': '{count} participants',
    'campaign.quota': 'Quota',
  },
};

export type TranslationKey = keyof TranslationKeys;

export const useTranslation = () => {
  const locale = useSettingsStore((s) => s.locale);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[locale]?.[key] || translations['zh-TW'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return { t, locale };
};

export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  return translations[locale]?.[key] || translations['zh-TW'][key] || key;
};

export default translations;
