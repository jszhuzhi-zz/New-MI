<template>
  <view class="login-page">
    <!-- Custom Nav Space -->
    <view class="nav-spacer" :style="{ height: (statusBarHeight + 44) + 'px' }" />

    <!-- Logo and Branding -->
    <view class="brand-section">
      <view class="logo-circle">
        <text class="logo-text">Link</text>
      </view>
      <text class="brand-name">{{ brandTitle }}</text>
      <text class="brand-subtitle">{{ brandSubtitle }}</text>
    </view>

    <!-- Login Actions -->
    <view class="login-section">
      <!-- WeChat One-Tap Login -->
      <button
        class="wechat-login-btn"
        :loading="isLoading"
        @tap="handleWeChatLogin"
      >
        <text class="wechat-icon">\u{1F4AC}</text>
        <text class="wechat-text">{{ wechatLoginText }}</text>
      </button>

      <!-- Phone Login Alternative -->
      <view class="divider-row">
        <view class="divider-line" />
        <text class="divider-text">{{ orText }}</text>
        <view class="divider-line" />
      </view>

      <!-- Phone Input -->
      <view class="phone-section">
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
            class="send-sms-btn"
            :class="{ disabled: countdown > 0 }"
            @tap="sendSmsCode"
          >
            <text class="send-text">{{ countdown > 0 ? `${countdown}s` : t('auth.sendCode') }}</text>
          </view>
        </view>
        <view class="phone-login-btn" @tap="handlePhoneLogin">
          <text class="phone-login-text">{{ t('auth.login') }}</text>
        </view>
      </view>
    </view>

    <!-- Agreement -->
    <view class="agreement-section">
      <view class="agreement-check" @tap="agreeChecked = !agreeChecked">
        <view class="checkbox" :class="{ checked: agreeChecked }">
          <text v-if="agreeChecked" class="check-mark">\u2713</text>
        </view>
        <text class="agreement-text">{{ agreementPrefix }}</text>
      </view>
      <view class="agreement-links">
        <text class="link-text" @tap="goTerms">{{ termsText }}</text>
        <text class="agreement-text"> {{ andText }} </text>
        <text class="link-text" @tap="goPrivacy">{{ privacyText }}</text>
      </view>
    </view>

    <!-- Error Message -->
    <view v-if="errorMsg" class="error-section">
      <text class="error-text">{{ errorMsg }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/utils/i18n';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const statusBarHeight = computed(() => appStore.systemInfo.statusBarHeight);

const phoneNumber = ref('');
const smsCode = ref('');
const countdown = ref(0);
const agreeChecked = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

// Labels
const brandTitle = computed(() => 'Link REIT');
const brandSubtitle = computed(() => {
  if (locale.value === 'en') return 'Membership Program';
  if (locale.value === 'zh-CN') return '领展会员计划';
  return '領展會員計劃';
});

const wechatLoginText = computed(() => {
  if (locale.value === 'en') return 'Login with WeChat';
  if (locale.value === 'zh-CN') return '微信一键登录';
  return '微信一鍵登錄';
});

const orText = computed(() => locale.value === 'en' ? 'OR' : locale.value === 'zh-CN' ? '或者' : '或者');
const phonePlaceholder = computed(() => locale.value === 'en' ? 'Enter phone number' : locale.value === 'zh-CN' ? '请输入手机号' : '請輸入手機號');
const smsPlaceholder = computed(() => locale.value === 'en' ? 'Enter SMS code' : locale.value === 'zh-CN' ? '请输入验证码' : '請輸入驗證碼');

const agreementPrefix = computed(() => {
  if (locale.value === 'en') return 'I agree to the ';
  if (locale.value === 'zh-CN') return '我已阅读并同意 ';
  return '我已閱讀並同意 ';
});
const termsText = computed(() => locale.value === 'en' ? 'Terms of Service' : locale.value === 'zh-CN' ? '服务条款' : '服務條款');
const andText = computed(() => locale.value === 'en' ? 'and' : locale.value === 'zh-CN' ? '和' : '和');
const privacyText = computed(() => locale.value === 'en' ? 'Privacy Policy' : locale.value === 'zh-CN' ? '隐私政策' : '私隱政策');

async function handleWeChatLogin() {
  if (!agreeChecked.value) {
    errorMsg.value = locale.value === 'en' ? 'Please agree to the terms first' : locale.value === 'zh-CN' ? '请先同意条款' : '請先同意條款';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  const success = await authStore.loginWithWeChat();
  isLoading.value = false;

  if (success) {
    uni.switchTab({ url: '/pages/index/index' });
  } else if (authStore.loginError) {
    errorMsg.value = authStore.loginError;
  }
}

async function handlePhoneLogin() {
  if (!agreeChecked.value) {
    errorMsg.value = locale.value === 'en' ? 'Please agree to the terms first' : locale.value === 'zh-CN' ? '请先同意条款' : '請先同意條款';
    return;
  }

  if (!phoneNumber.value || phoneNumber.value.length < 8) {
    errorMsg.value = phonePlaceholder.value;
    return;
  }

  if (!smsCode.value || smsCode.value.length < 4) {
    errorMsg.value = smsPlaceholder.value;
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  // In production: call phone login API
  try {
    uni.showToast({ title: t('auth.loginSuccess'), icon: 'success' });
    setTimeout(() => {
      isLoading.value = false;
      uni.switchTab({ url: '/pages/index/index' });
    }, 1500);
  } catch {
    isLoading.value = false;
    errorMsg.value = t('auth.loginFailed');
  }
}

function sendSmsCode() {
  if (countdown.value > 0) return;
  if (!phoneNumber.value || phoneNumber.value.length < 8) {
    errorMsg.value = phonePlaceholder.value;
    return;
  }

  // Start countdown
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);

  uni.showToast({
    title: locale.value === 'en' ? 'Code sent!' : locale.value === 'zh-CN' ? '验证码已发送' : '驗證碼已發送',
    icon: 'success',
  });
}

function goTerms() {
  uni.showToast({ title: termsText.value, icon: 'none' });
}

function goPrivacy() {
  uni.showToast({ title: privacyText.value, icon: 'none' });
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #00A651, #007A3D 30%, #F5F6FA 60%);
  padding: 0 48rpx;
}

.nav-spacer {
  width: 100%;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 64rpx;
}

.logo-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.logo-text {
  font-size: 44rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.brand-name {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.brand-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
}

.login-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.wechat-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #07C160;
  border-radius: 44rpx;
  padding: 24rpx;
  border: none;
  width: 100%;
}

.wechat-login-btn::after {
  border: none;
}

.wechat-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.wechat-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.divider-row {
  display: flex;
  align-items: center;
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

.phone-section {
  display: flex;
  flex-direction: column;
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
  color: #333333;
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

.send-sms-btn {
  background-color: #F5F6FA;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200rpx;
}

.send-sms-btn.disabled {
  opacity: 0.5;
}

.send-text {
  font-size: 26rpx;
  color: #00A651;
  font-weight: 500;
}

.phone-login-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
}

.phone-login-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.agreement-section {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.agreement-check {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 6rpx;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background-color: #00A651;
  border-color: #00A651;
}

.check-mark {
  color: #FFFFFF;
  font-size: 22rpx;
}

.agreement-text {
  font-size: 24rpx;
  color: #999999;
}

.agreement-links {
  display: flex;
  align-items: center;
}

.link-text {
  font-size: 24rpx;
  color: #00A651;
}

.error-section {
  margin-top: 24rpx;
  text-align: center;
}

.error-text {
  font-size: 26rpx;
  color: #E53935;
}
</style>
