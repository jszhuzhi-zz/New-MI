<template>
  <view class="offers-page">
    <!-- Category Tabs -->
    <view class="category-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs-row">
          <view
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @tap="setTab(tab.key)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Campaign List -->
    <view v-if="activeTab === 'campaigns'" class="tab-content container">
      <CampaignCard
        v-for="campaign in mockCampaigns"
        :key="campaign.id"
        :id="campaign.id"
        :name="campaign.name"
        :description="campaign.description"
        :cover-image="campaign.coverImage"
        :type="campaign.type"
        :start-date="campaign.startDate"
        :end-date="campaign.endDate"
        :stamp-bonus="campaign.stampBonus"
        @tap="goCampaignDetail"
      />
    </view>

    <!-- Coupon Center -->
    <view v-if="activeTab === 'coupons'" class="tab-content container">
      <view class="coupon-actions">
        <view class="coupon-action-btn" @tap="goMyCoupons">
          <text class="action-icon">\u{1F3AB}</text>
          <text class="action-text">{{ myCouponsText }}</text>
        </view>
      </view>
      <text class="section-title">{{ availableCouponsText }}</text>
      <CouponCard
        v-for="coupon in mockCoupons"
        :key="coupon.id"
        :id="coupon.id"
        :name="coupon.name"
        :type="coupon.type"
        :value="coupon.value"
        :min-spending="coupon.minSpending"
        :expiry-date="coupon.expiryDate"
        :status="coupon.status"
        @tap="goCouponDetail"
      />
    </view>

    <!-- Lucky Draw -->
    <view v-if="activeTab === 'lucky-draw'" class="tab-content container">
      <view
        v-for="draw in mockDraws"
        :key="draw.id"
        class="draw-card"
        @tap="goLuckyDraw(draw.id)"
      >
        <image class="draw-image" :src="draw.image" mode="aspectFill" />
        <view class="draw-info">
          <text class="draw-name">{{ draw.name }}</text>
          <text class="draw-cost">{{ draw.cost }} {{ t('stamp.stamp') }} / {{ drawEntryText }}</text>
          <text class="draw-remaining">{{ remainingText }}: {{ draw.remaining }}</text>
        </view>
      </view>
    </view>

    <!-- Gift Redemption -->
    <view v-if="activeTab === 'gifts'" class="tab-content container">
      <view class="gifts-grid">
        <view
          v-for="gift in mockGifts"
          :key="gift.id"
          class="gift-card"
          @tap="goGiftCatalog"
        >
          <image class="gift-image" :src="gift.image" mode="aspectFill" />
          <view class="gift-info">
            <text class="gift-name">{{ gift.name }}</text>
            <view class="gift-price">
              <text class="gift-stamps">{{ gift.stamps }}</text>
              <text class="gift-unit">{{ t('stamp.stamp') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';
import CampaignCard from '@/components/CampaignCard.vue';
import CouponCard from '@/components/CouponCard.vue';

const { t, locale } = useI18n();
const activeTab = ref('campaigns');

// Labels
const myCouponsText = computed(() => locale.value === 'en' ? 'My Coupons' : locale.value === 'zh-CN' ? '我的优惠券' : '我的優惠券');
const availableCouponsText = computed(() => locale.value === 'en' ? 'Available Coupons' : locale.value === 'zh-CN' ? '可领取优惠券' : '可領取優惠券');
const drawEntryText = computed(() => locale.value === 'en' ? 'entry' : locale.value === 'zh-CN' ? '次' : '次');
const remainingText = computed(() => locale.value === 'en' ? 'Remaining' : locale.value === 'zh-CN' ? '剩余次数' : '剩餘次數');

const categoryTabs = computed(() => [
  { key: 'campaigns', label: t('campaign.campaign') },
  { key: 'coupons', label: t('campaign.coupon') },
  { key: 'lucky-draw', label: t('campaign.luckyDraw') },
  { key: 'gifts', label: t('campaign.gift') },
]);

// Mock data
const mockCampaigns = reactive([
  {
    id: 'c1',
    name: locale.value === 'en' ? 'Summer Double Stamps' : locale.value === 'zh-CN' ? '夏日双倍印花' : '夏日雙倍印花',
    description: locale.value === 'en' ? 'Earn double stamps on all purchases at participating F&B merchants this summer!' : locale.value === 'zh-CN' ? '今夏在参与餐饮商户消费即可获得双倍印花！' : '今夏在參與餐飲商戶消費即可獲得雙倍印花！',
    coverImage: 'https://via.placeholder.com/750x360/00A651/FFFFFF?text=Summer+2x+Stamps',
    type: 'stamp-multiplier' as const,
    startDate: '2025-06-01T00:00:00',
    endDate: '2025-08-31T23:59:59',
    stampBonus: undefined,
  },
  {
    id: 'c2',
    name: locale.value === 'en' ? 'Weekend Lucky Draw' : locale.value === 'zh-CN' ? '周末幸运抽奖' : '週末幸運抽獎',
    description: locale.value === 'en' ? 'Spend HK$300 on weekends for a chance to win amazing prizes!' : locale.value === 'zh-CN' ? '周末消费满HK$300即有机会赢取丰厚奖品！' : '週末消費滿HK$300即有機會贏取豐厚獎品！',
    coverImage: 'https://via.placeholder.com/750x360/FF6B35/FFFFFF?text=Lucky+Draw',
    type: 'lucky-draw' as const,
    startDate: '2025-07-01T00:00:00',
    endDate: '2025-09-30T23:59:59',
    stampBonus: undefined,
  },
  {
    id: 'c3',
    name: locale.value === 'en' ? 'New Member Welcome Gift' : locale.value === 'zh-CN' ? '新会员迎新礼' : '新會員迎新禮',
    description: locale.value === 'en' ? 'Register now and receive a special welcome gift pack worth HK$200!' : locale.value === 'zh-CN' ? '立即注册即可获赠价值HK$200的迎新礼包！' : '立即註冊即可獲贈價值HK$200的迎新禮包！',
    coverImage: 'https://via.placeholder.com/750x360/1976D2/FFFFFF?text=Welcome+Gift',
    type: 'gift' as const,
    startDate: '2025-01-01T00:00:00',
    endDate: '2025-12-31T23:59:59',
    stampBonus: 50,
  },
]);

const mockCoupons = reactive([
  {
    id: 'cp1',
    name: locale.value === 'en' ? '$50 Off F&B' : locale.value === 'zh-CN' ? '餐饮满$200减$50' : '餐飲滿$200減$50',
    type: 'discount-amount' as const,
    value: 50,
    minSpending: 200,
    expiryDate: '2025-08-31T23:59:59',
    status: 'active' as const,
  },
  {
    id: 'cp2',
    name: locale.value === 'en' ? '20% Off Fashion' : locale.value === 'zh-CN' ? '时装8折优惠' : '時裝8折優惠',
    type: 'discount-percent' as const,
    value: 20,
    minSpending: 500,
    expiryDate: '2025-09-15T23:59:59',
    status: 'active' as const,
  },
  {
    id: 'cp3',
    name: locale.value === 'en' ? 'Bonus 10 Stamps' : locale.value === 'zh-CN' ? '额外10枚印花' : '額外10枚印花',
    type: 'stamp-bonus' as const,
    value: 10,
    minSpending: 0,
    expiryDate: '2025-07-31T23:59:59',
    status: 'active' as const,
  },
]);

const mockDraws = reactive([
  {
    id: 'ld1',
    name: locale.value === 'en' ? 'Wheel of Fortune' : locale.value === 'zh-CN' ? '幸运大转盘' : '幸運大轉盤',
    image: 'https://via.placeholder.com/400x240/E91E63/FFFFFF?text=Wheel+Spin',
    cost: 10,
    remaining: 3,
  },
  {
    id: 'ld2',
    name: locale.value === 'en' ? 'Scratch & Win' : locale.value === 'zh-CN' ? '刮刮乐' : '刮刮樂',
    image: 'https://via.placeholder.com/400x240/FF6B35/FFFFFF?text=Scratch+Card',
    cost: 5,
    remaining: 5,
  },
]);

const mockGifts = reactive([
  {
    id: 'g1',
    name: locale.value === 'en' ? 'Link Tote Bag' : locale.value === 'zh-CN' ? 'Link环保手提袋' : 'Link環保手提袋',
    image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Tote+Bag',
    stamps: 100,
  },
  {
    id: 'g2',
    name: locale.value === 'en' ? 'Coffee Voucher' : locale.value === 'zh-CN' ? '咖啡兑换券' : '咖啡兌換券',
    image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Coffee',
    stamps: 50,
  },
  {
    id: 'g3',
    name: locale.value === 'en' ? 'Movie Ticket' : locale.value === 'zh-CN' ? '电影票兑换' : '電影票兌換',
    image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Movie',
    stamps: 200,
  },
  {
    id: 'g4',
    name: locale.value === 'en' ? 'Parking Coupon' : locale.value === 'zh-CN' ? '停车优惠券' : '泊車優惠券',
    image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Parking',
    stamps: 80,
  },
]);

function setTab(key: string) {
  activeTab.value = key;
}

function goCampaignDetail(id: string) {
  uni.navigateTo({ url: `/pages/offers/campaign-detail?id=${id}` });
}

function goCouponDetail(id: string) {
  uni.navigateTo({ url: `/pages/offers/coupon-detail?id=${id}` });
}

function goMyCoupons() {
  uni.navigateTo({ url: '/pages/offers/coupon-list' });
}

function goLuckyDraw(id: string) {
  uni.navigateTo({ url: `/pages/offers/lucky-draw?id=${id}` });
}

function goGiftCatalog() {
  uni.navigateTo({ url: '/pages/offers/gift-catalog' });
}

onPullDownRefresh(() => {
  setTimeout(() => uni.stopPullDownRefresh(), 1000);
});
</script>

<style scoped>
.offers-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.category-tabs {
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: inline-flex;
  padding: 0 24rpx;
}

.tab-item {
  padding: 24rpx 32rpx;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background-color: #00A651;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
}

.tab-item.active .tab-text {
  color: #00A651;
  font-weight: 600;
}

.tab-content {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}

.container {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.coupon-actions {
  margin-bottom: 24rpx;
}

.coupon-action-btn {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.action-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.draw-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.draw-image {
  width: 100%;
  height: 240rpx;
}

.draw-info {
  padding: 24rpx;
}

.draw-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.draw-cost {
  display: block;
  font-size: 26rpx;
  color: #00A651;
  margin-bottom: 4rpx;
}

.draw-remaining {
  font-size: 24rpx;
  color: #999999;
}

.gifts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.gift-card {
  width: calc(50% - 10rpx);
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.gift-image {
  width: 100%;
  height: 260rpx;
}

.gift-info {
  padding: 16rpx;
}

.gift-name {
  display: block;
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gift-price {
  display: flex;
  align-items: baseline;
}

.gift-stamps {
  font-size: 32rpx;
  font-weight: 700;
  color: #00A651;
  margin-right: 4rpx;
}

.gift-unit {
  font-size: 22rpx;
  color: #666666;
}
</style>
