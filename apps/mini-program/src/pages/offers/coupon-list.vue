<template>
  <view class="coupon-list-page">
    <!-- Status Tabs -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: activeStatus === tab.key }"
        @tap="activeStatus = tab.key"
      >
        <text class="status-tab-text">{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="badge">
          <text class="badge-text">{{ tab.count }}</text>
        </view>
      </view>
    </view>

    <!-- Coupon List -->
    <view class="coupon-container">
      <CouponCard
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        :id="coupon.id"
        :name="coupon.name"
        :type="coupon.type"
        :value="coupon.value"
        :min-spending="coupon.minSpending"
        :expiry-date="coupon.expiryDate"
        :status="coupon.status"
        @tap="goDetail"
      />

      <view v-if="filteredCoupons.length === 0" class="empty-state">
        <text class="empty-icon">\u{1F3AB}</text>
        <text class="empty-text">{{ t('common.noData') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from '@/utils/i18n';
import CouponCard from '@/components/CouponCard.vue';

const { t, locale } = useI18n();
const activeStatus = ref('active');

const statusTabs = computed(() => [
  { key: 'active', label: locale.value === 'en' ? 'Available' : locale.value === 'zh-CN' ? '可使用' : '可使用', count: 3 },
  { key: 'used', label: locale.value === 'en' ? 'Used' : locale.value === 'zh-CN' ? '已使用' : '已使用', count: 0 },
  { key: 'expired', label: locale.value === 'en' ? 'Expired' : locale.value === 'zh-CN' ? '已过期' : '已過期', count: 0 },
]);

const myCoupons = reactive([
  {
    id: 'mc1',
    name: locale.value === 'en' ? '$50 Off F&B' : locale.value === 'zh-CN' ? '餐饮满$200减$50' : '餐飲滿$200減$50',
    type: 'discount-amount' as const,
    value: 50,
    minSpending: 200,
    expiryDate: '2025-08-31T23:59:59',
    status: 'active' as const,
  },
  {
    id: 'mc2',
    name: locale.value === 'en' ? '20% Off Fashion' : locale.value === 'zh-CN' ? '时装8折优惠' : '時裝8折優惠',
    type: 'discount-percent' as const,
    value: 20,
    minSpending: 500,
    expiryDate: '2025-09-15T23:59:59',
    status: 'active' as const,
  },
  {
    id: 'mc3',
    name: locale.value === 'en' ? 'Bonus 10 Stamps' : locale.value === 'zh-CN' ? '额外10枚印花' : '額外10枚印花',
    type: 'stamp-bonus' as const,
    value: 10,
    minSpending: 0,
    expiryDate: '2025-07-31T23:59:59',
    status: 'active' as const,
  },
  {
    id: 'mc4',
    name: locale.value === 'en' ? 'Free Parking 2 Hours' : locale.value === 'zh-CN' ? '免费泊车2小时' : '免費泊車2小時',
    type: 'free-item' as const,
    value: 0,
    minSpending: 0,
    expiryDate: '2025-06-30T23:59:59',
    status: 'expired' as const,
  },
]);

const filteredCoupons = computed(() => {
  return myCoupons.filter((c) => c.status === activeStatus.value);
});

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/offers/coupon-detail?id=${id}` });
}
</script>

<style scoped>
.coupon-list-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.status-tabs {
  display: flex;
  background: #FFFFFF;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.status-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #00A651;
  border-radius: 2rpx;
}

.status-tab-text {
  font-size: 28rpx;
  color: #666666;
}

.status-tab.active .status-tab-text {
  color: #00A651;
  font-weight: 600;
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
  margin-left: 8rpx;
}

.badge-text {
  color: #FFFFFF;
  font-size: 20rpx;
}

.coupon-container {
  padding: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
