import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, Clock, Wallet, Users, Target, User as UserIcon, Menu } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuthStore } from '../services/authStore';

interface NativeBottomBarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenMenu: () => void;
}

export const NativeBottomBar: React.FC<NativeBottomBarProps> = ({
  activeSection,
  setActiveSection,
  onOpenMenu,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const userRole = (user?.role || 'Employee').toUpperCase();

  const isInvestor = userRole === 'INVESTOR';
  const isAdmin = userRole === 'KEYADMIN' || userRole === 'KEY_ADMIN' || userRole === 'ADMIN';

  // Build role-based primary tabs
  const tabs = [
    {
      id: 'home',
      name: isInvestor ? 'Investor Details' : 'Overview',
      label: 'Home',
      icon: LayoutGrid,
    },
    {
      id: 'secondary',
      name: isInvestor ? 'Debenture Form' : isAdmin ? 'Investors' : 'Attendance',
      label: isInvestor ? 'Debenture' : isAdmin ? 'Investors' : 'Punch',
      icon: isInvestor ? Wallet : isAdmin ? Users : Clock,
    },
    {
      id: 'leads',
      name: isAdmin ? 'Leads' : 'Leave',
      label: isAdmin ? 'Leads' : 'Leave',
      icon: isAdmin ? Target : Clock,
    },
    {
      id: 'menu',
      name: 'Menu',
      label: 'Menu',
      icon: Menu,
      isMenuTrigger: true,
    },
    {
      id: 'profile',
      name: 'Profile',
      label: 'Profile',
      icon: UserIcon,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.s),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive =
          activeSection === tab.name ||
          (tab.name === 'Overview' && activeSection === 'Overview') ||
          (tab.name === 'Debenture Form' && (activeSection === 'Debenture Form' || activeSection === 'Debenture'));

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabBtn}
            activeOpacity={0.7}
            onPress={() => {
              if (tab.isMenuTrigger) {
                onOpenMenu();
              } else {
                setActiveSection(tab.name);
              }
            }}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && { backgroundColor: colors.cardGlow },
              ]}
            >
              <IconComponent
                size={20}
                color={isActive ? colors.accent : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.accent : colors.textMuted },
                isActive && { fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
