<template>
  <view class="bind-phone-page">
    <view class="content-area">
      <!-- Icon -->
      <view class="icon-area">
        <view class="phone-icon-circle">
          <text class="phone-icon">\u{1F4F1}</text>
        </view>
      </view>

      <!-- Title -->
      <text class="page-title">{{ title }}</text>
      <text class="page-desc">{{ description }}</text>

      <!-- WeChat Quick Bind (getPhoneNumber API) -->
      <view class="quick-bind-section">
        <button
          class="wechat-phone-btn"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          <text class="btn-icon">\u{1F4AC}</text>
          <text class="btn-text">{{ quickBindText }}</text>
        </button>
        <text class="quick-bind-hint">{{ quickBindHint }}</text>
      </view>

      <!-- Divider -->
      <view class="divider-row">
        <view class="divider-line" />
        <text class="divider-text">{{ orText }}</text>
        <view class="divider-line" />
      </view>

      <!-- Manual Phone Input -->
      <view class="manual-section">
        <view class="phone-input-row">
          <text class="country-code">+852</text>
          <input
            v-model="phoneNumber"
            class="phone-input"
            type="number"
            maxlength="8"
            :placeholder="phonePlaceholder"
          />
        </view>
        <view class="sms-row">
          <input
            v-model="smsCode"
            class="sms-input"
            type="number"
            maxlength="6"
            :placeholder="smsPlaceholder"
          />
          <view
            class="send-btn"
            :class="{ disabled: countdown > 0 }"
            @tap="sendCode"
          >
            <text class="send-text">{{ countdown > 0 ? `${countdown}s` : t('auth.sendCode') }}</text>
          </view>
        </view>
        <view class="bind-btn" @tap="manualBind">
          <text class="bind-text">{{ bindBtnText }}</text>
        </view>
      </view>

      <!-- Skip -->
      <view class="skip-section" @tap="skipBind">
        <text class="skip-text">{{ skipText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';
import { extractPhoneData } from '@/services/wechat';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const phoneNumber = ref('');
const smsCode = ref('');
const countdown = ref(0);

// Labels
const title = computed(() => {
  if (locale.value === 'en') return 'Bind Your Phone Number';
  if (locale.value === 'zh-CN') return '绑定手机号码';
  return '綁定手機號碼';
});

const description = computed(() => {
  if (locale.value === 'en') return 'A phone number is required to complete your member registration and receive important notifications.';
  if (locale.value === 'zh-CN') return '绑定手机号码以完成会员注册并接收重要通知。';
  return '綁定手機號碼以完成會員註冊並接收重要通知。';
});

const quickBindText = computed(() => {
  if (locale.value === 'en') return 'Use WeChat Phone Number';
  if (locale.value === 'zh-CN') return '使用微信手机号';
  return '使用微信手機號';
});

const quickBindHint = computed(() => {
  if (locale.value === 'en') return 'Quickly bind using your WeChat registered number';
  if (locale.value === 'zh-CN') return '快速使用微信注册手机号绑定';
  return '快速使用微信註冊手機號綁定';
});

const orText = computed(() => locale.value === 'en' ? 'OR' : '或者');
const phonePlaceholder = computed(() => locale.value === 'en' ? 'Enter phone number' : locale.value === 'zh-CN' ? '请输入手机号' : '請輸入手機號');
const smsPlaceholder = computed(() => locale.value === 'en' ? 'Enter SMS code' : locale.value === 'zh-CN' ? '请输入验证码' : '請輸入驗證碼');
const bindBtnText = computed(() => locale.value === 'en' ? 'Bind Phone Number' : locale.value === 'zh-CN' ? '绑定手机号' : '綁定手機號');
const skipText = computed(() => locale.value === 'en' ? 'Skip for now' : locale.value === 'zh-CN' ? '暂时跳过' : '暫時跳過');

async function onGetPhoneNumber(e: any) {
  const phoneData = extractPhoneData(e);
  if (!phoneData) {
    uni.showToast({
      title: locale.value === 'en' ? 'Authorization failed' : locale.value === 'zh-CN' ? '授权失败' : '授權失敗',
      icon: 'none',
    });
    return;
  }

  uni.showLoading({ title: '' });
  const success = await authStore.bindPhone(phoneData.encryptedData, phoneData.iv);
  uni.hideLoading();

  if (success) {
    uni.showToast({ title: t('common.success'), icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1500);
  } else {
    uni.showToast({ title: t('common.error'), icon: 'none' });
  }
}

function sendCode() {
  if (countdown.value > 0) return;
  if (!phoneNumber.value || phoneNumber.value.length < 8) {
    uni.showToast({ title: phonePlaceholder.value, icon: 'none' });
    return;
  }

  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) clearInterval(timer);
  }, 1000);

  uni.showToast({
    title: locale.value === 'en' ? 'Code sent' : locale.value === 'zh-CN' ? '验证码已发送' : '驗證碼已發送',
    icon: 'success',
  });
}

function manualBind() {
  if (!phoneNumber.value || phoneNumber.value.length < 8) {
    uni.showToast({ title: phonePlaceholder.value, icon: 'none' });
    return;
  }
  if (!smsCode.value || smsCode.value.length < 4) {
    uni.showToast({ title: smsPlaceholder.value, icon: 'none' });
    return;
  }

  // In production: call API to bind phone with SMS verification
  uni.showToast({ title: t('common.success'), icon: 'success' });
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' });
  }, 1500);
}

function skipBind() {
  uni.switchTab({ url: '/pages/index/index' });
}
</script>

<style scoped>
.bind-phone-page {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 48rpx;
}

.content-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-area {
  margin: 48rpx 0 32rpx;
}

.phone-icon-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-icon {
  font-size: 64rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 16rpx;
}

.page-desc {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 48rpx;
  padding: 0 16rpx;
}

.quick-bind-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wechat-phone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #07C160;
  border-radius: 44rpx;
  padding: 24rpx;
  width: 100%;
  border: none;
}

.wechat-phone-btn::after {
  border: none;
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.quick-bind-hint {
  font-size: 22rpx;
  color: #999999;
  margin-top: 12rpx;
}

.divider-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 40rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: #E0E0E0;
}

.divider-text {
  font-size: 24rpx;
  color: #999999;
  padding: 0 24rpx;
}

.manual-section {
  width: 100%;
}

.phone-input-row {
  display: flex;
  align-items: center;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
  margin-bottom: 20rpx;
}

.country-code {
  font-size: 30rpx;
  color: #333333;
  font-weight: 600;
  margin-right: 16rpx;
  padding-right: 16rpx;
  border-right: 2rpx solid #E0E0E0;
}

.phone-input {
  flex: 1;
  font-size: 30rpx;
}

.sms-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.sms-input {
  flex: 1;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  margin-right: 16rpx;
}

.send-btn {
  background-color: #F5F6FA;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200rpx;
}

.send-btn.disabled {
  opacity: 0.5;
}

.send-text {
  font-size: 26rpx;
  color: #00A651;
  font-weight: 500;
}

.bind-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

.bind-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.skip-section {
  padding: 16rpx;
}

.skip-text {
  font-size: 26rpx;
  color: #999999;
  text-decoration: underline;
}
</style>
