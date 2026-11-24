import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView, useColorScheme, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useAuthStore } from '../services/authStore';
import { lightColors, darkColors } from '../theme/colors';

export type Palette = typeof lightColors;
export const GOLD = '#D6AF37';
export const BRAND_NAVY = '#0C1C3D';

export function useAppTheme() {
  const themeMode = useAuthStore((s) => s.themeMode);
  const scheme = useColorScheme();
  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  const c = (isDark ? darkColors : lightColors) as Palette;
  return { isDark, c, accent: isDark ? GOLD : c.accent };
}

export const inr = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/** ₹1.2 Cr / ₹4.5 L / ₹12,300: short amounts for tight tiles. */
export const inrShort = (n: any) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return inr(v);
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export function Card({ c, children, style, padded = true }: { c: Palette; children: React.ReactNode; style?: ViewStyle; padded?: boolean }) {
  return (
    <View
      style={[
        {
          backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border,
          padding: padded ? 16 : 0, overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  c,
  title,
  action,
  onAction,
  accent,
}: {
  c: Palette;
  title: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{title}</Text>
      {action && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: accent || c.accent }}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function StatTile({
  c,
  isDark,
  icon: Icon,
  tint,
  label,
  value,
  hint,
  onPress,
}: {
  c: Palette;
  isDark: boolean;
  icon: any;
  tint: string;
  label: string;
  value: string | number;
  hint?: string;
  onPress?: () => void;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexGrow: 1, flexBasis: '45%', backgroundColor: c.surface, borderRadius: 18, padding: 14,
        borderWidth: 1, borderColor: c.border,
      }}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={19} color={tint} />
      </View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2, fontWeight: '500' }} numberOfLines={1}>
        {label}
      </Text>
      {hint ? <Text style={{ fontSize: 11, color: tint, marginTop: 4, fontWeight: '600' }}>{hint}</Text> : null}
    </Wrapper>
  );
}

const AVATAR_TINTS = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#14B8A6'];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const parts = String(name || '?').trim().split(/\s+/);
  const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
  const tint = AVATAR_TINTS[(name || '').length % AVATAR_TINTS.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint + '22', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: tint, fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'muted' }) {
  const map = {
    success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', muted: '#94A3B8',
  } as const;
  const col = map[tone];
  return (
    <View style={{ backgroundColor: col + '1F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: col, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ c, icon: Icon, text }: { c: Palette; icon: any; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={c.textMuted} />
      </View>
      <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

export function SearchBox({ c, value, onChange, placeholder }: { c: Palette; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceLight, borderRadius: 12, paddingHorizontal: 12, minHeight: 42, marginBottom: 12 }}>
      <Search size={16} color={c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        style={[{ flex: 1, marginLeft: 8, fontSize: 14, color: c.text, paddingVertical: 8 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')} accessibilityLabel="Clear search">
          <X size={16} color={c.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function FilterChips<T extends string>({
  c,
  value,
  options,
  onChange,
  accent,
}: {
  c: Palette;
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  accent: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
      {options.map((o) => {
        const active = o.value === value;
        const onAccent = accent === GOLD ? BRAND_NAVY : '#fff';
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
              backgroundColor: active ? accent : c.surfaceLight,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? onAccent : c.textMuted }}>{o.label}</Text>
            {o.count !== undefined ? (
              <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : c.surface, borderRadius: 999, paddingHorizontal: 6, minWidth: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: active ? onAccent : c.textMuted }}>{o.count}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
