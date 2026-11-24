import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Sun, Moon, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../services/authStore';
import { useAppTheme, GOLD } from './DashboardUI';

const LOGO = require('../../assets/icon.png');

interface NativeHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export const NativeHeader: React.FC<NativeHeaderProps> = ({ title, subtitle, onOpenSidebar, onLogout }) => {
  const insets = useSafeAreaInsets();
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const { c, isDark, accent } = useAppTheme();
  const setThemeMode = useAuthStore((s) => s.setThemeMode);

  const iconBtn = {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center' as const, justifyContent: 'center' as const,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
  };

  return (
    <View style={{ paddingTop: topGap + 6, paddingBottom: 10, paddingHorizontal: 16, backgroundColor: c.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={iconBtn} onPress={onOpenSidebar} activeOpacity={0.7} accessibilityLabel="Open menu">
          <Menu size={20} color={c.text} />
        </TouchableOpacity>

        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderWidth: isDark ? 0 : 1, borderColor: c.border }}>
          <Image source={LOGO} style={{ width: 26, height: 23 }} resizeMode="contain" />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={{ fontSize: 12, color: isDark ? GOLD : c.textMuted, marginTop: 1, fontWeight: '500' }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={iconBtn}
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
            activeOpacity={0.7}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} color={GOLD} /> : <Moon size={18} color={accent} />}
          </TouchableOpacity>
          <TouchableOpacity style={iconBtn} onPress={onLogout} activeOpacity={0.7} accessibilityLabel="Log out">
            <LogOut size={17} color={c.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
