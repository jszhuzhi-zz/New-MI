import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import LocaleSwitcher from '../../components/LocaleSwitcher';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#00694B',
  primaryDark: '#004D36',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#D32F2F',
  wechatGreen: '#07C160',
  appleBlack: '#000000',
};

export default function LoginScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp<'Login'>>();
  const { loginWithOtp, loginWithWechat, loginWithApple, requestOtp, isLoading } = useAuth();
  const { t, locale } = useLocale();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countryCode] = useState('+852');

  const otpInputRef = useRef<TextInput>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      Alert.alert('', t('auth.phonePlaceholder'));
      return;
    }
    try {
      await requestOtp(phone, countryCode);
      setOtpSent(true);
      startCountdown();
      otpInputRef.current?.focus();
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  const handleLogin = async () => {
    if (!phone || !otp) return;
    try {
      await loginWithOtp(phone, otp, countryCode);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  const handleWechatLogin = async () => {
    try {
      await loginWithWechat('mock_wechat_code');
    } catch (error) {
      Alert.alert('Error', 'WeChat login failed');
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple('mock_apple_identity_token');
    } catch (error) {
      Alert.alert('Error', 'Apple Sign In failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Locale Switcher */}
          <View style={styles.localeContainer}>
            <LocaleSwitcher />
          </View>

          {/* Branding */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInner} />
              </View>
            </View>
            <Text style={styles.appName}>
              {locale === 'en' ? 'Link Mall' : '領展商場'}
            </Text>
            <Text style={styles.tagline}>{t('auth.welcomeSubtitle')}</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.phone')}</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder={t('auth.phonePlaceholder')}
                  placeholderTextColor={COLORS.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={8}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.otp')}</Text>
              <View style={styles.otpInputRow}>
                <TextInput
                  ref={otpInputRef}
                  style={styles.otpInput}
                  placeholder={t('auth.otpPlaceholder')}
                  placeholderTextColor={COLORS.textTertiary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.otpButton,
                    (countdown > 0 || isLoading) && styles.otpButtonDisabled,
                  ]}
                  onPress={handleSendOtp}
                  disabled={countdown > 0 || isLoading}
                >
                  <Text
                    style={[
                      styles.otpButtonText,
                      (countdown > 0 || isLoading) && styles.otpButtonTextDisabled,
                    ]}
                  >
                    {countdown > 0
                      ? `${t('auth.resendOtp')} (${countdown}s)`
                      : otpSent
                      ? t('auth.resendOtp')
                      : t('auth.sendOtp')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !phone || !otp}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {locale === 'en' ? 'or continue with' : '或使用以下方式登入'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            {/* WeChat Login */}
            <TouchableOpacity
              style={styles.wechatButton}
              onPress={handleWechatLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.socialIconCircle}>
                <Text style={styles.wechatIcon}>W</Text>
              </View>
              <Text style={styles.wechatButtonText}>{t('auth.loginWithWechat')}</Text>
            </TouchableOpacity>

            {/* Apple Sign In */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleAppleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <View style={styles.socialIconCircleApple}>
                  <Text style={styles.appleIcon}>A</Text>
                </View>
                <Text style={styles.appleButtonText}>{t('auth.loginWithApple')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>{t('auth.noAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register', {})}>
              <Text style={styles.registerLink}>{t('auth.register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  localeContainer: {
    alignItems: 'flex-end',
    paddingTop: 12,
  },
  brandingSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  logoInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    height: 50,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpInput: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: 4,
    marginRight: 10,
  },
  otpButton: {
    height: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  otpButtonDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  otpButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  otpButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  loginButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  forgotPasswordLink: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  socialSection: {
    gap: 12,
    marginTop: 16,
  },
  wechatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: COLORS.wechatGreen,
    borderRadius: 12,
    gap: 10,
  },
  socialIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wechatIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wechatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: COLORS.appleBlack,
    borderRadius: 12,
    gap: 10,
  },
  socialIconCircleApple: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  registerPrompt: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
