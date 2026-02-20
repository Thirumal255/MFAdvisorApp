/**
 * ============================================================
 * CHAT SCREEN - MF Bestie AI Chatbot (FIXED)
 * ============================================================
 * FILE: screens/ChatScreen.js
 * 
 * FIXES:
 * 1. return_1y display - backend sends percentage, don't multiply again
 * 2. Navigation - properly tracks previousScreen for back button
 * 3. Fund card data mapping - uses correct field names
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';

import { chatStyles, COLORS } from '../styles/appStyles';
import { API_ENDPOINTS } from '../config/api';

// ============================================================
// CHAT BUBBLE COMPONENT
// ============================================================

const ChatBubble = ({ message, isUser, data, onFundPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        chatStyles.bubbleContainer,
        isUser ? chatStyles.userBubbleContainer : chatStyles.aiBubbleContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* AI Avatar */}
      {!isUser && (
        <View style={chatStyles.avatar}>
          <Text style={chatStyles.avatarText}>🎯</Text>
        </View>
      )}
      
      {/* Message Bubble */}
      <View style={[chatStyles.bubble, isUser ? chatStyles.userBubble : chatStyles.aiBubble]}>
        <Text style={[chatStyles.bubbleText, isUser ? chatStyles.userBubbleText : chatStyles.aiBubbleText]}>
          {message}
        </Text>
        
        {/* Inline Fund Cards */}
        {data?.funds && Object.entries(data.funds).map(([code, fund]) => (
          <TouchableOpacity
            key={code}
            style={chatStyles.inlineFundCard}
            onPress={() => onFundPress?.(fund.scheme_code || code)}
            activeOpacity={0.7}
          >
            <Text style={chatStyles.fundCardName} numberOfLines={2}>
              {fund.name || fund.fund_name}
            </Text>
            <Text style={chatStyles.fundCardCategory}>
              {fund.category} • {fund.riskometer || fund.risk_level || 'N/A'}
            </Text>
            <View style={chatStyles.fundCardMetrics}>
              {/* 1Y Return - Backend already sends as percentage! */}
              {fund.metrics?.return_1y != null && (
                <View style={chatStyles.metricItem}>
                  <Text style={chatStyles.metricLabel}>1Y Return</Text>
                  <Text style={[
                    chatStyles.metricValue, 
                    { color: fund.metrics.return_1y >= 0 ? COLORS.success : COLORS.error }
                  ]}>
                    {fund.metrics.return_1y.toFixed(1)}%
                  </Text>
                </View>
              )}
              {/* Sharpe Ratio */}
              {fund.metrics?.sharpe != null && (
                <View style={chatStyles.metricItem}>
                  <Text style={chatStyles.metricLabel}>Sharpe</Text>
                  <Text style={chatStyles.metricValue}>
                    {fund.metrics.sharpe.toFixed(2)}
                  </Text>
                </View>
              )}
              {/* Expense Ratio */}
              {(fund.expense_direct || fund.expense_ratio) && (
                <View style={chatStyles.metricItem}>
                  <Text style={chatStyles.metricLabel}>Expense</Text>
                  <Text style={chatStyles.metricValue}>
                    {(fund.expense_direct || fund.expense_ratio).toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
            {/* Score Badge */}
            {fund.score > 0 && (
              <View style={[
                chatStyles.scoreBadge,
                { backgroundColor: fund.score >= 70 ? COLORS.success + '20' : fund.score >= 50 ? COLORS.warning + '20' : COLORS.textDark + '20' }
              ]}>
                <Text style={[
                  chatStyles.scoreBadgeText,
                  { color: fund.score >= 70 ? COLORS.success : fund.score >= 50 ? COLORS.warning : COLORS.textSecondary }
                ]}>
                  Score: {fund.score.toFixed(0)}/100
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

// ============================================================
// TYPING INDICATOR COMPONENT
// ============================================================

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    };
    
    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);
    
    anim1.start();
    anim2.start();
    anim3.start();
    
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);
  
  const getDotStyle = (animValue) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [{
      translateY: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6],
      }),
    }],
  });
  
  return (
    <View style={chatStyles.typingContainer}>
      <View style={chatStyles.avatar}>
        <Text style={chatStyles.avatarText}>🎯</Text>
      </View>
      <View style={chatStyles.typingBubble}>
        <Animated.View style={[chatStyles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[chatStyles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[chatStyles.dot, getDotStyle(dot3)]} />
      </View>
    </View>
  );
};

// ============================================================
// QUICK REPLIES COMPONENT
// ============================================================

const QuickReplies = ({ suggestions, onSelect, visible }) => {
  if (!visible || !suggestions || suggestions.length === 0) {
    return null;
  }
  
  return (
    <View style={chatStyles.quickRepliesContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={suggestions}
        keyExtractor={(item, index) => `suggestion-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={chatStyles.quickReplyChip}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={chatStyles.quickReplyText}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={chatStyles.quickRepliesList}
      />
    </View>
  );
};

// ============================================================
// MAIN CHAT SCREEN
// ============================================================

const INITIAL_MESSAGE = {
  id: '1',
  role: 'assistant',
  content: `Hey! I'm MF Bestie 🎯

I can help you with:
• Finding your risk profile (SEBI aligned)
• Suggesting funds for your goals
• Comparing mutual funds
• Answering questions about any fund

What would you like to know?`,
  data: null,
};

const ChatScreen = ({ navigation, chatHistory, setChatHistory }) => {
  // Initialize messages - use chatHistory if available, otherwise start fresh
  const [messages, setMessagesInternal] = useState(() => {
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      return chatHistory;
    }
    return [INITIAL_MESSAGE];
  });
  
  // Wrapper to update both local and parent state
  const setMessages = (updater) => {
    setMessagesInternal(prev => {
      const newMessages = typeof updater === 'function' ? updater(prev) : updater;
      // Also update parent state if provided
      if (setChatHistory) {
        setChatHistory(newMessages);
      }
      return newMessages;
    });
  };
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "What's my risk profile? 🎯",
    "Best large cap funds",
    "How to start SIP?",
    "Compare HDFC vs ICICI funds",
  ]);
  
  const flatListRef = useRef(null);
  
  // Send message
  const sendMessage = useCallback(async (text) => {
    const messageText = text?.trim() || inputText.trim();
    if (!messageText) return;
    
    Keyboard.dismiss();
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      data: null,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setSuggestions([]);
    
    try {
      console.log('📤 Sending message to:', API_ENDPOINTS.CHAT_MESSAGE);
      
      const response = await fetch(API_ENDPOINTS.CHAT_MESSAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Response received:', data.message?.substring(0, 50) + '...');
      
      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        data: data.data,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (data.suggestions?.length > 0) {
        setSuggestions(data.suggestions);
      }
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Oops! I'm having trouble connecting right now 😅\n\nError: ${error.message}\n\nPlease check your internet and try again.`,
        data: null,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setSuggestions(["Try again", "What's my risk profile?"]);
      
    } finally {
      setIsTyping(false);
    }
  }, [inputText, messages]);
  
  // Auto-scroll
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);
  
  // Handle fund press - Navigate to FundDetails with proper back navigation
  const handleFundPress = (fundCode) => {
    if (fundCode && navigation?.navigate) {
      // Pass 'chat' as the previous screen so back button works correctly
      navigation.navigate('FundDetails', { 
        fundCode: fundCode,
        previousScreen: 'chat'  // This tells FundDetails where to go back
      });
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={chatStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={chatStyles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Text style={{ fontSize: 24, color: COLORS.textPrimary, marginRight: 12 }}>←</Text>
        </TouchableOpacity>
        
        <View style={chatStyles.headerCenter}>
          <View style={chatStyles.headerTitleRow}>
            <Text style={chatStyles.headerTitle}>MF Bestie</Text>
            <View style={chatStyles.aiBadge}>
              <Text style={chatStyles.aiBadgeText}>AI</Text>
            </View>
          </View>
          <Text style={chatStyles.headerSubtitle}>Your Mutual Fund Advisor</Text>
        </View>
        
        <View style={chatStyles.onlineIndicator}>
          <View style={chatStyles.onlineDot} />
          <Text style={chatStyles.onlineText}>Online</Text>
        </View>
      </View>
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        style={chatStyles.messagesList}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item.content}
            isUser={item.role === 'user'}
            data={item.data}
            onFundPress={handleFundPress}
          />
        )}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        contentContainerStyle={chatStyles.messagesContent}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Quick Replies */}
      <QuickReplies
        suggestions={suggestions}
        onSelect={sendMessage}
        visible={!isTyping && suggestions.length > 0}
      />
      
      {/* Input Area */}
      <View style={chatStyles.inputContainer}>
        <TextInput
          style={chatStyles.textInput}
          placeholder="Ask me anything about mutual funds..."
          placeholderTextColor={COLORS.textDark}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[
            chatStyles.sendButton,
            inputText.trim() ? chatStyles.sendButtonActive : null,
          ]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.7}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <Text style={chatStyles.sendButtonText}>
              {inputText.trim() ? '➤' : '🎤'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
