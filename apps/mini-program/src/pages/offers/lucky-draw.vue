<template>
  <view class="lucky-draw-page">
    <!-- Game Header -->
    <view class="game-header">
      <text class="game-title">{{ gameName }}</text>
      <text class="game-cost">{{ costLabel }}: {{ entryCost }} {{ t('stamp.stamp') }} / {{ entryText }}</text>
      <text class="game-remaining">{{ remainingLabel }}: {{ remainingEntries }}</text>
    </view>

    <!-- Wheel Spin Area -->
    <view class="wheel-container">
      <view class="wheel-outer">
        <view class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
          <view
            v-for="(prize, index) in prizes"
            :key="index"
            class="wheel-segment"
            :style="{
              transform: `rotate(${index * segmentAngle}deg)`,
              background: prize.color,
            }"
          >
            <text class="segment-text" :style="{ transform: `rotate(${segmentAngle / 2}deg)` }">{{ prize.name }}</text>
          </view>
        </view>
        <view class="wheel-pointer" />
      </view>

      <!-- Spin Button -->
      <view class="spin-btn" :class="{ disabled: isSpinning || remainingEntries <= 0 }" @tap="startSpin">
        <text class="spin-text">{{ isSpinning ? spinningText : spinText }}</text>
      </view>
    </view>

    <!-- Prize List -->
    <view class="prize-section card">
      <text class="section-title">{{ prizeListTitle }}</text>
      <view v-for="(prize, index) in prizes" :key="'prize-' + index" class="prize-item">
        <image class="prize-image" :src="prize.image" mode="aspectFill" />
        <view class="prize-info">
          <text class="prize-name">{{ prize.name }}</text>
          <text class="prize-desc">{{ prize.description }}</text>
        </view>
        <text class="prize-qty">x{{ prize.remaining }}</text>
      </view>
    </view>

    <!-- My Wins -->
    <view class="wins-section card">
      <text class="section-title">{{ myWinsTitle }}</text>
      <view v-if="myWins.length === 0" class="empty-wins">
        <text class="empty-text">{{ noWinsText }}</text>
      </view>
      <view v-for="win in myWins" :key="win.id" class="win-item">
        <text class="win-name">{{ win.name }}</text>
        <text class="win-date">{{ win.date }}</text>
      </view>
    </view>

    <!-- Rules -->
    <view class="rules-section card">
      <text class="section-title">{{ rulesTitle }}</text>
      <text class="rules-text">{{ rules }}</text>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();

const isSpinning = ref(false);
const wheelRotation = ref(0);
const entryCost = ref(10);
const remainingEntries = ref(3);

// Labels
const gameName = computed(() => locale.value === 'en' ? 'Wheel of Fortune' : locale.value === 'zh-CN' ? '幸运大转盘' : '幸運大轉盤');
const costLabel = computed(() => locale.value === 'en' ? 'Cost' : locale.value === 'zh-CN' ? '费用' : '費用');
const entryText = computed(() => locale.value === 'en' ? 'entry' : locale.value === 'zh-CN' ? '次' : '次');
const remainingLabel = computed(() => locale.value === 'en' ? 'Entries left' : locale.value === 'zh-CN' ? '剩余次数' : '剩餘次數');
const spinText = computed(() => locale.value === 'en' ? 'SPIN!' : locale.value === 'zh-CN' ? '开始抽奖' : '開始抽獎');
const spinningText = computed(() => locale.value === 'en' ? 'Spinning...' : locale.value === 'zh-CN' ? '抽奖中...' : '抽獎中...');
const prizeListTitle = computed(() => locale.value === 'en' ? 'Prize List' : locale.value === 'zh-CN' ? '奖品列表' : '獎品列表');
const myWinsTitle = computed(() => locale.value === 'en' ? 'My Wins' : locale.value === 'zh-CN' ? '我的中奖记录' : '我的中獎記錄');
const noWinsText = computed(() => locale.value === 'en' ? 'No wins yet. Try your luck!' : locale.value === 'zh-CN' ? '暂无中奖记录，试试运气吧！' : '暫無中獎記錄，試試運氣吧！');
const rulesTitle = computed(() => locale.value === 'en' ? 'Game Rules' : locale.value === 'zh-CN' ? '游戏规则' : '遊戲規則');

const prizes = reactive([
  { name: locale.value === 'en' ? '$100 Coupon' : '$100優惠券', description: locale.value === 'en' ? 'Shopping coupon' : '購物優惠券', image: 'https://via.placeholder.com/80x80/FF6B35/FFFFFF?text=$100', color: '#FF6B35', remaining: 5 },
  { name: locale.value === 'en' ? '50 Stamps' : '50印花', description: locale.value === 'en' ? 'Bonus stamps' : '額外印花', image: 'https://via.placeholder.com/80x80/00A651/FFFFFF?text=50', color: '#00A651', remaining: 20 },
  { name: locale.value === 'en' ? 'Free Coffee' : '免費咖啡', description: locale.value === 'en' ? 'Pacific Coffee' : 'Pacific Coffee', image: 'https://via.placeholder.com/80x80/795548/FFFFFF?text=Coffee', color: '#795548', remaining: 30 },
  { name: locale.value === 'en' ? '$200 Voucher' : '$200禮券', description: locale.value === 'en' ? 'Mall voucher' : '商場禮券', image: 'https://via.placeholder.com/80x80/E91E63/FFFFFF?text=$200', color: '#E91E63', remaining: 2 },
  { name: locale.value === 'en' ? '10 Stamps' : '10印花', description: locale.value === 'en' ? 'Consolation prize' : '安慰獎', image: 'https://via.placeholder.com/80x80/2196F3/FFFFFF?text=10', color: '#2196F3', remaining: 100 },
  { name: locale.value === 'en' ? 'Free Parking' : '免費泊車', description: locale.value === 'en' ? '2 hours free' : '2小時免費', image: 'https://via.placeholder.com/80x80/9C27B0/FFFFFF?text=P', color: '#9C27B0', remaining: 15 },
]);

const segmentAngle = computed(() => 360 / prizes.length);

const myWins = reactive<{ id: string; name: string; date: string }[]>([]);

const rules = computed(() => {
  if (locale.value === 'en') return '1. Each spin costs 10 stamps.\n2. Maximum 5 spins per day.\n3. Prizes are subject to availability.\n4. Stamp bonus prizes are credited automatically.\n5. Physical prizes must be collected at the customer service counter within 14 days.\n6. Link REIT reserves the right to amend these rules.';
  if (locale.value === 'zh-CN') return '1. 每次抽奖消耗10枚印花。\n2. 每天最多可抽5次。\n3. 奖品数量有限，先到先得。\n4. 印花奖品自动入账。\n5. 实物奖品请于14天内到客服台领取。\n6. 领展保留修改规则的权利。';
  return '1. 每次抽獎消耗10枚印花。\n2. 每天最多可抽5次。\n3. 獎品數量有限，先到先得。\n4. 印花獎品自動入賬。\n5. 實物獎品請於14天內到客服台領取。\n6. 領展保留修改規則的權利。';
});

onLoad((query) => {
  if (query?.id) {
    // In production: fetch lucky draw config by id from API
  }
});

function startSpin() {
  if (isSpinning.value || remainingEntries.value <= 0) return;

  isSpinning.value = true;
  remainingEntries.value -= 1;

  // Random rotation (3-5 full spins + random final position)
  const extraSpins = (3 + Math.random() * 2) * 360;
  const targetSegment = Math.floor(Math.random() * prizes.length);
  const targetAngle = targetSegment * segmentAngle + segmentAngle / 2;
  const totalRotation = wheelRotation.value + extraSpins + (360 - (wheelRotation.value % 360)) + targetAngle;

  wheelRotation.value = totalRotation;

  // Show result after animation
  setTimeout(() => {
    isSpinning.value = false;
    const prizeName = prizes[targetSegment].name;
    myWins.push({
      id: `win-${Date.now()}`,
      name: prizeName,
      date: new Date().toLocaleDateString(),
    });
    uni.showModal({
      title: locale.value === 'en' ? 'Congratulations!' : locale.value === 'zh-CN' ? '恭喜你！' : '恭喜你！',
      content: locale.value === 'en' ? `You won: ${prizeName}` : `你獲得了: ${prizeName}`,
      showCancel: false,
    });
  }, 4000);
}
</script>

<style scoped>
.lucky-draw-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FF6B35, #F5F6FA 50%);
  padding-bottom: 24rpx;
}

.game-header {
  text-align: center;
  padding: 32rpx;
  color: #FFFFFF;
}

.game-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.game-cost {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 4rpx;
}

.game-remaining {
  font-size: 24rpx;
  opacity: 0.8;
}

.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
}

.wheel-outer {
  width: 520rpx;
  height: 520rpx;
  border-radius: 50%;
  border: 12rpx solid #FFFFFF;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  position: relative;
}

.wheel-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 0;
  right: 0;
  transform-origin: bottom left;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 32rpx;
}

.segment-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 600;
  transform-origin: center;
}

.wheel-pointer {
  position: absolute;
  top: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  border-top: 40rpx solid #FF4444;
  z-index: 5;
}

.spin-btn {
  margin-top: 32rpx;
  background: linear-gradient(135deg, #FF6B35, #FF4444);
  border-radius: 44rpx;
  padding: 24rpx 80rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 68, 68, 0.4);
}

.spin-btn.disabled {
  opacity: 0.5;
}

.spin-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 700;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.prize-item:last-child {
  border-bottom: none;
}

.prize-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.prize-info {
  flex: 1;
}

.prize-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.prize-desc {
  font-size: 22rpx;
  color: #999999;
}

.prize-qty {
  font-size: 24rpx;
  color: #999999;
}

.empty-wins {
  padding: 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.win-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.win-item:last-child {
  border-bottom: none;
}

.win-name {
  font-size: 28rpx;
  color: #333333;
}

.win-date {
  font-size: 24rpx;
  color: #999999;
}

.rules-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 2;
  white-space: pre-line;
}
</style>
