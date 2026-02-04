import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore, Locale } from '../../store/app';
import LocaleSwitcher from '../../components/LocaleSwitcher';

const COLORS = {
  primary: '#00694B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

export default function SettingsScreen() {
  const { t, locale } = useLocale();
  const notifications = useAppStore((s) => s.notifications);
  const setNotificationPrefs = useAppStore((s) => s.setNotificationPrefs);

  const labels = {
    language: locale === 'en' ? 'Language' : locale === 'zh-CN' ? '语言' : '語言',
    notifSection: locale === 'en' ? 'Notification Preferences' : locale === 'zh-CN' ? '通知偏好' : '通知偏好',
    pushEnabled: locale === 'en' ? 'Push Notifications' : locale === 'zh-CN' ? '推送通知' : '推送通知',
    stampUpdates: locale === 'en' ? 'Stamp Updates' : locale === 'zh-CN' ? '印花更新' : '印花更新',
    campaignAlerts: locale === 'en' ? 'Campaign Alerts' : locale === 'zh-CN' ? '活动提醒' : '活動提醒',
    couponReminders: locale === 'en' ? 'Coupon Reminders' : locale === 'zh-CN' ? '优惠券提醒' : '優惠券提醒',
    tierUpdates: locale === 'en' ? 'Tier Updates' : locale === 'zh-CN' ? '等级更新' : '等級更新',
    systemNotices: locale === 'en' ? 'System Notices' : locale === 'zh-CN' ? '系统通知' : '系統通知',
    privacySection: locale === 'en' ? 'Privacy' : locale === 'zh-CN' ? '隐私' : '私隱',
    dataCollection: locale === 'en' ? 'Data Collection' : locale === 'zh-CN' ? '数据收集' : '資料收集',
    marketing: locale === 'en' ? 'Marketing Communications' : locale === 'zh-CN' ? '推广通讯' : '推廣通訊',
    clearCache: locale === 'en' ? 'Clear Cache' : locale === 'zh-CN' ? '清除缓存' : '清除快取',
    appInfo: locale === 'en' ? 'App Information' : locale === 'zh-CN' ? '应用信息' : '應用資訊',
    version: locale === 'en' ? 'Version' : locale === 'zh-CN' ? '版本' : '版本',
    buildNumber: locale === 'en' ? 'Build Number' : locale === 'zh-CN' ? '构建号' : '構建號',
  };

  const SettingSwitch = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.language}</Text>
        <View style={styles.localePicker}>
          <LocaleSwitcher expanded />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.notifSection}</Text>
        <SettingSwitch
          label={labels.pushEnabled}
          value={notifications.pushEnabled}
          onValueChange={(v) => setNotificationPrefs({ pushEnabled: v })}
        />
        <SettingSwitch
          label={labels.stampUpdates}
          value={notifications.stampUpdates}
          onValueChange={(v) => setNotificationPrefs({ stampUpdates: v })}
        />
        <SettingSwitch
          label={labels.campaignAlerts}
          value={notifications.campaignAlerts}
          onValueChange={(v) => setNotificationPrefs({ campaignAlerts: v })}
        />
        <SettingSwitch
          label={labels.couponReminders}
          value={notifications.couponReminders}
          onValueChange={(v) => setNotificationPrefs({ couponReminders: v })}
        />
        <SettingSwitch
          label={labels.tierUpdates}
          value={notifications.tierUpdates}
          onValueChange={(v) => setNotificationPrefs({ tierUpdates: v })}
        />
        <SettingSwitch
          label={labels.systemNotices}
          value={notifications.systemNotices}
          onValueChange={(v) => setNotificationPrefs({ systemNotices: v })}
        />
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.privacySection}</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>{labels.dataCollection}</Text>
          <Text style={styles.menuItemArrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>{labels.marketing}</Text>
          <Text style={styles.menuItemArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Cache */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>{labels.clearCache}</Text>
          <Text style={styles.menuItemValue}>23.5 MB</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.appInfo}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{labels.version}</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{labels.buildNumber}</Text>
          <Text style={styles.infoValue}>2024012801</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.surface, marginTop: 12, paddingHorizontal: 16,
    paddingVertical: 12, borderTopWidth: 0.5, borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: COLORS.textTertiary,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  localePicker: { paddingVertical: 4 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  switchLabel: { fontSize: 15, color: COLORS.text },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  menuItemText: { fontSize: 15, color: COLORS.text },
  menuItemArrow: { fontSize: 16, color: COLORS.textTertiary },
  menuItemValue: { fontSize: 14, color: COLORS.textTertiary },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.text },
});
