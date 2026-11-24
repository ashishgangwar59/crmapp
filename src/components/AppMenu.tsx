import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Animated, Easing, Image, Platform, StatusBar,
  useWindowDimensions, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  LayoutGrid, Landmark, Target, FileText, Wallet, Users, Clock, CalendarDays, Calendar, IndianRupee,
  BarChart2, Bell, Settings, User as UserIcon, ChevronRight, X, LogOut, Moon, Sun,
} from 'lucide-react-native';
import { useAuthStore } from '../services/authStore';
import { useAppTheme, Palette, GOLD, BRAND_NAVY, SearchBox } from './DashboardUI';

const LOGO = require('../../assets/icon.png');

type MenuItem = { name: string; desc: string; icon: any; tint: string; roles: string[] };
type MenuGroup = { title: string; items: MenuItem[] };

// Same items and role rules as the old sidebar; grouped for the mobile menu.
const GROUPS: MenuGroup[] = [
  {
    title: 'Home',
    items: [
      { name: 'Overview', desc: 'Dashboard & key numbers', icon: LayoutGrid, tint: '#3B82F6', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Investor Details', desc: 'My investments & KYC', icon: LayoutGrid, tint: '#3B82F6', roles: ['INVESTOR'] },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Investors', desc: 'Accounts, KYC & bonds', icon: Landmark, tint: GOLD, roles: ['ADMIN', 'KEY_ADMIN'] },
      { name: 'Leads', desc: 'Sales pipeline', icon: Target, tint: '#8B5CF6', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Debenture Form', desc: 'Application & KYC form', icon: FileText, tint: '#14B8A6', roles: ['ADMIN', 'KEY_ADMIN', 'Employee', 'INVESTOR'] },
      { name: 'Wallet', desc: 'Company funds & ledger', icon: Wallet, tint: '#10B981', roles: ['ADMIN', 'KEY_ADMIN'] },
    ],
  },
  {
    title: 'People',
    items: [
      { name: 'Employees', desc: 'Directory & roles', icon: Users, tint: '#3B82F6', roles: ['ADMIN', 'KEY_ADMIN'] },
      { name: 'Attendance', desc: 'Punches & timesheets', icon: Clock, tint: '#10B981', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Leave', desc: 'Requests & balance', icon: CalendarDays, tint: '#F59E0B', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Holidays', desc: 'Holiday calendar', icon: Calendar, tint: '#EC4899', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Payroll', desc: 'Salaries & payslips', icon: IndianRupee, tint: '#8B5CF6', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
    ],
  },
  {
    title: 'Insights',
    items: [
      { name: 'Reports', desc: 'Analytics & export', icon: BarChart2, tint: '#F97316', roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
      { name: 'Notifications', desc: 'Email, SMS & push logs', icon: Bell, tint: '#EF4444', roles: ['ADMIN', 'KEY_ADMIN'] },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', desc: 'Your details & password', icon: UserIcon, tint: '#64748B', roles: ['Employee', 'INVESTOR'] },
      { name: 'Settings', desc: 'Master settings', icon: Settings, tint: '#64748B', roles: ['ADMIN', 'KEY_ADMIN'] },
    ],
  },
];

const DEFAULT_EMPLOYEE_TABS = ['Attendance', 'Leads', 'Reports', 'Profile', 'Holidays', 'Leave', 'Debenture Form', 'Overview'];

/** Which menu items this user may open (unchanged logic from the old sidebar). */
function canSee(item: MenuItem, user: any) {
  const role = String(user?.role || 'Employee');
  const roleKey = role.toUpperCase().replace(/_/g, '');
  if (roleKey === 'INVESTOR') return item.roles.includes('INVESTOR');
  if (roleKey === 'KEYADMIN' || roleKey === 'ADMIN') return !item.roles.every((r) => r === 'INVESTOR');
  if (item.roles.length === 1 && item.roles[0] === 'INVESTOR') return false;

  const raw = user?.moduleAccess || user?.accessibleTabs || user?.permissions || user?.allowedModules;
  const access: string[] = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_EMPLOYEE_TABS;
  if (item.name === 'Overview' || item.name === 'Profile' || item.name === 'Debenture Form') return true;
  const clean = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  return access.some((m) => {
    const a = clean(m), b = clean(item.name);
    return a === b || a.includes(b) || b.includes(a);
  });
}

function displayName(user: any) {
  const n = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || '';
  return n || String(user?.email || 'User').split('@')[0];
}

function roleLabel(role?: string) {
  const r = String(role || 'Employee').toUpperCase().replace(/_/g, '');
  return r === 'KEYADMIN' ? 'Key Admin' : r === 'ADMIN' ? 'Admin' : r === 'INVESTOR' ? 'Investor' : r === 'MANAGER' ? 'Manager' : 'Employee';
}

/** The menu body: profile header, search, grouped items, theme switch, logout. */
export function MenuContent({
  activeSection,
  onSelect,
  onLogout,
  onClose,
}: {
  activeSection: string;
  onSelect: (name: string) => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { c, isDark, accent } = useAppTheme();
  const user = useAuthStore((s) => s.user) as any;
  const setThemeMode = useAuthStore((s) => s.setThemeMode);
  const [query, setQuery] = useState('');
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => canSee(it, user) && (!q || `${it.name} ${it.desc}`.toLowerCase().includes(q))),
    })).filter((g) => g.items.length > 0);
  }, [user, query]);

  const name = displayName(user);
  const initials = name.split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
  const hasProfile = groups.some((g) => g.items.some((i) => i.name === 'Profile')) || !query;
  const version = Constants.expoConfig?.version || '1.0.0';

  const confirmLogout = () => {
    if (Platform.OS === 'web') return onLogout();
    Alert.alert('Log out', 'Do you want to log out of Niventra Capital?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      {/* Brand + profile header */}
      <View style={{ backgroundColor: BRAND_NAVY, paddingTop: topGap + 12, paddingHorizontal: 18, paddingBottom: 20, overflow: 'hidden', borderBottomRightRadius: onClose ? 0 : 24, borderBottomLeftRadius: onClose ? 0 : 24 }}>
        <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -80, top: -70, borderWidth: 24, borderColor: 'rgba(214,175,55,0.10)' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={LOGO} style={{ width: 28, height: 25 }} resizeMode="contain" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Niventra</Text>
            <Text style={{ color: GOLD, fontSize: 11, fontWeight: '600' }}>Capital Advisory</Text>
          </View>
          {onClose ? (
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close menu" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)' }}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!hasProfile}
          onPress={() => onSelect('Profile')}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: GOLD, backgroundColor: 'rgba(214,175,55,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: GOLD, fontWeight: '800', fontSize: 17 }}>{initials || 'U'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{name}</Text>
            {user?.email ? <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 }} numberOfLines={1}>{user.email}</Text> : null}
            <View style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: 'rgba(214,175,55,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: GOLD, fontSize: 11, fontWeight: '700' }}>{roleLabel(user?.role)}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 16) + 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SearchBox c={c} value={query} onChange={setQuery} placeholder="Search menu" />

        {groups.length === 0 ? (
          <Text style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, paddingVertical: 20 }}>No menu item matches "{query}".</Text>
        ) : (
          groups.map((g) => (
            <View key={g.title} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>{g.title.toUpperCase()}</Text>
              <View style={{ backgroundColor: c.background, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                {g.items.map((it, i) => (
                  <MenuRow key={it.name} c={c} isDark={isDark} accent={accent} item={it} first={i === 0} active={activeSection === it.name} onPress={() => onSelect(it.name)} />
                ))}
              </View>
            </View>
          ))
        )}

        {/* Preferences */}
        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>PREFERENCES</Text>
        <View style={{ backgroundColor: c.background, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(214,175,55,0.16)' : 'rgba(19,64,134,0.10)' }}>
              {isDark ? <Moon size={18} color={GOLD} /> : <Sun size={18} color={c.accent} />}
            </View>
            <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: c.text }}>Dark mode</Text>
            <Switch
              value={isDark}
              onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
              trackColor={{ false: c.border, true: GOLD }}
              thumbColor="#fff"
              {...({ activeThumbColor: '#fff' } as any)}
              accessibilityLabel="Dark mode"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={confirmLogout}
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 15 }}>Log out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: c.textMuted, fontSize: 11, marginTop: 14 }}>Niventra Capital Advisory · Version {version}</Text>
      </ScrollView>
    </View>
  );
}

function MenuRow({ c, isDark, accent, item, first, active, onPress }: { c: Palette; isDark: boolean; accent: string; item: MenuItem; first: boolean; active: boolean; onPress: () => void }) {
  const Icon = item.icon;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
        borderTopWidth: first ? 0 : 1, borderTopColor: c.border,
        backgroundColor: active ? (isDark ? 'rgba(214,175,55,0.10)' : 'rgba(19,64,134,0.06)') : 'transparent',
      }}
    >
      {active ? <View style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2, backgroundColor: accent }} /> : null}
      <View style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: item.tint + (isDark ? '26' : '18') }}>
        <Icon size={18} color={item.tint} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: active ? '800' : '600', color: active ? (isDark ? GOLD : c.accent) : c.text }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{item.desc}</Text>
      </View>
      <ChevronRight size={16} color={active ? accent : c.textMuted} />
    </TouchableOpacity>
  );
}

/** Slide-in drawer from the left, with a dimmed backdrop. */
export function AppMenuDrawer({
  visible,
  activeSection,
  onSelect,
  onLogout,
  onClose,
}: {
  visible: boolean;
  activeSection: string;
  onSelect: (name: string) => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(360, Math.round(width * 0.88));
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
    } else if (mounted) {
      Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(2,6,23,0.55)', opacity: anim }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>
        <Animated.View
          style={{
            width: drawerWidth, height: '100%', borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden',
            shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 4, height: 0 }, elevation: 16,
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-drawerWidth, 0] }) }],
          }}
        >
          <MenuContent activeSection={activeSection} onSelect={onSelect} onLogout={onLogout} onClose={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}
