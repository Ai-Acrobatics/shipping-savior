import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { api, apiUpload } from '@/lib/api';
import type { BolResponse, Shipment } from '@/lib/types';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui';
import { ConfidenceBar } from '@/components/confidence-bar';

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

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BolResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
    setError(null);
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.8,
    };
    const res =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.[0]) return;

    const asset = res.assets[0];
    setImageUri(asset.uri);
    setResult(null);
    setProcessing(true);
    try {
      const formData = new FormData();
      // React Native FormData file part: {uri, name, type}.
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'bol.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const data = await apiUpload<BolResponse>('/api/bol', formData);
      if (data.error && !data.extracted) {
        setError(data.error);
      } else {
        setResult(data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(e instanceof Error ? e.message : 'Extraction failed');
    } finally {
      setProcessing(false);
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
      router.push({ pathname: '/shipment/[id]', params: { id: res.shipment.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save shipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.springify().damping(18)}>
        <Text style={styles.heading}>Snap a Bill of Lading</Text>
        <Text style={styles.sub}>
          AI extracts containers, vessel, ports, dates and parties — then saves it
          straight to your shipment board.
        </Text>
        <View style={styles.actions}>
          <View style={styles.actionBtn}>
            <Button title="📷  Camera" onPress={() => pick('camera')} />
          </View>
          <View style={styles.actionBtn}>
            <Button title="🖼  Library" variant="secondary" onPress={() => pick('library')} />
          </View>
        </View>
      </Animated.View>

      {imageUri && (
        <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color={Colors.accent} size="large" />
              <Text style={styles.processingText}>Extracting with AI…</Text>
            </View>
          )}
        </Animated.View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {result?.extracted && (
        <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Extracted fields</Text>
            {result.provider ? (
              <Text style={styles.provider}>{result.provider}</Text>
            ) : null}
          </View>
          {FIELD_LABELS.map(({ key, label }, i) => {
            const raw = result.extracted?.[key];
            if (raw === null || raw === undefined) return null;
            const value = Array.isArray(raw) ? raw.join(', ') : `${raw}`;
            const confidence = result.confidence?.[key] ?? 0;
            return (
              <Animated.View
                key={key}
                entering={FadeInDown.delay(i * 35).springify().damping(18)}
                style={styles.fieldRow}
              >
                <View style={styles.fieldTop}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <Text style={styles.fieldValue} numberOfLines={2}>
                    {value}
                  </Text>
                </View>
                <ConfidenceBar value={confidence} />
              </Animated.View>
            );
          })}
          <View style={{ marginTop: 16 }}>
            <Button title="Save as shipment" onPress={saveShipment} loading={saving} />
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 48 },
  heading: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: Colors.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1 },
  previewWrap: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: { width: '100%', height: 220, backgroundColor: Colors.bgElevated },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  processingText: { color: Colors.text, fontWeight: '600' },
  error: { color: Colors.danger, marginTop: 14, fontSize: 14 },
  resultCard: {
    marginTop: 18,
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  provider: { color: Colors.textFaint, fontSize: 12 },
  fieldRow: { paddingVertical: 8, gap: 6 },
  fieldTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  fieldLabel: { color: Colors.textMuted, fontSize: 13.5 },
  fieldValue: {
    color: Colors.text,
    fontSize: 13.5,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
