import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import MemberCardWidget from '../../components/MemberCardWidget';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface MenuItemProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  showBadge?: number;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, sublabel, onPress, showBadge, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
    <View style={styles.menuItemContent}>
      <Text style={[styles.menuItemLabel, danger && styles.menuItemLabelDanger]}>{label}</Text>
      {sublabel && <Text style={styles.menuItemSublabel}>{sublabel}</Text>}
    </View>
    <View style={styles.menuItemRight}>
      {showBadge !== undefined && showBadge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{showBadge}</Text>
        </View>
      )}
      <Text style={styles.menuItemArrow}>{'>'}</Text>
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp<'Profile'>>();
  const { user, memberDisplayName, tierColor, formattedPhone, logout } = useAuth();
  const { t, locale } = useLocale();

  const handleLogout = () => {
    const confirmMsg = locale === 'en' ? 'Are you sure you want to logout?' : locale === 'zh-CN' ? '确定要退出登录？' : '確定要登出？';
    Alert.alert(t('auth.logout'), confirmMsg, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { borderColor: tierColor }]}>
            <Text style={styles.avatarText}>
              {(user?.displayName || '?').charAt(0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editAvatarText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{memberDisplayName}</Text>
        <Text style={styles.profilePhone}>{formattedPhone}</Text>
        {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
        <View style={[styles.tierTag, { backgroundColor: tierColor + '20' }]}>
          <Text style={[styles.tierTagText, { color: tierColor }]}>
            {user?.tierNameZh || 'Green'} {locale === 'en' ? 'Member' : '會員'}
          </Text>
        </View>
        <Text style={styles.memberSince}>
          {t('profile.memberSince')} {user?.joinDate || '2023-03-10'}
        </Text>
      </View>

      {/* Member Card */}
      <View style={styles.cardSection}>
        <MemberCardWidget />
      </View>

      {/* Account Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>
          {locale === 'en' ? 'Account' : locale === 'zh-CN' ? '账户' : '帳戶'}
        </Text>
        <MenuItem
          label={t('profile.editProfile')}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          label={t('profile.tierInfo')}
          sublabel={user?.tierNameZh}
          onPress={() => navigation.navigate('TierInfo')}
        />
        <MenuItem
          label={t('profile.messages')}
          showBadge={3}
          onPress={() => navigation.navigate('MessageCenter')}
        />
      </View>

      {/* Activity Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>
          {locale === 'en' ? 'Activity' : locale === 'zh-CN' ? '活动' : '活動'}
        </Text>
        <MenuItem
          label={t('profile.favoriteStores')}
          onPress={() => navigation.navigate('FavoriteStores')}
        />
        <MenuItem
          label={t('profile.transactionHistory')}
          onPress={() => {}}
        />
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>
          {locale === 'en' ? 'General' : locale === 'zh-CN' ? '通用' : '一般'}
        </Text>
        <MenuItem
          label={t('profile.settings')}
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          label={t('profile.helpFaq')}
          onPress={() => {}}
        />
        <MenuItem
          label={t('profile.about')}
          sublabel="v1.0.0"
          onPress={() => {}}
        />
      </View>

      {/* Logout */}
      <View style={styles.menuSection}>
        <MenuItem
          label={t('auth.logout')}
          onPress={handleLogout}
          danger
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', borderWidth: 3,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.primary },
  editAvatarButton: {
    position: 'absolute', bottom: -2, right: -8,
    backgroundColor: COLORS.primary, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  editAvatarText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  profileName: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  profilePhone: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  profileEmail: { fontSize: 14, color: COLORS.textTertiary, marginTop: 2 },
  tierTag: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  tierTagText: { fontSize: 13, fontWeight: '600' },
  memberSince: { fontSize: 12, color: COLORS.textTertiary, marginTop: 8 },
  cardSection: { paddingHorizontal: 16, marginTop: 12 },
  menuSection: {
    backgroundColor: COLORS.surface, marginTop: 12, marginHorizontal: 0,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: COLORS.border,
  },
  menuSectionTitle: {
    fontSize: 13, fontWeight: '600', color: COLORS.textTertiary,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  menuItemContent: { flex: 1 },
  menuItemLabel: { fontSize: 16, color: COLORS.text },
  menuItemLabelDanger: { color: COLORS.error },
  menuItemSublabel: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: COLORS.error, minWidth: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  menuItemArrow: { fontSize: 16, color: COLORS.textTertiary },
});
