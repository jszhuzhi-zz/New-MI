import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Toast, Input, Button, SpinLoading, Tag, Rate } from 'antd-mobile';
import { LeftOutline, CloseCircleOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';
import { feedbackApi } from '../../services/api';
import { useTranslation } from '../../locales';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const DEFAULT_PROJECT_ID = 'proj_default';

export default function AICustomerServicePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = useAuthStore((s) => s.locale);
  const currentMallId = useAuthStore((s) => s.currentMallId);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'en'
        ? 'Hello! I\'m your AI shopping assistant. I can help you with:\n\n• Mall information and directions\n• Store hours and locations\n• Membership benefits\n• Promotions and events\n• General inquiries\n\nHow can I assist you today?'
        : locale === 'zh-CN'
        ? '您好！我是您的AI购物助手。我可以帮助您：\n\n• 商场信息和指引\n• 店铺营业时间和位置\n• 会员权益\n• 促销和活动\n• 一般咨询\n\n请问有什么可以帮到您？'
        : '您好！我是您的AI購物助手。我可以幫助您：\n\n• 商場資訊和指引\n• 店舖營業時間和位置\n• 會員權益\n• 促銷和活動\n• 一般諮詢\n\n請問有什麼可以幫到您？',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [locale]);

  const createFeedbackSession = async () => {
    try {
      const response = await feedbackApi.createFeedback({
        projectId: DEFAULT_PROJECT_ID,
        category: 'GENERAL',
        title: locale === 'en' ? 'AI Customer Service' : 'AI客服諮詢',
      });
      return response.data.data.id;
    } catch (error) {
      console.error('Failed to create feedback session:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let currentFeedbackId = feedbackId;

      // Create feedback session if not exists
      if (!currentFeedbackId) {
        currentFeedbackId = await createFeedbackSession();
        if (currentFeedbackId) {
          setFeedbackId(currentFeedbackId);
        } else {
          throw new Error('Failed to create session');
        }
      }

      // Send message
      const response = await feedbackApi.sendMessage(currentFeedbackId, userMessage.content);

      if (response.data.data.assistantMessage) {
        const assistantMessage: Message = {
          id: response.data.data.assistantMessage.id,
          role: 'assistant',
          content: response.data.data.assistantMessage.content,
          timestamp: new Date(response.data.data.assistantMessage.createdAt),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: locale === 'en'
          ? 'Sorry, I encountered an error. Please try again.'
          : locale === 'zh-CN'
          ? '抱歉，出现了一些问题。请重试。'
          : '抱歉，出現了一些問題。請重試。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRatingSubmit = async () => {
    if (!feedbackId || rating === 0) return;

    try {
      await feedbackApi.rateFeedback(feedbackId, rating);
      Toast.show({
        content: locale === 'en' ? 'Thank you for your feedback!' : '感謝您的評價！',
        icon: 'success',
      });
      setShowRating(false);
    } catch (error) {
      Toast.show({
        content: locale === 'en' ? 'Failed to submit rating' : '評價提交失敗',
        icon: 'fail',
      });
    }
  };

  const handleEndSession = async () => {
    if (feedbackId) {
      setShowRating(true);
    } else {
      navigate(-1);
    }
  };

  const quickQuestions = locale === 'en'
    ? ['Mall hours', 'Parking info', 'Membership benefits', 'Current promotions']
    : locale === 'zh-CN'
    ? ['营业时间', '停车资讯', '会员权益', '最新优惠']
    : ['營業時間', '停車資訊', '會員權益', '最新優惠'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <NavBar
        className="link-nav-bar"
        back={<LeftOutline />}
        onBack={() => navigate(-1)}
        right={
          <span
            onClick={handleEndSession}
            style={{ fontSize: 14, cursor: 'pointer' }}
          >
            {locale === 'en' ? 'End' : '結束'}
          </span>
        }
      >
        {locale === 'en' ? 'AI Customer Service' : 'AI客服'}
      </NavBar>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {/* Quick Questions */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
              {locale === 'en' ? 'Quick questions:' : '快速提問：'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickQuestions.map((q, i) => (
                <Tag
                  key={i}
                  round
                  color="primary"
                  fill="outline"
                  onClick={() => setInputText(q)}
                  style={{ cursor: 'pointer' }}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? colors.primary : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <SpinLoading color="primary" style={{ '--size': '20px' } as React.CSSProperties} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder={locale === 'en' ? 'Type your message...' : '輸入您的問題...'}
            value={inputText}
            onChange={(val) => setInputText(val)}
            onKeyDown={handleKeyPress}
            style={{
              flex: 1,
              '--font-size': '15px',
              background: '#f5f5f5',
              borderRadius: 20,
              padding: '8px 16px',
            } as React.CSSProperties}
          />
          <Button
            color="primary"
            shape="rounded"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={{
              minWidth: 60,
              background: colors.primary,
            }}
          >
            {locale === 'en' ? 'Send' : '發送'}
          </Button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              width: '85%',
              maxWidth: 320,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                cursor: 'pointer',
              }}
              onClick={() => {
                setShowRating(false);
                navigate(-1);
              }}
            >
              <CloseCircleOutline fontSize={24} color="#999" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              {locale === 'en' ? 'Rate this service' : '評價此次服務'}
            </div>
            <div style={{ marginBottom: 20 }}>
              <Rate
                value={rating}
                onChange={setRating}
                style={{ '--star-size': '32px' } as React.CSSProperties}
              />
            </div>
            <Button
              color="primary"
              block
              onClick={handleRatingSubmit}
              style={{ background: colors.primary }}
            >
              {locale === 'en' ? 'Submit' : '提交'}
            </Button>
            <div
              onClick={() => {
                setShowRating(false);
                navigate(-1);
              }}
              style={{
                marginTop: 12,
                color: '#999',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {locale === 'en' ? 'Skip' : '跳過'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
