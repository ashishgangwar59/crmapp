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
import { Lock, RadioTower, Mail, KeyRound, Phone, Eye, EyeOff, Check, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { apiCall } from '../services/api';
import { useAuthStore } from '../services/authStore';
import {
  useAuthTheme,
  AuthHeader,
  AuthSheet,
  AuthField,
  AuthSegment,
  AuthPrimaryButton,
  AuthInlineButton,
  AuthError,
  DebugOtp,
  GOLD,
} from '../components/AuthUI';

export const LoginScreen = ({ navigation }: any) => {
  const { c, isDark, toggle } = useAuthTheme();
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

  const accent = isDark ? GOLD : c.accent;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to your Niventra Capital investor portal"
          backLabel="Home"
          onBack={() => navigation.navigate('AboutCompany')}
          isDark={isDark}
          onToggleTheme={toggle}
        />

        <AuthSheet c={c}>
          <AuthSegment
            c={c}
            isDark={isDark}
            value={loginMethod}
            onChange={(v) => { setLoginMethod(v); setErrorMsg(''); }}
            options={[
              { value: 'password', label: 'Password', icon: Lock },
              { value: 'otp', label: 'Mobile OTP', icon: RadioTower },
            ]}
          />

          <AuthError message={errorMsg} />

          {loginMethod === 'password' ? (
            <>
              <AuthField
                c={c}
                isDark={isDark}
                label="Email address"
                icon={Mail}
                placeholder="name@company.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              <AuthField
                c={c}
                isDark={isDark}
                label="Password"
                icon={KeyRound}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                labelRight={
                  <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Please contact admin to reset your password.')}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: accent }}>Forgot password?</Text>
                  </TouchableOpacity>
                }
                right={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} color={c.textMuted} /> : <Eye size={18} color={c.textMuted} />}
                  </TouchableOpacity>
                }
              />
            </>
          ) : (
            <>
              <AuthField
                c={c}
                isDark={isDark}
                label="Registered mobile number"
                icon={Phone}
                placeholder="9876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                right={<AuthInlineButton isDark={isDark} label={otpSent ? 'Resend' : 'Send OTP'} onPress={handleSendOtp} disabled={loading || !phone} />}
              />
              <DebugOtp c={c} code={debugOtp} />
              {otpSent ? (
                <AuthField
                  c={c}
                  isDark={isDark}
                  label="6-digit OTP"
                  icon={ShieldCheck}
                  placeholder="••••••"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
              ) : null}
            </>
          )}

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22, marginTop: 2 }}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 22, height: 22, borderRadius: 7, marginRight: 10, alignItems: 'center', justifyContent: 'center',
                backgroundColor: rememberMe ? c.accent : 'transparent', borderWidth: 1.5, borderColor: rememberMe ? c.accent : c.textMuted,
              }}
            >
              {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
            </View>
            <Text style={{ fontSize: 14, color: c.text }}>Keep me signed in for 7 days</Text>
          </TouchableOpacity>

          <AuthPrimaryButton
            c={c}
            label="Sign in"
            icon={ArrowRight}
            loading={loading}
            disabled={loginMethod === 'otp' && !otpSent}
            onPress={handleLogin}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
            <Text style={{ marginHorizontal: 12, fontSize: 12, color: c.textMuted }}>New to Niventra?</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('InvestorRegister')}
            activeOpacity={0.8}
            style={{
              minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: isDark ? 'rgba(214,175,55,0.5)' : c.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: accent }}>Create investor account</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28 }}>
            <ShieldCheck size={14} color={c.success} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>Secured with encrypted sign-in</Text>
          </View>
        </AuthSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
