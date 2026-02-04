<template>
  <view class="stamp-balance-container">
    <view class="balance-main">
      <text class="balance-label">{{ t('stamp.stampBalance') }}</text>
      <view class="balance-value-row">
        <text class="balance-value">{{ balance }}</text>
        <text class="balance-unit">{{ t('stamp.stamp') }}</text>
      </view>
    </view>
    <view class="balance-stats">
      <view class="stat-item">
        <text class="stat-value earn">+{{ monthEarned }}</text>
        <text class="stat-label">{{ t('stamp.earn') }}</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value redeem">-{{ monthRedeemed }}</text>
        <text class="stat-label">{{ t('stamp.redeem') }}</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value expire">{{ expiringCount }}</text>
        <text class="stat-label">{{ expiringLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const props = withDefaults(defineProps<{
  balance: number;
  monthEarned?: number;
  monthRedeemed?: number;
  expiringCount?: number;
  expiringDays?: number;
}>(), {
  monthEarned: 0,
  monthRedeemed: 0,
  expiringCount: 0,
  expiringDays: 30,
});

const expiringLabel = computed(() => {
  if (locale.value === 'en') {
    return `Expiring in ${props.expiringDays}d`;
  }
  if (locale.value === 'zh-CN') {
    return `${props.expiringDays}天内到期`;
  }
  return `${props.expiringDays}天內到期`;
});
</script>

<style scoped>
.stamp-balance-container {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.balance-main {
  margin-bottom: 28rpx;
}

.balance-label {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 8rpx;
  display: block;
}

.balance-value-row {
  display: flex;
  align-items: baseline;
}

.balance-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #00A651;
  line-height: 1;
  margin-right: 8rpx;
}

.balance-unit {
  font-size: 26rpx;
  color: #666666;
}

.balance-stats {
  display: flex;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.stat-value.earn {
  color: #00A651;
}

.stat-value.redeem {
  color: #FF6B35;
}

.stat-value.expire {
  color: #F5A623;
}

.stat-label {
  font-size: 22rpx;
  color: #999999;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background-color: #F0F0F0;
}
</style>
