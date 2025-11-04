import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your deployed webhook URL
const WEBHOOK_URL = 'http://localhost:3000/webhook';

// Languages supported by Thando
const LANGUAGES = {
  en: { code: 'en', name: 'English', welcome: 'Hi — I\'m Thando. Ask me to set up a wallet, send a tip, or withdraw.' },
  zu: { code: 'zu', name: 'isiZulu', welcome: 'Sawubona — nginguThando. Ngingakusiza ukusetha i-wallet, ukuthumela amathiphu, nokuhoxisa.' },
  nso: { code: 'nso', name: 'Sesotho', welcome: 'Dumela — ke Thando. Nka go thuša go hloma wallet, romela tip, goba go kgaogana.' }
};

function ChatBubble({ from, text, isLoading }) {
  const isUser = from === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
        {text}
        {isLoading && '...'}
      </Text>
    </View>
  );
}

function LangSelector({ currentLang, onSelect }) {
  return (
    <View style={styles.langRow}>
      {Object.values(LANGUAGES).map(lang => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.langBtn, currentLang === lang.code && styles.langBtnActive]}
          onPress={() => onSelect(lang.code)}
        >
          <Text style={[styles.langText, currentLang === lang.code && styles.langTextActive]}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ThandoChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en');
  const [sessionId, setSessionId] = useState('');
  const listRef = useRef(null);
  
  // Load language preference and init chat
  React.useEffect(() => {
    async function init() {
      try {
        // Load or generate session ID (for Dialogflow contexts)
        const savedSession = await AsyncStorage.getItem('@kasi_session_id');
        const newSessionId = savedSession || `s_${Date.now()}`;
        setSessionId(newSessionId);
        if (!savedSession) {
          await AsyncStorage.setItem('@kasi_session_id', newSessionId);
        }

        // Load language preference
        const savedLang = await AsyncStorage.getItem('@kasi_lang');
        if (savedLang && LANGUAGES[savedLang]) {
          setLang(savedLang);
        }

        // Set welcome message in preferred language
        const welcome = LANGUAGES[savedLang || 'en'].welcome;
        setMessages([{ id: '1', from: 'bot', text: welcome }]);
      } catch (err) {
        console.warn('Session/lang load error', err);
        // Fallback to English welcome
        setMessages([{ id: '1', from: 'bot', text: LANGUAGES.en.welcome }]);
      }
    }
    init();
  }, []);

  // Save language preference when changed
  const handleLangChange = useCallback(async (newLang) => {
    try {
      await AsyncStorage.setItem('@kasi_lang', newLang);
      setLang(newLang);
    } catch (err) {
      console.warn('Lang save error', err);
    }
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { id: String(Date.now()), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Optimistic loading message
    const loadingMsg = { id: `l-${Date.now()}`, from: 'bot', text: 'Processing', isLoading: true };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      // Dialogflow v2 API format
      const payload = {
        session: sessionId,
        queryInput: {
          text: {
            text: input,
            languageCode: lang
          }
        },
        queryParams: {
          contexts: [], // Optional: add any active contexts
          parameters: {
            // Optional: add any global parameters
            platform: 'mobile',
            app_version: '1.0'
          }
        }
      };

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      
      // Handle Dialogflow response
      if (json.error) {
        throw new Error(json.error.message || 'Webhook error');
      }

      // Extract response parts
      const botText = json.fulfillmentText || 'No response from Thando';
      const outputContexts = json.outputContexts || [];
      
      // Special handling for certain contexts/intents
      if (outputContexts.some(ctx => ctx.name.includes('requires-confirmation'))) {
        // Show confirmation UI (e.g., for withdrawals)
        Alert.alert('Confirm Action', botText, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => sendMessage('confirm') }
        ]);
      }

      // Remove loading message and add bot response
      setMessages(prev => 
        prev.filter(m => m.id !== loadingMsg.id)
        .concat({ 
          id: `b-${Date.now()}`,
          from: 'bot',
          text: botText,
          contexts: outputContexts // Store contexts for follow-ups
        })
      );

    } catch (err) {
      console.warn('Webhook error:', err);
      setMessages(prev => 
        prev.filter(m => m.id !== loadingMsg.id)
        .concat({
          id: `e-${Date.now()}`,
          from: 'bot',
          text: 'Network error. Please try again.'
        })
      );
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <LangSelector currentLang={lang} onSelect={handleLangChange} />
        
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble 
              from={item.from} 
              text={item.text}
              isLoading={item.isLoading}
            />
          )}
          contentContainerStyle={{ paddingBottom: 12 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={lang === 'zu' ? 'Buza uThando...' : lang === 'nso' ? 'Botšiša Thando...' : 'Ask Thando...'}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={styles.sendBtn} 
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendText}>
              {lang === 'zu' ? 'Thumela' : lang === 'nso' ? 'Romela' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  langRow: { flexDirection: 'row', padding: 8, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, marginHorizontal: 4, borderRadius: 16 },
  langBtnActive: { backgroundColor: '#0066cc' },
  langText: { fontSize: 12, color: '#666' },
  langTextActive: { color: '#fff' },
  bubble: { marginVertical: 6, marginHorizontal: 8, padding: 10, borderRadius: 8, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0066cc' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  bubbleText: { fontSize: 14 },
  userText: { color: '#fff' },
  botText: { color: '#111' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#ddd', alignItems: 'center' },
  input: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  sendBtn: { marginLeft: 8, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#0066cc', borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '600' }
});
