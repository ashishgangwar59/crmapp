import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { X, ListFilter } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY } from '../../components/DashboardUI';
import { Chip, DateField, SheetSection } from '../investors/InvestorListUI';

/** Shared building blocks for the Reports, Notifications and Company Wallet screens. */

export const onAccent = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

// ---------------- Dates ----------------

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const prettyDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return s;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const prettyMonth = (s: string) => {
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return s;
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
export const shortMonth = (s: string) => {
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return s;
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
export const monthList = (fromOffset: number, toOffset: number) => {
  const now = new Date();
  const out: string[] = [];
  for (let i = fromOffset; i <= toOffset; i++) out.push(ym(new Date(now.getFullYear(), now.getMonth() + i, 1)));
  return out;
};
export const dateTime = (v: any) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};
export const relativeTime = (v: any) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/** Created-date filter used by the client-side lists (mutually exclusive options). */
export interface DateFilter {
  days: '' | 'today' | 'yesterday' | 'last7' | 'last30';
  month: string; // YYYY-MM
  fromDate: string; // YYYY-MM-DD
  toDate: string;
}
export const EMPTY_DATE: DateFilter = { days: '', month: '', fromDate: '', toDate: '' };
export const DAYS_OPTIONS: { value: DateFilter['days']; label: string }[] = [
  { value: '', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
];

export function matchesDate(value: any, f: DateFilter) {
  if (!f.days && !f.month && !f.fromDate && !f.toDate) return true;
  const d = new Date(value);
  if (isNaN(d.getTime())) return false;
  const day = ymd(d);
  const today = new Date();
  if (f.days === 'today') return day === ymd(today);
  if (f.days === 'yesterday') return day === ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
  if (f.days === 'last7') return day >= ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));
  if (f.days === 'last30') return day >= ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));
  if (f.month) return day.slice(0, 7) === f.month;
  if (f.fromDate && day < f.fromDate) return false;
  if (f.toDate && day > f.toDate) return false;
  return true;
}

export function describeDate(f: DateFilter, verb = 'Date'): { key: string; label: string; clear: Partial<DateFilter> } | null {
  if (f.days) return { key: 'days', label: DAYS_OPTIONS.find((o) => o.value === f.days)?.label || f.days, clear: { days: '' } };
  if (f.month) return { key: 'month', label: `${verb}: ${shortMonth(f.month)}`, clear: { month: '' } };
  if (f.fromDate || f.toDate) {
    return { key: 'range', label: `${f.fromDate ? prettyDate(f.fromDate) : '…'} – ${f.toDate ? prettyDate(f.toDate) : '…'}`, clear: { fromDate: '', toDate: '' } };
  }
  return null;
}

/** Date section for a filter sheet: presets, month chips and a from/to range. */
export function DateFilterSection({ c, accent, title, value, onChange }: { c: Palette; accent: string; title: string; value: DateFilter; onChange: (v: DateFilter) => void }) {
  const set = (patch: Partial<DateFilter>) => onChange({ ...EMPTY_DATE, ...patch });
  const none = !value.days && !value.month && !value.fromDate && !value.toDate;
  return (
    <SheetSection c={c} title={title}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {DAYS_OPTIONS.map((o) => (
          <Chip key={o.value || 'all'} c={c} accent={accent} label={o.label} active={o.value ? value.days === o.value : none} onPress={() => set({ days: o.value })} />
        ))}
      </View>
      <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 6, marginBottom: 8 }}>By month</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {monthList(-11, 0).reverse().map((m) => (
          <Chip key={m} c={c} accent={accent} label={shortMonth(m)} active={value.month === m} onPress={() => set({ month: value.month === m ? '' : m })} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <DateField c={c} label="From" value={value.fromDate} onChange={(v) => set({ fromDate: v, toDate: value.toDate })} />
        <DateField c={c} label="To" value={value.toDate} onChange={(v) => set({ toDate: v, fromDate: value.fromDate })} />
      </View>
    </SheetSection>
  );
}

// ---------------- Layout pieces ----------------

export function BottomSheet({
  c,
  accent,
  visible,
  title,
  onClose,
  onReset,
  onApply,
  applyLabel = 'Show results',
  applyDisabled,
  children,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  title: string;
  onClose: () => void;
  onReset?: () => void;
  onApply: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} accessibilityLabel="Close" />
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
              <X size={18} color={c.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
            {onReset ? (
              <TouchableOpacity onPress={onReset} style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Reset</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onApply}
              disabled={applyDisabled}
              style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', opacity: applyDisabled ? 0.6 : 1 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent(accent) }}>{applyLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FilterButton({ c, accent, count, onPress }: { c: Palette; accent: string; count: number; onPress: () => void }) {
  const fg = count ? onAccent(accent) : c.text;
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Open filters"
      style={{ height: 42, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: count ? accent : c.surfaceLight }}
    >
      <ListFilter size={17} color={fg} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: fg }}>Filters{count ? ` · ${count}` : ''}</Text>
    </TouchableOpacity>
  );
}

/** Horizontal row of pill chips with optional counts (quick filters). */
export function QuickChips<T extends string>({
  c,
  accent,
  value,
  options,
  onChange,
}: {
  c: Palette;
  accent: string;
  value: T;
  options: { value: T; label: string; count?: number; icon?: any; tint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
      {options.map((o) => {
        const active = o.value === value;
        const fg = active ? onAccent(accent) : c.textMuted;
        const Icon = o.icon;
        return (
          <TouchableOpacity
            key={o.value || 'all'}
            onPress={() => onChange(o.value)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              backgroundColor: active ? accent : c.surface, borderWidth: 1, borderColor: active ? accent : c.border,
            }}
          >
            {Icon ? <Icon size={14} color={active ? fg : o.tint || c.textMuted} /> : null}
            <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{o.label}</Text>
            {o.count !== undefined ? (
              <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : c.surfaceLight, borderRadius: 999, paddingHorizontal: 6, minWidth: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: fg }}>{o.count}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function AppliedChips({ c, items, onRemove, onClearAll }: { c: Palette; items: { key: string; label: string }[]; onRemove: (key: string) => void; onClearAll: () => void }) {
  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
      {items.map((a) => (
        <TouchableOpacity
          key={a.key}
          onPress={() => onRemove(a.key)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: c.surfaceLight }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{a.label}</Text>
          <X size={13} color={c.textMuted} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={onClearAll} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: c.danger }}>Clear all</Text>
      </TouchableOpacity>
    </View>
  );
}

export const PAGE_SIZES = [10, 25, 50, 100];

export function PageSizeSection({ c, accent, value, onChange }: { c: Palette; accent: string; value: number; onChange: (n: number) => void }) {
  return (
    <SheetSection c={c} title="RESULTS PER PAGE">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {PAGE_SIZES.map((n) => (
          <Chip key={n} c={c} accent={accent} label={String(n)} active={value === n} onPress={() => onChange(n)} />
        ))}
      </View>
    </SheetSection>
  );
}

export function ListSkeleton({ c, count = 4, height = 92 }: { c: Palette; count?: number; height?: number }) {
  return (
    <View style={{ paddingTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ height, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, marginBottom: 10, padding: 14, flexDirection: 'row', gap: 12, opacity: 1 - i * 0.18 }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c.surfaceLight }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: c.surfaceLight }} />
            <View style={{ width: '85%', height: 10, borderRadius: 5, backgroundColor: c.surfaceLight }} />
            <View style={{ width: '40%', height: 10, borderRadius: 5, backgroundColor: c.surfaceLight }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function BigEmpty({ c, icon: Icon, title, text }: { c: Palette; icon: any; title: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 10 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={c.textMuted} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{title}</Text>
      <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

// ---------------- Export ----------------

const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Renders a table as a PDF: native share sheet on phones, print dialog on web. */
export async function exportTablePdf(opts: { title: string; subtitle?: string; headers: string[]; rows: (string | number)[][]; fileName: string; footer?: string }) {
  const html = `<!doctype html><html><head><meta charset="utf-8" /><style>
    body{font-family:-apple-system,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;padding:24px}
    h1{font-size:20px;margin:0 0 4px} p{color:#64748B;font-size:12px;margin:0 0 16px}
    table{width:100%;border-collapse:collapse;font-size:10px} th{background:#0C1C3D;color:#fff;text-align:left;padding:6px}
    td{padding:6px;border-bottom:1px solid #E2E8F0} tr:nth-child(even) td{background:#F8FAFC}
    .f{margin-top:14px;font-size:12px;font-weight:700}
  </style></head><body>
    <h1>${esc(opts.title)}</h1><p>${esc(opts.subtitle || `Generated on ${new Date().toLocaleString('en-IN')}`)}</p>
    <table><thead><tr>${opts.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${opts.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    ${opts.footer ? `<div class="f">${esc(opts.footer)}</div>` : ''}
  </body></html>`;
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: opts.fileName, UTI: 'com.adobe.pdf' });
  } else {
    await Print.printAsync({ uri });
  }
}

/** CSV that opens in Excel: downloaded on web, shared as text on phones (no file-system package installed). */
export async function exportTableCsv(opts: { headers: string[]; rows: (string | number)[][]; fileName: string }) {
  const cell = (v: any) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [opts.headers, ...opts.rows].map((r) => r.map(cell).join(',')).join('\n');
  if (Platform.OS === 'web') {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = opts.fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ title: opts.fileName, message: csv });
}
