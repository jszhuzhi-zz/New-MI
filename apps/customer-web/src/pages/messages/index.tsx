import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Badge, Empty, Tabs, SwipeAction } from 'antd-mobile';
import { useTranslation } from '../../locales';
import { useSettingsStore } from '../../store/settings';

interface Message {
  id: string;
  type: 'system' | 'promotion' | 'transaction';
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'promotion',
    title: { 'zh-TW': '雙倍印花日！', 'zh-CN': '双倍印花日！', en: 'Double Stamps Day!' }[localStorage.getItem('locale') || 'zh-TW'] || '雙倍印花日！',
    content: { 'zh-TW': '本週六全場消費可獲雙倍印花', 'zh-CN': '本周六全场消费可获双倍印花', en: 'Earn double stamps on all purchases this Saturday' }[localStorage.getItem('locale') || 'zh-TW'] || '本週六全場消費可獲雙倍印花',
    time: '2h ago',
    read: false,
  },
  {
    id: '2',
    type: 'transaction',
    title: { 'zh-TW': '印花到賬通知', 'zh-CN': '印花到账通知', en: 'Stamps Credited' }[localStorage.getItem('locale') || 'zh-TW'] || '印花到賬通知',
    content: { 'zh-TW': '您在星巴克消費獲得 +50 印花', 'zh-CN': '您在星巴克消费获得 +50 印花', en: 'You earned +50 stamps at Starbucks' }[localStorage.getItem('locale') || 'zh-TW'] || '您在星巴克消費獲得 +50 印花',
    time: '1d ago',
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: { 'zh-TW': '系統維護通知', 'zh-CN': '系统维护通知', en: 'System Maintenance' }[localStorage.getItem('locale') || 'zh-TW'] || '系統維護通知',
    content: { 'zh-TW': '系統將於今晚 2:00-4:00 進行維護', 'zh-CN': '系统将于今晚 2:00-4:00 进行维护', en: 'System maintenance scheduled tonight 2:00-4:00 AM' }[localStorage.getItem('locale') || 'zh-TW'] || '系統將於今晚 2:00-4:00 進行維護',
    time: '2d ago',
    read: true,
  },
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = messages.filter((m) => !m.read).length;

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const markAllAsRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
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
        <Tabs.Tab title={locale === 'en' ? 'All' : '全部'} key="all" />
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
                  text: locale === 'en' ? 'Delete' : '刪除',
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
