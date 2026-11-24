import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Platform,
  KeyboardAvoidingView, TextInputProps, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Eye, EyeOff, X } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY } from '../../components/DashboardUI';

// Shared building blocks for the Settings and Profile screens (native "grouped list" look).

export const onAccentColor = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

/** Small uppercase caption above a grouped list. */
export function GroupTitle({ c, title, style }: { c: Palette; title: string; style?: ViewStyle }) {
  return (
    <Text
      style={[
        { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginTop: 22, marginBottom: 8, marginLeft: 4 },
        style as any,
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
}

/** Rounded container for a set of rows separated by hairlines. */
export function Group({ c, children, style }: { c: Palette; children: React.ReactNode; style?: ViewStyle }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }, style]}>
      {items.map((child, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.border } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** Settings-style row: tinted icon tile, title, optional subtitle / value, chevron. */
export function ListRow({
  c,
  isDark,
  icon: Icon,
  tint,
  title,
  subtitle,
  value,
  onPress,
  right,
  danger,
  chevron = true,
  disabled,
}: {
  c: Palette;
  isDark: boolean;
  icon?: any;
  tint?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  chevron?: boolean;
  disabled?: boolean;
}) {
  const color = danger ? c.danger : tint || c.textMuted;
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56, opacity: disabled ? 0.5 : 1 }}
    >
      {Icon ? (
        <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: color + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: danger ? c.danger : c.text }} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={{ fontSize: 13, color: c.textMuted, maxWidth: '45%' }} numberOfLines={1}>{value}</Text> : null}
      {right}
      {onPress && chevron ? <ChevronRight size={18} color={c.textMuted} /> : null}
    </Wrapper>
  );
}

/** Read-only label/value row used on the profile screen. */
export function InfoRow({ c, isDark, icon: Icon, label, value, right }: { c: Palette; isDark: boolean; icon?: any; label: string; value: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56 }}>
      {Icon ? (
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={isDark ? GOLD : c.accent} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 15, color: c.text, fontWeight: '600', marginTop: 2 }} selectable>{value}</Text>
      </View>
      {right}
    </View>
  );
}

/** Labelled input with focus border (same look as the auth screens). */
export function FormField({
  c,
  isDark,
  label,
  icon: Icon,
  hint,
  secure,
  containerStyle,
  multiline,
  ...input
}: TextInputProps & {
  c: Palette;
  isDark: boolean;
  label: string;
  icon?: any;
  hint?: string;
  secure?: boolean;
  containerStyle?: ViewStyle;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const focusColor = isDark ? GOLD : c.accent;
  return (
    <View style={[{ marginBottom: 14 }, containerStyle]}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 7 }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', minHeight: 48, borderRadius: 13, paddingHorizontal: 13,
          backgroundColor: c.surfaceLight, borderWidth: 1.5, borderColor: focused ? focusColor : 'transparent',
        }}
      >
        {Icon && <Icon size={17} color={focused ? focusColor : c.textMuted} style={{ marginRight: 10, marginTop: multiline ? 14 : 0 }} />}
        <TextInput
          {...input}
          multiline={multiline}
          secureTextEntry={secure ? !reveal : input.secureTextEntry}
          placeholderTextColor={c.textMuted}
          onFocus={(e) => { setFocused(true); input.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); input.onBlur?.(e); }}
          style={[
            { flex: 1, fontSize: 15, color: c.text, paddingVertical: 12 },
            multiline && { minHeight: 96, textAlignVertical: 'top' },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            input.style as any,
          ]}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setReveal((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={reveal ? 'Hide value' : 'Show value'}>
            {reveal ? <EyeOff size={17} color={c.textMuted} /> : <Eye size={17} color={c.textMuted} />}
          </TouchableOpacity>
        ) : null}
      </View>
      {hint ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 6 }}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  accent,
  icon: Icon,
  compact,
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accent: string;
  icon?: any;
  compact?: boolean;
  style?: ViewStyle;
}) {
  const fg = onAccentColor(accent);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: accent, borderRadius: compact ? 12 : 14, minHeight: compact ? 40 : 50, paddingHorizontal: compact ? 14 : 18,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {Icon && <Icon size={compact ? 16 : 18} color={fg} />}
          <Text style={{ color: fg, fontSize: compact ? 14 : 15, fontWeight: '800' }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Title bar for a settings sub-page: back button, title and optional right action. */
export function SubHeader({ c, title, subtitle, onBack, right }: { c: Palette; title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 }}>
      <TouchableOpacity
        onPress={onBack}
        accessibilityLabel="Back to settings"
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={20} color={c.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 19, fontWeight: '800', color: c.text }} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** Bottom sheet modal with grabber, title, close button, scrollable body and optional footer. */
export function BottomSheet({
  c,
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  c: Palette;
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} accessibilityLabel="Close" />
          <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{subtitle}</Text> : null}
              </View>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
                <X size={18} color={c.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: footer ? 12 : Math.max(insets.bottom, 20) }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer ? (
              <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
                {footer}
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
