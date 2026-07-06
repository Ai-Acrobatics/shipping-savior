import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { api } from '@/lib/api';
import {
  calculateLandedCost,
  formatCurrency,
  type MobileLandedCostResult,
} from '@/lib/landed-cost';
import { Colors } from '@/constants/colors';
import { Button, Field } from '@/components/ui';

export default function CalculatorsScreen() {
  const [fob, setFob] = useState('12.50');
  const [units, setUnits] = useState('5000');
  const [dutyRate, setDutyRate] = useState('7.5');
  const [freight, setFreight] = useState('4200');
  const [insurance, setInsurance] = useState('0.3');
  const [broker, setBroker] = useState('150');
  const [drayage, setDrayage] = useState('650');
  const [warehousing, setWarehousing] = useState('0');
  const [fulfillment, setFulfillment] = useState('0');
  const [result, setResult] = useState<MobileLandedCostResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const num = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;

  const run = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
          inputs: {
            unitCostFOB: num(fob),
            totalUnits: num(units),
            dutyRatePct: num(dutyRate),
            freightCostTotal: num(freight),
            insuranceRatePct: num(insurance),
            customsBrokerFee: num(broker),
            drayageCost: num(drayage),
            warehousingPerUnit: num(warehousing),
            fulfillmentPerUnit: num(fulfillment),
          },
          outputs: {
            totalLandedCost: result.totalLandedCost,
            landedCostPerUnit: result.landedCostPerUnit,
            effectiveMarkupPct: result.effectiveMarkupPct,
            lines: result.lines,
          },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.springify().damping(18)}>
        <Text style={styles.heading}>Landed cost</Text>
        <Text style={styles.sub}>
          FOB + freight + insurance + duty + MPF/HMF + broker + drayage — the
          true per-unit cost of an import.
        </Text>
      </Animated.View>

      <View style={styles.form}>
        <View style={styles.half}>
          <Field label="FOB unit cost" value={fob} onChangeText={setFob} keyboardType="decimal-pad" suffix="USD" />
        </View>
        <View style={styles.half}>
          <Field label="Total units" value={units} onChangeText={setUnits} keyboardType="number-pad" />
        </View>
        <View style={styles.half}>
          <Field label="Duty rate" value={dutyRate} onChangeText={setDutyRate} keyboardType="decimal-pad" suffix="%" />
        </View>
        <View style={styles.half}>
          <Field label="Ocean freight (total)" value={freight} onChangeText={setFreight} keyboardType="decimal-pad" suffix="USD" />
        </View>
        <View style={styles.half}>
          <Field label="Insurance rate" value={insurance} onChangeText={setInsurance} keyboardType="decimal-pad" suffix="%" />
        </View>
        <View style={styles.half}>
          <Field label="Customs broker" value={broker} onChangeText={setBroker} keyboardType="decimal-pad" suffix="USD" />
        </View>
        <View style={styles.half}>
          <Field label="Drayage" value={drayage} onChangeText={setDrayage} keyboardType="decimal-pad" suffix="USD" />
        </View>
        <View style={styles.half}>
          <Field label="Warehousing / unit" value={warehousing} onChangeText={setWarehousing} keyboardType="decimal-pad" suffix="USD" />
        </View>
      </View>

      <Button title="Calculate" onPress={run} />

      {result && (
        <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.resultCard}>
          <Text style={styles.perUnit}>{formatCurrency(result.landedCostPerUnit)}</Text>
          <Text style={styles.perUnitLabel}>
            landed cost per unit · {result.effectiveMarkupPct.toFixed(1)}% over FOB
          </Text>
          <View style={styles.divider} />
          {result.lines.map((line, i) => (
            <Animated.View
              key={line.label}
              entering={FadeInDown.delay(i * 40).springify().damping(18)}
              style={styles.lineRow}
            >
              <Text style={styles.lineLabel}>{line.label}</Text>
              <Text style={styles.lineValue}>{formatCurrency(line.total, 0)}</Text>
            </Animated.View>
          ))}
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text style={[styles.lineLabel, { fontWeight: '800', color: Colors.text }]}>
              Total landed cost
            </Text>
            <Text style={[styles.lineValue, { color: Colors.accent }]}>
              {formatCurrency(result.totalLandedCost, 0)}
            </Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <Button title="Save calculation" variant="secondary" onPress={save} loading={saving} />
          </View>
          {savedMsg ? <Text style={styles.savedMsg}>{savedMsg}</Text> : null}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 48 },
  heading: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: Colors.textMuted, fontSize: 14, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  form: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12 },
  half: { flexBasis: '47%', flexGrow: 1 },
  resultCard: {
    marginTop: 18,
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },
  perUnit: { color: Colors.text, fontSize: 34, fontWeight: '900', textAlign: 'center' },
  perUnitLabel: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  lineLabel: { color: Colors.textMuted, fontSize: 14 },
  lineValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  savedMsg: { color: Colors.success, fontSize: 13, textAlign: 'center', marginTop: 10 },
});
