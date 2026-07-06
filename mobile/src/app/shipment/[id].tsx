import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '@/lib/api';
import type { Shipment } from '@/lib/types';
import { Colors } from '@/constants/colors';
import { EmptyState, Row, StatusBadge } from '@/components/ui';

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Reefer-export workbook fields live in importMeta (jsonb) — surface the ones
// a field operator needs at the port.
const META_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'week', label: 'Week' },
  { key: 'customerCode', label: 'Customer' },
  { key: 'typeOfService', label: 'Service' },
  { key: 'temperature', label: 'Temp / vents' },
  { key: 'crossdockAppointment', label: 'Cross-dock appt' },
  { key: 'reeferCutoff', label: 'Reefer cutoff' },
  { key: 'documentCutoff', label: 'Doc cutoff' },
  { key: 'puNumber', label: 'PU #' },
  { key: 'poNumber', label: 'PO #' },
  { key: 'aesNumber', label: 'AES #' },
  { key: 'sealNumber', label: 'Seal #' },
];

export default function ShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ shipment: Shipment }>(`/api/shipments/${id}`)
      .then((res) => setShipment(res.shipment))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [id]);

  if (error) return <EmptyState title="Couldn't load shipment" subtitle={error} />;
  if (!shipment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const meta = (shipment.importMeta ?? {}) as Record<string, unknown>;
  const metaRows = META_FIELDS.map(({ key, label }) => {
    const v = meta[key];
    return v !== undefined && v !== null && `${v}`.trim() !== ''
      ? { label, value: `${v}` }
      : null;
  }).filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            {shipment.containerNumber ?? shipment.reference ?? 'Shipment'}
          </Text>
          <StatusBadge status={shipment.status} />
        </View>
        <Row label="Vessel" value={shipment.vesselName} />
        <Row label="Voyage" value={shipment.voyageNumber} />
        <Row label="Carrier" value={shipment.carrier} />
        <Row label="Port of loading" value={shipment.pol} />
        <Row label="Port of discharge" value={shipment.pod} />
        <Row label="ETD" value={fmtDate(shipment.etd)} />
        <Row label="ETA" value={fmtDate(shipment.eta)} />
      </Animated.View>

      {metaRows.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(18)}
          style={styles.card}
        >
          <Text style={styles.sectionTitle}>Reefer / Export details</Text>
          {metaRows.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} />
          ))}
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInDown.delay(160).springify().damping(18)}
        style={styles.card}
      >
        <Text style={styles.sectionTitle}>Parties & cargo</Text>
        <Row label="Shipper" value={shipment.shipper} />
        <Row label="Consignee" value={shipment.consignee} />
        <Row label="Notify party" value={shipment.notifyParty} />
        <Row label="Goods" value={shipment.goodsDescription} />
        <Row
          label="Weight"
          value={shipment.weightKg ? `${shipment.weightKg.toLocaleString()} kg` : null}
        />
        <Row
          label="Quantity"
          value={shipment.quantity ? `${shipment.quantity.toLocaleString()}` : null}
        />
        <Row label="Source" value={shipment.source.replace(/_/g, ' ')} />
        {shipment.bolFileName ? <Row label="BOL file" value={shipment.bolFileName} /> : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '800', flexShrink: 1 },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
});
