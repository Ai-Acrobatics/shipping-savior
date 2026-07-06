import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import type { Shipment, ShipmentsResponse } from '@/lib/types';
import { Colors, statusLabel } from '@/constants/colors';
import { ShipmentCard } from '@/components/shipment-card';
import { EmptyState } from '@/components/ui';
import { PressableScale } from '@/components/pressable-scale';

const FILTERS = ['all', 'in_transit', 'planned', 'arrived', 'delivered', 'delayed'] as const;
const PAGE_SIZE = 50;

export default function ShipmentsScreen() {
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      // keep what we have
    } finally {
      setLoadingMore(false);
    }
  }, [load, loadingMore, shipments.length, total]);

  const header = useMemo(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <PressableScale
            key={f}
            style={{
              ...styles.chip,
              backgroundColor: filter === f ? Colors.accent : Colors.bgElevated,
              borderColor: filter === f ? Colors.accent : Colors.border,
            }}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === f ? '#fff' : Colors.textMuted },
              ]}
            >
              {f === 'all' ? 'All' : statusLabel(f)}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
    ),
    [filter]
  );

  return (
    <View style={styles.container}>
      {header}
      {error ? (
        <EmptyState title="Couldn't load shipments" subtitle={error} />
      ) : (
        <FlatList
          data={shipments}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => <ShipmentCard shipment={item} index={index} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
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
              <Text style={styles.footer}>
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
  container: { flex: 1, backgroundColor: Colors.bg },
  filters: { flexGrow: 0 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  list: { padding: 16, paddingTop: 6 },
  footer: {
    color: Colors.textFaint,
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
});
