import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Badge, Empty, Tabs, SwipeAction } from 'antd-mobile';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';

interface MessageData {
  id: string;
  type: 'system' | 'promotion' | 'transaction';
  title: Record<Locale, string>;
  content: Record<Locale, string>;
  time: Record<Locale, string>;
  read: boolean;
}

const messagesData: MessageData[] = [
  {
    id: '1',
    type: 'promotion',
    title: { 'zh-TW': '雙倍印花日！', 'zh-CN': '双倍印花日！', en: 'Double Stamps Day!' },
    content: { 'zh-TW': '本週六全場消費可獲雙倍印花', 'zh-CN': '本周六全场消费可获双倍印花', en: 'Earn double stamps on all purchases this Saturday' },
    time: { 'zh-TW': '2小時前', 'zh-CN': '2小时前', en: '2h ago' },
    read: false,
  },
  {
    id: '2',
    type: 'transaction',
    title: { 'zh-TW': '印花到賬通知', 'zh-CN': '印花到账通知', en: 'Stamps Credited' },
    content: { 'zh-TW': '您在星巴克消費獲得 +50 印花', 'zh-CN': '您在星巴克消费获得 +50 印花', en: 'You earned +50 stamps at Starbucks' },
    time: { 'zh-TW': '1天前', 'zh-CN': '1天前', en: '1d ago' },
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: { 'zh-TW': '系統維護通知', 'zh-CN': '系统维护通知', en: 'System Maintenance' },
    content: { 'zh-TW': '系統將於今晚 2:00-4:00 進行維護', 'zh-CN': '系统将于今晚 2:00-4:00 进行维护', en: 'System maintenance scheduled tonight 2:00-4:00 AM' },
    time: { 'zh-TW': '2天前', 'zh-CN': '2天前', en: '2d ago' },
    read: true,
  },
  {
    id: '4',
    type: 'promotion',
    title: { 'zh-TW': '新年優惠來襲', 'zh-CN': '新年优惠来袭', en: 'New Year Special Offers' },
    content: { 'zh-TW': '春節期間消費滿 $500 即送精美禮品', 'zh-CN': '春节期间消费满 $500 即送精美礼品', en: 'Spend $500 during CNY and receive a special gift' },
    time: { 'zh-TW': '3天前', 'zh-CN': '3天前', en: '3d ago' },
    read: true,
  },
  {
    id: '5',
    type: 'transaction',
    title: { 'zh-TW': '優惠券即將到期', 'zh-CN': '优惠券即将到期', en: 'Coupon Expiring Soon' },
    content: { 'zh-TW': '您有 2 張優惠券將於 3 天內到期', 'zh-CN': '您有 2 张优惠券将于 3 天内到期', en: 'You have 2 coupons expiring in 3 days' },
    time: { 'zh-TW': '5天前', 'zh-CN': '5天前', en: '5d ago' },
    read: true,
  },
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    messagesData.forEach((m) => { initial[m.id] = m.read; });
    return initial;
  });
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const messages = useMemo(() => {
    return messagesData
      .filter((m) => !deletedIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        type: m.type,
        title: m.title[locale],
        content: m.content[locale],
        time: m.time[locale],
        read: readStatus[m.id] ?? m.read,
      }));
  }, [locale, readStatus, deletedIds]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const markAsRead = (id: string) => {
    setReadStatus((prev) => ({ ...prev, [id]: true }));
  };

  const deleteMessage = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
  };

  const markAllAsRead = () => {
    const newStatus: Record<string, boolean> = {};
    messagesData.forEach((m) => { newStatus[m.id] = true; });
    setReadStatus(newStatus);
  };

  const filteredMessages =
    activeTab === 'all'
      ? messages
      : messages.filter((m) => m.type === activeTab);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system':
        return t('messages.system');
      case 'promotion':
        return t('messages.promotion');
      case 'transaction':
        return t('messages.transaction');
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return '#666';
      case 'promotion':
        return colors.primary;
      case 'transaction':
        return '#52c41a';
      default:
        return '#999';
    }
  };

  const allLabel = { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' }[locale];
  const deleteLabel = { 'zh-TW': '刪除', 'zh-CN': '删除', en: 'Delete' }[locale];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        right={
          unreadCount > 0 ? (
            <span
              onClick={markAllAsRead}
              style={{ color: colors.primary, fontSize: 14 }}
            >
              {t('messages.markAllRead')}
            </span>
          ) : null
        }
        style={{ background: '#fff' }}
      >
        <Badge content={unreadCount > 0 ? unreadCount : null}>
          {t('messages.title')}
        </Badge>
      </NavBar>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ background: '#fff' }}
      >
        <Tabs.Tab title={allLabel} key="all" />
        <Tabs.Tab title={t('messages.system')} key="system" />
        <Tabs.Tab title={t('messages.promotion')} key="promotion" />
        <Tabs.Tab title={t('messages.transaction')} key="transaction" />
      </Tabs>

      {filteredMessages.length === 0 ? (
        <Empty
          description={t('messages.noMessages')}
          style={{ padding: '60px 0' }}
        />
      ) : (
        <List style={{ marginTop: 8 }}>
          {filteredMessages.map((msg) => (
            <SwipeAction
              key={msg.id}
              rightActions={[
                {
                  key: 'delete',
                  text: deleteLabel,
                  color: 'danger',
                  onClick: () => deleteMessage(msg.id),
                },
              ]}
            >
              <List.Item
                onClick={() => markAsRead(msg.id)}
                style={{
                  background: msg.read ? '#fff' : '#f0f9ff',
                }}
                description={
                  <div>
                    <div style={{ color: '#666', marginTop: 4 }}>
                      {msg.content}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        fontSize: 12,
                        color: '#999',
                      }}
                    >
                      <span
                        style={{
                          color: getTypeColor(msg.type),
                          background: `${getTypeColor(msg.type)}15`,
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {getTypeLabel(msg.type)}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!msg.read && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: colors.primary,
                      }}
                    />
                  )}
                  <span style={{ fontWeight: msg.read ? 400 : 600 }}>
                    {msg.title}
                  </span>
                </div>
              </List.Item>
            </SwipeAction>
          ))}
        </List>
      )}
    </div>
  );
}
