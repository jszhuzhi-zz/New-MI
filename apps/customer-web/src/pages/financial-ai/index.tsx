import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Input, Button, SpinLoading, Tag } from 'antd-mobile';
import { LeftOutline, SendOutline } from 'antd-mobile-icons';
import { useSettingsStore } from '../../store/settings';

const GEMINI_API_KEY = 'AIzaSyA1mGt9TdbzAFr2NNb6Ty-nKtn1LA-q2WA';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `你是一位专业的金融分析师AI助手，专注于为用户提供深度金融分析服务。你的能力包括：

📊 股票与市场分析
• 分析个股基本面与技术面
• 解读财务报表（利润表、资产负债表、现金流量表）
• 评估市盈率、市净率等估值指标

📈 宏观经济分析
• 解读经济数据（GDP、CPI、PMI等）
• 分析货币政策与财政政策影响
• 全球市场联动分析

💰 投资组合管理
• 资产配置建议
• 风险收益评估
• 多元化投资策略

🏦 金融产品分析
• 基金、债券、ETF分析
• 衍生品基础知识
• REITs（房地产投资信托基金）分析

⚠️ 免责声明：本AI提供的分析仅供参考，不构成具体投资建议。投资有风险，决策需谨慎。

请用简洁、专业的语言回答，适当使用数据和图表说明，并在必要时提醒用户注意投资风险。`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const QUICK_QUESTIONS = [
  '分析恒生指数走势',
  '什么是市盈率？',
  'REITs投资分析',
  '如何看财务报表？',
  '港元利率影响',
  '如何分散投资风险？',
];

export default function FinancialAIPage() {
  const navigate = useNavigate();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<GeminiContent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const welcome: Message = {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是您的金融分析AI助手 📊\n\n我可以帮您分析股票、解读宏观经济数据、评估投资组合，以及解答各类金融问题。\n\n请问有什么可以为您服务的？',
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, []);

  const sendToGemini = async (userText: string, history: GeminiContent[]): Promise<string> => {
    const contents: GeminiContent[] = [
      ...history,
      { role: 'user', parts: [{ text: userText }] },
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '抱歉，未能获取有效回复。';
  };

  const handleSend = async (text?: string) => {
    const msgText = (text ?? inputText).trim();
    if (!msgText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const replyText = await sendToGemini(msgText, conversationHistory);

      const newHistory: GeminiContent[] = [
        ...conversationHistory,
        { role: 'user', parts: [{ text: msgText }] },
        { role: 'model', parts: [{ text: replyText }] },
      ];
      setConversationHistory(newHistory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，请求出现错误：${error instanceof Error ? error.message : '请稍后重试'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <NavBar
        className="link-nav-bar"
        back={<LeftOutline />}
        onBack={() => navigate(-1)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <span>金融分析AI</span>
        </div>
      </NavBar>

      {/* Disclaimer banner */}
      <div
        style={{
          background: '#fff7e6',
          borderBottom: '1px solid #ffe7ba',
          padding: '6px 16px',
          fontSize: 11,
          color: '#d46b08',
          textAlign: 'center',
        }}
      >
        ⚠️ 本内容仅供参考，不构成投资建议。投资有风险，入市需谨慎。
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {/* Quick questions — show only at start */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8, textAlign: 'center' }}>
              快速提问
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {QUICK_QUESTIONS.map((q) => (
                <Tag
                  key={q}
                  round
                  color="#00694B"
                  fill="outline"
                  onClick={() => handleSend(q)}
                  style={{ cursor: 'pointer', fontSize: 12 }}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 14,
              alignItems: 'flex-end',
              gap: 8,
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                📊
              </div>
            )}
            <div
              style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role === 'user' ? colors.primary : '#fff',
                color: msg.role === 'user' ? '#fff' : '#222',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {formatContent(msg.content)}
              <div
                style={{
                  fontSize: 10,
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#bbb',
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                {msg.timestamp.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              📊
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}
            >
              <SpinLoading color="primary" style={{ '--size': '20px' } as React.CSSProperties} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="请输入您的金融问题..."
          value={inputText}
          onChange={(val) => setInputText(val)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            '--font-size': '15px',
            background: '#f5f5f5',
            borderRadius: 22,
            padding: '8px 16px',
          } as React.CSSProperties}
        />
        <Button
          color="primary"
          shape="rounded"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          style={{
            width: 44,
            height: 44,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: inputText.trim() && !isLoading ? colors.primary : undefined,
            flexShrink: 0,
          }}
        >
          <SendOutline fontSize={18} />
        </Button>
      </div>
    </div>
  );
}
