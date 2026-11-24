import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Modal, RefreshControl, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import {
  ShieldCheck, Download, X, Wallet, TrendingUp, IndianRupee, CalendarClock, FileText, Lock, Mail, Phone,
  CreditCard, Landmark, Hash, Building2, Signature, Send, Award, CircleAlert, Layers, RefreshCw, Check,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import {
  useAppTheme, Card, SectionHeader, StatTile, StatusPill, EmptyState, SearchBox, FilterChips,
  inr, inrShort, greeting, GOLD, BRAND_NAVY,
} from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';
import { FormField, UploadTile, PrimaryButton, onAccent } from '../debenture/formUI';
import { generatePaymentBondHtml, BOND_PAGE } from './bondHtml';

type StatusFilter = 'ALL' | 'Verified' | 'Pending' | 'Rejected';

const DEFAULT_BOND_TERMS = `INVESTOR CAPITAL BOND AGREEMENT TERMS\n\n1. The Investor agrees to invest the specified capital amount (RS) into the capital fund.\n2. Monthly returns will be computed at the agreed rate per month subject to document verification.\n3. All uploaded KYC documents (Aadhar, PAN, Marksheets & Bank Details) are verified by Key Admin before activation.\n4. By checking the agreement box, the investor digitally signs and confirms that all submitted information is accurate and legally binding.`;

const KYC_DOCS = [
  { key: 'aadhar', urlKey: 'aadharDocUrl', label: 'Aadhaar card', req: true },
  { key: 'pan', urlKey: 'panDocUrl', label: 'PAN card', req: true },
  { key: 'bankPassbook', urlKey: 'bankPassbookUrl', label: 'Bank passbook', req: true },
  { key: 'marksheet10th', urlKey: 'marksheet10thUrl', label: '10th marksheet', req: false },
  { key: 'marksheet12th', urlKey: 'marksheet12thUrl', label: '12th marksheet', req: false },
  { key: 'graduation', urlKey: 'graduationUrl', label: 'Graduation marksheet', req: false },
  { key: 'postGraduation', urlKey: 'postGraduationUrl', label: 'Post graduation marksheet', req: false },
] as const;
const MANDATORY = ['aadhar', 'pan', 'bankPassbook'];

const statusTone = (s?: string) => (s === 'Verified' ? 'success' : s === 'Rejected' ? 'danger' : 'warning') as 'success' | 'danger' | 'warning';
const docTone = (s?: string) => (s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'warning') as 'success' | 'danger' | 'warning';

const prettyDate = (v?: string | Date) => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const ymdToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const hasRate = (inv: any) => inv?.monthlyGrowthPercentage !== undefined && inv?.monthlyGrowthPercentage !== null && inv?.monthlyGrowthPercentage !== '';

export const InvestorPortalView = () => {
  const { c, isDark, accent } = useAppTheme();
  const [investor, setInvestor] = useState<any>(null);
  const [allInvestments, setAllInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bondInvestorModal, setBondInvestorModal] = useState<any>(null);
  const [investmentInput, setInvestmentInput] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [acceptedBond, setAcceptedBond] = useState(false);
  const [bondTermsText, setBondTermsText] = useState(DEFAULT_BOND_TERMS);

  // KYC inputs & attachments
  const [attachedFiles, setAttachedFiles] = useState<Record<string, string>>({});
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');

  // Investments list
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

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

  const fetchProfile = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      let invData: any = null;
      let list: any[] = [];
      const resInv: any = await apiCall('/api/investors/me');
      if (resInv && (resInv.success || resInv.data)) {
        // apiCall wraps the JSON body: resInv.data = { success, data: latestInvestment, allInvestments }
        const body = resInv.data;
        if (body && typeof body === 'object' && !Array.isArray(body) && ('allInvestments' in body || 'data' in body)) {
          invData = body.data || null;
          list = Array.isArray(body.allInvestments) ? body.allInvestments : [];
        } else {
          invData = body || null;
        }
      }
      if (!invData || Array.isArray(invData)) {
        const resAuth: any = await apiCall('/api/auth/me');
        if (resAuth && resAuth.success) {
          invData = resAuth.data?.investor || resAuth.investor || invData;
        }
      }

      if (Array.isArray(invData)) {
        if (!list.length) list = invData;
        invData = invData[0] || null;
      }

      if (invData) {
        setInvestor(invData);
        setAllInvestments(list.length ? list : [invData]);
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
        const tpl = resSet?.data?.data?.investorLegalBondTemplate || resSet?.data?.investorLegalBondTemplate;
        if (resSet && resSet.success && tpl) {
          setBondTermsText(tpl);
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

  const refresh = async () => {
    setRefreshing(true);
    await fetchProfile({ silent: true });
    setRefreshing(false);
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
        fetchProfile({ silent: true });
      } else {
        Alert.alert('Error', res?.error || 'Failed to submit details');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBondPdf = async (targetInv: any) => {
    try {
      const html = generatePaymentBondHtml(targetInv);
      const { uri } = await Print.printToFileAsync({ html, base64: false, ...BOND_PAGE });
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

  // ---------- Derived (real API fields only) ----------
  const counts = useMemo(() => {
    const r = { ALL: allInvestments.length, Verified: 0, Pending: 0, Rejected: 0 } as Record<StatusFilter, number>;
    allInvestments.forEach((i) => {
      const s = (i.status || 'Pending') as StatusFilter;
      if (s in r) r[s] += 1;
    });
    return r;
  }, [allInvestments]);

  const totals = useMemo(() => {
    const totalInvested = allInvestments.reduce((s, i) => s + (Number(i.investmentAmount) || 0), 0);
    const verified = allInvestments.filter((i) => i.status === 'Verified');
    const verifiedAmount = verified.reduce((s, i) => s + (Number(i.investmentAmount) || 0), 0);
    const monthlyReturn = verified
      .filter(hasRate)
      .reduce((s, i) => s + ((Number(i.investmentAmount) || 0) * Number(i.monthlyGrowthPercentage)) / 100, 0);
    const today = ymdToday();
    const upcoming = allInvestments
      .map((i) => (i.bondMaturityDate ? String(i.bondMaturityDate).slice(0, 10) : ''))
      .filter((d) => d && d >= today)
      .sort();
    return { totalInvested, verifiedAmount, verifiedCount: verified.length, monthlyReturn, nextMaturity: upcoming[0] || '' };
  }, [allInvestments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allInvestments.filter((i) => {
      if (statusFilter !== 'ALL' && (i.status || 'Pending') !== statusFilter) return false;
      if (!q) return true;
      return [i.investorCode, i.debentureForm?.applicationNo, i.status, String(i.investmentAmount ?? ''), i.investmentDate, i.bondMaturityDate]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allInvestments, search, statusFilter]);
  const invPage = usePagination(filtered, 4, `${search}|${statusFilter}`);

  // ---------- Render ----------
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, paddingTop: 40 }}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  if (!investor) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={GOLD} colors={[GOLD]} />}
      >
        <Card c={c}>
          <EmptyState c={c} icon={Wallet} text="No investor data found." />
          <PrimaryButton accent={accent} label="Try again" icon={RefreshCw} onPress={() => fetchProfile()} />
        </Card>
      </ScrollView>
    );
  }

  const docs = investor.docVerifications || {};
  const kyc = investor.kycDocs || {};
  const mandatoryApproved = MANDATORY.filter((k) => docs[k] === 'Approved').length;
  const uploadedCount = KYC_DOCS.filter((d) => attachedFiles[d.key] || kyc[d.urlKey]).length;
  const mandatoryUploaded = KYC_DOCS.filter((d) => d.req && (attachedFiles[d.key] || kyc[d.urlKey])).length;
  const bondSigned = !!investor.bondAgreement?.accepted;
  const isVerified = investor.status === 'Verified';
  const displayName = investor.fullName || investor.email || 'Investor';
  const firstName = String(investor.fullName || '').trim().split(/\s+/)[0] || 'Investor';
  const onAcc = onAccent(accent);

  const ProgressBar = ({ value, total, tint }: { value: number; total: number; tint: string }) => (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surfaceLight, overflow: 'hidden' }}>
      <View style={{ width: `${total ? Math.round((value / total) * 100) : 0}%`, height: 8, borderRadius: 4, backgroundColor: tint }} />
    </View>
  );

  const InvestmentCard = ({ inv, index }: { inv: any; index: number }) => {
    const maturity = inv.bondMaturityDate ? String(inv.bondMaturityDate).slice(0, 10) : '';
    const matured = !!maturity && maturity < ymdToday();
    const isPrimary = inv._id && investor._id ? String(inv._id) === String(investor._id) : index === 0;
    const pay = inv.payment;
    return (
      <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: isPrimary ? accent + '66' : c.border, padding: 14, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: accent + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={19} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15.5, fontWeight: '800', color: c.text }} numberOfLines={1}>{inv.investorCode || 'Investment'}</Text>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>
              {inv.debentureForm?.applicationNo ? `Form #${inv.debentureForm.applicationNo}` : isPrimary ? 'Latest investment' : 'Investment'}
              {inv.investmentDate ? ` · ${prettyDate(inv.investmentDate)}` : ''}
            </Text>
          </View>
          <StatusPill label={inv.status || 'Pending'} tone={statusTone(inv.status)} />
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
          <View style={{ flex: 1.2 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Invested</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>{inr(inv.investmentAmount)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Growth</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.success, marginTop: 2 }}>{hasRate(inv) ? `${inv.monthlyGrowthPercentage}%/mo` : '—'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{matured ? 'Matured' : 'Maturity'}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: matured ? c.success : c.text, marginTop: 4 }} numberOfLines={1}>{maturity ? prettyDate(maturity) : '—'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={13} color={inv.bondAgreement?.accepted ? c.success : c.textMuted} />
            <Text style={{ fontSize: 12, color: inv.bondAgreement?.accepted ? c.success : c.textMuted, fontWeight: inv.bondAgreement?.accepted ? '700' : '400' }}>
              {inv.bondAgreement?.accepted ? 'Bond signed' : 'Bond pending'}
            </Text>
          </View>
          {pay?.status ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <IndianRupee size={13} color={pay.status === 'Paid' ? c.success : c.warning} />
              <Text style={{ fontSize: 12, color: pay.status === 'Paid' ? c.success : c.warning, fontWeight: '700' }}>
                {pay.status}{pay.amountPaid ? ` · ${inr(pay.amountPaid)}` : ''}
              </Text>
            </View>
          ) : null}
          {inv.status === 'Rejected' && inv.rejectionReason ? (
            <Text style={{ fontSize: 12, color: c.danger }} numberOfLines={2}>Reason: {inv.rejectionReason}</Text>
          ) : null}
        </View>

        {inv.status === 'Verified' ? (
          <TouchableOpacity
            onPress={() => setBondInvestorModal(inv)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 11, marginTop: 12, backgroundColor: GOLD + (isDark ? '26' : '22') }}
          >
            <Award size={15} color={isDark ? GOLD : '#9A7A16'} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? GOLD : '#9A7A16' }}>Payment bond (PDF)</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={GOLD} colors={[GOLD]} />}
      >
        {/* ---------- Hero ---------- */}
        <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -80, top: -100, borderWidth: 26, borderColor: 'rgba(214,175,55,0.10)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{greeting()},</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>{firstName}</Text>
            </View>
            <View style={{ backgroundColor: investor.status === 'Verified' ? 'rgba(16,185,129,0.2)' : investor.status === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: investor.status === 'Verified' ? '#34D399' : investor.status === 'Rejected' ? '#F87171' : '#FBBF24', fontSize: 11.5, fontWeight: '800' }}>
                {investor.status === 'Verified' ? 'Verified' : investor.status === 'Rejected' ? 'Rejected' : 'Pending review'}
              </Text>
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 18, fontWeight: '600' }}>
            Total invested{allInvestments.length > 1 ? ` · ${allInvestments.length} investments` : ''}
          </Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>{inr(totals.totalInvested)}</Text>

          <View style={{ flexDirection: 'row', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Monthly growth</Text>
              <Text style={{ color: '#34D399', fontSize: 16, fontWeight: '800', marginTop: 2 }}>{hasRate(investor) ? `${investor.monthlyGrowthPercentage}%` : '—'}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 10 }} />
            <View style={{ flex: 1.3 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Est. monthly return</Text>
              <Text style={{ color: GOLD, fontSize: 16, fontWeight: '800', marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
                {totals.verifiedCount > 0 ? `${inr(Math.round(totals.monthlyReturn))}/mo` : 'After verification'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            {investor.investorCode ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Hash size={12} color="rgba(255,255,255,0.6)" />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' }}>{investor.investorCode}</Text>
              </View>
            ) : null}
            {investor.email ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
                <Mail size={12} color="rgba(255,255,255,0.6)" />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }} numberOfLines={1}>{investor.email}</Text>
              </View>
            ) : null}
            {investor.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Phone size={12} color="rgba(255,255,255,0.6)" />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{investor.phone}</Text>
              </View>
            ) : null}
          </View>

          {isVerified ? (
            <TouchableOpacity
              onPress={() => setBondInvestorModal(investor)}
              activeOpacity={0.85}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: GOLD, borderRadius: 14, paddingVertical: 13, marginTop: 16 }}
            >
              <Download size={17} color={BRAND_NAVY} />
              <Text style={{ color: BRAND_NAVY, fontWeight: '800', fontSize: 14.5 }}>Download payment bond (PDF)</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {investor.status === 'Rejected' && investor.rejectionReason ? (
          <Card c={c} style={{ marginTop: 14, borderColor: 'rgba(239,68,68,0.35)' }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <CircleAlert size={18} color={c.danger} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.danger }}>Application rejected</Text>
                <Text style={{ fontSize: 13, color: c.text, marginTop: 2, lineHeight: 18 }}>{investor.rejectionReason}</Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* ---------- KPI tiles ---------- */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          <StatTile
            c={c} isDark={isDark} icon={Wallet} tint="#3B82F6" label="Verified capital"
            value={inrShort(totals.verifiedAmount)}
            hint={`${totals.verifiedCount} of ${allInvestments.length} verified`}
          />
          <StatTile
            c={c} isDark={isDark} icon={TrendingUp} tint="#10B981" label="Monthly growth"
            value={hasRate(investor) ? `${investor.monthlyGrowthPercentage}%` : '—'}
            hint={investor.investorCode || undefined}
          />
          <StatTile
            c={c} isDark={isDark} icon={FileText} tint={mandatoryApproved === 3 ? '#10B981' : '#F59E0B'} label="KYC approved"
            value={`${mandatoryApproved}/3`}
            hint={`${uploadedCount}/${KYC_DOCS.length} docs uploaded`}
          />
          <StatTile
            c={c} isDark={isDark} icon={CalendarClock} tint="#8B5CF6" label="Next maturity"
            value={totals.nextMaturity ? prettyDate(totals.nextMaturity) : '—'}
            hint={bondSigned ? 'Bond signed' : 'Bond pending'}
          />
        </View>

        {/* ---------- Investments ---------- */}
        <SectionHeader c={c} title={allInvestments.length > 1 ? `My investments (${allInvestments.length})` : 'My investment'} />
        {allInvestments.length > 1 ? (
          <>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Search code, form no., amount…" />
            <FilterChips<StatusFilter>
              c={c}
              accent={accent}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All', count: counts.ALL },
                { value: 'Verified', label: 'Verified', count: counts.Verified },
                { value: 'Pending', label: 'Pending', count: counts.Pending },
                { value: 'Rejected', label: 'Rejected', count: counts.Rejected },
              ]}
            />
          </>
        ) : null}
        {invPage.pageItems.length === 0 ? (
          <Card c={c}><EmptyState c={c} icon={Layers} text="No investments match your search." /></Card>
        ) : (
          invPage.pageItems.map((inv: any, i: number) => <InvestmentCard key={inv._id || i} inv={inv} index={invPage.from - 1 + i} />)
        )}
        <Pagination c={c} accent={accent} {...invPage} onChange={invPage.setPage} />

        {/* ---------- Investment amount (read-only, as before) ---------- */}
        <SectionHeader c={c} title="Investment amount" />
        <Card c={c}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={18} color={c.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: c.textMuted }}>Invest RS amount (₹)</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginTop: 1 }}>{inr(Number(investmentInput) || 0)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surfaceLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Lock size={12} color={c.textMuted} />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.textMuted }}>Locked</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 10 }}>The total amount in RS you intend to invest. Contact your relationship manager to change it.</Text>
        </Card>

        {/* ---------- KYC & documents ---------- */}
        <SectionHeader c={c} title="KYC & documents" />
        <Card c={c}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>Mandatory documents approved</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: mandatoryApproved === 3 ? c.success : c.warning }}>{mandatoryApproved}/3</Text>
          </View>
          <ProgressBar value={mandatoryApproved} total={3} tint={mandatoryApproved === 3 ? c.success : c.warning} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: c.textMuted }}>Uploaded ({mandatoryUploaded}/3 mandatory)</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{uploadedCount}/{KYC_DOCS.length}</Text>
          </View>
          <ProgressBar value={uploadedCount} total={KYC_DOCS.length} tint={accent} />
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 12, lineHeight: 17 }}>
            Only PDF documents up to 15MB are accepted. Mandatory: Aadhar, PAN, and Bank Passbook. 10th & 12th Marksheets are optional.
          </Text>
        </Card>

        {KYC_DOCS.filter((d) => d.key !== 'bankPassbook').map((item) => {
          const st = docs[item.key] || 'Pending';
          const approved = st === 'Approved';
          const numField = item.key === 'aadhar'
            ? { value: aadharNumber, set: setAadharNumber, label: 'Aadhaar number', placeholder: 'Enter Aadhar Number', icon: CreditCard }
            : item.key === 'pan'
              ? { value: panNumber, set: setPanNumber, label: 'PAN number', placeholder: 'Enter PAN Number', icon: CreditCard }
              : null;
          return (
            <Card key={item.key} c={c} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '700', color: c.text }}>{item.label}</Text>
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: item.req ? c.danger : c.textMuted, letterSpacing: 0.5 }}>{item.req ? 'REQUIRED' : 'OPTIONAL'}</Text>
                <StatusPill label={st} tone={docTone(st)} />
              </View>
              {numField ? (
                <FormField
                  c={c} accent={accent} label={numField.label} icon={numField.icon} placeholder={numField.placeholder}
                  value={numField.value} onChangeText={numField.set} readOnly={approved} autoCapitalize="characters"
                />
              ) : null}
              <UploadTile
                c={c} isDark={isDark} label={item.label} uri={attachedFiles[item.key]} onPress={() => handlePickDoc(item.key)}
                locked={approved} lockedLabel="Verified & approved by admin"
                subtitle={kyc[item.urlKey] ? 'Uploaded earlier · tap to replace' : 'Tap to upload PDF / image document'}
              />
            </Card>
          );
        })}

        {/* Bank details & passbook */}
        <Card c={c} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '700', color: c.text }}>Bank details & passbook</Text>
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: c.danger, letterSpacing: 0.5 }}>REQUIRED</Text>
            <StatusPill label={docs.bankPassbook || 'Pending'} tone={docTone(docs.bankPassbook)} />
          </View>
          <FormField c={c} accent={accent} label="Bank name" icon={Landmark} placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
          <FormField c={c} accent={accent} label="Account number" icon={Hash} placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <FormField c={c} accent={accent} label="IFSC code" placeholder="IFSC Code" value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField c={c} accent={accent} label="Branch" icon={Building2} placeholder="Branch Name" value={branchName} onChangeText={setBranchName} />
            </View>
          </View>
          <UploadTile
            c={c} isDark={isDark} label="Bank passbook" uri={attachedFiles.bankPassbook} onPress={() => handlePickDoc('bankPassbook')}
            subtitle={kyc.bankPassbookUrl ? 'Uploaded earlier · tap to replace' : 'Tap to upload Bank Passbook PDF / Image'}
          />
        </Card>

        {/* ---------- Bond agreement ---------- */}
        <SectionHeader c={c} title="Bond agreement" />
        <Card c={c}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (bondSigned ? c.success : c.warning) + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={19} color={bondSigned ? c.success : c.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '700', color: c.text }}>Investor legal bond agreement</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>
                {bondSigned
                  ? `Signed${investor.bondAgreement?.signatureText ? ` by ${investor.bondAgreement.signatureText}` : ''}${investor.bondAgreement?.acceptedAt ? ` · ${prettyDate(investor.bondAgreement.acceptedAt)}` : ''}`
                  : 'Review the terms, tick the box and sign to accept.'}
              </Text>
            </View>
            <StatusPill label={bondSigned ? 'Signed' : 'Pending'} tone={bondSigned ? 'success' : 'warning'} />
          </View>

          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 220, backgroundColor: c.surfaceLight, borderRadius: 14, marginBottom: 14 }}
            contentContainerStyle={{ padding: 14 }}
          >
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11.5, color: c.text, lineHeight: 18 }}>{bondTermsText}</Text>
          </ScrollView>

          <TouchableOpacity onPress={() => setAcceptedBond(!acceptedBond)} activeOpacity={0.75} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: acceptedBond ? accent : c.textMuted, backgroundColor: acceptedBond ? accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {acceptedBond ? <Check size={15} color={onAcc} strokeWidth={3} /> : null}
            </View>
            <Text style={{ flex: 1, fontSize: 13.5, fontWeight: '600', color: c.text, lineHeight: 19 }}>
              I have read, understood, and accept all terms of the Investor Bond Agreement <Text style={{ color: c.danger }}>*</Text>
            </Text>
          </TouchableOpacity>

          <FormField
            c={c} accent={accent} label="Digital signature (enter full name)" required icon={Signature}
            placeholder={displayName} value={signatureText} onChangeText={setSignatureText}
          />

          <PrimaryButton
            accent={accent}
            label={submitting ? 'Submitting...' : 'Submit all details for verification'}
            icon={Send}
            loading={submitting}
            onPress={handleSubmitAll}
          />
          <Text style={{ fontSize: 11.5, color: c.textMuted, textAlign: 'center', marginTop: 10 }}>
            Submits your KYC details, documents and bond acceptance to the admin team for review.
          </Text>
        </Card>
      </ScrollView>

      {/* ---------- Payment bond preview ---------- */}
      <Modal visible={!!bondInvestorModal} animationType="slide" transparent={false} onRequestClose={() => setBondInvestorModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: BRAND_NAVY }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(214,175,55,0.3)' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={17} color="#34D399" />
                <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Payment bond</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, marginTop: 2 }} numberOfLines={1}>
                {bondInvestorModal?.investorCode || ''} · Verified & approved
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDownloadBondPdf(bondInvestorModal)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 }}
            >
              <Download size={15} color={BRAND_NAVY} />
              <Text style={{ color: BRAND_NAVY, fontWeight: '800', fontSize: 12.5 }}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBondInvestorModal(null)} accessibilityLabel="Close" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 10 }}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          {bondInvestorModal ? (
            <View style={{ flex: 1, backgroundColor: '#e7e7e7' }}>
              {Platform.OS === 'web' ? (
                <iframe srcDoc={generatePaymentBondHtml(bondInvestorModal)} style={{ width: '100%', height: '100%', border: 'none', flex: 1 } as any} />
              ) : (
                <WebView
                  source={{ html: generatePaymentBondHtml(bondInvestorModal) }}
                  style={{ flex: 1, backgroundColor: '#e7e7e7' }}
                  javaScriptEnabled
                  domStorageEnabled
                  scalesPageToFit
                  originWhitelist={['*']}
                  automaticallyAdjustContentInsets={false}
                />
              )}
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};
