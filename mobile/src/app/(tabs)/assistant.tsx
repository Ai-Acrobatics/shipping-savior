import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { API_URL } from '@/lib/config';
import { Colors } from '@/constants/colors';
import { PressableScale } from '@/components/pressable-scale';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// The assistant is backed by /api/ai/chat — Claude with the platform's
// logistics tools (HTS search, duty rates, port lookup, route comparison,
// container specs, FTZ zones). It answers as SSE; RN fetch has no native
// streaming, so we read the full body and join the chunks.
async function askAssistant(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const parsed = JSON.parse(text) as { error?: string };
      throw new Error(parsed.error ?? `Request failed (${res.status})`);
    } catch (e) {
      if (e instanceof Error && e.message.includes('failed')) throw e;
      throw new Error(`Request failed (${res.status})`);
    }
  }
  // SSE payload: lines of `data: {"type":"text","content":"..."}`
  if (text.includes('data:')) {
    const chunks: string[] = [];
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const evt = JSON.parse(trimmed.slice(5).trim()) as {
          type?: string;
          content?: string;
        };
        if (evt.type === 'text' && evt.content) chunks.push(evt.content);
      } catch {
        // skip malformed frames
      }
    }
    if (chunks.length) return chunks.join('');
  }
  return text;
}

const SUGGESTIONS = [
  'What is the duty rate for fresh avocados from Peru?',
  'Compare routes from Port Hueneme to Yokohama',
  'What are the reefer container specs for a 40HC?',
  'Which FTZ zones are near Los Angeles?',
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const next: ChatMessage[] = [...messages, { role: 'user', content }];
      setMessages(next);
      setInput('');
      setBusy(true);
      try {
        const reply = await askAssistant(next);
        setMessages([...next, { role: 'assistant', content: reply }]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch (e) {
        setMessages([
          ...next,
          {
            role: 'assistant',
            content: `⚠️ ${e instanceof Error ? e.message : 'Something went wrong. Try again.'}`,
          },
        ]);
      } finally {
        setBusy(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      }
    },
    [busy, messages]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <Text style={styles.emptyTitle}>Logistics copilot</Text>
            <Text style={styles.emptySub}>
              Duty rates, HTS codes, route comparisons, container specs, FTZ
              zones — ask anything about your freight.
            </Text>
          </Animated.View>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <Animated.View key={s} entering={FadeInUp.delay(100 + i * 70).springify().damping(18)}>
                <PressableScale style={styles.suggestion} onPress={() => send(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => `${i}`}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <Animated.View
              entering={FadeInDown.springify().damping(18)}
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.bubbleText}>{item.content}</Text>
            </Animated.View>
          )}
          ListFooterComponent={
            busy ? (
              <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.bubble, styles.assistantBubble]}
              >
                <Text style={styles.thinking}>Thinking…</Text>
              </Animated.View>
            ) : null
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about rates, routes, HTS codes…"
          placeholderTextColor={Colors.textFaint}
          multiline
          editable={!busy}
        />
        <PressableScale
          style={{ ...styles.sendBtn, opacity: input.trim() && !busy ? 1 : 0.4 }}
          onPress={() => send(input)}
          disabled={!input.trim() || busy}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 14.5,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  suggestions: { marginTop: 28, gap: 10 },
  suggestion: {
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  suggestionText: { color: Colors.text, fontSize: 14.5 },
  list: { padding: 16, gap: 10 },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 11,
    maxWidth: '86%',
  },
  userBubble: {
    backgroundColor: Colors.accentDark,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  thinking: { color: Colors.textMuted, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
