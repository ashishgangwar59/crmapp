import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Users,
  MapPin,
  Building2,
  Smartphone,
  Mail,
  BadgeCheck,
  Briefcase,
  IndianRupee,
  Landmark,
  Hash,
  CreditCard,
  Camera,
  ImagePlus,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  RotateCcw,
  FileText,
  CircleCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, Card, GOLD, BRAND_NAVY, inr } from '../../components/DashboardUI';
import { DateField } from '../investors/InvestorListUI';
import {
  FormField,
  FieldRow,
  CheckRow,
  StepProgress,
  PrimaryButton,
  SecondaryButton,
  SignaturePad,
  GroupLabel,
  onAccent,
} from './formUI';

// Indian system: Crore / Lakh / Thousand
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numWords(num: number, isCurrency: boolean): string {
  if (num === 0) return isCurrency ? 'Rupees Zero Only' : 'Zero';
  if (isNaN(num) || num < 0) return '';
  const helper = (n: number) => {
    if (n === 0) return '';
    let temp = '';
    if (n >= 100) { temp += ONES[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20) { temp += TENS[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) temp += ONES[n] + ' ';
    return temp.trim();
  };
  let str = '';
  let n = Math.floor(num);
  if (n >= 10000000) { str += helper(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
  if (n >= 100000) { str += helper(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
  if (n >= 1000) { str += helper(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n > 0) str += helper(n);
  const result = str.trim();
  return isCurrency ? 'Rupees ' + result + ' Only' : result;
}

const STEPS = ['Investor Details', 'Investment & Bank', 'Declaration & Sign', 'Review & Docs'];

const PAYMENT_MODES = [
  { value: 'NEFT/RTGS', label: 'NEFT / RTGS' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'DD', label: 'Demand Draft' },
  { value: 'Other', label: 'Other Mode' },
];

const DOCS = [
  { key: 'docPan', label: 'PAN Card copy' },
  { key: 'docAddress', label: 'Address proof (Aadhaar / Passport / Voter ID)' },
  { key: 'docIdentity', label: 'Identity proof (Aadhaar / Passport)' },
  { key: 'docPhoto', label: 'Passport size photograph' },
  { key: 'docCheque', label: 'Cancelled cheque / Bank passbook proof' },
] as const;

const DECLARATIONS = [
  'I/We have read, understood and agree to the terms and conditions of the Information Memorandum and Debenture Trust Deed.',
  'The information provided by me/us in this application is accurate, true, and complete to the best of my knowledge.',
  'I/We agree to be bound by all statutory guidelines governing the issue of Secured Redeemable Debentures.',
  'I/We authorize the Company to verify any or all of the above information with appropriate authorities.',
];

const newAppNo = () => `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

export const DebentureFormView = () => {
  const insets = useSafeAreaInsets();
  const { c, isDark, accent } = useAppTheme();
  const user = useAuthStore((state) => state.user);

  const prefillName = (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : '';
  const prefillEmail = user?.email || '';
  const prefillPhone = (user as any)?.phone || '';
  const prefillEmpCode = (user as any)?.employeeCode || (user as any)?.employeeId || user?.email || '';

  const initialForm = () => ({
    // header
    applicationNo: newAppNo(),
    applicationDate: '',
    // 1. investor details
    fullName: prefillName,
    parentSpouseName: '',
    dob: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    mobile: prefillPhone,
    email: prefillEmail,
    referralEmployeeCode: prefillEmpCode,
    occupation: '',
    // 2. investment
    typeSecured: true,
    typeNonConvertible: false,
    typeRedeemable: false,
    faceValue: '100000',
    numDebenturesFigures: '1',
    paymentMode: 'NEFT/RTGS',
    paymentModeOther: '',
    bankName: '',
    utrNo: '',
    chequeDdNo: '',
    chequeDate: '',
    drawnOnBank: '',
    // 3. declaration
    place: '',
    declDate: '',
    // 4. documents
    docPan: false,
    docAddress: false,
    docIdentity: false,
    docPhoto: false,
    docCheque: false,
    docOther: false,
    docOtherText: '',
    // office use
    officeReceivedOn: '',
    officeReceivedBy: '',
    officeAmountReceived: '',
    officePaymentMode: '',
    officeRemark: '',
    officeStatus: '',
    officeAllottedNo: '',
    verifiedName: '',
    verifiedDesignation: '',
    verifiedSignDate: '',
    approvedName: '',
    approvedDesignation: '',
    approvedSignDate: '',
  });

  const [f, setF] = useState(initialForm);
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [showOffice, setShowOffice] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ appNo: string | null } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const set = <K extends keyof ReturnType<typeof initialForm>>(k: K, v: ReturnType<typeof initialForm>[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const fieldProps = { c, accent };

  // Auto-calculated amounts
  const calc = useMemo(() => {
    const fv = parseFloat(f.faceValue) || 0;
    const nd = parseFloat(f.numDebenturesFigures) || 0;
    const total = fv * nd;
    return {
      total,
      numDebenturesWords: numWords(nd, false),
      totalApplicationAmountWords: numWords(total, true),
    };
  }, [f.faceValue, f.numDebenturesFigures]);

  const goStep = (i: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const pickPhoto = async (source: 'camera' | 'gallery') => {
    try {
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
        setPhoto(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
      }
    } catch (_) {}
  };

  const resetForm = () => {
    setF(initialForm());
    setPhoto(null);
    setSignature([]);
    setShowOffice(false);
    goStep(0);
  };

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      resetForm();
      return;
    }
    Alert.alert('Reset Form?', 'All entered details in this application will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetForm },
    ]);
  };

  const handleSubmit = async () => {
    if (!f.fullName || !f.mobile || !f.email) {
      Alert.alert('Validation Error', 'Please enter Applicant Full Name, Mobile, and Email.');
      goStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await apiCall('/api/debenture-application', {
        method: 'POST',
        body: JSON.stringify({
          fullName: f.fullName,
          fatherSpouseName: f.parentSpouseName,
          dob: f.dob,
          phone: f.mobile,
          email: f.email,
          address: f.address,
          city: f.city,
          state: f.state,
          pinCode: f.pin,
          occupation: f.occupation,
          panNumber: f.pan,
          typeOfDebenture:
            [f.typeSecured && 'Secured', f.typeNonConvertible && 'Non-Convertible', f.typeRedeemable && 'Redeemable']
              .filter(Boolean)
              .join(', ') || 'Secured',
          faceValue: Number(f.faceValue) || 100000,
          noOfDebentures: Number(f.numDebenturesFigures) || 1,
          numDebenturesWords: calc.numDebenturesWords || '',
          totalApplicationAmountWords: calc.totalApplicationAmountWords || '',
          investmentAmount: (Number(f.numDebenturesFigures) || 1) * (Number(f.faceValue) || 100000),
          modeOfPayment: f.paymentMode || 'NEFT/RTGS',
          transactionUtrNo: f.utrNo,
          drawnOnBank: f.drawnOnBank,
          bankName: f.bankName,
          referralEmployeeCode: f.referralEmployeeCode || prefillEmpCode || '',
        }),
      });
      if (res && (res.success || res.data || res.applicationNo)) {
        const appNo: string | null =
          res.data?.data?.applicationNo ||
          res.applicationNo ||
          res.data?.applicationNo ||
          res.data?.debentureForm?.applicationNo ||
          null;
        setSubmitted({ appNo });
        Alert.alert(
          'Application Submitted!',
          appNo
            ? `Secured Debenture Application registered under App No: ${appNo}`
            : 'Debenture Application submitted successfully.'
        );
      } else {
        Alert.alert('Submission Error', res?.error || 'Failed to submit debenture application.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Success Screen ----------------
  if (submitted) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40, justifyContent: 'center' }}
      >
        <Card c={c} style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, borderRadius: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: c.success + '1F',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <ShieldCheck size={42} color={c.success} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center', letterSpacing: 0.2 }}>
            Application Submitted!
          </Text>
          <Text style={{ fontSize: 14, color: c.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 21 }}>
            {submitted.appNo
              ? 'Your Secured Debenture Application has been successfully registered under Application No:'
              : 'Your application has been received. Our advisory team will review and contact you shortly.'}
          </Text>
          {submitted.appNo ? (
            <View
              style={{
                backgroundColor: c.surfaceLight,
                paddingHorizontal: 22,
                paddingVertical: 14,
                borderRadius: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '900', color: accent, letterSpacing: 1.5 }}>
                {submitted.appNo}
              </Text>
            </View>
          ) : null}
          <PrimaryButton
            accent={accent}
            label="Submit Another Application"
            icon={RotateCcw}
            onPress={() => {
              resetForm();
              setSubmitted(null);
            }}
            style={{ alignSelf: 'stretch' }}
          />
        </Card>
      </ScrollView>
    );
  }

  // ---------------- Step Renderers ----------------
  const renderInvestor = () => (
    <>
      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>APPLICATION IDENTIFIER</GroupLabel>
        <FormField
          {...fieldProps}
          label="Application No."
          icon={Hash}
          value={f.applicationNo}
          onChangeText={(v) => set('applicationNo', v)}
          autoCapitalize="characters"
        />
        <DateField c={c} label="Application Date" value={f.applicationDate} onChange={(v) => set('applicationDate', v)} />
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>APPLICANT PARTICULARS</GroupLabel>
        <FormField
          {...fieldProps}
          label="Full Name of Applicant"
          required
          icon={User}
          value={f.fullName}
          onChangeText={(v) => set('fullName', v)}
          placeholder="As indicated on official PAN card"
        />
        <FormField
          {...fieldProps}
          label="Father's / Spouse's Name"
          icon={Users}
          value={f.parentSpouseName}
          onChangeText={(v) => set('parentSpouseName', v)}
          placeholder="Full name of father or spouse"
        />
        <View style={{ marginBottom: 14 }}>
          <DateField c={c} label="Date of Birth / Incorporation" value={f.dob} onChange={(v) => set('dob', v)} />
        </View>
        <FormField
          {...fieldProps}
          label="Permanent Account Number (PAN)"
          icon={CreditCard}
          value={f.pan}
          placeholder="ABCDE1234F"
          maxLength={10}
          autoCapitalize="characters"
          onChangeText={(v) => set('pan', v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
          hint={f.pan ? `${f.pan.length}/10 characters entered` : 'Mandatory for debenture registration'}
        />
        <FormField
          {...fieldProps}
          label="Occupation / Business Nature"
          icon={Briefcase}
          value={f.occupation}
          onChangeText={(v) => set('occupation', v)}
          placeholder="e.g. Salaried / Business / Professional"
        />
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>CONTACT & REFERRAL</GroupLabel>
        <FormField
          {...fieldProps}
          label="Mobile Number"
          required
          icon={Smartphone}
          value={f.mobile}
          onChangeText={(v) => set('mobile', v.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="10-digit mobile number"
        />
        <FormField
          {...fieldProps}
          label="Email Address"
          required
          icon={Mail}
          value={f.email}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="investor@example.com"
        />
        <FormField
          {...fieldProps}
          label="Employee Referral Code"
          icon={BadgeCheck}
          value={f.referralEmployeeCode}
          onChangeText={(v) => set('referralEmployeeCode', v)}
          autoCapitalize="none"
          placeholder="Optional advisor code"
        />
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>RESIDENTIAL ADDRESS</GroupLabel>
        <FormField
          {...fieldProps}
          label="Street Address"
          icon={MapPin}
          value={f.address}
          onChangeText={(v) => set('address', v)}
          multiline
          placeholder="Flat / House No., Building, Street"
        />
        <FieldRow>
          <FormField
            {...fieldProps}
            label="City"
            icon={Building2}
            value={f.city}
            onChangeText={(v) => set('city', v)}
            placeholder="City"
          />
          <FormField
            {...fieldProps}
            label="State"
            value={f.state}
            onChangeText={(v) => set('state', v)}
            placeholder="State"
          />
        </FieldRow>
        <FormField
          {...fieldProps}
          label="PIN Code"
          value={f.pin}
          onChangeText={(v) => set('pin', v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="6-digit postal code"
          style={{ marginBottom: 0 }}
        />
      </Card>
    </>
  );

  const renderInvestment = () => (
    <>
      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>DEBENTURE CLASSIFICATION</GroupLabel>
        <CheckRow
          {...fieldProps}
          label="Secured Debentures"
          checked={f.typeSecured}
          onPress={() => set('typeSecured', !f.typeSecured)}
        />
        <CheckRow
          {...fieldProps}
          label="Non-Convertible (NCD)"
          checked={f.typeNonConvertible}
          onPress={() => set('typeNonConvertible', !f.typeNonConvertible)}
        />
        <CheckRow
          {...fieldProps}
          label="Redeemable"
          checked={f.typeRedeemable}
          onPress={() => set('typeRedeemable', !f.typeRedeemable)}
        />
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>INVESTMENT QUANTUM</GroupLabel>
        <FieldRow>
          <FormField
            {...fieldProps}
            label="Face Value (₹ each)"
            icon={IndianRupee}
            value={f.faceValue}
            onChangeText={(v) => set('faceValue', v.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
          />
          <FormField
            {...fieldProps}
            label="No. of Debentures"
            icon={Hash}
            value={f.numDebenturesFigures}
            onChangeText={(v) => set('numDebenturesFigures', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
        </FieldRow>
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: -4, marginBottom: 14, fontWeight: '500' }}>
          Debentures in words: <Text style={{ color: c.text, fontWeight: '700' }}>{calc.numDebenturesWords || '—'}</Text>
        </Text>

        {/* STANDOUT EXECUTIVE TOTAL CARD */}
        <View
          style={{
            backgroundColor: BRAND_NAVY,
            borderRadius: 18,
            padding: 18,
            borderWidth: 1,
            borderColor: 'rgba(214,175,55,0.25)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
              TOTAL APPLICATION AMOUNT
            </Text>
            <ShieldCheck size={18} color={GOLD} />
          </View>
          <Text
            style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 6, letterSpacing: 0.5 }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {calc.total ? inr(calc.total) : '₹0'}
          </Text>
          <Text style={{ color: GOLD, fontSize: 13, fontWeight: '700', marginTop: 5, lineHeight: 18 }}>
            {calc.totalApplicationAmountWords || 'Rupees Zero Only'}
          </Text>
        </View>
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>PAYMENT & REMITTANCE</GroupLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {PAYMENT_MODES.map((m) => {
            const active = f.paymentMode === m.value;
            return (
              <TouchableOpacity
                key={m.value}
                onPress={() => set('paymentMode', m.value)}
                activeOpacity={0.75}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: active ? accent : c.surfaceLight,
                  borderWidth: 1.5,
                  borderColor: active ? accent : c.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? '800' : '600',
                    color: active ? onAccent(accent) : c.text,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {f.paymentMode === 'Other' ? (
          <FormField
            {...fieldProps}
            label="Specify Payment Mode"
            value={f.paymentModeOther}
            onChangeText={(v) => set('paymentModeOther', v)}
            placeholder="e.g. UPI, Direct Wire"
          />
        ) : null}
        <FormField
          {...fieldProps}
          label="Bank Name"
          icon={Landmark}
          value={f.bankName}
          onChangeText={(v) => set('bankName', v)}
          placeholder="Investor's Remitting Bank"
        />
        <FormField
          {...fieldProps}
          label="Transaction / UTR Reference No."
          icon={Hash}
          value={f.utrNo}
          onChangeText={(v) => set('utrNo', v)}
          autoCapitalize="characters"
          placeholder="16 or 22-character UTR"
        />
        <FieldRow>
          <FormField
            {...fieldProps}
            label="Cheque / DD No."
            value={f.chequeDdNo}
            onChangeText={(v) => set('chequeDdNo', v)}
            placeholder="Cheque No."
          />
          <View style={{ marginBottom: 14 }}>
            <DateField c={c} label="Cheque Date" value={f.chequeDate} onChange={(v) => set('chequeDate', v)} />
          </View>
        </FieldRow>
        <FormField
          {...fieldProps}
          label="Drawn on Branch (Bank)"
          icon={Landmark}
          value={f.drawnOnBank}
          onChangeText={(v) => set('drawnOnBank', v)}
          placeholder="Bank branch location"
          style={{ marginBottom: 0 }}
        />
      </Card>
    </>
  );

  const renderDeclaration = () => (
    <>
      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>DECLARATIONS & LEGAL CONSENT</GroupLabel>
        {DECLARATIONS.map((d, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 12,
              padding: 12,
              borderRadius: 14,
              backgroundColor: c.surfaceLight,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: accent + '22',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: accent }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, color: c.text, lineHeight: 19, fontWeight: '500' }}>{d}</Text>
          </View>
        ))}
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>APPLICANT PHOTOGRAPH</GroupLabel>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View
            style={{
              width: 100,
              height: 120,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: c.surfaceLight,
              borderWidth: 2,
              borderStyle: photo ? 'solid' : 'dashed',
              borderColor: photo ? c.success : c.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <User size={38} color={c.textMuted} />
            )}
          </View>
          <View style={{ flex: 1, gap: 10 }}>
            <TouchableOpacity
              onPress={() => pickPhoto('camera')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: accent,
              }}
            >
              <Camera size={18} color={onAccent(accent)} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: onAccent(accent) }}>Take Live Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickPhoto('gallery')}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: c.surfaceLight,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <ImagePlus size={18} color={c.text} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Upload from Gallery</Text>
            </TouchableOpacity>
            {photo ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <CircleCheck size={16} color={c.success} />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: c.success }}>Photograph captured</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

      <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
        <GroupLabel c={c}>SIGNATURE & EXECUTION</GroupLabel>
        <FieldRow>
          <FormField
            {...fieldProps}
            label="Place of Execution"
            icon={MapPin}
            value={f.place}
            onChangeText={(v) => set('place', v)}
            placeholder="City / Location"
          />
          <View style={{ marginBottom: 14 }}>
            <DateField c={c} label="Execution Date" value={f.declDate} onChange={(v) => set('declDate', v)} />
          </View>
        </FieldRow>
        <SignaturePad
          c={c}
          isDark={isDark}
          paths={signature}
          onChange={setSignature}
          onDrawingChange={setScrollLocked}
        />
      </Card>
    </>
  );

  const renderDocuments = () => {
    const summaryRow = (label: string, value: string, isTotal?: boolean) => (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        <Text style={{ fontSize: 13, color: isTotal ? c.text : c.textMuted, fontWeight: isTotal ? '700' : '500' }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: isTotal ? 16 : 13.5,
            fontWeight: '800',
            color: isTotal ? accent : c.text,
            maxWidth: '62%',
            textAlign: 'right',
          }}
          numberOfLines={1}
        >
          {value || '—'}
        </Text>
      </View>
    );

    return (
      <>
        <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
          <GroupLabel c={c}>ENCLOSED DOCUMENTS (SELF-ATTESTED)</GroupLabel>
          <Text style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 10 }}>
            Tick all documents that are attached alongside this debenture application:
          </Text>
          {DOCS.map((d) => (
            <CheckRow
              key={d.key}
              {...fieldProps}
              label={d.label}
              checked={!!f[d.key]}
              onPress={() => set(d.key, !f[d.key])}
            />
          ))}
          <CheckRow
            {...fieldProps}
            label="Other Supporting Document"
            checked={f.docOther}
            onPress={() => set('docOther', !f.docOther)}
          />
          {f.docOther ? (
            <FormField
              {...fieldProps}
              label="Document Description"
              value={f.docOtherText}
              onChangeText={(v) => set('docOtherText', v)}
              placeholder="e.g. Board Resolution, Power of Attorney"
              style={{ marginBottom: 0, marginTop: 4 }}
            />
          ) : null}
        </Card>

        {/* EXECUTIVE APPLICATION SUMMARY SHEET */}
        <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }}>
          <GroupLabel c={c}>APPLICATION SUMMARY REVIEW</GroupLabel>
          {summaryRow('Applicant Full Name', f.fullName)}
          {summaryRow('Mobile Number', f.mobile)}
          {summaryRow('Email Address', f.email)}
          {summaryRow('PAN Number', f.pan)}
          {summaryRow('Debentures Units', `${f.numDebenturesFigures || 0} units @ ${inr(f.faceValue)}`)}
          {summaryRow('Payment Mode', f.paymentMode === 'Other' && f.paymentModeOther ? `Other (${f.paymentModeOther})` : f.paymentMode)}
          {summaryRow('Total Investment', inr(calc.total), true)}
        </Card>

        {/* OFFICE USE SECTION (COLLAPSIBLE) */}
        <Card c={c} style={{ borderRadius: 20, marginBottom: 14 }} padded={false}>
          <TouchableOpacity
            onPress={() => setShowOffice((v) => !v)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: c.surfaceLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <FileText size={19} color={c.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '700', color: c.text }}>For Office Use Only</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                Verification, allotting and compliance sign-off
              </Text>
            </View>
            {showOffice ? <ChevronUp size={20} color={c.textMuted} /> : <ChevronDown size={20} color={c.textMuted} />}
          </TouchableOpacity>

          {showOffice ? (
            <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
              <View style={{ marginBottom: 14 }}>
                <DateField
                  c={c}
                  label="Application Received On"
                  value={f.officeReceivedOn}
                  onChange={(v) => set('officeReceivedOn', v)}
                />
              </View>
              <FormField
                {...fieldProps}
                label="Received By (Staff Name)"
                value={f.officeReceivedBy}
                onChangeText={(v) => set('officeReceivedBy', v)}
              />
              <FieldRow>
                <FormField
                  {...fieldProps}
                  label="Amount Received (₹)"
                  value={f.officeAmountReceived}
                  onChangeText={(v) => set('officeAmountReceived', v.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                />
                <FormField
                  {...fieldProps}
                  label="Payment Mode"
                  value={f.officePaymentMode}
                  onChangeText={(v) => set('officePaymentMode', v)}
                />
              </FieldRow>
              <FormField
                {...fieldProps}
                label="Office Remarks"
                value={f.officeRemark}
                onChangeText={(v) => set('officeRemark', v)}
              />
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, marginBottom: 8 }}>
                Application Status
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                {['Accepted', 'Rejected'].map((s) => (
                  <View key={s} style={{ flex: 1 }}>
                    <CheckRow
                      {...fieldProps}
                      radio
                      label={s}
                      checked={f.officeStatus === s}
                      onPress={() => set('officeStatus', s)}
                    />
                  </View>
                ))}
              </View>
              <FormField
                {...fieldProps}
                label="Allotted Debenture Serial No."
                value={f.officeAllottedNo}
                onChangeText={(v) => set('officeAllottedNo', v)}
              />

              <GroupLabel c={c}>VERIFICATION DESK</GroupLabel>
              <FieldRow>
                <FormField
                  {...fieldProps}
                  label="Verifier Name"
                  value={f.verifiedName}
                  onChangeText={(v) => set('verifiedName', v)}
                />
                <FormField
                  {...fieldProps}
                  label="Designation"
                  value={f.verifiedDesignation}
                  onChangeText={(v) => set('verifiedDesignation', v)}
                />
              </FieldRow>

              <GroupLabel c={c}>APPROVAL AUTHORITY</GroupLabel>
              <View
                style={{
                  backgroundColor: c.surfaceLight,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: c.textMuted }}>
                  NIVENTRA CAPITAL ADVISORY INDIA PVT LTD
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: c.text, marginTop: 4 }}>
                  Ram Mohan Sharma
                </Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Authorized Signatory</Text>
              </View>
            </View>
          ) : null}
        </Card>
      </>
    );
  };

  const isLast = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!scrollLocked}
        showsVerticalScrollIndicator={false}
      >
        {/* LUXURY FINTECH APP HEADER CARD */}
        <View
          style={{
            backgroundColor: BRAND_NAVY,
            borderRadius: 24,
            padding: 22,
            overflow: 'hidden',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* Decorative subtle concentric rings */}
          <View
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 120,
              right: -80,
              top: -90,
              borderWidth: 26,
              borderColor: 'rgba(214,175,55,0.12)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: 70,
              right: -30,
              top: -40,
              borderWidth: 16,
              borderColor: 'rgba(59,130,246,0.12)',
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD }} />
            <Text style={{ color: GOLD, fontSize: 11.5, fontWeight: '800', letterSpacing: 1.2 }}>
              NIVENTRA CAPITAL ADVISORY
            </Text>
          </View>

          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.2 }}>
            Debenture Application
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4, lineHeight: 19 }}>
            Secured, Rated, Redeemable Non-Convertible Debentures. Complete all steps to apply.
          </Text>

          {/* Quick info pills */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                {f.applicationNo || 'App ID'}
              </Text>
            </View>
            {calc.total ? (
              <View
                style={{
                  backgroundColor: GOLD,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: BRAND_NAVY, fontSize: 12, fontWeight: '900' }}>
                  Total: {inr(calc.total)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* STEP PROGRESS TRACKER */}
        <Card c={c} style={{ borderRadius: 20, marginBottom: 16 }}>
          <StepProgress c={c} accent={accent} steps={STEPS} current={step} onStep={goStep} />
        </Card>

        {step === 0 && (
          <View
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: accent + '10',
              borderWidth: 1,
              borderColor: accent + '22',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 12.5, color: c.text, lineHeight: 18, fontWeight: '500' }}>
              Please provide the official details of the primary applicant. Ensure names and numbers match your KYC documentation.
            </Text>
          </View>
        )}

        {step === 0 && renderInvestor()}
        {step === 1 && renderInvestment()}
        {step === 2 && renderDeclaration()}
        {step === 3 && renderDocuments()}

        {/* Reset Action */}
        <TouchableOpacity
          onPress={confirmReset}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 18,
            paddingVertical: 8,
          }}
        >
          <RotateCcw size={14} color={c.textMuted} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.textMuted }}>Reset Form</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* DOCKED STICKY BOTTOM ACTION BAR */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: c.surface,
          borderTopWidth: 1,
          borderTopColor: c.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        {step > 0 ? (
          <SecondaryButton
            c={c}
            label="Back"
            icon={ChevronLeft}
            onPress={() => goStep(step - 1)}
            style={{ flex: 0.8 }}
          />
        ) : null}
        {isLast ? (
          <PrimaryButton
            accent={accent}
            label="Submit Application"
            icon={Send}
            onPress={handleSubmit}
            loading={submitting}
            style={{ flex: 1.6 }}
          />
        ) : (
          <TouchableOpacity
            onPress={() => goStep(step + 1)}
            activeOpacity={0.82}
            style={{
              flex: 1.6,
              backgroundColor: accent,
              borderRadius: 16,
              minHeight: 52,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              shadowColor: accent,
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text style={{ color: onAccent(accent), fontSize: 15.5, fontWeight: '800' }}>
              Next: {STEPS[step + 1]}
            </Text>
            <ChevronRight size={18} color={onAccent(accent)} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Submitting Overlay */}
      {submitting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: c.surface,
              padding: 24,
              borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={{ color: c.text, marginTop: 14, fontWeight: '800', fontSize: 16 }}>
              Submitting Application...
            </Text>
            <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
              Registering your debenture allotment
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
