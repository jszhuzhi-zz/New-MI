<template>
  <view class="profile-page">
    <!-- Custom Navigation Bar -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">{{ t('common.details') }}</text>
      </view>
    </view>

    <!-- Profile Header -->
    <view class="profile-header" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
      <view class="profile-info" @tap="goEdit">
        <image
          class="avatar"
          :src="userAvatar"
          mode="aspectFill"
        />
        <view class="user-info">
          <text class="user-name">{{ userName }}</text>
          <view class="tier-row">
            <TierBadge :tier-name="tierName" :tier-level="tierLevel" size="small" />
          </view>
          <text class="member-no">{{ t('member.memberCardNo') }}: {{ memberCardNo }}</text>
        </view>
        <text class="edit-arrow">&gt;</text>
      </view>
    </view>

    <!-- Stats Row -->
    <view class="stats-row">
      <view class="stat-item" @tap="goStamps">
        <text class="stat-value">{{ stampBalance }}</text>
        <text class="stat-label">{{ t('stamp.stampBalance') }}</text>
      </view>
      <view class="stat-item" @tap="goCoupons">
        <text class="stat-value">{{ couponCount }}</text>
        <text class="stat-label">{{ t('campaign.coupon') }}</text>
      </view>
      <view class="stat-item" @tap="goMessages">
        <text class="stat-value">{{ messageCount }}</text>
        <text class="stat-label">{{ messagesLabel }}</text>
      </view>
    </view>

    <!-- Menu Sections -->
    <view class="menu-section">
      <!-- Member -->
      <view class="menu-group">
        <view class="menu-item" @tap="goTier">
          <text class="menu-icon">\u{1F451}</text>
          <text class="menu-label">{{ tierBenefitsLabel }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
        <view class="menu-item" @tap="goFavorites">
          <text class="menu-icon">\u{2764}</text>
          <text class="menu-label">{{ favoritesLabel }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
        <view class="menu-item" @tap="goMessages">
          <text class="menu-icon">\u{1F4E9}</text>
          <text class="menu-label">{{ t('content.messageCenter') }}</text>
          <view v-if="messageCount > 0" class="badge">
            <text class="badge-text">{{ messageCount }}</text>
          </view>
          <text class="menu-arrow">&gt;</text>
        </view>
      </view>

      <!-- Settings -->
      <view class="menu-group">
        <view class="menu-item" @tap="goSettings">
          <text class="menu-icon">\u{2699}</text>
          <text class="menu-label">{{ settingsLabel }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
        <view class="menu-item" @tap="switchLanguage">
          <text class="menu-icon">\u{1F310}</text>
          <text class="menu-label">{{ languageLabel }}</text>
          <text class="menu-value">{{ currentLocaleName }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
      </view>

      <!-- Support -->
      <view class="menu-group">
        <view class="menu-item" @tap="goHelp">
          <text class="menu-icon">\u{2753}</text>
          <text class="menu-label">{{ helpLabel }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
        <view class="menu-item" @tap="goAbout">
          <text class="menu-icon">\u{2139}</text>
          <text class="menu-label">{{ aboutLabel }}</text>
          <text class="menu-arrow">&gt;</text>
        </view>
      </view>

      <!-- Logout -->
      <view class="menu-group">
        <view class="menu-item logout-item" @tap="handleLogout">
          <text class="menu-label logout-text">{{ t('auth.logout') }}</text>
        </view>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/utils/i18n';
import TierBadge from '@/components/TierBadge.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const statusBarHeight = computed(() => appStore.systemInfo.statusBarHeight);

const userAvatar = computed(() => authStore.user?.avatar || 'https://via.placeholder.com/100x100/E0E0E0/999999?text=Avatar');
const userName = computed(() => authStore.displayName || (locale.value === 'en' ? 'Member' : '會員'));
const tierName = computed(() => authStore.tierName || (locale.value === 'en' ? 'Gold' : '金卡'));
const tierLevel = computed(() => authStore.tierLevel || 3);
const memberCardNo = computed(() => authStore.memberCardNo || '8888 0001 2345');
const stampBalance = computed(() => authStore.stampBalance || 568);
const couponCount = computed(() => 3);
const messageCount = computed(() => authStore.unreadCount || 2);
const currentLocaleName = computed(() => appStore.localeName);

// Labels
const messagesLabel = computed(() => locale.value === 'en' ? 'Messages' : locale.value === 'zh-CN' ? '消息' : '消息');
const tierBenefitsLabel = computed(() => locale.value === 'en' ? 'Tier & Benefits' : locale.value === 'zh-CN' ? '等级与权益' : '等級與權益');
const favoritesLabel = computed(() => locale.value === 'en' ? 'Favorites' : locale.value === 'zh-CN' ? '我的收藏' : '我的收藏');
const settingsLabel = computed(() => locale.value === 'en' ? 'Settings' : locale.value === 'zh-CN' ? '设置' : '設置');
const languageLabel = computed(() => locale.value === 'en' ? 'Language' : locale.value === 'zh-CN' ? '语言' : '語言');
const helpLabel = computed(() => locale.value === 'en' ? 'Help & FAQ' : locale.value === 'zh-CN' ? '帮助与FAQ' : '幫助與FAQ');
const aboutLabel = computed(() => locale.value === 'en' ? 'About' : locale.value === 'zh-CN' ? '关于' : '關於');

// Navigation
function goEdit() {
  uni.navigateTo({ url: '/pages/profile/edit' });
}

function goStamps() {
  uni.switchTab({ url: '/pages/stamp/index' });
}

function goCoupons() {
  uni.navigateTo({ url: '/pages/offers/coupon-list' });
}

function goMessages() {
  uni.navigateTo({ url: '/pages/profile/messages' });
}

function goTier() {
  uni.navigateTo({ url: '/pages/profile/tier' });
}

function goFavorites() {
  uni.showToast({ title: favoritesLabel.value, icon: 'none' });
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' });
}

function switchLanguage() {
  uni.navigateTo({ url: '/pages/profile/settings' });
}

function goHelp() {
  uni.showToast({ title: helpLabel.value, icon: 'none' });
}

function goAbout() {
  uni.showToast({ title: 'Link REIT v1.0.0', icon: 'none' });
}

function handleLogout() {
  uni.showModal({
    title: t('auth.logout'),
    content: locale.value === 'en' ? 'Are you sure you want to logout?' : locale.value === 'zh-CN' ? '确定要退出登录吗？' : '確定要退出登錄嗎？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
      }
    },
  });
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #00A651;
  z-index: 100;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.profile-header {
  background: linear-gradient(180deg, #00A651, #00A651 70%, #F5F6FA);
  padding-bottom: 32rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.profile-info {
  display: flex;
  align-items: center;
  padding-top: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  margin-right: 24rpx;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.tier-row {
  margin-bottom: 8rpx;
}

.member-no {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 12rpx;
}

.stats-row {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  margin: -16rpx 24rpx 24rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  border-right: 1rpx solid #F0F0F0;
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #00A651;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #999999;
}

.menu-section {
  padding: 0 24rpx;
}

.menu-group {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 44rpx;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.menu-value {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.menu-arrow {
  font-size: 28rpx;
  color: #CCCCCC;
}

.badge {
  background-color: #FF4444;
  border-radius: 16rpx;
  padding: 0 10rpx;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.badge-text {
  color: #FFFFFF;
  font-size: 20rpx;
}

.logout-item {
  justify-content: center;
}

.logout-text {
  color: #E53935;
  text-align: center;
}
</style>
