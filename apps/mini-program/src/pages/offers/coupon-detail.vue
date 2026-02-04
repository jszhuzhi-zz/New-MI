<template>
  <view class="coupon-detail-page">
    <!-- Coupon Visual Card -->
    <view class="coupon-visual" :class="'type-' + coupon.type">
      <view class="coupon-value-section">
        <view v-if="coupon.type === 'discount-amount'">
          <text class="currency">$</text>
          <text class="big-value">{{ coupon.value }}</text>
        </view>
        <view v-else-if="coupon.type === 'discount-percent'">
          <text class="big-value">{{ coupon.value }}</text>
          <text class="percent-sign">%</text>
        </view>
        <view v-else-if="coupon.type === 'stamp-bonus'">
          <text class="big-value">{{ coupon.value }}</text>
          <text class="value-label">{{ t('stamp.stamp') }}</text>
        </view>
        <view v-else>
          <text class="gift-label">{{ t('campaign.gift') }}</text>
        </view>
        <text class="coupon-name">{{ coupon.name }}</text>
      </view>
    </view>

    <!-- Barcode / QR Code Display -->
    <view class="code-section card">
      <text class="code-title">{{ codeTitle }}</text>
      <view class="barcode-wrapper">
        <!-- WeChat native barcode display -->
        <image
          v-if="coupon.barcodeUrl"
          class="barcode-image"
          :src="coupon.barcodeUrl"
          mode="widthFix"
        />
        <view v-else class="barcode-placeholder">
          <view class="barcode-lines">
            <view v-for="i in 30" :key="i" class="barcode-line" :style="{ width: (Math.random() * 3 + 1) + 'rpx' }" />
          </view>
        </view>
      </view>
      <text class="coupon-code">{{ coupon.code }}</text>
      <text class="code-hint">{{ codeHint }}</text>
    </view>

    <!-- Coupon Details -->
    <view class="details-section card">
      <view class="detail-row">
        <text class="detail-label">{{ validityLabel }}</text>
        <text class="detail-value">{{ coupon.validRange }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ conditionLabel }}</text>
        <text class="detail-value">{{ coupon.condition }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ applicableLabel }}</text>
        <text class="detail-value">{{ coupon.applicable }}</text>
      </view>
    </view>

    <!-- Terms -->
    <view class="terms-section card">
      <text class="section-title">{{ termsLabel }}</text>
      <text class="terms-text">{{ coupon.terms }}</text>
    </view>

    <!-- Use Button -->
    <view v-if="coupon.status === 'active'" class="action-bar safe-area-bottom">
      <view class="use-btn" @tap="useCoupon">
        <text class="use-btn-text">{{ useLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const coupon = reactive({
  id: '',
  name: locale.value === 'en' ? '$50 Off F&B' : locale.value === 'zh-CN' ? '餐饮满$200减$50' : '餐飲滿$200減$50',
  type: 'discount-amount' as string,
  value: 50,
  code: 'LINK2025FNB50',
  barcodeUrl: '',
  status: 'active',
  validRange: '2025-06-01 - 2025-08-31',
  condition: locale.value === 'en' ? 'Min. spend $200' : locale.value === 'zh-CN' ? '满$200可用' : '滿$200可用',
  applicable: locale.value === 'en' ? 'All participating F&B merchants' : locale.value === 'zh-CN' ? '所有参与餐饮商户' : '所有參與餐飲商戶',
  terms: locale.value === 'en'
    ? '1. Valid for one-time use only.\n2. Cannot be combined with other promotions.\n3. Not redeemable for cash.\n4. Present coupon barcode to cashier before payment.\n5. Link REIT reserves the right of final decision.'
    : locale.value === 'zh-CN'
      ? '1. 仅限一次性使用。\n2. 不可与其他优惠同时使用。\n3. 不可兑换现金。\n4. 付款前请向收银员出示优惠券条形码。\n5. 领展保留最终决定权。'
      : '1. 僅限一次性使用。\n2. 不可與其他優惠同時使用。\n3. 不可兌換現金。\n4. 付款前請向收銀員出示優惠券條形碼。\n5. 領展保留最終決定權。',
});

// Labels
const codeTitle = computed(() => locale.value === 'en' ? 'Present to Cashier' : locale.value === 'zh-CN' ? '向收银员出示' : '向收銀員出示');
const codeHint = computed(() => locale.value === 'en' ? 'Let the cashier scan the barcode above' : locale.value === 'zh-CN' ? '请让收银员扫描上方条形码' : '請讓收銀員掃描上方條形碼');
const validityLabel = computed(() => locale.value === 'en' ? 'Valid Period' : locale.value === 'zh-CN' ? '有效期' : '有效期');
const conditionLabel = computed(() => locale.value === 'en' ? 'Condition' : locale.value === 'zh-CN' ? '使用条件' : '使用條件');
const applicableLabel = computed(() => locale.value === 'en' ? 'Applicable At' : locale.value === 'zh-CN' ? '适用范围' : '適用範圍');
const termsLabel = computed(() => locale.value === 'en' ? 'Terms & Conditions' : locale.value === 'zh-CN' ? '条款与细则' : '條款與細則');
const useLabel = computed(() => locale.value === 'en' ? 'Use Now' : locale.value === 'zh-CN' ? '立即使用' : '立即使用');

onLoad((query) => {
  if (query?.id) {
    coupon.id = query.id;
    // In production: fetch coupon detail by id
  }
});

function useCoupon() {
  uni.showModal({
    title: locale.value === 'en' ? 'Use Coupon' : locale.value === 'zh-CN' ? '使用优惠券' : '使用優惠券',
    content: locale.value === 'en'
      ? 'Are you sure you want to use this coupon now?'
      : locale.value === 'zh-CN'
        ? '确定要现在使用这张优惠券吗？'
        : '確定要現在使用這張優惠券嗎？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: locale.value === 'en' ? 'Coupon activated!' : locale.value === 'zh-CN' ? '优惠券已激活！' : '優惠券已激活！',
          icon: 'success',
        });
      }
    },
  });
}
</script>

<style scoped>
.coupon-detail-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding-bottom: 140rpx;
}

.coupon-visual {
  padding: 48rpx 32rpx;
  text-align: center;
}

.type-discount-amount {
  background: linear-gradient(135deg, #FF6B35, #FF8F65);
}

.type-discount-percent {
  background: linear-gradient(135deg, #FF6B35, #FF8F65);
}

.type-stamp-bonus {
  background: linear-gradient(135deg, #00A651, #4CAF50);
}

.type-free-item, .type-gift {
  background: linear-gradient(135deg, #1976D2, #42A5F5);
}

.coupon-value-section {
  color: #FFFFFF;
}

.currency {
  font-size: 40rpx;
  font-weight: 600;
  vertical-align: top;
}

.big-value {
  font-size: 96rpx;
  font-weight: 800;
  line-height: 1;
}

.percent-sign {
  font-size: 40rpx;
  font-weight: 600;
}

.value-label {
  display: block;
  font-size: 26rpx;
  margin-top: 4rpx;
  opacity: 0.9;
}

.gift-label {
  font-size: 48rpx;
  font-weight: 700;
}

.coupon-name {
  display: block;
  font-size: 30rpx;
  margin-top: 16rpx;
  opacity: 0.9;
}

.code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: -32rpx 24rpx 24rpx;
  position: relative;
  z-index: 1;
  padding: 32rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.code-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
}

.barcode-wrapper {
  width: 100%;
  padding: 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
}

.barcode-image {
  width: 80%;
}

.barcode-placeholder {
  width: 80%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.barcode-lines {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  gap: 2rpx;
}

.barcode-line {
  height: 100%;
  background-color: #333333;
}

.coupon-code {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
}

.code-hint {
  font-size: 22rpx;
  color: #999999;
}

.details-section {
  margin: 0 24rpx 24rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.detail-label {
  font-size: 26rpx;
  color: #999999;
}

.detail-value {
  font-size: 26rpx;
  color: #333333;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
}

.terms-section {
  margin: 0 24rpx 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.terms-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 2;
  white-space: pre-line;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.use-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
}

.use-btn-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
