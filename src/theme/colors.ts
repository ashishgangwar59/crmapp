import { Appearance } from 'react-native';
import { useAuthStore } from '../services/authStore';

const lightColors = {
  primary: '#0c1c3d',
  navy: '#0c1c3d',
  secondary: '#fff',
  accent: '#1147a5',
  accentLight: '#F3E5AB',
  background: '#fff',
  surface: '#f6f6f6ff',
  surfaceLight: '#efefefff',
  text: '#184683',
  textMuted: '#587399',
  textGold: '#D4AF37',
  gold: '#c9972f',
  goldLight: '#e8b84b',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#c8c8c8ff',
  borderGold: 'rgba(201, 151, 47, 0.4)',
};

const darkColors = {
  primary: '#0c1c3d',
  navy: '#0c1c3d',
  secondary: '#111827',
  accent: '#ffd339',
  accentLight: '#1f2937',
  background: '#090D16',
  surface: '#111827',
  surfaceLight: '#1F2937',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  textGold: '#FBBF24',
  gold: '#c9972f',
  goldLight: '#e8b84b',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#374151',
  borderGold: 'rgba(201, 151, 47, 0.4)',
};

let forcedScheme: 'light' | 'dark' | null = null;

export const setForcedScheme = (scheme: 'light' | 'dark' | null) => {
  forcedScheme = scheme;
};

export const colors = new Proxy({}, {
  get(target, prop) {
    let isDark = false;
    if (forcedScheme) {
      isDark = forcedScheme === 'dark';
    } else {
      const mode = useAuthStore.getState().themeMode || 'system';
      if (mode === 'system') {
        isDark = Appearance.getColorScheme() === 'dark';
      } else {
        isDark = mode === 'dark';
      }
    }
    const scheme = isDark ? darkColors : lightColors;
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
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  round: 9999,
};
