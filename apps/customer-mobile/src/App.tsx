import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './navigation';
import { useAuthStore } from './store/auth';
import { useAppStore } from './store/app';

// ─── Theme Colors ────────────────────────────────────────────────────────────

export const COLORS = {
  primary: '#00694B',
  primaryDark: '#004D36',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  accentLight: '#FDF6E3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#F9A825',
  tierGreen: '#00694B',
  tierSilver: '#9E9E9E',
  tierGold: '#C4A962',
  tierPlatinum: '#424242',
  tierDiamond: '#7B1FA2',
};

// ─── Loading Screen ──────────────────────────────────────────────────────────

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingLogo}>
      <View style={styles.logoMark}>
        <View style={styles.logoInner} />
      </View>
    </View>
    <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
  </View>
);

// ─── Main App Component ──────────────────────────────────────────────────────

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const initApp = useAppStore((s) => s.initApp);

  const prepareApp = useCallback(async () => {
    try {
      // Initialize app settings (locale, theme, notification prefs)
      await initApp();

      // Try to restore existing auth session from secure storage
      await restoreSession();
    } catch (error) {
      console.warn('App initialization error:', error);
    } finally {
      setIsReady(true);
    }
  }, [initApp, restoreSession]);

  useEffect(() => {
    prepareApp();
  }, [prepareApp]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingLogo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  spinner: {
    marginTop: 32,
  },
});
