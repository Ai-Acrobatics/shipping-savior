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
import Animated from 'react-native-reanimated';
import { API_URL } from '@/lib/config';
import { useTheme } from '@/lib/theme';
import { enter, fade } from '@/lib/motion';
import { PressableScale } from '@/components/pressable-scale';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
  if (text.includes('data:')) {
    const chunks: string[] = [];
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const evt = JSON.parse(trimmed.slice(5).trim()) as { type?: string; content?: string };
        if (evt.type === 'text' && evt.content) chunks.push(evt.content);
      } catch {
        /* skip */
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
  const c = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      Haptics.selectionAsync().catch(() => {});
      const next: ChatMessage[] = [...messages, { role: 'user', content }];
      setMessages(next);
      setInput('');
      setBusy(true);
      try {
        const reply = await askAssistant(next);
        setMessages([...next, { role: 'assistant', content: reply }]);
      } catch (e) {
        setMessages([
          ...next,
          { role: 'assistant', content: `⚠ ${e instanceof Error ? e.message : 'Something went wrong. Try again.'}` },
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
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {messages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Animated.View entering={enter} style={{ alignItems: 'center' }}>
            <View style={[styles.orb, { backgroundColor: c.accentSoft }]}>
              <Ionicons name="chatbubble-ellipses" size={26} color={c.accent} />
            </View>
            <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 14 }}>
              Logistics copilot
            </Text>
            <Text style={{ color: c.textMuted, fontSize: 14.5, textAlign: 'center', marginTop: 8, lineHeight: 21 }}>
              Duty rates, HTS codes, route comparisons, container specs, FTZ zones — ask anything about your freight.
            </Text>
          </Animated.View>
          <Animated.View entering={fade} style={{ marginTop: 26, gap: 10 }}>
            {SUGGESTIONS.map((s) => (
              <PressableScale
                key={s}
                style={{ backgroundColor: c.bgElevated, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 13, paddingHorizontal: 16, paddingVertical: 13 }}
                onPress={() => send(s)}
              >
                <Text style={{ color: c.text, fontSize: 14.5 }}>{s}</Text>
              </PressableScale>
            ))}
          </Animated.View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => `${i}`}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <Animated.View
              entering={fade}
              style={[
                styles.bubble,
                item.role === 'user'
                  ? { backgroundColor: c.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 }
                  : { backgroundColor: c.bgElevated, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
              ]}
            >
              <Text style={{ color: item.role === 'user' ? c.accentText : c.text, fontSize: 15, lineHeight: 22 }}>
                {item.content}
              </Text>
            </Animated.View>
          )}
          ListFooterComponent={
            busy ? (
              <Animated.View entering={fade} style={[styles.bubble, { backgroundColor: c.bgElevated, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'flex-start' }]}>
                <Text style={{ color: c.textMuted, fontStyle: 'italic' }}>Thinking…</Text>
              </Animated.View>
            ) : null
          }
        />
      )}

      <View style={[styles.inputBar, { borderTopColor: c.border, backgroundColor: c.bg }]}>
        <TextInput
          style={{ flex: 1, backgroundColor: c.bgElevated, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, color: c.text, fontSize: 15, maxHeight: 120 }}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about rates, routes, HTS codes…"
          placeholderTextColor={c.textFaint}
          multiline
          editable={!busy}
        />
        <PressableScale
          style={{ backgroundColor: c.accent, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', opacity: input.trim() && !busy ? 1 : 0.4 }}
          onPress={() => send(input)}
          disabled={!input.trim() || busy}
        >
          <Ionicons name="arrow-up" size={20} color={c.accentText} />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  orb: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: 16, paddingHorizontal: 15, paddingVertical: 11, maxWidth: '86%' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
