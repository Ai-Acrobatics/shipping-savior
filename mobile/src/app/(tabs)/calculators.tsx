import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { api } from '@/lib/api';
import { calculateLandedCost, formatCurrency, type MobileLandedCostResult } from '@/lib/landed-cost';
import { useTheme } from '@/lib/theme';
import { enter, fade, listEnter } from '@/lib/motion';
import { Button, Field, cardStyle } from '@/components/ui';

export default function CalculatorsScreen() {
  const c = useTheme();
  const [fob, setFob] = useState('12.50');
  const [units, setUnits] = useState('5000');
  const [dutyRate, setDutyRate] = useState('7.5');
  const [freight, setFreight] = useState('4200');
  const [insurance, setInsurance] = useState('0.3');
  const [broker, setBroker] = useState('150');
  const [drayage, setDrayage] = useState('650');
  const [warehousing, setWarehousing] = useState('0');
  const [fulfillment] = useState('0');
  const [result, setResult] = useState<MobileLandedCostResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const num = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;

  const run = () => {
    Haptics.selectionAsync().catch(() => {});
    setSavedMsg(null);
    setResult(
      calculateLandedCost({
        unitCostFOB: num(fob),
        totalUnits: num(units),
        dutyRatePct: num(dutyRate),
        freightCostTotal: num(freight),
        insuranceRatePct: num(insurance),
        customsBrokerFee: num(broker),
        drayageCost: num(drayage),
        warehousingPerUnit: num(warehousing),
        fulfillmentPerUnit: num(fulfillment),
      })
    );
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await api('/api/calculations', {
        method: 'POST',
        body: {
          calculatorType: 'landed_cost',
          name: `Mobile · ${num(units).toLocaleString()} units @ ${formatCurrency(num(fob))}`,
          inputs: { unitCostFOB: num(fob), totalUnits: num(units), dutyRatePct: num(dutyRate), freightCostTotal: num(freight), insuranceRatePct: num(insurance), customsBrokerFee: num(broker), drayageCost: num(drayage), warehousingPerUnit: num(warehousing) },
          outputs: { totalLandedCost: result.totalLandedCost, landedCostPerUnit: result.landedCostPerUnit, effectiveMarkupPct: result.effectiveMarkupPct, lines: result.lines },
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSavedMsg('Saved — view it under Calculators on the web.');
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Animated.View entering={enter}>
        <Text style={{ color: c.text, fontSize: 23, fontWeight: '800', letterSpacing: 0.2 }}>Landed cost</Text>
        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 6, marginBottom: 18, lineHeight: 20 }}>
          FOB + freight + insurance + duty + MPF/HMF + broker + drayage — the true per-unit cost of an import.
        </Text>
      </Animated.View>

      <View style={styles.form}>
        <View style={styles.half}><Field label="FOB unit cost" value={fob} onChangeText={setFob} keyboardType="decimal-pad" suffix="USD" /></View>
        <View style={styles.half}><Field label="Total units" value={units} onChangeText={setUnits} keyboardType="number-pad" /></View>
        <View style={styles.half}><Field label="Duty rate" value={dutyRate} onChangeText={setDutyRate} keyboardType="decimal-pad" suffix="%" /></View>
        <View style={styles.half}><Field label="Ocean freight (total)" value={freight} onChangeText={setFreight} keyboardType="decimal-pad" suffix="USD" /></View>
        <View style={styles.half}><Field label="Insurance rate" value={insurance} onChangeText={setInsurance} keyboardType="decimal-pad" suffix="%" /></View>
        <View style={styles.half}><Field label="Customs broker" value={broker} onChangeText={setBroker} keyboardType="decimal-pad" suffix="USD" /></View>
        <View style={styles.half}><Field label="Drayage" value={drayage} onChangeText={setDrayage} keyboardType="decimal-pad" suffix="USD" /></View>
        <View style={styles.half}><Field label="Warehousing / unit" value={warehousing} onChangeText={setWarehousing} keyboardType="decimal-pad" suffix="USD" /></View>
      </View>

      <Button title="Calculate" onPress={run} />

      {result && (
        <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 18, marginTop: 18 }}>
          <Text style={{ color: c.text, fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 }}>
            {formatCurrency(result.landedCostPerUnit)}
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            landed cost per unit · {result.effectiveMarkupPct.toFixed(1)}% over FOB
          </Text>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 14 }} />
          {result.lines.map((line, i) => (
            <Animated.View key={line.label} entering={listEnter(i)} style={styles.lineRow}>
              <Text style={{ color: c.textMuted, fontSize: 14 }}>{line.label}</Text>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>{formatCurrency(line.total, 0)}</Text>
            </Animated.View>
          ))}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 12 }} />
          <View style={styles.lineRow}>
            <Text style={{ color: c.text, fontSize: 14, fontWeight: '800' }}>Total landed cost</Text>
            <Text style={{ color: c.accent, fontSize: 14, fontWeight: '800' }}>{formatCurrency(result.totalLandedCost, 0)}</Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <Button title="Save calculation" variant="secondary" onPress={save} loading={saving} />
          </View>
          {savedMsg ? <Text style={{ color: c.success, fontSize: 13, textAlign: 'center', marginTop: 10 }}>{savedMsg}</Text> : null}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12 },
  half: { flexBasis: '47%', flexGrow: 1 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
});
