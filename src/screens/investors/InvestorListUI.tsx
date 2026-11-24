import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, Calendar, Check, ShieldCheck, FileText, Eye, Edit, Trash2, Mail, Phone, UserCheck,
} from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY, Avatar, StatusPill, SearchBox, inr } from '../../components/DashboardUI';

// ---------------- Filters (mirror CRM web: dashboard/investors/page.tsx) ----------------

export type InvestorStatusFilter = '' | 'Pending' | 'Verified' | 'Rejected' | 'DebentureForms';

export interface InvestorFilters {
  status: InvestorStatusFilter;
  maturity: string; // maturityStatus
  employeeId: string;
  employeeName: string;
  days: string; // today | yesterday | last7 | last30
  month: string; // YYYY-MM (created)
  date: string; // YYYY-MM-DD (created)
  fromDate: string;
  toDate: string;
  maturityMonth: string;
  maturityFrom: string;
  maturityTo: string;
  limit: number;
}

export const EMPTY_FILTERS: InvestorFilters = {
  status: '', maturity: '', employeeId: '', employeeName: '', days: '', month: '', date: '',
  fromDate: '', toDate: '', maturityMonth: '', maturityFrom: '', maturityTo: '', limit: 10,
};

export const STATUS_OPTIONS: { value: InvestorStatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'DebentureForms', label: 'Debenture forms' },
];

export const MATURITY_OPTIONS = [
  { value: '', label: 'All maturities' },
  { value: 'done', label: 'Maturity done' },
  { value: 'today', label: 'Maturing today' },
  { value: 'due_soon', label: 'Due in 7 days' },
  { value: 'due_30', label: 'Due in 30 days' },
  { value: 'due_90', label: 'Due in 90 days' },
  { value: 'this_month', label: 'Maturing this month' },
  { value: 'next_month', label: 'Maturing next month' },
  { value: 'upcoming', label: 'All upcoming' },
];

const DAYS_OPTIONS = [
  { value: '', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
];

export function buildInvestorQuery(search: string, f: InvestorFilters, page: number) {
  const p: string[] = [`search=${encodeURIComponent(search)}`];
  if (f.status) p.push(`status=${f.status}`);
  if (f.maturity) p.push(`maturityStatus=${f.maturity}`);
  if (f.maturityMonth) p.push(`maturityMonth=${f.maturityMonth}`);
  if (f.maturityFrom) p.push(`maturityFrom=${f.maturityFrom}`);
  if (f.maturityTo) p.push(`maturityTo=${f.maturityTo}`);
  if (f.employeeId) p.push(`referralEmployeeId=${encodeURIComponent(f.employeeId)}`);
  p.push(`date=${f.date}`, `month=${f.month}`, `days=${f.days}`, `fromDate=${f.fromDate}`, `toDate=${f.toDate}`);
  p.push(`page=${page}`, `limit=${f.limit}`);
  return `?${p.join('&')}`;
}

/** Number of filters applied inside the sheet (status has its own chips). */
export function countSheetFilters(f: InvestorFilters) {
  return [f.maturity, f.employeeId, f.days || f.month || f.date || f.fromDate || f.toDate, f.maturityMonth || f.maturityFrom || f.maturityTo]
    .filter(Boolean).length;
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const prettyDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return s;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const prettyMonth = (s: string) => {
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return s;
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
const monthList = (fromOffset: number, toOffset: number) => {
  const now = new Date();
  const out: string[] = [];
  for (let i = fromOffset; i <= toOffset; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

/** Human-readable list of applied filters, each with a remover. */
export function describeFilters(f: InvestorFilters): { key: string; label: string; clear: Partial<InvestorFilters> }[] {
  const out: { key: string; label: string; clear: Partial<InvestorFilters> }[] = [];
  if (f.maturity) out.push({ key: 'maturity', label: MATURITY_OPTIONS.find((o) => o.value === f.maturity)?.label || f.maturity, clear: { maturity: '' } });
  if (f.employeeId) out.push({ key: 'emp', label: `Referred by ${f.employeeName || 'employee'}`, clear: { employeeId: '', employeeName: '' } });
  if (f.days) out.push({ key: 'days', label: `Added ${DAYS_OPTIONS.find((o) => o.value === f.days)?.label.toLowerCase()}`, clear: { days: '' } });
  if (f.month) out.push({ key: 'month', label: `Added in ${prettyMonth(f.month)}`, clear: { month: '' } });
  if (f.date) out.push({ key: 'date', label: `Added on ${prettyDate(f.date)}`, clear: { date: '' } });
  if (f.fromDate || f.toDate) out.push({ key: 'range', label: `Added ${f.fromDate ? prettyDate(f.fromDate) : '…'} – ${f.toDate ? prettyDate(f.toDate) : '…'}`, clear: { fromDate: '', toDate: '' } });
  if (f.maturityMonth) out.push({ key: 'mm', label: `Matures in ${prettyMonth(f.maturityMonth)}`, clear: { maturityMonth: '' } });
  if (f.maturityFrom || f.maturityTo) out.push({ key: 'mr', label: `Matures ${f.maturityFrom ? prettyDate(f.maturityFrom) : '…'} – ${f.maturityTo ? prettyDate(f.maturityTo) : '…'}`, clear: { maturityFrom: '', maturityTo: '' } });
  return out;
}

// ---------------- Small building blocks ----------------

export function Chip({ c, label, active, onPress, accent }: { c: Palette; label: string; active: boolean; onPress: () => void; accent: string }) {
  const onAccent = accent === GOLD ? BRAND_NAVY : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8, marginBottom: 8,
        backgroundColor: active ? accent : c.surfaceLight, borderWidth: 1, borderColor: active ? accent : c.border,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? onAccent : c.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Date picker: native calendar on phones, YYYY-MM-DD text on web. */
export function DateField({ c, label, value, onChange }: { c: Palette; label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const box = {
    flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, minHeight: 46, borderRadius: 12,
    paddingHorizontal: 12, backgroundColor: c.surfaceLight, borderWidth: 1, borderColor: c.border,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{label}</Text>
        <View style={box}>
          <Calendar size={15} color={c.textMuted} />
          <TextInput
            value={draft}
            onChangeText={(t) => { setDraft(t); if (/^\d{4}-\d{2}-\d{2}$/.test(t) || t === '') onChange(t); }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={c.textMuted}
            style={{ flex: 1, marginLeft: 8, color: c.text, fontSize: 14, outlineStyle: 'none' } as any}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity style={box} onPress={() => setOpen(true)}>
        <Calendar size={15} color={c.textMuted} />
        <Text style={{ flex: 1, marginLeft: 8, color: value ? c.text : c.textMuted, fontSize: 14 }}>{value ? prettyDate(value) : 'Select'}</Text>
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={15} color={c.textMuted} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e: any, d?: Date) => {
            setOpen(Platform.OS === 'ios' && e?.type !== 'set' ? true : false);
            if (e?.type === 'set' && d) { onChange(ymd(d)); setOpen(false); }
            if (e?.type === 'dismissed') setOpen(false);
          }}
        />
      )}
    </View>
  );
}

export function SheetSection({ c, title, children }: { c: Palette; title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

// ---------------- Filter sheet ----------------

export function InvestorFilterSheet({
  c,
  accent,
  visible,
  initial,
  employees,
  onApply,
  onClose,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  initial: InvestorFilters;
  employees: any[];
  onApply: (f: InvestorFilters) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [f, setF] = useState<InvestorFilters>(initial);
  const [empQuery, setEmpQuery] = useState('');
  useEffect(() => { if (visible) { setF(initial); setEmpQuery(''); } }, [visible]);

  const set = (patch: Partial<InvestorFilters>) => setF((prev) => ({ ...prev, ...patch }));
  // Created-date options are mutually exclusive, like on the web.
  const setCreated = (patch: Partial<InvestorFilters>) =>
    set({ days: '', month: '', date: '', fromDate: '', toDate: '', ...patch });

  const empList = useMemo(() => {
    const q = empQuery.trim().toLowerCase();
    const list = employees.filter((e) => {
      if (!q) return true;
      return `${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''}`.toLowerCase().includes(q);
    });
    return list.slice(0, 30);
  }, [employees, empQuery]);

  const onAccent = accent === GOLD ? BRAND_NAVY : '#fff';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Filters</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close filters" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
              <X size={18} color={c.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
            <SheetSection c={c} title="MATURITY">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {MATURITY_OPTIONS.map((o) => (
                  <Chip key={o.value || 'all'} c={c} accent={accent} label={o.label} active={f.maturity === o.value} onPress={() => set({ maturity: o.value })} />
                ))}
              </View>
            </SheetSection>

            <SheetSection c={c} title="REFERRED BY EMPLOYEE">
              <SearchBox c={c} value={empQuery} onChange={setEmpQuery} placeholder="Search employee name or code" />
              <View style={{ borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                {[{ _id: '', firstName: 'All employees / Direct investors' }, ...empList].map((e: any, i: number) => {
                  const active = f.employeeId === e._id;
                  const name = `${e.firstName || ''} ${e.lastName || ''}`.trim();
                  return (
                    <TouchableOpacity
                      key={e._id || 'all'}
                      onPress={() => set({ employeeId: e._id, employeeName: e._id ? name : '' })}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border, backgroundColor: active ? c.surfaceLight : 'transparent' }}
                    >
                      <Text style={{ flex: 1, fontSize: 14, color: c.text, fontWeight: active ? '700' : '400' }} numberOfLines={1}>
                        {name}{e.employeeCode ? <Text style={{ color: c.textMuted }}>  ({e.employeeCode})</Text> : null}
                      </Text>
                      {active ? <Check size={16} color={accent} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {employees.length > empList.length && !empQuery ? (
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 6 }}>Showing 30 of {employees.length}. Search to find others.</Text>
              ) : null}
            </SheetSection>

            <SheetSection c={c} title="DATE ADDED">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {DAYS_OPTIONS.map((o) => (
                  <Chip
                    key={o.value || 'all'} c={c} accent={accent} label={o.label}
                    active={o.value ? f.days === o.value : !(f.days || f.month || f.date || f.fromDate || f.toDate)}
                    onPress={() => setCreated({ days: o.value })}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 6, marginBottom: 8 }}>By month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {monthList(-11, 0).reverse().map((m) => (
                  <Chip key={m} c={c} accent={accent} label={prettyMonth(m)} active={f.month === m} onPress={() => setCreated({ month: f.month === m ? '' : m })} />
                ))}
              </ScrollView>
              <View style={{ marginTop: 8 }}>
                <DateField c={c} label="Specific date" value={f.date} onChange={(v) => setCreated({ date: v })} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <DateField c={c} label="From" value={f.fromDate} onChange={(v) => setCreated({ fromDate: v, toDate: f.toDate })} />
                <DateField c={c} label="To" value={f.toDate} onChange={(v) => setCreated({ toDate: v, fromDate: f.fromDate })} />
              </View>
            </SheetSection>

            <SheetSection c={c} title="MATURITY DATE">
              <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>Maturity month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {monthList(-3, 24).map((m) => (
                  <Chip key={m} c={c} accent={accent} label={prettyMonth(m)} active={f.maturityMonth === m} onPress={() => set({ maturityMonth: f.maturityMonth === m ? '' : m, maturityFrom: '', maturityTo: '' })} />
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <DateField c={c} label="From" value={f.maturityFrom} onChange={(v) => set({ maturityFrom: v, maturityMonth: '' })} />
                <DateField c={c} label="To" value={f.maturityTo} onChange={(v) => set({ maturityTo: v, maturityMonth: '' })} />
              </View>
            </SheetSection>

            <SheetSection c={c} title="RESULTS PER PAGE">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[10, 25, 50, 100].map((n) => (
                  <Chip key={n} c={c} accent={accent} label={String(n)} active={f.limit === n} onPress={() => set({ limit: n })} />
                ))}
              </View>
            </SheetSection>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
            <TouchableOpacity
              onPress={() => setF({ ...EMPTY_FILTERS, status: f.status, limit: f.limit })}
              style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(f)}
              style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------- Investor card ----------------

const statusTone = (s?: string): 'success' | 'danger' | 'warning' => (s === 'Verified' ? 'success' : s === 'Rejected' ? 'danger' : 'warning');

export function InvestorCard({
  c,
  isDark,
  accent,
  inv,
  onView,
  onForm,
  onBond,
  onEdit,
  onDelete,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  inv: any;
  onView: () => void;
  onForm: () => void;
  onBond: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const docs = inv.docVerifications || {};
  const keys = ['aadhar', 'pan', 'bankPassbook'];
  const approved = keys.filter((k) => docs[k] === 'Approved').length;
  const bond = !!inv.bondAgreement?.accepted;
  const maturity = inv.bondMaturityDate ? String(inv.bondMaturityDate).slice(0, 10) : '';
  const todayStr = ymd(new Date());
  const matured = maturity && maturity < todayStr;

  const ActionBtn = ({ icon: Icon, label, onPress, tint, filled }: any) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: label ? 8 : 0,
        width: label ? undefined : 36, flex: label ? 1 : undefined, height: 38, borderRadius: 10,
        backgroundColor: filled ? tint : tint + (isDark ? '22' : '14'),
      }}
    >
      <Icon size={15} color={filled ? (tint === GOLD ? BRAND_NAVY : '#fff') : tint} />
      {label ? <Text style={{ fontSize: 13, fontWeight: '700', color: filled ? (tint === GOLD ? BRAND_NAVY : '#fff') : tint }}>{label}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12 }}>
      <TouchableOpacity onPress={onView} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={inv.fullName || inv.email || '?'} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }} numberOfLines={1}>{inv.fullName || '—'}</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: accent, marginTop: 1 }}>{inv.investorCode || '—'}</Text>
        </View>
        <StatusPill label={inv.status || 'Pending'} tone={statusTone(inv.status)} />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
        {inv.email ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
            <Mail size={13} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted }} numberOfLines={1}>{inv.email}</Text>
          </View>
        ) : null}
        {inv.phone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Phone size={13} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{inv.phone}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Invested</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>{inr(inv.investmentAmount)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Growth</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.success, marginTop: 2 }}>{inv.monthlyGrowthPercentage ?? 2.5}%/mo</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Maturity</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: matured ? c.success : c.text, marginTop: 4 }} numberOfLines={1}>
            {maturity ? prettyDate(maturity) : '—'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <UserCheck size={13} color={c.textMuted} />
          <Text style={{ fontSize: 12, color: c.textMuted }} numberOfLines={1}>{inv.referralEmployeeName || 'Direct / Self'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={13} color={bond ? c.success : c.textMuted} />
          <Text style={{ fontSize: 12, color: bond ? c.success : c.textMuted, fontWeight: bond ? '700' : '400' }}>{bond ? 'Bond signed' : 'Bond pending'}</Text>
        </View>
        <Text style={{ fontSize: 12, color: approved === 3 ? c.success : c.textMuted }}>KYC {approved}/3</Text>
        {inv.debentureForm?.applicationNo ? (
          <Text style={{ fontSize: 12, color: c.info }}>Form #{inv.debentureForm.applicationNo}</Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
        <ActionBtn icon={Eye} label="View" onPress={onView} tint={c.accent === accent ? c.accent : GOLD} filled />
        <ActionBtn icon={FileText} label="Form" onPress={onForm} tint={c.info} />
        {inv.status === 'Verified' ? <ActionBtn icon={ShieldCheck} label="Bond" onPress={onBond} tint={GOLD} /> : null}
        <ActionBtn icon={Edit} onPress={onEdit} tint={c.info} />
        <ActionBtn icon={Trash2} onPress={onDelete} tint={c.danger} />
      </View>
    </View>
  );
}

