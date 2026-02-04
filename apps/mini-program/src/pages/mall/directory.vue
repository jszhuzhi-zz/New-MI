<template>
  <view class="directory-page">
    <!-- Mall Selector -->
    <view class="mall-selector" @tap="showMallPicker">
      <text class="mall-name">{{ selectedMall.name }}</text>
      <text class="mall-arrow">&#9660;</text>
    </view>

    <!-- Floor Tabs -->
    <scroll-view scroll-x class="floor-tabs">
      <view class="floor-row">
        <view
          v-for="floor in floors"
          :key="floor.id"
          class="floor-tab"
          :class="{ active: activeFloor === floor.id }"
          @tap="activeFloor = floor.id"
        >
          <text class="floor-text">{{ floor.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Category Filter -->
    <scroll-view scroll-x class="category-filter">
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

    <!-- Merchant List -->
    <view class="merchant-list">
      <view
        v-for="merchant in filteredMerchants"
        :key="merchant.id"
        class="merchant-item"
        @tap="goMerchantDetail(merchant.id)"
      >
        <image class="merchant-logo" :src="merchant.logo" mode="aspectFill" />
        <view class="merchant-info">
          <text class="merchant-name">{{ merchant.name }}</text>
          <text class="merchant-category">{{ merchant.categoryLabel }}</text>
          <text class="merchant-location">{{ merchant.floor }} | {{ merchant.unit }}</text>
        </view>
        <view v-if="merchant.stampEnabled" class="stamp-tag">
          <text class="stamp-tag-text">{{ stampLabel }}</text>
        </view>
      </view>

      <view v-if="filteredMerchants.length === 0" class="empty-state">
        <text class="empty-text">{{ t('common.noData') }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const activeFloor = ref('all');
const activeCategory = ref('all');

const stampLabel = computed(() => locale.value === 'en' ? 'Stamp' : '印花');

const selectedMall = reactive({
  id: 'mall-1',
  name: locale.value === 'en' ? 'T Town (Tin Shui Wai)' : locale.value === 'zh-CN' ? 'T Town (天水围)' : 'T Town (天水圍)',
});

const floors = computed(() => [
  { id: 'all', name: t('common.all') },
  { id: 'B1', name: 'B1' },
  { id: 'G', name: 'G/F' },
  { id: '1', name: '1/F' },
  { id: '2', name: '2/F' },
  { id: '3', name: '3/F' },
]);

const categories = computed(() => [
  { key: 'all', label: t('common.all') },
  { key: 'food-beverage', label: t('merchant.foodBeverage') },
  { key: 'fashion', label: t('merchant.fashion') },
  { key: 'beauty', label: t('merchant.beauty') },
  { key: 'lifestyle', label: t('merchant.lifestyle') },
  { key: 'services', label: t('merchant.services') },
  { key: 'supermarket', label: t('merchant.supermarket') },
]);

const merchants = reactive([
  { id: 'mc1', name: 'Pacific Coffee', logo: 'https://via.placeholder.com/100x100/795548/FFFFFF?text=PC', category: 'food-beverage', categoryLabel: t('merchant.foodBeverage'), floor: '1/F', floorId: '1', unit: 'Unit 101', stampEnabled: true },
  { id: 'mc2', name: 'UNIQLO', logo: 'https://via.placeholder.com/100x100/E53935/FFFFFF?text=UQ', category: 'fashion', categoryLabel: t('merchant.fashion'), floor: '2/F', floorId: '2', unit: 'Unit 201-205', stampEnabled: true },
  { id: 'mc3', name: 'Mannings', logo: 'https://via.placeholder.com/100x100/1976D2/FFFFFF?text=M', category: 'health', categoryLabel: t('merchant.health'), floor: 'G/F', floorId: 'G', unit: 'Unit G01', stampEnabled: true },
  { id: 'mc4', name: 'Fairwood', logo: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=FW', category: 'food-beverage', categoryLabel: t('merchant.foodBeverage'), floor: '3/F', floorId: '3', unit: 'Unit 301', stampEnabled: true },
  { id: 'mc5', name: "Sa Sa", logo: 'https://via.placeholder.com/100x100/E91E63/FFFFFF?text=SS', category: 'beauty', categoryLabel: t('merchant.beauty'), floor: '1/F', floorId: '1', unit: 'Unit 108', stampEnabled: false },
  { id: 'mc6', name: 'ParknShop', logo: 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=PnS', category: 'supermarket', categoryLabel: t('merchant.supermarket'), floor: 'B1', floorId: 'B1', unit: 'Unit B101', stampEnabled: true },
  { id: 'mc7', name: 'ZARA', logo: 'https://via.placeholder.com/100x100/333333/FFFFFF?text=ZR', category: 'fashion', categoryLabel: t('merchant.fashion'), floor: '2/F', floorId: '2', unit: 'Unit 210-215', stampEnabled: true },
  { id: 'mc8', name: 'Starbucks', logo: 'https://via.placeholder.com/100x100/00704A/FFFFFF?text=SB', category: 'food-beverage', categoryLabel: t('merchant.foodBeverage'), floor: 'G/F', floorId: 'G', unit: 'Unit G05', stampEnabled: true },
]);

const filteredMerchants = computed(() => {
  return merchants.filter((m) => {
    const floorMatch = activeFloor.value === 'all' || m.floorId === activeFloor.value;
    const catMatch = activeCategory.value === 'all' || m.category === activeCategory.value;
    return floorMatch && catMatch;
  });
});

function goMerchantDetail(id: string) {
  uni.navigateTo({ url: `/pages/mall/merchant?id=${id}` });
}

function showMallPicker() {
  uni.showToast({ title: selectedMall.name, icon: 'none' });
}
</script>

<style scoped>
.directory-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.mall-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  padding: 20rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.mall-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-right: 8rpx;
}

.mall-arrow {
  font-size: 18rpx;
  color: #999999;
}

.floor-tabs {
  white-space: nowrap;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.floor-row {
  display: inline-flex;
  padding: 0 16rpx;
}

.floor-tab {
  padding: 20rpx 24rpx;
  position: relative;
}

.floor-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #00A651;
  border-radius: 2rpx;
}

.floor-text {
  font-size: 26rpx;
  color: #666666;
}

.floor-tab.active .floor-text {
  color: #00A651;
  font-weight: 600;
}

.category-filter {
  white-space: nowrap;
  padding: 16rpx 24rpx;
}

.category-row {
  display: inline-flex;
  gap: 12rpx;
}

.category-chip {
  display: inline-block;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  background-color: #FFFFFF;
  border: 1rpx solid #E0E0E0;
}

.category-chip.active {
  background-color: #00A651;
  border-color: #00A651;
}

.category-text {
  font-size: 24rpx;
  color: #666666;
}

.category-chip.active .category-text {
  color: #FFFFFF;
}

.merchant-list {
  padding: 0 24rpx;
}

.merchant-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.merchant-logo {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4rpx;
}

.merchant-category {
  display: block;
  font-size: 24rpx;
  color: #00A651;
  margin-bottom: 4rpx;
}

.merchant-location {
  font-size: 22rpx;
  color: #999999;
}

.stamp-tag {
  background-color: #E8F5E9;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.stamp-tag-text {
  font-size: 20rpx;
  color: #00A651;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
