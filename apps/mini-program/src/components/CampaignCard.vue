<template>
  <view class="campaign-card" @tap="onTap">
    <image class="campaign-image" :src="coverImage" mode="aspectFill" />
    <view class="campaign-info">
      <view class="campaign-tag" :class="typeClass">
        <text class="tag-text">{{ typeLabel }}</text>
      </view>
      <text class="campaign-name">{{ name }}</text>
      <text class="campaign-desc">{{ description }}</text>
      <view class="campaign-footer">
        <text class="campaign-date">{{ dateRange }}</text>
        <view v-if="stampBonus" class="stamp-bonus">
          <text class="bonus-text">+{{ stampBonus }} {{ t('stamp.stamp') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const props = defineProps<{
  id: string;
  name: string;
  description: string;
  coverImage: string;
  type: 'stamp-bonus' | 'stamp-multiplier' | 'coupon' | 'lucky-draw' | 'gift' | 'event' | 'promotion';
  startDate: string;
  endDate: string;
  stampBonus?: number;
}>();

const emit = defineEmits<{
  (e: 'tap', id: string): void;
}>();

const typeClass = computed(() => `type-${props.type}`);

const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    'stamp-bonus': t('campaign.stampBonus'),
    'stamp-multiplier': t('campaign.stampMultiplier'),
    coupon: t('campaign.coupon'),
    'lucky-draw': t('campaign.luckyDraw'),
    gift: t('campaign.gift'),
    event: t('campaign.event'),
    promotion: t('campaign.promotion'),
  };
  return labels[props.type] || props.type;
});

const dateRange = computed(() => {
  const start = props.startDate.slice(0, 10);
  const end = props.endDate.slice(0, 10);
  return `${start} - ${end}`;
});

function onTap() {
  emit('tap', props.id);
}
</script>

<style scoped>
.campaign-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
}

.campaign-image {
  width: 100%;
  height: 320rpx;
}

.campaign-info {
  padding: 24rpx;
}

.campaign-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  margin-bottom: 12rpx;
}

.type-stamp-bonus,
.type-stamp-multiplier {
  background-color: #E8F5E9;
}
.type-stamp-bonus .tag-text,
.type-stamp-multiplier .tag-text {
  color: #00A651;
  font-size: 22rpx;
}

.type-coupon {
  background-color: #FFF3E0;
}
.type-coupon .tag-text {
  color: #FF6B35;
  font-size: 22rpx;
}

.type-lucky-draw {
  background-color: #FCE4EC;
}
.type-lucky-draw .tag-text {
  color: #E91E63;
  font-size: 22rpx;
}

.type-gift {
  background-color: #E3F2FD;
}
.type-gift .tag-text {
  color: #1976D2;
  font-size: 22rpx;
}

.type-event,
.type-promotion {
  background-color: #F3E5F5;
}
.type-event .tag-text,
.type-promotion .tag-text {
  color: #7B1FA2;
  font-size: 22rpx;
}

.campaign-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.campaign-desc {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.campaign-date {
  font-size: 22rpx;
  color: #999999;
}

.stamp-bonus {
  background: linear-gradient(135deg, #00A651, #00C853);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.bonus-text {
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 600;
}
</style>
