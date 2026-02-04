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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthScreenNavigationProp, AuthScreenRouteProp } from '../../navigation/types';
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
  error: '#D32F2F',
};

export default function RegisterScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp<'Register'>>();
  const route = useRoute<AuthScreenRouteProp<'Register'>>();
  const { register, requestOtp, isLoading } = useAuth();
  const { t, locale } = useLocale();

  const [step, setStep] = useState<'phone' | 'profile'>(route.params?.phone ? 'profile' : 'phone');
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [otp, setOtp] = useState('');
  const [countryCode] = useState('+852');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<string>('');
  const [birthday, setBirthday] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRef = useRef<TextInput>(null);
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
      await requestOtp(phone, countryCode);
      startCountdown();
      otpRef.current?.focus();
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  const handleVerifyPhone = () => {
    if (!otp || otp.length < 6) {
      Alert.alert('', t('auth.otpPlaceholder'));
      return;
    }
    setStep('profile');
  };

  const handleRegister = async () => {
    if (!displayName.trim()) {
      const msg = locale === 'en' ? 'Please enter your name' : '請輸入姓名';
      Alert.alert('', msg);
      return;
    }
    if (!agreeTerms) {
      const msg = locale === 'en' ? 'Please agree to the terms' : '請同意服務條款';
      Alert.alert('', msg);
      return;
    }
    try {
      await register({
        phone,
        countryCode,
        otp,
        displayName,
        email: email || undefined,
        gender: gender || undefined,
        birthday: birthday || undefined,
        preferredLocale: locale,
        agreeTerms,
        agreeMarketing,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  const genderOptions = [
    { value: 'male', label: locale === 'en' ? 'Male' : locale === 'zh-CN' ? '男' : '男' },
    { value: 'female', label: locale === 'en' ? 'Female' : locale === 'zh-CN' ? '女' : '女' },
    { value: 'other', label: locale === 'en' ? 'Other' : locale === 'zh-CN' ? '其他' : '其他' },
  ];

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('auth.welcomeTitle')}</Text>
            <Text style={styles.headerSubtitle}>
              {step === 'phone'
                ? locale === 'en'
                  ? 'Verify your phone number to get started'
                  : locale === 'zh-CN'
                  ? '验证手机号码开始注册'
                  : '驗證手機號碼開始註冊'
                : locale === 'en'
                ? 'Complete your profile'
                : locale === 'zh-CN'
                ? '完善个人资料'
                : '完善個人資料'}
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, step === 'profile' && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 'profile' && styles.stepDotActive]} />
          </View>

          {step === 'phone' ? (
            /* Phone Verification Step */
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.phone')}</Text>
                <View style={styles.phoneRow}>
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
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.otp')}</Text>
                <View style={styles.otpRow}>
                  <TextInput
                    ref={otpRef}
                    style={styles.otpInput}
                    placeholder={t('auth.otpPlaceholder')}
                    placeholderTextColor={COLORS.textTertiary}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.otpButton, countdown > 0 && styles.otpButtonDisabled]}
                    onPress={handleSendOtp}
                    disabled={countdown > 0}
                  >
                    <Text
                      style={[styles.otpButtonText, countdown > 0 && styles.otpButtonTextDisabled]}
                    >
                      {countdown > 0 ? `${countdown}s` : t('auth.sendOtp')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!phone || !otp) && styles.buttonDisabled]}
                onPress={handleVerifyPhone}
                disabled={!phone || !otp}
              >
                <Text style={styles.primaryButtonText}>{t('common.next')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Profile Step */
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t('profile.name')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'en' ? 'Enter your name' : '請輸入姓名'}
                  placeholderTextColor={COLORS.textTertiary}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.email')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'en' ? 'Enter email (optional)' : '請輸入電郵（選填）'}
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {locale === 'en' ? 'Gender' : '性別'}
                </Text>
                <View style={styles.genderRow}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        gender === option.value && styles.genderOptionActive,
                      ]}
                      onPress={() => setGender(option.value)}
                    >
                      <Text
                        style={[
                          styles.genderOptionText,
                          gender === option.value && styles.genderOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {locale === 'en' ? 'Birthday' : '生日'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textTertiary}
                  value={birthday}
                  onChangeText={setBirthday}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {/* Terms */}
              <View style={styles.switchRow}>
                <Switch
                  value={agreeTerms}
                  onValueChange={setAgreeTerms}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
                <Text style={styles.switchLabel}>{t('auth.agreeTerms')}</Text>
              </View>

              <View style={styles.switchRow}>
                <Switch
                  value={agreeMarketing}
                  onValueChange={setAgreeMarketing}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
                <Text style={styles.switchLabel}>{t('auth.agreeMarketing')}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setStep('phone')}
                >
                  <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { flex: 1 },
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{t('auth.register')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Already have account */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>{t('auth.hasAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepLine: { width: 60, height: 2, backgroundColor: COLORS.border, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: COLORS.primary },
  formSection: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  required: { color: COLORS.error },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  countryCodeBox: {
    height: 50, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginRight: 10,
  },
  countryCodeText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  phoneInput: {
    flex: 1, height: 50, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, color: COLORS.text,
  },
  otpRow: { flexDirection: 'row', alignItems: 'center' },
  otpInput: {
    flex: 1, height: 50, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, color: COLORS.text, letterSpacing: 4, marginRight: 10,
  },
  otpButton: {
    height: 50, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary,
  },
  otpButtonDisabled: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  otpButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  otpButtonTextDisabled: { color: COLORS.textTertiary },
  textInput: {
    height: 50, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, color: COLORS.text,
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderOption: {
    flex: 1, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
  },
  genderOptionActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  genderOptionText: { fontSize: 15, color: COLORS.textSecondary },
  genderOptionTextActive: { color: COLORS.primary, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  switchLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  primaryButton: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: {
    height: 52, backgroundColor: COLORS.surface, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 24,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  buttonDisabled: { opacity: 0.6 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 4 },
  loginPrompt: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
