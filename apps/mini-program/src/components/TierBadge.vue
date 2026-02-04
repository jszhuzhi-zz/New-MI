<template>
  <view class="tier-badge" :class="[tierClass, `size-${size}`]">
    <text class="tier-icon">{{ tierIcon }}</text>
    <text class="tier-text">{{ tierName }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  tierName: string;
  tierLevel: number;
  size?: 'small' | 'medium' | 'large';
}>(), {
  size: 'medium',
});

const tierClass = computed(() => {
  if (props.tierLevel >= 4) return 'tier-diamond';
  if (props.tierLevel >= 3) return 'tier-gold';
  if (props.tierLevel >= 2) return 'tier-silver';
  return 'tier-standard';
});

const tierIcon = computed(() => {
  if (props.tierLevel >= 4) return '\u2666'; // diamond
  if (props.tierLevel >= 3) return '\u2605'; // star
  if (props.tierLevel >= 2) return '\u25C6'; // filled diamond
  return '\u25CF'; // filled circle
});
</script>

<style scoped>
.tier-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 20rpx;
  padding: 4rpx 16rpx;
}

.size-small {
  padding: 2rpx 12rpx;
}

.size-small .tier-icon {
  font-size: 18rpx;
  margin-right: 4rpx;
}

.size-small .tier-text {
  font-size: 20rpx;
}

.size-medium .tier-icon {
  font-size: 22rpx;
  margin-right: 6rpx;
}

.size-medium .tier-text {
  font-size: 24rpx;
}

.size-large {
  padding: 8rpx 24rpx;
}

.size-large .tier-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.size-large .tier-text {
  font-size: 30rpx;
  font-weight: 600;
}

.tier-standard {
  background: linear-gradient(135deg, #B0BEC5, #CFD8DC);
}
.tier-standard .tier-icon,
.tier-standard .tier-text {
  color: #546E7A;
}

.tier-silver {
  background: linear-gradient(135deg, #E0E0E0, #F5F5F5);
}
.tier-silver .tier-icon,
.tier-silver .tier-text {
  color: #616161;
}

.tier-gold {
  background: linear-gradient(135deg, #FFD54F, #FFF176);
}
.tier-gold .tier-icon,
.tier-gold .tier-text {
  color: #F57F17;
}

.tier-diamond {
  background: linear-gradient(135deg, #80D8FF, #B3E5FC);
}
.tier-diamond .tier-icon,
.tier-diamond .tier-text {
  color: #01579B;
}
</style>
