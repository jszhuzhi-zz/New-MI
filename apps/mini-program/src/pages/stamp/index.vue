<template>
  <view class="stamp-page">
    <!-- Balance Display -->
    <view class="balance-section">
      <StampBalance
        :balance="stampBalance"
        :month-earned="monthEarned"
        :month-redeemed="monthRedeemed"
        :expiring-count="expiringCount"
        :expiring-days="30"
      />
    </view>

    <!-- Tier Progress -->
    <view class="tier-section card">
      <view class="tier-header">
        <TierBadge :tier-name="currentTierName" :tier-level="currentTierLevel" />
        <text class="tier-link" @tap="goTierDetail">{{ tierDetailText }} &gt;</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </view>
      <text class="progress-text">{{ progressLabel }}</text>
    </view>

    <!-- Earning Rules Link -->
    <view class="rules-link card" @tap="goRules">
      <text class="rules-icon">\u{1F4D6}</text>
      <text class="rules-text">{{ rulesText }}</text>
      <text class="rules-arrow">&gt;</text>
    </view>

    <!-- History Filters -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-row">
          <view
            v-for="filter in filters"
            :key="filter.value"
            class="filter-chip"
            :class="{ active: activeFilter === filter.value }"
            @tap="setFilter(filter.value)"
          >
            <text class="filter-text">{{ filter.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- History List -->
    <view class="history-section">
      <view
        v-for="item in filteredHistory"
        :key="item.id"
        class="history-item"
        @tap="goDetail(item.id)"
      >
        <view class="history-left">
          <view class="history-icon" :class="item.type === 'earn' || item.type === 'bonus' ? 'icon-earn' : 'icon-redeem'">
            <text class="icon-text">{{ item.type === 'earn' || item.type === 'bonus' ? '+' : '-' }}</text>
          </view>
          <view class="history-info">
            <text class="history-desc">{{ item.description }}</text>
            <text class="history-date">{{ item.date }}</text>
          </view>
        </view>
        <view class="history-right">
          <text class="history-amount" :class="item.amount > 0 ? 'positive' : 'negative'">
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
          </text>
          <text class="history-status" :class="'status-' + item.status">{{ item.statusLabel }}</text>
        </view>
      </view>

      <!-- Empty state -->
      <view v-if="filteredHistory.length === 0" class="empty-state">
        <text class="empty-text">{{ t('common.noData') }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';
import StampBalance from '@/components/StampBalance.vue';
import TierBadge from '@/components/TierBadge.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();

// Data
const stampBalance = ref(authStore.stampBalance || 568);
const monthEarned = ref(128);
const monthRedeemed = ref(50);
const expiringCount = ref(30);
const currentTierName = ref(authStore.tierName || (locale.value === 'en' ? 'Gold' : '金卡'));
const currentTierLevel = ref(authStore.tierLevel || 3);
const activeFilter = ref('all');

// Tier progress
const progressPercent = ref(68);
const nextTierStamps = 1000;
const currentStamps = 680;

const progressLabel = computed(() => {
  const remaining = nextTierStamps - currentStamps;
  if (locale.value === 'en') return `${remaining} stamps to next tier`;
  if (locale.value === 'zh-CN') return `距下一等级还需 ${remaining} 印花`;
  return `距下一等級還需 ${remaining} 印花`;
});

const tierDetailText = computed(() => {
  if (locale.value === 'en') return 'View tier benefits';
  if (locale.value === 'zh-CN') return '查看等级权益';
  return '查看等級權益';
});

const rulesText = computed(() => {
  if (locale.value === 'en') return 'Stamp Earning Rules';
  if (locale.value === 'zh-CN') return '印花获取规则';
  return '印花獲取規則';
});

// Filters
const filters = computed(() => [
  { label: t('common.all'), value: 'all' },
  { label: t('stamp.earn'), value: 'earn' },
  { label: t('stamp.redeem'), value: 'redeem' },
  { label: t('stamp.bonus'), value: 'bonus' },
  { label: t('stamp.expire'), value: 'expire' },
]);

// Mock history
const historyData = reactive([
  {
    id: 'tx1',
    type: 'earn',
    amount: 15,
    description: locale.value === 'en' ? 'Pacific Coffee - Receipt' : locale.value === 'zh-CN' ? 'Pacific Coffee - 消费小票' : 'Pacific Coffee - 消費小票',
    date: '2025-07-20 14:30',
    status: 'completed',
    statusLabel: t('stamp.completed'),
  },
  {
    id: 'tx2',
    type: 'redeem',
    amount: -50,
    description: locale.value === 'en' ? '$50 Coupon Redemption' : locale.value === 'zh-CN' ? '兑换$50优惠券' : '兌換$50優惠券',
    date: '2025-07-19 11:20',
    status: 'completed',
    statusLabel: t('stamp.completed'),
  },
  {
    id: 'tx3',
    type: 'bonus',
    amount: 20,
    description: locale.value === 'en' ? 'Summer Double Stamps Bonus' : locale.value === 'zh-CN' ? '夏日双倍印花活动奖励' : '夏日雙倍印花活動獎勵',
    date: '2025-07-18 16:45',
    status: 'completed',
    statusLabel: t('stamp.completed'),
  },
  {
    id: 'tx4',
    type: 'earn',
    amount: 8,
    description: locale.value === 'en' ? 'UNIQLO - Receipt' : locale.value === 'zh-CN' ? 'UNIQLO - 消费小票' : 'UNIQLO - 消費小票',
    date: '2025-07-17 15:10',
    status: 'pending',
    statusLabel: t('stamp.pending'),
  },
  {
    id: 'tx5',
    type: 'expire',
    amount: -10,
    description: locale.value === 'en' ? 'Stamps Expired' : locale.value === 'zh-CN' ? '印花过期' : '印花過期',
    date: '2025-07-15 00:00',
    status: 'completed',
    statusLabel: t('stamp.expire'),
  },
]);

const filteredHistory = computed(() => {
  if (activeFilter.value === 'all') return historyData;
  return historyData.filter((item) => item.type === activeFilter.value);
});

function setFilter(value: string) {
  activeFilter.value = value;
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/stamp/detail?id=${id}` });
}

function goTierDetail() {
  uni.navigateTo({ url: '/pages/profile/tier' });
}

function goRules() {
  uni.navigateTo({ url: '/pages/stamp/rules' });
}

onPullDownRefresh(async () => {
  try {
    if (authStore.isLoggedIn) {
      await authStore.fetchUserProfile();
    }
  } finally {
    uni.stopPullDownRefresh();
  }
});
</script>

<style scoped>
.stamp-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.balance-section {
  margin-bottom: 24rpx;
}

.tier-section {
  margin-bottom: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.tier-link {
  font-size: 24rpx;
  color: #00A651;
}

.progress-bar {
  height: 12rpx;
  background-color: #E0E0E0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00A651, #00C853);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #999999;
}

.rules-link {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.rules-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.rules-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.rules-arrow {
  font-size: 28rpx;
  color: #CCCCCC;
}

.filter-section {
  margin-bottom: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 16rpx;
}

.filter-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background-color: #FFFFFF;
  border: 2rpx solid #E0E0E0;
}

.filter-chip.active {
  background-color: #00A651;
  border-color: #00A651;
}

.filter-text {
  font-size: 26rpx;
  color: #666666;
}

.filter-chip.active .filter-text {
  color: #FFFFFF;
}

.history-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.history-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.icon-earn {
  background-color: #E8F5E9;
}

.icon-redeem {
  background-color: #FFF3E0;
}

.icon-text {
  font-size: 32rpx;
  font-weight: 600;
}

.icon-earn .icon-text {
  color: #00A651;
}

.icon-redeem .icon-text {
  color: #FF6B35;
}

.history-info {
  flex: 1;
}

.history-desc {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 4rpx;
}

.history-date {
  font-size: 22rpx;
  color: #999999;
}

.history-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.history-amount {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.history-amount.positive {
  color: #00A651;
}

.history-amount.negative {
  color: #FF6B35;
}

.history-status {
  font-size: 20rpx;
}

.status-completed {
  color: #999999;
}

.status-pending {
  color: #F5A623;
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
