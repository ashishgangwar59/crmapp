import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { lightColors } from '../theme/colors';

type Palette = typeof lightColors;

const GOLD = '#C9972F';

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const todayStr = () => fmtDate(new Date());
const nextYearStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return fmtDate(d); };

const parseDate = (str: string) => {
  const p = str.split('-');
  if (p.length === 3) return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  return new Date();
};

function amountInWords(num: number) {
  if (num === 0) return 'Zero Rupees';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const under1000 = (n: number) => {
    let s = '';
    if (n >= 100) { s += a[Math.floor(n / 100)] + 'Hundred '; n %= 100; }
    if (n > 0) {
      if (s !== '') s += 'and ';
      s += n < 20 ? a[n] : b[Math.floor(n / 10)] + ' ' + a[n % 10];
    }
    return s;
  };
  let r = '';
  let t = num;
  const crore = Math.floor(t / 10000000); t %= 10000000;
  if (crore > 0) r += under1000(crore) + 'Crore ';
  const lakh = Math.floor(t / 100000); t %= 100000;
  if (lakh > 0) r += under1000(lakh) + 'Lakh ';
  const th = Math.floor(t / 1000); t %= 1000;
  if (th > 0) r += under1000(th) + 'Thousand ';
  if (t > 0) r += under1000(t);
  return r.trim() + ' Rupees';
}

export function InterestCalculator({ c }: { c: Palette }) {
  const [principal, setPrincipal] = useState('25000');
  const [type, setType] = useState<'rupees' | 'percentage'>('rupees');
  const [rate, setRate] = useState('16');
  const [showEq, setShowEq] = useState(true);
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(nextYearStr());
  const [showResults, setShowResults] = useState(true);

  const s = makeStyles(c);

  const d1 = parseDate(fromDate);
  const d2 = parseDate(toDate);
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();
  if (days < 0) { months--; days += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  years = Math.max(0, years); months = Math.max(0, months); days = Math.max(0, days);

  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  let totalInterest = 0;
  let monthly = 0;
  if (type === 'rupees') {
    // ₹R per ₹100 per month = R% per month
    const totalMonths = years * 12 + months + days / 30.4375;
    monthly = p * (r / 100);
    totalInterest = Math.round(monthly * totalMonths);
  } else {
    const totalYears = years + months / 12 + days / 365;
    monthly = (p * (r / 100)) / 12;
    totalInterest = Math.round(p * (r / 100) * totalYears);
  }
  const totalAmount = p + totalInterest;
  const daysBetween = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  const daily = totalInterest / daysBetween;

  return (
    <View>
      <View style={s.card}>
        <Text style={s.label}>PRINCIPAL AMOUNT (₹)</Text>
        <TextInput
          style={s.input}
          value={principal}
          onChangeText={(t) => setPrincipal(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="25000"
          placeholderTextColor={c.textMuted}
        />
        <Text style={s.words}>{amountInWords(p)}</Text>

        <Text style={s.label}>INTEREST TYPE</Text>
        <View style={s.segment}>
          {(['rupees', 'percentage'] as const).map((k) => (
            <TouchableOpacity key={k} style={[s.segmentItem, type === k && s.segmentActive]} onPress={() => setType(k)}>
              <Text style={[s.segmentText, type === k && s.segmentTextActive]}>{k === 'rupees' ? '₹ Rupees' : '% Percentage'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>{type === 'rupees' ? 'RATE (₹ per ₹100 / month)' : 'RATE (% per annum)'}</Text>
        <TextInput
          style={s.input}
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          placeholder={type === 'rupees' ? '16' : '11.5'}
          placeholderTextColor={c.textMuted}
        />

        <View style={s.row}>
          <Text style={s.rowLabel}>Show equivalent</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowEq(!showEq)}
            style={[s.toggle, { backgroundColor: showEq ? c.success : c.border, alignItems: showEq ? 'flex-end' : 'flex-start' }]}
          >
            <View style={s.knob} />
          </TouchableOpacity>
        </View>
        {showEq && (
          <Text style={s.eq}>
            {type === 'rupees'
              ? `Equivalent: ${(r * 12).toFixed(2)}% per annum`
              : `Equivalent: ₹${(r / 12).toFixed(2)} per ₹100 / month`}
          </Text>
        )}

        <Text style={s.label}>DURATION</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {[
            { l: 'From', v: fromDate, set: setFromDate },
            { l: 'To', v: toDate, set: setToDate },
          ].map((f) => (
            <View key={f.l} style={{ flex: 1 }}>
              <Text style={s.small}>{f.l}</Text>
              <View style={[s.input, { flexDirection: 'row', alignItems: 'center' }]}>
                <TextInput
                  style={{ flex: 1, color: c.text, fontSize: 14, fontWeight: '600', padding: 0 }}
                  value={f.v}
                  onChangeText={f.set}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={c.textMuted}
                />
                <Calendar size={14} color={c.textMuted} />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={() => setShowResults(true)}>
          <Text style={s.primaryBtnText}>Calculate Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 8 }}
          onPress={() => {
            setPrincipal('25000'); setRate('16'); setFromDate(todayStr()); setToDate(nextYearStr()); setShowResults(false);
          }}
        >
          <Text style={{ fontSize: 13, color: c.textMuted }}>Reset</Text>
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.resultsTitle}>Results</Text>
          <View style={s.resultRow}>
            <Stat c={c} label="Duration" value={`${years}y ${months}m ${days}d`} />
            <Stat c={c} label="Rate" value={type === 'rupees' ? `₹${r} /100/mo` : `${r.toFixed(2)}% /yr`} right />
          </View>
          <View style={s.resultRow}>
            <Stat c={c} label="Principal" value={`₹${p.toLocaleString('en-IN')}`} />
            <Stat c={c} label="Monthly interest" value={`₹${Math.round(monthly).toLocaleString('en-IN')}`} right />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <View style={[s.tile, { backgroundColor: 'rgba(201,151,47,0.10)' }]}>
              <Text style={[s.tileLabel, { color: GOLD }]}>INTEREST</Text>
              <Text style={[s.tileValue, { color: GOLD }]}>₹{totalInterest.toLocaleString('en-IN')}</Text>
              <Text style={s.small}>Daily ₹{daily.toFixed(2)}</Text>
            </View>
            <View style={[s.tile, { backgroundColor: 'rgba(16,185,129,0.10)' }]}>
              <Text style={[s.tileLabel, { color: c.success }]}>TOTAL</Text>
              <Text style={[s.tileValue, { color: c.success }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              <Text style={s.small}>Principal + interest</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function Stat({ c, label, value, right }: { c: Palette; label: string; value: string; right?: boolean }) {
  return (
    <View style={{ alignItems: right ? 'flex-end' : 'flex-start' }}>
      <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 15, color: c.text, fontWeight: '700', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16 },
    label: { fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 0.6, marginBottom: 8 },
    input: {
      backgroundColor: c.surfaceLight, borderRadius: 10, borderWidth: 1, borderColor: c.border,
      paddingHorizontal: 12, paddingVertical: 10, color: c.text, fontSize: 15, fontWeight: '600', marginBottom: 14,
    },
    words: { fontSize: 12, fontStyle: 'italic', color: GOLD, marginTop: -8, marginBottom: 16 },
    segment: { flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 10, padding: 3, marginBottom: 16 },
    segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
    segmentActive: { backgroundColor: c.accent },
    segmentText: { fontSize: 13, fontWeight: '600', color: c.textMuted },
    segmentTextActive: { color: '#fff' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    rowLabel: { fontSize: 14, fontWeight: '600', color: c.text },
    toggle: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
    knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    eq: { fontSize: 12, fontWeight: '700', color: GOLD, marginBottom: 16 },
    small: { fontSize: 11, color: c.textMuted, marginBottom: 4 },
    primaryBtn: { backgroundColor: c.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    resultsTitle: { fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 14 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    tile: { flex: 1, borderRadius: 12, padding: 12 },
    tileLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
    tileValue: { fontSize: 18, fontWeight: '800', marginVertical: 4 },
  });
