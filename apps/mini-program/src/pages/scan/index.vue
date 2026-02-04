<template>
  <view class="scan-page">
    <!-- Mode Tabs -->
    <view class="mode-tabs">
      <view
        v-for="mode in modes"
        :key="mode.key"
        class="mode-tab"
        :class="{ active: activeMode === mode.key }"
        @tap="setMode(mode.key)"
      >
        <text class="mode-text">{{ mode.label }}</text>
      </view>
    </view>

    <!-- Scan Receipt Mode -->
    <view v-if="activeMode === 'receipt'" class="scan-section">
      <view class="scan-icon-area">
        <view class="scan-circle" @tap="scanReceipt">
          <text class="scan-main-icon">\u{1F4F7}</text>
        </view>
        <text class="scan-hint">{{ receiptHint }}</text>
      </view>
      <view class="scan-tips card">
        <text class="tips-title">{{ tipsTitle }}</text>
        <text class="tips-item">{{ tip1 }}</text>
        <text class="tips-item">{{ tip2 }}</text>
        <text class="tips-item">{{ tip3 }}</text>
      </view>
    </view>

    <!-- Show Member QR Mode -->
    <view v-if="activeMode === 'qr'" class="qr-section">
      <view class="qr-display card">
        <text class="qr-title">{{ qrTitle }}</text>
        <view class="qr-code-wrapper">
          <image
            v-if="memberQrCode"
            class="qr-code-image"
            :src="memberQrCode"
            mode="aspectFit"
          />
          <view v-else class="qr-placeholder">
            <text class="qr-placeholder-text">QR</text>
          </view>
        </view>
        <text class="member-card-no">{{ authStore.memberCardNo }}</text>
        <text class="qr-instruction">{{ qrInstruction }}</text>

        <!-- Brightness notice -->
        <view class="brightness-notice">
          <text class="brightness-text">{{ brightnessNotice }}</text>
        </view>
      </view>
    </view>

    <!-- Scan Coupon Mode -->
    <view v-if="activeMode === 'coupon'" class="scan-section">
      <view class="scan-icon-area">
        <view class="scan-circle" @tap="scanCoupon">
          <text class="scan-main-icon">\u{1F3AB}</text>
        </view>
        <text class="scan-hint">{{ couponHint }}</text>
      </view>
      <view class="manual-input card">
        <text class="input-label">{{ manualInputLabel }}</text>
        <view class="input-row">
          <input
            v-model="couponCode"
            class="coupon-input"
            :placeholder="inputPlaceholder"
            maxlength="20"
          />
          <view class="submit-btn" @tap="submitCouponCode">
            <text class="submit-text">{{ t('common.confirm') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Recent Scans -->
    <view class="recent-section container">
      <text class="section-title">{{ recentTitle }}</text>
      <view v-for="item in recentScans" :key="item.id" class="recent-item">
        <view class="recent-icon" :class="'type-' + item.type">
          <text class="recent-icon-text">{{ item.type === 'receipt' ? '\u{1F9FE}' : '\u{1F3AB}' }}</text>
        </view>
        <view class="recent-info">
          <text class="recent-desc">{{ item.description }}</text>
          <text class="recent-time">{{ item.time }}</text>
        </view>
        <text class="recent-result" :class="item.success ? 'success' : 'failed'">
          {{ item.success ? successText : failedText }}
        </text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';
import { scanCode } from '@/services/wechat';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const activeMode = ref('receipt');
const couponCode = ref('');

const memberQrCode = computed(() => authStore.qrCode || '');

// Labels
const receiptHint = computed(() => {
  if (locale.value === 'en') return 'Tap to scan receipt for stamps';
  if (locale.value === 'zh-CN') return '点击扫描小票换取印花';
  return '點擊掃描小票換取印花';
});

const qrTitle = computed(() => {
  if (locale.value === 'en') return 'Show QR Code to Merchant';
  if (locale.value === 'zh-CN') return '向商户出示二维码';
  return '向商戶出示二維碼';
});

const qrInstruction = computed(() => {
  if (locale.value === 'en') return 'Let the merchant scan your QR code to earn stamps';
  if (locale.value === 'zh-CN') return '请让商户扫描您的二维码以获取印花';
  return '請讓商戶掃描您的二維碼以獲取印花';
});

const brightnessNotice = computed(() => {
  if (locale.value === 'en') return 'Screen brightness has been increased for easier scanning';
  if (locale.value === 'zh-CN') return '屏幕亮度已调高以便扫码';
  return '螢幕亮度已調高以便掃碼';
});

const couponHint = computed(() => {
  if (locale.value === 'en') return 'Tap to scan coupon QR code';
  if (locale.value === 'zh-CN') return '点击扫描优惠券二维码';
  return '點擊掃描優惠券二維碼';
});

const manualInputLabel = computed(() => {
  if (locale.value === 'en') return 'Or enter coupon code manually';
  if (locale.value === 'zh-CN') return '或手动输入优惠券编码';
  return '或手動輸入優惠券編碼';
});

const inputPlaceholder = computed(() => {
  if (locale.value === 'en') return 'Enter coupon code';
  if (locale.value === 'zh-CN') return '请输入优惠券编码';
  return '請輸入優惠券編碼';
});

const tipsTitle = computed(() => {
  if (locale.value === 'en') return 'Scanning Tips';
  if (locale.value === 'zh-CN') return '扫描提示';
  return '掃描提示';
});

const tip1 = computed(() => {
  if (locale.value === 'en') return '- Keep the receipt flat and well-lit';
  if (locale.value === 'zh-CN') return '- 请保持小票平整，光线充足';
  return '- 請保持小票平整，光線充足';
});

const tip2 = computed(() => {
  if (locale.value === 'en') return '- Ensure the QR code or barcode is clearly visible';
  if (locale.value === 'zh-CN') return '- 确保二维码或条形码清晰可见';
  return '- 確保二維碼或條形碼清晰可見';
});

const tip3 = computed(() => {
  if (locale.value === 'en') return '- Receipts must be scanned within 7 days of purchase';
  if (locale.value === 'zh-CN') return '- 小票须在消费后7天内扫描';
  return '- 小票須在消費後7天內掃描';
});

const recentTitle = computed(() => {
  if (locale.value === 'en') return 'Recent Scans';
  if (locale.value === 'zh-CN') return '最近扫描';
  return '最近掃描';
});

const successText = computed(() => locale.value === 'en' ? 'Success' : locale.value === 'zh-CN' ? '成功' : '成功');
const failedText = computed(() => locale.value === 'en' ? 'Failed' : locale.value === 'zh-CN' ? '失败' : '失敗');

// Modes
const modes = computed(() => [
  { key: 'receipt', label: locale.value === 'en' ? 'Scan Receipt' : locale.value === 'zh-CN' ? '扫描小票' : '掃描小票' },
  { key: 'qr', label: locale.value === 'en' ? 'My QR Code' : locale.value === 'zh-CN' ? '我的二维码' : '我的二維碼' },
  { key: 'coupon', label: locale.value === 'en' ? 'Scan Coupon' : locale.value === 'zh-CN' ? '扫描优惠券' : '掃描優惠券' },
]);

// Mock recent scans
const recentScans = reactive([
  {
    id: '1',
    type: 'receipt',
    description: 'Pacific Coffee - HK$128.00',
    time: '2025-07-20 14:30',
    success: true,
  },
  {
    id: '2',
    type: 'receipt',
    description: 'UNIQLO - HK$399.00',
    time: '2025-07-19 16:45',
    success: true,
  },
  {
    id: '3',
    type: 'coupon',
    description: locale.value === 'en' ? '$50 Off Coupon' : '$50優惠券',
    time: '2025-07-18 11:20',
    success: true,
  },
]);

function setMode(mode: string) {
  activeMode.value = mode;
}

async function scanReceipt() {
  try {
    const result = await scanCode(['qrCode', 'barCode']);
    uni.showToast({
      title: locale.value === 'en' ? 'Receipt scanned!' : locale.value === 'zh-CN' ? '小票扫描成功！' : '小票掃描成功！',
      icon: 'success',
    });
    // In production: send result to backend for stamp processing
    console.log('[Scan] Receipt result:', result);
  } catch (err: any) {
    if (!err.message?.includes('cancel')) {
      uni.showToast({ title: err.message, icon: 'none' });
    }
  }
}

async function scanCoupon() {
  try {
    const result = await scanCode(['qrCode', 'barCode']);
    uni.showToast({
      title: locale.value === 'en' ? 'Coupon scanned!' : locale.value === 'zh-CN' ? '优惠券扫描成功！' : '優惠券掃描成功！',
      icon: 'success',
    });
    console.log('[Scan] Coupon result:', result);
  } catch (err: any) {
    if (!err.message?.includes('cancel')) {
      uni.showToast({ title: err.message, icon: 'none' });
    }
  }
}

function submitCouponCode() {
  if (!couponCode.value.trim()) {
    uni.showToast({ title: inputPlaceholder.value, icon: 'none' });
    return;
  }
  // In production: validate coupon code via API
  uni.showToast({
    title: locale.value === 'en' ? 'Coupon code submitted!' : locale.value === 'zh-CN' ? '优惠券编码已提交！' : '優惠券編碼已提交！',
    icon: 'success',
  });
  couponCode.value = '';
}
</script>

<style scoped>
.scan-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.mode-tabs {
  display: flex;
  background: #FFFFFF;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.mode-tab {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  position: relative;
}

.mode-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #00A651;
  border-radius: 2rpx;
}

.mode-text {
  font-size: 28rpx;
  color: #666666;
}

.mode-tab.active .mode-text {
  color: #00A651;
  font-weight: 600;
}

.scan-section {
  padding: 48rpx 24rpx;
}

.scan-icon-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.scan-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A651, #00C853);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 166, 81, 0.3);
}

.scan-circle:active {
  transform: scale(0.96);
}

.scan-main-icon {
  font-size: 80rpx;
}

.scan-hint {
  font-size: 28rpx;
  color: #666666;
}

.scan-tips {
  padding: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tips-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.tips-item {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 2;
}

.qr-section {
  padding: 48rpx 24rpx;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
}

.qr-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 32rpx;
}

.qr-code-wrapper {
  width: 400rpx;
  height: 400rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code-image {
  width: 100%;
  height: 100%;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  background: #F5F6FA;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-placeholder-text {
  font-size: 64rpx;
  color: #CCCCCC;
  font-weight: 700;
}

.member-card-no {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}

.qr-instruction {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 24rpx;
}

.brightness-notice {
  background-color: #FFF8E1;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}

.brightness-text {
  font-size: 22rpx;
  color: #F5A623;
}

.manual-input {
  margin-top: 24rpx;
}

.input-label {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.input-row {
  display: flex;
  align-items: center;
}

.coupon-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.submit-btn {
  background-color: #00A651;
  border-radius: 12rpx;
  padding: 0 32rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 500;
}

.recent-section {
  padding: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.recent-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
}

.recent-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.type-receipt {
  background-color: #E8F5E9;
}

.type-coupon {
  background-color: #FFF3E0;
}

.recent-icon-text {
  font-size: 28rpx;
}

.recent-info {
  flex: 1;
}

.recent-desc {
  display: block;
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 4rpx;
}

.recent-time {
  font-size: 22rpx;
  color: #999999;
}

.recent-result {
  font-size: 24rpx;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.recent-result.success {
  color: #00A651;
}

.recent-result.failed {
  color: #E53935;
}

.container {
  padding-left: 24rpx;
  padding-right: 24rpx;
}
</style>
