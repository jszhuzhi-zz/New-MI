<template>
  <view class="settings-page">
    <!-- Language Settings -->
    <view class="section">
      <text class="section-label">{{ languageLabel }}</text>
      <LocaleSwitcher />
    </view>

    <!-- Notification Settings -->
    <view class="section">
      <text class="section-label">{{ notificationLabel }}</text>
      <view class="settings-card">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-label">{{ pushNotifLabel }}</text>
            <text class="setting-desc">{{ pushNotifDesc }}</text>
          </view>
          <switch :checked="pushEnabled" color="#00A651" @change="togglePush" />
        </view>
        <view class="divider" />
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-label">{{ campaignNotifLabel }}</text>
            <text class="setting-desc">{{ campaignNotifDesc }}</text>
          </view>
          <switch :checked="campaignEnabled" color="#00A651" @change="toggleCampaign" />
        </view>
        <view class="divider" />
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-label">{{ stampNotifLabel }}</text>
            <text class="setting-desc">{{ stampNotifDesc }}</text>
          </view>
          <switch :checked="stampEnabled" color="#00A651" @change="toggleStamp" />
        </view>
      </view>
    </view>

    <!-- Cache & Data -->
    <view class="section">
      <text class="section-label">{{ dataLabel }}</text>
      <view class="settings-card">
        <view class="setting-item clickable" @tap="clearCache">
          <text class="setting-label">{{ clearCacheLabel }}</text>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
      </view>
    </view>

    <!-- About -->
    <view class="section">
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">{{ versionLabel }}</text>
          <text class="setting-value">v1.0.0</text>
        </view>
        <view class="divider" />
        <view class="setting-item clickable" @tap="goPrivacy">
          <text class="setting-label">{{ privacyLabel }}</text>
          <text class="arrow">&gt;</text>
        </view>
        <view class="divider" />
        <view class="setting-item clickable" @tap="goTerms">
          <text class="setting-label">{{ termsLabel }}</text>
          <text class="arrow">&gt;</text>
        </view>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@/utils/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const { t, locale } = useI18n();

const pushEnabled = ref(true);
const campaignEnabled = ref(true);
const stampEnabled = ref(true);
const cacheSize = ref('2.5 MB');

// Labels
const languageLabel = computed(() => locale.value === 'en' ? 'Language' : locale.value === 'zh-CN' ? '语言设置' : '語言設置');
const notificationLabel = computed(() => locale.value === 'en' ? 'Notifications' : locale.value === 'zh-CN' ? '通知设置' : '通知設置');
const pushNotifLabel = computed(() => locale.value === 'en' ? 'Push Notifications' : locale.value === 'zh-CN' ? '推送通知' : '推送通知');
const pushNotifDesc = computed(() => locale.value === 'en' ? 'Receive system notifications' : locale.value === 'zh-CN' ? '接收系统通知' : '接收系統通知');
const campaignNotifLabel = computed(() => locale.value === 'en' ? 'Campaign Updates' : locale.value === 'zh-CN' ? '活动通知' : '活動通知');
const campaignNotifDesc = computed(() => locale.value === 'en' ? 'New campaigns and promotions' : locale.value === 'zh-CN' ? '新活动和优惠信息' : '新活動和優惠資訊');
const stampNotifLabel = computed(() => locale.value === 'en' ? 'Stamp Updates' : locale.value === 'zh-CN' ? '印花变动' : '印花變動');
const stampNotifDesc = computed(() => locale.value === 'en' ? 'Stamp earning and expiry alerts' : locale.value === 'zh-CN' ? '印花获取和到期提醒' : '印花獲取和到期提醒');
const dataLabel = computed(() => locale.value === 'en' ? 'Data' : locale.value === 'zh-CN' ? '数据' : '數據');
const clearCacheLabel = computed(() => locale.value === 'en' ? 'Clear Cache' : locale.value === 'zh-CN' ? '清除缓存' : '清除緩存');
const versionLabel = computed(() => locale.value === 'en' ? 'Version' : locale.value === 'zh-CN' ? '版本' : '版本');
const privacyLabel = computed(() => locale.value === 'en' ? 'Privacy Policy' : locale.value === 'zh-CN' ? '隐私政策' : '私隱政策');
const termsLabel = computed(() => locale.value === 'en' ? 'Terms of Service' : locale.value === 'zh-CN' ? '服务条款' : '服務條款');

function togglePush(e: any) {
  pushEnabled.value = e.detail.value;
}

function toggleCampaign(e: any) {
  campaignEnabled.value = e.detail.value;
}

function toggleStamp(e: any) {
  stampEnabled.value = e.detail.value;
}

function clearCache() {
  uni.showModal({
    title: clearCacheLabel.value,
    content: locale.value === 'en' ? 'Clear cached data?' : locale.value === 'zh-CN' ? '确定清除缓存数据？' : '確定清除緩存數據？',
    success: (res) => {
      if (res.confirm) {
        cacheSize.value = '0 MB';
        uni.showToast({ title: t('common.success'), icon: 'success' });
      }
    },
  });
}

function goPrivacy() {
  uni.showToast({ title: privacyLabel.value, icon: 'none' });
}

function goTerms() {
  uni.showToast({ title: termsLabel.value, icon: 'none' });
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-label {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.settings-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
}

.setting-item.clickable:active {
  background-color: #F5F6FA;
}

.setting-left {
  flex: 1;
}

.setting-label {
  font-size: 28rpx;
  color: #333333;
  display: block;
}

.setting-desc {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
  display: block;
}

.setting-value {
  font-size: 26rpx;
  color: #999999;
}

.cache-size {
  font-size: 26rpx;
  color: #999999;
}

.arrow {
  font-size: 28rpx;
  color: #CCCCCC;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
  margin: 0 24rpx;
}
</style>
