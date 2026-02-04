<template>
  <view class="merchant-page">
    <!-- Header Image -->
    <swiper class="merchant-swiper" :indicator-dots="true" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FFFFFF" :autoplay="false">
      <swiper-item v-for="(img, index) in merchant.images" :key="index">
        <image class="merchant-image" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- Merchant Info -->
    <view class="info-section card">
      <view class="name-row">
        <image class="merchant-logo" :src="merchant.logo" mode="aspectFill" />
        <view class="name-info">
          <text class="merchant-name">{{ merchant.name }}</text>
          <text class="merchant-category">{{ merchant.categoryLabel }}</text>
        </view>
        <view v-if="merchant.stampEnabled" class="stamp-badge">
          <text class="stamp-badge-text">{{ merchant.stampMultiplier }}x {{ t('stamp.stamp') }}</text>
        </view>
      </view>
    </view>

    <!-- Details -->
    <view class="details-section card">
      <view class="detail-item">
        <text class="detail-icon">\u{1F4CD}</text>
        <view class="detail-content">
          <text class="detail-label">{{ t('merchant.location') }}</text>
          <text class="detail-value">{{ merchant.floor }}, {{ merchant.unit }}</text>
        </view>
      </view>
      <view class="divider" />
      <view class="detail-item">
        <text class="detail-icon">\u{1F551}</text>
        <view class="detail-content">
          <text class="detail-label">{{ t('merchant.operatingHours') }}</text>
          <text class="detail-value">{{ merchant.weekdayHours }}</text>
          <text class="detail-value sub">{{ weekendLabel }}: {{ merchant.weekendHours }}</text>
        </view>
      </view>
      <view class="divider" />
      <view class="detail-item" @tap="callPhone">
        <text class="detail-icon">\u{1F4DE}</text>
        <view class="detail-content">
          <text class="detail-label">{{ phoneLabel }}</text>
          <text class="detail-value link">{{ merchant.phone }}</text>
        </view>
      </view>
    </view>

    <!-- Description -->
    <view class="description-section card">
      <text class="section-title">{{ aboutLabel }}</text>
      <text class="description-text">{{ merchant.description }}</text>
    </view>

    <!-- Stamp Info -->
    <view v-if="merchant.stampEnabled" class="stamp-section card">
      <text class="section-title">{{ stampInfoLabel }}</text>
      <view class="stamp-info-row">
        <text class="stamp-info-text">{{ stampRuleLabel }}</text>
        <text class="stamp-info-value">{{ merchant.stampRule }}</text>
      </view>
    </view>

    <!-- Action Buttons -->
    <view class="action-section safe-area-bottom">
      <view class="action-btn outline" @tap="goNavigate">
        <text class="action-text outline-text">{{ navigateLabel }}</text>
      </view>
      <view class="action-btn primary" @tap="goScan">
        <text class="action-text primary-text">{{ scanLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';
import { makePhoneCall, openLocation } from '@/services/wechat';

const { t, locale } = useI18n();

// Labels
const weekendLabel = computed(() => locale.value === 'en' ? 'Weekend' : locale.value === 'zh-CN' ? '周末' : '週末');
const phoneLabel = computed(() => locale.value === 'en' ? 'Phone' : locale.value === 'zh-CN' ? '电话' : '電話');
const aboutLabel = computed(() => locale.value === 'en' ? 'About' : locale.value === 'zh-CN' ? '关于' : '關於');
const stampInfoLabel = computed(() => locale.value === 'en' ? 'Stamp Earning' : locale.value === 'zh-CN' ? '印花获取' : '印花獲取');
const stampRuleLabel = computed(() => locale.value === 'en' ? 'Earning rule' : locale.value === 'zh-CN' ? '获取规则' : '獲取規則');
const navigateLabel = computed(() => locale.value === 'en' ? 'Navigate' : locale.value === 'zh-CN' ? '导航' : '導航');
const scanLabel = computed(() => locale.value === 'en' ? 'Scan Receipt' : locale.value === 'zh-CN' ? '扫描小票' : '掃描小票');

const merchant = reactive({
  id: '',
  name: 'Pacific Coffee',
  logo: 'https://via.placeholder.com/100x100/795548/FFFFFF?text=PC',
  categoryLabel: t('merchant.foodBeverage'),
  images: [
    'https://via.placeholder.com/750x400/795548/FFFFFF?text=Store+Photo+1',
    'https://via.placeholder.com/750x400/795548/FFFFFF?text=Store+Photo+2',
  ],
  floor: '1/F',
  unit: 'Unit 101',
  weekdayHours: '08:00 - 22:00',
  weekendHours: '09:00 - 23:00',
  phone: '+852 2345 6789',
  description: locale.value === 'en'
    ? 'Pacific Coffee Company is a Pacific Rim coffeehouse chain founded in Hong Kong. Enjoy premium coffee, specialty beverages, and light meals in a cozy environment.'
    : locale.value === 'zh-CN'
      ? 'Pacific Coffee是源自香港的太平洋沿岸咖啡连锁品牌。在舒适的环境中享用优质咖啡、特色饮品和轻食。'
      : 'Pacific Coffee是源自香港的太平洋沿岸咖啡連鎖品牌。在舒適的環境中享用優質咖啡、特色飲品和輕食。',
  stampEnabled: true,
  stampMultiplier: 1.5,
  stampRule: locale.value === 'en'
    ? 'Earn 1 stamp per HK$50 spent (1.5x multiplier for Gold & above)'
    : locale.value === 'zh-CN'
      ? '每消费HK$50获得1枚印花（金卡及以上享1.5倍倍率）'
      : '每消費HK$50獲得1枚印花（金卡及以上享1.5倍倍率）',
  latitude: 22.4681,
  longitude: 114.0027,
});

onLoad((query) => {
  if (query?.id) {
    merchant.id = query.id;
    // In production: fetch merchant detail by id
  }
});

function callPhone() {
  makePhoneCall(merchant.phone.replace(/\s/g, ''));
}

function goNavigate() {
  openLocation({
    latitude: merchant.latitude,
    longitude: merchant.longitude,
    name: merchant.name,
    address: `${merchant.floor}, ${merchant.unit}`,
  });
}

function goScan() {
  uni.switchTab({ url: '/pages/scan/index' });
}
</script>

<style scoped>
.merchant-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding-bottom: 140rpx;
}

.merchant-swiper {
  height: 400rpx;
}

.merchant-image {
  width: 100%;
  height: 400rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx 24rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-section {
  margin-top: -32rpx;
  position: relative;
  z-index: 1;
}

.name-row {
  display: flex;
  align-items: center;
}

.merchant-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.name-info {
  flex: 1;
}

.merchant-name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 4rpx;
}

.merchant-category {
  font-size: 24rpx;
  color: #00A651;
}

.stamp-badge {
  background: linear-gradient(135deg, #00A651, #00C853);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.stamp-badge-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.detail-item {
  display: flex;
  padding: 16rpx 0;
}

.detail-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.detail-value {
  display: block;
  font-size: 28rpx;
  color: #333333;
}

.detail-value.sub {
  font-size: 24rpx;
  color: #666666;
  margin-top: 2rpx;
}

.detail-value.link {
  color: #00A651;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.description-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
}

.stamp-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stamp-info-text {
  font-size: 26rpx;
  color: #999999;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.stamp-info-value {
  font-size: 26rpx;
  color: #333333;
  text-align: right;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.action-btn {
  flex: 1;
  padding: 22rpx;
  border-radius: 44rpx;
  text-align: center;
}

.action-btn.outline {
  border: 2rpx solid #00A651;
  background: transparent;
}

.action-btn.primary {
  background: linear-gradient(135deg, #00A651, #00C853);
}

.action-text {
  font-size: 28rpx;
  font-weight: 600;
}

.outline-text {
  color: #00A651;
}

.primary-text {
  color: #FFFFFF;
}
</style>
