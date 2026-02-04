<template>
  <view class="gift-catalog-page">
    <!-- Balance Bar -->
    <view class="balance-bar">
      <text class="balance-text">{{ balanceLabel }}: </text>
      <text class="balance-value">{{ stampBalance }}</text>
      <text class="balance-unit">{{ t('stamp.stamp') }}</text>
    </view>

    <!-- Category Filter -->
    <scroll-view scroll-x class="category-scroll">
      <view class="category-row">
        <view
          v-for="cat in categories"
          :key="cat.key"
          class="category-chip"
          :class="{ active: activeCategory === cat.key }"
          @tap="activeCategory = cat.key"
        >
          <text class="category-text">{{ cat.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Gifts Grid -->
    <view class="gifts-container">
      <view class="gifts-grid">
        <view
          v-for="gift in filteredGifts"
          :key="gift.id"
          class="gift-card"
          @tap="showGiftDetail(gift)"
        >
          <image class="gift-image" :src="gift.image" mode="aspectFill" />
          <view class="gift-info">
            <text class="gift-name">{{ gift.name }}</text>
            <view class="gift-price-row">
              <text class="gift-stamps">{{ gift.stamps }}</text>
              <text class="gift-unit">{{ t('stamp.stamp') }}</text>
            </view>
            <text class="gift-stock">{{ stockLabel }}: {{ gift.remaining }}</text>
          </view>
          <view v-if="gift.stamps > stampBalance" class="insufficient-badge">
            <text class="insufficient-text">{{ insufficientLabel }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const stampBalance = computed(() => authStore.stampBalance || 568);
const activeCategory = ref('all');

// Labels
const balanceLabel = computed(() => locale.value === 'en' ? 'My Stamps' : locale.value === 'zh-CN' ? '我的印花' : '我的印花');
const stockLabel = computed(() => locale.value === 'en' ? 'Remaining' : locale.value === 'zh-CN' ? '剩余' : '剩餘');
const insufficientLabel = computed(() => locale.value === 'en' ? 'Insufficient' : locale.value === 'zh-CN' ? '印花不足' : '印花不足');

const categories = computed(() => [
  { key: 'all', label: t('common.all') },
  { key: 'coupon', label: t('campaign.coupon') },
  { key: 'physical', label: locale.value === 'en' ? 'Physical' : locale.value === 'zh-CN' ? '实物' : '實物' },
  { key: 'experience', label: locale.value === 'en' ? 'Experience' : locale.value === 'zh-CN' ? '体验' : '體驗' },
  { key: 'digital', label: locale.value === 'en' ? 'Digital' : locale.value === 'zh-CN' ? '虚拟' : '虛擬' },
]);

const gifts = reactive([
  { id: 'g1', name: locale.value === 'en' ? 'Link Tote Bag' : 'Link環保手提袋', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Tote', stamps: 100, remaining: 50, category: 'physical' },
  { id: 'g2', name: locale.value === 'en' ? 'Coffee Voucher' : '咖啡兌換券', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Coffee', stamps: 50, remaining: 200, category: 'coupon' },
  { id: 'g3', name: locale.value === 'en' ? 'Movie Ticket' : '電影票', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Movie', stamps: 200, remaining: 30, category: 'experience' },
  { id: 'g4', name: locale.value === 'en' ? 'Parking Coupon 2H' : '2小時泊車券', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Parking', stamps: 80, remaining: 100, category: 'coupon' },
  { id: 'g5', name: locale.value === 'en' ? '$50 Shopping Voucher' : '$50購物禮券', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=$50', stamps: 150, remaining: 80, category: 'coupon' },
  { id: 'g6', name: locale.value === 'en' ? 'Link Umbrella' : 'Link雨傘', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Umbrella', stamps: 120, remaining: 25, category: 'physical' },
  { id: 'g7', name: locale.value === 'en' ? 'Yoga Class Pass' : '瑜伽課體驗券', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Yoga', stamps: 300, remaining: 15, category: 'experience' },
  { id: 'g8', name: locale.value === 'en' ? 'Spotify 1-Month' : 'Spotify一個月會員', image: 'https://via.placeholder.com/300x300/F5F5F5/333333?text=Spotify', stamps: 500, remaining: 10, category: 'digital' },
]);

const filteredGifts = computed(() => {
  if (activeCategory.value === 'all') return gifts;
  return gifts.filter((g) => g.category === activeCategory.value);
});

function showGiftDetail(gift: typeof gifts[0]) {
  if (gift.stamps > stampBalance.value) {
    uni.showToast({
      title: locale.value === 'en' ? 'Insufficient stamps' : locale.value === 'zh-CN' ? '印花不足' : '印花不足',
      icon: 'none',
    });
    return;
  }
  uni.showModal({
    title: locale.value === 'en' ? 'Redeem Gift' : locale.value === 'zh-CN' ? '兑换礼品' : '兌換禮品',
    content: locale.value === 'en'
      ? `Redeem "${gift.name}" for ${gift.stamps} stamps?`
      : `确认使用 ${gift.stamps} 印花兌換「${gift.name}」？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: locale.value === 'en' ? 'Redeemed!' : locale.value === 'zh-CN' ? '兑换成功！' : '兌換成功！',
          icon: 'success',
        });
      }
    },
  });
}
</script>

<style scoped>
.gift-catalog-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.balance-bar {
  background: linear-gradient(135deg, #00A651, #00C853);
  padding: 24rpx 32rpx;
  display: flex;
  align-items: baseline;
}

.balance-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
}

.balance-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 4rpx;
}

.balance-unit {
  color: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
}

.category-scroll {
  white-space: nowrap;
  background: #FFFFFF;
  padding: 16rpx 24rpx;
}

.category-row {
  display: inline-flex;
  gap: 16rpx;
}

.category-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  border-radius: 28rpx;
  background-color: #F5F6FA;
}

.category-chip.active {
  background-color: #00A651;
}

.category-text {
  font-size: 26rpx;
  color: #666666;
}

.category-chip.active .category-text {
  color: #FFFFFF;
}

.gifts-container {
  padding: 24rpx;
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
  position: relative;
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

.gift-price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 4rpx;
}

.gift-stamps {
  font-size: 36rpx;
  font-weight: 700;
  color: #00A651;
  margin-right: 4rpx;
}

.gift-unit {
  font-size: 22rpx;
  color: #666666;
}

.gift-stock {
  font-size: 20rpx;
  color: #999999;
}

.insufficient-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.insufficient-text {
  font-size: 20rpx;
  color: #FFFFFF;
}
</style>
