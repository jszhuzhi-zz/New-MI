import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '../../hooks/useLocale';
import { feedbackApi } from '../../services/api';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  userBubble: '#00694B',
  aiBubble: '#FFFFFF',
};

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}

interface Feedback {
  id: string;
  messages: Message[];
}

export default function AICustomerServiceScreen({ route }: any) {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const projectId = route?.params?.projectId || 'default-project';

  // Initialize conversation
  useEffect(() => {
    initConversation();
  }, []);

  const initConversation = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.createFeedback({
        projectId,
        category: 'INQUIRY',
      });
      if (response.data?.data?.id) {
        setFeedbackId(response.data.data.id);
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'ASSISTANT',
            content: getWelcomeMessage(),
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to init conversation:', err);
      setError(t('feedback.initError'));
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    switch (locale) {
      case 'en':
        return 'Hello! I am the AI customer service assistant. How can I help you today?\n\nI can assist you with:\n• Mall information and directions\n• Store locations and opening hours\n• Membership and stamp inquiries\n• Feedback and suggestions';
      case 'zh-CN':
        return '您好！我是AI智能客服助手。请问有什么可以帮您？\n\n我可以为您提供：\n• 商场信息和指引\n• 店铺位置和营业时间\n• 会员和印花查询\n• 意见反馈';
      default:
        return '您好！我是AI智能客服助手。請問有什麼可以幫您？\n\n我可以為您提供：\n• 商場資訊和指引\n• 店舖位置和營業時間\n• 會員和印花查詢\n• 意見反饋';
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !feedbackId || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'USER',
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await feedbackApi.sendMessage(feedbackId, inputText.trim());
      if (response.data?.data?.assistantMessage) {
        const aiMsg = response.data.data.assistantMessage;
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsg.id,
            role: 'ASSISTANT',
            content: aiMsg.content,
            createdAt: aiMsg.createdAt,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(t('feedback.sendError'));
      // Add error message as AI response
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'ASSISTANT',
          content: locale === 'en'
            ? 'Sorry, I encountered an error. Please try again.'
            : locale === 'zh-CN'
            ? '抱歉，系统遇到了问题。请稍后再试。'
            : '抱歉，系統遇到了問題。請稍後再試。',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'USER';
    return (
      <View style={[styles.messageBubbleContainer, isUser && styles.userBubbleContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder={
          locale === 'en'
            ? 'Type your message...'
            : locale === 'zh-CN'
            ? '输入您的问题...'
            : '輸入您的問題...'
        }
        placeholderTextColor={COLORS.textTertiary}
        value={inputText}
        onChangeText={setInputText}
        multiline
        maxLength={500}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
        onPress={sendMessage}
        disabled={!inputText.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.surface} />
        ) : (
          <Text style={styles.sendButtonText}>
            {locale === 'en' ? 'Send' : '發送'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {renderInputArea()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  userMessageText: {
    color: COLORS.surface,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
    marginLeft: 4,
  },
  userMessageTime: {
    marginRight: 4,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    fontSize: 15,
    color: COLORS.text,
    marginRight: 8,
  },
  sendButton: {
    width: 60,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
