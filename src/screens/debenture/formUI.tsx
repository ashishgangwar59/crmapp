import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  PanResponder,
  TextInputProps,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Check, CloudUpload, Eraser, CircleCheck, X, PenTool } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY } from '../../components/DashboardUI';

/** Text colour to use on top of the accent (navy on gold, white on blue). */
export const onAccent = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

/** Labelled input with optional icon; border turns accent-coloured on focus with clear button. */
export function FormField({
  c,
  accent,
  label,
  icon: Icon,
  required,
  hint,
  readOnly,
  right,
  style,
  value,
  onChangeText,
  ...input
}: TextInputProps & {
  c: Palette;
  accent: string;
  label: string;
  icon?: any;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
  right?: React.ReactNode;
  style?: any;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, letterSpacing: 0.1 }}>
          {label}
          {required ? <Text style={{ color: c.danger, fontWeight: '800' }}> *</Text> : null}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: input.multiline ? 72 : 52,
          borderRadius: 16,
          paddingHorizontal: 14,
          backgroundColor: focused ? (c.surfaceLight || '#F8FAFC') : c.surfaceLight,
          borderWidth: 1.5,
          borderColor: focused ? accent : 'transparent',
          opacity: readOnly ? 0.75 : 1,
          shadowColor: focused ? accent : '#000',
          shadowOffset: { width: 0, height: focused ? 2 : 1 },
          shadowOpacity: focused ? 0.12 : 0.02,
          shadowRadius: focused ? 6 : 2,
          elevation: focused ? 2 : 0,
        }}
      >
        {Icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: focused ? accent + '18' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Icon size={17} color={focused ? accent : c.textMuted} />
          </View>
        ) : null}
        <TextInput
          {...input}
          value={value}
          onChangeText={onChangeText}
          editable={!readOnly && input.editable !== false}
          placeholderTextColor={c.textMuted}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontSize: 15,
              fontWeight: '500',
              color: c.text,
              paddingVertical: input.multiline ? 12 : 11,
              textAlignVertical: input.multiline ? 'top' : 'center',
            },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
        />
        {/* Quick Clear Button on Mobile */}
        {!readOnly && value && onChangeText && !input.multiline ? (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: c.textMuted + '25',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6,
            }}
          >
            <X size={13} color={c.text} />
          </TouchableOpacity>
        ) : null}
        {right}
      </View>
      {hint ? (
        <Text style={{ fontSize: 11.5, color: c.textMuted, marginTop: 5, paddingLeft: 2 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** Two fields side by side on mobile. */
export function FieldRow({ children }: { children: React.ReactNode }) {
  const kids = React.Children.toArray(children);
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {kids.map((k, i) => (
        <View key={i} style={{ flex: 1 }}>{k}</View>
      ))}
    </View>
  );
}

/** Checkbox row (square) or radio row (round) with native touch feedback and active styling. */
export function CheckRow({
  c,
  accent,
  label,
  checked,
  onPress,
  radio,
  children,
}: {
  c: Palette;
  accent: string;
  label: string;
  checked: boolean;
  onPress: () => void;
  radio?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: checked ? accent + '12' : c.surfaceLight,
        borderWidth: 1.5,
        borderColor: checked ? accent : 'transparent',
        marginBottom: 9,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radio ? 11 : 7,
          borderWidth: 2,
          borderColor: checked ? accent : c.textMuted,
          backgroundColor: checked && !radio ? accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? (
          radio ? (
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent }} />
          ) : (
            <Check size={14} color={onAccent(accent)} strokeWidth={3} />
          )
        ) : null}
      </View>
      <Text style={{ flex: 1, fontSize: 14.5, fontWeight: checked ? '700' : '600', color: c.text }}>{label}</Text>
      {children}
    </TouchableOpacity>
  );
}

/** Modern fintech step indicator with progress bar, step pills, and smooth completion status. */
export function StepProgress({
  c,
  accent,
  steps,
  current,
  onStep,
}: {
  c: Palette;
  accent: string;
  steps: string[];
  current: number;
  onStep: (i: number) => void;
}) {
  const percent = Math.round(((current + 1) / steps.length) * 100);

  return (
    <View style={{ paddingVertical: 2 }}>
      {/* Top Header Row with Step Counter & Progress Percentage */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: accent + '1E' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: accent, letterSpacing: 0.5 }}>
              STEP {current + 1} OF {steps.length}
            </Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '800', color: c.text }}>
            {steps[current]}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '800', color: accent }}>{percent}%</Text>
      </View>

      {/* Thin Continuous Progress Track */}
      <View style={{ height: 5, borderRadius: 3, backgroundColor: c.border, overflow: 'hidden', marginBottom: 14 }}>
        <View
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: accent,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Step Pills Navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={s}>
              {i > 0 ? (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: i <= current ? accent : c.border,
                    marginHorizontal: 3,
                  }}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => onStep(i)}
                activeOpacity={0.7}
                accessibilityLabel={`Step ${i + 1}: ${s}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done ? c.success : active ? accent : c.surfaceLight,
                  borderWidth: active ? 2.5 : 0,
                  borderColor: accent + '44',
                  shadowColor: active || done ? accent : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: active ? 3 : 0,
                }}
              >
                {done ? (
                  <Check size={16} color="#fff" strokeWidth={3} />
                ) : (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: active ? onAccent(accent) : c.textMuted,
                    }}
                  >
                    {i + 1}
                  </Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

/** Upload tile with preview / status. */
export function UploadTile({
  c,
  isDark,
  label,
  subtitle,
  uri,
  onPress,
  locked,
  lockedLabel,
  compact,
}: {
  c: Palette;
  isDark: boolean;
  label: string;
  subtitle?: string;
  uri?: string;
  onPress?: () => void;
  locked?: boolean;
  lockedLabel?: string;
  compact?: boolean;
}) {
  const ok = c.success;
  if (locked) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 12,
          borderRadius: 16,
          backgroundColor: ok + (isDark ? '1F' : '14'),
        }}
      >
        <CircleCheck size={18} color={ok} />
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: ok }}>
          {lockedLabel || 'Verified & approved by admin'}
        </Text>
      </View>
    );
  }
  const isImage = !!uri && /^(file:|content:|data:image|blob:|https?:).*/i.test(uri) && !/\.pdf($|\?)/i.test(uri);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: compact ? 10 : 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: uri ? ok : c.border,
        backgroundColor: uri ? ok + (isDark ? '14' : '0D') : c.surfaceLight,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: uri ? ok + '22' : c.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: uri ? ok + '44' : c.border,
        }}
      >
        {isImage ? (
          <Image source={{ uri }} style={{ width: 46, height: 46 }} />
        ) : uri ? (
          <CircleCheck size={22} color={ok} />
        ) : (
          <CloudUpload size={22} color={c.textMuted} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: uri ? ok : c.text }} numberOfLines={1}>
          {uri ? `${label} attached` : label}
        </Text>
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
          {uri ? 'Tap to change document' : subtitle || 'Tap to upload PDF or Photo'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Primary full-width button in the accent colour with tactile mobile feel and soft shadow. */
export function PrimaryButton({
  accent,
  label,
  onPress,
  loading,
  disabled,
  icon: Icon,
  style,
}: {
  accent: string;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
  style?: any;
}) {
  const fg = onAccent(accent);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        {
          backgroundColor: accent,
          borderRadius: 16,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 18,
          opacity: disabled ? 0.55 : 1,
          shadowColor: accent,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {Icon ? <Icon size={18} color={fg} strokeWidth={2.5} /> : null}
          <Text style={{ color: fg, fontSize: 15.5, fontWeight: '800', letterSpacing: 0.2 }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Secondary (outlined/tinted) button. */
export function SecondaryButton({
  c,
  label,
  onPress,
  icon: Icon,
  style,
}: {
  c: Palette;
  label: string;
  onPress: () => void;
  icon?: any;
  style?: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        {
          backgroundColor: c.surfaceLight,
          borderRadius: 16,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {Icon ? <Icon size={17} color={c.text} /> : null}
      <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Finger-drawn signature pad with baseline guide and clear action. */
export function SignaturePad({
  c,
  isDark,
  height = 148,
  paths,
  onChange,
  onDrawingChange,
}: {
  c: Palette;
  isDark: boolean;
  height?: number;
  paths: string[];
  onChange: (p: string[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
}) {
  const current = useRef('');
  const [live, setLive] = useState('');
  const pathsRef = useRef(paths);
  pathsRef.current = paths;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        onDrawingChange?.(true);
        const { locationX, locationY } = e.nativeEvent;
        current.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setLive(current.current);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setLive(current.current);
      },
      onPanResponderRelease: () => {
        if (current.current) onChange([...pathsRef.current, current.current]);
        current.current = '';
        setLive('');
        onDrawingChange?.(false);
      },
      onPanResponderTerminate: () => {
        current.current = '';
        setLive('');
        onDrawingChange?.(false);
      },
    })
  ).current;

  const stroke = isDark ? '#F8FAFC' : BRAND_NAVY;
  const empty = paths.length === 0 && !live;

  return (
    <View>
      <View
        {...responder.panHandlers}
        style={{
          height,
          borderRadius: 16,
          backgroundColor: isDark ? c.surfaceLight : '#FFFFFF',
          borderWidth: 1.5,
          borderColor: c.border,
          borderStyle: empty ? 'dashed' : 'solid',
          overflow: 'hidden',
        }}
      >
        <Svg width="100%" height="100%">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={stroke} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {live ? (
            <Path d={live} stroke={stroke} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {empty ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <PenTool size={22} color={c.textMuted} style={{ marginBottom: 6, opacity: 0.6 }} />
            <Text style={{ color: c.textMuted, fontSize: 13, fontWeight: '600' }}>Draw your signature here</Text>
          </View>
        ) : null}
        {/* Baseline signature guide */}
        <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: 28, height: 1, backgroundColor: c.border }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: '500' }}>Digital signature of applicant</Text>
        <TouchableOpacity
          onPress={() => onChange([])}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: c.surfaceLight }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Eraser size={13} color={c.textMuted} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.textMuted }}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Small uppercase group label inside a card with vertical accent bar. */
export function GroupLabel({ c, children }: { c: Palette; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 4 }}>
      <View style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: GOLD }} />
      <Text style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 0.9, color: c.textMuted }}>
        {children}
      </Text>
    </View>
  );
}
