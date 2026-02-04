<template>
  <view class="services-page">
    <!-- Service Categories -->
    <view class="category-section">
      <view
        v-for="cat in serviceCategories"
        :key="cat.key"
        class="category-card"
        :class="{ active: activeCategory === cat.key }"
        @tap="activeCategory = cat.key"
      >
        <text class="cat-icon">{{ cat.icon }}</text>
        <text class="cat-label">{{ cat.label }}</text>
      </view>
    </view>

    <!-- Service List -->
    <view class="service-list">
      <view
        v-for="service in filteredServices"
        :key="service.id"
        class="service-item card"
      >
        <view class="service-header">
          <text class="service-icon">{{ service.icon }}</text>
          <view class="service-info">
            <text class="service-name">{{ service.name }}</text>
            <text class="service-desc">{{ service.description }}</text>
          </view>
        </view>
        <view class="service-details">
          <view class="detail-row">
            <text class="detail-label">{{ locationLabel }}</text>
            <text class="detail-value">{{ service.location }}</text>
          </view>
          <view v-if="service.phone" class="detail-row" @tap="callPhone(service.phone)">
            <text class="detail-label">{{ phoneLabel }}</text>
            <text class="detail-value link">{{ service.phone }}</text>
          </view>
          <view v-if="service.hours" class="detail-row">
            <text class="detail-label">{{ hoursLabel }}</text>
            <text class="detail-value">{{ service.hours }}</text>
          </view>
        </view>
      </view>

      <view v-if="filteredServices.length === 0" class="empty-state">
        <text class="empty-text">{{ t('common.noData') }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from '@/utils/i18n';
import { makePhoneCall } from '@/services/wechat';

const { t, locale } = useI18n();
const activeCategory = ref('all');

// Labels
const locationLabel = computed(() => t('merchant.location'));
const phoneLabel = computed(() => locale.value === 'en' ? 'Phone' : locale.value === 'zh-CN' ? '电话' : '電話');
const hoursLabel = computed(() => t('merchant.operatingHours'));

const serviceCategories = computed(() => [
  { key: 'all', icon: '\u{1F4CB}', label: t('common.all') },
  { key: 'info', icon: '\u{2139}', label: locale.value === 'en' ? 'Information' : locale.value === 'zh-CN' ? '咨询' : '諮詢' },
  { key: 'facility', icon: '\u{1F3E2}', label: locale.value === 'en' ? 'Facilities' : locale.value === 'zh-CN' ? '设施' : '設施' },
  { key: 'transport', icon: '\u{1F68C}', label: locale.value === 'en' ? 'Transport' : locale.value === 'zh-CN' ? '交通' : '交通' },
  { key: 'other', icon: '\u{2699}', label: locale.value === 'en' ? 'Other' : locale.value === 'zh-CN' ? '其他' : '其他' },
]);

const services = reactive([
  { id: 's1', icon: '\u{1F4AC}', name: locale.value === 'en' ? 'Customer Service Counter' : locale.value === 'zh-CN' ? '客户服务台' : '客戶服務台', description: locale.value === 'en' ? 'Membership registration, enquiries, stamp issues' : locale.value === 'zh-CN' ? '会员注册、查询、印花处理' : '會員註冊、查詢、印花處理', location: 'G/F, Near Entrance A', phone: '+852 2345 6789', hours: '10:00 - 22:00', category: 'info' },
  { id: 's2', icon: '\u{1F6BB}', name: locale.value === 'en' ? 'Restrooms' : locale.value === 'zh-CN' ? '洗手间' : '洗手間', description: locale.value === 'en' ? 'Available on every floor' : locale.value === 'zh-CN' ? '每层均有' : '每層均有', location: locale.value === 'en' ? 'Near escalators on each floor' : locale.value === 'zh-CN' ? '各层扶手电梯附近' : '各層扶手電梯附近', phone: '', hours: '', category: 'facility' },
  { id: 's3', icon: '\u{1F697}', name: locale.value === 'en' ? 'Car Park' : locale.value === 'zh-CN' ? '停车场' : '停車場', description: locale.value === 'en' ? 'Smart parking with EV charging' : locale.value === 'zh-CN' ? '智能停车，配备电动车充电桩' : '智能停車，配備電動車充電樁', location: 'B1-B3', phone: '+852 2345 6790', hours: '06:00 - 01:00', category: 'transport' },
  { id: 's4', icon: '\u{1F476}', name: locale.value === 'en' ? 'Baby Care Room' : locale.value === 'zh-CN' ? '母婴室' : '母嬰室', description: locale.value === 'en' ? 'Nursing and diaper changing facilities' : locale.value === 'zh-CN' ? '哺乳及换尿片设施' : '哺乳及換尿片設施', location: '2/F, Near Restrooms', phone: '', hours: '10:00 - 22:00', category: 'facility' },
  { id: 's5', icon: '\u{1F4E6}', name: locale.value === 'en' ? 'Locker Service' : locale.value === 'zh-CN' ? '储物柜服务' : '儲物櫃服務', description: locale.value === 'en' ? 'Self-service lockers for shopping' : locale.value === 'zh-CN' ? '自助储物柜' : '自助儲物櫃', location: 'B1, Near Entrance B', phone: '', hours: '08:00 - 23:00', category: 'other' },
  { id: 's6', icon: '\u{1F68C}', name: locale.value === 'en' ? 'Bus Terminal' : locale.value === 'zh-CN' ? '巴士总站' : '巴士總站', description: locale.value === 'en' ? 'Multiple bus routes available' : locale.value === 'zh-CN' ? '多条巴士路线可选' : '多條巴士路線可選', location: locale.value === 'en' ? 'Ground floor, South exit' : locale.value === 'zh-CN' ? '地面层，南出口' : '地面層，南出口', phone: '', hours: '', category: 'transport' },
]);

const filteredServices = computed(() => {
  if (activeCategory.value === 'all') return services;
  return services.filter((s) => s.category === activeCategory.value);
});

function callPhone(phone: string) {
  if (phone) makePhoneCall(phone.replace(/\s/g, ''));
}
</script>

<style scoped>
.services-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.category-section {
  display: flex;
  padding: 24rpx;
  gap: 16rpx;
  background: #FFFFFF;
}

.category-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
  background: #F5F6FA;
}

.category-card.active {
  background: #E8F5E9;
}

.cat-icon {
  font-size: 32rpx;
  margin-bottom: 6rpx;
}

.cat-label {
  font-size: 22rpx;
  color: #666666;
}

.category-card.active .cat-label {
  color: #00A651;
  font-weight: 600;
}

.service-list {
  padding: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.service-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.service-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.service-info {
  flex: 1;
}

.service-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4rpx;
}

.service-desc {
  font-size: 24rpx;
  color: #666666;
}

.service-details {
  padding-top: 16rpx;
  border-top: 1rpx solid #F5F5F5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.detail-label {
  font-size: 24rpx;
  color: #999999;
}

.detail-value {
  font-size: 24rpx;
  color: #333333;
}

.detail-value.link {
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
