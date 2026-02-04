import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  success: '#2E7D32',
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp<'ForgotPassword'>>();
  const { requestOtp, resetPassword, isLoading } = useAuth();
  const { t, locale } = useLocale();

  const [step, setStep] = useState<'phone' | 'reset' | 'done'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval>>();

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
      await requestOtp(phone);
      startCountdown();
      setStep('reset');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  const handleReset = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('', t('auth.otpPlaceholder'));
      return;
    }
    if (newPassword.length < 6) {
      const msg = locale === 'en'
        ? 'Password must be at least 6 characters'
        : '密碼至少6位';
      Alert.alert('', msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = locale === 'en' ? 'Passwords do not match' : '密碼不一致';
      Alert.alert('', msg);
      return;
    }
    try {
      await resetPassword(phone, otp, newPassword);
      setStep('done');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Reset failed');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'done' ? (
            /* Success */
            <View style={styles.successSection}>
              <View style={styles.successIcon}>
                <View style={styles.checkmark} />
              </View>
              <Text style={styles.successTitle}>
                {locale === 'en' ? 'Password Reset' : locale === 'zh-CN' ? '密码已重置' : '密碼已重置'}
              </Text>
              <Text style={styles.successSubtitle}>
                {locale === 'en'
                  ? 'You can now login with your new password'
                  : locale === 'zh-CN'
                  ? '您现在可以使用新密码登录'
                  : '您現在可以使用新密碼登入'}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>
          ) : step === 'phone' ? (
            /* Phone Step */
            <View style={styles.formSection}>
              <Text style={styles.description}>
                {locale === 'en'
                  ? 'Enter your registered phone number and we will send you a verification code.'
                  : locale === 'zh-CN'
                  ? '输入您注册的手机号码，我们将向您发送验证码。'
                  : '輸入您註冊的手機號碼，我們將向您發送驗證碼。'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.phone')}</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>+852</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder={t('auth.phonePlaceholder')}
                    placeholderTextColor={COLORS.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={8}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!phone || isLoading) && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={!phone || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('auth.sendOtp')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Reset Step */
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.otp')}</Text>
                <View style={styles.otpRow}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder={t('auth.otpPlaceholder')}
                    placeholderTextColor={COLORS.textTertiary}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
                    onPress={handleSendOtp}
                    disabled={countdown > 0}
                  >
                    <Text style={styles.resendButtonText}>
                      {countdown > 0 ? `${countdown}s` : t('auth.resendOtp')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {locale === 'en' ? 'New Password' : locale === 'zh-CN' ? '新密码' : '新密碼'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="******"
                  placeholderTextColor={COLORS.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {locale === 'en' ? 'Confirm Password' : locale === 'zh-CN' ? '确认密码' : '確認密碼'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="******"
                  placeholderTextColor={COLORS.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('common.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 24 },
  formSection: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  countryCodeBox: {
    height: 50, paddingHorizontal: 14, justifyContent: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, marginRight: 10,
  },
  countryCodeText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  phoneInput: {
    flex: 1, height: 50, backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16,
    fontSize: 16, color: COLORS.text,
  },
  otpRow: { flexDirection: 'row', alignItems: 'center' },
  otpInput: {
    flex: 1, height: 50, backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16,
    fontSize: 16, color: COLORS.text, letterSpacing: 4, marginRight: 10,
  },
  resendButton: {
    height: 50, paddingHorizontal: 16, justifyContent: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  resendButtonDisabled: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  resendButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  textInput: {
    height: 50, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, color: COLORS.text,
  },
  primaryButton: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.6 },
  successSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  checkmark: {
    width: 24, height: 14, borderLeftWidth: 3, borderBottomWidth: 3,
    borderColor: COLORS.success, transform: [{ rotate: '-45deg' }],
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },
});
