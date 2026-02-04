import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile, isLoading } = useAuth();
  const { t, locale } = useLocale();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [gender, setGender] = useState(user?.gender || '');

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('', locale === 'en' ? 'Name is required' : '請輸入姓名');
      return;
    }
    try {
      await updateProfile({ displayName, email, birthday, gender: gender as any });
      Alert.alert('', locale === 'en' ? 'Profile updated' : locale === 'zh-CN' ? '资料已更新' : '資料已更新', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const genderOptions = [
    { value: 'male', label: locale === 'en' ? 'Male' : '男' },
    { value: 'female', label: locale === 'en' ? 'Female' : '女' },
    { value: 'other', label: locale === 'en' ? 'Other' : '其他' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.field}>
          <Text style={styles.label}>{t('profile.name')}</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={locale === 'en' ? 'Enter name' : '請輸入姓名'}
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('profile.phone')}</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>
              {user?.phoneCountryCode} {user?.phone}
            </Text>
            <Text style={styles.verifiedBadge}>
              {locale === 'en' ? 'Verified' : '已驗證'}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('profile.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={locale === 'en' ? 'Enter email' : '請輸入電郵'}
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{locale === 'en' ? 'Gender' : '性別'}</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.genderOption, gender === option.value && styles.genderOptionActive]}
                onPress={() => setGender(option.value)}
              >
                <Text style={[styles.genderText, gender === option.value && styles.genderTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{locale === 'en' ? 'Birthday' : '生日'}</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {locale === 'en' ? 'Linked Accounts' : locale === 'zh-CN' ? '绑定账户' : '綁定帳戶'}
        </Text>
        <View style={styles.linkedRow}>
          <Text style={styles.linkedLabel}>WeChat</Text>
          <Text style={[styles.linkedStatus, user?.wechatBound && styles.linkedStatusActive]}>
            {user?.wechatBound
              ? (locale === 'en' ? 'Linked' : '已綁定')
              : (locale === 'en' ? 'Not linked' : '未綁定')}
          </Text>
        </View>
        <View style={styles.linkedRow}>
          <Text style={styles.linkedLabel}>Apple ID</Text>
          <Text style={[styles.linkedStatus, user?.appleBound && styles.linkedStatusActive]}>
            {user?.appleBound
              ? (locale === 'en' ? 'Linked' : '已綁定')
              : (locale === 'en' ? 'Not linked' : '未綁定')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.surface, marginTop: 12, padding: 16,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textTertiary, marginBottom: 12 },
  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    height: 48, backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 14, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  readOnlyField: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 48, backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  readOnlyText: { fontSize: 15, color: COLORS.textSecondary },
  verifiedBadge: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderOption: {
    flex: 1, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
  },
  genderOptionActive: { backgroundColor: '#E8F5EF', borderColor: COLORS.primary },
  genderText: { fontSize: 14, color: COLORS.textSecondary },
  genderTextActive: { color: COLORS.primary, fontWeight: '600' },
  linkedRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  linkedLabel: { fontSize: 15, color: COLORS.text },
  linkedStatus: { fontSize: 13, color: COLORS.textTertiary },
  linkedStatusActive: { color: COLORS.primary, fontWeight: '600' },
  saveButton: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginTop: 24,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
