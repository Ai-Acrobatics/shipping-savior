import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import type { Shipment } from '@/lib/types';
import { PressableScale } from './pressable-scale';
import { StatusBadge } from './ui';

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ShipmentCard({ shipment, index }: { shipment: Shipment; index: number }) {
  const etd = fmtDate(shipment.etd);
  const eta = fmtDate(shipment.eta);
  const title =
    shipment.containerNumber ??
    shipment.reference ??
    shipment.vesselName ??
    'Shipment';

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 12) * 45).springify().damping(18)}>
      <PressableScale
        style={styles.card}
        onPress={() => router.push({ pathname: '/shipment/[id]', params: { id: shipment.id } })}
      >
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <StatusBadge status={shipment.status} />
        </View>
        {(shipment.pol || shipment.pod) && (
          <View style={styles.routeRow}>
            <Text style={styles.port} numberOfLines={1}>
              {shipment.pol ?? '—'}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.port, { textAlign: 'right' }]} numberOfLines={1}>
              {shipment.pod ?? '—'}
            </Text>
          </View>
        )}
        <View style={styles.metaRow}>
          {shipment.vesselName ? (
            <Text style={styles.meta} numberOfLines={1}>
              {shipment.vesselName}
              {shipment.voyageNumber ? ` · ${shipment.voyageNumber}` : ''}
            </Text>
          ) : (
            <Text style={styles.meta}>{shipment.carrier ?? ''}</Text>
          )}
          <Text style={styles.meta}>
            {etd ? `ETD ${etd}` : ''}
            {etd && eta ? '  ·  ' : ''}
            {eta ? `ETA ${eta}` : ''}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  port: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  arrow: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  meta: { color: Colors.textFaint, fontSize: 12.5, flexShrink: 1 },
});
