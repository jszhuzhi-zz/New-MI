<template>
  <view class="locale-switcher">
    <view
      v-for="item in localeOptions"
      :key="item.value"
      class="locale-option"
      :class="{ active: item.value === currentLocale }"
      @tap="onSelect(item.value)"
    >
      <text class="locale-label">{{ item.label }}</text>
      <view v-if="item.value === currentLocale" class="check-icon">
        <text class="check-mark">&#10003;</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import type { Locale } from '@link-reit/i18n';

const appStore = useAppStore();

const currentLocale = computed(() => appStore.locale);

const localeOptions: { label: string; value: Locale }[] = [
  { label: '繁體中文', value: 'zh-TW' },
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
];

function onSelect(value: Locale) {
  appStore.setLocale(value);
  uni.showToast({
    title: value === 'en' ? 'Language updated' : value === 'zh-CN' ? '语言已更新' : '語言已更新',
    icon: 'success',
    duration: 1500,
  });
}
</script>

<style scoped>
.locale-switcher {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.locale-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.locale-option:last-child {
  border-bottom: none;
}

.locale-option.active {
  background-color: #F0FFF4;
}

.locale-label {
  font-size: 30rpx;
  color: #333333;
}

.locale-option.active .locale-label {
  color: #00A651;
  font-weight: 600;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #00A651;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  color: #FFFFFF;
  font-size: 24rpx;
}
</style>
