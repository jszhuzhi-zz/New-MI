import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '../../hooks/useLocale';
import { Notification } from '../../navigation/types';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  unread: '#E8F5EF',
};

const mockNotifications: Notification[] = [
  {
    id: 'notif_1', title: '印花已到帳', body: '您在 T Town 大家樂的消費已獲得 150 印花',
    type: 'stamp', timestamp: '2024-01-28T14:35:00Z', isRead: false,
  },
  {
    id: 'notif_2', title: '新春三倍賞啟動', body: '農曆新年期間消費可獲三倍印花，活動已開始！',
    type: 'campaign', timestamp: '2024-01-28T09:00:00Z', isRead: false,
  },
  {
    id: 'notif_3', title: '優惠券即將到期', body: '您的 MUJI 滿$300減$30 優惠券將於2月28日到期',
    type: 'coupon', timestamp: '2024-01-27T10:00:00Z', isRead: false,
  },
  {
    id: 'notif_4', title: '系統維護通知', body: '1月30日凌晨2:00-4:00進行系統維護，期間部分功能暫停',
    type: 'system', timestamp: '2024-01-26T18:00:00Z', isRead: true,
  },
  {
    id: 'notif_5', title: '恭喜升級金卡會員', body: '您已成功升級為金卡會員，享受更多專屬禮遇！',
    type: 'tier', timestamp: '2024-01-20T12:00:00Z', isRead: true,
  },
  {
    id: 'notif_6', title: '印花已到帳', body: '您在九龍城廣場 UNIQLO 的消費已獲得 80 印花',
    type: 'stamp', timestamp: '2024-01-25T11:20:00Z', isRead: true,
  },
];

export default function MessageCenterScreen() {
  const { locale } = useLocale();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return locale === 'en' ? 'Just now' : '剛才';
    if (diffHours < 24) return locale === 'en' ? `${diffHours}h ago` : `${diffHours}小時前`;
    if (diffDays < 7) return locale === 'en' ? `${diffDays}d ago` : `${diffDays}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stamp': return '#2E7D32';
      case 'campaign': return '#C4A962';
      case 'coupon': return '#1976D2';
      case 'tier': return '#7B1FA2';
      default: return '#666666';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.notifTypeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderNotification}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {locale === 'en' ? 'No messages' : locale === 'zh-CN' ? '暂无消息' : '暫無消息'}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 12, paddingBottom: 32 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  notifCardUnread: { backgroundColor: COLORS.unread },
  notifTypeIndicator: {
    width: 4, height: '100%', borderRadius: 2,
    position: 'absolute', left: 0, top: 0, bottom: 0,
  },
  notifContent: { flex: 1, paddingLeft: 8 },
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  notifTitle: { fontSize: 15, fontWeight: '500', color: COLORS.text, flex: 1 },
  notifTitleUnread: { fontWeight: '700' },
  notifTime: { fontSize: 12, color: COLORS.textTertiary, marginLeft: 8 },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginTop: 4, marginLeft: 8,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
});
