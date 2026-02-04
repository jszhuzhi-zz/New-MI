<template>
  <view class="tier-page">
    <!-- Current Tier Card -->
    <view class="current-tier-card" :style="{ background: currentTier.bgGradient }">
      <TierBadge :tier-name="currentTier.name" :tier-level="currentTier.level" size="large" />
      <text class="tier-description">{{ currentTier.description }}</text>
    </view>

    <!-- Progress to Next Tier -->
    <view class="progress-section card">
      <text class="section-title">{{ progressTitle }}</text>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </view>
      <view class="progress-labels">
        <text class="progress-current">{{ currentTier.name }}</text>
        <text class="progress-target">{{ nextTier.name }}</text>
      </view>
      <text class="progress-text">{{ progressLabel }}</text>
    </view>

    <!-- All Tiers -->
    <view class="tiers-section">
      <text class="section-title-outer">{{ allTiersTitle }}</text>
      <view
        v-for="tier in allTiers"
        :key="tier.level"
        class="tier-card card"
        :class="{ 'tier-current': tier.level === currentTier.level }"
      >
        <view class="tier-header-row">
          <TierBadge :tier-name="tier.name" :tier-level="tier.level" />
          <text v-if="tier.level === currentTier.level" class="current-label">{{ currentLabel }}</text>
          <text class="tier-requirement">{{ tier.requirement }}</text>
        </view>
        <view class="benefits-list">
          <view v-for="(benefit, index) in tier.benefits" :key="index" class="benefit-item">
            <text class="benefit-check">\u2713</text>
            <text class="benefit-text">{{ benefit }}</text>
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
import TierBadge from '@/components/TierBadge.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const progressPercent = ref(68);

// Labels
const progressTitle = computed(() => locale.value === 'en' ? 'Tier Progress' : locale.value === 'zh-CN' ? '等级进度' : '等級進度');
const allTiersTitle = computed(() => locale.value === 'en' ? 'All Membership Tiers' : locale.value === 'zh-CN' ? '所有会员等级' : '所有會員等級');
const currentLabel = computed(() => locale.value === 'en' ? 'Current' : locale.value === 'zh-CN' ? '当前' : '當前');

const currentTier = reactive({
  name: locale.value === 'en' ? 'Gold' : '金卡',
  level: 3,
  description: locale.value === 'en'
    ? 'Enjoy 1.5x stamp earning and exclusive privileges'
    : locale.value === 'zh-CN'
      ? '享受1.5倍印花获取及专属权益'
      : '享受1.5倍印花獲取及專屬權益',
  bgGradient: 'linear-gradient(135deg, #FFD54F, #FFC107)',
});

const nextTier = reactive({
  name: locale.value === 'en' ? 'Diamond' : '鑽石卡',
  level: 4,
});

const progressLabel = computed(() => {
  if (locale.value === 'en') return '320 stamps needed for Diamond tier';
  if (locale.value === 'zh-CN') return '距钻石卡还需 320 印花';
  return '距鑽石卡還需 320 印花';
});

const allTiers = computed(() => {
  if (locale.value === 'en') {
    return [
      { level: 1, name: 'Standard', requirement: '0 stamps', benefits: ['1x stamp earning', 'Member exclusive offers', 'Birthday reward'] },
      { level: 2, name: 'Silver', requirement: '200 stamps', benefits: ['1.2x stamp earning', 'All Standard benefits', 'Priority customer service', 'Free parking 1 hour'] },
      { level: 3, name: 'Gold', requirement: '500 stamps', benefits: ['1.5x stamp earning', 'All Silver benefits', 'VIP lounge access', 'Free parking 2 hours', 'Exclusive event invitations'] },
      { level: 4, name: 'Diamond', requirement: '1,000 stamps', benefits: ['2x stamp earning', 'All Gold benefits', 'Personal concierge', 'Free parking 3 hours', 'Priority lucky draw entry', 'Annual gift package'] },
    ];
  }
  const zhS = locale.value === 'zh-CN';
  return [
    { level: 1, name: zhS ? '普通卡' : '普通卡', requirement: '0 ' + t('stamp.stamp'), benefits: [zhS ? '1倍印花获取' : '1倍印花獲取', zhS ? '会员专属优惠' : '會員專屬優惠', zhS ? '生日奖励' : '生日獎勵'] },
    { level: 2, name: zhS ? '银卡' : '銀卡', requirement: '200 ' + t('stamp.stamp'), benefits: [zhS ? '1.2倍印花获取' : '1.2倍印花獲取', zhS ? '普通卡所有权益' : '普通卡所有權益', zhS ? '优先客户服务' : '優先客戶服務', zhS ? '免费泊车1小时' : '免費泊車1小時'] },
    { level: 3, name: '金卡', requirement: '500 ' + t('stamp.stamp'), benefits: [zhS ? '1.5倍印花获取' : '1.5倍印花獲取', zhS ? '银卡所有权益' : '銀卡所有權益', zhS ? 'VIP贵宾室' : 'VIP貴賓室', zhS ? '免费泊车2小时' : '免費泊車2小時', zhS ? '专属活动邀请' : '專屬活動邀請'] },
    { level: 4, name: zhS ? '钻石卡' : '鑽石卡', requirement: '1,000 ' + t('stamp.stamp'), benefits: [zhS ? '2倍印花获取' : '2倍印花獲取', zhS ? '金卡所有权益' : '金卡所有權益', zhS ? '私人礼宾服务' : '私人禮賓服務', zhS ? '免费泊车3小时' : '免費泊車3小時', zhS ? '优先抽奖资格' : '優先抽獎資格', zhS ? '年度礼包' : '年度禮包'] },
  ];
});

</script>

<style scoped>
.tier-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.current-tier-card {
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 193, 7, 0.3);
}

.tier-description {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.6);
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
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.section-title-outer {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 16rpx;
  background-color: #E0E0E0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD54F, #FFC107);
  border-radius: 8rpx;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.progress-current,
.progress-target {
  font-size: 22rpx;
  color: #999999;
}

.progress-text {
  font-size: 24rpx;
  color: #666666;
}

.tier-card.tier-current {
  border: 2rpx solid #FFD54F;
}

.tier-header-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.current-label {
  font-size: 22rpx;
  color: #00A651;
  background-color: #E8F5E9;
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  margin-left: 12rpx;
}

.tier-requirement {
  font-size: 22rpx;
  color: #999999;
  margin-left: auto;
}

.benefits-list {
  padding-left: 8rpx;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-check {
  color: #00A651;
  font-size: 24rpx;
  margin-right: 12rpx;
}

.benefit-text {
  font-size: 26rpx;
  color: #333333;
}
</style>
