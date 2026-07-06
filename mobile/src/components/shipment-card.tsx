import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';
import { listEnter } from '@/lib/motion';
import type { Shipment } from '@/lib/types';
import { PressableScale } from './pressable-scale';
import { StatusBadge, cardStyle } from './ui';

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86_400_000);
}

export function ShipmentCard({ shipment, index }: { shipment: Shipment; index: number }) {
  const c = useTheme();
  const etd = fmtDate(shipment.etd);
  const eta = fmtDate(shipment.eta);
  const etaDays = daysUntil(shipment.eta);
  const title =
    shipment.containerNumber ?? shipment.reference ?? shipment.vesselName ?? 'Shipment';

  return (
    <Animated.View entering={listEnter(index)}>
      <PressableScale
        style={{ ...cardStyle(c), padding: 15, marginBottom: 11 }}
        onPress={() => router.push({ pathname: '/shipment/[id]', params: { id: shipment.id } })}
      >
        {/* Header: container + status */}
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          <StatusBadge status={shipment.status} small />
        </View>

        {/* Route: POL → POD with a connector */}
        {(shipment.pol || shipment.pod) && (
          <View style={styles.routeRow}>
            <View style={styles.routeEnd}>
              <Text style={[styles.port, { color: c.text }]} numberOfLines={1}>
                {shipment.pol ?? '—'}
              </Text>
              <Text style={[styles.portLabel, { color: c.textFaint }]}>Origin</Text>
            </View>
            <View style={styles.connector}>
              <View style={[styles.line, { backgroundColor: c.border }]} />
              <Ionicons name="boat" size={13} color={c.accent} />
              <View style={[styles.line, { backgroundColor: c.border }]} />
            </View>
            <View style={[styles.routeEnd, { alignItems: 'flex-end' }]}>
              <Text style={[styles.port, { color: c.text, textAlign: 'right' }]} numberOfLines={1}>
                {shipment.pod ?? '—'}
              </Text>
              <Text style={[styles.portLabel, { color: c.textFaint }]}>Destination</Text>
            </View>
          </View>
        )}

        {/* Meta: vessel/carrier + ETA emphasis */}
        <View style={[styles.metaRow, { borderTopColor: c.border }]}>
          <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
            {shipment.vesselName
              ? `${shipment.vesselName}${shipment.voyageNumber ? ` · ${shipment.voyageNumber}` : ''}`
              : shipment.carrier ?? '—'}
          </Text>
          {eta ? (
            <View style={styles.etaWrap}>
              <Text style={[styles.etaLabel, { color: c.textFaint }]}>ETA</Text>
              <Text style={[styles.etaVal, { color: c.text }]}>{eta}</Text>
              {typeof etaDays === 'number' && etaDays >= 0 && etaDays <= 60 ? (
                <Text style={[styles.etaDays, { color: c.accent }]}>· {etaDays}d</Text>
              ) : null}
            </View>
          ) : etd ? (
            <Text style={[styles.meta, { color: c.textMuted }]}>ETD {etd}</Text>
          ) : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 15.5, fontWeight: '700', flexShrink: 1, letterSpacing: 0.2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13, gap: 10 },
  routeEnd: { flex: 1 },
  port: { fontSize: 14.5, fontWeight: '600' },
  portLabel: { fontSize: 10.5, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  connector: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 62, justifyContent: 'center' },
  line: { height: StyleSheet.hairlineWidth, flex: 1 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  meta: { fontSize: 12.5, flexShrink: 1 },
  etaWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  etaLabel: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5 },
  etaVal: { fontSize: 13, fontWeight: '700' },
  etaDays: { fontSize: 12, fontWeight: '700' },
});
