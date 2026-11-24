import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  TextInputProps,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Sun, Moon, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../services/authStore';
import { lightColors, darkColors } from '../theme/colors';

// Shared look for the Login and Investor Register screens (matches the home screen brand).
export const GOLD = '#D6AF37';
export const BRAND_NAVY = '#0C1C3D';
const LOGO = require('../../assets/icon.png');

export type Palette = typeof lightColors;

export function useAuthTheme() {
  const themeMode = useAuthStore((s) => s.themeMode);
  const setThemeMode = useAuthStore((s) => s.setThemeMode);
  const scheme = useColorScheme();
  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  return {
    isDark,
    c: (isDark ? darkColors : lightColors) as Palette,
    toggle: () => setThemeMode(isDark ? 'light' : 'dark'),
  };
}

/** Navy brand header: back button, theme toggle, logo tile, title and subtitle. */
export function AuthHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  isDark,
  onToggleTheme,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const insets = useSafeAreaInsets();
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  return (
    <View style={[h.wrap, { paddingTop: topGap + 8 }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={h.ringLarge} />
      <View style={h.ringSmall} />
      <View style={h.topRow}>
        <TouchableOpacity style={h.back} onPress={onBack} accessibilityLabel={backLabel}>
          <ArrowLeft size={18} color="#fff" />
          <Text style={h.backText}>{backLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={h.themeBtn}
          onPress={onToggleTheme}
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} color={GOLD} /> : <Moon size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
      <View style={h.logoTile}>
        <Image source={LOGO} style={h.logo} resizeMode="contain" />
      </View>
      <Text style={h.title}>{title}</Text>
      <Text style={h.subtitle}>{subtitle}</Text>
    </View>
  );
}

const h = StyleSheet.create({
  wrap: { backgroundColor: BRAND_NAVY, paddingHorizontal: 20, paddingBottom: 48, overflow: 'hidden' },
  ringLarge: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -100, top: -80,
    borderWidth: 30, borderColor: 'rgba(214,175,55,0.10)',
  },
  ringSmall: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60, left: -50, bottom: -30,
    borderWidth: 16, borderColor: 'rgba(59,130,246,0.12)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingRight: 8 },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  themeBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  logoTile: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    marginBottom: 16,
  },
  logo: { width: 48, height: 42 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 20, marginTop: 6 },
});

/** Rounded form sheet that overlaps the header. */
export function AuthSheet({ c, children }: { c: Palette; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: c.surface,
        marginTop: -28,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 36,
        flexGrow: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Native Drag / Sheet Indicator Bar */}
      <View
        style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: c.border,
          alignSelf: 'center',
          marginBottom: 18,
          opacity: 0.8,
        }}
      />
      {children}
    </View>
  );
}

/** Labelled input with icon; border turns brand-coloured on focus. */
export function AuthField({
  c,
  isDark,
  label,
  icon: Icon,
  right,
  labelRight,
  value,
  onChangeText,
  ...input
}: TextInputProps & {
  c: Palette;
  isDark: boolean;
  label: string;
  icon?: any;
  right?: React.ReactNode;
  labelRight?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const focusColor = isDark ? GOLD : c.accent;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{label}</Text>
        {labelRight}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          borderRadius: 16,
          paddingHorizontal: 14,
          backgroundColor: c.surfaceLight,
          borderWidth: 1.5,
          borderColor: focused ? focusColor : 'transparent',
          shadowColor: focused ? focusColor : '#000',
          shadowOffset: { width: 0, height: focused ? 2 : 1 },
          shadowOpacity: focused ? 0.15 : 0.02,
          shadowRadius: focused ? 6 : 2,
          elevation: focused ? 2 : 0,
        }}
      >
        {Icon && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: focused ? focusColor + '18' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Icon size={17} color={focused ? focusColor : c.textMuted} />
          </View>
        )}
        <TextInput
          {...input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={c.textMuted}
          onFocus={(e) => { setFocused(true); input.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); input.onBlur?.(e); }}
          style={[
            { flex: 1, fontSize: 15, fontWeight: '500', color: c.text, paddingVertical: 12 },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
        />
        {right}
      </View>
    </View>
  );
}

/** Two-option segmented control. */
export function AuthSegment<T extends string>({
  c,
  isDark,
  value,
  options,
  onChange,
}: {
  c: Palette;
  isDark: boolean;
  value: T;
  options: { value: T; label: string; icon: any }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 16, padding: 4, marginBottom: 20 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            activeOpacity={0.75}
            style={{
              flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
              paddingVertical: 11, borderRadius: 12,
              backgroundColor: active ? (isDark ? '#334155' : '#fff') : 'transparent',
              shadowColor: '#000', shadowOpacity: active && !isDark ? 0.08 : 0, shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 }, elevation: active && !isDark ? 2 : 0,
            }}
          >
            <o.icon size={15} color={active ? (isDark ? GOLD : c.accent) : c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: active ? c.text : c.textMuted }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AuthPrimaryButton({
  c,
  label,
  loading,
  disabled,
  onPress,
  icon: Icon,
}: {
  c: Palette;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  icon?: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={{
        backgroundColor: c.accent,
        borderRadius: 16,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: disabled ? 0.55 : 1,
        shadowColor: c.accent,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 }}>{label}</Text>
          {Icon && <Icon size={18} color="#fff" strokeWidth={2.5} />}
        </>
      )}
    </TouchableOpacity>
  );
}

/** Small inline button inside an input row (e.g. "Send OTP"). */
export function AuthInlineButton({ label, onPress, disabled, isDark }: { label: string; onPress: () => void; disabled?: boolean; isDark: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: isDark ? GOLD : BRAND_NAVY, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
        opacity: disabled ? 0.5 : 1, marginLeft: 8,
      }}
    >
      <Text style={{ color: isDark ? BRAND_NAVY : '#fff', fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View
      style={{
        flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: 'rgba(239,68,68,0.10)',
        borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
      }}
    >
      <AlertCircle size={16} color="#EF4444" style={{ marginTop: 1 }} />
      <Text style={{ color: '#EF4444', fontSize: 13, flex: 1, lineHeight: 18 }}>{message}</Text>
    </View>
  );
}

export function DebugOtp({ c, code }: { c: Palette; code: string }) {
  if (!code) return null;
  return (
    <View style={{ backgroundColor: 'rgba(59,130,246,0.10)', padding: 10, borderRadius: 10, marginBottom: 16, alignItems: 'center' }}>
      <Text style={{ color: c.info, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}>
        DEBUG OTP: <Text style={{ fontWeight: 'bold' }}>{code}</Text>
      </Text>
    </View>
  );
}
