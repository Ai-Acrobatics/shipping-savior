import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import type { Shipment, ShipmentsResponse } from '@/lib/types';
import { useTheme, statusLabel } from '@/lib/theme';
import { ShipmentCard } from '@/components/shipment-card';
import { EmptyState } from '@/components/ui';
import { PressableScale } from '@/components/pressable-scale';

const FILTERS = ['all', 'in_transit', 'planned', 'arrived', 'delivered', 'delayed'] as const;
const PAGE_SIZE = 50;

export default function ShipmentsScreen() {
  const c = useTheme();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (offset = 0) => {
      const params = new URLSearchParams({ limit: `${PAGE_SIZE}`, offset: `${offset}` });
      if (filter !== 'all') params.set('status', filter);
      const res = await api<ShipmentsResponse>(`/api/shipments?${params}`);
      setTotal(res.total);
      setShipments((prev) => (offset === 0 ? res.shipments : [...prev, ...res.shipments]));
    },
    [filter]
  );

  useEffect(() => {
    setError(null);
    load(0).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.selectionAsync().catch(() => {});
    try {
      await load(0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || shipments.length >= total) return;
    setLoadingMore(true);
    try {
      await load(shipments.length);
    } catch {
      /* keep what we have */
    } finally {
      setLoadingMore(false);
    }
  }, [load, loadingMore, shipments.length, total]);

  const inTransit = useMemo(
    () => shipments.filter((s) => s.status === 'in_transit').length,
    [shipments]
  );

  const header = useMemo(
    () => (
      <View>
        {/* Summary strip */}
        <View style={styles.summary}>
          <Text style={[styles.summaryBig, { color: c.text }]}>{total}</Text>
          <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
            {total === 1 ? 'shipment' : 'shipments'}
            {inTransit > 0 ? `  ·  ${inTransit} in transit` : ''}
          </Text>
        </View>
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <PressableScale
                key={f}
                style={{
                  ...styles.chip,
                  backgroundColor: active ? c.accent : c.bgElevated,
                  borderColor: active ? c.accent : c.border,
                }}
                onPress={() => setFilter(f)}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? c.accentText : c.textMuted }}>
                  {f === 'all' ? 'All' : statusLabel(f)}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
    ),
    [filter, total, inTransit, c]
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {error ? (
        <EmptyState title="Couldn't load shipments" subtitle={error} />
      ) : (
        <FlatList
          data={shipments}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => <ShipmentCard shipment={item} index={index} />}
          ListHeaderComponent={header}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            !refreshing ? (
              <EmptyState
                title="No shipments yet"
                subtitle="Scan a BOL from the Scan tab or import your weekly workbook on the web."
              />
            ) : null
          }
          ListFooterComponent={
            shipments.length > 0 ? (
              <Text style={{ color: c.textFaint, textAlign: 'center', paddingVertical: 16, fontSize: 12.5 }}>
                {shipments.length} of {total}
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: 2, paddingTop: 4, paddingBottom: 12 },
  summaryBig: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 14, fontWeight: '500' },
  filters: { gap: 8, paddingBottom: 14, paddingRight: 8 },
  chip: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});
