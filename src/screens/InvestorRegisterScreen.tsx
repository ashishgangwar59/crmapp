import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { User as UserIcon, Mail, Phone, KeyRound, ShieldCheck, Eye, EyeOff, ArrowRight, BadgeCheck, FileCheck, Wallet } from 'lucide-react-native';
import { apiCall } from '../services/api';
import { useAuthStore } from '../services/authStore';
import {
  useAuthTheme,
  AuthHeader,
  AuthSheet,
  AuthField,
  AuthPrimaryButton,
  AuthInlineButton,
  AuthError,
  DebugOtp,
  GOLD,
  Palette,
} from '../components/AuthUI';

function SectionLabel({ c, n, text }: { c: Palette; n: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: n === 1 ? 0 : 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: c.border }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: c.text }}>{n}</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted }}>{text}</Text>
    </View>
  );
}

export const InvestorRegisterScreen = ({ navigation }: any) => {
  const { c, isDark, toggle } = useAuthTheme();
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
          const { user, token, accessToken } = loginRes.data;
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

  const accent = isDark ? GOLD : c.accent;
  const perks = [
    { icon: BadgeCheck, text: 'Digital KYC' },
    { icon: FileCheck, text: 'e-Bond agreement' },
    { icon: Wallet, text: 'Track returns' },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader
          title="Create account"
          subtitle="Open your investor account to complete KYC and sign your bond agreement"
          backLabel="Sign in"
          onBack={() => navigation.navigate('Login')}
          isDark={isDark}
          onToggleTheme={toggle}
        />

        <AuthSheet c={c}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22 }}>
            {perks.map((p) => (
              <View
                key={p.text}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
                  backgroundColor: c.surfaceLight,
                }}
              >
                <p.icon size={18} color={accent} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: c.text, marginTop: 4, textAlign: 'center' }}>{p.text}</Text>
              </View>
            ))}
          </View>

          <AuthError message={errorMsg} />

          <SectionLabel c={c} n={1} text="YOUR DETAILS" />
          <AuthField
            c={c}
            isDark={isDark}
            label="Full name"
            icon={UserIcon}
            placeholder="As per PAN card"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />
          <AuthField
            c={c}
            isDark={isDark}
            label="Email address"
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <SectionLabel c={c} n={2} text="VERIFY MOBILE" />
          <AuthField
            c={c}
            isDark={isDark}
            label="Mobile number"
            icon={Phone}
            placeholder="9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            right={<AuthInlineButton isDark={isDark} label={otpSent ? 'Resend' : 'Send OTP'} onPress={handleSendOtp} disabled={loading || !phone || !email} />}
          />
          <DebugOtp c={c} code={debugOtp} />
          {otpSent ? (
            <AuthField
              c={c}
              isDark={isDark}
              label="Verification OTP"
              icon={ShieldCheck}
              placeholder="••••••"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
            />
          ) : (
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: -8, marginBottom: 16 }}>
              Enter your email and mobile, then tap Send OTP.
            </Text>
          )}

          <SectionLabel c={c} n={3} text="SECURE YOUR ACCOUNT" />
          <AuthField
            c={c}
            isDark={isDark}
            label="Password"
            icon={KeyRound}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            right={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} color={c.textMuted} /> : <Eye size={18} color={c.textMuted} />}
              </TouchableOpacity>
            }
          />
          <AuthField
            c={c}
            isDark={isDark}
            label="Confirm password"
            icon={KeyRound}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <View style={{ height: 6 }} />
          <AuthPrimaryButton
            c={c}
            label="Create account"
            icon={ArrowRight}
            loading={loading}
            disabled={!otpSent}
            onPress={handleRegister}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: c.textMuted }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: accent }}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </AuthSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
