<template>
  <view class="edit-page">
    <!-- Avatar -->
    <view class="avatar-section card" @tap="changeAvatar">
      <text class="field-label">{{ avatarLabel }}</text>
      <view class="avatar-right">
        <image class="avatar" :src="form.avatar" mode="aspectFill" />
        <text class="arrow">&gt;</text>
      </view>
    </view>

    <!-- Form Fields -->
    <view class="form-section card">
      <view class="form-item">
        <text class="field-label">{{ t('member.displayName') }}</text>
        <input v-model="form.displayName" class="field-input" :placeholder="namePlaceholder" />
      </view>
      <view class="divider" />
      <view class="form-item">
        <text class="field-label">{{ t('member.phone') }}</text>
        <text class="field-value readonly">{{ form.phone }}</text>
      </view>
      <view class="divider" />
      <view class="form-item">
        <text class="field-label">{{ t('member.email') }}</text>
        <input v-model="form.email" class="field-input" type="text" :placeholder="emailPlaceholder" />
      </view>
      <view class="divider" />
      <view class="form-item" @tap="showGenderPicker">
        <text class="field-label">{{ t('member.gender') }}</text>
        <text class="field-value">{{ genderLabel }}</text>
        <text class="arrow">&gt;</text>
      </view>
      <view class="divider" />
      <view class="form-item" @tap="showDatePicker">
        <text class="field-label">{{ t('member.dateOfBirth') }}</text>
        <text class="field-value">{{ form.dateOfBirth || selectText }}</text>
        <text class="arrow">&gt;</text>
      </view>
    </view>

    <!-- Address Section -->
    <view class="form-section card">
      <view class="form-item">
        <text class="field-label">{{ addressLabel }}</text>
        <input v-model="form.address" class="field-input" :placeholder="addressPlaceholder" />
      </view>
      <view class="divider" />
      <view class="form-item">
        <text class="field-label">{{ districtLabel }}</text>
        <input v-model="form.district" class="field-input" :placeholder="districtPlaceholder" />
      </view>
    </view>

    <!-- Save Button -->
    <view class="save-section">
      <view class="save-btn" @tap="saveProfile">
        <text class="save-text">{{ t('common.save') }}</text>
      </view>
    </view>

    <!-- Gender Picker -->
    <picker
      v-if="showGender"
      mode="selector"
      :range="genderOptions"
      range-key="label"
      @change="onGenderChange"
    />

    <!-- Date Picker -->
    <picker
      v-if="showDate"
      mode="date"
      :value="form.dateOfBirth"
      :start="'1940-01-01'"
      :end="'2010-12-31'"
      @change="onDateChange"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/utils/i18n';
import { chooseImage } from '@/services/wechat';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const showGender = ref(false);
const showDate = ref(false);

const form = reactive({
  avatar: authStore.user?.avatar || 'https://via.placeholder.com/200x200/E0E0E0/999999?text=Avatar',
  displayName: authStore.user?.displayName || '',
  phone: authStore.user?.phone || '+852 9XXX XXXX',
  email: authStore.user?.email || '',
  gender: authStore.user?.gender || '',
  dateOfBirth: authStore.user?.dateOfBirth || '',
  address: '',
  district: '',
});

// Labels
const avatarLabel = computed(() => locale.value === 'en' ? 'Profile Photo' : locale.value === 'zh-CN' ? '头像' : '頭像');
const namePlaceholder = computed(() => locale.value === 'en' ? 'Enter display name' : locale.value === 'zh-CN' ? '请输入显示名称' : '請輸入顯示名稱');
const emailPlaceholder = computed(() => locale.value === 'en' ? 'Enter email' : locale.value === 'zh-CN' ? '请输入邮箱' : '請輸入電郵');
const addressLabel = computed(() => locale.value === 'en' ? 'Address' : locale.value === 'zh-CN' ? '地址' : '地址');
const addressPlaceholder = computed(() => locale.value === 'en' ? 'Enter address' : locale.value === 'zh-CN' ? '请输入地址' : '請輸入地址');
const districtLabel = computed(() => locale.value === 'en' ? 'District' : locale.value === 'zh-CN' ? '地区' : '地區');
const districtPlaceholder = computed(() => locale.value === 'en' ? 'Enter district' : locale.value === 'zh-CN' ? '请输入地区' : '請輸入地區');
const selectText = computed(() => locale.value === 'en' ? 'Select' : locale.value === 'zh-CN' ? '请选择' : '請選擇');

const genderOptions = computed(() => [
  { label: t('member.male'), value: 'male' },
  { label: t('member.female'), value: 'female' },
  { label: t('member.other'), value: 'other' },
  { label: t('member.preferNotToSay'), value: 'prefer-not-to-say' },
]);

const genderLabel = computed(() => {
  const opt = genderOptions.value.find((o) => o.value === form.gender);
  return opt?.label || selectText.value;
});

async function changeAvatar() {
  try {
    const paths = await chooseImage(1, ['album', 'camera']);
    if (paths.length > 0) {
      form.avatar = paths[0];
    }
  } catch { /* cancelled */ }
}

function showGenderPicker() {
  showGender.value = true;
}

function onGenderChange(e: any) {
  form.gender = genderOptions.value[e.detail.value].value;
  showGender.value = false;
}

function showDatePicker() {
  showDate.value = true;
}

function onDateChange(e: any) {
  form.dateOfBirth = e.detail.value;
  showDate.value = false;
}

async function saveProfile() {
  try {
    uni.showLoading({ title: '' });
    await authStore.updateProfile({
      displayName: form.displayName,
      email: form.email,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
    } as any);
    uni.hideLoading();
    uni.showToast({ title: t('common.success'), icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
  } catch {
    uni.hideLoading();
    uni.showToast({ title: t('common.error'), icon: 'none' });
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background-color: #F5F6FA;
  padding: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.avatar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.avatar-right {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
}

.field-label {
  font-size: 28rpx;
  color: #333333;
  width: 180rpx;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
}

.field-value {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
}

.field-value.readonly {
  color: #999999;
}

.arrow {
  font-size: 28rpx;
  color: #CCCCCC;
  margin-left: 12rpx;
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
  margin: 0 24rpx;
}

.save-section {
  padding: 32rpx 0;
}

.save-btn {
  background: linear-gradient(135deg, #00A651, #00C853);
  border-radius: 44rpx;
  padding: 24rpx;
  text-align: center;
}

.save-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
