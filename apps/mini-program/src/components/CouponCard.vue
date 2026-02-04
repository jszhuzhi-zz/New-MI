<template>
  <view class="coupon-card" :class="{ used: status === 'used', expired: status === 'expired' }" @tap="onTap">
    <!-- Left: value section -->
    <view class="coupon-left" :class="typeClass">
      <view v-if="type === 'discount-percent'">
        <text class="coupon-value">{{ value }}</text>
        <text class="coupon-value-unit">% OFF</text>
      </view>
      <view v-else-if="type === 'discount-amount'">
        <text class="coupon-currency">$</text>
        <text class="coupon-value">{{ value }}</text>
      </view>
      <view v-else-if="type === 'stamp-bonus'">
        <text class="coupon-value">{{ value }}</text>
        <text class="coupon-value-unit">{{ t('stamp.stamp') }}</text>
      </view>
      <view v-else>
        <text class="coupon-value-gift">{{ t('campaign.gift') }}</text>
      </view>
    </view>

    <!-- Divider with circles -->
    <view class="coupon-divider">
      <view class="circle-top" />
      <view class="dashed-line" />
      <view class="circle-bottom" />
    </view>

    <!-- Right: info section -->
    <view class="coupon-right">
      <text class="coupon-name">{{ name }}</text>
      <text class="coupon-condition">{{ condition }}</text>
      <text class="coupon-expiry">{{ expiryText }}</text>
      <view v-if="status === 'used'" class="status-badge used-badge">
        <text class="status-text">{{ t('stamp.completed') }}</text>
      </view>
      <view v-else-if="status === 'expired'" class="status-badge expired-badge">
        <text class="status-text">{{ t('stamp.expire') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const props = defineProps<{
  id: string;
  name: string;
  type: 'discount-percent' | 'discount-amount' | 'free-item' | 'stamp-bonus' | 'gift';
  value: number;
  minSpending?: number;
  expiryDate: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
}>();

const emit = defineEmits<{
  (e: 'tap', id: string): void;
}>();

const typeClass = computed(() => `type-${props.type}`);

const condition = computed(() => {
  if (!props.minSpending || props.minSpending <= 0) {
    if (locale.value === 'en') return 'No minimum spending';
    if (locale.value === 'zh-CN') return '无消费门槛';
    return '無消費門檻';
  }
  if (locale.value === 'en') return `Min. spend $${props.minSpending}`;
  if (locale.value === 'zh-CN') return `满$${props.minSpending}可用`;
  return `滿$${props.minSpending}可用`;
});

const expiryText = computed(() => {
  const date = props.expiryDate.slice(0, 10);
  if (locale.value === 'en') return `Valid until ${date}`;
  if (locale.value === 'zh-CN') return `有效期至 ${date}`;
  return `有效期至 ${date}`;
});

function onTap() {
  emit('tap', props.id);
}
</script>

<style scoped>
.coupon-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
  position: relative;
}

.coupon-card.used,
.coupon-card.expired {
  opacity: 0.6;
}

.coupon-left {
  width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
}

.type-discount-percent,
.type-discount-amount {
  background: linear-gradient(135deg, #FF6B35, #FF8F65);
}

.type-stamp-bonus {
  background: linear-gradient(135deg, #00A651, #4CAF50);
}

.type-free-item,
.type-gift {
  background: linear-gradient(135deg, #1976D2, #42A5F5);
}

.coupon-currency {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.coupon-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.coupon-value-unit {
  font-size: 22rpx;
  color: #FFFFFF;
  opacity: 0.9;
}

.coupon-value-gift {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.coupon-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 1rpx;
}

.circle-top,
.circle-bottom {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #F5F6FA;
  position: absolute;
}

.circle-top {
  top: -12rpx;
}

.circle-bottom {
  bottom: -12rpx;
}

.dashed-line {
  flex: 1;
  width: 1rpx;
  border-left: 2rpx dashed #E0E0E0;
  margin: 12rpx 0;
}

.coupon-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-condition {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 8rpx;
  display: block;
}

.coupon-expiry {
  font-size: 22rpx;
  color: #999999;
  display: block;
}

.status-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.used-badge {
  background-color: #E0E0E0;
}

.expired-badge {
  background-color: #FFECB3;
}

.status-text {
  font-size: 20rpx;
  color: #666666;
}
</style>
