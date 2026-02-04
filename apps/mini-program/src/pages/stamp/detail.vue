<template>
  <view class="detail-page">
    <!-- Amount Card -->
    <view class="amount-card" :class="transaction.amount > 0 ? 'earn-card' : 'redeem-card'">
      <text class="amount-label">{{ transaction.amount > 0 ? t('stamp.earn') : t('stamp.redeem') }}</text>
      <text class="amount-value">{{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}</text>
      <text class="amount-unit">{{ t('stamp.stamp') }}</text>
    </view>

    <!-- Transaction Details -->
    <view class="detail-card card">
      <view class="detail-row">
        <text class="detail-label">{{ transactionNoLabel }}</text>
        <text class="detail-value">{{ transaction.referenceNo }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ typeLabel }}</text>
        <text class="detail-value">{{ transaction.typeLabel }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ sourceLabel }}</text>
        <text class="detail-value">{{ transaction.sourceLabel }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ statusLabel }}</text>
        <view class="status-tag" :class="'status-' + transaction.status">
          <text class="status-text">{{ transaction.statusLabel }}</text>
        </view>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ balanceAfterLabel }}</text>
        <text class="detail-value">{{ transaction.balanceAfter }} {{ t('stamp.stamp') }}</text>
      </view>
      <view class="divider" />
      <view class="detail-row">
        <text class="detail-label">{{ timeLabel }}</text>
        <text class="detail-value">{{ transaction.datetime }}</text>
      </view>
      <view v-if="transaction.merchantName" class="divider" />
      <view v-if="transaction.merchantName" class="detail-row">
        <text class="detail-label">{{ merchantLabel }}</text>
        <text class="detail-value">{{ transaction.merchantName }}</text>
      </view>
      <view v-if="transaction.description" class="divider" />
      <view v-if="transaction.description" class="detail-row">
        <text class="detail-label">{{ descLabel }}</text>
        <text class="detail-value">{{ transaction.description }}</text>
      </view>
    </view>

    <!-- Expiry info -->
    <view v-if="transaction.expiresAt" class="expiry-card card">
      <text class="expiry-label">{{ expiryInfoLabel }}</text>
      <text class="expiry-date">{{ transaction.expiresAt }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

// Labels
const transactionNoLabel = computed(() => locale.value === 'en' ? 'Transaction No.' : locale.value === 'zh-CN' ? '交易编号' : '交易編號');
const typeLabel = computed(() => locale.value === 'en' ? 'Type' : locale.value === 'zh-CN' ? '类型' : '類型');
const sourceLabel = computed(() => locale.value === 'en' ? 'Source' : locale.value === 'zh-CN' ? '来源' : '來源');
const statusLabel = computed(() => t('common.status'));
const balanceAfterLabel = computed(() => locale.value === 'en' ? 'Balance After' : locale.value === 'zh-CN' ? '交易后余额' : '交易後餘額');
const timeLabel = computed(() => locale.value === 'en' ? 'Time' : locale.value === 'zh-CN' ? '时间' : '時間');
const merchantLabel = computed(() => t('merchant.merchant'));
const descLabel = computed(() => locale.value === 'en' ? 'Description' : locale.value === 'zh-CN' ? '描述' : '描述');
const expiryInfoLabel = computed(() => locale.value === 'en' ? 'Stamps expire on' : locale.value === 'zh-CN' ? '印花到期日' : '印花到期日');

const transaction = reactive({
  id: '',
  referenceNo: 'STX20250720143000001',
  amount: 15,
  type: 'earn' as string,
  typeLabel: t('stamp.earn'),
  source: 'receipt-scan',
  sourceLabel: t('stamp.receiptScan'),
  status: 'completed',
  statusLabel: t('stamp.completed'),
  balanceAfter: 568,
  datetime: '2025-07-20 14:30:00',
  merchantName: 'Pacific Coffee',
  description: '',
  expiresAt: '2026-07-20',
});

onLoad((query) => {
  if (query?.id) {
    transaction.id = query.id;
    // In production: fetch transaction detail by id from API
  }
});
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.amount-card {
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.earn-card {
  background: linear-gradient(135deg, #00A651, #00C853);
}

.redeem-card {
  background: linear-gradient(135deg, #FF6B35, #FF8F65);
}

.amount-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12rpx;
}

.amount-value {
  font-size: 80rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.amount-unit {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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
  flex-shrink: 0;
  margin-right: 24rpx;
}

.detail-value {
  font-size: 26rpx;
  color: #333333;
  text-align: right;
  flex: 1;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
}

.status-tag {
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
}

.status-completed {
  background-color: #E8F5E9;
}

.status-completed .status-text {
  color: #00A651;
  font-size: 24rpx;
}

.status-pending {
  background-color: #FFF8E1;
}

.status-pending .status-text {
  color: #F5A623;
  font-size: 24rpx;
}

.status-rejected {
  background-color: #FFEBEE;
}

.status-rejected .status-text {
  color: #E53935;
  font-size: 24rpx;
}

.expiry-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiry-label {
  font-size: 26rpx;
  color: #666666;
}

.expiry-date {
  font-size: 26rpx;
  color: #F5A623;
  font-weight: 600;
}
</style>
