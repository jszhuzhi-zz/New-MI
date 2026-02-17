import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Badge, Empty, Tabs, SwipeAction, Popup, TextArea, Button, Toast, Avatar, Dialog } from 'antd-mobile';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';

// Multilingual labels
const labels: Record<string, Record<Locale, string>> = {
  all: { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' },
  delete: { 'zh-TW': '刪除', 'zh-CN': '删除', en: 'Delete' },
  reply: { 'zh-TW': '回覆', 'zh-CN': '回复', en: 'Reply' },
  send: { 'zh-TW': '發送', 'zh-CN': '发送', en: 'Send' },
  newMessage: { 'zh-TW': '新消息', 'zh-CN': '新消息', en: 'New Message' },
  messageDetail: { 'zh-TW': '消息詳情', 'zh-CN': '消息详情', en: 'Message Detail' },
  replyPlaceholder: { 'zh-TW': '輸入回覆內容...', 'zh-CN': '输入回复内容...', en: 'Type your reply...' },
  sent: { 'zh-TW': '已發送', 'zh-CN': '已发送', en: 'Sent' },
  received: { 'zh-TW': '已收到', 'zh-CN': '已收到', en: 'Received' },
  linkMall: { 'zh-TW': 'Link Mall', 'zh-CN': 'Link Mall', en: 'Link Mall' },
  customerService: { 'zh-TW': '客戶服務', 'zh-CN': '客户服务', en: 'Customer Service' },
  viewDetails: { 'zh-TW': '查看詳情', 'zh-CN': '查看详情', en: 'View Details' },
  confirmDelete: { 'zh-TW': '確定刪除此消息？', 'zh-CN': '确定删除此消息？', en: 'Delete this message?' },
};

interface MessageData {
  id: string;
  type: 'system' | 'promotion' | 'transaction' | 'service';
  title: Record<Locale, string>;
  content: Record<Locale, string>;
  fullContent?: Record<Locale, string>;
  time: string;
  read: boolean;
  link?: string;
  replies?: { content: Record<Locale, string>; time: string; isUser: boolean }[];
}

const messagesData: MessageData[] = [
  {
    id: '1',
    type: 'promotion',
    title: { 'zh-TW': '雙倍印花日！', 'zh-CN': '双倍印花日！', en: 'Double Stamps Day!' },
    content: { 'zh-TW': '本週六全場消費可獲雙倍印花', 'zh-CN': '本周六全场消费可获双倍印花', en: 'Earn double stamps on all purchases this Saturday' },
    fullContent: {
      'zh-TW': '親愛的會員，\n\n本週六（2月20日）為雙倍印花日！在全港領展商場消費即可獲得雙倍印花獎賞。\n\n活動詳情：\n• 適用於所有領展商場\n• 消費滿HK$50即可獲得雙倍印花\n• 可與其他優惠同時使用\n\n立即前往商場購物，賺取更多印花！',
      'zh-CN': '亲爱的会员，\n\n本周六（2月20日）为双倍印花日！在全港领展商场消费即可获得双倍印花奖赏。\n\n活动详情：\n• 适用于所有领展商场\n• 消费满HK$50即可获得双倍印花\n• 可与其他优惠同时使用\n\n立即前往商场购物，赚取更多印花！',
      en: 'Dear Member,\n\nThis Saturday (Feb 20) is Double Stamps Day! Shop at any Link REIT mall to earn double stamps.\n\nPromotion Details:\n• Valid at all Link REIT malls\n• Earn double stamps on purchases HK$50 or above\n• Can be combined with other offers\n\nVisit our malls now and earn more stamps!'
    },
    time: '2026-02-17 10:30',
    read: false,
    link: '/offers',
  },
  {
    id: '2',
    type: 'transaction',
    title: { 'zh-TW': '印花到賬通知', 'zh-CN': '印花到账通知', en: 'Stamps Credited' },
    content: { 'zh-TW': '您在星巴克消費獲得 +50 印花', 'zh-CN': '您在星巴克消费获得 +50 印花', en: 'You earned +50 stamps at Starbucks' },
    fullContent: {
      'zh-TW': '交易詳情：\n\n商戶：Starbucks (又一城)\n消費金額：HK$98\n獲得印花：+50\n交易時間：2026-02-16 15:42\n\n您的印花餘額：2,580',
      'zh-CN': '交易详情：\n\n商户：Starbucks (又一城)\n消费金额：HK$98\n获得印花：+50\n交易时间：2026-02-16 15:42\n\n您的印花余额：2,580',
      en: 'Transaction Details:\n\nMerchant: Starbucks (Festival Walk)\nAmount: HK$98\nStamps Earned: +50\nTransaction Time: 2026-02-16 15:42\n\nYour Stamp Balance: 2,580'
    },
    time: '2026-02-16 15:42',
    read: false,
    link: '/stamp',
  },
  {
    id: '3',
    type: 'system',
    title: { 'zh-TW': '系統維護通知', 'zh-CN': '系统维护通知', en: 'System Maintenance' },
    content: { 'zh-TW': '系統將於今晚 2:00-4:00 進行維護', 'zh-CN': '系统将于今晚 2:00-4:00 进行维护', en: 'System maintenance scheduled tonight 2:00-4:00 AM' },
    fullContent: {
      'zh-TW': '尊敬的會員，\n\n為提升服務質量，本系統將於以下時間進行維護：\n\n維護時間：2026年2月15日 凌晨2:00 - 4:00\n\n維護期間，以下服務將暫時無法使用：\n• 積分查詢\n• 優惠券兌換\n• 會員資料修改\n\n維護完成後服務將自動恢復。如有不便，敬請見諒。\n\n領展會員服務團隊',
      'zh-CN': '尊敬的会员，\n\n为提升服务质量，本系统将于以下时间进行维护：\n\n维护时间：2026年2月15日 凌晨2:00 - 4:00\n\n维护期间，以下服务将暂时无法使用：\n• 积分查询\n• 优惠券兑换\n• 会员资料修改\n\n维护完成后服务将自动恢复。如有不便，敬请见谅。\n\n领展会员服务团队',
      en: 'Dear Member,\n\nTo improve our service quality, system maintenance will be conducted during the following period:\n\nMaintenance Time: Feb 15, 2026, 2:00 AM - 4:00 AM\n\nThe following services will be temporarily unavailable:\n• Points inquiry\n• Coupon redemption\n• Profile updates\n\nServices will resume automatically after maintenance. We apologize for any inconvenience.\n\nLink REIT Member Services Team'
    },
    time: '2026-02-15 09:00',
    read: true,
  },
  {
    id: '4',
    type: 'promotion',
    title: { 'zh-TW': '新年優惠來襲', 'zh-CN': '新年优惠来袭', en: 'New Year Special Offers' },
    content: { 'zh-TW': '春節期間消費滿 $500 即送精美禮品', 'zh-CN': '春节期间消费满 $500 即送精美礼品', en: 'Spend $500 during CNY and receive a special gift' },
    time: '2026-02-14 12:00',
    read: true,
    link: '/campaign/c1',
  },
  {
    id: '5',
    type: 'transaction',
    title: { 'zh-TW': '優惠券即將到期', 'zh-CN': '优惠券即将到期', en: 'Coupon Expiring Soon' },
    content: { 'zh-TW': '您有 2 張優惠券將於 3 天內到期', 'zh-CN': '您有 2 张优惠券将于 3 天内到期', en: 'You have 2 coupons expiring in 3 days' },
    time: '2026-02-12 10:00',
    read: true,
    link: '/offers',
  },
  {
    id: '6',
    type: 'service',
    title: { 'zh-TW': '客服回覆', 'zh-CN': '客服回复', en: 'Customer Service Reply' },
    content: { 'zh-TW': '您的查詢已收到，我們將盡快回覆', 'zh-CN': '您的查询已收到，我们将尽快回复', en: 'We received your inquiry and will reply soon' },
    fullContent: {
      'zh-TW': '您好，\n\n感謝您聯繫領展客戶服務。\n\n關於您查詢的印花到賬問題，經查核後確認交易記錄正常。印花將於24小時內到賬。\n\n如有其他疑問，歡迎隨時聯繫我們。\n\n祝您購物愉快！\n\n領展客戶服務團隊',
      'zh-CN': '您好，\n\n感谢您联系领展客户服务。\n\n关于您查询的印花到账问题，经查核后确认交易记录正常。印花将于24小时内到账。\n\n如有其他疑问，欢迎随时联系我们。\n\n祝您购物愉快！\n\n领展客户服务团队',
      en: 'Hello,\n\nThank you for contacting Link REIT Customer Service.\n\nRegarding your stamp credit inquiry, we have verified that the transaction is processed correctly. Stamps will be credited within 24 hours.\n\nPlease feel free to contact us if you have any other questions.\n\nHappy shopping!\n\nLink REIT Customer Service Team'
    },
    time: '2026-02-11 14:30',
    read: true,
    replies: [
      { content: { 'zh-TW': '我的印花還沒有到賬', 'zh-CN': '我的印花还没有到账', en: 'My stamps have not been credited yet' }, time: '2026-02-11 10:00', isUser: true },
      { content: { 'zh-TW': '您好，我們已收到您的查詢，正在處理中', 'zh-CN': '您好，我们已收到您的查询，正在处理中', en: 'Hello, we have received your inquiry and are processing it' }, time: '2026-02-11 11:30', isUser: false },
      { content: { 'zh-TW': '好的，謝謝', 'zh-CN': '好的，谢谢', en: 'OK, thank you' }, time: '2026-02-11 12:00', isUser: true },
    ],
  },
];

const STORAGE_KEY = 'messages_read_status';
const DELETED_KEY = 'messages_deleted';

// CSS for transitions
const messageItemStyle = `
  .message-item {
    transition: background-color 0.3s ease, opacity 0.3s ease;
  }
  .message-item.unread {
    background: var(--unread-bg);
    border-left: 3px solid var(--primary-color);
  }
  .message-item.read {
    background: #fff;
    border-left: 3px solid transparent;
  }
  .message-item .unread-dot {
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

export default function MessagesPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  // Persist read status
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, boolean> = {};
    messagesData.forEach((m) => { initial[m.id] = m.read; });
    return initial;
  });

  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DELETED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<typeof messagesData[0] | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState<Record<string, typeof messagesData[0]['replies']>>({});

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatus));
  }, [readStatus]);

  useEffect(() => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
  }, [deletedIds]);

  const messages = useMemo(() => {
    return messagesData
      .filter((m) => !deletedIds.includes(m.id))
      .map((m) => ({
        ...m,
        title: m.title[locale],
        content: m.content[locale],
        fullContent: m.fullContent?.[locale],
        read: readStatus[m.id] ?? m.read,
        replies: [...(m.replies || []), ...(localReplies[m.id] || [])].map(r => ({
          ...r,
          content: typeof r.content === 'string' ? r.content : r.content[locale],
        })),
      }));
  }, [locale, readStatus, deletedIds, localReplies]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const markAsRead = (id: string) => {
    if (!readStatus[id]) {
      setReadStatus((prev) => ({ ...prev, [id]: true }));
    }
  };

  const deleteMessage = (id: string) => {
    Dialog.confirm({
      content: tl('confirmDelete'),
      onConfirm: () => {
        setDeletedIds((prev) => [...prev, id]);
        Toast.show({ content: tl('delete'), icon: 'success' });
      },
    });
  };

  const markAllAsRead = () => {
    const newStatus: Record<string, boolean> = {};
    messagesData.forEach((m) => { newStatus[m.id] = true; });
    setReadStatus(newStatus);
  };

  const openMessage = (msg: typeof messages[0]) => {
    markAsRead(msg.id);
    const originalMsg = messagesData.find(m => m.id === msg.id);
    setSelectedMessage(originalMsg || null);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    const newReply = {
      content: { 'zh-TW': replyText, 'zh-CN': replyText, en: replyText },
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isUser: true,
    };

    setLocalReplies(prev => ({
      ...prev,
      [selectedMessage.id]: [...(prev[selectedMessage.id] || []), newReply],
    }));

    Toast.show({ content: tl('sent'), icon: 'success' });
    setReplyText('');
    setShowReply(false);
  };

  const filteredMessages =
    activeTab === 'all'
      ? messages
      : messages.filter((m) => m.type === activeTab);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return t('messages.system');
      case 'promotion': return t('messages.promotion');
      case 'transaction': return t('messages.transaction');
      case 'service': return tl('customerService');
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return '#666';
      case 'promotion': return colors.primary;
      case 'transaction': return '#52c41a';
      case 'service': return '#1890ff';
      default: return '#999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return '🔔';
      case 'promotion': return '🎁';
      case 'transaction': return '💰';
      case 'service': return '💬';
      default: return '📩';
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return time.split(' ')[1] || time;
    } else if (days === 1) {
      return locale === 'en' ? 'Yesterday' : '昨天';
    } else if (days < 7) {
      return locale === 'en' ? `${days}d ago` : `${days}天前`;
    } else {
      return time.split(' ')[0];
    }
  };

  const serviceLabel = { 'zh-TW': '客服', 'zh-CN': '客服', en: 'Service' }[locale];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{messageItemStyle}</style>
      <NavBar
        onBack={() => navigate(-1)}
        right={
          unreadCount > 0 ? (
            <span onClick={markAllAsRead} style={{ color: colors.primary, fontSize: 14 }}>
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
        style={{ background: '#fff', '--active-line-color': colors.primary, '--active-title-color': colors.primary } as React.CSSProperties}
      >
        <Tabs.Tab title={tl('all')} key="all" />
        <Tabs.Tab title={t('messages.system')} key="system" />
        <Tabs.Tab title={t('messages.promotion')} key="promotion" />
        <Tabs.Tab title={t('messages.transaction')} key="transaction" />
        <Tabs.Tab title={serviceLabel} key="service" />
      </Tabs>

      {filteredMessages.length === 0 ? (
        <Empty description={t('messages.noMessages')} style={{ padding: '60px 0' }} />
      ) : (
        <List style={{ marginTop: 8 }}>
          {filteredMessages.map((msg) => (
            <SwipeAction
              key={msg.id}
              rightActions={[
                { key: 'delete', text: tl('delete'), color: 'danger', onClick: () => deleteMessage(msg.id) },
              ]}
            >
              <List.Item
                onClick={() => openMessage(msg)}
                className={`message-item ${msg.read ? 'read' : 'unread'}`}
                style={{
                  background: msg.read ? '#fff' : `${colors.primary}10`,
                  borderLeft: msg.read ? '3px solid transparent' : `3px solid ${colors.primary}`,
                  transition: 'all 0.3s ease',
                  '--unread-bg': `${colors.primary}10`,
                  '--primary-color': colors.primary,
                } as React.CSSProperties}
                prefix={
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    background: msg.read ? `${getTypeColor(msg.type)}15` : `${getTypeColor(msg.type)}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    transition: 'background 0.3s ease',
                  }}>
                    {getTypeIcon(msg.type)}
                  </div>
                }
                description={
                  <div style={{ color: msg.read ? '#999' : '#666', marginTop: 4, fontSize: 13, transition: 'color 0.3s ease' }}>
                    {msg.content}
                  </div>
                }
                extra={
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#999' }}>{formatTime(msg.time)}</span>
                    {!msg.read && (
                      <span
                        className="unread-dot"
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: colors.primary,
                          boxShadow: `0 0 4px ${colors.primary}`,
                        }}
                      />
                    )}
                  </div>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontWeight: msg.read ? 400 : 600,
                    fontSize: 15,
                    color: msg.read ? '#666' : '#333',
                    transition: 'all 0.3s ease',
                  }}>
                    {msg.title}
                  </span>
                  {!msg.read && (
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: colors.primary,
                      color: '#fff',
                    }}>
                      {locale === 'en' ? 'NEW' : '新'}
                    </span>
                  )}
                </div>
              </List.Item>
            </SwipeAction>
          ))}
        </List>
      )}

      {/* Message Detail Popup */}
      <Popup
        visible={!!selectedMessage}
        onMaskClick={() => setSelectedMessage(null)}
        position="right"
        bodyStyle={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {selectedMessage && (
          <>
            <NavBar
              onBack={() => setSelectedMessage(null)}
              style={{ background: '#fff', flexShrink: 0 }}
            >
              {tl('messageDetail')}
            </NavBar>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {/* Message Header */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Avatar
                  style={{
                    '--size': '48px',
                    '--border-radius': '24px',
                    background: `${getTypeColor(selectedMessage.type)}`,
                    color: '#fff',
                    fontSize: 24,
                  }}
                >
                  {getTypeIcon(selectedMessage.type)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{tl('linkMall')}</div>
                  <div style={{
                    fontSize: 12,
                    color: getTypeColor(selectedMessage.type),
                    background: `${getTypeColor(selectedMessage.type)}15`,
                    padding: '2px 8px',
                    borderRadius: 4,
                    display: 'inline-block',
                    marginTop: 4,
                  }}>
                    {getTypeLabel(selectedMessage.type)}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {selectedMessage.time}
                </div>
              </div>

              {/* Message Content */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                  {selectedMessage.title[locale]}
                </div>
                <div style={{ fontSize: 14, color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.fullContent?.[locale] || selectedMessage.content[locale]}
                </div>
                {selectedMessage.link && (
                  <Button
                    block
                    size="small"
                    style={{ marginTop: 16, '--border-color': colors.primary, '--text-color': colors.primary } as React.CSSProperties}
                    onClick={() => { setSelectedMessage(null); navigate(selectedMessage.link!); }}
                  >
                    {tl('viewDetails')}
                  </Button>
                )}
              </div>

              {/* Conversation Thread */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {[...selectedMessage.replies, ...(localReplies[selectedMessage.id] || [])].map((reply, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: reply.isUser ? 'flex-end' : 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{
                        maxWidth: '80%',
                        background: reply.isUser ? colors.primary : '#fff',
                        color: reply.isUser ? '#fff' : '#333',
                        padding: '10px 14px',
                        borderRadius: reply.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 14 }}>
                          {typeof reply.content === 'string' ? reply.content : reply.content[locale]}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                          {reply.time.split(' ')[1] || reply.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Input (for service messages) */}
            {selectedMessage.type === 'service' && (
              <div style={{
                padding: 12,
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-end',
                flexShrink: 0,
              }}>
                <TextArea
                  placeholder={tl('replyPlaceholder')}
                  value={replyText}
                  onChange={setReplyText}
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ flex: 1, '--font-size': '14px' } as React.CSSProperties}
                />
                <Button
                  color="primary"
                  size="small"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  style={{ '--background-color': colors.primary, '--border-color': colors.primary, flexShrink: 0 } as React.CSSProperties}
                >
                  {tl('send')}
                </Button>
              </div>
            )}
          </>
        )}
      </Popup>
    </div>
  );
}
