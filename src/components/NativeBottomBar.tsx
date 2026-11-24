import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, Clock, Wallet, Users, Target, User as UserIcon, Menu, CalendarDays } from 'lucide-react-native';
import { useAppTheme, GOLD, BRAND_NAVY } from './DashboardUI';
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
  const { c, isDark, accent } = useAppTheme();
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
      icon: isAdmin ? Target : CalendarDays,
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

  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        flexDirection: 'row', paddingTop: 8, paddingBottom: bottomPad, paddingHorizontal: 6,
        backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 12, elevation: 12,
      }}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive =
          activeSection === tab.name ||
          (tab.name === 'Debenture Form' && (activeSection === 'Debenture Form' || activeSection === 'Debenture'));

        return (
          <TouchableOpacity
            key={tab.id}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => {
              if (tab.isMenuTrigger) {
                onOpenMenu();
              } else {
                setActiveSection(tab.name);
              }
            }}
          >
            <View
              style={{
                width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 3,
                backgroundColor: isActive ? (isDark ? 'rgba(214,175,55,0.18)' : 'rgba(19,64,134,0.10)') : 'transparent',
              }}
            >
              <IconComponent size={20} color={isActive ? accent : c.textMuted} strokeWidth={isActive ? 2.4 : 2} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: isActive ? '700' : '500', color: isActive ? (isDark ? GOLD : BRAND_NAVY) : c.textMuted }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
