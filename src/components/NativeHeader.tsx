import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Eye, LogOut } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuthStore } from '../services/authStore';

interface NativeHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export const NativeHeader: React.FC<NativeHeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const topGap = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;

  const user = useAuthStore((state) => state.user);
  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const getInitials = () => {
    if (!user) return 'U';
    const uAny = user as any;
    if (uAny.firstName) {
      return `${uAny.firstName[0]}${uAny.lastName ? uAny.lastName[0] : ''}`.toUpperCase();
    }
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  return (
    <View style={[styles.container, { paddingTop: topGap + spacing.s, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.contentRow}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenSidebar} activeOpacity={0.7}>
          <Menu size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={toggleTheme} activeOpacity={0.7}>
            <Eye size={19} color={colors.accent} />
          </TouchableOpacity>

          <View style={[styles.avatarBadge, { backgroundColor: colors.cardGlow, borderColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{getInitials()}</Text>
          </View>

          <TouchableOpacity style={styles.actionIconBtn} onPress={onLogout} activeOpacity={0.7}>
            <LogOut size={19} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
