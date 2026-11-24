import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Platform, ActionSheetIOS, RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera, KeyRound, LogOut, Mail, AtSign, Phone, CalendarDays, Building2, Briefcase, MapPin, BadgeCheck, Hash,
  IdCard, CreditCard, Landmark, Eye, EyeOff, Lock, ShieldCheck, Wallet, TrendingUp, User as UserIcon, ImagePlus,
} from 'lucide-react-native';
import { apiCall, getApiBaseUrl } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, Avatar, StatusPill, GOLD, BRAND_NAVY, inr } from '../../components/DashboardUI';
import { Group, GroupTitle, InfoRow, ListRow, FormField, PrimaryButton, BottomSheet } from '../settings/SettingsUI';

// ---------------------------------------------------------------------------
// My profile. Same endpoints as the previous screen:
//   GET  /api/auth/me                          -> { success, role, employee, investor }
//   POST /api/employees/upload (multipart file) -> { success, url }
//   PUT  /api/auth/me { profilePhotoUrl }
//   PUT  /api/auth/me/password { oldPassword, newPassword }
// ---------------------------------------------------------------------------

const mask = (v?: string, show = false) => {
  if (!v) return 'N/A';
  const s = String(v);
  if (show || s.length <= 4) return s;
  return `•••• ${s.slice(-4)}`;
};

const photoUri = (url: string) => (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`);

export const EmployeeProfileView = () => {
  const { c, isDark, accent } = useAppTheme();
  const authUser = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [investor, setInvestor] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res: any = await apiCall('/api/auth/me');
      if (res.success) {
        // apiCall puts the JSON body in res.data: { success, role, employee, investor }.
        const body = res.data || {};
        const emp = res.employee || body.employee || (body.firstName || body.employeeCode ? body : null);
        setEmployee(emp || null);
        setInvestor(body.investor || null);
        setRole(body.role || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      const upload = new FormData();
      upload.append('file', {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      const token = useAuthStore.getState().token;
      const uploadRes = await fetch(`${getApiBaseUrl()}/api/employees/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Cookie: `accessToken=${token}`, Authorization: `Bearer ${token}` } : {}),
        },
        body: upload,
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
    if (photoUploading) return;
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
          { text: 'Take Photo', onPress: () => pickAndUploadPhoto('camera') },
          { text: 'Choose from Gallery', onPress: () => pickAndUploadPhoto('gallery') },
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
        setPwOpen(false);
      } else {
        Alert.alert('Error', res.error || 'Failed to update password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error updating password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again to use the app.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => useAuthStore.getState().clearAuth() },
    ]);
  };

  // ---------------- Derived ----------------

  const e = employee || {};
  const fullName =
    `${e.firstName || ''} ${e.lastName || ''}`.trim() || investor?.fullName || authUser?.name || authUser?.email || 'My Profile';
  const code = e.employeeCode || investor?.investorCode || '';
  const displayRole = role || authUser?.role || '';
  const headline = [e.designation, e.department].filter(Boolean).join(' · ') || (investor ? 'Investor' : '');
  const photo = e.profilePhotoUrl ? photoUri(String(e.profilePhotoUrl)) : '';
  const status = e.status || (employee ? 'Active' : investor?.status || '');
  const statusTone = (status === 'Active' || status === 'Verified' ? 'success' : status === 'Rejected' || status === 'Inactive' ? 'danger' : 'warning') as 'success' | 'danger' | 'warning';
  const pwMismatch = !!formData.confirmPassword && formData.newPassword !== formData.confirmPassword;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={{ color: c.textMuted, fontSize: 14 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile(true)} tintColor={accent} colors={[accent]} />}
      >
        {/* Header card */}
        <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden', alignItems: 'center' }}>
          <View style={{ position: 'absolute', width: 240, height: 240, borderRadius: 120, right: -90, top: -110, borderWidth: 28, borderColor: 'rgba(214,175,55,0.10)' }} />
          <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, left: -50, bottom: -40, borderWidth: 16, borderColor: 'rgba(59,130,246,0.12)' }} />

          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8} accessibilityLabel="Change profile photo" disabled={photoUploading}>
            <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: 90, height: 90, borderRadius: 45 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar name={fullName} size={90} />
                </View>
              )}
              {photoUploading ? (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : null}
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD, borderWidth: 2, borderColor: BRAND_NAVY, alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} color={BRAND_NAVY} />
            </View>
          </TouchableOpacity>

          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 14, textAlign: 'center' }} numberOfLines={2}>{fullName}</Text>
          {headline ? <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, textAlign: 'center' }}>{headline}</Text> : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }}>
            {code ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(214,175,55,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Hash size={12} color={GOLD} />
                <Text style={{ color: GOLD, fontSize: 12, fontWeight: '800' }}>{code}</Text>
              </View>
            ) : null}
            {displayRole ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <ShieldCheck size={12} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{displayRole}</Text>
              </View>
            ) : null}
            {status ? <StatusPill label={status} tone={statusTone} /> : null}
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          {[
            { label: photoUploading ? 'Uploading...' : 'Change photo', icon: ImagePlus, tint: '#3B82F6', onPress: handleChangePhoto },
            { label: 'Password', icon: KeyRound, tint: isDark ? GOLD : c.accent, onPress: () => setPwOpen(true) },
            { label: 'Log out', icon: LogOut, tint: c.danger, onPress: handleLogout },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={a.onPress}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingVertical: 14 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: a.tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <a.icon size={19} color={a.tint} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: c.text }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'center', marginTop: 8 }}>Profile photo: only JPG, PNG files are allowed.</Text>

        {employee ? (
          <>
            <GroupTitle c={c} title="Contact" />
            <Group c={c}>
              <InfoRow c={c} isDark={isDark} icon={Mail} label="Personal email" value={e.email || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={AtSign} label="Office email" value={e.officeEmail || e.email || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Phone} label="Phone number" value={e.phone || 'N/A'} />
            </Group>

            <GroupTitle c={c} title="Employment" />
            <Group c={c}>
              <InfoRow c={c} isDark={isDark} icon={Hash} label="Employee code" value={e.employeeCode || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Building2} label="Department" value={e.department || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Briefcase} label="Designation" value={e.designation || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={MapPin} label="Work location" value={e.workLocation || 'Headquarters'} />
              <InfoRow c={c} isDark={isDark} icon={BadgeCheck} label="Status / type" value={`${e.status || 'Active'} (${e.employeeType || 'Full-Time'})`} />
              <InfoRow c={c} isDark={isDark} icon={CalendarDays} label="Date of birth" value={e.dateOfBirth ? new Date(e.dateOfBirth).toLocaleDateString() : 'N/A'} />
            </Group>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <GroupTitle c={c} title="KYC & bank details" />
              <TouchableOpacity
                onPress={() => setShowSensitive((v) => !v)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 22, marginBottom: 8, marginRight: 4 }}
                accessibilityLabel={showSensitive ? 'Hide KYC numbers' : 'Show KYC numbers'}
              >
                {showSensitive ? <EyeOff size={14} color={accent} /> : <Eye size={14} color={accent} />}
                <Text style={{ fontSize: 12, fontWeight: '700', color: accent }}>{showSensitive ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <Group c={c}>
              <InfoRow c={c} isDark={isDark} icon={IdCard} label="Aadhar number" value={mask(e.kyc?.aadharNumber, showSensitive)} />
              <InfoRow c={c} isDark={isDark} icon={CreditCard} label="PAN number" value={mask(e.kyc?.panNumber, showSensitive)} />
              <InfoRow c={c} isDark={isDark} icon={Landmark} label="Bank name" value={e.bankDetails?.bankName || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Wallet} label="Account number" value={mask(e.bankDetails?.accountNumber, showSensitive)} />
            </Group>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 8, marginLeft: 4 }}>
              Your personal and official details are read-only. Contact HR to update them.
            </Text>
          </>
        ) : null}

        {investor ? (
          <>
            <GroupTitle c={c} title="Investment" />
            <Group c={c}>
              <InfoRow c={c} isDark={isDark} icon={Hash} label="Investor code" value={investor.investorCode || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Mail} label="Email" value={investor.email || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Phone} label="Phone" value={investor.phone || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Wallet} label="Investment amount" value={inr(investor.investmentAmount)} />
              <InfoRow c={c} isDark={isDark} icon={TrendingUp} label="Monthly growth" value={`${investor.monthlyGrowthPercentage ?? 2.5}% / mo`} />
              {investor.kycDocs?.accountNumber ? (
                <InfoRow c={c} isDark={isDark} icon={Landmark} label={investor.kycDocs.bankName || 'Bank account'} value={mask(investor.kycDocs.accountNumber, showSensitive)} />
              ) : null}
            </Group>
          </>
        ) : null}

        {!employee && !investor ? (
          <>
            <GroupTitle c={c} title="Account" />
            <Group c={c}>
              <InfoRow c={c} isDark={isDark} icon={UserIcon} label="Name" value={authUser?.name || 'N/A'} />
              <InfoRow c={c} isDark={isDark} icon={Mail} label="Email" value={authUser?.email || 'N/A'} />
            </Group>
          </>
        ) : null}

        <GroupTitle c={c} title="Security" />
        <Group c={c}>
          <ListRow c={c} isDark={isDark} icon={KeyRound} tint={isDark ? GOLD : c.accent} title="Change password" subtitle="Update your password regularly" onPress={() => setPwOpen(true)} />
          <ListRow c={c} isDark={isDark} icon={Camera} tint="#3B82F6" title="Change profile photo" subtitle={photoUploading ? 'Uploading...' : 'Take a photo or choose from gallery'} onPress={handleChangePhoto} disabled={photoUploading} />
          <ListRow c={c} isDark={isDark} icon={LogOut} danger title="Log out" onPress={handleLogout} chevron={false} />
        </Group>
      </ScrollView>

      <BottomSheet
        c={c}
        visible={pwOpen}
        title="Change Password"
        subtitle="Secure your account by updating your password regularly."
        onClose={() => setPwOpen(false)}
        footer={<PrimaryButton label="Update Password" icon={Lock} accent={accent} loading={pwLoading} onPress={handleChangePassword} />}
      >
        <FormField c={c} isDark={isDark} label="Current Password" icon={Lock} placeholder="Enter current password" secure autoCapitalize="none"
          value={formData.oldPassword} onChangeText={(val) => setFormData({ ...formData, oldPassword: val })} />
        <FormField c={c} isDark={isDark} label="New Password" icon={KeyRound} placeholder="Enter new password" secure autoCapitalize="none"
          value={formData.newPassword} onChangeText={(val) => setFormData({ ...formData, newPassword: val })} />
        <FormField c={c} isDark={isDark} label="Confirm New Password" icon={KeyRound} placeholder="Confirm new password" secure autoCapitalize="none"
          value={formData.confirmPassword} onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
          hint={pwMismatch ? 'Passwords do not match.' : undefined} />
      </BottomSheet>
    </View>
  );
};
