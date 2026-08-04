import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  Image,
  ActionSheetIOS,
  StatusBar,
  Linking,
  Appearance,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { WebView } from 'react-native-webview';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, setForcedScheme } from '../theme/colors';
import { apiCall, getApiBaseUrl } from '../services/api';
import { useAuthStore } from '../services/authStore';

const createDynamicStyleSheet = <T extends Record<string, any>>(styleBuilder: () => T): T => {
  let lightCache: any = null;
  let darkCache: any = null;

  return new Proxy({}, {
    get(target, prop) {
      const themeMode = useAuthStore.getState().themeMode || 'system';
      const isDark = themeMode === 'system' ? Appearance.getColorScheme() === 'dark' : themeMode === 'dark';
      if (isDark) {
        if (!darkCache) {
          setForcedScheme('dark');
          try {
            darkCache = StyleSheet.create(styleBuilder() as any);
          } finally {
            setForcedScheme(null);
          }
        }
        return darkCache[prop];
      } else {
        if (!lightCache) {
          setForcedScheme('light');
          try {
            lightCache = StyleSheet.create(styleBuilder() as any);
          } finally {
            setForcedScheme(null);
          }
        }
        return lightCache[prop];
      }
    }
  }) as any;
};

import {
  Users,
  Clock,
  Wallet,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CalendarDays,
  Gift,
  CheckSquare,
  Lock,
  LogOut,
  Menu,
  X,
  Calendar,
  Target,
  BarChart2,
  Bell,
  Settings,
  LayoutGrid,
  Search,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  Phone,
  Briefcase,
  Umbrella,
  Mail,
  MessageSquare,
  Plug,
  Shield,
  RadioTower,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  UploadCloud,
  XCircle,
  Camera,
  Eye,
  EyeOff,
  FileText,
  Printer,
} from 'lucide-react-native';

// Types
type RootStackParamList = {
  AboutCompany: undefined;
  Login: undefined;
  InvestorRegister: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- About Company Screen (Landing Page) ---
const AboutCompanyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const topGap = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 24) : 0;

  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);
  const [activeTab, setActiveTab] = useState<'corporate' | 'investment' | 'services' | 'features'>('corporate');

  const toggleTheme = () => {
    let currentIsDark = false;
    if (themeMode === 'system') {
      currentIsDark = Appearance.getColorScheme() === 'dark';
    } else {
      currentIsDark = themeMode === 'dark';
    }
    setThemeMode(currentIsDark ? 'light' : 'dark');
  };

  const handleCta = (action: string) => {
    switch (action) {
      case 'invest':
        navigation.navigate('Login');
        break;
      case 'consult':
        Linking.openURL('https://niventracapitaladvisory.com/contact/').catch(() => {
          Alert.alert('Book Consultation', 'Please visit our website at https://niventracapitaladvisory.com/contact/ to schedule a consultation.');
        });
        break;
      case 'profile':
        if (Platform.OS === 'web') {
          try {
            const assetUri = require('../../assets/profile.pdf');
            const link = document.createElement('a');
            link.href = assetUri;
            link.download = 'Niventra_Capital_Advisory_Company_Profile.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            Linking.openURL('/assets/profile.pdf').catch(() => {
              Alert.alert('Download Profile', 'Unable to download the PDF. Please check C:/Ashish/Niventra Capital Advisory India Pvt Ltd.pdf');
            });
          }
        } else {
          Linking.openURL('file:///C:/Ashish/Niventra%20Capital%20Advisory%20India%20Pvt%20Ltd.pdf').catch(() => {
            Alert.alert('Download Profile', 'Unable to open PDF. Please copy the profile brochure from C:/Ashish/Niventra Capital Advisory India Pvt Ltd.pdf');
          });
        }
        break;
      case 'talk':
        Linking.openURL('https://niventracapitaladvisory.com/contact/').catch(() => {
          Alert.alert('Contact Expert', 'Please visit our contact page at https://niventracapitaladvisory.com/contact/ to speak with an advisory expert.');
        });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topGap }]}>
      <ScrollView contentContainerStyle={styles.aboutScrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar with Login Action Link */}
        <View style={styles.aboutHeaderBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 35, height: 53, marginRight: 2, borderRadius: 2 }}
              resizeMode="contain"
            />
            <Text style={styles.aboutHeaderLogo}>
              Niventra
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 12, padding: 6 }} onPress={toggleTheme}>
              <Eye size={20} color={colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutHeaderLoginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.aboutHeaderLoginText}>Login to Portal</Text>
              <ArrowUpRight size={16} color={colors.accent} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.aboutHeroCard}>
          <View style={styles.aboutHeroBadge}>
            <Building size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.aboutHeroBadgeText}>Official Enterprise Portal</Text>
          </View>
          <Text style={styles.aboutHeroTitle}>Niventra Capital Advisory</Text>
          <Text style={styles.aboutHeroSubtitle}>India Pvt. Ltd.</Text>
          <Text style={styles.aboutHeroDesc}>
            Smart Investments for a Better Tomorrow{'\n'}
            Build long-term wealth with personalized investment strategies, expert financial guidance, and transparent advisory services. Start your journey towards financial freedom today.
          </Text>
        </View>

        {/* Horizontal Scrollable Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: spacing.m, maxHeight: 48 }}
          contentContainerStyle={{ paddingHorizontal: 2 }}
        >
          <TouchableOpacity
            style={[styles.settingsTabPill, activeTab === 'corporate' && styles.settingsTabPillActive]}
            onPress={() => setActiveTab('corporate')}
          >
            <Text style={[styles.settingsTabText, activeTab === 'corporate' && styles.settingsTabTextActive]}>🏢 Corporate Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsTabPill, activeTab === 'investment' && styles.settingsTabPillActive]}
            onPress={() => setActiveTab('investment')}
          >
            <Text style={[styles.settingsTabText, activeTab === 'investment' && styles.settingsTabTextActive]}>💰 Investment Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsTabPill, activeTab === 'services' && styles.settingsTabPillActive]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.settingsTabText, activeTab === 'services' && styles.settingsTabTextActive]}>💼 Services & Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsTabPill, activeTab === 'features' && styles.settingsTabPillActive]}
            onPress={() => setActiveTab('features')}
          >
            <Text style={[styles.settingsTabText, activeTab === 'features' && styles.settingsTabTextActive]}>🔒 Tech & Security</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Dynamic Service Grid rendering based on activeTab */}
        <Text style={styles.aboutSectionHeading}>
          {activeTab === 'corporate' && 'Corporate & Values'}
          {activeTab === 'investment' && 'Advisory & Investment Benefits'}
          {activeTab === 'services' && 'Ecosystem Services & Flows'}
          {activeTab === 'features' && 'Compliance, App & Tech Features'}
        </Text>

        <View style={styles.aboutServicesGrid}>
          {activeTab === 'corporate' && (
            <>
              <View style={styles.aboutServiceCard}>
                <Building size={24} color={colors.info} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Company Overview</Text>
                <Text style={styles.aboutServiceDesc}>Professionally managed Real Estate Investment Advisory Company. Trusted partner for residential & commercial real estate investments with focus on long-term wealth creation & transparent services.</Text>
              </View>

              <View style={styles.aboutServiceCard}>
                <Target size={24} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Vision & Mission</Text>
                <Text style={styles.aboutServiceDesc}>Become one of India's most trusted real estate investment advisory companies. Create sustainable wealth, expand opportunities, maintain transparency, and ensure high standards of ethics and compliance.</Text>
              </View>

              <View style={[styles.aboutServiceCard, { width: '100%' }]}>
                <ShieldCheck size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Core Corporate Values</Text>
                <Text style={styles.aboutServiceDesc}>• Transparency & Trust{"\n"}• Integrity & Accountability{"\n"}• Professionalism & Customer First{"\n"}• Innovation & Long-Term Relationships</Text>
              </View>
            </>
          )}

          {activeTab === 'investment' && (
            <>
              <View style={styles.aboutServiceCard}>
                <TrendingUp size={24} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Investment Benefits</Text>
                <Text style={styles.aboutServiceDesc}>Attractive investment opportunities, capital appreciation, regular rental income potential, wealth preservation, passive income generation, and long-term value creation.</Text>
              </View>


              <View style={styles.aboutServiceCard}>
                <KeyRound size={24} color={colors.warning} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Why Invest in PPF</Text>
                <Text style={styles.aboutServiceDesc}>Invest in PPF with attractive interest rates and secure returns.</Text>
              </View>

              <View style={styles.aboutServiceCard}>
                <KeyRound size={24} color={colors.warning} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Why Invest in Debentures</Text>
                <Text style={styles.aboutServiceDesc}>Build long-term wealth with professionally managed investment strategies designed for sustainable growth.</Text>
              </View>

              <View style={styles.aboutServiceCard}>
                <KeyRound size={24} color={colors.warning} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Why Invest in Real Estate</Text>
                <Text style={styles.aboutServiceDesc}>Tangible asset class offering robust inflation hedge, portfolio diversification, strong capital appreciation, and reliable long-term financial security.</Text>
              </View>


              <View style={[styles.aboutServiceCard, { width: '100%' }]}>
                <UserIcon size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Who Can Invest</Text>
                <Text style={styles.aboutServiceDesc}>Salaried Professionals, Business Owners, NRIs, HNIs, Family Offices, Corporate Investors, First-Time and Experienced Investors.</Text>
              </View>
            </>
          )}

          {activeTab === 'services' && (
            <>
              <View style={styles.aboutServiceCard}>
                <Briefcase size={24} color={colors.info} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Our Key Services</Text>
                <Text style={styles.aboutServiceDesc}>Residential & Commercial property investments, Office Spaces, Retail Shops, Luxury Apartments, Business Parks, Portfolio Advisory & Exit Strategies.</Text>
              </View>

              <View style={styles.aboutServiceCard}>
                <Target size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Investment Process</Text>
                <Text style={styles.aboutServiceDesc}>Investor Registration → Digital KYC Verification → Transparent Documentation → Agreement Execution → Investment Confirmation → Dedicated RM Updates.</Text>
              </View>

              <View style={[styles.aboutServiceCard, { width: '100%' }]}>
                <ShieldCheck size={24} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Due Diligence Process</Text>
                <Text style={styles.aboutServiceDesc}>Rigorous market research, legal & title verification, financial analysis, technical feasibility assessments, documentation reviews, and continuous project monitoring.</Text>
              </View>
            </>
          )}

          {activeTab === 'features' && (
            <>
              <View style={styles.aboutServiceCard}>
                <ShieldCheck size={24} color={colors.warning} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Security & Compliance</Text>
                <Text style={styles.aboutServiceDesc}>Complete regulatory compliance, transparent transaction records, secure data handling, and strict confidentiality of investor info.</Text>
              </View>

              <View style={styles.aboutServiceCard}>
                <KeyRound size={24} color={colors.info} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Digital Platform Features</Text>
                <Text style={styles.aboutServiceDesc}>Digital KYC, browse verified opportunities, dynamic investment calculator, portfolio dashboard, payment tracking, property listings, & live support.</Text>
              </View>

              <View style={[styles.aboutServiceCard, { width: '100%' }]}>
                <UserIcon size={24} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.aboutServiceTitle}>Investor Benefits</Text>
                <Text style={styles.aboutServiceDesc}>Verified opportunities, complete legal due diligence, dedicated Relationship Managers, personalized investment planning, regular updates, and end-to-end support.</Text>
              </View>
            </>
          )}
        </View>

        {/* Call to Action Grid */}
        <Text style={styles.aboutSectionHeading}>Advisory Actions</Text>
        <View style={styles.aboutServicesGrid}>
          <TouchableOpacity style={[styles.aboutServiceCard, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={() => handleCta('invest')}>
            <TrendingUp size={20} color={colors.background} style={{ marginBottom: 6 }} />
            <Text style={[styles.aboutServiceTitle, { color: colors.background }]}>Start Investing Today</Text>
            <Text style={[styles.aboutServiceDesc, { color: 'rgba(255,255,255,0.75)' }]}>Sign up or log in to secure your debentures.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutServiceCard} onPress={() => handleCta('consult')}>
            <Briefcase size={20} color={colors.success} style={{ marginBottom: 6 }} />
            <Text style={styles.aboutServiceTitle}>Book Consultation</Text>
            <Text style={styles.aboutServiceDesc}>Schedule a free session with our real estate expert.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutServiceCard} onPress={() => handleCta('profile')}>
            <Download size={20} color={colors.info} style={{ marginBottom: 6 }} />
            <Text style={styles.aboutServiceTitle}>Download Profile</Text>
            <Text style={styles.aboutServiceDesc}>Get Niventra Capital corporate profile brochure.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutServiceCard} onPress={() => handleCta('talk')}>
            <Mail size={20} color={colors.warning} style={{ marginBottom: 6 }} />
            <Text style={styles.aboutServiceTitle}>Talk to an Expert</Text>
            <Text style={styles.aboutServiceDesc}>Direct connect with our Investment Advisory team.</Text>
          </TouchableOpacity>
        </View>

        {/* Company Contact Details Card */}
        <View style={styles.aboutContactCard}>
          <Text style={styles.aboutContactTitle}>Company Information</Text>
          <View style={styles.aboutContactRow}>
            <Building size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={styles.aboutContactText}>A-91, Block A Gali No. 2, Sewak Park Near Dwarka Mor Metro Station, Gate No. 2 Dwarka Mor New Delhi – 110059 Delhi, India</Text>
          </View>
          <View style={styles.aboutContactRow}>
            <Mail size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={styles.aboutContactText}>Contact: info@niventracapitaladvisory.com</Text>
          </View>
          <View style={styles.aboutContactRow}>
            <ShieldCheck size={16} color={colors.success} style={{ marginRight: 8 }} />
            <Text style={styles.aboutContactText}>Secured Enterprise Infrastructure v1.0.4</Text>
          </View>
        </View>

        {/* Bottom Login Button */}
        <TouchableOpacity
          style={styles.aboutCtaBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.aboutCtaBtnText}>Sign In to Portal</Text>
          <ArrowUpRight size={18} color={colors.background} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Login Screen ---
const LoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Password login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP login states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSendOtp = async () => {
    if (!phone) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setDebugOtp('');
    try {
      const response = await apiCall('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (response.success && response.data) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'OTP has been sent to your mobile number.');
        if (response.data.debugOtp) {
          setDebugOtp(response.data.debugOtp);
        }
      } else {
        setErrorMsg(response.error || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loginMethod === 'otp') {
      if (!phone || !otp) {
        setErrorMsg('Please enter both mobile number and OTP.');
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const response = await apiCall('/api/auth/login-otp', {
          method: 'POST',
          body: JSON.stringify({
            phone: phone.trim(),
            otp: otp.trim(),
            rememberMe,
            deviceInfo: `${Platform.OS} ${Platform.Version || ''}`.trim(),
          }),
        });

        if (response.success && response.data) {
          const { user, token, accessToken } = response.data;
          const actualToken = token || accessToken || 'valid-session-token';
          setAuth(user, actualToken);
        } else {
          setErrorMsg(response.error || 'Invalid OTP or login failed.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const response = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
            rememberMe,
            deviceInfo: `${Platform.OS} ${Platform.Version || ''}`.trim(),
          }),
        });

        if (response.success && response.data) {
          const { user, token, accessToken } = response.data;
          const actualToken = token || accessToken || 'valid-session-token';
          setAuth(user, actualToken);
        } else {
          setErrorMsg(response.error || 'Invalid credentials or login failed.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
  };

  const topGap = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 24) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topGap, backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        {/* Navigation link back to About Company */}
        <TouchableOpacity
          style={styles.loginBackToAboutBtn}
          onPress={() => navigation.navigate('AboutCompany')}
        >
          <ArrowLeft size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={styles.loginBackToAboutText}>About Niventra Capital</Text>
        </TouchableOpacity>

        {/* Card Container matching Screenshot */}
        <View style={loginStyles.cardContainer}>
          {/* Logo Emblem */}
          <View style={loginStyles.logoBadgeWrapper}>
            <View style={loginStyles.logoBadgeCircle}>
              <Text style={loginStyles.logoTextNC}>NC</Text>
              <TrendingUp size={14} color={colors.textGold} style={loginStyles.logoArrow} />
            </View>
          </View>

          {/* Heading & Subtitle */}
          <Text style={loginStyles.welcomeTitle}>Welcome back</Text>
          <Text style={loginStyles.welcomeSubtitle}>
            Choose your login method and access your account.
          </Text>

          {errorMsg ? (
            <View style={loginStyles.errorBox}>
              <Text style={loginStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Toggle Login Method Tabs */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingBottom: 10,
                alignItems: 'center',
                borderBottomWidth: loginMethod === 'password' ? 2 : 0,
                borderColor: colors.accent,
              }}
              onPress={() => {
                setLoginMethod('password');
                setErrorMsg('');
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: loginMethod === 'password' ? colors.accent : colors.textMuted }}>
                Password Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingBottom: 10,
                alignItems: 'center',
                borderBottomWidth: loginMethod === 'otp' ? 2 : 0,
                borderColor: colors.accent,
              }}
              onPress={() => {
                setLoginMethod('otp');
                setErrorMsg('');
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: loginMethod === 'otp' ? colors.accent : colors.textMuted }}>
                OTP Login
              </Text>
            </TouchableOpacity>
          </View>

          {loginMethod === 'password' ? (
            <>
              {/* Email Field */}
              <View style={loginStyles.fieldGroup}>
                <Text style={loginStyles.fieldLabel}>Email</Text>
                <View style={loginStyles.inputContainer}>
                  <TextInput
                    style={loginStyles.textInput}
                    placeholder="keyadmin@gmail.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Field with Eye Icon */}
              <View style={loginStyles.fieldGroup}>
                <View style={loginStyles.passwordLabelRow}>
                  <Text style={loginStyles.fieldLabel}>Password</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Please contact system administrator to reset your password.')}>
                    <Text style={loginStyles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={loginStyles.inputContainer}>
                  <TextInput
                    style={[loginStyles.textInput, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={loginStyles.eyeIconButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textMuted} />
                    ) : (
                      <Eye size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Phone Field */}
              <View style={loginStyles.fieldGroup}>
                <Text style={loginStyles.fieldLabel}>Mobile Number</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={[loginStyles.inputContainer, { flex: 1 }]}>
                    <TextInput
                      style={loginStyles.textInput}
                      placeholder="+919876543210"
                      placeholderTextColor={colors.textMuted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={handleSendOtp}
                    disabled={loading || !phone}
                  >
                    <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 12 }}>
                      {otpSent ? 'Resend' : 'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Debug OTP Banner */}
              {debugOtp ? (
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
                  <Text style={{ color: colors.info, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}>
                    DEBUG OTP: <Text style={{ fontWeight: 'bold' }}>{debugOtp}</Text>
                  </Text>
                </View>
              ) : null}

              {/* OTP Code Field */}
              {otpSent ? (
                <View style={loginStyles.fieldGroup}>
                  <Text style={loginStyles.fieldLabel}>Enter 6-Digit OTP</Text>
                  <View style={loginStyles.inputContainer}>
                    <TextInput
                      style={loginStyles.textInput}
                      placeholder="123456"
                      placeholderTextColor={colors.textMuted}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoCapitalize="none"
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                    />
                  </View>
                </View>
              ) : null}
            </>
          )}

          {/* Remember Me Checkbox */}
          <TouchableOpacity
            style={loginStyles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[loginStyles.checkboxSquare, rememberMe && loginStyles.checkboxChecked]}>
              {rememberMe && <Text style={loginStyles.checkmarkText}>✓</Text>}
            </View>
            <Text style={loginStyles.checkboxLabel}>Remember me for 7 days</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[loginStyles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading || (loginMethod === 'otp' && !otpSent)}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={loginStyles.signInBtnText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={loginStyles.footerContainer}>
            <Text style={loginStyles.footerText}>
              Are you an Investor?{' '}
              <Text style={loginStyles.footerLink} onPress={() => navigation.navigate('InvestorRegister')}>
                Register Investor Account
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Investor Registration Screen ---
const InvestorRegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  // OTP Verification States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');

  const handleSendOtp = async () => {
    if (!phone || !email) {
      setErrorMsg('Please enter Email Address and Phone Number first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setDebugOtp('');
    try {
      const response = await apiCall('/api/auth/otp/send-registration', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
      });

      if (response.success && response.data) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Verification OTP has been sent to your mobile number.');
        if (response.data.debugOtp) {
          setDebugOtp(response.data.debugOtp);
        }
      } else {
        setErrorMsg(response.error || 'Failed to send verification OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!otpSent) {
      setErrorMsg('Please request and verify OTP first.');
      return;
    }

    if (!otp) {
      setErrorMsg('Please enter the verification OTP.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let res: any = await apiCall('/api/investors/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      if (!res.success) {
        res = await apiCall('/api/investors/me', {
          method: 'POST',
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            otp: otp.trim(),
          }),
        });
      }

      if (res.success || res.data) {
        const loginRes = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
            rememberMe: true,
            deviceInfo: `${Platform.OS} ${Platform.Version || ''}`.trim(),
          }),
        });

        if (loginRes.success && loginRes.data) {
          const { user, token, accessToken, role } = loginRes.data;
          const actualToken = token || accessToken || (loginRes.data as any).token || 'valid-session-token';
          setAuth(user || { email: email.trim(), role: 'INVESTOR' }, actualToken);
        } else {
          Alert.alert('Registration Successful', 'Your Investor Account has been created! Please log in.', [
            { text: 'Login Now', onPress: () => navigation.navigate('Login') }
          ]);
        }
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const topGap = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 24) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topGap, backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' }}
          onPress={() => navigation.navigate('Login')}
        >
          <ArrowLeft size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: 'bold' }}>Back to Login</Text>
        </TouchableOpacity>

        <Text style={registerStyles.portalTitle}>INVESTOR PORTAL</Text>
        <Text style={registerStyles.portalSubtitle}>
          Register your Investor Account to submit KYC & Bond Agreement
        </Text>

        <View style={registerStyles.cardContainer}>
          <Text style={registerStyles.formTitle}>Create Investor Account</Text>
          <Text style={registerStyles.formSubtitle}>Fill details to start your investment onboard</Text>

          {errorMsg ? (
            <View style={registerStyles.errorBox}>
              <Text style={registerStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={registerStyles.fieldGroup}>
            <Text style={registerStyles.fieldLabel}>Full Name *</Text>
            <View style={registerStyles.inputContainer}>
              <UserIcon size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={registerStyles.textInput}
                placeholder="John Doe"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={registerStyles.fieldGroup}>
            <Text style={registerStyles.fieldLabel}>Email Address *</Text>
            <View style={registerStyles.inputContainer}>
              <Mail size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={registerStyles.textInput}
                placeholder="keyadmin@gmail.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={registerStyles.fieldGroup}>
            <Text style={registerStyles.fieldLabel}>Phone Number *</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[registerStyles.inputContainer, { flex: 1 }]}>
                <Briefcase size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={registerStyles.textInput}
                  placeholder="+91 9876543210"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleSendOtp}
                disabled={loading || !phone || !email}
              >
                <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 12 }}>
                  {otpSent ? 'Resend' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug OTP Banner */}
          {debugOtp ? (
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.info, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}>
                DEBUG OTP: <Text style={{ fontWeight: 'bold' }}>{debugOtp}</Text>
              </Text>
            </View>
          ) : null}

          {/* OTP Input Field */}
          {otpSent ? (
            <View style={registerStyles.fieldGroup}>
              <Text style={registerStyles.fieldLabel}>Verification OTP Code *</Text>
              <View style={registerStyles.inputContainer}>
                <KeyRound size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={registerStyles.textInput}
                  placeholder="123456"
                  placeholderTextColor={colors.textMuted}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ) : null}

          <View style={registerStyles.fieldGroup}>
            <Text style={registerStyles.fieldLabel}>Password *</Text>
            <View style={registerStyles.inputContainer}>
              <KeyRound size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={registerStyles.textInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={registerStyles.fieldGroup}>
            <Text style={registerStyles.fieldLabel}>Confirm Password *</Text>
            <View style={registerStyles.inputContainer}>
              <KeyRound size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={registerStyles.textInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[registerStyles.submitBtn, (loading || !otpSent) && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading || !otpSent}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={registerStyles.submitBtnText}>Register Investor</Text>
                <ArrowUpRight size={18} color={colors.background} style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={registerStyles.footerContainer}>
            <Text style={registerStyles.footerText}>
              Already have an account?{' '}
              <Text style={registerStyles.footerLink} onPress={() => navigation.navigate('Login')}>
                Login to Portal
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Employees Sub-View ---
const EmployeesView = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); // Empty string for "All Statuses"

  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [resetPassword, setResetPassword] = useState('');

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // STEP 1: Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [correspondenceAddress, setCorrespondenceAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [systemRole, setSystemRole] = useState('Employee');

  // STEP 2: Official Details
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Developer');
  const [workLocation, setWorkLocation] = useState('Noida');
  const [employeeType, setEmployeeType] = useState('Full-Time');
  const [dateOfJoining, setDateOfJoining] = useState('');

  // Date Picker visibility state
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);

  // STEP 3: KYC
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  // STEP 4: Bank & Emergency Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // STEP 5: Permissions & Login credentials
  const [password, setPassword] = useState('');
  const [moduleAccess, setModuleAccess] = useState<string[]>([
    'Overview', 'Attendance', 'Leads', 'Reports', 'Profile'
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = `?search=${encodeURIComponent(search)}${statusFilter ? `&status=${statusFilter}` : ''}`;
      const response = await apiCall(`/api/employees${query}`);
      if (response.success && response.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setEmployees(list);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch employees.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !phone) {
        Alert.alert('Validation Error', 'First Name, Last Name, Email, and Phone are required.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEditClick = (emp: any) => {
    setIsEditMode(true);
    setCurrentStep(1);

    // Pre-fill states
    setFirstName(emp.firstName || '');
    setLastName(emp.lastName || '');
    setEmail(emp.email || '');
    setOfficeEmail(emp.officeEmail || '');
    setPhone(emp.phone || '');
    setCompanyPhone(emp.companyPhone || '');
    setPermanentAddress(emp.permanentAddress || '');
    setCorrespondenceAddress(emp.correspondenceAddress || '');
    setDateOfBirth(emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : '');
    setGender(emp.gender || '');
    setBloodGroup(emp.bloodGroup || '');
    setMaritalStatus(emp.maritalStatus || '');
    setProfilePhotoUrl(emp.profilePhotoUrl || '');
    setSystemRole(emp.systemRole || 'Employee');
    setDepartment(emp.department || 'Engineering');
    setDesignation(emp.designation || 'Developer');
    setWorkLocation(emp.workLocation || 'Noida');
    setEmployeeType(emp.employeeType || 'Full-Time');
    setDateOfJoining(emp.dateOfJoining ? emp.dateOfJoining.substring(0, 10) : '');
    setAadharNumber(emp.kyc?.aadharNumber || '');
    setPanNumber(emp.kyc?.panNumber || '');
    setPassportNumber(emp.kyc?.passportNumber || '');
    setBankName(emp.bankDetails?.bankName || '');
    setAccountNumber(emp.bankDetails?.accountNumber || '');
    setIfscCode(emp.bankDetails?.ifscCode || '');
    setBranchName(emp.bankDetails?.branchName || '');
    setEmergencyName(emp.emergencyContact?.name || '');
    setEmergencyRelation(emp.emergencyContact?.relation || '');
    setEmergencyPhone(emp.emergencyContact?.phone || '');
    setPassword('');
    setModuleAccess(emp.moduleAccess || ['Overview', 'Attendance', 'Leads', 'Reports', 'Profile']);

    setShowAddForm(true);
  };

  const handleDeleteEmployee = async (empId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`/api/employees/${empId}`, { method: 'DELETE' });
              if (response.success) {
                Alert.alert('Success', 'Employee deleted successfully!');
                setSelectedEmployee(null);
                fetchEmployees();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete employee.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleForceResetPassword = async (empId: string) => {
    if (!resetPassword || resetPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await apiCall(`/api/employees/${empId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: resetPassword }),
      });

      if (response.success) {
        Alert.alert('Success', 'Password reset successfully!');
        setResetPassword('');
      } else {
        Alert.alert('Error', response.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  const handleAddEmployee = async () => {
    setSubmitLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        officeEmail,
        phone,
        companyPhone,
        permanentAddress,
        correspondenceAddress,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodGroup,
        maritalStatus,
        profilePhotoUrl,
        department,
        designation,
        workLocation,
        employeeType,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
        kyc: {
          aadharNumber,
          panNumber,
          passportNumber,
        },
        bankDetails: {
          bankName,
          accountNumber,
          ifscCode,
          branchName,
        },
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone,
        },
        systemRole,
        moduleAccess,
        password: password || (systemRole === 'ADMIN' ? 'Admin@123' : 'Employee@123'),
      };

      const url = isEditMode ? `/api/employees/${selectedEmployee?._id || selectedEmployee?.id}` : '/api/employees';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.success) {
        Alert.alert('Success', isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
        setShowAddForm(false);
        setIsEditMode(false);
        setSelectedEmployee(null);
        // Reset steps & inputs
        setCurrentStep(1);
        setFirstName('');
        setLastName('');
        setEmail('');
        setOfficeEmail('');
        setPhone('');
        setCompanyPhone('');
        setPermanentAddress('');
        setCorrespondenceAddress('');
        setDateOfBirth('');
        setGender('');
        setBloodGroup('');
        setMaritalStatus('');
        setProfilePhotoUrl('');
        setDepartment('Engineering');
        setDesignation('Developer');
        setWorkLocation('Noida');
        setEmployeeType('Full-Time');
        setDateOfJoining('');
        setAadharNumber('');
        setPanNumber('');
        setPassportNumber('');
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setBranchName('');
        setEmergencyName('');
        setEmergencyRelation('');
        setEmergencyPhone('');
        setPassword('');
        setModuleAccess(['Overview', 'Attendance', 'Leads', 'Reports', 'Profile']);
        fetchEmployees();
      } else {
        Alert.alert('Error', response.error || 'Failed to submit employee.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper for Stepper indicator circles
  const renderStepCircle = (stepNum: number, label: string) => {
    const isCompleted = stepNum < currentStep;
    const isActive = stepNum === currentStep;
    return (
      <TouchableOpacity
        key={stepNum}
        style={styles.stepCircleContainer}
        onPress={() => setCurrentStep(stepNum)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.stepCircle,
            isCompleted && styles.stepCircleCompleted,
            isActive && styles.stepCircleActive
          ]}
        >
          <Text
            style={[
              styles.stepCircleText,
              (isActive || isCompleted) && styles.stepCircleTextActive
            ]}
          >
            {stepNum}
          </Text>
        </View>
        <Text style={[styles.stepCircleLabel, isActive && styles.stepCircleLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.employeesContainer}>
      {selectedEmployee && !showAddForm ? (
        /* --- EMPLOYEE DETAIL VIEW --- */
        <ScrollView contentContainerStyle={styles.detailScrollContent}>
          {/* Header Row */}
          <View style={styles.detailHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedEmployee(null)}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>
                {selectedEmployee.firstName?.[0]?.toUpperCase()}{selectedEmployee.lastName?.[0]?.toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{selectedEmployee.firstName} {selectedEmployee.lastName}</Text>
              <Text style={styles.detailMeta}>{selectedEmployee.employeeCode} • {selectedEmployee.designation || 'Staff'}</Text>
            </View>
          </View>

          {/* Edit/Delete Action Row */}
          <View style={styles.detailActionRow}>
            <TouchableOpacity
              style={[styles.detailBtn, styles.detailBtnEdit]}
              onPress={() => handleEditClick(selectedEmployee)}
            >
              <Edit size={16} color={colors.background} />
              <Text style={styles.detailBtnText}>Edit Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailBtn, styles.detailBtnDelete]}
              onPress={() => handleDeleteEmployee(selectedEmployee._id || selectedEmployee.id)}
            >
              <Trash2 size={16} color={colors.background} />
              <Text style={[styles.detailBtnText, { color: colors.background }]}>Delete Employee</Text>
            </TouchableOpacity>
          </View>

          {/* Card 1: Personal Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Personal Details</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailVal}>{selectedEmployee.email}</Text>
              </View>
              {selectedEmployee.officeEmail && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Office Email</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.officeEmail}</Text>
                </View>
              )}
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailVal}>{selectedEmployee.phone || '-'}</Text>
              </View>
              {selectedEmployee.companyPhone && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Company Phone</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.companyPhone}</Text>
                </View>
              )}
              {selectedEmployee.permanentAddress && (
                <View style={[styles.detailGridCol, { width: '100%' }]}>
                  <Text style={styles.detailLabel}>Permanent Address</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.permanentAddress}</Text>
                </View>
              )}
              {selectedEmployee.correspondenceAddress && (
                <View style={[styles.detailGridCol, { width: '100%' }]}>
                  <Text style={styles.detailLabel}>Correspondence Address</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.correspondenceAddress}</Text>
                </View>
              )}
              {selectedEmployee.gender && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Gender</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.gender}</Text>
                </View>
              )}
              {selectedEmployee.bloodGroup && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Blood Group</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.bloodGroup}</Text>
                </View>
              )}
              {selectedEmployee.maritalStatus && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Marital Status</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.maritalStatus}</Text>
                </View>
              )}
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailVal}>{selectedEmployee.status || 'Active'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Employee Type</Text>
                <Text style={styles.detailVal}>{selectedEmployee.employeeType || 'Full-Time'}</Text>
              </View>
              {selectedEmployee.dateOfBirth && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Date of Birth</Text>
                  <Text style={styles.detailVal}>
                    {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card 2: Official Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Official Details</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Department</Text>
                <Text style={styles.detailVal}>{selectedEmployee.department || 'N/A'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Designation</Text>
                <Text style={styles.detailVal}>{selectedEmployee.designation || 'N/A'}</Text>
              </View>
              {selectedEmployee.dateOfJoining && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Joined Date</Text>
                  <Text style={styles.detailVal}>
                    {new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {selectedEmployee.workLocation && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Work Location</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.workLocation}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Card 3: KYC & Bank Information */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>KYC & Bank Information</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Aadhar Number</Text>
                <Text style={styles.detailVal}>{selectedEmployee.kyc?.aadharNumber || '-'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>PAN Number</Text>
                <Text style={styles.detailVal}>{selectedEmployee.kyc?.panNumber || '-'}</Text>
              </View>
              {selectedEmployee.kyc?.passportNumber && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Passport Number</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.kyc.passportNumber}</Text>
                </View>
              )}
              {selectedEmployee.bankDetails?.bankName && (
                <>
                  <View style={styles.detailGridCol}>
                    <Text style={styles.detailLabel}>Bank Name</Text>
                    <Text style={styles.detailVal}>{selectedEmployee.bankDetails.bankName}</Text>
                  </View>
                  <View style={styles.detailGridCol}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailVal}>{selectedEmployee.bankDetails.accountNumber}</Text>
                  </View>
                  {selectedEmployee.bankDetails?.ifscCode && (
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>IFSC Code</Text>
                      <Text style={styles.detailVal}>{selectedEmployee.bankDetails.ifscCode}</Text>
                    </View>
                  )}
                  {selectedEmployee.bankDetails?.branchName && (
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Bank Branch</Text>
                      <Text style={styles.detailVal}>{selectedEmployee.bankDetails.branchName}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Emergency Contact Card */}
          {selectedEmployee.emergencyContact?.name && (
            <View style={styles.detailCard}>
              <Text style={styles.detailCardTitle}>Emergency Contact Details</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Emergency Contact Name</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.emergencyContact.name}</Text>
                </View>
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Emergency Contact Relation</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.emergencyContact.relation || '-'}</Text>
                </View>
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Emergency Contact Number</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.emergencyContact.phone || '-'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Card 4: Administrative Actions (Password Force Reset) */}
          <View style={[styles.detailCard, styles.adminActionsCard]}>
            <Text style={[styles.detailCardTitle, styles.adminActionsTitle]}>Administrative Actions</Text>
            <Text style={styles.adminActionsDesc}>
              Force reset this user's login password. They will be prompted to change it on their next login.
            </Text>

            <Text style={styles.formLabel}>New Password</Text>
            <View style={styles.resetInputRow}>
              <TextInput
                style={styles.resetInput}
                placeholder="Enter minimum 6 characters..."
                placeholderTextColor={colors.textMuted}
                value={resetPassword}
                onChangeText={setResetPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => handleForceResetPassword(selectedEmployee._id || selectedEmployee.id)}
              >
                <Text style={styles.buttonText}>Force Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* --- DIRECTORY DIRECT LISTING --- */
        <View style={{ flex: 1 }}>
          {/* Title & Actions Row */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.empTitle}>Employees</Text>
              <Text style={styles.empSubtitle}>Manage workforce, departments, and records.</Text>
            </View>
            <TouchableOpacity style={styles.addEmpButton} onPress={() => { setIsEditMode(false); setShowAddForm(true); setCurrentStep(1); }}>
              <Plus size={16} color={colors.background} style={{ marginRight: 6 }} />
              <Text style={styles.addEmpBtnText}>Add Employee</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filters Row */}
          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search employees..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Toggleable Status Filter Badges */}
            <View style={styles.filterBadges}>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === '' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === '' && styles.filterBadgeTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === 'Active' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('Active')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === 'Active' && styles.filterBadgeTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === 'Inactive' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('Inactive')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === 'Inactive' && styles.filterBadgeTextActive]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Directory List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.employeeListContainer}>
              {employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id || emp._id}
                  style={styles.employeeRowCard}
                  onPress={() => setSelectedEmployee(emp)}
                >
                  <View style={styles.empCardHeader}>
                    <View style={styles.empAvatar}>
                      <Text style={styles.empAvatarText}>
                        {emp.firstName?.[0]?.toUpperCase()}{emp.lastName?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.empName}>{emp.firstName} {emp.lastName}</Text>
                      <Text style={styles.empEmail}>{emp.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, emp.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
                      <Text style={[styles.statusText, emp.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
                        {emp.status || 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.empCardBody}>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Code</Text>
                      <Text style={styles.detailVal}>{emp.employeeCode}</Text>
                    </View>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Department</Text>
                      <Text style={styles.detailVal}>{emp.department || 'N/A'}</Text>
                    </View>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Designation</Text>
                      <Text style={styles.detailVal}>{emp.designation || 'N/A'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {employees.length === 0 && (
                <Text style={styles.noEmployeesText}>No employees found.</Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Multi-step Add/Edit Employee Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Stepper visual indicator */}
            <View style={styles.stepperContainer}>
              {renderStepCircle(1, 'Personal')}
              <View style={[styles.stepLine, currentStep > 1 && styles.stepLineCompleted]} />
              {renderStepCircle(2, 'Official')}
              <View style={[styles.stepLine, currentStep > 2 && styles.stepLineCompleted]} />
              {renderStepCircle(3, 'KYC')}
              <View style={[styles.stepLine, currentStep > 3 && styles.stepLineCompleted]} />
              {renderStepCircle(4, 'Bank')}
              <View style={[styles.stepLine, currentStep > 4 && styles.stepLineCompleted]} />
              {renderStepCircle(5, 'Roles')}
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Personal Details</Text>
                  <Text style={styles.stepDesc}>Basic contact and personal information.</Text>

                  <Text style={styles.formLabel}>First Name *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter First Name"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />

                  <Text style={styles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Last Name"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />

                  <Text style={styles.formLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.formLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Phone Number"
                    placeholderTextColor={colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formLabel}>Office Email</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Office Email"
                    placeholderTextColor={colors.textMuted}
                    value={officeEmail}
                    onChangeText={setOfficeEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.formLabel}>Company Phone No.</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Company Phone Number"
                    placeholderTextColor={colors.textMuted}
                    value={companyPhone}
                    onChangeText={setCompanyPhone}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formLabel}>Permanent Address</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Enter Permanent Address"
                    placeholderTextColor={colors.textMuted}
                    value={permanentAddress}
                    onChangeText={setPermanentAddress}
                    multiline
                  />

                  <Text style={styles.formLabel}>Correspondence Address</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Enter Correspondence Address"
                    placeholderTextColor={colors.textMuted}
                    value={correspondenceAddress}
                    onChangeText={setCorrespondenceAddress}
                    multiline
                  />

                  <Text style={styles.formLabel}>Gender</Text>
                  <View style={styles.typeSelectionRow}>
                    {['Male', 'Female', 'Other'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.typeSelectBtn, gender === g && styles.typeSelectBtnActive]}
                        onPress={() => setGender(g)}
                      >
                        <Text style={[styles.typeSelectText, gender === g && styles.typeSelectTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Blood Group</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. O+, A+, B+"
                    placeholderTextColor={colors.textMuted}
                    value={bloodGroup}
                    onChangeText={setBloodGroup}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Marital Status</Text>
                  <View style={styles.typeSelectionRow}>
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.typeSelectBtn, maritalStatus === m && styles.typeSelectBtnActive]}
                        onPress={() => setMaritalStatus(m)}
                      >
                        <Text style={[styles.typeSelectText, maritalStatus === m && styles.typeSelectTextActive]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Date of Birth</Text>
                  <TouchableOpacity
                    style={[styles.modalTextInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setShowDobPicker(true)}
                  >
                    <Text style={{ color: dateOfBirth ? colors.text : colors.textMuted, fontSize: 15 }}>
                      {dateOfBirth || 'Select Date of Birth (YYYY-MM-DD)'}
                    </Text>
                    <Calendar size={18} color={colors.accent} />
                  </TouchableOpacity>

                  {showDobPicker && (
                    <DateTimePicker
                      value={dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()) ? new Date(dateOfBirth) : new Date(1995, 0, 1)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      maximumDate={new Date()}
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDobPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          const yyyy = selectedDate.getFullYear();
                          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const dd = String(selectedDate.getDate()).padStart(2, '0');
                          setDateOfBirth(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                    />
                  )}

                  <Text style={styles.formLabel}>Profile Photo URL</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Photo URL"
                    placeholderTextColor={colors.textMuted}
                    value={profilePhotoUrl}
                    onChangeText={setProfilePhotoUrl}
                  />
                </View>
              )}

              {/* STEP 2: Official Details */}
              {currentStep === 2 && (
                <View>
                  <Text style={styles.stepTitle}>Official Details</Text>
                  <Text style={styles.stepDesc}>Work location, department and role details.</Text>

                  <Text style={styles.formLabel}>Joined Date</Text>
                  <TouchableOpacity
                    style={[styles.modalTextInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setShowDojPicker(true)}
                  >
                    <Text style={{ color: dateOfJoining ? colors.text : colors.textMuted, fontSize: 15 }}>
                      {dateOfJoining || 'Select Joined Date (YYYY-MM-DD)'}
                    </Text>
                    <Calendar size={18} color={colors.accent} />
                  </TouchableOpacity>

                  {showDojPicker && (
                    <DateTimePicker
                      value={dateOfJoining && !isNaN(new Date(dateOfJoining).getTime()) ? new Date(dateOfJoining) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDojPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          const yyyy = selectedDate.getFullYear();
                          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const dd = String(selectedDate.getDate()).padStart(2, '0');
                          setDateOfJoining(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                    />
                  )}

                  <Text style={styles.formLabel}>Department</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Engineering, Sales, HR, etc."
                    placeholderTextColor={colors.textMuted}
                    value={department}
                    onChangeText={setDepartment}
                  />

                  <Text style={styles.formLabel}>Designation</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Developer, Manager, Designer, etc."
                    placeholderTextColor={colors.textMuted}
                    value={designation}
                    onChangeText={setDesignation}
                  />

                  <Text style={styles.formLabel}>Work Location</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. Noida, Delhi"
                    placeholderTextColor={colors.textMuted}
                    value={workLocation}
                    onChangeText={setWorkLocation}
                  />

                  <Text style={styles.formLabel}>Employee Type</Text>
                  <View style={styles.typeSelectionRow}>
                    {['Full-Time', 'Part-Time', 'Contract', 'Intern'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeSelectBtn, employeeType === type && styles.typeSelectBtnActive]}
                        onPress={() => setEmployeeType(type)}
                      >
                        <Text style={[styles.typeSelectText, employeeType === type && styles.typeSelectTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* STEP 3: KYC & Docs */}
              {currentStep === 3 && (
                <View>
                  <Text style={styles.stepTitle}>KYC & Verification</Text>
                  <Text style={styles.stepDesc}>Government identification details.</Text>

                  <Text style={styles.formLabel}>Aadhar Number (Aadhar Num)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter 12-digit Aadhar Number"
                    placeholderTextColor={colors.textMuted}
                    value={aadharNumber}
                    onChangeText={setAadharNumber}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.formLabel}>PAN Number (Pan)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter 10-digit PAN"
                    placeholderTextColor={colors.textMuted}
                    value={panNumber}
                    onChangeText={setPanNumber}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Passport Number (Passport Num)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Passport Number"
                    placeholderTextColor={colors.textMuted}
                    value={passportNumber}
                    onChangeText={setPassportNumber}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {/* STEP 4: Bank & Emergency Details */}
              {currentStep === 4 && (
                <View>
                  <Text style={styles.stepTitle}>Bank & Emergency Details</Text>
                  <Text style={styles.stepDesc}>Bank account info & emergency contact details.</Text>

                  <Text style={styles.formLabel}>Bank Name / Bank Account</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Bank Name"
                    placeholderTextColor={colors.textMuted}
                    value={bankName}
                    onChangeText={setBankName}
                  />

                  <Text style={styles.formLabel}>Account Number (Ac Num)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Bank Account Number"
                    placeholderTextColor={colors.textMuted}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.formLabel}>IFSC Code</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter IFSC Code"
                    placeholderTextColor={colors.textMuted}
                    value={ifscCode}
                    onChangeText={setIfscCode}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Branch Name (Bank Branch)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Branch Name"
                    placeholderTextColor={colors.textMuted}
                    value={branchName}
                    onChangeText={setBranchName}
                  />

                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={[styles.formLabel, { color: colors.accent, fontWeight: '700' }]}>Emergency Contact Name</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Enter Emergency Contact Name"
                      placeholderTextColor={colors.textMuted}
                      value={emergencyName}
                      onChangeText={setEmergencyName}
                    />

                    <Text style={[styles.formLabel, { color: colors.accent, fontWeight: '700' }]}>Emergency Contact Relation</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="e.g. Spouse, Parent, Sibling"
                      placeholderTextColor={colors.textMuted}
                      value={emergencyRelation}
                      onChangeText={setEmergencyRelation}
                    />

                    <Text style={[styles.formLabel, { color: colors.accent, fontWeight: '700' }]}>Emergency Contact Number</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Enter Emergency Contact Phone Number"
                      placeholderTextColor={colors.textMuted}
                      value={emergencyPhone}
                      onChangeText={setEmergencyPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              )}

              {/* STEP 5: Permissions & Role */}
              {currentStep === 5 && (
                <View>
                  <Text style={styles.stepTitle}>System Role & Credentials</Text>
                  <Text style={styles.stepDesc}>Establish access levels and login passwords.</Text>

                  <Text style={styles.formLabel}>System Role (Key Admin Only)</Text>
                  <View style={styles.roleSelectionRow}>
                    <TouchableOpacity
                      style={[styles.roleSelectBtn, systemRole === 'Employee' && styles.roleSelectBtnActive]}
                      onPress={() => setSystemRole('Employee')}
                    >
                      <Text style={[styles.roleSelectText, systemRole === 'Employee' && styles.roleSelectTextActive]}>
                        Employee (Default)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleSelectBtn, systemRole === 'ADMIN' && styles.roleSelectBtnActive]}
                      onPress={() => setSystemRole('ADMIN')}
                    >
                      <Text style={[styles.roleSelectText, systemRole === 'ADMIN' && styles.roleSelectTextActive]}>
                        Administrator
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.roleTip}>
                    Administrators have elevated access and use the default password <Text style={{ fontWeight: 'bold' }}>Admin@123</Text>. Employees use <Text style={{ fontWeight: 'bold' }}>Employee@123</Text>.
                  </Text>

                  <Text style={styles.formLabel}>Custom Password (Optional)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Override default password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  {/* Module Access Checkboxes matching user screenshot */}
                  <View style={styles.moduleAccessSection}>
                    <Text style={styles.stepTitle}>Module Access</Text>
                    <Text style={styles.stepDesc}>Select which sidebar modules this employee can access.</Text>

                    <View style={styles.moduleGridContainer}>
                      {[
                        ['Overview', 'Attendance', 'Leads'],
                        ['Reports', 'Profile', 'Executive AI'],
                        ['Wallet', 'Payroll', 'Leave'],
                        ['Holidays', 'Employees', 'Notifications'],
                        ['Settings']
                      ].map((row, rIdx) => (
                        <View key={rIdx} style={styles.moduleGridRow}>
                          {row.map((mod) => {
                            const isChecked = moduleAccess.includes(mod);
                            return (
                              <TouchableOpacity
                                key={mod}
                                style={styles.moduleCheckboxCol}
                                activeOpacity={0.7}
                                onPress={() => {
                                  if (isChecked) {
                                    setModuleAccess(moduleAccess.filter((m) => m !== mod));
                                  } else {
                                    setModuleAccess([...moduleAccess, mod]);
                                  }
                                }}
                              >
                                <View style={[styles.customCheckbox, isChecked && styles.customCheckboxChecked]}>
                                  {isChecked && <Text style={styles.checkmarkIcon}>✓</Text>}
                                </View>
                                <Text style={styles.moduleCheckboxLabel} numberOfLines={1}>{mod}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Stepper Navigation Buttons */}
              <View style={styles.stepperNavRow}>
                <TouchableOpacity
                  style={[styles.stepperNavBtn, currentStep === 1 && styles.stepperNavBtnDisabled]}
                  onPress={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  <Text style={[styles.stepperNavText, currentStep === 1 && styles.stepperNavTextDisabled]}>
                    &lt; Previous
                  </Text>
                </TouchableOpacity>

                {currentStep < 5 ? (
                  <TouchableOpacity
                    style={[styles.stepperNavBtn, styles.stepperNavBtnActive]}
                    onPress={handleNextStep}
                  >
                    <Text style={[styles.stepperNavText, styles.stepperNavTextActive]}>
                      Next &gt;
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.stepperNavBtn, styles.stepperNavBtnActive, submitLoading && styles.disabledButton]}
                    onPress={handleAddEmployee}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text style={[styles.stepperNavText, styles.stepperNavTextActive]}>
                        Submit
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Payroll Sub-View ---
const PayrollView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'structures'>('dashboard');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Structures sub-tab state
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [structFormData, setStructFormData] = useState({
    basic: 0,
    hra: 0,
    travelAllowance: 0,
    incentive: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    professionalTax: 0,
    incomeTax: 0,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Payslip detail view modal/screen state
  const [selectedPayrollSlip, setSelectedPayrollSlip] = useState<any>(null);

  const fetchPayrolls = async () => {
    try {
      const response = await apiCall(`/api/payroll?monthYear=${monthYear}`);
      if (response.success && response.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data) ? response.data : [];
        setPayrolls(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployeesAndStructures = async () => {
    try {
      const [empRes, structRes] = await Promise.all([
        apiCall('/api/employees'),
        apiCall('/api/payroll/structure')
      ]);

      let empList: any[] = [];
      if (empRes.success && empRes.data) {
        empList = Array.isArray(empRes.data.data)
          ? empRes.data.data
          : Array.isArray(empRes.data) ? empRes.data : [];
        setEmployees(empList);
      }

      let structList: any[] = [];
      if (structRes.success && structRes.data) {
        structList = Array.isArray(structRes.data.data)
          ? structRes.data.data
          : Array.isArray(structRes.data) ? structRes.data : [];
        setStructures(structList);
      }

      if (empList.length > 0) {
        const targetEmpId = selectedEmp || (empList[0]._id || empList[0].id);
        setSelectedEmp(targetEmpId);
        const existing = structList.find((s: any) => {
          const sEmpId = typeof s.employeeId === 'object' && s.employeeId !== null ? (s.employeeId._id || s.employeeId.id) : s.employeeId;
          return String(sEmpId) === String(targetEmpId);
        });
        if (existing) {
          setStructFormData({
            basic: existing.basic || 0,
            hra: existing.hra || 0,
            travelAllowance: existing.travelAllowance || existing.metroAllowance || 0,
            incentive: existing.incentive || 0,
            specialAllowance: existing.specialAllowance || 0,
            pf: existing.pf || 0,
            esi: existing.esi || 0,
            professionalTax: existing.professionalTax || 0,
            incomeTax: existing.incomeTax || 0,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPayrolls(), fetchEmployeesAndStructures()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    setSelectedPayrolls([]);
  }, [monthYear]);

  const handleGenerate = async (employeeId: string) => {
    setGenerating(true);
    try {
      const res = await apiCall('/api/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({ employeeId, monthYear }),
      });
      if (res.success) {
        Alert.alert('Success', 'Payroll generated successfully!');
        fetchPayrolls();
      } else {
        Alert.alert('Error', res.error || 'Failed to generate payroll.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelection = (payrollId: string) => {
    if (selectedPayrolls.includes(payrollId)) {
      setSelectedPayrolls(selectedPayrolls.filter(id => id !== payrollId));
    } else {
      setSelectedPayrolls([...selectedPayrolls, payrollId]);
    }
  };

  const toggleAll = () => {
    const eligiblePayrolls = payrolls.filter(p => p.status === 'Approved');
    if (selectedPayrolls.length === eligiblePayrolls.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(eligiblePayrolls.map(p => p._id));
    }
  };

  const handleBulkPayment = async () => {
    if (selectedPayrolls.length === 0) return;

    Alert.alert(
      'Confirm Bulk Pay',
      `Are you sure you want to process ${selectedPayrolls.length} salaries? Funds will be deducted from the Company Wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process Payment',
          onPress: async () => {
            setProcessingBulk(true);
            try {
              const res: any = await apiCall('/api/payroll/payment', {
                method: 'POST',
                body: JSON.stringify({ payrollIds: selectedPayrolls, monthYear }),
              });
              if (res.success) {
                Alert.alert('Success', res.message || 'Bulk payment processed!');
                setSelectedPayrolls([]);
                fetchPayrolls();
              } else {
                Alert.alert('Payment Failed', res.error || 'Failed bulk payment.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            } finally {
              setProcessingBulk(false);
            }
          }
        }
      ]
    );
  };

  const calculateSelectedTotal = () => {
    return payrolls
      .filter(p => selectedPayrolls.includes(p._id))
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
  };

  const totalNetSalaryGenerated = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const handleSelectStructureEmp = (empId: string) => {
    setSelectedEmp(empId);
    const existing = structures.find(s => {
      const sEmpId = typeof s.employeeId === 'object' && s.employeeId !== null ? (s.employeeId._id || s.employeeId.id) : s.employeeId;
      return String(sEmpId) === String(empId);
    });
    if (existing) {
      setStructFormData({
        basic: existing.basic || 0,
        hra: existing.hra || 0,
        travelAllowance: existing.travelAllowance || existing.metroAllowance || 0,
        incentive: existing.incentive || 0,
        specialAllowance: existing.specialAllowance || 0,
        pf: existing.pf || 0,
        esi: existing.esi || 0,
        professionalTax: existing.professionalTax || 0,
        incomeTax: existing.incomeTax || 0,
      });
    } else {
      setStructFormData({
        basic: 0,
        hra: 0,
        travelAllowance: 0,
        incentive: 0,
        specialAllowance: 0,
        pf: 0,
        esi: 0,
        professionalTax: 0,
        incomeTax: 0,
      });
    }
  };

  const handleSaveStructure = async () => {
    const targetEmpId = selectedEmp || (employees[0]?._id || employees[0]?.id);
    if (!targetEmpId) return;
    setSaveLoading(true);
    try {
      const res = await apiCall('/api/payroll/structure', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: targetEmpId,
          ...structFormData,
        }),
      });
      if (res.success) {
        Alert.alert('Success', 'Salary Structure Saved Successfully!');
        fetchEmployeesAndStructures();
      } else {
        Alert.alert('Error', res.error || 'Failed to save salary structure.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <View style={styles.payrollContainer}>
      {/* Top Header & Navigation Tabs */}
      <View style={styles.payrollHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>
            {activeSubTab === 'dashboard' ? 'Payroll Dashboard' : 'Salary Structures'}
          </Text>
          <Text style={styles.empSubtitle}>
            {activeSubTab === 'dashboard'
              ? 'Manage, generate, and bulk pay employee salaries.'
              : 'Configure fixed earnings and deductions for employees.'}
          </Text>
        </View>

        <View style={styles.payrollTabBtnGroup}>
          <TouchableOpacity
            style={[styles.payrollTabBtn, activeSubTab === 'dashboard' && styles.payrollTabBtnActive]}
            onPress={() => setActiveSubTab('dashboard')}
          >
            <Text style={[styles.payrollTabBtnText, activeSubTab === 'dashboard' && styles.payrollTabBtnTextActive]}>
              Ledger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payrollTabBtn, activeSubTab === 'structures' && styles.payrollTabBtnActive]}
            onPress={() => {
              setActiveSubTab('structures');
              if (!selectedEmp && employees.length > 0) {
                const firstId = employees[0]._id || employees[0].id;
                handleSelectStructureEmp(firstId);
              }
            }}
          >
            <Settings size={14} color={activeSubTab === 'structures' ? colors.background : colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.payrollTabBtnText, activeSubTab === 'structures' && styles.payrollTabBtnTextActive]}>
              Structures
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DASHBOARD TAB CONTENT */}
      {activeSubTab === 'dashboard' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Top Month Selector & Total Net Card */}
          <View style={styles.monthSelectorRow}>
            <View style={styles.monthInputBox}>
              <Calendar size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.monthInput}
                placeholder="YYYY-MM (e.g. 2026-07)"
                placeholderTextColor={colors.textMuted}
                value={monthYear}
                onChangeText={setMonthYear}
              />
              {monthYear ? (
                <TouchableOpacity onPress={() => setMonthYear('')}>
                  <Text style={styles.clearMonthText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.netSalaryCard}>
            <Text style={styles.netSalaryCardLabel}>Total Net Salary Generated</Text>
            <Text style={styles.netSalaryCardValue}>₹ {totalNetSalaryGenerated.toLocaleString()}</Text>
          </View>

          {/* Table Header */}
          <View style={styles.payrollTableHeader}>
            <TouchableOpacity onPress={toggleAll} style={styles.checkboxTouch}>
              <View style={[styles.customCheckbox, selectedPayrolls.length > 0 && styles.customCheckboxChecked]} />
            </TouchableOpacity>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Employee</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Gross</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Deductions</Text>
            <Text style={[styles.tableColHeader, { flex: 1.2, textAlign: 'right', color: colors.success }]}>Net Salary</Text>
          </View>

          {/* Table Rows */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 30 }} />
          ) : employees.length === 0 ? (
            <Text style={styles.noEmployeesText}>No employee records found.</Text>
          ) : (
            employees.map((emp) => {
              const empId = String(emp._id || emp.id || '');
              const empCode = emp.employeeCode;
              const payroll = payrolls.find(p => {
                const pEmp = p.employeeId;
                if (!pEmp) return false;
                const pEmpId = typeof pEmp === 'object' ? String(pEmp._id || pEmp.id || '') : String(pEmp);
                const pEmpCode = typeof pEmp === 'object' ? pEmp.employeeCode : null;
                return pEmpId === empId || (empCode && pEmpCode && empCode === pEmpCode);
              });
              const isApproved = payroll && payroll.status === 'Approved';
              const isSelected = payroll && selectedPayrolls.includes(payroll._id || payroll.id);

              return (
                <View key={emp._id || emp.id} style={styles.payrollTableRow}>
                  <TouchableOpacity
                    disabled={!isApproved}
                    onPress={() => payroll && toggleSelection(payroll._id)}
                    style={styles.checkboxTouch}
                  >
                    <View
                      style={[
                        styles.customCheckbox,
                        isSelected && styles.customCheckboxChecked,
                        !isApproved && styles.customCheckboxDisabled
                      ]}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 2 }}>
                    <Text style={styles.empNameText}>{emp.firstName} {emp.lastName}</Text>
                    <Text style={styles.empCodeText}>{emp.employeeCode}</Text>
                  </View>

                  {payroll ? (
                    <>
                      <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>
                        ₹{payroll.grossSalary?.toLocaleString() || 0}
                      </Text>
                      <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right', color: colors.danger }]}>
                        -₹{payroll.totalDeductions?.toLocaleString() || 0}
                      </Text>
                      <Text style={[styles.tableCellText, { flex: 1.2, textAlign: 'right', color: colors.success, fontWeight: 'bold' }]}>
                        ₹{payroll.netSalary?.toLocaleString() || 0}
                      </Text>
                    </>
                  ) : (
                    <View style={{ flex: 3.2, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>Not Generated</Text>
                    </View>
                  )}

                  <View style={{ marginLeft: 8 }}>
                    {payroll ? (
                      <TouchableOpacity
                        style={styles.actionSlipBtn}
                        onPress={() => setSelectedPayrollSlip(payroll)}
                      >
                        <Text style={styles.actionSlipBtnText}>Slip</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionGenerateBtn, generating && styles.disabledButton]}
                        onPress={() => handleGenerate(emp._id || emp.id)}
                        disabled={generating}
                      >
                        <Text style={styles.actionGenerateBtnText}>Generate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* STRUCTURES TAB CONTENT */
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 4 }}>
          <View style={styles.structuresLayout}>
            {/* Left/Top Employee selector list */}
            <View style={styles.structEmpListCard}>
              <Text style={styles.structEmpListTitle}>Employees ({employees.length})</Text>
              {employees.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, paddingVertical: 8 }}>No employees found.</Text>
              ) : (
                <View style={{ flexDirection: 'column' }}>
                  {employees.map((emp) => {
                    const empId = emp._id || emp.id;
                    const hasStruct = structures.some(s => (
                      String(s.employeeId?._id || s.employeeId?.id || s.employeeId) === String(empId) ||
                      String(s.employeeId?._id || s.employeeId?.id || s.employeeId) === String(emp._id)
                    ));
                    const activeEmpId = selectedEmp || (employees[0] ? (employees[0]._id || employees[0].id) : null);
                    const isSelected = String(activeEmpId) === String(empId) || String(activeEmpId) === String(emp._id);

                    return (
                      <TouchableOpacity
                        key={empId}
                        style={[styles.structEmpItem, isSelected && styles.structEmpItemActive]}
                        onPress={() => handleSelectStructureEmp(empId)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.empNameText, isSelected && { color: colors.accent, fontWeight: '800' }]}>
                            {emp.firstName} {emp.lastName}
                          </Text>
                          <Text style={styles.empCodeText}>{emp.employeeCode}</Text>
                        </View>
                        <View style={[styles.dotIndicator, { backgroundColor: hasStruct ? '#059669' : '#dc2626' }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Right/Bottom Form Card */}
            {(() => {
              const activeEmp = employees.find(e => String(e._id || e.id) === String(selectedEmp)) || employees[0];
              const activeEmpId = activeEmp ? (activeEmp._id || activeEmp.id) : null;

              if (!activeEmpId) {
                return (
                  <View style={styles.selectEmpPromptBox}>
                    <Text style={styles.selectEmpPromptText}>No employees found. Please add employees to configure salary structures.</Text>
                  </View>
                );
              }

              return (
                <View style={styles.structFormCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={styles.structFormTitle}>Configure Salary Structure</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>
                      {activeEmp.firstName} {activeEmp.lastName} ({activeEmp.employeeCode})
                    </Text>
                  </View>

                <Text style={[styles.sectionHeading, { color: '#059669', fontSize: 14, fontWeight: '800', marginTop: 4, marginBottom: 8 }]}>Earnings</Text>
                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Basic Salary (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.basic === 0 ? '' : String(structFormData.basic)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, basic: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>HRA (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.hra === 0 ? '' : String(structFormData.hra)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, hra: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                </View>

                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Travel Allowance (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.travelAllowance === 0 ? '' : String(structFormData.travelAllowance)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, travelAllowance: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Incentive (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.incentive === 0 ? '' : String(structFormData.incentive)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, incentive: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                </View>

                <Text style={[styles.sectionHeading, { color: '#dc2626', fontSize: 14, fontWeight: '800', marginTop: 14, marginBottom: 8 }]}>Fixed Deductions</Text>
                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>PF Amount (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.pf === 0 ? '' : String(structFormData.pf)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, pf: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>ESI Amount (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.esi === 0 ? '' : String(structFormData.esi)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, esi: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                </View>

                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Professional Tax (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.professionalTax === 0 ? '' : String(structFormData.professionalTax)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, professionalTax: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Income Tax / TDS (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={structFormData.incomeTax === 0 ? '' : String(structFormData.incomeTax)}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={(val) => setStructFormData({ ...structFormData, incomeTax: val === '' ? 0 : Number(val) || 0 })}
                    />
                  </View>
                </View>

                {/* Gross Summary Box matching screenshot */}
                <View style={styles.grossSummaryBox}>
                  <Text style={styles.grossSummaryLabel}>Gross Monthly Salary</Text>
                  <Text style={styles.grossSummaryVal}>
                    ₹ {(structFormData.basic + structFormData.hra + structFormData.travelAllowance + structFormData.incentive + structFormData.specialAllowance).toLocaleString()}
                  </Text>
                </View>

                {/* Action Buttons matching screenshot */}
                <View style={styles.structFormActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedEmp(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, saveLoading && styles.disabledButton]}
                    onPress={handleSaveStructure}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Structure</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>
      </ScrollView>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedPayrolls.length > 0 && (
        <View style={styles.floatingBulkBar}>
          <View>
            <Text style={styles.bulkBarTitle}>Selected ({selectedPayrolls.length})</Text>
            <Text style={styles.bulkBarVal}>₹{calculateSelectedTotal().toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bulkPayBtn, processingBulk && styles.disabledButton]}
            onPress={handleBulkPayment}
            disabled={processingBulk}
          >
            {processingBulk ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.bulkPayBtnText}>Process Bank Transfer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Salary Slip Detail Modal */}
      <Modal visible={!!selectedPayrollSlip} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#F4F6FB' }}>
          {/* Top Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E2A5E', paddingTop: 48, paddingBottom: 14, paddingHorizontal: 18 }}>
            <TouchableOpacity onPress={() => setSelectedPayrollSlip(null)} style={{ padding: 4 }}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 }}>SALARY SLIP</Text>
            <TouchableOpacity
              onPress={async () => {
                if (!selectedPayrollSlip) return;
                const slip = selectedPayrollSlip;
                const emp = slip.employeeId || {};
                const monthNameStr = slip.monthYear
                  ? new Date(`${slip.monthYear}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
                  : slip.monthYear;
                const fmt = (n: number) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                const travelAllow = slip.earnings?.travelAllowance || slip.earnings?.metroAllowance || slip.earnings?.specialAllowance || 0;
                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 0; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 32px; background: #fff; color: #111; font-size: 13px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .header-left { display: flex; align-items: flex-start; gap: 14px; }
    .logo-circle { width: 56px; height: 56px; border-radius: 50%; border: 2px solid #c7d2fe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #eef2ff; }
    .logo-text { font-size: 15px; font-weight: 900; color: #1E2A5E; }
    .header-info h1 { font-size: 24px; font-weight: 900; color: #111; margin-bottom: 3px; }
    .header-info p { font-size: 11px; color: #777; margin-bottom: 1px; line-height: 1.5; }
    .header-right { text-align: right; }
    .doc-label { font-size: 9px; color: #aaa; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    .doc-ref { font-size: 14px; font-family: monospace; color: #333; font-weight: 700; margin-top: 2px; }
    .badges { display: flex; align-items: center; gap: 10px; margin-top: 14px; margin-bottom: 22px; }
    .badge-solid { background: #1E2A5E; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 4px; }
    .badge-outline { border: 1.5px solid #1E2A5E; color: #1E2A5E; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 5px 12px; border-radius: 4px; }
    .emp-card { background: #F7F8FC; border: 1px solid #E4E7F0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .emp-row { display: flex; gap: 20px; margin-bottom: 14px; }
    .emp-row:last-child { margin-bottom: 0; }
    .emp-cell { flex: 1; }
    .field-label { font-size: 9px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
    .field-val { font-size: 14px; font-weight: 800; color: #111; }
    .field-val.blue { color: #1E2A5E; }
    .field-val.green { color: #15803d; }
    .field-val.sm { font-size: 13px; font-weight: 600; color: #333; }
    .status-badge { padding: 5px 16px; border-radius: 999px; font-size: 11px; font-weight: 800; margin-left: 12px; white-space: nowrap; }
    .status-paid { background: #f0fdf4; color: #15803d; border: 1.5px solid #bbf7d0; }
    .status-draft { background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; }
    .status-approved { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #bfdbfe; }
    .sal-section { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 0; }
    .sal-head { display: flex; border-bottom: 2px solid; padding-bottom: 8px; margin-bottom: 12px; }
    .sal-head.earn { color: #15803d; border-color: #16a34a; }
    .sal-head.ded { color: #b91c1c; border-color: #dc2626; }
    .col-head { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; }
    .sal-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .sal-row .lbl { color: #555; font-size: 13px; }
    .sal-row .val { font-weight: 700; font-size: 13px; }
    .sal-row .val.red { color: #b91c1c; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
    .totals { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 22px; }
    .total-item .t-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .total-item .t-val { font-size: 20px; font-weight: 900; color: #111; }
    .total-item .t-val.red { color: #b91c1c; }
    .net-box { border: 1.5px solid #d1d5db; border-radius: 10px; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; }
    .net-label-text { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #111; margin-bottom: 4px; }
    .net-sub { font-size: 11px; color: #888; }
    .net-amount { font-size: 42px; font-weight: 900; color: #111; letter-spacing: -1px; }
    .footer-note { text-align: center; font-size: 9px; color: #ccc; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="logo-circle"><span class="logo-text">NC</span></div>
      <div class="header-info">
        <h1>${emp.firstName || ''} ${emp.lastName || ''}</h1>
        <p>A-91, Sewak Park Near Dwarka Mor Metro Station, Gate No. 2 New Delhi – 110059 Delhi, India</p>
        <p>info@niventracapitaladvisory.com</p>
      </div>
    </div>
    <div class="header-right">
      <p class="doc-label">Document Ref</p>
      <p class="doc-ref">${(slip._id || '').toString().slice(-8).toUpperCase()}</p>
    </div>
  </div>
  <div class="badges">
    <span class="badge-solid">PAYSLIP FOR ${monthNameStr}</span>
    <span class="badge-outline">PAID DAYS: ${slip.paidDays || 30} DAYS</span>
  </div>
  <div class="emp-card">
    <div style="flex:1">
      <div class="emp-row">
        <div class="emp-cell"><p class="field-label">Employee Name</p><p class="field-val">${emp.firstName || ''} ${emp.lastName || ''}</p></div>
        <div class="emp-cell"><p class="field-label">Employee Code</p><p class="field-val">${emp.employeeCode || '—'}</p></div>
        <div class="emp-cell"><p class="field-label">Pay Month</p><p class="field-val blue">${monthNameStr}</p></div>
      </div>
      <div class="emp-row">
        <div class="emp-cell"><p class="field-label">Designation</p><p class="field-val sm">${emp.designation || '—'}</p></div>
        <div class="emp-cell"><p class="field-label">Department</p><p class="field-val sm">${emp.department || '—'}</p></div>
        <div class="emp-cell"><p class="field-label">Paid Days</p><p class="field-val green">${slip.paidDays || 30} Days / 30</p></div>
      </div>
    </div>
    <span class="status-badge ${slip.status === 'Paid' ? 'status-paid' : slip.status === 'Approved' ? 'status-approved' : 'status-draft'}">${(slip.status || '').toUpperCase()}</span>
  </div>
  <div class="sal-section">
    <div>
      <div class="sal-head earn"><span class="col-head">Earnings</span></div>
      <div class="sal-row"><span class="lbl">Basic Salary</span><span class="val">₹${fmt(slip.earnings?.basic)}</span></div>
      <div class="sal-row"><span class="lbl">House Rent Allowance</span><span class="val">₹${fmt(slip.earnings?.hra)}</span></div>
      <div class="sal-row"><span class="lbl">Travel Allowance</span><span class="val">₹${fmt(travelAllow)}</span></div>
      ${slip.earnings?.incentive > 0 ? `<div class="sal-row"><span class="lbl">Incentive</span><span class="val">₹${fmt(slip.earnings?.incentive)}</span></div>` : ''}
      ${slip.earnings?.bonus > 0 ? `<div class="sal-row"><span class="lbl">Performance Bonus</span><span class="val">₹${fmt(slip.earnings?.bonus)}</span></div>` : ''}
    </div>
    <div>
      <div class="sal-head ded"><span class="col-head">Deductions</span></div>
      <div class="sal-row"><span class="lbl">Provident Fund (PF)</span><span class="val red">₹${fmt(slip.deductions?.pf)}</span></div>
      <div class="sal-row"><span class="lbl">ESI Contribution</span><span class="val red">₹${fmt(slip.deductions?.esi)}</span></div>
      <div class="sal-row"><span class="lbl">Professional Tax</span><span class="val red">₹${fmt(slip.deductions?.professionalTax)}</span></div>
      <div class="sal-row"><span class="lbl">Income Tax (TDS)</span><span class="val red">₹${fmt(slip.deductions?.incomeTax)}</span></div>
    </div>
  </div>
  <hr class="divider" />
  <div class="totals">
    <div class="total-item"><p class="t-label">Gross Earnings</p><p class="t-val">₹${fmt(slip.grossSalary)}</p></div>
    <div class="total-item"><p class="t-label">Total Deductions</p><p class="t-val red">₹${fmt(slip.totalDeductions)}</p></div>
  </div>
  <div class="net-box">
    <div>
      <p class="net-label-text">Net Salary Payable</p>
      <p class="net-sub">Amount transferred to employee bank account</p>
    </div>
    <p class="net-amount">₹ ${fmt(slip.netSalary)}</p>
  </div>
  <p class="footer-note">This is a system generated document and is valid without a physical signature. Generated on ${new Date().toLocaleDateString()}</p>
</body>
</html>`;
                try {
                  const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
                  const canShare = await Sharing.isAvailableAsync();
                  if (canShare) {
                    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download Salary Slip PDF' });
                  } else {
                    Alert.alert('PDF Saved', `Slip saved to: ${uri}`);
                  }
                } catch (e) {
                  Alert.alert('Error', 'Could not generate PDF.');
                }
              }}
              style={{ backgroundColor: '#4ADE80', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <Download size={14} color="#14532d" />
              <Text style={{ color: '#14532d', fontWeight: '800', fontSize: 12 }}>PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Email button sub-bar */}
          {selectedPayrollSlip && (
            <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={async () => {
                  if (!selectedPayrollSlip) return;
                  const slip = selectedPayrollSlip;
                  const emp = slip.employeeId || {};
                  const monthNameStr = slip.monthYear
                    ? new Date(`${slip.monthYear}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
                    : slip.monthYear;
                  const fmt2 = (n: number) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                  const travelAllow2 = slip.earnings?.travelAllowance || slip.earnings?.metroAllowance || slip.earnings?.specialAllowance || 0;
                  const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;padding:32px;background:#fff;color:#111;font-size:13px;}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;margin-bottom:20px;border-bottom:1px solid #e5e7eb;}.header-left{display:flex;align-items:flex-start;gap:14px;}.logo-circle{width:56px;height:56px;border-radius:50%;border:2px solid #c7d2fe;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#eef2ff;}.logo-text{font-size:15px;font-weight:900;color:#1E2A5E;}.header-info h1{font-size:24px;font-weight:900;color:#111;margin-bottom:3px;}.header-info p{font-size:11px;color:#777;margin-bottom:1px;}.header-right{text-align:right;}.doc-label{font-size:9px;color:#aaa;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;}.doc-ref{font-size:14px;font-family:monospace;color:#333;font-weight:700;margin-top:2px;}.badges{display:flex;align-items:center;gap:10px;margin:14px 0 22px;}.badge-solid{background:#1E2A5E;color:#fff;font-size:10px;font-weight:800;letter-spacing:1.5px;padding:6px 14px;border-radius:4px;}.badge-outline{border:1.5px solid #1E2A5E;color:#1E2A5E;font-size:10px;font-weight:800;letter-spacing:1px;padding:5px 12px;border-radius:4px;}.emp-card{background:#F7F8FC;border:1px solid #E4E7F0;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;}.emp-row{display:flex;gap:20px;margin-bottom:14px;}.emp-cell{flex:1;}.field-label{font-size:9px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}.field-val{font-size:14px;font-weight:800;color:#111;}.field-val.blue{color:#1E2A5E;}.field-val.green{color:#15803d;}.field-val.sm{font-size:13px;font-weight:600;color:#333;}.status-badge{padding:5px 16px;border-radius:999px;font-size:11px;font-weight:800;margin-left:12px;}.status-paid{background:#f0fdf4;color:#15803d;border:1.5px solid #bbf7d0;}.status-draft{background:#fffbeb;color:#b45309;border:1.5px solid #fde68a;}.status-approved{background:#eff6ff;color:#1d4ed8;border:1.5px solid #bfdbfe;}.sal-section{display:grid;grid-template-columns:1fr 1fr;gap:28px;}.sal-head{display:flex;border-bottom:2px solid;padding-bottom:8px;margin-bottom:12px;}.sal-head.earn{color:#15803d;border-color:#16a34a;}.sal-head.ded{color:#b91c1c;border-color:#dc2626;}.col-head{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;}.sal-row{display:flex;justify-content:space-between;margin-bottom:10px;}.sal-row .lbl{color:#555;font-size:13px;}.sal-row .val{font-weight:700;font-size:13px;}.sal-row .val.red{color:#b91c1c;}.divider{border:none;border-top:1px solid #e5e7eb;margin:18px 0;}.totals{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:22px;}.total-item .t-label{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}.total-item .t-val{font-size:20px;font-weight:900;color:#111;}.total-item .t-val.red{color:#b91c1c;}.net-box{border:1.5px solid #d1d5db;border-radius:10px;padding:24px 28px;display:flex;justify-content:space-between;align-items:center;}.net-label-text{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#111;margin-bottom:4px;}.net-sub{font-size:11px;color:#888;}.net-amount{font-size:42px;font-weight:900;color:#111;letter-spacing:-1px;}.footer-note{text-align:center;font-size:9px;color:#ccc;margin-top:28px;}</style></head><body><div class="header"><div class="header-left"><div class="logo-circle"><span class="logo-text">NC</span></div><div class="header-info"><h1>${emp.firstName || ''} ${emp.lastName || ''}</h1><p>A-91, Sewak Park Near Dwarka Mor Metro Station, Gate No. 2 New Delhi – 110059 Delhi, India</p><p>info@niventracapitaladvisory.com</p></div></div><div class="header-right"><p class="doc-label">Document Ref</p><p class="doc-ref">${(slip._id || '').toString().slice(-8).toUpperCase()}</p></div></div><div class="badges"><span class="badge-solid">PAYSLIP FOR ${monthNameStr}</span><span class="badge-outline">PAID DAYS: ${slip.paidDays || 30} DAYS</span></div><div class="emp-card"><div style="flex:1"><div class="emp-row"><div class="emp-cell"><p class="field-label">Employee Name</p><p class="field-val">${emp.firstName || ''} ${emp.lastName || ''}</p></div><div class="emp-cell"><p class="field-label">Employee Code</p><p class="field-val">${emp.employeeCode || '—'}</p></div><div class="emp-cell"><p class="field-label">Pay Month</p><p class="field-val blue">${monthNameStr}</p></div></div><div class="emp-row"><div class="emp-cell"><p class="field-label">Designation</p><p class="field-val sm">${emp.designation || '—'}</p></div><div class="emp-cell"><p class="field-label">Department</p><p class="field-val sm">${emp.department || '—'}</p></div><div class="emp-cell"><p class="field-label">Paid Days</p><p class="field-val green">${slip.paidDays || 30} Days / 30</p></div></div></div><span class="status-badge ${slip.status === 'Paid' ? 'status-paid' : slip.status === 'Approved' ? 'status-approved' : 'status-draft'}">${(slip.status || '').toUpperCase()}</span></div><div class="sal-section"><div><div class="sal-head earn"><span class="col-head">Earnings</span></div><div class="sal-row"><span class="lbl">Basic Salary</span><span class="val">₹${fmt2(slip.earnings?.basic)}</span></div><div class="sal-row"><span class="lbl">House Rent Allowance</span><span class="val">₹${fmt2(slip.earnings?.hra)}</span></div><div class="sal-row"><span class="lbl">Travel Allowance</span><span class="val">₹${fmt2(travelAllow2)}</span></div>${slip.earnings?.incentive > 0 ? `<div class="sal-row"><span class="lbl">Incentive</span><span class="val">₹${fmt2(slip.earnings?.incentive)}</span></div>` : ''}${slip.earnings?.bonus > 0 ? `<div class="sal-row"><span class="lbl">Performance Bonus</span><span class="val">₹${fmt2(slip.earnings?.bonus)}</span></div>` : ''}</div><div><div class="sal-head ded"><span class="col-head">Deductions</span></div><div class="sal-row"><span class="lbl">Provident Fund (PF)</span><span class="val red">₹${fmt2(slip.deductions?.pf)}</span></div><div class="sal-row"><span class="lbl">ESI Contribution</span><span class="val red">₹${fmt2(slip.deductions?.esi)}</span></div><div class="sal-row"><span class="lbl">Professional Tax</span><span class="val red">₹${fmt2(slip.deductions?.professionalTax)}</span></div><div class="sal-row"><span class="lbl">Income Tax (TDS)</span><span class="val red">₹${fmt2(slip.deductions?.incomeTax)}</span></div></div></div><hr class="divider"/><div class="totals"><div class="total-item"><p class="t-label">Gross Earnings</p><p class="t-val">₹${fmt2(slip.grossSalary)}</p></div><div class="total-item"><p class="t-label">Total Deductions</p><p class="t-val red">₹${fmt2(slip.totalDeductions)}</p></div></div><div class="net-box"><div><p class="net-label-text">Net Salary Payable</p><p class="net-sub">Amount transferred to employee bank account</p></div><p class="net-amount">₹ ${fmt2(slip.netSalary)}</p></div><p class="footer-note">This is a system generated document. Generated on ${new Date().toLocaleDateString()}</p></body></html>`;
                  try {
                    const { uri } = await Print.printToFileAsync({ html: emailHtml, base64: false });
                    const canCompose = await MailComposer.isAvailableAsync();
                    if (canCompose) {
                      await MailComposer.composeAsync({
                        subject: `Salary Slip - ${emp.firstName || ''} ${emp.lastName || ''} (${monthNameStr})`,
                        body: `Dear ${emp.firstName || 'Employee'},\n\nPlease find your salary slip for ${monthNameStr} attached.\n\nRegards,\nNiventra Capital`,
                        attachments: [uri],
                      });
                    } else {
                      // Fallback: share the PDF if mail composer not available
                      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Send Salary Slip via Email' });
                    }
                  } catch (e) {
                    Alert.alert('Error', 'Could not open email. Please try again.');
                  }
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
              >
                <Mail size={15} color="#4338CA" />
                <Text style={{ color: '#4338CA', fontWeight: '700', fontSize: 13 }}>Email PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedPayrollSlip && (() => {
            const slip = selectedPayrollSlip;
            const emp = slip.employeeId || {};
            const monthNameStr = slip.monthYear
              ? new Date(`${slip.monthYear}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
              : slip.monthYear;
            const fmt = (n: number) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            const travelAllow = slip.earnings?.travelAllowance || slip.earnings?.metroAllowance || slip.earnings?.specialAllowance || 0;
            const statusColor = slip.status === 'Paid'
              ? { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' }
              : slip.status === 'Approved'
                ? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
                : { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
            return (
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* White slip card */}
                <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>

                  {/* Header */}
                  <View style={{ backgroundColor: '#fff', padding: 18, borderBottomWidth: 2.5, borderBottomColor: '#1E2A5E' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E2A5E', letterSpacing: 0.5 }}>Niventra Capital</Text>
                        <Text style={{ fontSize: 11, color: '#888', marginTop: 1 }}>Finance & Investment Company</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 }}>
                          <View style={{ backgroundColor: '#1E2A5E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 }}>PAYSLIP FOR {monthNameStr}</Text>
                          </View>
                          <View style={{ borderWidth: 1.5, borderColor: '#1E2A5E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                            <Text style={{ color: '#1E2A5E', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>PAID DAYS: {slip.paidDays || 30} DAYS</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                        <Text style={{ fontSize: 9, color: '#aaa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Document Ref</Text>
                        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#333', fontWeight: '600', marginTop: 2 }}>
                          {(slip._id || '').toString().slice(-8).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Employee Card */}
                  <View style={{ backgroundColor: '#F7F8FC', margin: 16, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E4E7F0' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Employee Name</Text>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#111' }}>{emp.firstName || ''} {emp.lastName || ''}</Text>
                          </View>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Employee Code</Text>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#111' }}>{emp.employeeCode || '—'}</Text>
                          </View>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Pay Month</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E2A5E' }}>{monthNameStr}</Text>
                          </View>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Designation</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>{emp.designation || '—'}</Text>
                          </View>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Department</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>{emp.department || '—'}</Text>
                          </View>
                          <View style={{ minWidth: '42%', marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Paid Days</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#16a34a' }}>{slip.paidDays || 30} Days / 30</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ backgroundColor: statusColor.bg, borderWidth: 1.5, borderColor: statusColor.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginLeft: 10, marginTop: 2 }}>
                        <Text style={{ color: statusColor.text, fontWeight: '800', fontSize: 11 }}>{(slip.status || '').toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Earnings & Deductions side by side */}
                  <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 16 }}>
                    {/* Earnings */}
                    <View style={{ flex: 1 }}>
                      <View style={{ borderBottomWidth: 2, borderBottomColor: '#16a34a', paddingBottom: 6, marginBottom: 12 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#15803d', textTransform: 'uppercase', letterSpacing: 1.5 }}>Earnings</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Basic Salary</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700' }}>₹{fmt(slip.earnings?.basic)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>House Rent Allow.</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700' }}>₹{fmt(slip.earnings?.hra)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Travel Allow.</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700' }}>₹{fmt(travelAllow)}</Text>
                      </View>
                      {slip.earnings?.incentive > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                          <Text style={{ fontSize: 12, color: '#555' }}>Incentive</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700' }}>₹{fmt(slip.earnings?.incentive)}</Text>
                        </View>
                      )}
                      {slip.earnings?.bonus > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                          <Text style={{ fontSize: 12, color: '#555' }}>Perf. Bonus</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700' }}>₹{fmt(slip.earnings?.bonus)}</Text>
                        </View>
                      )}
                    </View>

                    {/* Vertical divider */}
                    <View style={{ width: 1, backgroundColor: '#E4E7F0' }} />

                    {/* Deductions */}
                    <View style={{ flex: 1 }}>
                      <View style={{ borderBottomWidth: 2, borderBottomColor: '#dc2626', paddingBottom: 6, marginBottom: 12 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: 1.5 }}>Deductions</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Provident Fund</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#b91c1c' }}>₹{fmt(slip.deductions?.pf)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>ESI Contribution</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#b91c1c' }}>₹{fmt(slip.deductions?.esi)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Professional Tax</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#b91c1c' }}>₹{fmt(slip.deductions?.professionalTax)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Income Tax (TDS)</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#b91c1c' }}>₹{fmt(slip.deductions?.incomeTax)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Totals row */}
                  <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E4E7F0', marginHorizontal: 16, marginTop: 16, paddingTop: 12, paddingBottom: 12, justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Gross Earnings</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#111', marginTop: 2 }}>₹{fmt(slip.grossSalary)}</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#E4E7F0', marginHorizontal: 12 }} />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Total Deductions</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#b91c1c', marginTop: 2 }}>₹{fmt(slip.totalDeductions)}</Text>
                    </View>
                  </View>

                  {/* Net Salary Banner */}
                  <View style={{ margin: 16, borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 12, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: '#111' }}>Net Salary Payable</Text>
                      <Text style={{ fontSize: 10, color: '#888', marginTop: 3 }}>Amount transferred to employee bank account</Text>
                    </View>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: '#111', letterSpacing: -0.5 }}>₹{fmt(slip.netSalary)}</Text>
                  </View>

                  {/* Footer note */}
                  <Text style={{ textAlign: 'center', fontSize: 9, color: '#bbb', marginBottom: 18, paddingHorizontal: 16 }}>
                    This is a system generated document and is valid without a physical signature. Generated on {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </ScrollView>
            );
          })()}
        </View>
      </Modal>
    </View>
  );
};

// --- Attendance Sub-View ---
// --- Attendance Sub-View ---
const AttendanceView = () => {
  const { user } = useAuthStore();
  const userRole = (user?.role || '').toUpperCase().replace('_', '');
  const isAdmin = userRole === 'ADMIN' || userRole === 'KEYADMIN' || userRole === 'MANAGER';

  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [managerRecords, setManagerRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchManagerAttendance = async (dateStr: string) => {
    setLoading(true);
    try {
      const res: any = await apiCall(`/api/attendance/manager?date=${dateStr}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setManagerRecords(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res: any = await apiCall('/api/attendance/today');
      if (res.success && res.data) {
        setTodayStatus(res.data.record || res.data.data || res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMonthly = async () => {
    try {
      const res: any = await apiCall(`/api/attendance/monthly?month=${currentMonth}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data.records)
          ? res.data.records
          : Array.isArray(res.data.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];
        setMonthlyRecords(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchManagerAttendance(selectedDate);
    } else {
      fetchStatus();
      fetchMonthly();
    }
  }, [isAdmin, selectedDate]);

  const handlePunch = async (action: "IN" | "OUT") => {
    setPunching(true);
    try {
      const res = await apiCall('/api/attendance/punch', {
        method: 'POST',
        body: JSON.stringify({
          action,
          latitude: 28.5355,
          longitude: 77.3910,
        }),
      });

      if (res.success) {
        Alert.alert('Success', `Punched ${action} successfully!`);
        fetchStatus();
        fetchMonthly();
      } else {
        Alert.alert('Error', res.error || 'Failed to record punch.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error while punching in/out');
    } finally {
      setPunching(false);
    }
  };

  const formatPunchTime = (punchVal: any) => {
    if (!punchVal) return '-';
    if (typeof punchVal === 'string') {
      if (punchVal.includes(':')) return punchVal;
      const d = new Date(punchVal);
      return isNaN(d.getTime()) ? punchVal : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (punchVal.time) {
      const d = new Date(punchVal.time);
      return isNaN(d.getTime()) ? String(punchVal.time) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  // --- ADMIN & KEY ADMIN VIEW ---
  if (isAdmin) {
    const presentCount = managerRecords.filter(r => r.status === 'Present' || r.status === 'Half-Day' || r.punchIn).length;
    const absentCount = managerRecords.filter(r => r.status === 'Absent' && !r.punchIn).length;
    const lateCount = managerRecords.filter(r => r.metrics?.isLate || r.isLate || r.status === 'Late').length;

    return (
      <ScrollView contentContainerStyle={styles.attendanceContainer}>
        {/* Title */}
        <View style={{ marginBottom: spacing.m }}>
          <Text style={styles.empTitle}>All Employees Attendance</Text>
          <Text style={styles.empSubtitle}>
            Admin & Key Admin View — Live punch in & punch out status of all employees.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.m }}>
          <View style={[styles.empStatPill, { flex: 1, backgroundColor: colors.surfaceLight }]}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>TOTAL</Text>
            <Text style={{ fontSize: 18, color: colors.accent, fontWeight: 'bold' }}>{managerRecords.length}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: colors.surfaceLight }]}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>PRESENT</Text>
            <Text style={{ fontSize: 18, color: colors.success, fontWeight: 'bold' }}>{presentCount}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: colors.surfaceLight }]}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>ABSENT</Text>
            <Text style={{ fontSize: 18, color: colors.danger, fontWeight: 'bold' }}>{absentCount}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: colors.surfaceLight }]}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>LATE</Text>
            <Text style={{ fontSize: 18, color: colors.warning, fontWeight: 'bold' }}>{lateCount}</Text>
          </View>
        </View>

        {/* All Employees Attendance List */}
        <View style={styles.monthlyHistoryCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
            <Text style={styles.attCardTitle}>Employee Punch Records ({selectedDate})</Text>
          </View>

          <ScrollView horizontal style={{ marginTop: spacing.s }}>
            <View>
              <View style={styles.attTableHeader}>
                <Text style={[styles.attTableCol, { width: 160 }]}>Employee Name</Text>
                <Text style={[styles.attTableCol, { width: 100 }]}>Code / Dept</Text>
                <Text style={[styles.attTableCol, { width: 100 }]}>Status</Text>
                <Text style={[styles.attTableCol, { width: 100, textAlign: 'center' }]}>Punch In</Text>
                <Text style={[styles.attTableCol, { width: 100, textAlign: 'center' }]}>Punch Out</Text>
                <Text style={[styles.attTableCol, { width: 80, textAlign: 'right' }]}>Hours</Text>
              </View>

              {managerRecords.length === 0 ? (
                <Text style={[styles.noAttText, { marginVertical: 20 }]}>No employee records found.</Text>
              ) : (
                managerRecords.map((record, index) => {
                  const emp = record.employeeId || {};
                  const empName = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Unknown Employee';
                  const empCode = emp.employeeCode || '-';
                  const empDept = emp.department || emp.designation || '-';

                  return (
                    <View key={record._id || index} style={styles.attTableRow}>
                      <View style={{ width: 160 }}>
                        <Text style={[styles.empNameText, { fontSize: 13 }]} numberOfLines={1}>
                          {empName}
                        </Text>
                      </View>

                      <View style={{ width: 100 }}>
                        <Text style={[styles.empCodeText, { fontWeight: '600' }]}>{empCode}</Text>
                        <Text style={styles.photoTipText} numberOfLines={1}>{empDept}</Text>
                      </View>

                      <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[
                          styles.attStatusPill,
                          (record.status === "Present" || record.punchIn) ? styles.statusPresent : styles.statusAbsent
                        ]}>
                          <Text style={[
                            styles.attStatusPillText,
                            (record.status === "Present" || record.punchIn) ? styles.statusPresentText : styles.statusAbsentText
                          ]}>
                            {record.punchIn ? 'Punched In' : record.status || 'Absent'}
                          </Text>
                        </View>
                        {(record.metrics?.isLate || record.isLate) && (
                          <Text style={styles.lateStatusTextBadge}>Late</Text>
                        )}
                      </View>

                      <Text style={[styles.attTableCell, { width: 100, textAlign: 'center', fontWeight: '500' }]}>
                        {formatPunchTime(record.punchIn || record.inTime || record.punchInTime)}
                      </Text>
                      <Text style={[styles.attTableCell, { width: 100, textAlign: 'center', fontWeight: '500' }]}>
                        {formatPunchTime(record.punchOut || record.outTime || record.punchOutTime)}
                      </Text>
                      <Text style={[styles.attTableCell, { width: 80, textAlign: 'right', fontWeight: '600' }]}>
                        {record.metrics?.workingHours ? `${record.metrics.workingHours}h` : record.workingHours ? `${record.workingHours}h` : '-'}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  // --- STANDARD EMPLOYEE VIEW ---
  const hasPunchedIn = !!(
    todayStatus?.punchIn ||
    todayStatus?.inTime ||
    todayStatus?.punchInTime ||
    (todayStatus?.status && todayStatus?.status !== 'Absent') ||
    todayStatus?.hasPunchedIn
  );

  const hasPunchedOut = !!(
    todayStatus?.punchOut ||
    todayStatus?.outTime ||
    todayStatus?.punchOutTime ||
    todayStatus?.hasPunchedOut
  );

  return (
    <ScrollView contentContainerStyle={styles.attendanceContainer}>
      {/* Title */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={styles.empTitle}>Attendance Dashboard</Text>
        <Text style={styles.empSubtitle}>Track your daily punches and review monthly history.</Text>
      </View>

      {/* Action Center Card */}
      <View style={styles.attActionCard}>
        <Text style={styles.attCardTitle}>Action Center</Text>
        <Text style={styles.attCardSubTitle}>Record your daily attendance</Text>

        <View style={styles.clockDisplayBox}>
          <Text style={styles.clockTimeText}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
          <Text style={styles.clockDateText}>
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>

          {!hasPunchedIn && (
            <TouchableOpacity
              style={[styles.punchBtn, styles.punchInBtn, punching && styles.disabledButton]}
              onPress={() => handlePunch("IN")}
              disabled={punching}
            >
              {punching ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Clock size={18} color={colors.background} style={{ marginRight: 8 }} />
                  <Text style={styles.punchBtnText}>Punch In</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {hasPunchedIn && !hasPunchedOut && (
            <TouchableOpacity
              style={[styles.punchBtn, styles.punchOutBtn, punching && styles.disabledButton]}
              onPress={() => handlePunch("OUT")}
              disabled={punching}
            >
              {punching ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Clock size={18} color={colors.background} style={{ marginRight: 8 }} />
                  <Text style={styles.punchBtnText}>Punch Out</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {hasPunchedIn && hasPunchedOut && (
            <View style={styles.shiftCompletedBadge}>
              <UserCheck size={18} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.shiftCompletedText}>Shift Completed</Text>
            </View>
          )}
        </View>

        {hasPunchedIn && (
          <View style={{ marginTop: spacing.s }}>
            {/* Punch In Info Pill matching screenshot */}
            <View style={styles.punchInfoPillRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.punchInfoPillLabel}>Punch In</Text>
              </View>
              <Text style={styles.punchInfoPillVal}>
                {formatPunchTime(todayStatus?.punchIn || todayStatus?.inTime || todayStatus?.punchInTime)}
              </Text>
            </View>

            {/* Late Warning matching screenshot */}
            {(todayStatus?.metrics?.isLate || todayStatus?.isLate || todayStatus?.status === 'Late') && (
              <View style={styles.lateAlertBox}>
                <AlertCircle size={16} color={colors.warning} style={{ marginRight: 6 }} />
                <Text style={styles.lateAlertText}>You were marked Late today.</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Monthly History Card */}
      <View style={styles.monthlyHistoryCard}>
        <Text style={styles.attCardTitle}>Monthly History ({monthName})</Text>

        <View style={styles.attTableHeader}>
          <Text style={[styles.attTableCol, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.attTableCol, { flex: 1 }]}>Status</Text>
          <Text style={[styles.attTableCol, { flex: 1, textAlign: 'center' }]}>Punch In</Text>
          <Text style={[styles.attTableCol, { flex: 1, textAlign: 'center' }]}>Punch Out</Text>
          <Text style={[styles.attTableCol, { flex: 0.8, textAlign: 'right' }]}>Hours</Text>
        </View>

        {monthlyRecords.length === 0 ? (
          <Text style={styles.noAttText}>No attendance records found for this month.</Text>
        ) : (
          monthlyRecords.map((record, index) => (
            <View key={record._id || record.id || index} style={styles.attTableRow}>
              <Text style={[styles.attTableCell, { flex: 1.2, fontWeight: 'bold' }]}>
                {record.date ? record.date.slice(0, 10) : '-'}
              </Text>

              <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                  styles.attStatusPill,
                  record.status === "Present" ? styles.statusPresent : styles.statusAbsent
                ]}>
                  <Text style={[
                    styles.attStatusPillText,
                    record.status === "Present" ? styles.statusPresentText : styles.statusAbsentText
                  ]}>
                    {record.status || 'Present'}
                  </Text>
                </View>
                {(record.metrics?.isLate || record.isLate) && (
                  <Text style={styles.lateStatusTextBadge}>Late</Text>
                )}
              </View>

              <Text style={[styles.attTableCell, { flex: 1, textAlign: 'center' }]}>
                {formatPunchTime(record.punchIn || record.inTime || record.punchInTime)}
              </Text>
              <Text style={[styles.attTableCell, { flex: 1, textAlign: 'center' }]}>
                {formatPunchTime(record.punchOut || record.outTime || record.punchOutTime)}
              </Text>
              <Text style={[styles.attTableCell, { flex: 0.8, textAlign: 'right' }]}>
                {record.metrics?.workingHours ? `${record.metrics.workingHours}h` : record.workingHours ? `${record.workingHours}h` : '-'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// --- Leave Management Sub-View ---
const LeaveView = () => {
  const user = useAuthStore((state) => state.user);
  const userRoleStr = (user?.role || '').toUpperCase();
  const isAdminOrKeyAdmin = userRoleStr === 'ADMIN' || userRoleStr === 'KEY_ADMIN' || userRoleStr === 'KEYADMIN';

  const [activeTab, setActiveTab] = useState<'myLeaves' | 'teamApprovals'>('myLeaves');
  const [balances, setBalances] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, leavesRes, teamRes] = await Promise.all([
        apiCall('/api/leave/balances'),
        apiCall('/api/leave'),
        apiCall('/api/leave/manager')
      ]);

      if (balRes.success && balRes.data) {
        setBalances(balRes.data.balances);
      }
      if (leavesRes.success && leavesRes.data) {
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      }
      if (teamRes.success && teamRes.data) {
        setTeamLeaves(Array.isArray(teamRes.data) ? teamRes.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Validation Error', 'Please enter Start Date, End Date, and Reason.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await apiCall('/api/leave', {
        method: 'POST',
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          isHalfDay,
          reason,
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Leave requested successfully!');
        setShowApplyModal(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setIsHalfDay(false);
        fetchData();
      } else {
        Alert.alert('Error', res.error || 'Failed to request leave.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    Alert.alert(
      'Cancel Leave',
      'Are you sure you want to cancel this leave request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiCall('/api/leave/cancel', {
                method: 'POST',
                body: JSON.stringify({ leaveId }),
              });

              if (res.success) {
                Alert.alert('Success', 'Leave request cancelled.');
                fetchData();
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel leave.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleManagerAction = async (leaveId: string, action: "Approve" | "Reject") => {
    try {
      const res = await apiCall('/api/leave/manager', {
        method: 'POST',
        body: JSON.stringify({ leaveId, action, managerNotes: '' }),
      });

      if (res.success) {
        Alert.alert('Success', `Leave request ${action.toLowerCase()}d.`);
        fetchData();
      } else {
        Alert.alert('Error', res.error || `Failed to ${action.toLowerCase()} leave.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading leave balances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.leaveContainer}>
      {/* Title & Top Navigation Group */}
      <View style={styles.leaveHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Leave Management</Text>
          <Text style={styles.empSubtitle}>View your balances and apply for time off.</Text>
        </View>

        <View style={styles.leaveActionBtns}>
          {isAdminOrKeyAdmin && (
            <TouchableOpacity
              style={[styles.teamApprovalsBtn, activeTab === 'teamApprovals' && styles.teamApprovalsBtnActive]}
              onPress={() => setActiveTab(activeTab === 'myLeaves' ? 'teamApprovals' : 'myLeaves')}
            >
              <Text style={[styles.teamApprovalsText, activeTab === 'teamApprovals' && styles.teamApprovalsTextActive]}>
                {activeTab === 'myLeaves' ? 'Team Approvals' : 'My History'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.applyLeaveBtn} onPress={() => setShowApplyModal(true)}>
            <Plus size={16} color={colors.background} style={{ marginRight: 4 }} />
            <Text style={styles.applyLeaveBtnText}>Apply Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MY LEAVES TAB */}
      {activeTab === 'myLeaves' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Leave Balances Horizontal Grid */}
          <Text style={styles.sectionTitle}>Leave Balances</Text>
          <View style={styles.leaveBalancesGrid}>
            {Object.entries(balances || {}).map(([type, count]) => (
              <View key={type} style={styles.balanceCard}>
                <Text style={styles.balanceTypeLabel}>{type}</Text>
                <Text style={styles.balanceCountVal}>{count as number}</Text>
              </View>
            ))}
          </View>

          {/* Leave History Card */}
          <View style={styles.historyCard}>
            <Text style={styles.attCardTitle}>My Leave History</Text>

            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Type</Text>
              <Text style={[styles.attTableCol, { flex: 2 }]}>Dates</Text>
              <Text style={[styles.attTableCol, { flex: 1 }]}>Duration</Text>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Status</Text>
              <Text style={[styles.attTableCol, { flex: 0.8, textAlign: 'right' }]}>Action</Text>
            </View>

            {leaves.length === 0 ? (
              <Text style={styles.noAttText}>No leaves requested yet.</Text>
            ) : (
              leaves.map((leave) => {
                const isPending = leave.status === 'Pending';
                const isPast = new Date(leave.startDate) < new Date();

                return (
                  <View key={leave._id} style={styles.attTableRow}>
                    <Text style={[styles.attTableCell, { flex: 1.2, fontWeight: 'bold' }]}>{leave.leaveType}</Text>
                    <Text style={[styles.attTableCell, { flex: 2, fontSize: 11 }]}>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.attTableCell, { flex: 1, fontSize: 11 }]}>
                      {leave.isHalfDay ? 'Half Day' : 'Full Day'}
                    </Text>

                    <View style={{ flex: 1.2 }}>
                      <View style={[
                        styles.attStatusPill,
                        leave.status === 'Approved' ? styles.statusPresent :
                          leave.status === 'Rejected' ? styles.statusAbsent :
                            styles.statusPendingPill
                      ]}>
                        <Text style={[
                          styles.attStatusPillText,
                          leave.status === 'Approved' ? styles.statusPresentText :
                            leave.status === 'Rejected' ? styles.statusAbsentText :
                              styles.statusPendingText
                        ]}>
                          {leave.status}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                      {isPending && !isPast && (
                        <TouchableOpacity onPress={() => handleCancelLeave(leave._id)}>
                          <XCircle size={18} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        /* TEAM APPROVALS TAB */
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.historyCard}>
            <Text style={styles.attCardTitle}>Pending Team Leave Requests</Text>

            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { flex: 1.8 }]}>Employee</Text>
              <Text style={[styles.attTableCol, { flex: 1 }]}>Type</Text>
              <Text style={[styles.attTableCol, { flex: 2 }]}>Dates</Text>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Status</Text>
              <Text style={[styles.attTableCol, { flex: 1.5, textAlign: 'right' }]}>Actions</Text>
            </View>

            {teamLeaves.length === 0 ? (
              <Text style={styles.noAttText}>No team leave requests found!</Text>
            ) : (
              teamLeaves.map((leave) => (
                <View key={leave._id} style={styles.attTableRow}>
                  <View style={{ flex: 1.8 }}>
                    <Text style={styles.empNameText}>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</Text>
                    <Text style={styles.empCodeText}>{leave.employeeId?.employeeCode}</Text>
                  </View>

                  <Text style={[styles.attTableCell, { flex: 1, fontWeight: 'bold' }]}>{leave.leaveType}</Text>

                  <Text style={[styles.attTableCell, { flex: 2, fontSize: 11 }]}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </Text>

                  <View style={{ flex: 1.2 }}>
                    <View style={[
                      styles.attStatusPill,
                      leave.status === 'Approved' ? styles.statusPresent :
                        leave.status === 'Rejected' ? styles.statusAbsent :
                          styles.statusPendingPill
                    ]}>
                      <Text style={[
                        styles.attStatusPillText,
                        leave.status === 'Approved' ? styles.statusPresentText :
                          leave.status === 'Rejected' ? styles.statusAbsentText :
                            styles.statusPendingText
                      ]}>
                        {leave.status}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {leave.status === 'Pending' ? (
                      <>
                        <TouchableOpacity
                          style={styles.approveSmallBtn}
                          onPress={() => handleManagerAction(leave._id, 'Approve')}
                        >
                          <Text style={styles.approveSmallText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectSmallBtn}
                          onPress={() => handleManagerAction(leave._id, 'Reject')}
                        >
                          <Text style={styles.rejectSmallText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={{ fontSize: 10, color: colors.textMuted, fontStyle: 'italic' }}>Processed</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Apply Leave Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Time Off</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.formLabel}>Leave Type</Text>
              <View style={styles.typeSelectionRow}>
                {['Casual', 'Sick', 'Earned', 'Loss of Pay'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeSelectBtn, leaveType === type && styles.typeSelectBtnActive]}
                    onPress={() => setLeaveType(type)}
                  >
                    <Text style={[styles.typeSelectText, leaveType === type && styles.typeSelectTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Start Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2026-07-25"
                placeholderTextColor={colors.textMuted}
                value={startDate}
                onChangeText={setStartDate}
              />

              <Text style={styles.formLabel}>End Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2026-07-26"
                placeholderTextColor={colors.textMuted}
                value={endDate}
                onChangeText={setEndDate}
              />

              <TouchableOpacity
                style={styles.halfDayCheckboxRow}
                onPress={() => setIsHalfDay(!isHalfDay)}
              >
                <View style={[styles.customCheckbox, isHalfDay && styles.customCheckboxChecked]} />
                <Text style={styles.halfDayLabelText}>Half Day Request</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>Reason *</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter reason for leave..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={reason}
                onChangeText={setReason}
              />

              <View style={styles.structFormActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowApplyModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, submitLoading && styles.disabledButton]}
                  onPress={handleApplyLeave}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.saveBtnText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Holidays Sub-View ---
const HolidaysView = () => {
  const user = useAuthStore((state) => state.user);
  const userRoleStr = (user?.role || '').toUpperCase();
  const isAdminOrKeyAdmin = userRoleStr === 'ADMIN' || userRoleStr === 'KEY_ADMIN' || userRoleStr === 'KEYADMIN';

  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Public',
    description: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/holidays');
      if (res.success && res.data) {
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setHolidays(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleEditHoliday = (holiday: any) => {
    setEditingId(holiday._id || holiday.id);
    const dateStr = holiday.date ? String(holiday.date).substring(0, 10) : '';
    setFormData({
      name: holiday.name || '',
      date: dateStr,
      type: holiday.type || 'Public',
      description: holiday.description || '',
    });
    setShowAddCard(true);
  };

  const handleDeleteHoliday = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this holiday?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiCall(`/api/holidays/${id}`, { method: 'DELETE' });
              if (res.success) {
                Alert.alert('Success', 'Holiday deleted successfully!');
                fetchHolidays();
              } else {
                Alert.alert('Error', res.error || 'Failed to delete holiday.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          },
        },
      ]
    );
  };

  const handleSaveHoliday = async () => {
    if (!formData.name || !formData.date) {
      Alert.alert('Validation Error', 'Please enter Holiday Name and Date.');
      return;
    }

    setSubmitLoading(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/holidays/${editingId}` : '/api/holidays';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.success) {
        Alert.alert('Success', isEdit ? 'Holiday updated successfully!' : 'Holiday added successfully!');
        setShowAddCard(false);
        setEditingId(null);
        setFormData({ name: '', date: '', type: 'Public', description: '' });
        fetchHolidays();
      } else {
        Alert.alert('Error', res.error || 'Failed to save holiday.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading holiday calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.holidayContainer}>
      {/* Title & Add Button */}
      <View style={styles.holidayHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Holiday Calendar</Text>
          <Text style={styles.empSubtitle}>View upcoming company and public holidays.</Text>
        </View>

        {isAdminOrKeyAdmin && (
          <TouchableOpacity
            style={styles.addHolidayBtn}
            onPress={() => setShowAddCard(!showAddCard)}
          >
            <Plus size={16} color={colors.background} style={{ marginRight: 4 }} />
            <Text style={styles.addHolidayBtnText}>Add Holiday</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add New Holiday Form Card matching screenshot */}
      {showAddCard && (
        <View style={styles.addHolidayCard}>
          <Text style={styles.addHolidayCardTitle}>{editingId ? 'Edit Holiday' : 'Add New Holiday'}</Text>

          <View style={styles.formRow2Col}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Holiday Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Christmas"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Date (YYYY-MM-DD) *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{
                    height: 44,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    paddingLeft: 12,
                    paddingRight: 12,
                    fontSize: 14,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.modalTextInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: formData.date ? colors.text : colors.textMuted, fontSize: 14 }}>
                      {formData.date || 'Select Date'}
                    </Text>
                    <Calendar size={18} color={colors.accent} />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.date && !isNaN(new Date(formData.date).getTime()) ? new Date(formData.date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          const yyyy = selectedDate.getFullYear();
                          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const dd = String(selectedDate.getDate()).padStart(2, '0');
                          setFormData({ ...formData, date: `${yyyy}-${mm}-${dd}` });
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          <Text style={styles.formLabel}>Type</Text>
          <View style={styles.typeSelectionRow}>
            {['Public', 'Company', 'Optional'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeSelectBtn, formData.type === type && styles.typeSelectBtnActive]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text style={[styles.typeSelectText, formData.type === type && styles.typeSelectTextActive]}>
                  {type} Holiday
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.modalTextInput}
            placeholder="Optional description..."
            placeholderTextColor={colors.textMuted}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
          />

          <View style={styles.structFormActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAddCard(false);
                setEditingId(null);
                setFormData({ name: '', date: '', type: 'Public', description: '' });
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitLoading && styles.disabledButton]}
              onPress={handleSaveHoliday}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>{editingId ? 'Update Holiday' : 'Save Holiday'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Holiday Cards Grid */}
      <View style={styles.holidayGrid}>
        {holidays.map((holiday, idx) => (
          <View key={holiday._id || holiday.id || `holiday-${idx}`} style={styles.holidayCardItem}>
            <View style={styles.holidayIconBox}>
              <Calendar size={22} color={colors.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.holidayNameText}>{holiday.name}</Text>
              <Text style={styles.holidayDateText}>
                {holiday.date
                  ? new Date(typeof holiday.date === 'string' && holiday.date.includes('T') ? holiday.date : `${holiday.date.substring(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : '-'}
              </Text>

              <View style={styles.holidayTypeTag}>
                <Text style={styles.holidayTypeTagText}>{holiday.type || 'Public'} Holiday</Text>
              </View>

              {holiday.description ? (
                <Text style={styles.holidayDescText}>{holiday.description}</Text>
              ) : null}
            </View>

            {/* Action Buttons: Edit & Delete (Admin / KeyAdmin Only) */}
            {isAdminOrKeyAdmin && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <TouchableOpacity
                  style={{ padding: 6, borderRadius: 6, backgroundColor: colors.surfaceLight }}
                  onPress={() => handleEditHoliday(holiday)}
                >
                  <Edit size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.12)' }}
                  onPress={() => handleDeleteHoliday(holiday._id || holiday.id)}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {holidays.length === 0 && (
          <View style={styles.emptyHolidaysBox}>
            <Text style={styles.emptyHolidaysText}>No upcoming holidays found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// --- Leads Pipeline Sub-View ---
const LeadsView = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');

  // Add Lead Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [leadStage, setLeadStage] = useState('New');
  const [leadPriority, setLeadPriority] = useState('Medium');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Detail View Mode State
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [timelineNotes, setTimelineNotes] = useState<any[]>([]);

  const user = useAuthStore((state) => state.user);
  const userRole = ((user?.role || '') as string).toUpperCase();
  const isAdminOrKeyAdmin = userRole === 'ADMIN' || userRole === 'KEY_ADMIN';

  // Import / Export / Assign States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<any>(null);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [selectedAssignEE, setSelectedAssignEE] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchEmployeesForAssign = async () => {
    try {
      const res: any = await apiCall('/api/employees');
      if (res && res.success && res.data) {
        setEmployeeList(Array.isArray(res.data) ? res.data : []);
      } else if (Array.isArray(res)) {
        setEmployeeList(res);
      }
    } catch (e) {
      console.error('Error fetching employees:', e);
    }
  };

  const openAssignModal = (lead: any) => {
    setLeadToAssign(lead);
    setSelectedAssignEE(lead.assignedTo || lead.owner || '');
    setShowAssignModal(true);
    fetchEmployeesForAssign();
  };

  const handleAssignLead = async () => {
    if (!leadToAssign || !selectedAssignEE) {
      Alert.alert('Selection Error', 'Please select an employee to assign this lead to.');
      return;
    }
    setAssigning(true);
    try {
      const targetId = leadToAssign._id || leadToAssign.id;
      const updatedLead = { ...leadToAssign, assignedTo: selectedAssignEE, owner: selectedAssignEE };
      if (targetId && !String(targetId).startsWith('default-')) {
        await apiCall(`/api/leads/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify({ assignedTo: selectedAssignEE, owner: selectedAssignEE }),
        });
      }
      setLeads((prev) => prev.map((l) => (l._id === targetId || l.id === targetId ? updatedLead : l)));
      if (selectedLead && (selectedLead._id === targetId || selectedLead.id === targetId)) {
        setSelectedLead(updatedLead);
      }
      Alert.alert('Lead Assigned', `Lead successfully assigned to ${selectedAssignEE}`);
      setShowAssignModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to assign lead');
    } finally {
      setAssigning(false);
    }
  };

  const handleExportLeads = async () => {
    const listToExport = leads.length > 0 ? leads : [
      { firstName: 'Ashish', lastName: 'Kumar', phone: '7895825505', email: 'ashish@example.com', company: 'E2E', stage: 'Negotiation', status: 'OPEN', priority: 'Medium', assignedTo: 'ashish kumar' }
    ];

    const headers = 'First Name,Last Name,Phone,Email,Company,Stage,Status,Priority,Assigned To\n';
    const rows = listToExport.map((l) =>
      `"${l.firstName || ''}","${l.lastName || ''}","${l.phone || ''}","${l.email || ''}","${l.company || ''}","${l.stage || ''}","${l.status || ''}","${l.priority || ''}","${l.assignedTo || l.owner || ''}"`
    ).join('\n');

    const csvContent = headers + rows;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        await Sharing.shareAsync(`data:text/csv;base64,${btoa(csvContent)}`, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Leads CSV',
        });
      } catch (e: any) {
        Alert.alert('Export Leads', `CSV data ready:\n\n${csvContent.slice(0, 300)}...`);
      }
    }
  };

  const handleImportLeads = async () => {
    if (!importCsvText.trim()) {
      Alert.alert('Validation Error', 'Please enter CSV content to import.');
      return;
    }
    setImporting(true);
    try {
      const lines = importCsvText.trim().split('\n');
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0].toLowerCase() !== 'first name') {
          await apiCall('/api/leads', {
            method: 'POST',
            body: JSON.stringify({
              firstName: parts[0] || 'Lead',
              lastName: parts[1] || 'Imported',
              phone: parts[2] || '',
              email: parts[3] || '',
              company: parts[4] || '',
              stage: parts[5] || 'New',
              status: parts[6] || 'Open',
              priority: parts[7] || 'Medium',
              assignedTo: parts[8] || '',
            }),
          });
          count++;
        }
      }
      Alert.alert('Import Complete', `Successfully imported ${count} leads.`);
      setShowImportModal(false);
      setImportCsvText('');
      fetchLeads();
    } catch (e: any) {
      Alert.alert('Import Error', e.message || 'Failed to import leads');
    } finally {
      setImporting(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (stage) query.append('stage', stage);
      if (status) query.append('status', status);

      const res = await apiCall(`/api/leads?${query.toString()}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setLeads(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stage, status]);

  const handleAddLead = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First Name and Last Name are required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await apiCall('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company,
          value: Number(leadValue) || 0,
          stage: leadStage,
          priority: leadPriority,
          status: 'Open',
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Lead created successfully!');
        setShowAddModal(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setLeadValue('');
        fetchLeads();
      } else {
        Alert.alert('Error', res.error || 'Failed to create lead.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePostNote = () => {
    if (!noteText.trim()) return;
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString()}`;
    setTimelineNotes([
      { id: Date.now().toString(), type: 'note', text: noteText.trim(), date: dateStr },
      ...timelineNotes,
    ]);
    setNoteText('');
  };

  const handleStageChange = async (newStageName: string) => {
    if (!selectedLead) return;
    const oldStage = selectedLead.stage || 'New';
    if (oldStage.toUpperCase() === newStageName.toUpperCase()) return;

    const updatedLead = { ...selectedLead, stage: newStageName };
    setSelectedLead(updatedLead);
    setLeads((prev) => prev.map((l) => (l._id === selectedLead._id || l.id === selectedLead.id ? updatedLead : l)));

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString()}`;
    setTimelineNotes((prev) => [
      { id: Date.now().toString(), type: 'stage', text: `Stage updated from ${oldStage} to ${newStageName}`, date: dateStr },
      ...prev,
    ]);

    try {
      const targetId = selectedLead._id || selectedLead.id;
      if (targetId && !String(targetId).startsWith('default-')) {
        await apiCall(`/api/leads/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify({ stage: newStageName }),
        });
      }
    } catch (e) {
      console.error('Error updating stage:', e);
    }
  };

  // If a lead is selected, render full-screen 1:1 Lead Detail & Timeline view mode (Screenshot 2)
  if (selectedLead) {
    const leadName = `${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() || 'Lead Details';
    const activeStageName = (selectedLead.stage || 'New').toUpperCase();
    const stagesList = [
      { num: 1, name: 'NEW' },
      { num: 2, name: 'CONTACTED' },
      { num: 3, name: 'QUALIFIED' },
      { num: 4, name: 'PROPOSAL' },
      { num: 5, name: 'NEGOTIATION' },
    ];

    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Top Header Row with Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
            onPress={() => setSelectedLead(null)}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>{leadName}</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Lead Details & Timeline</Text>
          </View>
        </View>

        {/* 5-Stage Header Banner matching screenshot 2 */}
        <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          {stagesList.map((st) => {
            const isActive = activeStageName === st.name || activeStageName.includes(st.name);
            return (
              <TouchableOpacity
                key={st.num}
                style={{ alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4 }}
                onPress={() => handleStageChange(st.name)}
                activeOpacity={0.7}
              >
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isActive ? '#3b82f6' : '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: isActive ? 2 : 0, borderColor: '#60a5fa' }}>
                  <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 13 }}>{st.num}</Text>
                </View>
                <Text style={{ color: isActive ? '#60a5fa' : '#94a3b8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{st.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16 }}>
          {/* Left Column: Lead Owner, Contact Info, Attachments */}
          <View style={{ flex: Platform.OS === 'web' ? 1 : undefined, gap: 14 }}>
            {/* Card 1: Lead Owner */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <UserIcon size={18} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Lead Owner</Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 }}>ASSIGNED TO</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 4 }}>
                {selectedLead.assignedTo || selectedLead.owner || 'Unassigned'}
              </Text>
              {isAdminOrKeyAdmin && (
                <TouchableOpacity
                  style={{ backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 6, alignItems: 'center', marginTop: 8 }}
                  onPress={() => openAssignModal(selectedLead)}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 11 }}>Re-assign Lead</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Card 2: Contact Info */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <UserIcon size={18} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Contact Info</Text>
              </View>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Building size={16} color={colors.textMuted} />
                  <Text style={{ fontSize: 13, color: colors.text }}>{selectedLead.company || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color={colors.info} />
                  <Text style={{ fontSize: 13, color: colors.info, fontWeight: '700' }}>{selectedLead.phone || selectedLead.email || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Target size={16} color={colors.textMuted} />
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>Source: {selectedLead.source || 'Direct'}</Text>
                </View>
              </View>
            </View>

            {/* Card 3: Attachments */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FileText size={18} color={colors.success} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Attachments</Text>
                </View>
                <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12.5, color: colors.textMuted }}>No attachments uploaded</Text>
            </View>
          </View>

          {/* Right Column: Timeline & Log Note */}
          <View style={{ flex: Platform.OS === 'web' ? 2 : undefined, gap: 14 }}>
            {/* Top Post Note Input Box */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TextInput
                style={{ flex: 1, height: 42, backgroundColor: colors.surfaceLight, borderRadius: 8, paddingHorizontal: 12, color: colors.text, fontSize: 13 }}
                placeholder="Log a call, write a note, or set a reminder..."
                placeholderTextColor={colors.textMuted}
                value={noteText}
                onChangeText={setNoteText}
              />
              <TouchableOpacity
                style={{ backgroundColor: colors.accent, paddingHorizontal: 16, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                onPress={handlePostNote}
              >
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>Post Note</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Timeline Card matching screenshot 2 */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <ActivityIndicator size="small" color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>Lead Activity Timeline</Text>
              </View>

              {/* Timeline Items */}
              <View style={{ gap: 14 }}>
                {timelineNotes.map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.type === 'note' ? '#fef3c7' : '#eff6ff', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                      <MessageSquare size={14} color={item.type === 'note' ? '#d97706' : colors.accent} />
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: 'right', marginBottom: 4 }}>{item.date}</Text>
                      <Text style={{ fontSize: 12.5, color: item.type === 'stage' ? colors.accent : colors.text, fontWeight: item.type === 'stage' ? '800' : '500' }}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // MAIN PIPELINE LIST VIEW (Screenshot 1)
  return (
    <View style={styles.leadsContainer}>
      {/* Title & Add Button Header Row */}
      <View style={styles.leadsHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Lead Management</Text>
          <Text style={styles.empSubtitle}>Track pipeline stages, assign leads, and monitor workloads.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={styles.addLeadBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addLeadBtnText}>Add Lead</Text>
          </TouchableOpacity>

          {isAdminOrKeyAdmin && (
            <>
              <TouchableOpacity
                style={[styles.addLeadBtn, { backgroundColor: '#059669' }]}
                onPress={() => setShowImportModal(true)}
              >
                <Download size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.addLeadBtnText}>Import CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addLeadBtn, { backgroundColor: '#7c3aed' }]}
                onPress={handleExportLeads}
              >
                <UploadCloud size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.addLeadBtnText}>Export CSV</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Top 4 KPI Metric Cards in clean 2x2 responsive Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {/* Card 1: Total Leads */}
        <View style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 }}>TOTAL LEADS</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 4 }}>{leads.length || 1}</Text>
        </View>

        {/* Card 2: Distributed & Locked */}
        <View style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#d97706', letterSpacing: 0.5 }}>🔒 DISTRIBUTED & LOCKED</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#d97706', marginTop: 4 }}>0</Text>
        </View>

        {/* Card 3: Marked Done */}
        <View style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 0.5 }}>✔ MARKED DONE</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#059669', marginTop: 4 }}>0</Text>
        </View>

        {/* Card 4: Today / Scheduled */}
        <View style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#7c3aed', letterSpacing: 0.5 }}>📅 TODAY / SCHEDULED</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#7c3aed', marginTop: 4 }}>0</Text>
        </View>
      </View>

      {/* Filter Pipeline Card matching screenshot 1 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ gap: 12 }}>
          {/* SEARCH */}
          <View>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textMuted, marginBottom: 4, letterSpacing: 0.5 }}>SEARCH</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, height: 42 }}>
              <Search size={15} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, color: colors.text, fontSize: 13 }}
                placeholder="Search by name, company, email, phone..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={fetchLeads}
              />
            </View>
          </View>

          {/* STAGE SELECTOR PILLS */}
          <View>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textMuted, marginBottom: 6, letterSpacing: 0.5 }}>STAGE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: stage === st ? colors.accent : colors.surfaceLight,
                    borderWidth: 1,
                    borderColor: stage === st ? colors.accent : colors.border,
                  }}
                  onPress={() => setStage(st)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: stage === st ? '#ffffff' : colors.text }}>
                    {st || 'All Stages'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Pipeline Submit Button */}
          <TouchableOpacity
            style={{ backgroundColor: colors.accent, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
            onPress={fetchLeads}
          >
            <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 14 }}>Filter Pipeline</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leads Mobile Cards List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
        ) : leads.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginVertical: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>No leads found in pipeline.</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Click "Add Lead" or "Import CSV" to create leads.</Text>
          </View>
        ) : (
          leads.map((lead) => (
            <TouchableOpacity
              key={lead._id || lead.id}
              style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
              onPress={() => setSelectedLead(lead)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} color={colors.textMuted} />
                    <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>{lead.firstName} {lead.lastName}</Text>
                  </View>
                  <Text style={{ fontSize: 12.5, color: colors.info, fontWeight: '700', marginTop: 2 }}>{lead.phone || lead.email || 'No contact info'}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#d97706' }}>{lead.stage || 'New'}</Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.textMuted, marginTop: 2 }}>{lead.status || 'OPEN'}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border, marginVertical: 4 }}>
                <View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>COMPANY</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.text, marginTop: 2 }}>{lead.company || 'N/A'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>PRIORITY</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#d97706', marginTop: 2 }}>{lead.priority || 'Medium'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>OWNER</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.text, marginTop: 2 }}>{lead.assignedTo || lead.owner || 'Unassigned'}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Follow-up: {lead.nextFollowUp || 'Not set'}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {isAdminOrKeyAdmin && (
                    <TouchableOpacity
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6' }}
                      onPress={() => openAssignModal(lead)}
                    >
                      <Text style={{ color: '#3b82f6', fontWeight: '800', fontSize: 12 }}>👤 Assign</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={{ backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                    onPress={() => setSelectedLead(lead)}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Lead Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.structModalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.structModalTitle}>Add New Lead</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput style={styles.inputField} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={colors.textMuted} />

              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput style={styles.inputField} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={colors.textMuted} />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.inputField} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" placeholderTextColor={colors.textMuted} />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.inputField} value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />

              <Text style={styles.inputLabel}>Company</Text>
              <TextInput style={styles.inputField} value={company} onChangeText={setCompany} placeholder="Company name" placeholderTextColor={colors.textMuted} />

              <Text style={styles.inputLabel}>Estimated Value (RS)</Text>
              <TextInput style={styles.inputField} value={leadValue} onChangeText={setLeadValue} placeholder="100000" keyboardType="numeric" placeholderTextColor={colors.textMuted} />

              <View style={styles.structFormActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, submitLoading && styles.disabledButton]}
                  onPress={handleAddLead}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Lead</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assign Lead Modal (Admin / KeyAdmin) */}
      <Modal visible={showAssignModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.structModalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.structModalTitle}>Assign Lead Owner</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12, maxHeight: 300 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
                Select an employee to assign lead "{leadToAssign?.firstName} {leadToAssign?.lastName}" to:
              </Text>

              {(employeeList.length > 0 ? employeeList : [
                { id: '1', name: 'ashish kumar', employeeCode: 'EMP-001', department: 'Sales' },
                { id: '2', name: 'John Doe', employeeCode: 'EMP-002', department: 'Support' },
                { id: '3', name: 'Sarah Smith', employeeCode: 'EMP-003', department: 'Marketing' },
              ]).map((emp: any) => {
                const empName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;
                const isSelected = selectedAssignEE === empName;
                return (
                  <TouchableOpacity
                    key={emp.id || emp._id || empName}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : colors.surfaceLight,
                      borderWidth: 1,
                      borderColor: isSelected ? '#3b82f6' : colors.border,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justify: 'space-between',
                    }}
                    onPress={() => setSelectedAssignEE(empName)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>{empName}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>{emp.employeeCode || emp.email || 'Employee'} • {emp.department || 'CRM'}</Text>
                    </View>
                    {isSelected && <Text style={{ color: '#3b82f6', fontWeight: '900', fontSize: 16 }}>✔</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.structFormActions, { marginTop: 16 }]}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAssignModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#3b82f6' }, assigning && styles.disabledButton]}
                onPress={handleAssignLead}
                disabled={assigning}
              >
                {assigning ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Confirm Assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import CSV Modal (Admin / KeyAdmin) */}
      <Modal visible={showImportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.structModalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.structModalTitle}>Import Leads (CSV / Text)</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                Paste CSV content below (Format: First Name, Last Name, Phone, Email, Company, Stage, Status, Priority, Owner):
              </Text>

              <TextInput
                style={[styles.inputField, { height: 140, textAlignVertical: 'top', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11 }]}
                multiline
                value={importCsvText}
                onChangeText={setImportCsvText}
                placeholder={`Ashish, Kumar, 7895825505, ashish@example.com, E2E, Negotiation, Open, Medium, ashish kumar\nRahul, Sharma, 9876543210, rahul@example.com, TechCorp, Qualified, Open, High, ashish kumar`}
                placeholderTextColor={colors.textMuted}
              />

              <View style={[styles.structFormActions, { marginTop: 16 }]}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowImportModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: '#059669' }, importing && styles.disabledButton]}
                  onPress={handleImportLeads}
                  disabled={importing}
                >
                  {importing ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Import Leads Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Report Generator Sub-View ---
const ReportsView = () => {
  const [reportType, setReportType] = useState('Attendance');
  const [dateFilter, setDateFilter] = useState('month');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [summary, setSummary] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setHasRun(true);
    try {
      const query = new URLSearchParams({ type: reportType });
      if (dateFilter === 'month') query.append('month', monthYear);
      if (dateFilter === 'year') query.append('year', year);

      const res = await apiCall(`/api/reports/generator?${query.toString()}`);
      if (res.success && res.data) {
        setSummary(res.data.summary || []);
        setRows(res.data.rows || []);
      } else {
        Alert.alert('Error', res.error || 'Failed to generate report.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    'Attendance', 'Leave', 'Salary', 'Wallet', 'Employee', 'Department', 'Lead'
  ];

  return (
    <ScrollView contentContainerStyle={styles.reportsContainer}>
      {/* Title */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={styles.empTitle}>Report Generator</Text>
        <Text style={styles.empSubtitle}>Generate, visualize, and export data across all modules.</Text>
      </View>

      {/* Control Panel Card matching screenshot */}
      <View style={styles.reportsControlCard}>
        <Text style={styles.filterGroupLabel}>REPORT TYPE</Text>
        <View style={styles.typeSelectionRow}>
          {reportOptions.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.smallFilterPill, reportType === t && styles.smallFilterPillActive]}
              onPress={() => setReportType(t)}
            >
              <Text style={[styles.smallFilterText, reportType === t && styles.smallFilterTextActive]}>
                {t} Report
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.s }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.filterGroupLabel}>DATE FILTER</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[styles.smallFilterPill, dateFilter === 'month' && styles.smallFilterPillActive]}
                onPress={() => setDateFilter('month')}
              >
                <Text style={[styles.smallFilterText, dateFilter === 'month' && styles.smallFilterTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallFilterPill, dateFilter === 'year' && styles.smallFilterPillActive]}
                onPress={() => setDateFilter('year')}
              >
                <Text style={[styles.smallFilterText, dateFilter === 'year' && styles.smallFilterTextActive]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1.2 }}>
            <Text style={styles.filterGroupLabel}>{dateFilter === 'month' ? 'MONTH' : 'YEAR'}</Text>
            {dateFilter === 'month' ? (
              <TextInput
                style={styles.reportsInput}
                placeholder="YYYY-MM"
                placeholderTextColor={colors.textMuted}
                value={monthYear}
                onChangeText={setMonthYear}
              />
            ) : (
              <TextInput
                style={styles.reportsInput}
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.generateReportBtn, loading && styles.disabledButton]}
          onPress={fetchReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Search size={16} color={colors.background} style={{ marginRight: 6 }} />
              <Text style={styles.generateReportBtnText}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Generated Report Data Results Area */}
      {hasRun && !loading && (
        <View style={styles.historyCard}>
          {summary.length > 0 && (
            <View style={styles.summaryBadgesRow}>
              {summary.map((item: any, idx: number) => (
                <View key={idx} style={styles.summaryBadgeCard}>
                  <Text style={styles.summaryBadgeLabel}>{item.name}</Text>
                  <Text style={styles.summaryBadgeVal}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}

          {rows.length > 0 ? (
            <ScrollView horizontal style={{ marginTop: spacing.s }}>
              <View>
                <View style={styles.attTableHeader}>
                  {Object.keys(rows[0]).map((key) => (
                    <Text key={key} style={[styles.attTableCol, { width: 110, paddingHorizontal: 4 }]}>
                      {key}
                    </Text>
                  ))}
                </View>
                {rows.map((row: any, rIdx: number) => (
                  <View key={rIdx} style={styles.attTableRow}>
                    {Object.values(row).map((val: any, vIdx: number) => (
                      <Text key={vIdx} style={[styles.attTableCell, { width: 110, paddingHorizontal: 4 }]}>
                        {String(val)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noAttText}>No records matching your selected report criteria.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// --- Settings Sub-View ---
const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("Company Profile");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const TABS = [
    { name: "Company Profile", icon: Building },
    { name: "Departments", icon: Users },
    { name: "Designations", icon: Briefcase },
    { name: "Office Locations", icon: Building },
    { name: "Policies", icon: Umbrella },
    { name: "Email Templates", icon: Mail },
    { name: "SMS Templates", icon: MessageSquare },
    { name: "Integrations", icon: Plug },
    { name: "Access Control", icon: Shield }
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/settings");
      if (res.success && res.data) {
        // API returns { success, data: settingsObj } — apiCall wraps it, so actual settings may be nested
        const settingsData = res.data.data || res.data;
        setSettings(settingsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await apiCall("/api/users");
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "Access Control" && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const res = await apiCall("/api/users", {
        method: "PUT",
        body: JSON.stringify({ email, role: newRole }),
      });
      if (res.success) {
        setUsers(users.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
        Alert.alert("Success", "Role updated successfully!");
      } else {
        Alert.alert("Error", res.error || "Failed to update role.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error updating role.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiCall("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      if (res.success) {
        // Sync back saved data from server
        if (res.data) {
          const savedData = res.data.data || res.data;
          setSettings(savedData);
        }
        Alert.alert("Success", "Master settings saved successfully!");
      } else {
        Alert.alert("Error", res.error || "Failed to save settings.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(s => s);
    setSettings({ ...settings, [field]: arr });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.placeholderSection}>
        <Text style={styles.placeholderTitle}>Access Restricted</Text>
        <Text style={styles.placeholderSubtitle}>Failed to load settings. Master settings require Administrator access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer}>
      {/* Title & Save Button Header */}
      <View style={styles.settingsHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Master Settings</Text>
          <Text style={styles.empSubtitle}>Configure global application parameters.</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveSettingsBtn, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.saveSettingsBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Horizontal Nav Bar matching screenshot side list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.settingsTabScroll}>
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.settingsTabPill, isActive && styles.settingsTabPillActive]}
              onPress={() => setActiveTab(tab.name)}
            >
              <IconComp size={14} color={isActive ? colors.accent : colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.settingsTabText, isActive && styles.settingsTabTextActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Settings Card */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>{activeTab}</Text>

          {/* Company Profile Form matching user screenshot */}
          {activeTab === "Company Profile" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Row 1: Company Name & Website */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Company Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="My Company"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.name || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), name: val }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Website</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Website"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.website || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), website: val }
                    })}
                  />
                </View>
              </View>

              {/* Row 2: Contact Email & Contact Phone */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Contact Email</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Contact Email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    value={settings.companyProfile?.email || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), email: val }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Contact Phone</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Contact Phone"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={settings.companyProfile?.phone || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), phone: val }
                    })}
                  />
                </View>
              </View>

              {/* Row 3: GST Number */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>GST Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="GST Number"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.gstNo || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), gstNo: val }
                    })}
                  />
                </View>
                <View style={styles.formCol} />
              </View>

              {/* Row 4: HQ Address */}
              <Text style={styles.formLabel}>HQ Address</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="HQ Address"
                placeholderTextColor={colors.textMuted}
                multiline
                value={settings.companyProfile?.address || ''}
                onChangeText={val => setSettings({
                  ...settings,
                  companyProfile: { ...(settings.companyProfile || {}), address: val }
                })}
              />
            </View>
          )}

          {/* Departments */}
          {activeTab === "Departments" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter department names separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.departments || []).join(", ")}
                onChangeText={val => handleArrayChange("departments", val)}
              />
            </View>
          )}

          {/* Designations */}
          {activeTab === "Designations" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter designations separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.designations || []).join(", ")}
                onChangeText={val => handleArrayChange("designations", val)}
              />
            </View>
          )}

          {/* Office Locations */}
          {activeTab === "Office Locations" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter physical office locations separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.officeLocations || []).join(", ")}
                onChangeText={val => handleArrayChange("officeLocations", val)}
              />
            </View>
          )}

          {/* Policies Form matching user screenshot */}
          {activeTab === "Policies" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Leave Policy (Annual Limits) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginBottom: spacing.m }]}>
                Leave Policy (Annual Limits)
              </Text>

              <View style={styles.formRow3Col}>
                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Max Sick Leaves</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.maxSickLeaves ?? 12)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), maxSickLeaves: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Max Casual Leaves</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.maxCasualLeaves ?? 12)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), maxCasualLeaves: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Carry Forward Limit</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.carryForwardLimit ?? 5)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), carryForwardLimit: Number(val) || 0 }
                    })}
                  />
                </View>
              </View>

              {/* Attendance Policy */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                Attendance Policy
              </Text>

              <View style={styles.formRow3Col}>
                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Office Start Time</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="10:00 AM"
                    placeholderTextColor={colors.textMuted}
                    value={settings.attendancePolicy?.officeStartTime || '10:00 AM'}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), officeStartTime: val }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Late Threshold (Mins)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.attendancePolicy?.lateThresholdMins ?? 15)}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), lateThresholdMins: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Half Day Threshold (Mins)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="240"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.attendancePolicy?.halfDayThresholdMins ?? 240)}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), halfDayThresholdMins: Number(val) || 0 }
                    })}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Email Templates Form matching user screenshot */}
          {activeTab === "Email Templates" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>
                Edit automated system responses. Use placeholders like {"{{employeeName}}"} where appropriate.
              </Text>

              {((settings.emailTemplates && settings.emailTemplates.length > 0)
                ? settings.emailTemplates
                : [
                  {
                    triggerEvent: 'Leave Approved',
                    subject: 'Leave Request Approved',
                    body: 'Hi {{employeeName}},\n\nYour leave request from {{startDate}} to {{endDate}} has been approved.',
                  },
                  {
                    triggerEvent: 'Leave Rejected',
                    subject: 'Leave Request Update',
                    body: 'Hi {{employeeName}},\n\nYour leave request from {{startDate}} to {{endDate}} has been rejected. Reason: {{reason}}',
                  },
                ]
              ).map((template: any, idx: number) => (
                <View key={idx} style={styles.templateCard}>
                  <View style={styles.templateBadge}>
                    <Text style={styles.templateBadgeText}>{template.triggerEvent}</Text>
                  </View>

                  <Text style={styles.formLabel}>Subject</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Subject..."
                    placeholderTextColor={colors.textMuted}
                    value={template.subject || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.emailTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].subject = val;
                      setSettings({ ...settings, emailTemplates: newTemplates });
                    }}
                  />

                  <Text style={styles.formLabel}>Body</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 90, textAlignVertical: 'top' }]}
                    placeholder="Email Body..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={template.body || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.emailTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].body = val;
                      setSettings({ ...settings, emailTemplates: newTemplates });
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* SMS Templates Form matching user screenshot */}
          {activeTab === "SMS Templates" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>
                Edit automated system responses. Use placeholders like {"{{employeeName}}"} where appropriate.
              </Text>

              {((settings.smsTemplates && settings.smsTemplates.length > 0)
                ? settings.smsTemplates
                : [
                  {
                    triggerEvent: 'OTP Verification',
                    body: 'Your CRM login OTP is {{otp}}. Valid for 5 minutes.',
                  },
                  {
                    triggerEvent: 'Lead Assigned',
                    body: 'A new lead {{leadName}} has been assigned to you. Check leads page.',
                  },
                ]
              ).map((template: any, idx: number) => (
                <View key={idx} style={styles.templateCard}>
                  <View style={styles.smsTemplateBadge}>
                    <Text style={styles.smsTemplateBadgeText}>{template.triggerEvent}</Text>
                  </View>

                  <Text style={styles.formLabel}>SMS Body (Keep under 160 chars)</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="SMS Body..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={template.body || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.smsTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].body = val;
                      setSettings({ ...settings, smsTemplates: newTemplates });
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Integrations Form matching user screenshot */}
          {activeTab === "Integrations" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Section 1: SMTP Email Configuration */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginBottom: spacing.m }]}>
                SMTP Email Configuration
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Host</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. smtp.gmail.com"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smtp?.host || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), host: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Port</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. 587"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smtp?.port || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), port: val }
                      }
                    })}
                  />
                </View>
              </View>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP User</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="keyadmin@gmail.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    value={settings.integrations?.smtp?.user || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), user: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Password</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={settings.integrations?.smtp?.pass || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), pass: val }
                      }
                    })}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>From Address</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder='e.g. "HR Team" <hr@company.com>'
                placeholderTextColor={colors.textMuted}
                value={settings.integrations?.smtp?.from || ''}
                onChangeText={(val) => setSettings({
                  ...settings,
                  integrations: {
                    ...(settings.integrations || {}),
                    smtp: { ...(settings.integrations?.smtp || {}), from: val }
                  }
                })}
              />

              {/* Section 2: Payment Gateway (Razorpay/Cashfree) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                Payment Gateway (Razorpay/Cashfree)
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Account Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Account Number"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.paymentGateway?.razorpayAccountNumber || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayAccountNumber: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Key ID</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Key ID"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.paymentGateway?.razorpayKeyId || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayKeyId: val }
                      }
                    })}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Key Secret</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Key Secret"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={settings.integrations?.paymentGateway?.razorpayKeySecret || ''}
                onChangeText={(val) => setSettings({
                  ...settings,
                  integrations: {
                    ...(settings.integrations || {}),
                    paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayKeySecret: val }
                  }
                })}
              />

              {/* Section 3: SMS Gateway (Twilio / MSG91) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                SMS Gateway (Twilio / MSG91)
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Account SID</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Account SID"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smsGateway?.twilioAccountSid || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioAccountSid: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Auth Token</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Auth Token"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={settings.integrations?.smsGateway?.twilioAuthToken || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioAuthToken: val }
                      }
                    })}
                  />
                </View>
              </View>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Phone Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Phone Number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={settings.integrations?.smsGateway?.twilioPhoneNumber || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioPhoneNumber: val }
                      }
                    })}
                  />
                </View>
                <View style={styles.formCol} />
              </View>
            </View>
          )}

          {/* Access Control Form matching user screenshot */}
          {activeTab === "Access Control" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.sectionHeading}>Admin Roles & Permissions</Text>
              <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
                Assign the ADMIN or KEY_ADMIN role to employees to give them access to Settings.
              </Text>

              <View style={styles.accessControlCard}>
                {/* Table Header */}
                <View style={styles.accessTableHeader}>
                  <Text style={[styles.attTableCol, { flex: 2.2 }]}>Email</Text>
                  <Text style={[styles.attTableCol, { flex: 1.2 }]}>Current Role</Text>
                  <Text style={[styles.attTableCol, { flex: 1.2, textAlign: 'right' }]}>Action</Text>
                </View>

                {usersLoading ? (
                  <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 20 }} />
                ) : (
                  (users.length > 0 ? users : [
                    { email: 'admin@gmail.com', role: 'KEY_ADMIN' },
                    { email: 'keyadmin@gmail.com', role: 'KEY_ADMIN' }
                  ]).map((u) => (
                    <View key={u.email} style={styles.accessTableRow}>
                      <Text style={[styles.empNameText, { flex: 2.2, fontSize: 13 }]} numberOfLines={1}>
                        {u.email}
                      </Text>

                      <View style={{ flex: 1.2 }}>
                        <View style={[
                          styles.roleBadge,
                          u.role === 'KEY_ADMIN' ? styles.roleKeyAdminBadge :
                            u.role === 'ADMIN' ? styles.roleAdminBadge : styles.roleEmployeeBadge
                        ]}>
                          <Text style={[
                            styles.roleBadgeText,
                            u.role === 'KEY_ADMIN' ? styles.roleKeyAdminText :
                              u.role === 'ADMIN' ? styles.roleAdminText : styles.roleEmployeeText
                          ]}>
                            {u.role}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionSelectCol}>
                        <TouchableOpacity
                          style={styles.roleActionPill}
                          onPress={() => {
                            const nextRole = u.role === 'Employee' ? 'ADMIN' : u.role === 'ADMIN' ? 'KEY_ADMIN' : 'Employee';
                            handleRoleChange(u.email, nextRole);
                          }}
                        >
                          <Text style={styles.roleActionPillText}>{u.role}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// --- Notifications Sub-View (Notification Engine Logs) ---
const NotificationsView = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/reports/notifications');
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.notificationsContainer}>
      {/* Title Row matching screenshot */}
      <View style={styles.notificationHeaderRow}>
        <RadioTower size={28} color={colors.accent} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Notification Engine Logs</Text>
          <Text style={styles.empSubtitle}>
            Live audit trail of all outgoing system communications (Email, SMS, Push).
          </Text>
        </View>
      </View>

      {/* Audit Trail Card */}
      <View style={styles.historyCard}>
        <Text style={styles.filterGroupLabel}>RECENT DISPATCHES</Text>

        <ScrollView horizontal style={{ marginTop: spacing.s }}>
          <View>
            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { width: 100 }]}>Channel</Text>
              <Text style={[styles.attTableCol, { width: 120 }]}>Trigger Event</Text>
              <Text style={[styles.attTableCol, { width: 150 }]}>Recipient</Text>
              <Text style={[styles.attTableCol, { width: 220 }]}>Message Payload</Text>
              <Text style={[styles.attTableCol, { width: 90 }]}>Status</Text>
              <Text style={[styles.attTableCol, { width: 140 }]}>Timestamp</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
            ) : logs.length === 0 ? (
              <View style={styles.emptyHolidaysBox}>
                <Text style={styles.emptyNotificationText}>
                  The notification engine has not dispatched any messages yet. Generate a payroll to trigger an event!
                </Text>
              </View>
            ) : (
              logs.map((log) => (
                <View key={log._id} style={styles.attTableRow}>
                  {/* Channel */}
                  <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
                    {log.channel === 'Email' ? (
                      <Mail size={14} color={colors.info} style={{ marginRight: 4 }} />
                    ) : log.channel === 'SMS' ? (
                      <MessageSquare size={14} color={colors.success} style={{ marginRight: 4 }} />
                    ) : (
                      <Bell size={14} color={colors.accent} style={{ marginRight: 4 }} />
                    )}
                    <Text style={styles.attTableCell}>{log.channel}</Text>
                  </View>

                  {/* Trigger Event */}
                  <View style={{ width: 120 }}>
                    <View style={styles.triggerBadgePill}>
                      <Text style={styles.triggerBadgeText}>{log.triggerEvent}</Text>
                    </View>
                  </View>

                  {/* Recipient */}
                  <View style={{ width: 150 }}>
                    <Text style={styles.empNameText}>
                      {log.recipientId?.firstName} {log.recipientId?.lastName}
                    </Text>
                    <Text style={styles.empCodeText}>
                      {log.channel === 'Email' ? log.recipientId?.email : log.recipientId?.phone || 'App User'}
                    </Text>
                  </View>

                  {/* Payload */}
                  <View style={{ width: 220 }}>
                    <Text style={styles.empCodeText} numberOfLines={2}>
                      {log.message}
                    </Text>
                  </View>

                  {/* Status */}
                  <View style={{ width: 90 }}>
                    <Text style={[
                      styles.attStatusPillText,
                      log.status === 'Sent' ? styles.statusPresentText : styles.statusAbsentText
                    ]}>
                      {log.status === 'Sent' ? '✓ Sent' : '✕ Failed'}
                    </Text>
                  </View>

                  {/* Timestamp */}
                  <View style={{ width: 140 }}>
                    <Text style={styles.empCodeText}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// --- Company Wallet Sub-View ---
const CompanyWalletView = () => {
  const [wallet, setWallet] = useState<{ balance: number; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Credit',
    amount: '',
    description: '',
    upiRef: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/wallet');
      if (res.success && res.data) {
        setWallet(res.data.data || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransaction = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Validation Error', 'Please enter amount and description.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res: any = await apiCall('/api/wallet/transaction', {
        method: 'POST',
        body: JSON.stringify({
          type: formData.type === 'UPI Top-up' ? 'Credit' : formData.type,
          amount: Number(formData.amount),
          description: formData.type === 'UPI Top-up' ? `${formData.description} (UPI Ref: ${formData.upiRef})` : formData.description,
        }),
      });

      if (res.success) {
        Alert.alert('Success', res.message || 'Transaction executed successfully!');
        setShowForm(false);
        setFormData({ type: 'Credit', amount: '', description: '', upiRef: '' });
        fetchWallet();
      } else {
        Alert.alert('Error', res.error || 'Transaction failed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Transaction failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportStatement = () => {
    Alert.alert('Export Statement', 'Statement exported to Excel ledger.');
  };

  return (
    <ScrollView contentContainerStyle={styles.walletContainer}>
      {/* Title & Action Buttons Header */}
      <View style={styles.walletHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Company Wallet</Text>
          <Text style={styles.empSubtitle}>Manage central funds and view the financial ledger.</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.exportStatementBtn} onPress={exportStatement}>
            <Download size={14} color={colors.background} style={{ marginRight: 4 }} />
            <Text style={styles.exportStatementText}>Export Statement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addHolidayBtn}
            onPress={() => setShowForm(!showForm)}
          >
            <Plus size={14} color={colors.background} style={{ marginRight: 4 }} />
            <Text style={styles.addHolidayBtnText}>New Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Balance Black Banner Card matching user screenshot */}
      <View style={styles.walletBalanceCard}>
        <View style={styles.walletIconBackground}>
          <Wallet size={160} color={colors.background} />
        </View>
        <Text style={styles.walletBalanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.walletBalanceValue}>
          ₹{(wallet?.balance || 0).toLocaleString()}
        </Text>
      </View>

      {/* Manual Transaction Form Card */}
      {showForm && (
        <View style={styles.addHolidayCard}>
          <Text style={styles.addHolidayCardTitle}>Manual Transaction</Text>

          <Text style={styles.formLabel}>Transaction Type</Text>
          <View style={styles.typeSelectionRow}>
            {['Credit', 'Debit', 'UPI Top-up'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeSelectBtn, formData.type === t && styles.typeSelectBtnActive]}
                onPress={() => setFormData({ ...formData, type: t })}
              >
                <Text style={[styles.typeSelectText, formData.type === t && styles.typeSelectTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.type === 'UPI Top-up' && (
            <View>
              <Text style={styles.formLabel}>UPI Reference No. *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 123456789012"
                placeholderTextColor={colors.textMuted}
                value={formData.upiRef}
                onChangeText={(val) => setFormData({ ...formData, upiRef: val })}
              />
            </View>
          )}

          <View style={styles.formRow2Col}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(val) => setFormData({ ...formData, amount: val })}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Bank Transfer"
                placeholderTextColor={colors.textMuted}
                value={formData.description}
                onChangeText={(val) => setFormData({ ...formData, description: val })}
              />
            </View>
          </View>

          <View style={styles.structFormActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitLoading && styles.disabledButton]}
              onPress={handleTransaction}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>Execute Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ledger Table Card matching user screenshot */}
      <View style={styles.historyCard}>
        <Text style={styles.settingsCardTitle}>Ledger (Audit Log)</Text>

        <ScrollView horizontal style={{ marginTop: spacing.s }}>
          <View>
            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { width: 130 }]}>Date</Text>
              <Text style={[styles.attTableCol, { width: 180 }]}>Description</Text>
              <Text style={[styles.attTableCol, { width: 100 }]}>Type</Text>
              <Text style={[styles.attTableCol, { width: 110, textAlign: 'right' }]}>Amount</Text>
              <Text style={[styles.attTableCol, { width: 120, textAlign: 'right' }]}>Balance After</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
            ) : (wallet?.transactions && wallet.transactions.length > 0) ? (
              wallet.transactions.map((tx) => (
                <View key={tx._id} style={styles.attTableRow}>
                  <Text style={[styles.empCodeText, { width: 130 }]}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </Text>

                  <View style={{ width: 180 }}>
                    <Text style={styles.empNameText}>{tx.description}</Text>
                    <Text style={styles.empCodeText}>By {tx.createdBy?.firstName} {tx.createdBy?.lastName}</Text>
                  </View>

                  <View style={{ width: 100 }}>
                    <View style={[
                      styles.attStatusPill,
                      tx.type === 'Credit' ? styles.statusPresent : styles.statusAbsent
                    ]}>
                      <Text style={[
                        styles.attStatusPillText,
                        tx.type === 'Credit' ? styles.statusPresentText : styles.statusAbsentText
                      ]}>
                        {tx.type === 'Credit' ? '↑ Credit' : '↓ Debit'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[
                    styles.attTableCell,
                    { width: 110, textAlign: 'right', fontWeight: 'bold' },
                    tx.type === 'Credit' ? { color: colors.success } : { color: colors.danger }
                  ]}>
                    {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </Text>

                  <Text style={[styles.attTableCell, { width: 120, textAlign: 'right', fontWeight: 'bold' }]}>
                    ₹{tx.balanceAfter.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyHolidaysBox}>
                <Text style={styles.emptyNotificationText}>
                  No transactions found in ledger.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// --- Employee My Profile Sub-View ---
const EmployeeProfileView = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res: any = await apiCall('/api/auth/me');
      if (res.success && (res.employee || res.data)) {
        setEmployee(res.employee || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickAndUploadPhoto = async (source: 'camera' | 'gallery') => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required to select a photo.');
          return;
        }
      }

      // Launch picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.fileName || uri.split('/').pop() || 'profile.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      // Validate file type
      if (!fileType.startsWith('image/jpeg') && !fileType.startsWith('image/png')) {
        Alert.alert('Invalid File', 'Only JPG and PNG files are allowed.');
        return;
      }

      setPhotoUploading(true);

      // Upload the file
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      const token = useAuthStore.getState().token;
      const uploadRes = await fetch(`${require('../services/api').API_BASE_URL}/api/employees/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Cookie: `accessToken=${token}`, Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        Alert.alert('Upload Failed', uploadData.error || 'Failed to upload photo.');
        setPhotoUploading(false);
        return;
      }

      const photoUrl = uploadData.url;

      // Update profile with the new photo URL
      const updateRes = await apiCall('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ profilePhotoUrl: photoUrl }),
      });

      if (updateRes.success) {
        // Update local state immediately
        setEmployee((prev: any) => ({ ...prev, profilePhotoUrl: photoUrl }));
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        Alert.alert('Error', updateRes.error || 'Failed to update profile photo.');
      }
    } catch (e: any) {
      console.error('Photo upload error:', e);
      Alert.alert('Error', e.message || 'An error occurred while uploading the photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChangePhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickAndUploadPhoto('camera');
          else if (buttonIndex === 2) pickAndUploadPhoto('gallery');
        }
      );
    } else {
      Alert.alert(
        'Change Profile Photo',
        'Choose how you want to update your profile photo',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: '📷 Take Photo', onPress: () => pickAndUploadPhoto('camera') },
          { text: '🖼️ Choose from Gallery', onPress: () => pickAndUploadPhoto('gallery') },
        ]
      );
    }
  };

  const handleChangePassword = async () => {
    if (!formData.oldPassword || !formData.newPassword) {
      Alert.alert('Validation Error', 'Please enter your current and new password.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await apiCall('/api/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Password updated successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        Alert.alert('Error', res.error || 'Failed to update password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error updating password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.walletContainer}>
      {/* Title Row matching screenshot */}
      <View style={styles.notificationHeaderRow}>
        <ShieldCheck size={28} color={colors.info} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>My Profile</Text>
          <Text style={styles.empSubtitle}>Manage your account security and preferences.</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 40 }} />
      ) : (
        <>
          {/* Card 1: Personal Information (Read-Only) */}
          <View style={styles.settingsCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <UserIcon size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.settingsCardTitle}>Personal Information</Text>
            </View>
            <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
              Your personal and official details (Read-Only).
            </Text>

            {/* Profile Avatar & Change Photo */}
            <View style={styles.profileAvatarRow}>
              <View style={styles.profileAvatarCircle}>
                {employee?.profilePhotoUrl ? (
                  <Image
                    source={{ uri: employee.profilePhotoUrl.startsWith('http') ? employee.profilePhotoUrl : `${require('../services/api').API_BASE_URL}${employee.profilePhotoUrl}` }}
                    style={{ width: 72, height: 72, borderRadius: 36 }}
                    resizeMode="cover"
                  />
                ) : (
                  <UserIcon size={36} color={colors.textMuted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={handleChangePhoto}
                  disabled={photoUploading}
                >
                  {photoUploading ? (
                    <ActivityIndicator size="small" color={colors.info} style={{ marginRight: 6 }} />
                  ) : (
                    <Camera size={16} color={colors.info} style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.changePhotoText}>
                    {photoUploading ? 'Uploading...' : 'Change Profile Photo'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.photoTipText}>Only JPG, PNG files are allowed.</Text>
              </View>
            </View>

            {/* 2-Column Read-Only Details Grid */}
            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>EMPLOYEE CODE</Text>
                <Text style={styles.profileValText}>{employee?.employeeCode || 'N/A'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>FULL NAME</Text>
                <Text style={styles.profileValText}>{employee?.firstName} {employee?.lastName}</Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>PERSONAL EMAIL</Text>
                <Text style={styles.profileValText}>{employee?.email}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>OFFICE EMAIL</Text>
                <Text style={styles.profileValText}>{employee?.officeEmail || employee?.email}</Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>PHONE NUMBER</Text>
                <Text style={styles.profileValText}>{employee?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DATE OF BIRTH</Text>
                <Text style={styles.profileValText}>
                  {employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DEPARTMENT</Text>
                <Text style={styles.profileValText}>{employee?.department || 'N/A'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DESIGNATION</Text>
                <Text style={styles.profileValText}>{employee?.designation || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>WORK LOCATION</Text>
                <Text style={styles.profileValText}>{employee?.workLocation || 'Headquarters'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>STATUS / TYPE</Text>
                <Text style={styles.profileValText}>{employee?.status || 'Active'} ({employee?.employeeType || 'Full-Time'})</Text>
              </View>
            </View>

            {/* KYC & Bank Sub-section */}
            <View style={{ marginTop: spacing.m, paddingTop: spacing.m, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[styles.settingsCardTitle, { fontSize: 13, marginBottom: spacing.s }]}>KYC & BANK DETAILS</Text>
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.filterGroupLabel}>AADHAR NUMBER</Text>
                  <Text style={styles.profileValText}>{employee?.kyc?.aadharNumber || 'N/A'}</Text>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.filterGroupLabel}>PAN NUMBER</Text>
                  <Text style={styles.profileValText}>{employee?.kyc?.panNumber || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.filterGroupLabel}>BANK NAME</Text>
                  <Text style={styles.profileValText}>{employee?.bankDetails?.bankName || 'N/A'}</Text>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.filterGroupLabel}>ACCOUNT NUMBER</Text>
                  <Text style={styles.profileValText}>{employee?.bankDetails?.accountNumber || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card 2: Change Password matching user screenshot */}
          <View style={[styles.settingsCard, { marginTop: spacing.m }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <KeyRound size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.settingsCardTitle}>Change Password</Text>
            </View>
            <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
              Secure your account by updating your password regularly.
            </Text>

            <Text style={styles.formLabel}>Current Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.oldPassword}
              onChangeText={(val) => setFormData({ ...formData, oldPassword: val })}
            />

            <Text style={styles.formLabel}>New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.newPassword}
              onChangeText={(val) => setFormData({ ...formData, newPassword: val })}
            />

            <Text style={styles.formLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: spacing.m }, pwLoading && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

function numberToWords(num: number): string {
  if (!num) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const numStr = num.toString();
  if (numStr.length > 9) return 'Overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return str.trim();
}

const generatePaymentBondHtml = (inv: any) => {
  const principal = Number(inv?.investmentAmount || 0);
  const rate = Number(inv?.monthlyGrowthPercentage || 2.5);
  const interest = Math.round((principal * rate) / 100);
  const maturityAmt = principal + interest;

  const principalWords = numberToWords(principal);
  const maturityWords = numberToWords(maturityAmt);

  const df = inv?.debentureForm || {};
  const today = new Date();
  const issueDateStr = today.toLocaleDateString('en-GB');
  const maturityDate = new Date(today);
  maturityDate.setMonth(today.getMonth() + 1);
  const maturityDateStr = maturityDate.toLocaleDateString('en-GB');

  const bondNo = inv?.investorCode ? `MDS DWK ${inv.investorCode.replace('INV-', '')}` : 'MDS DWK 0005';
  const refNo = `MP07/ZX/${today.getFullYear()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Bond Certificate</title>
<style>
  :root {
    --navy: #0c1c3d;
    --gold: #c9972f;
    --gold-light: #e8b84b;
    --cream: #fffdf8;
    --text: #1c1c1c;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #e7e7e7;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: var(--text);
    padding: 16px;
  }
  .certificate-sheet {
    max-width: 800px;
    margin: 0 auto;
    background: #ffffff;
    border: 3px double var(--navy);
    padding: 20px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .inner-border {
    border: 1px solid var(--gold);
    padding: 16px;
  }
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--gold);
    position: relative;
  }
  .gold-seal {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: radial-gradient(circle, #e8b84b 0%, #c9972f 100%);
    border: 2px solid #8f6718;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 7.5px;
    font-weight: 800;
    color: #0c1c3d;
    text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .company-brand {
    text-align: center;
    flex: 1;
  }
  .brand-logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #0c1c3d;
    color: var(--gold-light);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    border: 2px solid var(--gold);
  }
  .company-title {
    font-size: 19px;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: 1px;
    margin-top: 4px;
  }
  .company-motto {
    font-size: 10px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 1px;
  }
  .qr-box {
    text-align: center;
    border: 1px solid #ddd;
    padding: 4px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 700;
    color: #555;
  }
  .qr-placeholder {
    width: 46px;
    height: 46px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .bond-title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 14px 0;
    font-size: 11px;
    font-weight: 700;
    color: var(--navy);
  }
  .center-pill {
    background: var(--navy);
    color: var(--gold-light);
    padding: 3px 12px;
    border-radius: 12px;
    font-size: 9.5px;
    letter-spacing: 1px;
  }
  .main-bond-heading {
    text-align: center;
    font-size: 24px;
    font-weight: 900;
    color: var(--gold);
    letter-spacing: 2px;
    margin: 2px 0 10px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.1);
  }
  .notice-box {
    background: #fffdf5;
    border: 1px solid #e3c98a;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 11.5px;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 14px;
  }
  .tables-grid {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
  }
  .table-col {
    flex: 1;
    border: 1px solid var(--navy);
    border-radius: 6px;
    overflow: hidden;
  }
  .table-header {
    background: var(--navy);
    color: #fff;
    text-align: center;
    font-size: 10.5px;
    font-weight: 800;
    padding: 5px;
    letter-spacing: 1px;
  }
  .table-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
    font-size: 11px;
  }
  .table-row:last-child { border-bottom: none; }
  .lbl { color: #555; }
  .val { font-weight: 800; color: #111; }
  .val.highlight { color: #b91c1c; font-size: 13px; }
  .terms-box {
    border: 1px solid var(--navy);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .terms-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 10px 12px;
    font-size: 9.5px;
    line-height: 1.5;
    color: #333;
  }
  .footer-signatures {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 10px;
  }
  .stamp-box {
    width: 65px;
    height: 65px;
    border: 2px solid var(--navy);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 7.5px;
    font-weight: 800;
    color: var(--navy);
  }
  .center-cert-note {
    font-size: 8.5px;
    color: #666;
    max-width: 250px;
    text-align: center;
    line-height: 1.3;
  }
  .sign-col {
    text-align: right;
    font-size: 10px;
  }
  .cursive-sign {
    font-family: 'Brush Script MT', cursive, sans-serif;
    font-size: 20px;
    color: var(--navy);
    margin: 4px 0 2px;
  }
  .bottom-navy-bar {
    background: var(--navy);
    color: #fff;
    font-size: 8.5px;
    padding: 6px 10px;
    margin-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    flex-wrap: wrap;
    gap: 4px;
  }
  @media (max-width: 600px) {
    body { padding: 4px; }
    .certificate-sheet { padding: 8px; }
    .inner-border { padding: 8px; }
    .tables-grid { flex-direction: column; }
    .terms-content { grid-template-columns: 1fr; }
    .header-row { flex-direction: column; gap: 8px; }
    .company-title { font-size: 15px; }
    .bond-title-bar { flex-direction: column; gap: 6px; text-align: center; }
    .bond-title-bar div { text-align: center !important; }
  }
</style>
</head>
<body>
<div class="certificate-sheet">
  <div class="inner-border">
    <div class="header-row">
      <div class="company-brand">
        <div class="brand-logo">NC</div>
        <div class="company-title">NIVENTRA CAPITAL ADVISORY INDIA PVT. LTD.</div>
        <div class="company-motto">&mdash; INVEST TODAY &bull; PROSPER TOMORROW &mdash;</div>
      </div>
   
    </div>

    <div class="bond-title-bar">
      <div>BOND NO. : <b>${bondNo}</b><br>ISSUE DATE : <b>${issueDateStr}</b></div>
      <div class="center-pill">&#10022; INVESTMENT ACKNOWLEDGEMENT &#10022;</div>
      <div style="text-align:right;">REFERENCE NO. : <b>${refNo}</b></div>
    </div>

    <div class="main-bond-heading">PAYMENT BOND</div>

    <div class="notice-box">
      This is to certify that <b>NIVENTRA CAPITAL ADVISORY INDIA PVT. LTD.</b> has received an amount of <b>&#8377;${principal.toLocaleString()}/- (${principalWords} Rupees Only)</b> from the investor named below on the terms and conditions mentioned herein.
    </div>

    <div class="tables-grid">
      <div class="table-col">
        <div class="table-header">&#10022; INVESTOR INFORMATION &#10022;</div>
        <div class="table-row"><span class="lbl">Investor Name</span><span class="val">${inv?.fullName || '—'}</span></div>
        <div class="table-row"><span class="lbl">Father's Name</span><span class="val">${df.fatherSpouseName || '—'}</span></div>
        <div class="table-row"><span class="lbl">Address</span><span class="val">${df.address || '—'}</span></div>
        <div class="table-row"><span class="lbl">Mobile No.</span><span class="val">${inv?.phone || '—'}</span></div>
        <div class="table-row"><span class="lbl">Email ID</span><span class="val">${inv?.email || '—'}</span></div>
      </div>

      <div class="table-col">
        <div class="table-header">&#10022; INVESTMENT DETAILS &#10022;</div>
        <div class="table-row"><span class="lbl">Principal Amount</span><span class="val">&#8377;${principal.toLocaleString()}/-</span></div>
        <div class="table-row"><span class="lbl">Investment Date</span><span class="val">${issueDateStr}</span></div>
        <div class="table-row"><span class="lbl">Maturity Period</span><span class="val">1 Month</span></div>
        <div class="table-row"><span class="lbl">Maturity Date</span><span class="val">${maturityDateStr}</span></div>
        <div class="table-row"><span class="lbl">Amount Payable on Maturity</span><span class="val highlight">&#8377;${maturityAmt.toLocaleString()}/-</span></div>
        <div style="font-size:8.5px;color:#c05a1e;text-align:right;padding:2px 10px;">(${maturityWords} Rupees Only)</div>
      </div>
    </div>

    <div class="terms-box">
      <div class="table-header">&#10022; TERMS & CONDITIONS &#10022;</div>
      <div class="terms-content">
        <div>1. This Bond is issued by NIVENTRA CAPITAL ADVISORY INDIA PVT. LTD. as an acknowledgement of receipt of the above amount.</div>
        <div>4. This Bond is non-transferable unless approved in writing by the Company.</div>
        <div>2. On successful completion of the one-month period, the Company shall pay the maturity amount stated above, subject to the terms of this Bond.</div>
        <div>5. Any alteration or overwriting without the Company's authorization shall render this Bond invalid.</div>
        <div>3. Payment shall be made through NEFT/RTGS/IMPS/Cheque or any other approved banking mode.</div>
        <div>6. Any dispute shall be subject to the jurisdiction of the competent courts.</div>
      </div>
    </div>

    <div class="footer-signatures">
      <div class="center-cert-note">The Company hereby certifies that this Bond has been issued under its authority and shall be governed by the terms and conditions mentioned herein.</div>
      <div class="sign-col">
        <div style="font-size:9px;color:#555;">For NIVENTRA CAPITAL ADVISORY INDIA PVT. LTD.</div>
        <div class="cursive-sign">Deepak Dayal</div>
        <div><b>DEEPAK DAYAL</b></div>
        <div style="font-size:8.5px;color:#666;">DIRECTOR / AUTHORIZED SIGNATORY</div>
      </div>
    </div>

    <div class="bottom-navy-bar">
      <span>&#128205; REGISTERED OFFICE: DWARKA MOR</span>
      <span>&#127760; WEBSITE: www.niventracapitaladvisory.com</span>
      <span>&#128222; CUSTOMER CARE: +91 8920313143</span>
      <span>&#9993; EMAIL: info@niventracapitaladvisory.com</span>
    </div>
  </div>
</div>
</body>
</html>`;
};

// --- Investors Admin View Sub-Component ---
const InvestorsAdminView = () => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null); // Audit & View modal
  const [selectedDebentureForm, setSelectedDebentureForm] = useState<any>(null); // Debenture form HTML modal
  const [bondInvestorModal, setBondInvestorModal] = useState<any>(null); // Payment Bond PDF modal
  const [editInvestor, setEditInvestor] = useState<any>(null); // Edit modal
  const [showAddModal, setShowAddModal] = useState(false); // Add modal
  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; url: string } | null>(null); // Document preview modal

  const formatDocUrl = (url: string) => {
    if (!url) return '';
    let cleanUrl = String(url).trim();
    if (cleanUrl.startsWith('file:///uploads/')) {
      cleanUrl = cleanUrl.replace('file://', '');
    } else if (cleanUrl.startsWith('file://')) {
      cleanUrl = cleanUrl.replace('file://', '');
    }
    if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${baseUrl}${path}`;
  };

  const handleDownloadBondPdf = async (targetInv: any) => {
    try {
      const html = generatePaymentBondHtml(targetInv);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `Payment_Bond_${targetInv.investorCode || 'Certificate'}.pdf`;
        link.click();
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Payment Bond Certificate PDF',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to download Payment Bond PDF');
    }
  };

  // Form states for Add Investor
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    investmentAmount: '',
    monthlyGrowthPercentage: '2.5',
    referralEmployeeName: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const res: any = await apiCall('/api/investors/me');
      let list: any[] = [];
      if (res && res.success && res.data) {
        const payload = res.data;
        if (Array.isArray(payload)) {
          list = payload;
        } else if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.data)) {
            list = payload.data;
          } else if (payload.data && Array.isArray(payload.data.data)) {
            list = payload.data.data;
          } else {
            list = [payload];
          }
        }
      } else if (Array.isArray(res)) {
        list = res;
      }
      setInvestors(list);
    } catch (e) {
      console.error('fetchInvestors error:', e);
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const filteredInvestors = (Array.isArray(investors) ? investors : []).filter((inv) => {
    if (!inv || typeof inv !== 'object') return false;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (inv.fullName && inv.fullName.toLowerCase().includes(query)) ||
      (inv.email && inv.email.toLowerCase().includes(query)) ||
      (inv.phone && String(inv.phone).toLowerCase().includes(query)) ||
      (inv.investorCode && inv.investorCode.toLowerCase().includes(query));

    const filter = statusFilter.toUpperCase();
    const invStatus = (inv.status || 'Pending').toUpperCase();

    let matchesStatus = false;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'DebentureForms') {
      matchesStatus = !!inv.debentureForm?.applicationNo;
    } else {
      matchesStatus = invStatus === filter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvestor = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      Alert.alert('Validation Error', 'Full Name and Email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await apiCall('/api/investors/me', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password || 'Investor@123',
          investmentAmount: Number(formData.investmentAmount) || 0,
          monthlyGrowthPercentage: Number(formData.monthlyGrowthPercentage) || 2.5,
          referralEmployeeName: formData.referralEmployeeName.trim(),
        }),
      });
      if (res.success && res.data) {
        Alert.alert('Success', 'Investor created successfully!');
        setShowAddModal(false);
        setFormData({ fullName: '', email: '', phone: '', password: '', investmentAmount: '', monthlyGrowthPercentage: '2.5', referralEmployeeName: '' });
        setInvestors((prev) => [res.data, ...prev.filter(i => (i._id || i.id) !== (res.data._id || res.data.id))]);
        fetchInvestors();
      } else {
        Alert.alert('Error', res.error || 'Failed to create investor');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to create investor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditInvestor = async () => {
    if (!editInvestor) return;
    setSubmitting(true);
    try {
      const invId = editInvestor._id || editInvestor.id;
      let res: any = await apiCall(`/api/investors/${invId}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editInvestor.fullName,
          email: editInvestor.email,
          phone: editInvestor.phone,
          investmentAmount: Number(editInvestor.investmentAmount) || 0,
          monthlyGrowthPercentage: Number(editInvestor.monthlyGrowthPercentage) || 2.5,
          status: editInvestor.status,
        }),
      });

      if (!res || !res.success) {
        res = await apiCall('/api/investors/me', {
          method: 'PUT',
          body: JSON.stringify({
            investorId: invId,
            fullName: editInvestor.fullName,
            email: editInvestor.email,
            phone: editInvestor.phone,
            investmentAmount: Number(editInvestor.investmentAmount) || 0,
            monthlyGrowthPercentage: Number(editInvestor.monthlyGrowthPercentage) || 2.5,
            status: editInvestor.status,
          }),
        });
      }

      if (res && (res.success || res.data)) {
        Alert.alert('Success', 'Investor details updated successfully!');
        setEditInvestor(null);
        fetchInvestors();
      } else {
        Alert.alert('Error', res?.error || 'Failed to update investor');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update investor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvestor = (inv: any) => {
    const targetId = inv._id || inv.id;
    Alert.alert(
      'Delete Investor',
      `Are you sure you want to delete investor ${inv.fullName || inv.email} (${inv.investorCode || ''})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res: any = await apiCall(`/api/investors/me?id=${targetId}`, {
                method: 'DELETE',
              });
              if (res.success) {
                Alert.alert('Success', 'Investor deleted successfully');
                setInvestors((prev) => prev.filter(i => (i._id || i.id) !== targetId));
                fetchInvestors();
              } else {
                Alert.alert('Error', res.error || 'Failed to delete investor');
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete investor');
            }
          },
        },
      ]
    );
  };

  const handleDocVerify = async (docKey: string, docStatus: string) => {
    if (!selectedInvestor) return;
    setSubmitting(true);
    try {
      const invId = selectedInvestor._id || selectedInvestor.id;
      let res: any = await apiCall(`/api/investors/${invId}`, {
        method: 'PUT',
        body: JSON.stringify({
          docVerifications: {
            ...(selectedInvestor.docVerifications || {}),
            [docKey]: docStatus,
          },
        }),
      });

      if (!res || !res.success) {
        res = await apiCall('/api/investors/me', {
          method: 'PUT',
          body: JSON.stringify({
            investorId: invId,
            docVerifications: {
              ...(selectedInvestor.docVerifications || {}),
              [docKey]: docStatus,
            },
          }),
        });
      }

      // Immediately update local selectedInvestor state so modal shows updated status badge
      setSelectedInvestor((prev: any) => ({
        ...prev,
        docVerifications: {
          ...(prev?.docVerifications || {}),
          [docKey]: docStatus,
        },
      }));
      fetchInvestors();
      Alert.alert('Status Updated', `${docKey.toUpperCase()} document status updated to ${docStatus}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update document status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOverallStatus = async (status: string, reason?: string) => {
    if (!selectedInvestor) return;
    setSubmitting(true);
    try {
      const res: any = await apiCall('/api/investors/me', {
        method: 'PUT',
        body: JSON.stringify({
          investorId: selectedInvestor._id || selectedInvestor.id,
          status,
          rejectionReason: reason,
        }),
      });
      if (res.success && res.data) {
        Alert.alert('Success', `Investor marked as ${status}`);
        setSelectedInvestor(null);
        setShowRejectBox(false);
        setRejectReason('');
        fetchInvestors();
      } else {
        Alert.alert('Error', res.error || 'Failed to update status');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const counts = {
    ALL: (Array.isArray(investors) ? investors : []).length,
    Pending: (Array.isArray(investors) ? investors : []).filter((i) => !i.status || i.status === 'Pending').length,
    Verified: (Array.isArray(investors) ? investors : []).filter((i) => i.status === 'Verified').length,
    Rejected: (Array.isArray(investors) ? investors : []).filter((i) => i.status === 'Rejected').length,
    DebentureForms: (Array.isArray(investors) ? investors : []).filter((i) => i.debentureForm?.applicationNo).length,
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: spacing.m, paddingBottom: 60 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
      <View style={styles.titleRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.empTitle}>Investor Management</Text>
          <Text style={styles.empSubtitle}>Review investor KYC docs, verify bond agreements & set rates.</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8 }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.saveBtnText, { color: colors.background, fontSize: 12 }]}>+ Add Investor</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar matching screenshot exactly */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.m, flexWrap: 'wrap' }}>
        {/* Search Input with Icon */}
        <View style={{ flex: 1, minWidth: 260, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, height: 40 }}>
          <Search size={16} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 13, color: '#111', padding: 0 }}
            placeholder="Search Investor Name, Email, Phone, Code..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { key: 'ALL', label: 'All Status', color: '#fff' },
            { key: 'Pending', label: 'Pending', color: '#ff9800' },
            { key: 'Verified', label: 'Verified', color: '#10b981' },
            { key: 'Rejected', label: 'Rejected', color: '#ef4444' },
            { key: 'DebentureForms', label: 'Debenture Forms', color: '#3b82f6', icon: true },
          ].map((item) => {
            const isActive = statusFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={{
                  backgroundColor: '#0c1c3d',
                  borderWidth: 1,
                  borderColor: isActive ? colors.accent : '#132a5c',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
                onPress={() => setStatusFilter(item.key)}
              >
                {item.icon && <FileText size={12} color={item.color} />}
                <Text style={{ fontSize: 12, fontWeight: '700', color: item.color }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1 }}>
          {Platform.OS !== 'web' ? (
            /* --- MOBILE-OPTIMIZED CARD LIST VIEW --- */
            <View style={{ gap: 12, marginBottom: 20 }}>
              {filteredInvestors.length === 0 ? (
                <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>No investors found matching the selected filter.</Text>
                </View>
              ) : (
                filteredInvestors.map((inv) => {
                  const docsObj = inv.docVerifications || {};
                  const docKeys = Object.keys(docsObj);
                  const docsApprovedCount = docKeys.filter((v) => docsObj[v] === 'Approved').length;
                  const totalDocsCount = docKeys.length || 5;
                  const isBondAccepted = inv.bondAgreement?.accepted;

                  const statusColor = inv.status === 'Verified'
                    ? { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }
                    : inv.status === 'Rejected'
                      ? { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
                      : { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };

                  return (
                    <View
                      key={inv._id || inv.id || Math.random().toString()}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 14,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    >
                      {/* Top Header Row */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 10 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{inv.fullName || '—'}</Text>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.accent, marginTop: 2 }}>{inv.investorCode || 'INV-0000'}</Text>
                        </View>
                        <View style={{ backgroundColor: statusColor.bg, borderWidth: 1.5, borderColor: statusColor.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 }}>
                          <Text style={{ color: statusColor.text, fontSize: 11, fontWeight: '800' }}>✓ {inv.status || 'Pending'}</Text>
                        </View>
                      </View>

                      {/* Contact Row */}
                      <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                          ✉️ {inv.email || '—'} {inv.phone ? `  •  📱 ${inv.phone}` : ''}
                        </Text>
                      </View>

                      {/* 2-Column Info Grid */}
                      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 10, marginBottom: 12, gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>INVESTED AMOUNT</Text>
                          <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 2 }}>₹{(inv.investmentAmount || 0).toLocaleString()}</Text>

                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 8 }}>MONTHLY GROWTH</Text>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.success, marginTop: 1 }}>{inv.monthlyGrowthPercentage || 2.5}% / mo</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>REFERRED BY</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 2 }} numberOfLines={1}>
                            {inv.referralEmployeeName || 'Direct / Self'}
                          </Text>

                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 8 }}>BOND & KYC DOCS</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isBondAccepted ? colors.success : colors.textMuted, marginTop: 1 }}>
                            {isBondAccepted ? '✓ Bond Signed' : 'Pending Bond'} ({docsApprovedCount}/{totalDocsCount} KYC)
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons Bar */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                        {inv.status === 'Verified' && (
                          <TouchableOpacity
                            style={{ backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            onPress={() => setBondInvestorModal(inv)}
                          >
                            <ShieldCheck size={13} color="#0c1c3d" />
                            <Text style={{ color: '#0c1c3d', fontSize: 12, fontWeight: '900' }}>Bond PDF</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={{ backgroundColor: '#0c1c3d', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          onPress={() => setSelectedDebentureForm(inv)}
                        >
                          <FileText size={13} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Form</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#0c1c3d', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          onPress={() => setSelectedInvestor(inv)}
                        >
                          <Eye size={13} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>View & Verify</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#3b82f6', padding: 8, borderRadius: 6 }}
                          onPress={() => setEditInvestor({ ...inv })}
                        >
                          <Edit size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#ef4444', padding: 8, borderRadius: 6 }}
                          onPress={() => handleDeleteInvestor(inv)}
                        >
                          <Trash2 size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ) : (
            /* --- DESKTOP TABLE VIEW --- */
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginBottom: 16 }}>
              <View style={{ minWidth: 1000, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
                {/* Table Header */}
                <View style={{ flexDirection: 'row', backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' }}>
                  <Text style={{ width: 140, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Investor Code & Name</Text>
                  <Text style={{ width: 180, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Contact Email / Phone</Text>
                  <Text style={{ width: 110, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Referred By</Text>
                  <Text style={{ width: 110, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Invest RS Amount</Text>
                  <Text style={{ width: 120, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Monthly Growth %</Text>
                  <Text style={{ width: 140, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Status</Text>
                  <Text style={{ width: 140, fontSize: 12, fontWeight: '700', color: '#6b7280' }}>Bond Agreement</Text>
                  <Text style={{ width: 220, fontSize: 12, fontWeight: '700', color: '#6b7280', textAlign: 'right' }}>Actions</Text>
                </View>

                {/* Table Body */}
                {filteredInvestors.map((inv) => {
                  const docsObj = inv.docVerifications || {};
                  const docKeys = Object.keys(docsObj);
                  const docsApprovedCount = docKeys.filter((v) => docsObj[v] === 'Approved').length;
                  const totalDocsCount = docKeys.length || 5;
                  const isBondAccepted = inv.bondAgreement?.accepted;

                  const statusColor = inv.status === 'Verified'
                    ? { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }
                    : inv.status === 'Rejected'
                      ? { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
                      : { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };

                  return (
                    <View
                      key={inv._id || inv.id || Math.random().toString()}
                      style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#fff' }}
                    >
                      {/* Investor Code & Name */}
                      <View style={{ width: 140 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#111' }}>{inv.fullName || '—'}</Text>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4338ca', marginTop: 2 }}>{inv.investorCode || 'INV-0000'}</Text>
                      </View>

                      {/* Contact Email / Phone */}
                      <View style={{ width: 180 }}>
                        <Text style={{ fontSize: 12, color: '#374151', textBreakStrategy: 'simple' }}>{inv.email || '—'}</Text>
                        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{inv.phone || '—'}</Text>
                      </View>

                      {/* Referred By */}
                      <View style={{ width: 110 }}>
                        <View style={{ backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#1e40af' }}>{inv.referralEmployeeName || 'Direct / Self'}</Text>
                        </View>
                      </View>

                      {/* Invest RS Amount */}
                      <View style={{ width: 110 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#111' }}>₹{(inv.investmentAmount || 0).toLocaleString()}</Text>
                      </View>

                      {/* Monthly Growth % */}
                      <View style={{ width: 120 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#10b981' }}>{inv.monthlyGrowthPercentage || 2.5}% / mo</Text>
                      </View>

                      {/* Status */}
                      <View style={{ width: 140 }}>
                        <View style={{ backgroundColor: statusColor.bg, borderWidth: 1.5, borderColor: statusColor.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' }}>
                          <Text style={{ color: statusColor.text, fontSize: 10, fontWeight: '800' }}>{inv.status || 'Pending'}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Docs: {docsApprovedCount}/{totalDocsCount} Approved</Text>
                      </View>

                      {/* Bond Agreement */}
                      <View style={{ width: 140 }}>
                        {isBondAccepted ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <ShieldCheck size={13} color="#10b981" />
                            <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '800' }}>
                              Accepted ({inv.bondAgreement?.signatureText || '—'})
                            </Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 11, color: '#9ca3af' }}>Not Accepted</Text>
                        )}
                      </View>

                      {/* Actions */}
                      <View style={{ minWidth: 260, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
                        {inv.status === 'Verified' && (
                          <TouchableOpacity
                            style={{ backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            onPress={() => setBondInvestorModal(inv)}
                          >
                            <ShieldCheck size={12} color="#0c1c3d" />
                            <Text style={{ color: '#0c1c3d', fontSize: 11, fontWeight: '900' }}>Bond PDF</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={{ backgroundColor: '#0c1c3d', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          onPress={() => setSelectedDebentureForm(inv)}
                        >
                          <FileText size={12} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Form</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#0c1c3d', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          onPress={() => setSelectedInvestor(inv)}
                        >
                          <Eye size={12} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>View & Verify</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#3b82f6', padding: 6, borderRadius: 4 }}
                          onPress={() => setEditInvestor({ ...inv })}
                        >
                          <Edit size={12} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#ef4444', padding: 6, borderRadius: 4 }}
                          onPress={() => handleDeleteInvestor(inv)}
                        >
                          <Trash2 size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                {filteredInvestors.length === 0 && (
                  <Text style={{ textAlign: 'center', color: '#9ca3af', paddingVertical: 32 }}>No investors found.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* --- ADD INVESTOR MODAL --- */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>+ Add New Investor</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter Investor Full Name"
                placeholderTextColor={colors.textMuted}
                value={formData.fullName}
                onChangeText={(val) => setFormData({ ...formData, fullName: val })}
              />

              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="investor@example.com"
                placeholderTextColor={colors.textMuted}
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter 10-digit Phone"
                placeholderTextColor={colors.textMuted}
                value={formData.phone}
                onChangeText={(val) => setFormData({ ...formData, phone: val })}
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Default: Investor@123"
                placeholderTextColor={colors.textMuted}
                value={formData.password}
                onChangeText={(val) => setFormData({ ...formData, password: val })}
                secureTextEntry
              />

              <Text style={styles.formLabel}>Invested RS Amount</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 500000"
                placeholderTextColor={colors.textMuted}
                value={formData.investmentAmount}
                onChangeText={(val) => setFormData({ ...formData, investmentAmount: val })}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Monthly Growth Rate (%)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2.5"
                placeholderTextColor={colors.textMuted}
                value={formData.monthlyGrowthPercentage}
                onChangeText={(val) => setFormData({ ...formData, monthlyGrowthPercentage: val })}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Referred By Employee Name</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Direct / Self or Employee Name"
                placeholderTextColor={colors.textMuted}
                value={formData.referralEmployeeName}
                onChangeText={(val) => setFormData({ ...formData, referralEmployeeName: val })}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
                onPress={handleCreateInvestor}
                disabled={submitting}
              >
                <Text style={styles.saveBtnText}>{submitting ? 'Creating...' : 'Create Investor'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- EDIT INVESTOR MODAL --- */}
      <Modal visible={!!editInvestor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Investor</Text>
              <TouchableOpacity onPress={() => setEditInvestor(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInvestor?.fullName || editInvestor?.userId?.fullName || editInvestor?.name || ''}
                onChangeText={(val) => setEditInvestor({ ...editInvestor, fullName: val })}
              />

              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInvestor?.email || editInvestor?.userId?.email || ''}
                onChangeText={(val) => setEditInvestor({ ...editInvestor, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInvestor?.phone || editInvestor?.userId?.phone || ''}
                onChangeText={(val) => setEditInvestor({ ...editInvestor, phone: val })}
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Invested RS Amount</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInvestor?.investmentAmount !== undefined && editInvestor?.investmentAmount !== null ? String(editInvestor.investmentAmount) : '0'}
                onChangeText={(val) => setEditInvestor({ ...editInvestor, investmentAmount: val })}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Monthly Growth Rate (%)</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInvestor?.monthlyGrowthPercentage !== undefined && editInvestor?.monthlyGrowthPercentage !== null ? String(editInvestor.monthlyGrowthPercentage) : '2.5'}
                onChangeText={(val) => setEditInvestor({ ...editInvestor, monthlyGrowthPercentage: val })}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Investor Status</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                {['Pending', 'Verified', 'Rejected'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.typeSelectBtn,
                      editInvestor?.status === st && styles.typeSelectBtnActive,
                      { flex: 1 },
                    ]}
                    onPress={() => setEditInvestor({ ...editInvestor, status: st })}
                  >
                    <Text style={[styles.typeSelectText, editInvestor?.status === st && styles.typeSelectTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
                onPress={handleSaveEditInvestor}
                disabled={submitting}
              >
                <Text style={styles.saveBtnText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- ADMIN AUDIT MODAL --- */}
      <Modal visible={!!selectedInvestor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedInvestor?.fullName || selectedInvestor?.email}</Text>
              <TouchableOpacity onPress={() => setSelectedInvestor(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                {selectedInvestor?.investorCode} • {selectedInvestor?.email} • {selectedInvestor?.phone}
              </Text>

              <View style={[styles.netSalaryCard, { backgroundColor: colors.surfaceLight, marginVertical: 12 }]}>
                <Text style={styles.detailLabel}>REFERRED BY EMPLOYEE</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent }}>
                  {selectedInvestor?.referralEmployeeName || 'Direct / Self Signup'}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <View>
                    <Text style={styles.detailLabel}>INVESTED RS AMOUNT</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'black', color: colors.success }}>
                      ₹{(selectedInvestor?.investmentAmount || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>MONTHLY GROWTH</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'black', color: colors.accent }}>
                      {selectedInvestor?.monthlyGrowthPercentage || 2.5}% / mo
                    </Text>
                  </View>
                </View>

                {selectedInvestor?.status === 'Verified' && (
                  <TouchableOpacity
                    style={{ backgroundColor: '#f59e0b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onPress={() => setBondInvestorModal(selectedInvestor)}
                  >
                    <ShieldCheck size={16} color="#0c1c3d" />
                    <Text style={{ color: '#0c1c3d', fontWeight: '900', fontSize: 13 }}>Download Payment Bond (PDF)</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Debenture Application Form Details */}
              {selectedInvestor?.debentureForm && (
                <View style={[styles.settingsCard, { marginBottom: 12 }]}>
                  <Text style={[styles.settingsCardTitle, { color: colors.accent }]}>Debenture Application Form</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    App No: {selectedInvestor.debentureForm.applicationNo || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 12, marginTop: 4 }}>
                    Father/Spouse: {selectedInvestor.debentureForm.fatherSpouseName || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    DOB: {selectedInvestor.debentureForm.dob || 'N/A'} | Occupation: {selectedInvestor.debentureForm.occupation || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.accent, fontWeight: 'bold', marginTop: 2 }}>
                    {selectedInvestor.debentureForm.typeOfDebenture || 'Secured'} ({selectedInvestor.debentureForm.noOfDebentures} qty @ ₹{selectedInvestor.debentureForm.faceValue})
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    Payment: {selectedInvestor.debentureForm.modeOfPayment} (UTR: {selectedInvestor.debentureForm.transactionUtrNo || 'N/A'})
                  </Text>
                </View>
              )}

              {/* Investor KYC Fields & Bond Agreement Summary */}
              <View style={[styles.settingsCard, { marginVertical: 10, backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.settingsCardTitle, { fontSize: 13, color: colors.accent }]}>Investor KYC & Bank Details</Text>
                <Text style={{ fontSize: 11, color: colors.text, marginTop: 4 }}>
                  Aadhar No: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.aadharNumber || 'Not Entered'}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: colors.text }}>
                  PAN No: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.panNumber || 'Not Entered'}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: colors.text }}>
                  Bank: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.bankName || 'N/A'}</Text> | A/C: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.accountNumber || 'N/A'}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: colors.text }}>
                  IFSC: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.ifscCode || 'N/A'}</Text> | Branch: <Text style={{ fontWeight: 'bold' }}>{selectedInvestor?.kycDocs?.branchName || 'N/A'}</Text>
                </Text>

                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                    Bond Agreement: {selectedInvestor?.bondAgreement?.accepted ? '✓ Accepted' : '❌ Not Accepted'}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Signature: <Text style={{ fontWeight: 'bold', color: colors.accent }}>{selectedInvestor?.bondAgreement?.signatureText || 'N/A'}</Text>
                  </Text>
                </View>
              </View>

              {/* Document Audit */}
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Document Verification Audit</Text>
              {[
                { key: 'aadhar', label: 'Aadhar Card', url: selectedInvestor?.kycDocs?.aadharDocUrl },
                { key: 'pan', label: 'PAN Card', url: selectedInvestor?.kycDocs?.panDocUrl },
                { key: 'marksheet10th', label: '10th Marksheet', url: selectedInvestor?.kycDocs?.marksheet10thUrl },
                { key: 'marksheet12th', label: '12th Marksheet', url: selectedInvestor?.kycDocs?.marksheet12thUrl },
                { key: 'bankPassbook', label: 'Bank Passbook', url: selectedInvestor?.kycDocs?.bankPassbookUrl },
              ].map((doc) => {
                const st = selectedInvestor?.docVerifications?.[doc.key] || 'Pending';
                return (
                  <View key={doc.key} style={styles.payrollTableRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{doc.label}</Text>
                      <Text style={{ fontSize: 11, color: st === 'Approved' ? colors.success : st === 'Rejected' ? colors.danger : colors.warning }}>
                        Status: {st}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={[styles.filterSubmitBtn, { backgroundColor: doc.url ? colors.info : colors.textMuted, paddingHorizontal: 6 }]}
                        onPress={() => {
                          const docUrl = formatDocUrl(doc.url);
                          if (docUrl) {
                            setPreviewDocModal({ title: doc.label, url: docUrl });
                          } else {
                            Alert.alert('Doc Link', `Document submitted by investor (${st}).`);
                          }
                        }}
                      >
                        <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>👁️ View</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filterSubmitBtn, { backgroundColor: colors.success, paddingHorizontal: 8 }]}
                        onPress={() => handleDocVerify(doc.key, 'Approved')}
                        disabled={submitting}
                      >
                        <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filterSubmitBtn, { backgroundColor: colors.border, paddingHorizontal: 8 }]}
                        onPress={() => handleDocVerify(doc.key, 'Rejected')}
                        disabled={submitting}
                      >
                        <Text style={{ color: colors.danger, fontSize: 10, fontWeight: 'bold' }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* Overall Approval / Rejection */}
              {showRejectBox && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.formLabel}>Reason for Rejection *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter reason..."
                    value={rejectReason}
                    onChangeText={setRejectReason}
                  />
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.danger }]}
                    onPress={() => handleUpdateOverallStatus('Rejected', rejectReason)}
                    disabled={submitting || !rejectReason.trim()}
                  >
                    <Text style={styles.saveBtnText}>Confirm Rejection</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.border }]}
                  onPress={() => setShowRejectBox(!showRejectBox)}
                >
                  <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Reject All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateOverallStatus('Verified')}
                >
                  <Text style={styles.saveBtnText}>Approve & Verify All</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- DEBENTURE FORM VIEW MODAL --- */}
      <Modal visible={!!selectedDebentureForm} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0c1c3d' }}>
          {/* Top Bar matching screenshot 1 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c1c3d', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 12.5, fontWeight: '800' }}>📄 FORM — {(selectedDebentureForm?.fullName || selectedDebentureForm?.email || '').toUpperCase()}</Text>
              <View style={{ backgroundColor: '#c9972f', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: '#0c1c3d', fontSize: 10, fontWeight: '900' }}>{selectedDebentureForm?.investorCode || 'INV-0005'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#c9972f', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => Alert.alert('Office Use', 'Office use details saved successfully.')}
              >
                <Text style={{ color: '#0c1c3d', fontWeight: '900', fontSize: 11 }}>💾 Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => handleDownloadBondPdf(selectedDebentureForm)}
              >
                <Printer size={13} color="#0c1c3d" />
                <Text style={{ color: '#0c1c3d', fontWeight: '900', fontSize: 11 }}>Print / PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedDebentureForm(null)} style={{ backgroundColor: '#1e293b', padding: 6, borderRadius: 6 }}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedDebentureForm && (() => {
            const inv = selectedDebentureForm;
            const df = inv.debentureForm || {};
            const kyc = inv.kycDocs || {};
            const prefillName = df.fullName || inv.fullName || '';
            const prefillEmail = df.email || inv.email || '';
            const prefillPhone = df.phone || inv.phone || '';
            const passportPhoto = formatDocUrl(df.passportPhotoUrl || inv.passportPhotoUrl);
            const signature = formatDocUrl(df.signatureUrl || inv.signatureUrl);

            const docsList = [
              { label: '📷 Photo', url: passportPhoto },
              { label: '✍️ Signature', url: signature },
              { label: '🪪 Aadhaar', url: formatDocUrl(kyc.aadharDocUrl || df.aadharDocUrl) },
              { label: '💳 PAN', url: formatDocUrl(kyc.panDocUrl || df.panDocUrl) },
              { label: '🏦 Bank Passbook', url: formatDocUrl(kyc.bankPassbookUrl || df.bankPassbookUrl) },
              { label: '📜 10th Marksheet', url: formatDocUrl(kyc.marksheet10thUrl) },
              { label: '📜 12th Marksheet', url: formatDocUrl(kyc.marksheet12thUrl) },
            ];

            const panStr = (df.panNumber || '').toUpperCase();
            const isSecured = (df.typeOfDebenture || 'Secured').includes('Secured') ? 'Secured' : df.typeOfDebenture || 'Secured';
            const faceVal = Number(df.faceValue) || 1000;
            const noOfDebs = Number(df.noOfDebentures) || 1;
            const calculatedTotal = (Number(df.totalAmount) || (noOfDebs * faceVal)) || 1200;
            const todayStr = new Date().toISOString().split('T')[0];

            const getSelectedDebentureFormHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Debenture Application Form</title>
<style>
  :root{
    --navy:#0c1c3d;
    --gold:#c9972f;
    --gold-light:#e8b84b;
    --cream:#ffffff;
    --text:#1c1c1c;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  html, body{
    background:#e7e7e7;
    font-family:'Segoe UI', Arial, sans-serif;
    color:var(--text);
    padding:10px;
    width:100%;
    min-height:100%;
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
  }
  .sheet{
    width:100%;
    max-width:850px;
    margin:0 auto;
    background:#ffffff;
    border:2px solid var(--navy);
    position:relative;
    padding:16px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
  }
  .header{
    background:#0c1c3d;
    color:#fff;
    padding:16px 20px;
    text-align:center;
    position:relative;
    border-bottom:3px solid var(--gold);
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .logo-circle{
    width:56px;
    height:56px;
    border-radius:50%;
    border:2.5px solid var(--gold);
    background:#0c1c3d;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:900;
    color:var(--gold-light);
    font-size:18px;
    font-style:italic;
    flex-shrink:0;
  }
  .header-brand{
    text-align:center;
    flex:1;
    padding:0 10px;
  }
  .company-name{
    font-size:20px;
    font-weight:900;
    letter-spacing:0.5px;
    color:var(--gold-light);
    margin-bottom:4px;
  }
  .addr{font-size:11px;line-height:1.4;color:#e2e8f0;}
  .contact-row{display:flex;justify-content:center;gap:14px;font-size:10.5px;margin-top:5px;color:#cbd5e1;flex-wrap:wrap;}
  .crest{text-align:center;color:var(--gold-light);font-size:8.5px;font-weight:800;letter-spacing:0.5px;line-height:1.2;flex-shrink:0;}
  .crest .crown{font-size:15px;display:block;margin-bottom:1px;}
  .divider{text-align:center;padding:8px 0 4px;color:var(--gold);font-size:12px;letter-spacing:3px;}
  .title-block{text-align:center;padding:4px 16px 8px;}
  .title-block h1{color:var(--navy);font-size:22px;font-weight:900;letter-spacing:1px;margin:0;}
  .title-block h2{color:#c05a1e;font-size:12.5px;font-weight:700;letter-spacing:0.5px;margin:3px 0 8px;}
  .notice-badge{background:#0c1c3d;color:#fff;display:inline-block;padding:5px 18px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:0.5px;margin-bottom:10px;}
  .app-no-row{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:4px 0 12px;padding:0 4px;}
  .top-info{font-size:12px;line-height:1.6;margin-bottom:12px;}
  .top-info b{display:block;}
  .section-header{
    background:#0c1c3d;
    color:#fff;
    font-size:12px;
    font-weight:800;
    letter-spacing:0.5px;
    padding:5px 14px;
    margin:14px 0 0;
    clip-path:polygon(0 0, 100% 0, 96% 100%, 0% 100%);
    display:inline-block;
    min-width:220px;
  }
  .box{border:1px solid #c9972f;margin:0 0 14px;padding:10px 14px;background:#fffdf9;}
  .field-table{width:100%;border-collapse:collapse;font-size:12px;}
  .field-table td{padding:6px 4px;border-bottom:1px dotted #e2e8f0;vertical-align:middle;}
  .field-table tr:last-child td{border-bottom:none;}
  .field-label{width:200px;color:#334155;font-weight:600;}
  .field-colon{width:12px;text-align:center;color:#64748b;}
  .field-val{font-weight:700;color:#0c1c3d;}
  .decl-flex{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;}
  .decl-text{flex:1;font-size:11.5px;line-height:1.7;color:#334155;}
  .decl-text ol{margin:6px 0 0 16px;padding:0;}
  .photo-box{
    width:110px;
    height:130px;
    border:1.5px dashed #c9972f;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    font-size:10.5px;
    color:#8a6d1f;
    flex-shrink:0;
    background:#fff8e7;
    border-radius:4px;
    overflow:hidden;
  }
  .photo-box img{width:100%;height:100%;object-fit:cover;}
  .decl-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:11.5px;font-weight:700;}
  .docs-grid{display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;padding:4px 0;}
  .doc-card{border:1px solid #e2e8f0;background:#ffffff;border-radius:8px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;}
  .doc-title{font-size:11.5px;font-weight:700;color:#0c1c3d;}
  .btn-view{background:#e0e7ff;color:#4338ca;border:1px solid #c7d2fe;padding:4px 10px;border-radius:6px;font-weight:800;font-size:11px;cursor:pointer;text-decoration:none;display:inline-block;}
  .office-wrap{display:grid;grid-template-columns:repeat(3, 1fr);border:1px solid #c9972f;margin-top:4px;background:#fffdf9;}
  .office-col{padding:10px 12px;font-size:11px;}
  .office-col+.office-col{border-left:1px solid #c9972f;}
  .office-title{background:#0c1c3d;color:#fff;text-align:center;font-size:10.5px;font-weight:800;padding:4px;margin:-10px -12px 8px;}
  .office-row{margin-bottom:6px;display:flex;gap:4px;align-items:center;}
  .office-lbl{width:110px;flex-shrink:0;color:#475569;font-weight:600;}
  .office-val{font-weight:700;color:#0c1c3d;}
  .stamp-circle{width:64px;height:64px;border:2px solid #0c1c3d;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.5px;color:#0c1c3d;font-weight:900;margin:8px 0 0 auto;line-height:1.2;}
  @media (max-width:768px){
    html, body{padding:4px;}
    .sheet{padding:10px;border-width:1px;}
    .header{flex-direction:column;gap:8px;padding:12px;}
    .company-name{font-size:16px;}
    .app-no-row{flex-direction:column;gap:4px;}
    .field-table td{display:block;width:100%;padding:4px 0;}
    .field-label{width:100%;}
    .field-colon{display:none;}
    .decl-flex{flex-direction:column-reverse;align-items:center;}
    .docs-grid{grid-template-columns:repeat(2, 1fr);}
    .office-wrap{grid-template-columns:1fr;}
    .office-col+.office-col{border-left:none;border-top:1px solid #c9972f;}
  }
</style>
</head>
<body>
<form class="sheet" id="debentureForm">
  <div class="header">
    <div class="logo-circle">NC</div>
    <div class="header-brand">
      <div class="company-name">NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</div>
      <div class="addr">A-91, Block A, Gali No. 2, Sewak Park, Near Dwarka Mor Metro Station, Gate No. 2, Dwarka Mor, New Delhi &ndash; 110059, India</div>
      <div class="contact-row">
        <span>&#128222; 8920313143</span>
        <span>&#9993; info@niventracapitaladvisory.com</span>
        <span>&#127760; www.niventracapitaladvisory.com</span>
      </div>
    </div>
    <div class="crest"><span class="crown">&#9819;</span>INVEST TODAY<br>PROSPER<br>TOMORROW</div>
  </div>

  <div class="divider">&#10022; &mdash;&mdash;&mdash; &#10022; &mdash;&mdash;&mdash; &#10022;</div>
  
  <div class="title-block">
    <h1>DEBENTURE APPLICATION FORM</h1>
    <h2>(FOR SECURED DEBENTURES)</h2>
    <div class="notice-badge">OFFICIAL FILLED APPLICATION DOCUMENT</div>
  </div>

  <div class="app-no-row">
    <div>Application No: <b>${df.applicationNo || inv.investorCode || 'INV-0005'}</b></div>
    <div>Application Date: <b>${df.applicationDate || '2026-07-22'}</b></div>
  </div>

  <div class="top-info">
    To,<br>
    The Board of Directors,<br>
    <b>NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</b>
  </div>

  <div class="section-header">1. INVESTOR DETAILS</div>
  <div class="box">
    <table class="field-table">
      <tr><td class="field-label">Full Name (Applicant)</td><td class="field-colon">:</td><td class="field-val">${prefillName || 'Ashish'}</td></tr>
      <tr><td class="field-label">Father's / Spouse Name</td><td class="field-colon">:</td><td class="field-val">${df.fatherSpouseName || '—'}</td></tr>
      <tr><td class="field-label">Date of Birth / Incorporation</td><td class="field-colon">:</td><td class="field-val">${df.dob || '—'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>PAN No:</b> ${panStr || '—'}</td></tr>
      <tr><td class="field-label">Address</td><td class="field-colon">:</td><td class="field-val">${df.address || '—'}</td></tr>
      <tr><td class="field-label">City / State / PIN</td><td class="field-colon">:</td><td class="field-val">${df.city || '—'}, ${df.state || '—'} — ${df.pinCode || '—'}</td></tr>
      <tr><td class="field-label">Mobile & Email</td><td class="field-colon">:</td><td class="field-val">&#128222; ${prefillPhone || '—'} &nbsp;&nbsp;&nbsp;&nbsp; &#9993; ${prefillEmail || '—'}</td></tr>
      <tr><td class="field-label">Occupation</td><td class="field-colon">:</td><td class="field-val">${df.occupation || '—'}</td></tr>
    </table>
  </div>

  <div class="section-header">2. INVESTMENT DETAILS</div>
  <div class="box">
    <table class="field-table">
      <tr><td class="field-label">Type of Debenture</td><td class="field-colon">:</td><td class="field-val">${isSecured}</td></tr>
      <tr><td class="field-label">Face Value (Per Debenture)</td><td class="field-colon">:</td><td class="field-val">&#8377;${faceVal.toLocaleString()}</td></tr>
      <tr><td class="field-label">No. of Debentures Applied</td><td class="field-colon">:</td><td class="field-val">${noOfDebs} <small style="color:#64748b;">(Units)</small></td></tr>
      <tr><td class="field-label">Total Application Amount</td><td class="field-colon">:</td><td class="field-val" style="color:#059669;font-size:14px;">&#8377;${calculatedTotal.toLocaleString()}</td></tr>
      <tr><td class="field-label">Mode of Payment</td><td class="field-colon">:</td><td class="field-val">${df.modeOfPayment || 'NEFT/RTGS'}</td></tr>
      <tr><td class="field-label">Transaction / UTR / Ref No</td><td class="field-colon">:</td><td class="field-val">${df.transactionUtrNo || '—'}</td></tr>
      <tr><td class="field-label">Bank Name</td><td class="field-colon">:</td><td class="field-val">${df.bankName || '—'}</td></tr>
    </table>
  </div>

  <div class="section-header">3. DECLARATION & PHOTOGRAPH</div>
  <div class="box">
    <div class="decl-flex">
      <div class="decl-text">
        I/We hereby declare and confirm that:
        <ol>
          <li>I/We have read and understood the terms and conditions of the Information Memorandum and Debenture Trust Deed. The information provided by me/us in this application is true, correct and complete.</li>
          <li>I/We agree to be bound by the terms and conditions governing the issue of Secured Debentures.</li>
        </ol>
        <div style="margin-top:10px;"><b>Place:</b> Delhi &nbsp;|&nbsp; <b>Date:</b> ${df.applicationDate || '2026-07-22'}</div>
        <div class="decl-footer">
          <div>Digital Signature: <b>${prefillName} &#10004;</b></div>
          <div>Referred By: <b>${inv.referredBy || 'Direct'}</b></div>
        </div>
      </div>
      <div class="photo-box">
        ${passportPhoto ? `<img src="${passportPhoto}" alt="Passport Photo" />` : `No Photo<br>Attached`}
      </div>
    </div>
  </div>

  <div class="section-header">4. ATTACHED KYC DOCUMENTS</div>
  <div class="box">
    <div class="docs-grid">
      <div class="doc-card">
        <span class="doc-title">1. PAN Card</span>
        ${kyc.panDocUrl || df.panDocUrl ? `<button type="button" onclick="viewDoc('PAN Card', '${formatDocUrl(kyc.panDocUrl || df.panDocUrl)}')" class="btn-view">&#128065; View</button>` : `<span style="color:#e11d48;font-weight:bold;font-size:11px;">Missing</span>`}
      </div>
      <div class="doc-card">
        <span class="doc-title">2. Aadhaar Card</span>
        ${kyc.aadharDocUrl || df.aadharDocUrl ? `<button type="button" onclick="viewDoc('Aadhaar Card', '${formatDocUrl(kyc.aadharDocUrl || df.aadharDocUrl)}')" class="btn-view">&#128065; View</button>` : `<span style="color:#e11d48;font-weight:bold;font-size:11px;">Missing</span>`}
      </div>
      <div class="doc-card">
        <span class="doc-title">3. Bank Proof</span>
        ${kyc.bankPassbookUrl || df.bankPassbookUrl ? `<button type="button" onclick="viewDoc('Bank Proof', '${formatDocUrl(kyc.bankPassbookUrl || df.bankPassbookUrl)}')" class="btn-view">&#128065; View</button>` : `<span style="color:#e11d48;font-weight:bold;font-size:11px;">Missing</span>`}
      </div>
      <div class="doc-card">
        <span class="doc-title">4. Photo</span>
        ${passportPhoto ? `<button type="button" onclick="viewDoc('Passport Photo', '${formatDocUrl(passportPhoto)}')" class="btn-view">&#128065; View</button>` : `<span style="color:#e11d48;font-weight:bold;font-size:11px;">Missing</span>`}
      </div>
    </div>
  </div>
  <script>
    function viewDoc(title, url) {
      if (!url) return;
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIEW_DOC', title: title, url: url }));
      } else {
        window.open(url, '_blank');
      }
    }
  </script>

  <div class="box office-wrap" style="padding:0;">
    <div class="office-col">
      <div class="office-title">FOR OFFICE USE ONLY</div>
      <div class="office-row"><span class="office-lbl">Received On:</span><span class="office-val">${todayStr}</span></div>
      <div class="office-row"><span class="office-lbl">Received By:</span><span class="office-val">Admin</span></div>
      <div class="office-row"><span class="office-lbl">Amount Received:</span><span class="office-val">&#8377; ${calculatedTotal.toLocaleString()}</span></div>
      <div class="office-row"><span class="office-lbl">Payment Mode:</span><span class="office-val">${df.modeOfPayment || 'NEFT/RTGS'}</span></div>
      <div class="office-row"><span class="office-lbl">Remark:</span><span class="office-val">Verified & Processed</span></div>
      <div class="office-row"><span class="office-lbl">Application Status:</span><span class="office-val" style="color:#059669;">Accepted</span></div>
      <div class="office-row"><span class="office-lbl">Allotted Debenture No:</span><span class="office-val">${inv.investorCode ? 'DEB-' + inv.investorCode.replace('INV-', '') : 'DEB-0005'}</span></div>
    </div>

    <div class="office-col">
      <div class="office-title">VERIFIED BY</div>
      <div class="office-row"><span class="office-lbl">Name:</span><span class="office-val">Admin Verifier</span></div>
      <div class="office-row"><span class="office-lbl">Designation:</span><span class="office-val">Senior Manager - Ops</span></div>
      <div class="office-row"><span class="office-lbl">Sign & Date:</span><span class="office-val">${todayStr}</span></div>
    </div>

    <div class="office-col">
      <div class="office-title">APPROVED BY</div>
      <div class="office-row"><span class="office-lbl">Name:</span><span class="office-val">Ram Mohan Sharma</span></div>
      <div class="office-row"><span class="office-lbl">Designation:</span><span class="office-val">Authorized Signatory</span></div>
      <div class="office-row"><span class="office-lbl">Sign & Date:</span><span class="office-val">${todayStr}</span></div>
      <div style="margin-top:6px;font-size:9.5px;color:#64748b;">For NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</div>
      <div style="font-family:'Brush Script MT',cursive;font-size:18px;color:#1e293b;margin:4px 0 2px;">Ram Mohan Sharma</div>
      <div style="font-size:10px;font-weight:700;">Ram Mohan Sharma</div>
      <div style="font-size:9px;color:#64748b;">Authorized Signatory</div>
      <div class="stamp-circle">NEW DELHI<br>110059<br>INDIA</div>
    </div>
  </div>
</form>
</body>
</html>`;

            return (
              <View style={{ flex: 1, backgroundColor: colors.background }}>
                {/* Documents Quick-Access Bar */}
                <View style={{ backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.borderGold }}>
                  <Text style={{ color: colors.goldLight, fontSize: 10, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 }}>
                    ATTACHED DOCUMENTS & VERIFICATION
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {docsList.map((doc, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          backgroundColor: doc.url ? colors.info : colors.surfaceLight,
                          borderWidth: 1,
                          borderColor: doc.url ? colors.info : colors.border,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onPress={() => {
                          if (doc.url) {
                            setPreviewDocModal({ title: doc.label, url: doc.url });
                          } else {
                            Alert.alert('Document Status', `${doc.label} not uploaded or missing.`);
                          }
                        }}
                      >
                        <Text style={{ color: doc.url ? '#fff' : colors.textMuted, fontSize: 11, fontWeight: '700' }}>{doc.label}</Text>
                        {doc.url ? <Text style={{ color: colors.goldLight, fontSize: 10, fontWeight: '900' }}>👁️ View</Text> : <Text style={{ color: colors.textMuted, fontSize: 10 }}>N/A</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Form HTML Preview */}
                <View style={{ flex: 1, width: '100%', height: '100%' }}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      srcDoc={getSelectedDebentureFormHtml()}
                      style={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
                    />
                  ) : (
                    <WebView
                      source={{ html: getSelectedDebentureFormHtml() }}
                      style={{ flex: 1, width: '100%', height: '100%', backgroundColor: colors.background }}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      scalesPageToFit={true}
                      showsVerticalScrollIndicator={true}
                      showsHorizontalScrollIndicator={false}
                      originWhitelist={['*']}
                      automaticallyAdjustContentInsets={false}
                      scrollEnabled={true}
                      onMessage={(event) => {
                        try {
                          const data = JSON.parse(event.nativeEvent.data);
                          if (data.type === 'VIEW_DOC' && data.url) {
                            setPreviewDocModal({ title: data.title, url: data.url });
                          }
                        } catch (_) {}
                      }}
                    />
                  )}
                </View>
              </View>
            );
          })()}
        </SafeAreaView>
      </Modal>

      {/* --- PAYMENT BOND CERTIFICATE PREVIEW MODAL --- */}
      <Modal visible={!!bondInvestorModal} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
          {/* Top Bar matching user design */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.borderGold }}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color={colors.success} />
                <Text numberOfLines={1} style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>Payment Bond</Text>
              </View>
              <View style={{ backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 3 }}>
                <Text style={{ color: '#fff', fontSize: 8.5, fontWeight: '900' }}>VERIFIED & APPROVED</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}
                onPress={() => handleDownloadBondPdf(bondInvestorModal)}
              >
                <Download size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 11.5 }}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setBondInvestorModal(null)} style={{ backgroundColor: colors.surfaceLight, padding: 6, borderRadius: 6 }}>
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Certificate View */}
          {bondInvestorModal && (
            <View style={{ flex: 1, width: '100%', height: '100%' }}>
              {Platform.OS === 'web' ? (
                <iframe
                  srcDoc={generatePaymentBondHtml(bondInvestorModal)}
                  style={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
                />
              ) : (
                <WebView
                  source={{ html: generatePaymentBondHtml(bondInvestorModal) }}
                  style={{ flex: 1, width: '100%', height: '100%', backgroundColor: colors.background }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scalesPageToFit={true}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  originWhitelist={['*']}
                  automaticallyAdjustContentInsets={false}
                  scrollEnabled={true}
                />
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* --- DOCUMENT PREVIEW OVERLAY MODAL --- */}
      <Modal visible={!!previewDocModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: '85%', maxHeight: '90%', padding: 0 }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>👁️ {previewDocModal?.title || 'Document Preview'}</Text>
              <TouchableOpacity onPress={() => setPreviewDocModal(null)} style={{ padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6 }}>
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Document Body */}
            <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              {(() => {
                const targetUrl = formatDocUrl(previewDocModal?.url || '');
                if (!targetUrl) {
                  return <Text style={{ color: colors.textMuted, fontSize: 13 }}>No document preview available.</Text>;
                }

                const isImage = targetUrl.startsWith('data:image') || targetUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
                const isPdf = targetUrl.toLowerCase().includes('.pdf');

                if (isImage) {
                  return (
                    <Image
                      source={{ uri: targetUrl }}
                      style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                    />
                  );
                }

                if (isPdf) {
                  const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetUrl)}`;
                  return (
                    <WebView
                      source={{ uri: Platform.OS === 'android' ? googleDocsUrl : targetUrl }}
                      style={{ flex: 1, width: '100%', height: '100%' }}
                      javaScriptEnabled
                      domStorageEnabled
                      originWhitelist={['*']}
                      onError={() => {
                        Linking.openURL(targetUrl);
                      }}
                    />
                  );
                }

                return (
                  <WebView
                    source={{ uri: targetUrl }}
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={['*']}
                  />
                );
              })()}
            </View>

            {/* Footer Actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: colors.surface }}>
              <TouchableOpacity
                style={{ backgroundColor: colors.info, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => {
                  const targetUrl = formatDocUrl(previewDocModal?.url || '');
                  if (targetUrl) {
                    Linking.openURL(targetUrl).catch(() => Alert.alert('Link', targetUrl));
                  }
                }}
              >
                <Eye size={14} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>Open Full Link / Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => setPreviewDocModal(null)}
              >
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// --- Debenture Application Form View Sub-Component ---
const DebentureFormView = () => {
  const user = useAuthStore((state) => state.user);
  const webViewRef = useRef<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);

  const prefillName = (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : '';
  const prefillEmail = user?.email || '';
  const prefillPhone = (user as any)?.phone || '';
  const prefillEmpCode = (user as any)?.employeeCode || (user as any)?.employeeId || user?.email || '';
  const autoAppNo = `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  useEffect(() => {
    const handleWebMessage = (event: MessageEvent) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (msg.type === 'SUBMIT' || msg.type === 'PICK_PHOTO') {
          handleMessage({ nativeEvent: { data: JSON.stringify(msg) } });
        }
      } catch (_) { }
    };
    if (Platform.OS === 'web') {
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, []);

  const handleMessage = async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'PICK_PHOTO') {
        const source = msg.source || 'gallery';
        let result;
        if (source === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required to take a live photo.');
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
          });
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Gallery permission is required to select a photo.');
            return;
          }
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
          });
        }

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          const js = `if (window.renderPhotoBase64) { window.renderPhotoBase64("${base64Data}"); } true;`;
          if (Platform.OS === 'web') {
            window.postMessage(JSON.stringify({ type: 'SET_PHOTO', data: base64Data }), '*');
          } else {
            webViewRef.current?.injectJavaScript(js);
          }
        }
      } else if (msg.type === 'SUBMIT') {
        const formData = msg.data;
        if (!formData.fullName || !formData.mobile || !formData.email) {
          Alert.alert('Validation Error', 'Please enter Applicant Name, Mobile, and Email.');
          return;
        }
        setSubmitting(true);
        try {
          const res: any = await apiCall('/api/debenture-application', {
            method: 'POST',
            body: JSON.stringify({
              fullName: formData.fullName,
              fatherSpouseName: formData.parentSpouseName,
              dob: formData.dob,
              phone: formData.mobile,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pinCode: [formData.pin1, formData.pin2, formData.pin3, formData.pin4, formData.pin5, formData.pin6].join(''),
              occupation: formData.occupation,
              panNumber: [formData.pan1, formData.pan2, formData.pan3, formData.pan4, formData.pan5, formData.pan6, formData.pan7, formData.pan8, formData.pan9, formData.pan10].join(''),
              typeOfDebenture: [formData.typeSecured && 'Secured', formData.typeNonConvertible && 'Non-Convertible', formData.typeRedeemable && 'Redeemable'].filter(Boolean).join(', ') || 'Secured',
              faceValue: Number(formData.faceValue) || 100000,
              noOfDebentures: Number(formData.numDebenturesFigures) || 1,
              investmentAmount: (Number(formData.numDebenturesFigures) || 1) * (Number(formData.faceValue) || 100000),
              modeOfPayment: formData.paymentMode || 'NEFT/RTGS',
              transactionUtrNo: formData.utrNo,
              drawnOnBank: formData.drawnOnBank,
              bankName: formData.bankName,
              referralEmployeeCode: formData.referralEmployeeCode || prefillEmpCode || '',
            }),
          });
          if (res && (res.success || res.data || res.applicationNo)) {
            const appNo = res.applicationNo || res.data?.debentureForm?.applicationNo || `DEB-${Math.floor(100000 + Math.random() * 900000)}`;
            setSubmittedAppNo(appNo);
            Alert.alert('Application Submitted!', `Debenture Application submitted successfully under App No: ${appNo}`);
          } else {
            Alert.alert('Error', res?.error || 'Failed to submit debenture application.');
          }
        } catch (e: any) {
          Alert.alert('Error', e.message || 'Failed to submit application');
        } finally {
          setSubmitting(false);
        }
      }
    } catch (_) { }
  };

  const debentureHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Debenture Application Form</title>
<style>
  :root{
    --navy:#0c1c3d;
    --gold:#c9972f;
    --gold-light:#e8b84b;
    --cream:#fffdf8;
    --text:#1c1c1c;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    padding:12px;
    background:#e7e7e7;
    font-family:'Segoe UI', Arial, sans-serif;
    color:var(--text);
  }
  .sheet{
    max-width:100%;
    margin:0 auto;
    background:var(--cream);
    border:2px solid var(--navy);
    position:relative;
  }
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="number"],
  input[type="date"],
  textarea,
  select{
    font-family:inherit;
    font-size:12.5px;
    color:#0c1c3d;
    background:#fbf6e8;
    border:none;
    border-bottom:1px solid #999;
    padding:2px 4px;
    outline:none;
    width:100%;
  }
  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="tel"]:focus,
  input[type="number"]:focus,
  input[type="date"]:focus,
  textarea:focus,
  select:focus{
    border-bottom:1.5px solid var(--navy);
    background:#fff8dc;
  }
  .digit-box{
    width:20px;
    height:22px;
    text-align:center;
    padding:0;
    border:1px solid #999;
    border-bottom:1px solid #999;
    font-size:13px;
    text-transform:uppercase;
  }
  .header{
    background:linear-gradient(180deg,#0c1c3d,#132a5c);
    color:#fff;
    padding:18px 30px 14px;
    text-align:center;
    border-bottom:4px solid var(--gold);
    position:relative;
  }
  .company-name{
    font-size:22px;
    font-weight:800;
    letter-spacing:1px;
    color:var(--gold-light);
    margin:6px 0 8px;
    text-shadow:0 1px 2px rgba(0,0,0,0.4);
  }
  .addr{font-size:12px;line-height:1.5;margin:0 0 8px;}
  .contact-row{display:flex;justify-content:center;gap:16px;font-size:11px;margin-top:6px;flex-wrap:wrap;}
  .logo-badge{
    position:absolute;left:12px;top:14px;
    width:60px;height:60px;border-radius:50%;
    background:radial-gradient(circle,#12224e 60%,#0c1c3d 100%);
    border:3px solid var(--gold);
    display:flex;align-items:center;justify-content:center;
    font-weight:800;color:var(--gold-light);font-size:18px;
  }
  .crest{position:absolute;right:12px;top:10px;text-align:center;color:var(--gold-light);font-size:9px;font-weight:700;letter-spacing:0.5px;line-height:1.3;}
  .crest .crown{font-size:16px;display:block;margin-bottom:2px;}
  .divider{text-align:center;padding:6px 0;color:var(--gold);font-size:13px;letter-spacing:3px;}
  .title-block{text-align:center;padding:4px 16px;}
  .title-block h1{color:var(--navy);font-size:20px;letter-spacing:2px;margin:0;}
  .title-block h2{color:#c05a1e;font-size:13px;letter-spacing:1px;margin:3px 0 8px;}
  .notice{background:var(--navy);color:#fff;display:inline-block;padding:4px 16px;border-radius:14px;font-size:10.5px;letter-spacing:0.5px;margin-bottom:8px;}
  .app-no-box{border:1px solid var(--gold);padding:8px 10px;font-size:11.5px;margin:0 16px 10px;background:#fffef9;}
  .app-no-box div{margin-bottom:6px;display:flex;align-items:center;gap:4px;}
  .app-no-box div:last-child{margin-bottom:0;}
  .app-no-box input{width:90px;}
  .date-trio{display:flex;gap:4px;}
  .date-trio input{width:30px;text-align:center;}
  .top-info{padding:0 16px;font-size:12px;line-height:1.6;}
  .top-info b{display:block;}
  .section-header{background:var(--navy);color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;padding:4px 12px;margin:12px 16px 0;clip-path:polygon(0 0,100% 0,97% 100%,0% 100%);display:inline-block;min-width:200px;}
  .box{border:1px solid var(--gold);margin:0 16px 12px;padding:8px 12px;background:#fffef9;}
  .field-row{display:flex;align-items:center;gap:6px;font-size:11.5px;padding:5px 0;border-bottom:1px dotted #e3c98a;flex-wrap:wrap;}
  .field-row:last-child{border-bottom:none;}
  .field-icon{width:18px;color:var(--gold);flex-shrink:0;text-align:center;}
  .field-label{width:160px;flex-shrink:0;color:#333;}
  .field-colon{width:8px;flex-shrink:0;}
  .field-fill{flex:1;min-width:80px;}
  .pan-boxes,.pin-boxes{display:flex;gap:2px;}
  .checkbox-group{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;}
  .checkbox-group label{display:flex;align-items:center;gap:4px;cursor:pointer;}
  .checkbox-group input[type="checkbox"],.docs-grid input[type="checkbox"]{width:13px;height:13px;accent-color:var(--navy);}
  .checkbox-group input[type="text"]{width:60px;}
  .decl-text{font-size:11px;line-height:1.7;}
  .decl-text ol{margin:4px 0 0 14px;padding:0;}
  .decl-flex{display:flex;justify-content:space-between;gap:12px;}
  .decl-flex .left{flex:1;}
  .photo-box{width:100px;height:110px;border:1.5px dashed var(--gold);display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;color:#8a6d1f;flex-shrink:0;position:relative;overflow:hidden;cursor:pointer;background:#fffef9;}
  .photo-box img{width:100%;height:100%;object-fit:cover;}
  .photo-box input[type="file"]{position:absolute;inset:0;opacity:0;cursor:pointer;}
  .sign-line{display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:11px;flex-wrap:wrap;gap:8px;}
  .sign-line input[type="text"]{width:130px;display:inline-block;}
  .sig-pad-wrap{text-align:center;}
  .sig-pad{border:1px solid #999;background:#fff;width:180px;height:50px;cursor:crosshair;display:block;}
  .sig-clear{font-size:9px;color:#0c1c3d;background:none;border:1px solid var(--gold);border-radius:3px;padding:1px 6px;margin-top:2px;cursor:pointer;}
  .docs-grid{display:flex;justify-content:space-between;font-size:11.5px;gap:12px;}
  .docs-grid .col{flex:1;}
  .docs-grid label{display:flex;align-items:center;gap:4px;margin-bottom:6px;cursor:pointer;}
  .docs-grid input[type="text"]{width:90px;}
  .office-wrap{display:flex;margin:12px 16px 16px;border:1px solid var(--gold);flex-wrap:wrap;}
  .office-col{flex:1;min-width:160px;padding:8px 10px;font-size:10.5px;}
  .office-col+.office-col{border-left:1px solid var(--gold);}
  .office-title{background:var(--navy);color:#fff;text-align:center;font-size:10px;font-weight:700;padding:3px;margin:-8px -10px 6px;}
  .office-col div.row{margin-bottom:6px;display:flex;gap:4px;align-items:center;}
  .office-col .lbl{width:110px;flex-shrink:0;}
  .office-col input[type="text"],.office-col input[type="date"],.office-col input[type="number"]{flex:1;}
  .office-col label{display:flex;align-items:center;gap:3px;margin:0;cursor:pointer;}
  .office-col input[type="radio"]{width:10px;height:10px;}
  .stamp{width:56px;height:56px;border:2px solid var(--navy);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7px;color:var(--navy);font-weight:700;margin-top:6px;line-height:1.2;}
  .sign-name{font-family:'Brush Script MT',cursive;font-size:16px;color:#1a2c56;margin:4px 0 0;}
  small.faded{color:#666;}
  .action-bar{display:flex;justify-content:flex-end;gap:8px;padding:10px 16px 16px;}
  .action-bar button{font-family:inherit;font-size:12px;font-weight:600;padding:8px 18px;border-radius:4px;border:none;cursor:pointer;}
  #submitBtn{background:var(--navy);color:#fff;}
  #resetBtn{background:#eee;color:#333;border:1px solid #ccc;}
  #statusMsg{padding:0 16px 12px;text-align:center;font-size:12px;color:#0c6b2d;font-weight:600;}
  @media (max-width:768px){
    body{padding:4px;}
    .sheet{border-width:1px;}
    .header{padding:14px 10px;text-align:center;}
    .logo-badge{position:relative;left:auto;top:auto;margin:0 auto 6px;}
    .crest{position:relative;right:auto;top:auto;margin:6px auto 0;}
    .company-name{font-size:16px;letter-spacing:0.5px;}
    .addr{font-size:10.5px;}
    .contact-row{font-size:10px;gap:8px;flex-direction:column;align-items:center;}
    .title-block h1{font-size:16px;}
    .title-block h2{font-size:12px;}
    .section-header{min-width:unset;width:calc(100% - 24px);margin:10px 12px 0;}
    .box{margin:0 12px 10px;padding:8px;}
    .field-row{flex-direction:column;align-items:flex-start;gap:4px;padding:6px 0;}
    .field-label{width:100%;font-weight:700;color:var(--navy);}
    .field-colon{display:none;}
    .field-fill{width:100%;max-width:100% !important;}
    .pan-boxes,.pin-boxes{flex-wrap:wrap;}
    .decl-flex{flex-direction:column-reverse;align-items:center;gap:10px;}
    .sign-line{flex-direction:column;align-items:flex-start;gap:12px;}
    .sig-pad-wrap{width:100%;text-align:center;}
    .sig-pad{width:100% !important;max-width:260px;margin:0 auto;}
    .docs-grid{flex-direction:column;gap:6px;}
    .office-wrap{flex-direction:column;margin:10px 12px 12px;}
    .office-col+.office-col{border-left:none;border-top:1px solid var(--gold);}
    .action-bar{justify-content:center;width:100%;}
    .action-bar button{flex:1;text-align:center;}
  }
</style>
</head>
<body>
<form class="sheet" id="debentureForm">
  <div class="header">
    <div class="logo-badge">NC</div>
    <div class="crest"><span class="crown">&#9819;</span>INVEST TODAY<br>PROSPER<br>TOMORROW</div>
    <div class="company-name">NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</div>
    <div class="addr">A-91, Block A, Gali No. 2, Sewak Park,<br>Near Dwarka Mor Metro Station, Gate No. 2,<br>Dwarka Mor, New Delhi &ndash; 110059, India</div>
    <div class="contact-row">
      <span>&#128222; 8920313143</span>
      <span>&#9993; info@niventracapitaladvisory.com</span>
      <span>&#127760; www.niventracapitaladvisory.com</span>
    </div>
  </div>
  <div class="divider">&#10022; &mdash;&mdash;&mdash; &#10022; &mdash;&mdash;&mdash; &#10022;</div>
  <div class="title-block">
    <h1>DEBENTURE APPLICATION FORM</h1>
    <h2>(FOR SECURED DEBENTURES)</h2>
    <div class="notice">PLEASE READ THE INSTRUCTIONS CAREFULLY BEFORE FILLING THE FORM</div>
  </div>
  <div class="app-no-box">
    <div>Application No. <input type="text" name="applicationNo" value="${autoAppNo}" style="font-weight:bold;color:#0c1c3d;"></div>
    <div>Date : <span class="date-trio"><input type="text" maxlength="2" placeholder="DD">/<input type="text" maxlength="2" placeholder="MM">/<input type="text" maxlength="4" placeholder="YYYY" style="width:40px;"></span></div>
  </div>
  <div class="top-info">
    <p>To,<br>The Board of Directors,<br><b>NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</b></p>
    <p>I/We hereby apply for the allotment of Secured, Rated, Listed/Unlisted, Redeemable, Non-Convertible Debentures of your Company on the terms and conditions as mentioned in the Information Memorandum / Debenture Trust Deed and other related documents.</p>
  </div>
  <div class="section-header">1. INVESTOR DETAILS</div>
  <div class="box">
    <div class="field-row"><div class="field-icon">&#128100;</div><div class="field-label">Full Name (Applicant)</div><div class="field-colon">:</div><div class="field-fill"><input type="text" name="fullName" value="${prefillName}" required></div></div>
    <div class="field-row"><div class="field-icon">&#128100;</div><div class="field-label">Father's / Spouse Name</div><div class="field-colon">:</div><div class="field-fill"><input type="text" name="parentSpouseName"></div></div>
    <div class="field-row"><div class="field-icon">&#128197;</div><div class="field-label">Date of Birth / Incorporation</div><div class="field-colon">:</div><div class="field-fill" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><input type="date" name="dob" style="width:130px;"><span style="white-space:nowrap;">PAN No.&nbsp;:</span><div class="pan-boxes"><input class="digit-box" maxlength="1" name="pan1"><input class="digit-box" maxlength="1" name="pan2"><input class="digit-box" maxlength="1" name="pan3"><input class="digit-box" maxlength="1" name="pan4"><input class="digit-box" maxlength="1" name="pan5"><input class="digit-box" maxlength="1" name="pan6"><input class="digit-box" maxlength="1" name="pan7"><input class="digit-box" maxlength="1" name="pan8"><input class="digit-box" maxlength="1" name="pan9"><input class="digit-box" maxlength="1" name="pan10"></div></div></div>
    <div class="field-row"><div class="field-icon">&#128205;</div><div class="field-label">Address</div><div class="field-colon">:</div><div class="field-fill"><input type="text" name="address"></div></div>
    <div class="field-row"><div class="field-icon">&#127970;</div><div class="field-label">City</div><div class="field-colon">:</div><div class="field-fill" style="max-width:140px;"><input type="text" name="city"></div><div style="width:40px;text-align:center;">State</div><div style="width:8px;">:</div><div class="field-fill" style="max-width:120px;"><input type="text" name="state"></div><div style="width:60px;text-align:right;">PIN</div><div style="width:8px;">:</div><div class="pin-boxes"><input class="digit-box" maxlength="1" name="pin1"><input class="digit-box" maxlength="1" name="pin2"><input class="digit-box" maxlength="1" name="pin3"><input class="digit-box" maxlength="1" name="pin4"><input class="digit-box" maxlength="1" name="pin5"><input class="digit-box" maxlength="1" name="pin6"></div></div>
    <div class="field-row"><div class="field-icon">&#128241;</div><div class="field-label">Mobile No.</div><div class="field-colon">:</div><div class="field-fill" style="max-width:180px;"><input type="tel" name="mobile" maxlength="10" value="${prefillPhone}"></div><div style="width:60px;text-align:right;">Email</div><div style="width:8px;">:</div><div class="field-fill"><input type="email" name="email" value="${prefillEmail}"></div></div>
    <div class="field-row"><div class="field-icon">&#128100;</div><div class="field-label">Employee Referral ID</div><div class="field-colon">:</div><div class="field-fill"><input type="text" name="referralEmployeeCode" value="${prefillEmpCode}" style="font-weight:bold;color:#0c1c3d;"></div></div>
    <div class="field-row"><div class="field-icon">&#128188;</div><div class="field-label">Occupation / Nature of Business</div><div class="field-colon">:</div><div class="field-fill"><input type="text" name="occupation"></div></div>
  </div>
  <div class="section-header">2. INVESTMENT DETAILS</div>
  <div class="box">
    <div class="field-row"><div class="field-label" style="width:150px;">Type of Debenture</div><div class="field-colon">:</div><div class="checkbox-group"><label><input type="checkbox" name="typeSecured" checked>Secured</label><label><input type="checkbox" name="typeNonConvertible">Non-Convertible</label><label><input type="checkbox" name="typeRedeemable">Redeemable</label></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">Face Value (Per Debenture)</div><div class="field-colon">:</div><div class="field-fill">&#8377; <input type="number" name="faceValue" style="width:160px;display:inline-block;" min="0" value="100000"></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">No. of Debentures Applied</div><div class="field-colon">:</div><div class="field-fill" style="display:flex;gap:12px;align-items:center;"><input type="number" name="numDebenturesFigures" style="max-width:100px;" min="0" value="1"><small class="faded">(Figures)</small><input type="text" name="numDebenturesWords"><small class="faded">(Words)</small></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">Total Application Amount</div><div class="field-colon">:</div><div class="field-fill" style="display:flex;align-items:center;gap:8px;">&#8377; <input type="number" name="totalAmount" id="totalAmount" style="max-width:200px;" min="0"><small class="faded">(Face Value x No.)</small></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">Mode of Payment</div><div class="field-colon">:</div><div class="checkbox-group"><label><input type="radio" name="paymentMode" value="NEFT/RTGS" checked>NEFT / RTGS</label><label><input type="radio" name="paymentMode" value="Cheque">Cheque</label><label><input type="radio" name="paymentMode" value="DD">DD</label><label><input type="radio" name="paymentMode" value="Other">Other <input type="text" name="paymentModeOther"></label></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">Bank Name</div><div class="field-colon">:</div><div class="field-fill" style="max-width:180px;"><input type="text" name="bankName"></div><div style="width:130px;text-align:right;">Transaction / UTR No.</div><div style="width:8px;">:</div><div class="field-fill"><input type="text" name="utrNo"></div></div>
    <div class="field-row"><div class="field-label" style="width:150px;">Cheque / DD No.</div><div class="field-colon">:</div><div class="field-fill" style="max-width:140px;"><input type="text" name="chequeDdNo"></div><div style="width:40px;text-align:right;">Date</div><div style="width:8px;">:</div><div class="field-fill" style="max-width:120px;"><input type="date" name="chequeDate"></div><div style="width:90px;text-align:right;">Drawn On</div><div style="width:8px;">:</div><div class="field-fill"><input type="text" name="drawnOnBank"></div></div>
  </div>
  <div class="section-header">3. DECLARATION</div>
  <div class="box">
    <div class="decl-flex">
      <div class="left decl-text">I/We hereby declare and confirm that:<ol><li>I/We have read and understood the terms and conditions of the Information Memorandum, Debenture Trust Deed and related documents.</li><li>The information provided by me/us in this application is true, correct and complete.</li><li>I/We agree to be bound by the terms and conditions governing the issue of Secured Debentures.</li><li>I/We authorize the Company to verify any or all of the above information, as it may deem fit.</li></ol></div>
      <div class="photo-box" id="photoBox" style="position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;border:1.5px dashed #0c1c3d;border-radius:6px;background:#fbf6e8;width:120px;height:140px;">
        <span id="photoPlaceholder" style="font-size:9.5px;text-align:center;color:#0c1c3d;font-weight:700;margin-bottom:4px;">Passport Photo</span>
        <div style="display:flex;flex-direction:column;gap:3px;width:100%;z-index:2;">
          <button type="button" id="btnUploadGallery" style="background:#0c1c3d;color:#ffffff;border:none;padding:4px;border-radius:4px;font-size:9.5px;font-weight:800;cursor:pointer;width:100%;">📁 Gallery</button>
          <button type="button" id="btnLiveCamera" style="background:#c9972f;color:#ffffff;border:none;padding:4px;border-radius:4px;font-size:9.5px;font-weight:800;cursor:pointer;width:100%;">📷 Camera</button>
        </div>
        <input type="file" accept="image/*" id="photoInputFile" style="display:none;">
        <input type="file" accept="image/*" capture="user" id="photoInputCam" style="display:none;">
        <img id="photoPreviewImg" style="display:none;width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:3;border-radius:4px;">
      </div>
    </div>
    <div class="sign-line">
      <div>Place : <input type="text" name="place"></div>
      <div class="sig-pad-wrap"><canvas class="sig-pad" id="sigPad" width="180" height="50"></canvas><div style="font-weight:600;margin-top:2px;font-size:11px;">Signature of Applicant</div><button type="button" class="sig-clear" id="sigClear">Clear signature</button></div>
    </div>
    <div style="font-size:11px;margin-top:8px;">Date : <span class="date-trio"><input type="text" maxlength="2" placeholder="DD" name="declDay">/<input type="text" maxlength="2" placeholder="MM" name="declMonth">/<input type="text" maxlength="4" placeholder="YYYY" style="width:40px;" name="declYear"></span></div>
  </div>
  <div class="section-header">4. DOCUMENTS TO BE ENCLOSED (SELF ATTESTED)</div>
  <div class="box">
    <div class="docs-grid">
      <div class="col"><label><input type="checkbox" name="docPan">1. PAN Card Copy</label><label><input type="checkbox" name="docAddress">2. Address Proof (Aadhaar / Voter ID / Passport)</label><label><input type="checkbox" name="docIdentity">3. Identity Proof (Aadhaar / Passport)</label></div>
      <div class="col"><label><input type="checkbox" name="docPhoto">4. Photograph</label><label><input type="checkbox" name="docCheque">5. Cancelled Cheque / Bank Proof</label><label><input type="checkbox" name="docOther">6. Other <input type="text" name="docOtherText"></label></div>
    </div>
  </div>
  <div class="office-wrap">
    <div class="office-col"><div class="office-title">FOR OFFICE USE ONLY</div><div class="row"><span class="lbl">Application Received On</span>: <input type="date" name="officeReceivedOn"></div><div class="row"><span class="lbl">Received By</span>: <input type="text" name="officeReceivedBy"></div><div class="row"><span class="lbl">Amount Received</span>: &#8377; <input type="number" name="officeAmountReceived"></div><div class="row"><span class="lbl">Payment Mode</span>: <input type="text" name="officePaymentMode"></div><div class="row"><span class="lbl">Remark</span>: <input type="text" name="officeRemark"></div><div class="row"><span class="lbl">Status</span>: <label><input type="radio" name="officeStatus" value="Accepted">Accepted</label>&nbsp;<label><input type="radio" name="officeStatus" value="Rejected">Rejected</label></div><div class="row"><span class="lbl">Allotted Deb. No.</span>: <input type="text" name="officeAllottedNo"></div></div>
    <div class="office-col"><div class="office-title">VERIFIED BY</div><div class="row"><span class="lbl">Name</span>: <input type="text" name="verifiedName"></div><div class="row"><span class="lbl">Designation</span>: <input type="text" name="verifiedDesignation"></div><div class="row"><span class="lbl">Sign &amp; Date</span>: <input type="text" name="verifiedSignDate"></div></div>
    <div class="office-col"><div class="office-title">APPROVED BY</div><div class="row"><span class="lbl">Name</span>: <input type="text" name="approvedName"></div><div class="row"><span class="lbl">Designation</span>: <input type="text" name="approvedDesignation"></div><div class="row"><span class="lbl">Sign &amp; Date</span>: <input type="text" name="approvedSignDate"></div><div style="margin-top:4px;font-weight:700;font-size:10px;">For NIVENTRA CAPITAL ADVISORY INDIA PVT LTD</div><div class="sign-name">Ram Mohan Sharma</div><div style="font-size:9.5px;">Ram Mohan Sharma<br>Authorized Signatory</div><div style="display:flex;justify-content:flex-end;"><div class="stamp">NEW DELHI<br>110059<br>INDIA</div></div></div>
  </div>
  <div class="action-bar">
    <button type="button" id="resetBtn">Reset Form</button>
    <button type="button" id="submitBtn">Submit Application</button>
  </div>
  <div id="statusMsg"></div>
</form>
<script>
  // Signature pad
  const canvas = document.getElementById('sigPad');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#0c1c3d'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  let drawing = false;
  function pos(e){const rect=canvas.getBoundingClientRect();const clientX=e.touches?e.touches[0].clientX:e.clientX;const clientY=e.touches?e.touches[0].clientY:e.clientY;return{x:clientX-rect.left,y:clientY-rect.top};}
  function start(e){drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault();}
  function move(e){if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault();}
  function end(){drawing=false;}
  canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
  canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
  document.getElementById('sigClear').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));

  // Photo Upload & Live Camera Capture Handlers via Native Bridge
  const photoInputFile = document.getElementById('photoInputFile');
  const photoInputCam = document.getElementById('photoInputCam');
  const btnUploadGallery = document.getElementById('btnUploadGallery');
  const btnLiveCamera = document.getElementById('btnLiveCamera');
  const photoPreviewImg = document.getElementById('photoPreviewImg');

  function sendPhotoRequest(src) {
    const payload = JSON.stringify({ type: 'PICK_PHOTO', source: src });
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(payload);
    } else if (window.parent && window.parent.postMessage) {
      window.parent.postMessage(payload, '*');
    } else if (src === 'camera' && photoInputCam) {
      photoInputCam.click();
    } else if (photoInputFile) {
      photoInputFile.click();
    }
  }

  if (btnUploadGallery) btnUploadGallery.onclick = function() { sendPhotoRequest('gallery'); };
  if (btnLiveCamera) btnLiveCamera.onclick = function() { sendPhotoRequest('camera'); };

  window.renderPhotoBase64 = function(base64Uri) {
    if (photoPreviewImg) {
      photoPreviewImg.src = base64Uri;
      photoPreviewImg.style.display = 'block';
      const ph = document.getElementById('photoPlaceholder');
      if (ph) ph.style.display = 'none';
    }
  };

  window.addEventListener('message', function(ev) {
    try {
      const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (data.type === 'SET_PHOTO' && data.data) {
        window.renderPhotoBase64(data.data);
      }
    } catch (_) {}
  });

  function renderPhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      window.renderPhotoBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  if (photoInputFile) photoInputFile.onchange = function(e) { renderPhoto(e.target.files[0]); };
  if (photoInputCam) photoInputCam.onchange = function(e) { renderPhoto(e.target.files[0]); };

  // PAN box auto-advance
  document.querySelectorAll('.pan-boxes .digit-box').forEach((box,idx,arr)=>{box.addEventListener('input',()=>{box.value=box.value.toUpperCase();if(box.value&&idx<arr.length-1)arr[idx+1].focus();});});
  document.querySelectorAll('.pin-boxes .digit-box').forEach((box,idx,arr)=>{box.addEventListener('input',()=>{box.value=box.value.replace(/[^0-9]/g,'');if(box.value&&idx<arr.length-1)arr[idx+1].focus();});});

  // Auto-calc total
  function calcTotal(){const fv=parseFloat(document.querySelector('[name=faceValue]').value)||0;const nd=parseFloat(document.querySelector('[name=numDebenturesFigures]').value)||0;document.getElementById('totalAmount').value=fv*nd||'';}
  document.querySelector('[name=faceValue]').addEventListener('input',calcTotal);
  document.querySelector('[name=numDebenturesFigures]').addEventListener('input',calcTotal);

  document.getElementById('resetBtn').addEventListener('click',()=>{document.getElementById('debentureForm').reset();ctx.clearRect(0,0,canvas.width,canvas.height);document.getElementById('photoPlaceholder').style.display='';const img=document.getElementById('photoBox').querySelector('img');if(img)img.remove();document.getElementById('statusMsg').textContent='';});

  document.getElementById('submitBtn').addEventListener('click',()=>{
    const form=document.getElementById('debentureForm');
    const data={};
    new FormData(form).forEach((v,k)=>data[k]=v);
    // Also grab checkboxes
    form.querySelectorAll('input[type=checkbox]').forEach(cb=>{data[cb.name]=cb.checked;});
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'SUBMIT',data:data}));
    } else {
      window.parent.postMessage(JSON.stringify({type:'SUBMIT',data:data}), '*');
    }
  });
<\/script>
</body>
</html>`;

  if (submittedAppNo) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: spacing.m, paddingBottom: 60 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
        <View style={[styles.settingsCard, { backgroundColor: colors.surface, alignItems: 'center', padding: 24, marginVertical: 20 }]}>
          <ShieldCheck size={48} color={colors.success} style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>Application Submitted!</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 16 }}>
            Your Secured Debenture Application has been registered under Application No:
          </Text>
          <View style={{ backgroundColor: colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.accent, letterSpacing: 1 }}>{submittedAppNo}</Text>
          </View>
          {submitting && <ActivityIndicator color={colors.accent} style={{ marginBottom: 12 }} />}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.accent, paddingHorizontal: 24 }]}
            onPress={() => setSubmittedAppNo(null)}
          >
            <Text style={styles.saveBtnText}>Submit Another Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {submitting && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#e8b84b" />
          <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>Submitting Application...</Text>
        </View>
      )}
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={debentureHtml}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 600 }}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: debentureHtml }}
          style={{ flex: 1 }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit={true}
          allowFileAccess
          mixedContentMode="always"
        />
      )}
    </View>
  );
};

// --- Investor Portal View Sub-Component ---
const InvestorPortalView = () => {
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bondInvestorModal, setBondInvestorModal] = useState<any>(null);
  const [investmentInput, setInvestmentInput] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [acceptedBond, setAcceptedBond] = useState(false);
  const [bondTermsText, setBondTermsText] = useState(
    `INVESTOR CAPITAL BOND AGREEMENT TERMS\n\n1. The Investor agrees to invest the specified capital amount (RS) into the capital fund.\n2. Monthly returns will be computed at the agreed rate per month subject to document verification.\n3. All uploaded KYC documents (Aadhar, PAN, Marksheets & Bank Details) are verified by Key Admin before activation.\n4. By checking the agreement box, the investor digitally signs and confirms that all submitted information is accurate and legally binding.`
  );

  // KYC inputs & attachments
  const [attachedFiles, setAttachedFiles] = useState<Record<string, string>>({});
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');

  const handlePickDoc = async (key: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setAttachedFiles((prev) => ({ ...prev, [key]: uri }));
        Alert.alert('Document Attached', `${key.toUpperCase()} document attached successfully!`);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let invData: any = null;
      const resInv: any = await apiCall('/api/investors/me');
      if (resInv && (resInv.success || resInv.data)) {
        invData = resInv.data || resInv;
      }
      if (!invData || Array.isArray(invData)) {
        const resAuth: any = await apiCall('/api/auth/me');
        if (resAuth && resAuth.success) {
          invData = resAuth.investor || resAuth.data;
        }
      }

      if (Array.isArray(invData)) {
        invData = invData[0] || null;
      }

      if (invData) {
        setInvestor(invData);
        setInvestmentInput(String(invData.investmentAmount || 0));
        if (invData.bondAgreement) {
          setAcceptedBond(!!invData.bondAgreement.accepted);
          setSignatureText(invData.bondAgreement.signatureText || invData.fullName || invData.email || '');
        } else {
          setSignatureText(invData.fullName || invData.email || '');
        }

        if (invData.kycDocs) {
          setAadharNumber(invData.kycDocs.aadharNumber || '');
          setPanNumber(invData.kycDocs.panNumber || '');
          setBankName(invData.kycDocs.bankName || '');
          setAccountNumber(invData.kycDocs.accountNumber || '');
          setIfscCode(invData.kycDocs.ifscCode || '');
          setBranchName(invData.kycDocs.branchName || '');
        }
      }

      // Fetch bond agreement template from settings if available
      try {
        const resSet: any = await apiCall('/api/settings');
        if (resSet && resSet.success && resSet.data?.investorLegalBondTemplate) {
          setBondTermsText(resSet.data.investorLegalBondTemplate);
        }
      } catch (err) {
        // use default fallback text
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInvestmentAmount = async () => {
    const amt = Number(investmentInput);
    if (isNaN(amt) || amt < 0) {
      Alert.alert('Validation Error', 'Please enter a valid investment amount in Rupees.');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await apiCall('/api/investors/me', {
        method: 'PUT',
        body: JSON.stringify({
          investmentAmount: amt,
        }),
      });

      if (res && (res.success || res.data)) {
        Alert.alert('Success', 'Investment amount updated successfully!');
        fetchProfile();
      } else {
        Alert.alert('Error', res?.error || 'Failed to update investment amount.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update investment amount.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    if (!acceptedBond || !signatureText.trim()) {
      Alert.alert('Validation Error', 'Please check the agreement box and enter your digital signature.');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await apiCall('/api/investors/me', {
        method: 'PUT',
        body: JSON.stringify({
          investmentAmount: Number(investmentInput) || 0,
          kycDocs: {
            aadharNumber,
            panNumber,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
            aadharDocUrl: attachedFiles.aadhar || investor.kycDocs?.aadharDocUrl || '',
            panDocUrl: attachedFiles.pan || investor.kycDocs?.panDocUrl || '',
            marksheet10thUrl: attachedFiles.marksheet10th || investor.kycDocs?.marksheet10thUrl || '',
            marksheet12thUrl: attachedFiles.marksheet12th || investor.kycDocs?.marksheet12thUrl || '',
            graduationUrl: attachedFiles.graduation || investor.kycDocs?.graduationUrl || '',
            postGraduationUrl: attachedFiles.postGraduation || investor.kycDocs?.postGraduationUrl || '',
            bankPassbookUrl: attachedFiles.bankPassbook || investor.kycDocs?.bankPassbookUrl || '',
          },
          bondAgreement: {
            accepted: acceptedBond,
            signatureText: signatureText.trim(),
          },
        }),
      });

      if (res && (res.success || res.data)) {
        Alert.alert('Success', 'Details submitted successfully for Admin Verification!');
        fetchProfile();
      } else {
        Alert.alert('Error', res?.error || 'Failed to submit details');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />;
  if (!investor) return <Text style={{ padding: 20 }}>No investor data found.</Text>;

  const docs = investor.docVerifications || {};
  const monthlyRate = investor.monthlyGrowthPercentage || 2.5;
  const investedAmt = investor.investmentAmount || 0;
  const estimatedReturn = Math.round((investedAmt * monthlyRate) / 100);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: spacing.m, paddingBottom: 60 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
      {/* Profile Header Card */}
      <View style={[styles.netSalaryCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: 18, marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                {investor.fullName || investor.email}
              </Text>
              <View style={{ backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 }}>
                <Text style={{ color: colors.success, fontSize: 11, fontWeight: 'bold' }}>
                  {investor.investorCode || 'INV-0005'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              Email: {investor.email} {investor.phone ? `• Phone: ${investor.phone}` : ''}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, marginBottom: 4 }}>VERIFICATION STATUS</Text>
            <View style={{
              backgroundColor: investor.status === 'Verified' ? colors.success : investor.status === 'Rejected' ? colors.danger : colors.warning,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 16,
            }}>
              <Text style={{ color: colors.background, fontSize: 11, fontWeight: 'bold' }}>
                ✓ {investor.status || 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {investor.status === 'Verified' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#f59e0b',
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#f59e0b',
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={() => setBondInvestorModal(investor)}
          >
            <ShieldCheck size={18} color="#0c1c3d" />
            <Text style={{ color: '#0c1c3d', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 }}>
              🎗️ Download Payment Bond (PDF)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3 Stat Cards Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
        {/* Stat Card 1 */}
        <View style={{ width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, marginBottom: 6 }}>INVESTMENT COST (RS)</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>₹{investedAmt.toLocaleString()}</Text>
        </View>

        {/* Stat Card 2 */}
        <View style={{ width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, marginBottom: 6 }}>MONTHLY GROWTH RATE</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.success }}>~{monthlyRate}%</Text>
        </View>

        {/* Stat Card 3 */}
        <View style={{ width: '34%', backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, marginBottom: 6 }}>EST. MONTHLY RETURN PAYOUT</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.success }}>₹{estimatedReturn.toLocaleString()} / mo</Text>
        </View>
      </View>

      {/* Section 1: Investment Amount (Disabled mode) */}
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, marginBottom: 16 }]}>
        <Text style={[styles.settingsCardTitle, { color: colors.text, fontSize: 16 }]}>$ 1. Investment Amount (RS)</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginVertical: 6 }}>
          Enter the total amount in RS you intend to invest.
        </Text>

        <Text style={styles.formLabel}>Invest RS Amount (₹)</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={[styles.modalTextInput, { flex: 1, backgroundColor: colors.surfaceLight, color: colors.textMuted }]}
            placeholder="0"
            value={investmentInput}
            editable={false}
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.textMuted, paddingHorizontal: 16, justifyContent: 'center' }]}
            disabled={true}
          >
            <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 13 }}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 2: KYC PDF Document Uploads */}
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, marginBottom: 16 }]}>
        <Text style={[styles.settingsCardTitle, { color: colors.text, fontSize: 16 }]}>📄 2. KYC PDF Document Uploads</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginVertical: 6 }}>
          Only PDF documents up to 15MB are accepted. Mandatory: Aadhar, PAN, 10th & 12th Marksheets, and Bank Passbook.
        </Text>

        <View style={{ gap: 12, marginTop: 8 }}>
          {[
            { key: 'aadhar', label: 'Aadhar Card Document', req: true, numKey: 'aadharNumber', numVal: aadharNumber, setNum: setAadharNumber, placeholder: 'Enter Aadhar Number' },
            { key: 'pan', label: 'PAN Card Document', req: true, numKey: 'panNumber', numVal: panNumber, setNum: setPanNumber, placeholder: 'Enter PAN Number' },
            { key: 'marksheet10th', label: '10th Marksheet PDF', req: true },
            { key: 'marksheet12th', label: '12th Marksheet PDF', req: true },
            { key: 'graduation', label: 'Graduation Marksheet (Optional)', req: false },
            { key: 'postGraduation', label: 'Post Graduation Marksheet (Optional)', req: false },
          ].map((item) => {
            const st = docs[item.key] || 'Pending';
            const fileUri = attachedFiles[item.key];

            return (
              <View key={item.key} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, backgroundColor: colors.surfaceLight }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>{item.label}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{ backgroundColor: item.req ? colors.danger : colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: item.req ? colors.background : colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>{item.req ? 'REQUIRED' : 'OPTIONAL'}</Text>
                    </View>
                    <View style={{ backgroundColor: st === 'Approved' ? colors.success : st === 'Rejected' ? colors.danger : colors.warning, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>{st}</Text>
                    </View>
                  </View>
                </View>

                {item.numKey && (
                  <TextInput
                    style={[styles.modalTextInput, { marginBottom: 8 }]}
                    placeholder={item.placeholder}
                    value={item.numVal}
                    onChangeText={item.setNum}
                    editable={st !== 'Approved'}
                  />
                )}

                {st === 'Approved' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: colors.surfaceLight, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.surfaceLight, marginTop: 4 }}>
                    <Text style={{ color: colors.success, fontSize: 12, fontWeight: 'bold' }}>✓ VERIFIED & APPROVED BY ADMIN</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      borderWidth: 1.5,
                      borderStyle: 'dashed',
                      borderColor: fileUri ? colors.success : colors.border,
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                      backgroundColor: fileUri ? 'rgba(16, 185, 129, 0.05)' : colors.surface,
                      marginTop: 4,
                    }}
                    onPress={() => handlePickDoc(item.key)}
                  >
                    <UploadCloud size={20} color={fileUri ? colors.success : colors.textMuted} style={{ marginBottom: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: fileUri ? colors.success : colors.textMuted }}>
                      {fileUri ? '✓ PDF / Document Attached (Tap to change)' : 'Tap to upload PDF / Image document'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Bank Details & Passbook Card */}
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, backgroundColor: colors.surfaceLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>Bank Details & Passbook PDF *</Text>
              <View style={{ backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>REQUIRED</Text>
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <TextInput style={styles.modalTextInput} placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
              <TextInput style={styles.modalTextInput} placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} />
              <TextInput style={styles.modalTextInput} placeholder="IFSC Code" value={ifscCode} onChangeText={setIfscCode} />
              <TextInput style={styles.modalTextInput} placeholder="Branch Name" value={branchName} onChangeText={setBranchName} />
              <TouchableOpacity
                style={{
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: attachedFiles.bankPassbook ? colors.success : colors.border,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  backgroundColor: attachedFiles.bankPassbook ? 'rgba(16, 185, 129, 0.05)' : colors.surface,
                  marginTop: 4,
                }}
                onPress={() => handlePickDoc('bankPassbook')}
              >
                <UploadCloud size={20} color={attachedFiles.bankPassbook ? colors.success : colors.textMuted} style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: attachedFiles.bankPassbook ? colors.success : colors.textMuted }}>
                  {attachedFiles.bankPassbook ? '✓ Bank Passbook Attached (Tap to change)' : 'Tap to upload Bank Passbook PDF / Image'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Section 3: Investor Legal Bond Agreement (Matching Screenshot 2) */}
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, marginBottom: 24 }]}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success, marginBottom: 4 }}>
          🛡️ 3. Investor Legal Bond Agreement
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>
          Review terms and check box with your signature to accept the investor bond.
        </Text>

        {/* Gray Terms Box */}
        <View style={{ backgroundColor: colors.surfaceLight, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16 }}>
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: colors.text, lineHeight: 18 }}>
            {bondTermsText}
          </Text>
        </View>

        {/* Checkbox Row */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          onPress={() => setAcceptedBond(!acceptedBond)}
          activeOpacity={0.7}
        >
          <View style={[styles.customCheckbox, acceptedBond && styles.customCheckboxChecked, { marginRight: 10 }]}>
            {acceptedBond && <Text style={{ color: colors.background, fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 }}>
            I have read, understood, and accept all terms of the Investor Bond Agreement *
          </Text>
        </TouchableOpacity>

        {/* Digital Signature */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
          Digital Signature (Enter Full Name) *
        </Text>
        <TextInput
          style={[styles.modalTextInput, { backgroundColor: colors.surfaceLight, borderColor: colors.border, marginBottom: 16 }]}
          placeholder="ak914@gmail.com"
          placeholderTextColor={colors.textMuted}
          value={signatureText}
          onChangeText={setSignatureText}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.accent, height: 48, justifyContent: 'center' }, submitting && { opacity: 0.7 }]}
          onPress={handleSubmitAll}
          disabled={submitting}
        >
          <Text style={[styles.saveBtnText, { fontSize: 15, fontWeight: 'bold' }]}>
            {submitting ? 'Submitting...' : 'Submit All Details for Admin Verification'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// --- Dashboard Screen ---
const DashboardScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overviewAttRecords, setOverviewAttRecords] = useState<any[]>([]);
  const [overviewAttLoading, setOverviewAttLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);

  const toggleTheme = () => {
    let currentIsDark = false;
    if (themeMode === 'system') {
      currentIsDark = Appearance.getColorScheme() === 'dark';
    } else {
      currentIsDark = themeMode === 'dark';
    }
    setThemeMode(currentIsDark ? 'light' : 'dark');
  };
  const userRole = user?.role || 'Employee';
  const userRoleStr = userRole.toUpperCase();
  const isInvestor = userRoleStr === 'INVESTOR';
  const isAdminOrKeyAdmin = userRoleStr === 'KEYADMIN' || userRoleStr === 'KEY_ADMIN' || userRoleStr === 'ADMIN';

  const initialSection = isInvestor
    ? 'Investor Details'
    : isAdminOrKeyAdmin
      ? 'Overview'
      : ((user as any)?.moduleAccess?.[0] || 'Attendance');

  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const fetchMeData = async () => {
      try {
        const res: any = await apiCall('/api/auth/me');
        if (res.success && res.data) {
          useAuthStore.getState().setUser(res.data);
        }
      } catch (e) {
        console.error('Error fetching /api/auth/me:', e);
      }
    };
    fetchMeData();
  }, []);

  const fetchDashboardData = async () => {
    if (!isAdminOrKeyAdmin) {
      setLoading(false);
      setOverviewAttLoading(false);
      return;
    }
    setLoading(true);
    setOverviewAttLoading(true);
    try {
      const response = await apiCall('/api/dashboard/admin');
      if (response.success && response.data) {
        const dData = response.data.data || response.data;
        setData(dData);
        if (dData && Array.isArray(dData.todaysAttendanceList)) {
          setOverviewAttRecords(dData.todaysAttendanceList);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch dashboard data.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setOverviewAttLoading(false);
    }
  };

  // Fetch attendance records for admin/keyadmin overview
  const fetchOverviewAttendance = async () => {
    await fetchDashboardData();
  };

  const formatOverviewPunchTime = (punchVal: any) => {
    if (!punchVal) return '-';
    if (typeof punchVal === 'string') {
      if (punchVal.includes(':')) return punchVal;
      const d = new Date(punchVal);
      return isNaN(d.getTime()) ? punchVal : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (punchVal.time) {
      const d = new Date(punchVal.time);
      return isNaN(d.getTime()) ? String(punchVal.time) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdminOrKeyAdmin]);

  const handleLogout = () => {
    clearAuth();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading Command Center...</Text>
      </View>
    );
  }

  const k = data?.kpis || {
    totalEmployees: 0,
    walletBalance: 0,
    revenue: 0,
    salaryPaid: 0,
    salaryPending: 0,
    attendanceStats: { present: 0, absent: 0, late: 0, leave: 0 },
    openLeads: 0,
    wonLeads: 0,
  };

  const wonPercentage = k.openLeads + k.wonLeads > 0
    ? Math.round((k.wonLeads / (k.openLeads + k.wonLeads)) * 100)
    : 0;

  const topGap = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 24) : 0;
  const sidebarTopGap = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 24) : Math.max(insets.top, 16);
  const sidebarBottomGap = Math.max(insets.bottom, 16);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topGap }]}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
          <Menu size={24} color={colors.text} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: 28, height: 28, marginLeft: spacing.s, borderRadius: 4 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1, marginLeft: spacing.s }}>
          <Text style={styles.headerTitle}>
            {activeSection === 'Overview' ? 'Command Center' : activeSection}
          </Text>
          <Text style={styles.headerSubtitle}>

            {activeSection === 'Overview'
              ? 'Overview of financials, HR, and sales'
              : `CRM Hub - ${activeSection} panel`}
          </Text>
        </View>
        <View style={styles.headerAvatarBadge}>
          <Text style={styles.headerAvatarText}>
            {(user as any)?.firstName
              ? `${(user as any).firstName[0]}${(user as any).lastName ? (user as any).lastName[0] : ''}`.toUpperCase()
              : (user?.email ? user.email[0].toUpperCase() : 'U')}
          </Text>
        </View>
        <TouchableOpacity style={{ marginRight: 12, padding: 6, justifyContent: 'center', alignItems: 'center' }} onPress={toggleTheme}>
          <Eye size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Conditional rendering of sections */}
      {activeSection === 'Overview' ? (
        userRole === 'Employee' ? (
          /* EMPLOYEE MY HUB DASHBOARD (Matching Web Screenshot) */
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
            {/* Header Title */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>My Hub</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Welcome back! Here is your overview for today.</Text>
            </View>

            {/* Top 4 KPI Cards Grid */}
            <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 12, marginBottom: 16 }}>
              {/* Card 1: Today's Attendance */}
              <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color={colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>Today's Attendance</Text>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 2 }}>Not Punched In</Text>
                </View>
              </View>

              {/* Card 2: Latest Salary (Emerald Card) */}
              <View style={{ flex: 1, backgroundColor: colors.primary === '#0f172a' ? '#064e3b' : '#059669', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#e2e8f0' }}>Latest Salary</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', marginTop: 2 }}>₹ N/A</Text>
                </View>
              </View>

              {/* Card 3: Pending Tasks */}
              <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>Pending Tasks</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 2 }}>0</Text>
                </View>
              </View>

              {/* Card 4: Upcoming Birthdays */}
              <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={20} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>Upcoming Birthdays</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 2 }}>0</Text>
                </View>
              </View>
            </View>

            {/* Middle Section: Attendance Chart, Leave Balance, Announcements & Tasks */}
            <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 14, marginBottom: 16 }}>
              {/* Left: Attendance Last 7 Days */}
              <View style={{ flex: 1.2, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 14 }}>ATTENDANCE (LAST 7 DAYS)</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 10, paddingHorizontal: 8 }}>
                  {['07/28', '07/29', '07/30', '07/31', '08/01', '08/02', '08/03'].map((d, i) => (
                    <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 14, height: 35 + i * 4, backgroundColor: colors.accent, borderRadius: 4, opacity: i === 6 ? 1 : 0.4 }} />
                      <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{d}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Center: Leave Balance */}
              <View style={{ flex: 1.2, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 14 }}>LEAVE BALANCE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} /><Text style={{ fontSize: 11, color: colors.text }}>Paid: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning }} /><Text style={{ fontSize: 11, color: colors.text }}>Casual: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.info }} /><Text style={{ fontSize: 11, color: colors.text }}>Sick: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} /><Text style={{ fontSize: 11, color: colors.text }}>Maternity: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} /><Text style={{ fontSize: 11, color: colors.text }}>Paternity: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold }} /><Text style={{ fontSize: 11, color: colors.text }}>CompOff: <Text style={{ fontWeight: '800' }}>0</Text></Text></View>
                </View>
              </View>

              {/* Right Column: Announcements & Tasks */}
              <View style={{ flex: 1, gap: 12 }}>
                <View style={{ backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accent, marginBottom: 4 }}>📢 Announcements</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>No new announcements.</Text>
                </View>
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginBottom: 4 }}>☑️ My Tasks</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>You're all caught up!</Text>
                </View>
              </View>
            </View>

            {/* Bottom Section: Salary History */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 }}>SALARY HISTORY</Text>
                <TouchableOpacity
                  style={{ backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => setActiveSection('Payroll')}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.textMuted }}>Month</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.textMuted }}>Net Salary</Text>
                </View>
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>No salary history found.</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 60 }]} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {/* Row 1: Global KPIs */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Total Employees */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Total Employees</Text>
                <Users size={20} color={colors.accent} />
              </View>
              <Text style={styles.cardValueLarge}>{k.totalEmployees}</Text>
            </View>

            {/* Card 2: Wallet Balance */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.accent }]}>Wallet Balance</Text>
                <Wallet size={20} color={colors.accent} />
              </View>
              <Text style={styles.cardValueLarge}>₹{k.walletBalance.toLocaleString()}</Text>
            </View>

            {/* Card 3: Revenue */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Revenue (Won Leads)</Text>
                <TrendingUp size={20} color={colors.success} />
              </View>
              <Text style={[styles.cardValueLarge, { color: colors.success }]}>
                ₹{k.revenue.toLocaleString()}
              </Text>
            </View>

            {/* Card 4: Salary Status */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardLabel, { marginBottom: spacing.s }]}>
                Monthly Salary Status
              </Text>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryStatusPaid}>Paid</Text>
                <Text style={styles.salaryAmt}>₹{k.salaryPaid.toLocaleString()}</Text>
              </View>
              <View style={styles.salaryBarContainer}>
                <View
                  style={[
                    styles.salaryBarPaid,
                    { width: `${(k.salaryPaid / (k.salaryPaid + k.salaryPending || 1)) * 100}%` }
                  ]}
                />
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryStatusPending}>Pending</Text>
                <Text style={styles.salaryAmt}>₹{k.salaryPending.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Row 2: Today's Attendance Operations */}
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <View style={styles.attendanceGrid}>
            {/* Main info card */}
            <View style={styles.attendanceMainCard}>
              <Clock size={24} color={colors.textMuted} style={{ marginBottom: 4 }} />
              <Text style={styles.attendanceMainText}>Today's Attendance</Text>
            </View>

            {/* present */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <UserCheck size={16} color={colors.success} />
              </View>
              <Text style={styles.attendanceStatLabel}>Present</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.present}</Text>
            </View>

            {/* absent */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <UserX size={16} color={colors.danger} />
              </View>
              <Text style={styles.attendanceStatLabel}>Absent</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.absent}</Text>
            </View>

            {/* late */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <AlertCircle size={16} color={colors.warning} />
              </View>
              <Text style={styles.attendanceStatLabel}>Late</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.late}</Text>
            </View>

            {/* on leave */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <CalendarDays size={16} color={colors.info} />
              </View>
              <Text style={styles.attendanceStatLabel}>On Leave</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.leave}</Text>
            </View>
          </View>

          {/* Row 2b: Live Employee Attendance List (Admin & Key Admin only) */}
          {isAdminOrKeyAdmin && (
            <View style={[styles.chartCard, { marginTop: spacing.m }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <Text style={styles.chartTitle}>Employee Punch Status</Text>
                </View>
                <TouchableOpacity
                  onPress={fetchOverviewAttendance}
                  style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(99,102,241,0.12)', borderRadius: 6 }}
                >
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Refresh</Text>
                </TouchableOpacity>
              </View>

              {overviewAttLoading ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>Loading live data...</Text>
                </View>
              ) : overviewAttRecords.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
                  No employee attendance records found for today.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Table Header */}
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(99,102,241,0.08)',
                      borderRadius: 6,
                      paddingVertical: 8,
                      paddingHorizontal: 6,
                      marginBottom: 4,
                    }}>
                      <Text style={{ width: 140, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Employee</Text>
                      <Text style={{ width: 90, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Department</Text>
                      <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Status</Text>
                      <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', textAlign: 'center' }}>Punch In</Text>
                      <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', textAlign: 'center' }}>Punch Out</Text>
                      <Text style={{ width: 100, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Location / IP</Text>
                      <Text style={{ width: 60, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', textAlign: 'center' }}>Hours</Text>
                    </View>

                    {/* Table Rows */}
                    {overviewAttRecords.map((record: any, index: number) => {
                      const empName = record.name || 'Unknown';
                      const empCode = record.employeeCode || '-';
                      const empDept = record.department || '-';
                      const status = record.status || 'Absent';
                      const punchInTime = record.punchIn || '-';
                      const punchOutTime = record.punchOut || '-';
                      const location = record.location || '-';
                      const hours = record.workingHours || '-';

                      const isPresent = status.toLowerCase() === 'present';
                      const isAbsent = status.toLowerCase() === 'absent';
                      const isLate = record.isLate || status.toLowerCase() === 'late';

                      let badgeBg = 'rgba(239,68,68,0.15)';
                      let badgeTextColor = colors.danger;

                      if (isPresent) {
                        badgeBg = 'rgba(16,185,129,0.15)';
                        badgeTextColor = colors.success;
                      } else if (status.toLowerCase().includes('half') || isLate) {
                        badgeBg = 'rgba(245,158,11,0.15)';
                        badgeTextColor = colors.warning;
                      }

                      return (
                        <View
                          key={record.id || index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            paddingHorizontal: 6,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255,255,255,0.05)',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ width: 140 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                              {empName}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                              {empCode}
                            </Text>
                          </View>

                          <Text style={{ width: 90, fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                            {empDept}
                          </Text>

                          <View style={{ width: 80, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 10,
                              backgroundColor: badgeBg,
                            }}>
                              <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: badgeTextColor,
                              }}>
                                {status}
                              </Text>
                            </View>
                          </View>

                          <Text style={{ width: 80, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
                            {punchInTime}
                          </Text>
                          <Text style={{ width: 80, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
                            {punchOutTime}
                          </Text>
                          <Text style={{ width: 100, fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                            {location}
                          </Text>
                          <Text style={{ width: 60, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
                            {hours}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          )}

          {/* Row 3: Visual Mockup Charts */}
          <View style={styles.chartsGrid}>
            {/* 6-Month Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>6-Month Trend: Attendance & Salary</Text>
              <View style={styles.barChartContainer}>
                {data?.charts?.monthlyData?.map((item: any, index: number) => (
                  <View key={index} style={styles.barCol}>
                    <View style={styles.barWrapper}>
                      {/* Salary line representation */}
                      <View
                        style={[
                          styles.salaryLineIndicator,
                          { height: `${Math.min(100, (item.salary / 800000) * 100)}%` }
                        ]}
                      />
                      {/* Attendance representation */}
                      <View
                        style={[
                          styles.attendanceBar,
                          { height: `${Math.min(100, (item.present / 15) * 100)}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                  <Text style={styles.legendText}>Avg Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Salary Payout</Text>
                </View>
              </View>
            </View>

            {/* Lead Conversion */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lead Conversion Rate</Text>
              <View style={styles.circularContainer}>
                <View style={styles.donutPlaceholder}>
                  <Text style={styles.donutVal}>{wonPercentage}%</Text>
                  <Text style={styles.donutSub}>WON</Text>
                </View>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
                  <Text style={styles.legendText}>Lost</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.info }]} />
                  <Text style={styles.legendText}>Open</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Won</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 4: Upcoming Birthdays */}
          <View style={[styles.chartCard, { marginBottom: spacing.xl }]}>
            <View style={styles.birthdayHeader}>
              <Gift size={18} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.chartTitle}>Upcoming Birthdays (Next 30 Days)</Text>
            </View>
            {data?.upcomingBirthdays && data.upcomingBirthdays.length > 0 ? (
              <View style={styles.birthdayList}>
                {data.upcomingBirthdays.map((bday: any, index: number) => (
                  <View key={index} style={styles.birthdayRow}>
                    <Text style={styles.birthdayName}>{bday.name}</Text>
                    <Text style={styles.birthdayDate}>
                      {new Date(bday.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noBirthdays}>No upcoming birthdays in the next 30 days.</Text>
            )}
          </View>
        </ScrollView>
      )
    ) : (
      <View style={{ flex: 1 }}>
          {activeSection === 'Employees' ? (
            <EmployeesView />
          ) : activeSection === 'Wallet' ? (
            <CompanyWalletView />
          ) : activeSection === 'Payroll' ? (
            <PayrollView />
          ) : activeSection === 'Attendance' ? (
            <AttendanceView />
          ) : activeSection === 'Leave' ? (
            <LeaveView />
          ) : activeSection === 'Holidays' ? (
            <HolidaysView />
          ) : activeSection === 'Leads' ? (
            <LeadsView />
          ) : activeSection === 'Reports' ? (
            <ReportsView />
          ) : activeSection === 'Settings' ? (
            <SettingsView />
          ) : activeSection === 'Notifications' ? (
            <NotificationsView />
          ) : activeSection === 'Investors' ? (
            <InvestorsAdminView />
          ) : activeSection === 'Investor Details' ? (
            <InvestorPortalView />
          ) : activeSection === 'Debenture Form' || activeSection === 'Debenture' ? (
            <DebentureFormView />
          ) : activeSection === 'Profile' ? (
            <EmployeeProfileView />
          ) : (
            <View style={styles.placeholderSection}>
              <Text style={styles.placeholderTitle}>{activeSection} Module</Text>
              <Text style={styles.placeholderSubtitle}>This panel is currently active. Mobile integration coming soon.</Text>
            </View>
          )}
        </View>
      )}

      {/* --- Sidebar Overlay --- */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          {/* Sidebar Drawer container */}
          <View style={[styles.sidebarContainer, { paddingTop: sidebarTopGap, paddingBottom: sidebarBottomGap }]}>

            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarLogoText}>CRM Hub</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarItems}>
              {[
                { name: 'Overview', icon: LayoutGrid, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Investor Details', icon: LayoutGrid, roles: ['INVESTOR'] },
                { name: 'Investors', icon: TrendingUp, roles: ['ADMIN', 'KEY_ADMIN'] },
                { name: 'Wallet', icon: Wallet, roles: ['ADMIN', 'KEY_ADMIN'] },
                { name: 'Payroll', icon: TrendingUp, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Attendance', icon: Clock, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Leave', icon: CalendarDays, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Holidays', icon: Calendar, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Employees', icon: Users, roles: ['ADMIN', 'KEY_ADMIN'] },
                { name: 'Leads', icon: Target, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Reports', icon: BarChart2, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Debenture Form', icon: ShieldCheck, roles: ['ADMIN', 'KEY_ADMIN', 'Employee'] },
                { name: 'Notifications', icon: Bell, roles: ['ADMIN', 'KEY_ADMIN'] },
                { name: 'Settings', icon: Settings, roles: ['ADMIN', 'KEY_ADMIN'] },
                { name: 'Profile', icon: UserIcon, roles: ['Employee', 'INVESTOR'] },
              ]
                .filter((item) => {
                  if (userRole === 'INVESTOR') return item.roles?.includes('INVESTOR');
                  if (userRole === 'KEY_ADMIN' || userRole === 'ADMIN') return true;

                  // Employee role: ONLY show tabs explicitly granted in /api/auth/me
                  const rawAccess = (user as any)?.moduleAccess || (user as any)?.accessibleTabs || (user as any)?.permissions || (user as any)?.allowedModules;
                  const defaultEmployeeTabs = [
                    'Attendance', 'Leads', 'Reports', 'Profile', 'Holidays', 'Leave', 'Debenture Form', 'Overview'
                  ];
                  const userAccess: string[] = Array.isArray(rawAccess) && rawAccess.length > 0 ? rawAccess : defaultEmployeeTabs;

                  if (item.name === 'Overview' || item.name === 'Profile' || item.name === 'Debenture Form') return true;

                  return userAccess.some((m: string) => {
                    const cleanM = String(m).toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanItem = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanM === cleanItem || cleanM.includes(cleanItem) || cleanItem.includes(cleanM);
                  });
                })
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === (item.name === 'Overview' ? 'Overview' : item.name);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                      onPress={() => {
                        setActiveSection(item.name === 'Overview' ? 'Overview' : item.name);
                        setSidebarOpen(false);
                        if (item.name === 'Overview') {
                          fetchDashboardData();
                          fetchOverviewAttendance();
                        }
                      }}
                    >
                      <IconComponent size={18} color={isActive ? colors.accent : colors.textMuted} style={{ marginRight: 12 }} />
                      <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.sidebarLogout} onPress={handleLogout}>
              <LogOut size={18} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={styles.sidebarLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// --- Navigation Configuration ---
export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const colorScheme = useColorScheme(); // Subscribes the navigation component to system theme updates
  const themeMode = useAuthStore((state) => state.themeMode);

  const isDark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';
  const themeKey = isDark ? 'dark' : 'light';

  return (
    <NavigationContainer key={themeKey}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="AboutCompany"
              component={AboutCompanyScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InvestorRegister"
              component={InvestorRegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};



// --- Styles ---
const styles = createDynamicStyleSheet(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.m,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.m,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  headerAvatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
    marginLeft: 'auto',
  },
  headerAvatarText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: spacing.s,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.s,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  dashboardCard: {
    width: '48%',
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardValueLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.s,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  salaryStatusPaid: {
    fontSize: 11,
    color: colors.success,
    fontWeight: 'bold',
  },
  salaryStatusPending: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: 'bold',
  },
  salaryAmt: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  salaryBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  salaryBarPaid: {
    height: '100%',
    backgroundColor: colors.success,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  attendanceMainCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  attendanceMainText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attendanceStatCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.s,
    marginBottom: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    padding: 6,
    borderRadius: borderRadius.round,
    marginRight: spacing.s,
  },
  attendanceStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  attendanceStatVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 'auto',
    marginRight: 4,
  },
  chartsGrid: {
    marginBottom: spacing.m,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  chartTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.m,
  },
  barChartContainer: {
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  barCol: {
    alignItems: 'center',
    width: 30,
  },
  barWrapper: {
    height: 110,
    width: 14,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  attendanceBar: {
    width: 14,
    backgroundColor: colors.accent,
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  salaryLineIndicator: {
    width: 4,
    backgroundColor: colors.success,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
    left: 5,
    zIndex: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.s,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
  },
  donutPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutVal: {
    fontSize: 20,
    fontWeight: 'black',
    color: colors.text,
  },
  donutSub: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  birthdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  noBirthdays: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.s,
  },
  birthdayList: {
    marginTop: spacing.s,
  },
  birthdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  birthdayName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  birthdayDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  /* --- Sidebar Styles --- */
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebarContainer: {
    width: '75%',
    backgroundColor: colors.surface,
    height: '100%',
    padding: spacing.m,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    zIndex: 1001,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
  },
  sidebarLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  sidebarItems: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
  },
  sidebarItemText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sidebarItemTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  sidebarLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 'auto',
  },
  sidebarLogoutText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: 'bold',
  },
  /* --- Placeholder Styles --- */
  placeholderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  /* --- Employees Styles --- */
  employeesContainer: {
    flex: 1,
    padding: spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  empTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  empSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addEmpButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
  },
  addEmpBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'column',
    marginBottom: spacing.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s,
    height: 40,
    marginBottom: spacing.s,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
  },
  filterBadges: {
    flexDirection: 'row',
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  filterBadgeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  filterBadgeTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  employeeListContainer: {
    flex: 1,
  },
  employeeRowCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  empCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  empAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  empAvatarText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  empName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  empEmail: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.danger,
  },
  empCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empDetailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailVal: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  noEmployeesText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.m,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.m,
    marginBottom: spacing.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalFormContent: {
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    marginBottom: spacing.m,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelectBtnActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  roleSelectText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  roleSelectTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  /* --- Stepper Component Styles --- */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepCircleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepCircleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepCircleTextActive: {
    color: colors.background,
  },
  stepCircleLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  stepCircleLabelActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  stepLine: {
    height: 2,
    flex: 0.8,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: -16, // pull line up to align with circles
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.m,
  },
  typeSelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  typeSelectBtn: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeSelectBtnActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  typeSelectText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  typeSelectTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  roleTip: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.m,
    lineHeight: 16,
  },
  stepperNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
  },
  stepperNavBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperNavBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepperNavBtnDisabled: {
    opacity: 0.5,
  },
  stepperNavText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  stepperNavTextActive: {
    color: colors.background,
  },
  stepperNavTextDisabled: {
    color: colors.textMuted,
  },
  /* --- Employee Detail Styles --- */
  detailScrollContent: {
    paddingBottom: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  detailAvatarText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  detailActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.m,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    marginLeft: spacing.s,
  },
  detailBtnEdit: {
    backgroundColor: colors.accent, // Dark blue matching screenshot Edit Employee
  },
  detailBtnDelete: {
    backgroundColor: colors.accent, // Dark blue matching screenshot Delete Employee
  },
  detailBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailCard: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: borderRadius.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailGridCol: {
    width: '48%',
    marginBottom: spacing.m,
  },
  adminActionsCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  adminActionsTitle: {
    color: colors.danger,
  },
  adminActionsDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.m,
    lineHeight: 16,
  },
  resetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s,
    marginRight: spacing.s,
  },
  resetBtn: {
    backgroundColor: colors.accent,
    height: 40,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* --- Payroll Styles --- */
  payrollContainer: {
    flex: 1,
    padding: spacing.m,
  },
  payrollHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  payrollTabBtnGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payrollTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.s,
  },
  payrollTabBtnActive: {
    backgroundColor: colors.accent,
  },
  payrollTabBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  payrollTabBtnTextActive: {
    color: colors.background,
  },
  monthSelectorRow: {
    marginBottom: spacing.m,
  },
  monthInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 44,
  },
  monthInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  clearMonthText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  netSalaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  netSalaryCardLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  netSalaryCardValue: {
    fontSize: 28,
    fontWeight: 'black',
    color: colors.text,
    marginTop: 4,
  },
  payrollTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
  },
  tableColHeader: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  payrollTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxTouch: {
    padding: 4,
    marginRight: 6,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  customCheckboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  customCheckboxDisabled: {
    opacity: 0.3,
  },
  empNameText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  empCodeText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  tableCellText: {
    fontSize: 12,
    color: colors.text,
  },
  actionGenerateBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  actionGenerateBtnText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionSlipBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  actionSlipBtnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  /* Floating Bulk Bar */
  floatingBulkBar: {
    position: 'absolute',
    bottom: 20,
    left: spacing.m,
    right: spacing.m,
    backgroundColor: colors.text,
    borderRadius: borderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bulkBarTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bulkBarVal: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bulkPayBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.round,
  },
  bulkPayBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  /* Structures tab styles matching web dashboard */
  structuresLayout: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
  },
  structEmpListCard: {
    width: Platform.OS === 'web' ? 280 : '100%',
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  structEmpListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  structEmpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  structEmpItemActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.08)',
    borderRadius: borderRadius.s,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  structFormCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  structFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  formRow2Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formCol: {
    flex: 1,
    marginRight: spacing.s,
  },
  grossSummaryBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  grossSummaryLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  grossSummaryVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  structFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.m,
  },
  saveBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  selectEmpPromptBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.l,
    padding: spacing.xl,
  },
  selectEmpPromptText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  /* --- Attendance Styles --- */
  attendanceContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  attActionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  attCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  attCardSubTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.m,
  },
  clockDisplayBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  clockTimeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  clockDateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.l,
  },
  punchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.m,
  },
  punchInBtn: {
    backgroundColor: colors.success, // Emerald green matching screenshot
  },
  punchOutBtn: {
    backgroundColor: colors.danger, // Rose red
  },
  punchBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.round,
  },
  shiftCompletedText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 14,
  },
  punchInfoPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.s,
  },
  punchInfoPillLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  punchInfoPillVal: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  lateAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  lateAlertText: {
    color: colors.warning, // Warm amber
    fontSize: 13,
    fontWeight: '500',
  },
  monthlyHistoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  attTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginVertical: spacing.s,
  },
  attTableCol: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  attTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attTableCell: {
    fontSize: 12,
    color: colors.text,
  },
  attStatusPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  statusPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  attStatusPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusPresentText: {
    color: colors.success,
  },
  statusAbsentText: {
    color: colors.danger,
  },
  lateStatusTextBadge: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  noAttText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.l,
    fontSize: 13,
  },
  /* --- Leave Styles --- */
  leaveContainer: {
    flex: 1,
    padding: spacing.m,
  },
  leaveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  leaveActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamApprovalsBtn: {
    backgroundColor: colors.accent, // Dark blue matching screenshot Team Approvals button
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    marginRight: spacing.s,
  },
  teamApprovalsBtnActive: {
    backgroundColor: colors.accent,
  },
  teamApprovalsText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamApprovalsTextActive: {
    color: colors.background,
  },
  applyLeaveBtn: {
    backgroundColor: colors.accent, // Dark blue matching + Apply Leave button
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  applyLeaveBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveBalancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  balanceCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  balanceTypeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceCountVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  statusPendingPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusPendingText: {
    color: colors.warning,
  },
  halfDayCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  halfDayLabelText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: spacing.s,
    fontWeight: 'bold',
  },
  approveSmallBtn: {
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    marginRight: 4,
  },
  approveSmallText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  rejectSmallBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
  },
  rejectSmallText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* --- Holiday Styles --- */
  holidayContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  holidayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  addHolidayBtn: {
    backgroundColor: colors.accent, // Dark blue matching + Add Holiday button in screenshot
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  addHolidayBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addHolidayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  addHolidayCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  holidayGrid: {
    flexDirection: 'column',
  },
  holidayCardItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  holidayIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(214, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  holidayNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  holidayDateText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: spacing.s,
  },
  holidayTypeTag: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  holidayTypeTagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
  },
  holidayDescText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyHolidaysBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyHolidaysText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  /* --- Leads Styles --- */
  leadsContainer: {
    flex: 1,
    padding: spacing.m,
  },
  leadsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  addLeadBtn: {
    backgroundColor: colors.accent, // Dark blue matching screenshot + Add Lead button
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  addLeadBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  leadsFilterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  filterGroupLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.s,
  },
  filterBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallFilterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
    marginBottom: 4,
  },
  smallFilterPillActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.15)',
    borderColor: colors.accent,
  },
  smallFilterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  smallFilterTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  filterSubmitBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
  },
  filterSubmitText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stageBluePill: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  stageBlueText: {
    color: colors.info,
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewLeadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
  },
  viewLeadBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* --- Reports Styles --- */
  reportsContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  reportsControlCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  reportsInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    paddingHorizontal: spacing.s,
    height: 36,
    borderRadius: borderRadius.s,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
  },
  generateReportBtn: {
    backgroundColor: colors.accent, // Dark blue matching screenshot Generate button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.m,
    marginTop: spacing.s,
  },
  generateReportBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.m,
  },
  summaryBadgeCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.s,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryBadgeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  summaryBadgeVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  /* --- Master Settings Styles --- */
  settingsContainer: {
    flex: 1,
    padding: spacing.m,
  },
  settingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  saveSettingsBtn: {
    backgroundColor: colors.accent, // Dark blue matching screenshot Save Changes button
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.m,
  },
  saveSettingsBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsTabScroll: {
    marginBottom: spacing.m,
    maxHeight: 40,
  },
  settingsTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  settingsTabPillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: colors.accent,
  },
  settingsTabText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  settingsTabTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  formRow3Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  formCol3: {
    width: '31%',
  },
  templateCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  templateBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  templateBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  smsTemplateBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  smsTemplateBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* --- Access Control Styles --- */
  accessControlCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accessTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accessTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
  },
  roleEmployeeBadge: {
    backgroundColor: colors.surfaceLight,
  },
  roleEmployeeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleAdminBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  roleAdminText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleKeyAdminBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  roleKeyAdminText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionSelectCol: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  roleActionPill: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  roleActionPillText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  /* --- Notifications Engine Styles --- */
  notificationsContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  triggerBadgePill: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerBadgeText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
  },
  emptyNotificationText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
  /* --- Company Wallet Styles --- */
  walletContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  exportStatementBtn: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: borderRadius.m,
    marginRight: 6,
  },
  exportStatementText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  walletBalanceCard: {
    backgroundColor: colors.accent, // Dark black card matching user screenshot
    borderRadius: borderRadius.l,
    padding: spacing.xl,
    marginBottom: spacing.m,
    position: 'relative',
    overflow: 'hidden',
  },
  walletIconBackground: {
    position: 'absolute',
    right: -20,
    bottom: -30,
  },
  walletBalanceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.s,
  },
  walletBalanceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.background,
  },
  /* --- Module Access Checkbox Styles --- */
  moduleAccessSection: {
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moduleGridContainer: {
    marginTop: spacing.s,
  },
  moduleGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  empStatPill: {
    padding: spacing.s,
    borderRadius: borderRadius.m,
    alignItems: 'center',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  moduleCheckboxCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 13,
  },
  moduleCheckboxLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  /* --- Profile Screen Styles --- */
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  profileAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    overflow: 'hidden',
  },
  profileAvatarText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  changePhotoText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoTipText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  profileValText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  /* --- About Company Screen Styles --- */
  aboutScrollContent: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  aboutHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutHeaderLogo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 1.5,
  },
  aboutHeaderSubLogo: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    marginLeft: 6,
    letterSpacing: 1,
  },
  aboutHeaderLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(214, 175, 55, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  aboutHeaderLoginText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
  aboutHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
    marginBottom: spacing.m,
  },
  aboutHeroBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  aboutHeroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  aboutHeroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.m,
  },
  aboutHeroDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  aboutSectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  aboutServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  aboutServiceCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutServiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  aboutServiceDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  aboutContactCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.l,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutContactTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  aboutContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutContactText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  aboutCtaBtn: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
  },
  aboutCtaBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginBackToAboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
    alignSelf: 'flex-start',
  },
  loginBackToAboutText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
}));

const loginStyles = createDynamicStyleSheet(() => ({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderGold,
    position: 'relative',
  },
  logoTextNC: {
    color: colors.background,
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  logoArrow: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
  },
  eyeIconButton: {
    padding: 6,
    marginLeft: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmarkText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  signInBtn: {
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInBtnText: {
    textAlign: 'center',
  },
  footerLink: {
    color: colors.accent,
    fontWeight: 'bold',
  },
}));

const registerStyles = createDynamicStyleSheet(() => ({
  portalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.accent,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  portalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
  },
  submitBtn: {
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.accent,
    fontWeight: 'bold',
  },
}));













