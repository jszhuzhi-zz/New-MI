<template>
  <view class="campaign-detail-page">
    <!-- Cover Image -->
    <image class="cover-image" :src="campaign.coverImage" mode="aspectFill" />

    <!-- Campaign Info -->
    <view class="info-section">
      <view class="campaign-type-tag" :class="'type-' + campaign.type">
        <text class="type-label">{{ typeLabel }}</text>
      </view>
      <text class="campaign-title">{{ campaign.name }}</text>
      <view class="campaign-meta">
        <text class="meta-date">{{ campaign.dateRange }}</text>
      </view>

      <!-- Stamp bonus info -->
      <view v-if="campaign.stampBonus" class="stamp-bonus-card">
        <text class="bonus-label">{{ bonusLabel }}</text>
        <text class="bonus-value">+{{ campaign.stampBonus }}</text>
        <text class="bonus-unit">{{ t('stamp.stamp') }}</text>
      </view>
    </view>

    <!-- Description -->
    <view class="content-section card">
      <text class="section-title">{{ detailsLabel }}</text>
      <rich-text :nodes="campaign.content" />
    </view>

    <!-- Terms -->
    <view class="terms-section card">
      <text class="section-title">{{ termsLabel }}</text>
      <text class="terms-text">{{ campaign.terms }}</text>
    </view>

    <!-- Action Button -->
    <view class="action-bar safe-area-bottom">
      <view class="action-btn" @tap="onAction">
        <text class="action-btn-text">{{ actionLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const campaign = reactive({
  id: '',
  name: locale.value === 'en' ? 'Summer Double Stamps' : locale.value === 'zh-CN' ? '夏日双倍印花' : '夏日雙倍印花',
  type: 'stamp-multiplier' as string,
  coverImage: 'https://via.placeholder.com/750x400/00A651/FFFFFF?text=Summer+Campaign',
  dateRange: '2025-06-01 - 2025-08-31',
  stampBonus: 0,
  content: locale.value === 'en'
    ? '<p>Earn <strong>double stamps</strong> on all purchases at participating F&B merchants this summer!</p><p>Simply present your member QR code when making a purchase at any participating restaurant or cafe.</p><p>This promotion applies to all tier levels. Maximum 20 bonus stamps per transaction.</p>'
    : locale.value === 'zh-CN'
      ? '<p>今夏在参与餐饮商户消费即可获得<strong>双倍印花</strong>！</p><p>消费时只需出示会员二维码。</p><p>本活动适用于所有等级会员。每笔交易最多可获20枚额外印花。</p>'
      : '<p>今夏在參與餐飲商戶消費即可獲得<strong>雙倍印花</strong>！</p><p>消費時只需出示會員二維碼。</p><p>本活動適用於所有等級會員。每筆交易最多可獲20枚額外印花。</p>',
  terms: locale.value === 'en'
    ? '1. Valid from June 1 to August 31, 2025.\n2. Applicable at participating F&B merchants only.\n3. Cannot be combined with other promotions.\n4. Link REIT reserves the right to amend the terms.'
    : locale.value === 'zh-CN'
      ? '1. 有效期为2025年6月1日至8月31日。\n2. 仅适用于参与餐饮商户。\n3. 不可与其他优惠同时使用。\n4. 领展保留修改条款的权利。'
      : '1. 有效期為2025年6月1日至8月31日。\n2. 僅適用於參與餐飲商戶。\n3. 不可與其他優惠同時使用。\n4. 領展保留修改條款的權利。',
});

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
  return labels[campaign.type] || campaign.type;
});

const bonusLabel = computed(() => locale.value === 'en' ? 'Bonus Stamps' : locale.value === 'zh-CN' ? '奖励印花' : '獎勵印花');
const detailsLabel = computed(() => locale.value === 'en' ? 'Campaign Details' : locale.value === 'zh-CN' ? '活动详情' : '活動詳情');
const termsLabel = computed(() => locale.value === 'en' ? 'Terms & Conditions' : locale.value === 'zh-CN' ? '条款与细则' : '條款與細則');
const actionLabel = computed(() => locale.value === 'en' ? 'Participate Now' : locale.value === 'zh-CN' ? '立即参与' : '立即參與');

onLoad((query) => {
  if (query?.id) {
    campaign.id = query.id;
    // In production: fetch campaign detail by id from API
  }
});

onShareAppMessage(() => ({
  title: campaign.name,
  path: `/pages/offers/campaign-detail?id=${campaign.id}`,
}));

function onAction() {
  uni.showToast({
    title: locale.value === 'en' ? 'Joined successfully!' : locale.value === 'zh-CN' ? '参与成功！' : '參與成功！',
    icon: 'success',
  });
}
</script>

<style scoped>
.campaign-detail-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding-bottom: 140rpx;
}

.cover-image {
  width: 100%;
  height: 400rpx;
}

.info-section {
  background: #FFFFFF;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.campaign-type-tag {
  display: inline-block;
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.type-stamp-multiplier { background-color: #E8F5E9; }
.type-stamp-multiplier .type-label { color: #00A651; font-size: 24rpx; }
.type-stamp-bonus { background-color: #E8F5E9; }
.type-stamp-bonus .type-label { color: #00A651; font-size: 24rpx; }
.type-coupon { background-color: #FFF3E0; }
.type-coupon .type-label { color: #FF6B35; font-size: 24rpx; }
.type-lucky-draw { background-color: #FCE4EC; }
.type-lucky-draw .type-label { color: #E91E63; font-size: 24rpx; }
.type-gift { background-color: #E3F2FD; }
.type-gift .type-label { color: #1976D2; font-size: 24rpx; }
.type-event, .type-promotion { background-color: #F3E5F5; }
.type-event .type-label, .type-promotion .type-label { color: #7B1FA2; font-size: 24rpx; }

.campaign-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 12rpx;
}

.meta-date {
  font-size: 26rpx;
  color: #999999;
}

.stamp-bonus-card {
  margin-top: 20rpx;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: baseline;
}

.bonus-label {
  font-size: 26rpx;
  color: #2E7D32;
  margin-right: 12rpx;
}

.bonus-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #00A651;
}

.bonus-unit {
  font-size: 24rpx;
  color: #2E7D32;
  margin-left: 4rpx;
}

.card {
  background: #FFFFFF;
  padding: 24rpx;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.terms-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 2;
  white-space: pre-line;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.action-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
}

.action-btn:active {
  opacity: 0.9;
}

.action-btn-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
