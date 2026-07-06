import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { api, apiUpload } from '@/lib/api';
import type { BolResponse, Shipment } from '@/lib/types';
import { useTheme } from '@/lib/theme';
import { enter, fade, listEnter } from '@/lib/motion';
import { Button, cardStyle } from '@/components/ui';
import { ConfidenceBar } from '@/components/confidence-bar';
import { PressableScale } from '@/components/pressable-scale';

const FIELD_LABELS: Array<{ key: keyof NonNullable<BolResponse['extracted']>; label: string }> = [
  { key: 'container_numbers', label: 'Containers' },
  { key: 'vessel_name', label: 'Vessel' },
  { key: 'voyage_number', label: 'Voyage' },
  { key: 'port_of_loading', label: 'POL' },
  { key: 'port_of_discharge', label: 'POD' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'shipper', label: 'Shipper' },
  { key: 'consignee', label: 'Consignee' },
  { key: 'goods_description', label: 'Goods' },
  { key: 'weight_kg', label: 'Weight (kg)' },
  { key: 'quantity', label: 'Quantity' },
];

const STEPS = ['Uploading document', 'Reading with AI', 'Structuring fields'];

// Icon-forward capture button.
function CaptureButton({
  icon,
  label,
  sub,
  primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  primary?: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <PressableScale
      style={{
        ...cardStyle(c),
        flex: 1,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        backgroundColor: primary ? c.accent : c.card,
        borderColor: primary ? c.accent : c.border,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primary ? 'rgba(255,255,255,0.18)' : c.accentSoft,
        }}
      >
        <Ionicons name={icon} size={23} color={primary ? c.accentText : c.accent} />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: primary ? c.accentText : c.text }}>{label}</Text>
      <Text
        style={{ fontSize: 11.5, textAlign: 'center', color: primary ? 'rgba(255,255,255,0.8)' : c.textFaint }}
      >
        {sub}
      </Text>
    </PressableScale>
  );
}

export default function ScanScreen() {
  const c = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [step, setStep] = useState<number>(-1); // -1 idle, 0..2 processing, 3 done
  const [result, setResult] = useState<BolResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSteps = () => {
    setStep(0);
    stepTimer.current = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1400);
  };
  const stopSteps = () => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  };

  const pick = async (source: 'camera' | 'library') => {
    setError(null);
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
    const res =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.[0]) return;

    const asset = res.assets[0];
    setImageUri(asset.uri);
    setResult(null);
    runSteps();
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'bol.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const data = await apiUpload<BolResponse>('/api/bol', formData);
      stopSteps();
      if (data.error && !data.extracted) {
        setError(data.error);
        setStep(-1);
      } else {
        setResult(data);
        setStep(3);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      stopSteps();
      setStep(-1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(e instanceof Error ? e.message : 'Extraction failed');
    }
  };

  const saveShipment = async () => {
    if (!result?.extracted) return;
    const x = result.extracted;
    setSaving(true);
    try {
      const res = await api<{ shipment: Shipment }>('/api/shipments', {
        method: 'POST',
        body: {
          containerNumber: x.container_numbers?.[0] ?? null,
          vesselName: x.vessel_name,
          voyageNumber: x.voyage_number,
          pol: x.port_of_loading,
          pod: x.port_of_discharge,
          etd: x.etd,
          eta: x.eta,
          carrier: x.carrier,
          shipper: x.shipper,
          consignee: x.consignee,
          notifyParty: x.notify_party,
          goodsDescription: x.goods_description,
          weightKg: x.weight_kg,
          quantity: x.quantity,
          source: 'bol_ocr',
          bolDocumentId: result.bolDocumentId ?? undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setResult(null);
      setImageUri(null);
      setStep(-1);
      router.push({ pathname: '/shipment/[id]', params: { id: res.shipment.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save shipment');
    } finally {
      setSaving(false);
    }
  };

  const processing = step >= 0 && step < 3;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Animated.View entering={enter}>
        <Text style={{ color: c.text, fontSize: 23, fontWeight: '800', letterSpacing: 0.2 }}>Scan a Bill of Lading</Text>
        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
          Capture a BOL and the AI extracts containers, vessel, ports, dates and parties — then saves it to your board.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <CaptureButton icon="camera" label="Take photo" sub="Snap the BOL at the terminal" primary onPress={() => pick('camera')} />
          <CaptureButton icon="images" label="From library" sub="Pick an existing scan" onPress={() => pick('library')} />
        </View>
      </Animated.View>

      {imageUri && (
        <Animated.View entering={fade} style={{ marginTop: 18, borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, backgroundColor: c.bgElevated }} resizeMode="cover" />
        </Animated.View>
      )}

      {/* Stepped processing — shows what the AI is doing */}
      {processing && (
        <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 16, marginTop: 14 }}>
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <View key={label} style={styles.stepRow}>
                <View style={{ width: 22, alignItems: 'center' }}>
                  {done ? (
                    <Ionicons name="checkmark-circle" size={19} color={c.success} />
                  ) : active ? (
                    <ActivityIndicator size="small" color={c.accent} />
                  ) : (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.border }} />
                  )}
                </View>
                <Text style={{ color: done ? c.textMuted : active ? c.text : c.textFaint, fontSize: 14.5, fontWeight: active ? '700' : '500' }}>
                  {label}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      )}

      {error && <Text style={{ color: c.danger, marginTop: 14, fontSize: 14 }}>{error}</Text>}

      {result?.extracted && step === 3 && (
        <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 16, marginTop: 16 }}>
          <View style={styles.resultHeader}>
            <Text style={{ color: c.text, fontSize: 16, fontWeight: '800' }}>Extracted fields</Text>
            {result.provider ? <Text style={{ color: c.textFaint, fontSize: 12 }}>{result.provider}</Text> : null}
          </View>
          {FIELD_LABELS.map(({ key, label }, i) => {
            const raw = result.extracted?.[key];
            if (raw === null || raw === undefined) return null;
            const value = Array.isArray(raw) ? raw.join(', ') : `${raw}`;
            const confidence = result.confidence?.[key] ?? 0;
            return (
              <Animated.View key={key} entering={listEnter(i)} style={{ paddingVertical: 8, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 14 }}>
                  <Text style={{ color: c.textMuted, fontSize: 13.5 }}>{label}</Text>
                  <Text style={{ color: c.text, fontSize: 13.5, fontWeight: '600', flexShrink: 1, textAlign: 'right' }} numberOfLines={2}>
                    {value}
                  </Text>
                </View>
                <ConfidenceBar value={confidence} />
              </Animated.View>
            );
          })}
          <View style={{ marginTop: 16 }}>
            <Button title="Save as shipment" onPress={saveShipment} loading={saving} icon={<Ionicons name="add-circle-outline" size={18} color={c.accentText} />} />
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
});
