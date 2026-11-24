import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ListFilter } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY } from '../../components/DashboardUI';

// Shared bits for the Attendance / Leave / Holidays screens.

/** Text colour to use on top of the accent (navy on gold in dark mode, white otherwise). */
export const onAccent = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "2026-07-25" (or an ISO string) → "25 Jul 2026" without timezone drift. */
export const prettyDate = (s: any, opts?: Intl.DateTimeFormatOptions) => {
  if (!s) return '—';
  const str = String(s);
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m && !str.includes('T') ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
};

export const prettyMonth = (s: string) => {
  const [y, mo] = String(s || '').split('-').map(Number);
  if (!y || !mo) return s;
  return new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const shiftMonth = (s: string, delta: number) => {
  const [y, mo] = s.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** Accepts either the raw API body ({ success, data: [...] }) or the array itself. */
export const pickList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  return [];
};

export function ScreenTitle({
  c, title, subtitle, action,
}: { c: Palette; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function PrimaryButton({
  accent, icon: Icon, label, onPress, disabled,
}: { accent: string; icon?: any; label: string; onPress: () => void; disabled?: boolean }) {
  const fg = onAccent(accent);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 14, height: 42, borderRadius: 12, opacity: disabled ? 0.6 : 1 }}
    >
      {Icon ? <Icon size={17} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '800', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
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

/** Horizontal row of quick filter pills (e.g. status). */
export function QuickChips<T extends string>({
  c, accent, value, options, onChange,
}: { c: Palette; accent: string; value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
      {options.map((o) => {
        const active = o.value === value;
        const fg = active ? onAccent(accent) : c.textMuted;
        return (
          <TouchableOpacity
            key={o.value || 'all'}
            onPress={() => onChange(o.value)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              backgroundColor: active ? accent : c.surface, borderWidth: 1, borderColor: active ? accent : c.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{o.label}</Text>
            {o.count !== undefined ? (
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? fg : c.textMuted, opacity: 0.8 }}>{o.count}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export interface AppliedFilter { key: string; label: string; onClear: () => void }

export function AppliedFilters({ c, items, onClearAll }: { c: Palette; items: AppliedFilter[]; onClearAll: () => void }) {
  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
      {items.map((a) => (
        <TouchableOpacity
          key={a.key}
          onPress={a.onClear}
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

export function SkeletonList({ c, count = 3, height = 120 }: { c: Palette; count?: number; height?: number }) {
  return (
    <View style={{ paddingTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ height, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, marginBottom: 12, opacity: 1 - i * 0.22 }} />
      ))}
    </View>
  );
}

export function BigEmpty({ c, icon: Icon, title, text }: { c: Palette; icon: any; title: string; text?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={c.textMuted} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{title}</Text>
      {text ? <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', paddingHorizontal: 20 }}>{text}</Text> : null}
    </View>
  );
}

/** Bottom sheet shell matching the investor/lead filter sheets. */
export function BottomSheet({
  c, accent, visible, title, onClose, children, primaryLabel, onPrimary, secondaryLabel, onSecondary, primaryDisabled, primaryBusy,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  primaryBusy?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
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
            {secondaryLabel && onSecondary ? (
              <TouchableOpacity
                onPress={onSecondary}
                style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{secondaryLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onPrimary}
              disabled={primaryDisabled}
              style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', opacity: primaryDisabled ? 0.6 : 1 }}
            >
              {primaryBusy || <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent(accent) }}>{primaryLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Small labelled fact used inside cards ("Punch in  09:42"). */
export function Fact({ c, label, value, tint }: { c: Palette; label: string; value: string; tint?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '800', color: tint || c.text, marginTop: 2 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export const PAGE_SIZES = [10, 20, 50, 100];
