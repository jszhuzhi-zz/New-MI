<template>
  <!-- Root component - no template content for mini program -->
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

onLaunch(async () => {
  console.log('[App] onLaunch');

  const appStore = useAppStore();
  const authStore = useAuthStore();

  // Initialize system info
  appStore.initSystemInfo();

  // Restore saved locale preference
  const savedLocale = uni.getStorageSync('locale');
  if (savedLocale) {
    appStore.setLocale(savedLocale);
  }

  // Check if user has existing session
  const token = uni.getStorageSync('token');
  if (token) {
    authStore.setToken(token);
    try {
      await authStore.fetchUserProfile();
    } catch (err) {
      console.warn('[App] Failed to restore session, redirecting to login');
      authStore.clearAuth();
    }
  }
});

onShow(() => {
  console.log('[App] onShow');
});

onHide(() => {
  console.log('[App] onHide');
});
</script>

<style>
/* Global styles */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 28rpx;
  color: #333333;
  background-color: #F5F6FA;
  line-height: 1.5;
  box-sizing: border-box;
}

/* Utility classes */
.container {
  padding: 24rpx;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-1 {
  flex: 1;
}

.text-primary {
  color: #00A651;
}

.text-secondary {
  color: #666666;
}

.text-muted {
  color: #999999;
}

.text-bold {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 24rpx;
}

.text-lg {
  font-size: 32rpx;
}

.text-xl {
  font-size: 36rpx;
}

.text-xxl {
  font-size: 44rpx;
}

.mt-sm { margin-top: 12rpx; }
.mt-md { margin-top: 24rpx; }
.mt-lg { margin-top: 36rpx; }
.mb-sm { margin-bottom: 12rpx; }
.mb-md { margin-bottom: 24rpx; }
.mb-lg { margin-bottom: 36rpx; }
.ml-sm { margin-left: 12rpx; }
.mr-sm { margin-right: 12rpx; }
.p-sm { padding: 12rpx; }
.p-md { padding: 24rpx; }

.card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.divider {
  height: 1rpx;
  background-color: #EEEEEE;
  margin: 20rpx 0;
}

.btn-primary {
  background-color: #00A651;
  color: #FFFFFF;
  border-radius: 44rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 500;
}

.btn-primary:active {
  background-color: #008C44;
}

.btn-outline {
  border: 2rpx solid #00A651;
  color: #00A651;
  border-radius: 44rpx;
  padding: 18rpx 40rpx;
  text-align: center;
  font-size: 30rpx;
  background-color: transparent;
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
