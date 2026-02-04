<template>
  <view class="messages-page">
    <!-- Message Categories -->
    <view class="category-tabs">
      <view
        v-for="tab in categoryTabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeCategory === tab.key }"
        @tap="activeCategory = tab.key"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.unread > 0" class="unread-dot" />
      </view>
    </view>

    <!-- Messages List -->
    <view class="messages-list">
      <view
        v-for="msg in filteredMessages"
        :key="msg.id"
        class="message-item"
        :class="{ unread: !msg.read }"
        @tap="readMessage(msg)"
      >
        <view class="msg-icon" :class="'type-' + msg.type">
          <text class="msg-icon-text">{{ getTypeIcon(msg.type) }}</text>
        </view>
        <view class="msg-content">
          <view class="msg-header">
            <text class="msg-title">{{ msg.title }}</text>
            <text class="msg-time">{{ msg.time }}</text>
          </view>
          <text class="msg-body">{{ msg.body }}</text>
        </view>
        <view v-if="!msg.read" class="read-indicator" />
      </view>

      <view v-if="filteredMessages.length === 0" class="empty-state">
        <text class="empty-icon">\u{1F4EC}</text>
        <text class="empty-text">{{ t('common.noData') }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();
const activeCategory = ref('all');

const categoryTabs = computed(() => [
  { key: 'all', label: t('common.all'), unread: 2 },
  { key: 'system', label: locale.value === 'en' ? 'System' : locale.value === 'zh-CN' ? '系统' : '系統', unread: 0 },
  { key: 'campaign', label: t('campaign.campaign'), unread: 1 },
  { key: 'stamp', label: t('stamp.stamp'), unread: 1 },
]);

const messages = reactive([
  {
    id: 'm1',
    type: 'campaign',
    title: locale.value === 'en' ? 'Summer Campaign Started!' : locale.value === 'zh-CN' ? '夏日活动已开始！' : '夏日活動已開始！',
    body: locale.value === 'en' ? 'Double stamps on all F&B purchases this summer. Don\'t miss out!' : locale.value === 'zh-CN' ? '今夏餐饮消费双倍印花，不要错过！' : '今夏餐飲消費雙倍印花，不要錯過！',
    time: '2025-07-20 10:00',
    read: false,
  },
  {
    id: 'm2',
    type: 'stamp',
    title: locale.value === 'en' ? 'Stamps Earned +15' : locale.value === 'zh-CN' ? '印花获取 +15' : '印花獲取 +15',
    body: locale.value === 'en' ? 'You earned 15 stamps from Pacific Coffee. Your balance is now 568.' : locale.value === 'zh-CN' ? '您从Pacific Coffee获得15枚印花。当前余额568。' : '您從Pacific Coffee獲得15枚印花。當前餘額568。',
    time: '2025-07-20 14:30',
    read: false,
  },
  {
    id: 'm3',
    type: 'system',
    title: locale.value === 'en' ? 'App Update Available' : locale.value === 'zh-CN' ? '小程序已更新' : '小程序已更新',
    body: locale.value === 'en' ? 'We\'ve improved the scanning experience and fixed minor bugs.' : locale.value === 'zh-CN' ? '我们优化了扫码体验并修复了一些问题。' : '我們優化了掃碼體驗並修復了一些問題。',
    time: '2025-07-18 09:00',
    read: true,
  },
  {
    id: 'm4',
    type: 'campaign',
    title: locale.value === 'en' ? 'Your Coupon is Expiring Soon' : locale.value === 'zh-CN' ? '您的优惠券即将到期' : '您的優惠券即將到期',
    body: locale.value === 'en' ? '$50 Off F&B coupon expires on July 31. Use it before it\'s too late!' : locale.value === 'zh-CN' ? '餐饮$50优惠券将于7月31日到期，请尽快使用！' : '餐飲$50優惠券將於7月31日到期，請盡快使用！',
    time: '2025-07-15 12:00',
    read: true,
  },
]);

const filteredMessages = computed(() => {
  if (activeCategory.value === 'all') return messages;
  return messages.filter((m) => m.type === activeCategory.value);
});

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    system: '\u{2699}',
    campaign: '\u{1F389}',
    stamp: '\u{2B50}',
    coupon: '\u{1F3AB}',
    tier: '\u{1F451}',
    reminder: '\u{23F0}',
  };
  return icons[type] || '\u{1F4E8}';
}

function readMessage(msg: typeof messages[0]) {
  msg.read = true;
  // In production: mark as read via API
  uni.showToast({ title: msg.title, icon: 'none', duration: 2000 });
}

onPullDownRefresh(() => {
  setTimeout(() => uni.stopPullDownRefresh(), 800);
});
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.category-tabs {
  display: flex;
  background: #FFFFFF;
  padding: 0 16rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  position: relative;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #00A651;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 26rpx;
  color: #666666;
}

.tab.active .tab-text {
  color: #00A651;
  font-weight: 600;
}

.unread-dot {
  position: absolute;
  top: 16rpx;
  right: 30%;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #FF4444;
}

.messages-list {
  padding: 16rpx 24rpx;
}

.message-item {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: relative;
}

.message-item.unread {
  background-color: #FAFFFE;
  border-left: 4rpx solid #00A651;
}

.msg-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.type-system { background-color: #E3F2FD; }
.type-campaign { background-color: #FFF3E0; }
.type-stamp { background-color: #E8F5E9; }
.type-coupon { background-color: #FCE4EC; }

.msg-icon-text {
  font-size: 28rpx;
}

.msg-content {
  flex: 1;
  overflow: hidden;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.msg-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.msg-time {
  font-size: 22rpx;
  color: #CCCCCC;
  flex-shrink: 0;
}

.msg-body {
  font-size: 24rpx;
  color: #666666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-indicator {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #00A651;
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
