<template>
  <view class="rules-page">
    <!-- Earning Rules -->
    <view class="section card">
      <text class="section-title">{{ earningTitle }}</text>
      <view v-for="(rule, index) in earningRules" :key="'earn-' + index" class="rule-item">
        <view class="rule-number">
          <text class="number-text">{{ index + 1 }}</text>
        </view>
        <view class="rule-content">
          <text class="rule-title">{{ rule.title }}</text>
          <text class="rule-desc">{{ rule.description }}</text>
        </view>
      </view>
    </view>

    <!-- Tier Multipliers -->
    <view class="section card">
      <text class="section-title">{{ tierMultiplierTitle }}</text>
      <view class="tier-table">
        <view class="tier-row header-row">
          <text class="tier-col">{{ tierLabel }}</text>
          <text class="tier-col">{{ multiplierLabel }}</text>
          <text class="tier-col">{{ exampleLabel }}</text>
        </view>
        <view v-for="tier in tierMultipliers" :key="tier.name" class="tier-row">
          <text class="tier-col">{{ tier.name }}</text>
          <text class="tier-col multiplier">{{ tier.multiplier }}x</text>
          <text class="tier-col">{{ tier.example }}</text>
        </view>
      </view>
    </view>

    <!-- Expiry Rules -->
    <view class="section card">
      <text class="section-title">{{ expiryTitle }}</text>
      <text class="section-desc">{{ expiryDesc }}</text>
    </view>

    <!-- FAQs -->
    <view class="section card">
      <text class="section-title">{{ faqTitle }}</text>
      <view v-for="(faq, index) in faqs" :key="'faq-' + index" class="faq-item" @tap="toggleFaq(index)">
        <view class="faq-question">
          <text class="faq-q-text">{{ faq.question }}</text>
          <text class="faq-arrow" :class="{ expanded: expandedFaq === index }">&#9660;</text>
        </view>
        <view v-if="expandedFaq === index" class="faq-answer">
          <text class="faq-a-text">{{ faq.answer }}</text>
        </view>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();
const expandedFaq = ref<number>(-1);

// Labels
const earningTitle = computed(() => locale.value === 'en' ? 'How to Earn Stamps' : locale.value === 'zh-CN' ? '如何获取印花' : '如何獲取印花');
const tierMultiplierTitle = computed(() => locale.value === 'en' ? 'Tier Stamp Multipliers' : locale.value === 'zh-CN' ? '等级印花倍率' : '等級印花倍率');
const tierLabel = computed(() => locale.value === 'en' ? 'Tier' : '等級');
const multiplierLabel = computed(() => locale.value === 'en' ? 'Multiplier' : '倍率');
const exampleLabel = computed(() => locale.value === 'en' ? 'Example' : locale.value === 'zh-CN' ? '示例' : '示例');
const expiryTitle = computed(() => locale.value === 'en' ? 'Stamp Expiry Rules' : locale.value === 'zh-CN' ? '印花到期规则' : '印花到期規則');
const faqTitle = computed(() => locale.value === 'en' ? 'FAQ' : locale.value === 'zh-CN' ? '常见问题' : '常見問題');

const earningRules = computed(() => {
  if (locale.value === 'en') {
    return [
      { title: 'Spend at participating merchants', description: 'Earn 1 stamp for every HK$50 spent at participating merchants. Scan your receipt within 7 days.' },
      { title: 'Campaign bonuses', description: 'Extra stamps during promotional campaigns. Check the campaign page for current offers.' },
      { title: 'Online activities', description: 'Earn stamps by checking in daily, writing reviews, or referring friends.' },
      { title: 'Special events', description: 'Attend mall events and earn bonus stamps by participating in activities.' },
    ];
  }
  if (locale.value === 'zh-CN') {
    return [
      { title: '在参与商户消费', description: '每消费满HK$50可获得1枚印花。请于7天内扫描小票。' },
      { title: '活动奖励', description: '促销活动期间可获额外印花。请查看活动页面了解当前优惠。' },
      { title: '线上活动', description: '通过每日签到、撰写评价或推荐好友获取印花。' },
      { title: '特别活动', description: '参加商场活动并参与互动可获赠额外印花。' },
    ];
  }
  return [
    { title: '在參與商戶消費', description: '每消費滿HK$50可獲得1枚印花。請於7天內掃描小票。' },
    { title: '活動獎勵', description: '促銷活動期間可獲額外印花。請查看活動頁面了解當前優惠。' },
    { title: '線上活動', description: '透過每日簽到、撰寫評價或推薦好友獲取印花。' },
    { title: '特別活動', description: '參加商場活動並參與互動可獲贈額外印花。' },
  ];
});

const tierMultipliers = computed(() => {
  if (locale.value === 'en') {
    return [
      { name: 'Standard', multiplier: 1.0, example: '50 spent = 1 stamp' },
      { name: 'Silver', multiplier: 1.2, example: '50 spent = 1.2 stamps' },
      { name: 'Gold', multiplier: 1.5, example: '50 spent = 1.5 stamps' },
      { name: 'Diamond', multiplier: 2.0, example: '50 spent = 2 stamps' },
    ];
  }
  return [
    { name: locale.value === 'zh-CN' ? '普通卡' : '普通卡', multiplier: 1.0, example: '消費$50 = 1印花' },
    { name: locale.value === 'zh-CN' ? '银卡' : '銀卡', multiplier: 1.2, example: '消費$50 = 1.2印花' },
    { name: locale.value === 'zh-CN' ? '金卡' : '金卡', multiplier: 1.5, example: '消費$50 = 1.5印花' },
    { name: locale.value === 'zh-CN' ? '钻石卡' : '鑽石卡', multiplier: 2.0, example: '消費$50 = 2印花' },
  ];
});

const expiryDesc = computed(() => {
  if (locale.value === 'en') return 'Stamps are valid for 12 months from the date of earning. Expired stamps will be automatically deducted from your balance. You will receive a notification 30 days before expiry.';
  if (locale.value === 'zh-CN') return '印花自获取之日起12个月内有效。过期印花将自动从余额中扣除。过期前30天您将收到提醒通知。';
  return '印花自獲取之日起12個月內有效。過期印花將自動從餘額中扣除。過期前30天您將收到提醒通知。';
});

const faqs = computed(() => {
  if (locale.value === 'en') {
    return [
      { question: 'How long does it take for stamps to be credited?', answer: 'Stamps from receipt scans are usually credited within 24 hours after verification. Campaign bonus stamps are credited immediately.' },
      { question: 'Can I transfer stamps to another member?', answer: 'Currently, stamp transfers between members are not supported.' },
      { question: 'What if my receipt scan is rejected?', answer: 'Please ensure the receipt is clear and legible. You can visit the customer service counter for manual processing.' },
    ];
  }
  if (locale.value === 'zh-CN') {
    return [
      { question: '印花多久到账？', answer: '小票扫描的印花通常在审核通过后24小时内到账。活动奖励印花即时到账。' },
      { question: '可以将印花转给其他会员吗？', answer: '目前暂不支持会员之间的印花转赠。' },
      { question: '小票扫描被拒绝怎么办？', answer: '请确保小票清晰可辨。您也可以前往客服台进行人工处理。' },
    ];
  }
  return [
    { question: '印花多久到賬？', answer: '小票掃描的印花通常在審核通過後24小時內到賬。活動獎勵印花即時到賬。' },
    { question: '可以將印花轉給其他會員嗎？', answer: '目前暫不支持會員之間的印花轉贈。' },
    { question: '小票掃描被拒絕怎麼辦？', answer: '請確保小票清晰可辨。您也可以前往客服台進行人工處理。' },
  ];
});

function toggleFaq(index: number) {
  expandedFaq.value = expandedFaq.value === index ? -1 : index;
}
</script>

<style scoped>
.rules-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.section {
  margin-bottom: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.section-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
}

.rule-item {
  display: flex;
  margin-bottom: 24rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #00A651;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.number-text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 600;
}

.rule-content {
  flex: 1;
}

.rule-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 6rpx;
}

.rule-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
}

.tier-table {
  border: 1rpx solid #E0E0E0;
  border-radius: 12rpx;
  overflow: hidden;
}

.tier-row {
  display: flex;
  border-bottom: 1rpx solid #E0E0E0;
}

.tier-row:last-child {
  border-bottom: none;
}

.header-row {
  background-color: #F5F6FA;
}

.tier-col {
  flex: 1;
  padding: 16rpx 12rpx;
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}

.header-row .tier-col {
  font-weight: 600;
  color: #666666;
}

.multiplier {
  color: #00A651;
  font-weight: 600;
}

.faq-item {
  border-bottom: 1rpx solid #F0F0F0;
  padding: 20rpx 0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-q-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.faq-arrow {
  font-size: 20rpx;
  color: #CCCCCC;
  transition: transform 0.2s;
}

.faq-arrow.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #E0E0E0;
}

.faq-a-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
}
</style>
