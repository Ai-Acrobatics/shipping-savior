import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { api } from '@/lib/api';
import type { Shipment } from '@/lib/types';
import { useTheme } from '@/lib/theme';
import { enter, fade } from '@/lib/motion';
import { EmptyState, Row, StatusBadge, cardStyle } from '@/components/ui';

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

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
  const c = useTheme();
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator color={c.accent} size="large" />
      </View>
    );
  }

  const meta = (shipment.importMeta ?? {}) as Record<string, unknown>;
  const metaRows = META_FIELDS.map(({ key, label }) => {
    const v = meta[key];
    return v !== undefined && v !== null && `${v}`.trim() !== '' ? { label, value: `${v}` } : null;
  }).filter(Boolean) as Array<{ label: string; value: string }>;

  const section = (color: string) => ({ color, fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 } as const);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <Animated.View entering={enter} style={{ ...cardStyle(c), padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', flexShrink: 1 }}>
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
        <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 16 }}>
          <Text style={section(c.textMuted)}>Reefer / Export details</Text>
          {metaRows.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} />
          ))}
        </Animated.View>
      )}

      <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 16 }}>
        <Text style={section(c.textMuted)}>Parties & cargo</Text>
        <Row label="Shipper" value={shipment.shipper} />
        <Row label="Consignee" value={shipment.consignee} />
        <Row label="Notify party" value={shipment.notifyParty} />
        <Row label="Goods" value={shipment.goodsDescription} />
        <Row label="Weight" value={shipment.weightKg ? `${shipment.weightKg.toLocaleString()} kg` : null} />
        <Row label="Quantity" value={shipment.quantity ? `${shipment.quantity.toLocaleString()}` : null} />
        <Row label="Source" value={shipment.source.replace(/_/g, ' ')} />
        {shipment.bolFileName ? <Row label="BOL file" value={shipment.bolFileName} /> : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 },
});
