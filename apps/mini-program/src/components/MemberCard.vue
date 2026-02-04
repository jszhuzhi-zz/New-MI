<template>
  <view
    class="member-card"
    :style="{
      background: backgroundColor
        ? `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`
        : 'linear-gradient(135deg, #00A651, #007A3D)',
      color: textColor || '#FFFFFF',
    }"
  >
    <!-- Background image overlay -->
    <image
      v-if="backgroundImage"
      class="card-bg-image"
      :src="backgroundImage"
      mode="aspectFill"
    />

    <!-- Card content -->
    <view class="card-content">
      <!-- Top row: tier badge + logo -->
      <view class="card-header">
        <view class="tier-info">
          <TierBadge :tier-name="tierName" :tier-level="tierLevel" size="small" />
        </view>
        <text class="brand-logo">Link</text>
      </view>

      <!-- Middle: member name and card number -->
      <view class="card-body">
        <text class="member-name">{{ displayName }}</text>
        <text class="card-number">{{ formatCardNo(cardNo) }}</text>
      </view>

      <!-- Bottom: QR code area -->
      <view class="card-footer" @tap="onQrTap">
        <view class="qr-container">
          <image
            v-if="qrCodeUrl"
            class="qr-image"
            :src="qrCodeUrl"
            mode="aspectFit"
          />
          <view v-else class="qr-placeholder">
            <text class="qr-icon">QR</text>
          </view>
          <text class="qr-hint">{{ t('member.memberCard') }}</text>
        </view>
        <view class="stamp-info">
          <text class="stamp-label">{{ t('member.stampBalance') }}</text>
          <text class="stamp-value">{{ stampBalance }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useI18n } from '@/utils/i18n';
import TierBadge from './TierBadge.vue';

const { t } = useI18n();

const props = withDefaults(defineProps<{
  displayName: string;
  cardNo: string;
  tierName: string;
  tierLevel: number;
  stampBalance: number;
  qrCodeUrl: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
}>(), {
  backgroundColor: '#00A651',
  textColor: '#FFFFFF',
  backgroundImage: '',
});

const emit = defineEmits<{
  (e: 'qrTap'): void;
}>();

function formatCardNo(cardNo: string): string {
  if (!cardNo) return '';
  // Format as: XXXX XXXX XXXX XXXX
  return cardNo.replace(/(.{4})/g, '$1 ').trim();
}

function onQrTap() {
  emit('qrTap');
}
</script>

<style scoped>
.member-card {
  position: relative;
  border-radius: 24rpx;
  padding: 36rpx;
  min-height: 360rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 166, 81, 0.3);
}

.card-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.brand-logo {
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  opacity: 0.9;
}

.card-body {
  flex: 1;
  margin-bottom: 24rpx;
}

.member-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.card-number {
  display: block;
  font-size: 28rpx;
  letter-spacing: 4rpx;
  opacity: 0.85;
  font-family: 'Courier New', monospace;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.qr-container {
  display: flex;
  align-items: center;
}

.qr-image {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 255, 255, 0.9);
  margin-right: 12rpx;
}

.qr-placeholder {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.qr-icon {
  font-size: 20rpx;
  color: #333333;
  font-weight: 600;
}

.qr-hint {
  font-size: 22rpx;
  opacity: 0.8;
}

.stamp-info {
  text-align: right;
}

.stamp-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.8;
  margin-bottom: 4rpx;
}

.stamp-value {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1;
}
</style>
