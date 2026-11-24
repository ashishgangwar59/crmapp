import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Linking,
  Alert,
  Modal,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  Target,
  ShieldCheck,
  TrendingUp,
  KeyRound,
  User as UserIcon,
  Briefcase,
  Wallet,
  BarChart2,
  Landmark,
  Sun,
  Moon,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calculator,
  CalendarCheck,
  FileText,
  MessageCircle,
  ChevronRight,
  X,
  LogIn,
} from 'lucide-react-native';
import { useAuthStore } from '../services/authStore';
import { lightColors, darkColors } from '../theme/colors';
import { useHomeContent, HomeIcon } from '../services/homeContent';
import { InterestCalculator } from '../components/InterestCalculator';

type Palette = typeof lightColors;

const GOLD = '#D6AF37';
const HERO_BG = '#0C1C3D';
const LOGO = require('../../assets/icon.png');

const ICONS: Record<HomeIcon, any> = {
  building: Building2,
  target: Target,
  shield: ShieldCheck,
  trending: TrendingUp,
  key: KeyRound,
  user: UserIcon,
  briefcase: Briefcase,
  wallet: Wallet,
  chart: BarChart2,
  landmark: Landmark,
};

// Rotating tints for card icons so the list doesn't look flat.
const TINTS = ['#3B82F6', '#10B981', '#D6AF37', '#8B5CF6', '#F97316'];

const openUrl = (url: string, fallbackMsg: string) => {
  if (!url) return Alert.alert('Not available', fallbackMsg);
  const full = /^(https?:|mailto:|tel:|geo:)/i.test(url) ? url : `https://${url}`;
  Linking.openURL(full).catch(() => Alert.alert('Unable to open', full));
};

export const AboutCompanyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const themeMode = useAuthStore((s) => s.themeMode);
  const setThemeMode = useAuthStore((s) => s.setThemeMode);
  const scheme = useColorScheme();
  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  const c = isDark ? darkColors : lightColors;
  const s = useMemo(() => makeStyles(c, isDark), [isDark]);

  const { data, refreshing, refresh } = useHomeContent();
  const { company, content } = data;

  const [tab, setTab] = useState(0);
  const [calcOpen, setCalcOpen] = useState(false);
  const section = content.sections[Math.min(tab, Math.max(0, content.sections.length - 1))];

  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const logoSource = /^https?:\/\//i.test(company.logoUrl) ? { uri: company.logoUrl } : LOGO;

  const openProfile = () => {
    if (content.profilePdfUrl) return openUrl(content.profilePdfUrl, '');
    if (Platform.OS === 'web') {
      try {
        const link = document.createElement('a');
        link.href = require('../../assets/profile.pdf');
        link.download = 'Niventra_Capital_Advisory_Company_Profile.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch {}
    }
    openUrl(company.website, 'The company profile is not available yet.');
  };

  const actions = [
    { label: 'Invest', icon: TrendingUp, tint: GOLD, onPress: () => navigation.navigate('InvestorRegister') },
    { label: 'Consult', icon: CalendarCheck, tint: '#10B981', onPress: () => openUrl(content.consultUrl, 'Booking link not set.') },
    { label: 'Calculator', icon: Calculator, tint: '#3B82F6', onPress: () => setCalcOpen(true) },
    { label: 'Brochure', icon: FileText, tint: '#8B5CF6', onPress: openProfile },
  ];

  const contactRows = [
    company.address && { icon: MapPin, text: company.address, onPress: () => openUrl(`https://maps.google.com/?q=${encodeURIComponent(company.address)}`, '') },
    company.phone && { icon: Phone, text: company.phone, onPress: () => openUrl(`tel:${company.phone.replace(/\s/g, '')}`, '') },
    company.email && { icon: Mail, text: company.email, onPress: () => openUrl(`mailto:${company.email}`, '') },
    company.website && { icon: Globe, text: company.website.replace(/^https?:\/\//, ''), onPress: () => openUrl(company.website, '') },
  ].filter(Boolean) as { icon: any; text: string; onPress: () => void }[];

  return (
    <View style={[s.screen, { paddingTop: topGap }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* App bar */}
      <View style={s.appBar}>
        <View style={s.logoTile}>
          <Image source={logoSource} style={s.logo} resizeMode="contain" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.brand}>Niventra</Text>
          <Text style={s.brandSub}>Capital Advisory</Text>
        </View>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={20} color={GOLD} /> : <Moon size={20} color={c.accent} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={GOLD} colors={[GOLD]} />}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroGlow} />
          {!!content.heroBadge && (
            <View style={s.badge}>
              <ShieldCheck size={13} color={GOLD} />
              <Text style={s.badgeText}>{content.heroBadge}</Text>
            </View>
          )}
          <Text style={s.heroTitle}>{content.heroTitle}</Text>
          {!!content.heroSubtitle && <Text style={s.heroSubtitle}>{content.heroSubtitle}</Text>}
          {!!content.heroTagline && <Text style={s.heroTagline}>{content.heroTagline}</Text>}
          {!!content.heroDescription && <Text style={s.heroDesc}>{content.heroDescription}</Text>}
          <View style={s.heroBtns}>
            <TouchableOpacity style={s.heroPrimary} onPress={() => navigation.navigate('InvestorRegister')}>
              <Text style={s.heroPrimaryText}>Start Investing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.heroSecondary} onPress={() => openUrl(content.contactUrl, 'Contact link not set.')}>
              <MessageCircle size={16} color="#fff" />
              <Text style={s.heroSecondaryText}>Talk to Expert</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Highlights */}
        {content.highlights.length > 0 && (
          <View style={s.statsGrid}>
            {content.highlights.map((h, i) => (
              <View key={i} style={s.statCard}>
                <Text style={[s.statValue, { color: i % 2 === 0 ? (isDark ? GOLD : c.accent) : c.success }]} numberOfLines={1}>
                  {h.value}
                </Text>
                <Text style={s.statLabel} numberOfLines={2}>{h.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick actions */}
        <View style={s.actions}>
          {actions.map((a) => (
            <TouchableOpacity key={a.label} style={s.action} onPress={a.onPress} activeOpacity={0.7}>
              <View style={[s.actionIcon, { backgroundColor: a.tint + (isDark ? '26' : '1A') }]}>
                <a.icon size={22} color={a.tint} />
              </View>
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sections */}
        {content.sections.length > 0 && (
          <>
            <Text style={s.sectionHeading}>Explore</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
              {content.sections.map((sec, i) => {
                const active = i === tab;
                return (
                  <TouchableOpacity key={i} style={[s.tab, active && s.tabActive]} onPress={() => setTab(i)}>
                    <Text style={[s.tabText, active && s.tabTextActive]}>{sec.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={s.list}>
              {section?.cards.map((card, i) => {
                const Icon = ICONS[card.icon] || Building2;
                const tint = TINTS[i % TINTS.length];
                return (
                  <View key={i} style={[s.listItem, i > 0 && s.listDivider]}>
                    <View style={[s.listIcon, { backgroundColor: tint + (isDark ? '26' : '1A') }]}>
                      <Icon size={20} color={tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listTitle}>{card.title}</Text>
                      {!!card.description && <Text style={s.listDesc}>{card.description}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Contact */}
        {contactRows.length > 0 && (
          <>
            <Text style={s.sectionHeading}>Contact us</Text>
            <View style={s.list}>
              {contactRows.map((row, i) => (
                <TouchableOpacity key={i} style={[s.contactRow, i > 0 && s.listDivider]} onPress={row.onPress} activeOpacity={0.6}>
                  <row.icon size={18} color={c.textMuted} />
                  <Text style={s.contactText}>{row.text}</Text>
                  <ChevronRight size={16} color={c.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={s.footer}>
          <ShieldCheck size={14} color={c.success} />
          <Text style={s.footerText}>
            {company.name || 'Niventra Capital Advisory'}
            {content.footerNote ? ` · ${content.footerNote}` : ''}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={s.signIn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <LogIn size={18} color="#fff" />
          <Text style={s.signInText}>Sign In to Portal</Text>
        </TouchableOpacity>
      </View>

      {/* Calculator sheet */}
      <Modal visible={calcOpen} animationType="slide" onRequestClose={() => setCalcOpen(false)}>
        <View style={[s.screen, { paddingTop: topGap }]}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Interest Calculator</Text>
            <TouchableOpacity style={s.iconBtn} onPress={() => setCalcOpen(false)} accessibilityLabel="Close calculator">
              <X size={20} color={c.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <InterestCalculator c={c} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (c: Palette, isDark: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },

    appBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    // White tile in both themes: the logo's dark blue is unreadable on a dark background.
    logoTile: {
      width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: isDark ? 0 : 1, borderColor: c.border,
      shadowColor: '#000', shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    logo: { width: 34, height: 30 },
    brand: { fontSize: 19, fontWeight: '800', color: c.text, letterSpacing: 0.3 },
    brandSub: { fontSize: 12, fontWeight: '600', color: isDark ? GOLD : c.textMuted, marginTop: 1 },
    iconBtn: {
      width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    },

    hero: { backgroundColor: HERO_BG, borderRadius: 24, padding: 20, overflow: 'hidden', marginTop: 4 },
    heroGlow: {
      position: 'absolute', width: 240, height: 240, borderRadius: 120, right: -90, top: -110,
      borderWidth: 28, borderColor: 'rgba(214,175,55,0.10)',
    },
    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
      backgroundColor: 'rgba(214,175,55,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 14,
    },
    badgeText: { color: GOLD, fontSize: 12, fontWeight: '700' },
    heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32 },
    heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600', marginTop: 2 },
    heroTagline: { color: GOLD, fontSize: 15, fontWeight: '700', marginTop: 14 },
    heroDesc: { color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 21, marginTop: 6 },
    heroBtns: { flexDirection: 'row', gap: 10, marginTop: 18 },
    heroPrimary: { flex: 1, backgroundColor: GOLD, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
    heroPrimaryText: { color: HERO_BG, fontWeight: '800', fontSize: 14 },
    heroSecondary: {
      flex: 1, flexDirection: 'row', gap: 6, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    heroSecondaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
    statCard: {
      flexGrow: 1, flexBasis: '45%', backgroundColor: c.surface, borderRadius: 16, padding: 14,
      borderWidth: 1, borderColor: c.border,
    },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 12, color: c.textMuted, marginTop: 2, fontWeight: '500' },

    actions: {
      flexDirection: 'row', justifyContent: 'space-between', backgroundColor: c.surface,
      borderRadius: 18, borderWidth: 1, borderColor: c.border, paddingVertical: 14, paddingHorizontal: 8, marginTop: 14,
    },
    action: { flex: 1, alignItems: 'center' },
    actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    actionLabel: { fontSize: 12, fontWeight: '600', color: c.text },

    sectionHeading: { fontSize: 18, fontWeight: '800', color: c.text, marginTop: 24, marginBottom: 12 },
    tabs: { gap: 8, paddingBottom: 12 },
    tab: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    },
    tabActive: { backgroundColor: isDark ? GOLD : c.accent, borderColor: isDark ? GOLD : c.accent },
    tabText: { fontSize: 14, fontWeight: '600', color: c.textMuted },
    tabTextActive: { color: isDark ? HERO_BG : '#fff' },

    list: { backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    listItem: { flexDirection: 'row', gap: 14, padding: 16 },
    listDivider: { borderTopWidth: 1, borderTopColor: c.border },
    listIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    listTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 4 },
    listDesc: { fontSize: 13, lineHeight: 19, color: c.textMuted },

    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
    contactText: { flex: 1, fontSize: 14, color: c.text, lineHeight: 20 },

    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
    footerText: { fontSize: 12, color: c.textMuted, textAlign: 'center', flexShrink: 1 },

    bottomBar: {
      position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12,
      backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.border,
    },
    signIn: {
      flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
      backgroundColor: c.accent, borderRadius: 14, paddingVertical: 15,
    },
    signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    sheetHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border,
    },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: c.text },
  });
