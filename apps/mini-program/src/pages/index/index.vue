<template>
  <view class="home-page">
    <!-- Member Card Section -->
    <view class="section-card-area">
      <MemberCard
        v-if="authStore.isLoggedIn"
        :display-name="authStore.displayName"
        :card-no="authStore.memberCardNo"
        :tier-name="authStore.tierName"
        :tier-level="authStore.tierLevel"
        :stamp-balance="authStore.stampBalance"
        :qr-code-url="authStore.qrCode"
        :background-color="memberCardBg"
        text-color="#FFFFFF"
        @qr-tap="showFullQr"
      />
      <view v-else class="login-prompt card" @tap="goLogin">
        <text class="login-text">{{ t('auth.login') }}</text>
        <text class="login-hint">{{ loginHint }}</text>
      </view>
    </view>

    <!-- Stamp Balance Quick View -->
    <view v-if="authStore.isLoggedIn" class="section-stamp container">
      <StampBalance
        :balance="authStore.stampBalance"
        :month-earned="mockData.monthEarned"
        :month-redeemed="mockData.monthRedeemed"
        :expiring-count="mockData.expiringCount"
        :expiring-days="30"
      />
    </view>

    <!-- Banner Swiper -->
    <view class="section-banner container">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        indicator-color="rgba(0,0,0,0.2)"
        indicator-active-color="#00A651"
        :autoplay="true"
        :interval="4000"
        :circular="true"
      >
        <swiper-item v-for="banner in mockData.banners" :key="banner.id" @tap="onBannerTap(banner)">
          <image class="banner-image" :src="banner.image" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- Quick Actions Grid -->
    <view class="section-actions container">
      <view class="actions-grid">
        <view
          v-for="action in quickActions"
          :key="action.key"
          class="action-item"
          @tap="onActionTap(action.key)"
        >
          <view class="action-icon-wrapper" :style="{ backgroundColor: action.bgColor }">
            <text class="action-icon">{{ action.icon }}</text>
          </view>
          <text class="action-label">{{ action.label }}</text>
        </view>
      </view>
    </view>

    <!-- Active Campaigns -->
    <view class="section-campaigns container">
      <view class="section-header">
        <text class="section-title">{{ campaignsTitle }}</text>
        <text class="section-more" @tap="goOffers">{{ t('common.all') }} &gt;</text>
      </view>
      <scroll-view scroll-x class="campaigns-scroll">
        <view class="campaigns-row">
          <view
            v-for="campaign in mockData.campaigns"
            :key="campaign.id"
            class="campaign-mini-card"
            @tap="goCampaignDetail(campaign.id)"
          >
            <image class="campaign-mini-image" :src="campaign.coverImage" mode="aspectFill" />
            <view class="campaign-mini-info">
              <text class="campaign-mini-name">{{ campaign.name }}</text>
              <text class="campaign-mini-date">{{ campaign.dateRange }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- News Feed -->
    <view class="section-news container">
      <view class="section-header">
        <text class="section-title">{{ newsTitle }}</text>
      </view>
      <view
        v-for="news in mockData.newsFeed"
        :key="news.id"
        class="news-item"
        @tap="goNewsDetail(news.id)"
      >
        <view class="news-text">
          <text class="news-title">{{ news.title }}</text>
          <text class="news-excerpt">{{ news.excerpt }}</text>
          <text class="news-date">{{ news.date }}</text>
        </view>
        <image class="news-image" :src="news.image" mode="aspectFill" />
      </view>
    </view>

    <!-- Bottom safe area -->
    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';
import MemberCard from '@/components/MemberCard.vue';
import StampBalance from '@/components/StampBalance.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();

// Computed labels
const loginHint = computed(() => {
  if (locale.value === 'en') return 'Tap to login and enjoy membership benefits';
  if (locale.value === 'zh-CN') return '点击登录，享受会员权益';
  return '點擊登錄，享受會員權益';
});

const campaignsTitle = computed(() => {
  if (locale.value === 'en') return 'Active Campaigns';
  if (locale.value === 'zh-CN') return '热门活动';
  return '熱門活動';
});

const newsTitle = computed(() => {
  if (locale.value === 'en') return 'Latest News';
  if (locale.value === 'zh-CN') return '最新资讯';
  return '最新資訊';
});

const memberCardBg = computed(() => {
  return authStore.user?.cardBackgroundColor || '#00A651';
});

// Quick actions
const quickActions = computed(() => [
  {
    key: 'scan',
    icon: '\u{1F4F7}',
    label: locale.value === 'en' ? 'Scan for Stamps' : locale.value === 'zh-CN' ? '扫码换印花' : '掃碼換印花',
    bgColor: '#E8F5E9',
  },
  {
    key: 'coupons',
    icon: '\u{1F3AB}',
    label: locale.value === 'en' ? 'My Coupons' : locale.value === 'zh-CN' ? '我的优惠券' : '我的優惠券',
    bgColor: '#FFF3E0',
  },
  {
    key: 'nearby',
    icon: '\u{1F3EC}',
    label: locale.value === 'en' ? 'Nearby Malls' : locale.value === 'zh-CN' ? '附近商场' : '附近商場',
    bgColor: '#E3F2FD',
  },
  {
    key: 'gifts',
    icon: '\u{1F381}',
    label: locale.value === 'en' ? 'Stamp Store' : locale.value === 'zh-CN' ? '印花商城' : '印花商城',
    bgColor: '#FCE4EC',
  },
]);

// Mock data for display
const mockData = reactive({
  monthEarned: 128,
  monthRedeemed: 50,
  expiringCount: 30,
  banners: [
    {
      id: 'b1',
      image: 'https://via.placeholder.com/750x360/00A651/FFFFFF?text=Summer+Campaign',
      linkType: 'campaign',
      linkTarget: 'c1',
    },
    {
      id: 'b2',
      image: 'https://via.placeholder.com/750x360/FF6B35/FFFFFF?text=Double+Stamps',
      linkType: 'campaign',
      linkTarget: 'c2',
    },
    {
      id: 'b3',
      image: 'https://via.placeholder.com/750x360/1976D2/FFFFFF?text=New+Merchants',
      linkType: 'article',
      linkTarget: 'a1',
    },
  ],
  campaigns: [
    {
      id: 'c1',
      name: locale.value === 'en' ? 'Summer Double Stamps' : locale.value === 'zh-CN' ? '夏日双倍印花' : '夏日雙倍印花',
      coverImage: 'https://via.placeholder.com/300x200/00A651/FFFFFF?text=2x+Stamps',
      dateRange: '2025-06-01 - 2025-08-31',
    },
    {
      id: 'c2',
      name: locale.value === 'en' ? 'Lucky Draw Week' : locale.value === 'zh-CN' ? '幸运抽奖周' : '幸運抽獎週',
      coverImage: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Lucky+Draw',
      dateRange: '2025-07-01 - 2025-07-07',
    },
    {
      id: 'c3',
      name: locale.value === 'en' ? 'F&B Festival' : locale.value === 'zh-CN' ? '美食节' : '美食節',
      coverImage: 'https://via.placeholder.com/300x200/E91E63/FFFFFF?text=Food+Fest',
      dateRange: '2025-07-15 - 2025-07-31',
    },
  ],
  newsFeed: [
    {
      id: 'n1',
      title: locale.value === 'en' ? 'New Stores Opening in August' : locale.value === 'zh-CN' ? '八月新店开业' : '八月新店開業',
      excerpt: locale.value === 'en'
        ? 'Discover the latest additions to our mall family with exciting opening offers...'
        : locale.value === 'zh-CN'
          ? '探索我们商场家族的最新成员，享受精彩开业优惠...'
          : '探索我們商場家族的最新成員，享受精彩開業優惠...',
      date: '2025-07-20',
      image: 'https://via.placeholder.com/200x140/F5F5F5/333333?text=News',
    },
    {
      id: 'n2',
      title: locale.value === 'en' ? 'Parking Upgrade Complete' : locale.value === 'zh-CN' ? '停车场升级完成' : '停車場升級完成',
      excerpt: locale.value === 'en'
        ? 'Enhanced parking experience with smart parking system and EV charging stations...'
        : locale.value === 'zh-CN'
          ? '智能停车系统及电动车充电站升级完成，为您带来更优质的泊车体验...'
          : '智能停車系統及電動車充電站升級完成，為您帶來更優質的泊車體驗...',
      date: '2025-07-18',
      image: 'https://via.placeholder.com/200x140/F5F5F5/333333?text=Parking',
    },
  ],
});

// Pull to refresh
onPullDownRefresh(async () => {
  try {
    if (authStore.isLoggedIn) {
      await authStore.fetchUserProfile();
    }
  } finally {
    uni.stopPullDownRefresh();
  }
});

// Share
onShareAppMessage(() => ({
  title: 'Link REIT Membership',
  path: '/pages/index/index',
}));

// Navigation helpers
function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' });
}

function showFullQr() {
  uni.previewImage({
    urls: [authStore.qrCode],
    current: 0,
  });
}

function onBannerTap(banner: { linkType: string; linkTarget: string }) {
  if (banner.linkType === 'campaign') {
    uni.navigateTo({ url: `/pages/offers/campaign-detail?id=${banner.linkTarget}` });
  }
}

function onActionTap(key: string) {
  const routes: Record<string, string> = {
    scan: '/pages/scan/index',
    coupons: '/pages/offers/coupon-list',
    nearby: '/pages/mall/directory',
    gifts: '/pages/offers/gift-catalog',
  };
  const url = routes[key];
  if (url) {
    if (key === 'scan') {
      uni.switchTab({ url });
    } else {
      uni.navigateTo({ url });
    }
  }
}

function goOffers() {
  uni.switchTab({ url: '/pages/offers/index' });
}

function goCampaignDetail(id: string) {
  uni.navigateTo({ url: `/pages/offers/campaign-detail?id=${id}` });
}

function goNewsDetail(id: string) {
  // Navigate to a webview or content page
  uni.showToast({ title: `News ${id}`, icon: 'none' });
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.section-card-area {
  padding: 24rpx 24rpx 0;
}

.login-prompt {
  height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00A651, #007A3D);
  border-radius: 24rpx;
}

.login-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.login-hint {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.section-stamp {
  margin-top: 24rpx;
}

.section-banner {
  margin-top: 24rpx;
}

.banner-swiper {
  height: 320rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
}

.section-actions {
  margin-top: 24rpx;
}

.actions-grid {
  display: flex;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx 16rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
}

.action-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-label {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}

.section-campaigns {
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.section-more {
  font-size: 26rpx;
  color: #00A651;
}

.campaigns-scroll {
  white-space: nowrap;
}

.campaigns-row {
  display: inline-flex;
}

.campaign-mini-card {
  width: 340rpx;
  margin-right: 20rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  display: inline-block;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.campaign-mini-image {
  width: 340rpx;
  height: 200rpx;
}

.campaign-mini-info {
  padding: 16rpx;
}

.campaign-mini-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.campaign-mini-date {
  font-size: 22rpx;
  color: #999999;
}

.section-news {
  margin-top: 24rpx;
  padding-bottom: 24rpx;
}

.news-item {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.news-text {
  flex: 1;
  margin-right: 20rpx;
}

.news-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-excerpt {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  font-size: 22rpx;
  color: #999999;
}

.news-image {
  width: 200rpx;
  height: 140rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.container {
  padding-left: 24rpx;
  padding-right: 24rpx;
}
</style>
