import { Appearance } from 'react-native';
import { useAuthStore } from '../services/authStore';

export const lightColors = {
  primary: '#0F172A',
  navy: '#0C1C3D',
  secondary: '#1E293B',
  accent: '#134086',
  accentLight: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  textGold: '#D97706',
  gold: '#D6AF37',
  goldLight: '#FEF3C7',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#E2E8F0',
  borderGold: 'rgba(214, 175, 55, 0.4)',
  cardGlow: 'rgba(37, 99, 235, 0.08)',
};

export const darkColors = {
  primary: '#0A0F1D',
  navy: '#0A0F1D',
  secondary: '#1E293B',
  accent: '#134086',
  accentLight: '#0F172A',
  background: '#070A12',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textGold: '#FBBF24',
  gold: '#D6AF37',
  goldLight: 'rgba(214, 175, 55, 0.15)',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#1E293B',
  borderGold: 'rgba(214, 175, 55, 0.3)',
  cardGlow: 'rgba(56, 189, 248, 0.12)',
};

let forcedScheme: 'light' | 'dark' | null = null;
let cachedIsDark: boolean | null = null;
let cachedScheme: typeof darkColors | null = null;

export const setForcedScheme = (scheme: 'light' | 'dark' | null) => {
  forcedScheme = scheme;
  cachedIsDark = null;
  cachedScheme = null;
};

// Invalidate color cache on demand
export const invalidateColorCache = () => {
  cachedIsDark = null;
  cachedScheme = null;
};

let lastThemeMode = useAuthStore.getState().themeMode;
useAuthStore.subscribe((state) => {
  if (state.themeMode !== lastThemeMode) {
    lastThemeMode = state.themeMode;
    invalidateColorCache();
  }
});

export const getThemeColors = (isDarkParam?: boolean) => {
  if (isDarkParam !== undefined) {
    return isDarkParam ? darkColors : lightColors;
  }
  if (forcedScheme) {
    return forcedScheme === 'dark' ? darkColors : lightColors;
  }
  const mode = useAuthStore.getState().themeMode || 'system';
  const isDark = mode === 'system' ? Appearance.getColorScheme() === 'dark' : mode === 'dark';
  if (cachedIsDark !== isDark || !cachedScheme) {
    cachedIsDark = isDark;
    cachedScheme = isDark ? darkColors : lightColors;
  }
  return cachedScheme;
};

export const colors = new Proxy({}, {
  get(target, prop) {
    const scheme = getThemeColors();
    return scheme[prop as keyof typeof lightColors];
  }
}) as typeof lightColors;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  xs: 6,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const cardStyles = {
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glass: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  }
};

