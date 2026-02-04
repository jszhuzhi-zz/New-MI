<template>
  <view class="parking-page">
    <!-- Parking Status Header -->
    <view class="status-header">
      <view class="status-circle" :class="availabilityClass">
        <text class="available-count">{{ availableSpaces }}</text>
        <text class="available-label">{{ availableLabel }}</text>
      </view>
      <view class="status-info">
        <view class="info-row">
          <text class="info-label">{{ totalLabel }}</text>
          <text class="info-value">{{ totalSpaces }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">{{ occupiedLabel }}</text>
          <text class="info-value">{{ occupiedSpaces }}</text>
        </view>
        <text class="update-time">{{ lastUpdateLabel }}: {{ lastUpdate }}</text>
      </view>
    </view>

    <!-- Floor Breakdown -->
    <view class="floor-section card">
      <text class="section-title">{{ floorBreakdownTitle }}</text>
      <view v-for="floor in parkingFloors" :key="floor.name" class="floor-item">
        <text class="floor-name">{{ floor.name }}</text>
        <view class="floor-bar">
          <view class="floor-fill" :style="{ width: floor.occupancyPercent + '%' }" :class="getBarClass(floor.occupancyPercent)" />
        </view>
        <text class="floor-count">{{ floor.available }}/{{ floor.total }}</text>
      </view>
    </view>

    <!-- Parking Rates -->
    <view class="rates-section card">
      <text class="section-title">{{ ratesTitle }}</text>
      <view class="rate-item">
        <text class="rate-label">{{ weekdayLabel }}</text>
        <text class="rate-value">{{ weekdayRate }}</text>
      </view>
      <view class="divider" />
      <view class="rate-item">
        <text class="rate-label">{{ weekendLabel }}</text>
        <text class="rate-value">{{ weekendRate }}</text>
      </view>
      <view class="divider" />
      <view class="rate-item">
        <text class="rate-label">{{ maxDailyLabel }}</text>
        <text class="rate-value">{{ maxDailyRate }}</text>
      </view>
    </view>

    <!-- Member Benefits -->
    <view class="benefits-section card">
      <text class="section-title">{{ memberBenefitsTitle }}</text>
      <view v-for="(benefit, index) in parkingBenefits" :key="index" class="benefit-item">
        <TierBadge :tier-name="benefit.tier" :tier-level="benefit.level" size="small" />
        <text class="benefit-text">{{ benefit.description }}</text>
      </view>
    </view>

    <!-- EV Charging -->
    <view class="ev-section card">
      <view class="ev-header">
        <text class="ev-icon">\u{26A1}</text>
        <text class="section-title">{{ evTitle }}</text>
      </view>
      <text class="ev-desc">{{ evDescription }}</text>
      <view class="ev-stats">
        <view class="ev-stat">
          <text class="ev-stat-value">{{ evAvailable }}</text>
          <text class="ev-stat-label">{{ availableLabel }}</text>
        </view>
        <view class="ev-stat">
          <text class="ev-stat-value">{{ evTotal }}</text>
          <text class="ev-stat-label">{{ totalLabel }}</text>
        </view>
      </view>
    </view>

    <!-- Navigate Button -->
    <view class="nav-section">
      <view class="nav-btn" @tap="navigateToParking">
        <text class="nav-text">{{ navigateLabel }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from '@/utils/i18n';
import { openLocation } from '@/services/wechat';
import TierBadge from '@/components/TierBadge.vue';

const { t, locale } = useI18n();

// Mock data
const totalSpaces = ref(800);
const occupiedSpaces = ref(623);
const availableSpaces = computed(() => totalSpaces.value - occupiedSpaces.value);
const lastUpdate = ref('14:30');

const evAvailable = ref(4);
const evTotal = ref(12);

const availabilityClass = computed(() => {
  const percent = (occupiedSpaces.value / totalSpaces.value) * 100;
  if (percent >= 90) return 'status-full';
  if (percent >= 70) return 'status-busy';
  return 'status-available';
});

// Labels
const availableLabel = computed(() => locale.value === 'en' ? 'Available' : locale.value === 'zh-CN' ? '空位' : '空位');
const totalLabel = computed(() => locale.value === 'en' ? 'Total' : locale.value === 'zh-CN' ? '总数' : '總數');
const occupiedLabel = computed(() => locale.value === 'en' ? 'Occupied' : locale.value === 'zh-CN' ? '已占用' : '已佔用');
const lastUpdateLabel = computed(() => locale.value === 'en' ? 'Last updated' : locale.value === 'zh-CN' ? '最后更新' : '最後更新');
const floorBreakdownTitle = computed(() => locale.value === 'en' ? 'Floor Breakdown' : locale.value === 'zh-CN' ? '各层车位' : '各層車位');
const ratesTitle = computed(() => locale.value === 'en' ? 'Parking Rates' : locale.value === 'zh-CN' ? '停车收费' : '停車收費');
const weekdayLabel = computed(() => locale.value === 'en' ? 'Mon-Fri' : locale.value === 'zh-CN' ? '周一至周五' : '週一至週五');
const weekendLabel = computed(() => locale.value === 'en' ? 'Sat, Sun & PH' : locale.value === 'zh-CN' ? '周六、日及公众假期' : '週六、日及公眾假期');
const maxDailyLabel = computed(() => locale.value === 'en' ? 'Max daily' : locale.value === 'zh-CN' ? '每日上限' : '每日上限');
const weekdayRate = computed(() => 'HK$18 / 30 min');
const weekendRate = computed(() => 'HK$22 / 30 min');
const maxDailyRate = computed(() => 'HK$380');
const memberBenefitsTitle = computed(() => locale.value === 'en' ? 'Member Parking Benefits' : locale.value === 'zh-CN' ? '会员泊车优惠' : '會員泊車優惠');
const evTitle = computed(() => locale.value === 'en' ? 'EV Charging' : locale.value === 'zh-CN' ? '电动车充电' : '電動車充電');
const evDescription = computed(() => locale.value === 'en' ? 'EV charging stations available at B2 level.' : locale.value === 'zh-CN' ? '电动车充电站位于B2层。' : '電動車充電站位於B2層。');
const navigateLabel = computed(() => locale.value === 'en' ? 'Navigate to Car Park' : locale.value === 'zh-CN' ? '导航至停车场' : '導航至停車場');

const parkingFloors = reactive([
  { name: 'B1', total: 200, available: 45, occupancyPercent: 78 },
  { name: 'B2', total: 300, available: 82, occupancyPercent: 73 },
  { name: 'B3', total: 300, available: 50, occupancyPercent: 83 },
]);

const parkingBenefits = computed(() => {
  if (locale.value === 'en') {
    return [
      { tier: 'Silver', level: 2, description: '1 hour free parking with $200 spending' },
      { tier: 'Gold', level: 3, description: '2 hours free parking with $200 spending' },
      { tier: 'Diamond', level: 4, description: '3 hours free parking with any spending' },
    ];
  }
  const zhS = locale.value === 'zh-CN';
  return [
    { tier: zhS ? '银卡' : '銀卡', level: 2, description: zhS ? '消费满$200免费泊车1小时' : '消費滿$200免費泊車1小時' },
    { tier: '金卡', level: 3, description: zhS ? '消费满$200免费泊车2小时' : '消費滿$200免費泊車2小時' },
    { tier: zhS ? '钻石卡' : '鑽石卡', level: 4, description: zhS ? '任意消费免费泊车3小时' : '任意消費免費泊車3小時' },
  ];
});

function getBarClass(percent: number): string {
  if (percent >= 90) return 'bar-full';
  if (percent >= 70) return 'bar-busy';
  return 'bar-available';
}

function navigateToParking() {
  openLocation({
    latitude: 22.4681,
    longitude: 114.0027,
    name: locale.value === 'en' ? 'T Town Car Park' : 'T Town停車場',
    address: 'B1-B3',
  });
}
</script>

<style scoped>
.parking-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.status-header {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.status-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
  flex-shrink: 0;
}

.status-available { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
.status-busy { background: linear-gradient(135deg, #FFF8E1, #FFE082); }
.status-full { background: linear-gradient(135deg, #FFEBEE, #EF9A9A); }

.available-count {
  font-size: 52rpx;
  font-weight: 800;
  line-height: 1;
}

.status-available .available-count { color: #00A651; }
.status-busy .available-count { color: #F5A623; }
.status-full .available-count { color: #E53935; }

.available-label {
  font-size: 22rpx;
  margin-top: 4rpx;
}

.status-available .available-label { color: #2E7D32; }
.status-busy .available-label { color: #F57F17; }
.status-full .available-label { color: #C62828; }

.status-info {
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 26rpx;
  color: #999999;
}

.info-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: 600;
}

.update-time {
  font-size: 22rpx;
  color: #CCCCCC;
  margin-top: 8rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.floor-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.floor-item:last-child {
  margin-bottom: 0;
}

.floor-name {
  width: 60rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #333333;
}

.floor-bar {
  flex: 1;
  height: 16rpx;
  background-color: #F0F0F0;
  border-radius: 8rpx;
  overflow: hidden;
  margin: 0 16rpx;
}

.floor-fill {
  height: 100%;
  border-radius: 8rpx;
}

.bar-available { background-color: #00A651; }
.bar-busy { background-color: #F5A623; }
.bar-full { background-color: #E53935; }

.floor-count {
  font-size: 24rpx;
  color: #666666;
  width: 100rpx;
  text-align: right;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
}

.rate-label {
  font-size: 26rpx;
  color: #666666;
}

.rate-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: 600;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-text {
  font-size: 26rpx;
  color: #333333;
  margin-left: 16rpx;
}

.ev-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.ev-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.ev-desc {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.ev-stats {
  display: flex;
  gap: 32rpx;
}

.ev-stat {
  display: flex;
  align-items: baseline;
}

.ev-stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #00A651;
  margin-right: 8rpx;
}

.ev-stat-label {
  font-size: 22rpx;
  color: #999999;
}

.nav-section {
  padding: 12rpx 0 24rpx;
}

.nav-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
}

.nav-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
