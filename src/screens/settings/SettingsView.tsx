import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Platform, BackHandler,
} from 'react-native';
import {
  Building2, Users, Briefcase, MapPin, Umbrella, Mail, MessageSquare, Plug, Shield, ShieldCheck, Save,
  Globe, Phone, Hash, Plus, Trash2, Search, FileText, Clock, CalendarDays, Server, User as UserIcon,
  KeyRound, CreditCard, Smartphone, Check, RefreshCw, Pencil, List, AtSign, ShieldAlert,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import {
  useAppTheme, Palette, Card, Avatar, StatusPill, EmptyState, SearchBox, FilterChips, GOLD,
} from '../../components/DashboardUI';
import { Pagination, usePagination } from '../../components/Pagination';
import {
  Group, GroupTitle, ListRow, FormField, PrimaryButton, SubHeader, BottomSheet, onAccentColor,
} from './SettingsUI';

// ---------------------------------------------------------------------------
// Master settings (admin). Same endpoints and payloads as the previous screen:
//   GET  /api/settings            -> load
//   PUT  /api/settings            -> body: the WHOLE settings object (JSON.stringify(settings))
//   GET  /api/users               -> Access Control list
//   PUT  /api/users { email, role }
// ---------------------------------------------------------------------------

type SectionKey =
  | 'Company Profile'
  | 'Departments'
  | 'Designations'
  | 'Office Locations'
  | 'Policies'
  | 'Email Templates'
  | 'SMS Templates'
  | 'Integrations'
  | 'Access Control';

const TINT = {
  blue: '#3B82F6',
  green: '#10B981',
  violet: '#8B5CF6',
  orange: '#F97316',
  pink: '#EC4899',
  teal: '#14B8A6',
  gold: GOLD,
  red: '#EF4444',
};

const DEFAULT_EMAIL_TEMPLATES = [
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
];

const DEFAULT_SMS_TEMPLATES = [
  { triggerEvent: 'OTP Verification', body: 'Your CRM login OTP is {{otp}}. Valid for 5 minutes.' },
  { triggerEvent: 'Lead Assigned', body: 'A new lead {{leadName}} has been assigned to you. Check leads page.' },
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const SettingsView = () => {
  const { c, isDark, accent } = useAppTheme();

  const [section, setSection] = useState<SectionKey | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/settings');
      if (res.success && res.data) {
        // API returns { success, data: settingsObj } — apiCall wraps it, so actual settings may be nested
        const settingsData = res.data.data || res.data;
        setSettings(settingsData);
        setDirty(false);
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
      const res = await apiCall('/api/users');
      if (res.success && res.data) {
        // /api/users returns { success, data: [...] }; apiCall puts that whole body in res.data.
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data.data) ? res.data.data : [];
        setUsers(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (section === 'Access Control' && users.length === 0) {
      fetchUsers();
    }
  }, [section]);

  // Android back button closes an open section instead of leaving the screen.
  useEffect(() => {
    if (!section) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSection(null);
      return true;
    });
    return () => sub.remove();
  }, [section]);

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const res = await apiCall('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ email, role: newRole }),
      });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
        Alert.alert('Success', 'Role updated successfully!');
      } else {
        Alert.alert('Error', res.error || 'Failed to update role.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error updating role.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiCall('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.success) {
        // Sync back saved data from server
        if (res.data) {
          const savedData = res.data.data || res.data;
          setSettings(savedData);
        }
        setDirty(false);
        Alert.alert('Success', 'Master settings saved successfully!');
      } else {
        Alert.alert('Error', res.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  /** Functional update of the in-memory settings object; marks the form as unsaved. */
  const patch = (fn: (prev: any) => any) => {
    setSettings((prev: any) => fn(prev));
    setDirty(true);
  };
  const setIn = (group: string, key: string, val: any) =>
    patch((prev) => ({ ...prev, [group]: { ...(prev[group] || {}), [key]: val } }));
  const setIntegration = (sub: string, key: string, val: any) =>
    patch((prev) => ({
      ...prev,
      integrations: {
        ...(prev.integrations || {}),
        [sub]: { ...(prev.integrations?.[sub] || {}), [key]: val },
      },
    }));
  const setArray = (field: string, arr: string[]) => patch((prev) => ({ ...prev, [field]: arr }));
  const updateTemplate = (kind: 'emailTemplates' | 'smsTemplates', idx: number, field: string, val: string) =>
    patch((prev) => {
      const defaults = kind === 'emailTemplates' ? DEFAULT_EMAIL_TEMPLATES : DEFAULT_SMS_TEMPLATES;
      const base = prev[kind] && prev[kind].length > 0 ? [...prev[kind]] : defaults.map((t) => ({ ...t }));
      base[idx] = { ...(base[idx] || {}), [field]: val };
      return { ...prev, [kind]: base };
    });

  // ---------------- Loading / error ----------------

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={{ color: c.textMuted, fontSize: 14 }}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.danger + '1F', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <ShieldAlert size={30} color={c.danger} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 6 }}>Access Restricted</Text>
        <Text style={{ fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 18 }}>
          Failed to load settings. Master settings require Administrator access.
        </Text>
        <PrimaryButton label="Try again" icon={RefreshCw} accent={accent} compact onPress={fetchSettings} />
      </View>
    );
  }

  const saveBtn = (
    <PrimaryButton label={saving ? 'Saving' : 'Save'} icon={Save} accent={accent} compact loading={saving} onPress={handleSave} />
  );

  // ---------------- Section list (root) ----------------

  if (!section) {
    const cp = settings.companyProfile || {};
    const lp = settings.leavePolicy || {};
    const ap = settings.attendancePolicy || {};
    const emailCount = (settings.emailTemplates?.length || 0) || DEFAULT_EMAIL_TEMPLATES.length;
    const smsCount = (settings.smsTemplates?.length || 0) || DEFAULT_SMS_TEMPLATES.length;
    const integ = settings.integrations || {};
    const configured = [integ.smtp?.host, integ.paymentGateway?.razorpayKeyId, integ.smsGateway?.twilioAccountSid].filter(Boolean).length;

    const row = (key: SectionKey, icon: any, tint: string, subtitle: string) => (
      <ListRow key={key} c={c} isDark={isDark} icon={icon} tint={tint} title={key} subtitle={subtitle} onPress={() => setSection(key)} />
    );

    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: c.text }}>Master Settings</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>Configure global application parameters.</Text>
            </View>
            {saveBtn}
          </View>

          {dirty ? <UnsavedBanner c={c} /> : null}

          {/* Company summary */}
          <TouchableOpacity activeOpacity={0.75} onPress={() => setSection('Company Profile')} style={{ marginTop: 18 }}>
            <Card c={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name={cp.name || 'Company'} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }} numberOfLines={1}>{cp.name || 'Company name not set'}</Text>
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                  {[cp.email, cp.website].filter(Boolean).join(' · ') || 'Tap to add company details'}
                </Text>
                {cp.gstNo ? <Text style={{ fontSize: 12, fontWeight: '700', color: accent, marginTop: 4 }}>GST {cp.gstNo}</Text> : null}
              </View>
              <Pencil size={16} color={c.textMuted} />
            </Card>
          </TouchableOpacity>

          <GroupTitle c={c} title="Organization" />
          <Group c={c}>
            {row('Company Profile', Building2, TINT.blue, 'Name, contact, GST and address')}
            {row('Departments', Users, TINT.green, plural((settings.departments || []).length, 'department', 'departments'))}
            {row('Designations', Briefcase, TINT.violet, plural((settings.designations || []).length, 'designation', 'designations'))}
            {row('Office Locations', MapPin, TINT.orange, plural((settings.officeLocations || []).length, 'location', 'locations'))}
          </Group>

          <GroupTitle c={c} title="HR" />
          <Group c={c}>
            {row(
              'Policies',
              Umbrella,
              TINT.teal,
              `${lp.maxSickLeaves ?? 12} sick · ${lp.maxCasualLeaves ?? 12} casual · office ${ap.officeStartTime || '10:00 AM'}`
            )}
          </Group>

          <GroupTitle c={c} title="Communication" />
          <Group c={c}>
            {row('Email Templates', Mail, TINT.pink, plural(emailCount, 'template', 'templates'))}
            {row('SMS Templates', MessageSquare, TINT.blue, plural(smsCount, 'template', 'templates'))}
          </Group>

          <GroupTitle c={c} title="System" />
          <Group c={c}>
            {row('Integrations', Plug, TINT.gold, `SMTP, payment & SMS gateways · ${configured}/3 configured`)}
            {row('Access Control', Shield, TINT.red, 'Admin roles & permissions')}
          </Group>

          <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 18 }}>
            Changes are kept while you move between sections.{'\n'}Tap Save to apply them for everyone.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ---------------- Section editors ----------------

  const subtitleFor: Record<SectionKey, string> = {
    'Company Profile': 'Shown on letters, bonds and the app',
    Departments: 'Used in employee records',
    Designations: 'Used in employee records',
    'Office Locations': 'Physical office locations',
    Policies: 'Leave and attendance rules',
    'Email Templates': 'Automated email responses',
    'SMS Templates': 'Automated SMS responses',
    Integrations: 'Third-party service credentials',
    'Access Control': 'Admin roles & permissions',
  };

  const cp = settings.companyProfile || {};
  const smtp = settings.integrations?.smtp || {};
  const pg = settings.integrations?.paymentGateway || {};
  const sms = settings.integrations?.smsGateway || {};

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SubHeader c={c} title={section} subtitle={subtitleFor[section]} onBack={() => setSection(null)} right={section === 'Access Control' ? undefined : saveBtn} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {dirty && section !== 'Access Control' ? <UnsavedBanner c={c} /> : null}

        {section === 'Company Profile' && (
          <Card c={c} style={{ marginTop: 6 }}>
            <FormField c={c} isDark={isDark} label="Company Name" icon={Building2} placeholder="My Company" value={cp.name || ''} onChangeText={(v) => setIn('companyProfile', 'name', v)} />
            <FormField c={c} isDark={isDark} label="Website" icon={Globe} placeholder="Website" autoCapitalize="none" keyboardType="url" value={cp.website || ''} onChangeText={(v) => setIn('companyProfile', 'website', v)} />
            <FormField c={c} isDark={isDark} label="Contact Email" icon={Mail} placeholder="Contact Email" autoCapitalize="none" keyboardType="email-address" value={cp.email || ''} onChangeText={(v) => setIn('companyProfile', 'email', v)} />
            <FormField c={c} isDark={isDark} label="Contact Phone" icon={Phone} placeholder="Contact Phone" keyboardType="phone-pad" value={cp.phone || ''} onChangeText={(v) => setIn('companyProfile', 'phone', v)} />
            <FormField c={c} isDark={isDark} label="GST Number" icon={Hash} placeholder="GST Number" autoCapitalize="characters" value={cp.gstNo || ''} onChangeText={(v) => setIn('companyProfile', 'gstNo', v)} />
            <FormField c={c} isDark={isDark} label="HQ Address" icon={MapPin} placeholder="HQ Address" multiline value={cp.address || ''} onChangeText={(v) => setIn('companyProfile', 'address', v)} containerStyle={{ marginBottom: 0 }} />
          </Card>
        )}

        {section === 'Departments' && (
          <StringListEditor key="departments" c={c} isDark={isDark} accent={accent} icon={Users} noun="department" items={settings.departments || []} onChange={(arr) => setArray('departments', arr)} />
        )}
        {section === 'Designations' && (
          <StringListEditor key="designations" c={c} isDark={isDark} accent={accent} icon={Briefcase} noun="designation" items={settings.designations || []} onChange={(arr) => setArray('designations', arr)} />
        )}
        {section === 'Office Locations' && (
          <StringListEditor key="officeLocations" c={c} isDark={isDark} accent={accent} icon={MapPin} noun="location" items={settings.officeLocations || []} onChange={(arr) => setArray('officeLocations', arr)} />
        )}

        {section === 'Policies' && (
          <>
            <GroupTitle c={c} title="Leave policy (annual limits)" style={{ marginTop: 8 }} />
            <Card c={c}>
              <FormField c={c} isDark={isDark} label="Max Sick Leaves" icon={CalendarDays} keyboardType="numeric" placeholder="12"
                value={String(settings.leavePolicy?.maxSickLeaves ?? 12)} onChangeText={(v) => setIn('leavePolicy', 'maxSickLeaves', Number(v) || 0)} />
              <FormField c={c} isDark={isDark} label="Max Casual Leaves" icon={CalendarDays} keyboardType="numeric" placeholder="12"
                value={String(settings.leavePolicy?.maxCasualLeaves ?? 12)} onChangeText={(v) => setIn('leavePolicy', 'maxCasualLeaves', Number(v) || 0)} />
              <FormField c={c} isDark={isDark} label="Carry Forward Limit" icon={CalendarDays} keyboardType="numeric" placeholder="5"
                value={String(settings.leavePolicy?.carryForwardLimit ?? 5)} onChangeText={(v) => setIn('leavePolicy', 'carryForwardLimit', Number(v) || 0)} containerStyle={{ marginBottom: 0 }} />
            </Card>

            <GroupTitle c={c} title="Attendance policy" />
            <Card c={c}>
              <FormField c={c} isDark={isDark} label="Office Start Time" icon={Clock} placeholder="10:00 AM"
                value={settings.attendancePolicy?.officeStartTime || '10:00 AM'} onChangeText={(v) => setIn('attendancePolicy', 'officeStartTime', v)} />
              <FormField c={c} isDark={isDark} label="Late Threshold (Mins)" icon={Clock} keyboardType="numeric" placeholder="15"
                value={String(settings.attendancePolicy?.lateThresholdMins ?? 15)} onChangeText={(v) => setIn('attendancePolicy', 'lateThresholdMins', Number(v) || 0)} />
              <FormField c={c} isDark={isDark} label="Half Day Threshold (Mins)" icon={Clock} keyboardType="numeric" placeholder="240"
                value={String(settings.attendancePolicy?.halfDayThresholdMins ?? 240)} onChangeText={(v) => setIn('attendancePolicy', 'halfDayThresholdMins', Number(v) || 0)} containerStyle={{ marginBottom: 0 }} />
            </Card>
          </>
        )}

        {section === 'Email Templates' && (
          <TemplateList
            key="email"
            c={c}
            isDark={isDark}
            accent={accent}
            kind="email"
            templates={settings.emailTemplates && settings.emailTemplates.length > 0 ? settings.emailTemplates : DEFAULT_EMAIL_TEMPLATES}
            onChange={(idx, field, val) => updateTemplate('emailTemplates', idx, field, val)}
          />
        )}
        {section === 'SMS Templates' && (
          <TemplateList
            key="sms"
            c={c}
            isDark={isDark}
            accent={accent}
            kind="sms"
            templates={settings.smsTemplates && settings.smsTemplates.length > 0 ? settings.smsTemplates : DEFAULT_SMS_TEMPLATES}
            onChange={(idx, field, val) => updateTemplate('smsTemplates', idx, field, val)}
          />
        )}

        {section === 'Integrations' && (
          <>
            <GroupTitle c={c} title="SMTP email configuration" style={{ marginTop: 8 }} />
            <Card c={c}>
              <FormField c={c} isDark={isDark} label="SMTP Host" icon={Server} placeholder="e.g. smtp.gmail.com" autoCapitalize="none"
                value={String(smtp.host || '')} onChangeText={(v) => setIntegration('smtp', 'host', v)} />
              <FormField c={c} isDark={isDark} label="SMTP Port" icon={Hash} placeholder="e.g. 587" keyboardType="numeric"
                value={String(smtp.port || '')} onChangeText={(v) => setIntegration('smtp', 'port', v)} />
              <FormField c={c} isDark={isDark} label="SMTP User" icon={UserIcon} placeholder="keyadmin@gmail.com" autoCapitalize="none" keyboardType="email-address"
                value={String(smtp.user || '')} onChangeText={(v) => setIntegration('smtp', 'user', v)} />
              <FormField c={c} isDark={isDark} label="SMTP Password" icon={KeyRound} placeholder="••••••••" secure autoCapitalize="none"
                value={String(smtp.pass || '')} onChangeText={(v) => setIntegration('smtp', 'pass', v)} />
              <FormField c={c} isDark={isDark} label="From Address" icon={AtSign} placeholder='e.g. "HR Team" <hr@company.com>' autoCapitalize="none"
                value={String(smtp.from || '')} onChangeText={(v) => setIntegration('smtp', 'from', v)} containerStyle={{ marginBottom: 0 }} />
            </Card>

            <GroupTitle c={c} title="Payment gateway (Razorpay / Cashfree)" />
            <Card c={c}>
              <FormField c={c} isDark={isDark} label="Account Number" icon={CreditCard} placeholder="Account Number" autoCapitalize="none"
                value={String(pg.razorpayAccountNumber || '')} onChangeText={(v) => setIntegration('paymentGateway', 'razorpayAccountNumber', v)} />
              <FormField c={c} isDark={isDark} label="Key ID" icon={KeyRound} placeholder="Key ID" autoCapitalize="none"
                value={String(pg.razorpayKeyId || '')} onChangeText={(v) => setIntegration('paymentGateway', 'razorpayKeyId', v)} />
              <FormField c={c} isDark={isDark} label="Key Secret" icon={KeyRound} placeholder="Key Secret" secure autoCapitalize="none"
                value={String(pg.razorpayKeySecret || '')} onChangeText={(v) => setIntegration('paymentGateway', 'razorpayKeySecret', v)} containerStyle={{ marginBottom: 0 }} />
            </Card>

            <GroupTitle c={c} title="SMS gateway (Twilio / MSG91)" />
            <Card c={c}>
              <FormField c={c} isDark={isDark} label="Twilio Account SID" icon={Hash} placeholder="Twilio Account SID" autoCapitalize="none"
                value={String(sms.twilioAccountSid || '')} onChangeText={(v) => setIntegration('smsGateway', 'twilioAccountSid', v)} />
              <FormField c={c} isDark={isDark} label="Twilio Auth Token" icon={KeyRound} placeholder="Twilio Auth Token" secure autoCapitalize="none"
                value={String(sms.twilioAuthToken || '')} onChangeText={(v) => setIntegration('smsGateway', 'twilioAuthToken', v)} />
              <FormField c={c} isDark={isDark} label="Twilio Phone Number" icon={Smartphone} placeholder="Twilio Phone Number" keyboardType="phone-pad"
                value={String(sms.twilioPhoneNumber || '')} onChangeText={(v) => setIntegration('smsGateway', 'twilioPhoneNumber', v)} containerStyle={{ marginBottom: 0 }} />
            </Card>
          </>
        )}

        {section === 'Access Control' && (
          <AccessControlPanel
            c={c}
            isDark={isDark}
            accent={accent}
            users={users}
            loading={usersLoading}
            loaded={usersLoaded}
            onRefresh={fetchUsers}
            onRoleChange={handleRoleChange}
          />
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function UnsavedBanner({ c }: { c: Palette }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: c.warning + '1F', borderWidth: 1, borderColor: c.warning + '55' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.warning }} />
      <Text style={{ flex: 1, fontSize: 13, color: c.text, fontWeight: '600' }}>You have unsaved changes. Tap Save to apply them.</Text>
    </View>
  );
}

/** Editable list of strings (departments, designations, locations) with search, add, remove and paging. */
function StringListEditor({
  c,
  isDark,
  accent,
  icon: Icon,
  noun,
  items,
  onChange,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  icon: any;
  noun: string;
  items: string[];
  onChange: (arr: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [bulk, setBulk] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.map((name, index) => ({ name, index })).filter((x) => !q || String(x.name).toLowerCase().includes(q));
  }, [items, query]);
  const pager = usePagination(filtered, 10, query);

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (items.some((x) => String(x).toLowerCase() === v.toLowerCase())) {
      Alert.alert('Already added', `"${v}" is already in the list.`);
      return;
    }
    onChange([...items, v]);
    setDraft('');
  };

  const remove = (index: number) => {
    const name = items[index];
    Alert.alert(`Remove ${noun}?`, `"${name}" will be removed when you save.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(items.filter((_, i) => i !== index)) },
    ]);
  };

  const openTextMode = () => {
    setBulk(items.join(', '));
    setTextMode(true);
  };
  const applyText = () => {
    // Same parsing as the previous comma-separated editor.
    const arr = bulk.split(',').map((s) => s.trim()).filter((s) => s);
    onChange(arr);
    setTextMode(false);
  };

  return (
    <>
      <Card c={c} style={{ marginTop: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 8 }}>Add {noun}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 46, borderRadius: 13, paddingHorizontal: 12, backgroundColor: c.surfaceLight }}>
            <Icon size={16} color={c.textMuted} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`New ${noun} name`}
              placeholderTextColor={c.textMuted}
              onSubmitEditing={add}
              returnKeyType="done"
              style={[{ flex: 1, marginLeft: 8, fontSize: 15, color: c.text, paddingVertical: 10 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
            />
          </View>
          <TouchableOpacity
            onPress={add}
            disabled={!draft.trim()}
            accessibilityLabel={`Add ${noun}`}
            style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.5 }}
          >
            <Plus size={20} color={onAccentColor(accent)} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={openTextMode} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start' }}>
          <List size={14} color={accent} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: accent }}>Edit as comma-separated text</Text>
        </TouchableOpacity>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>All {noun}s</Text>
        <StatusPill label={String(items.length)} tone="info" />
      </View>
      {items.length > 5 ? <SearchBox c={c} value={query} onChange={setQuery} placeholder={`Search ${noun}s`} /> : null}

      <Card c={c} padded={false}>
        {pager.pageItems.length === 0 ? (
          <EmptyState c={c} icon={query ? Search : Icon} text={query ? `No ${noun}s match "${query}".` : `No ${noun}s yet. Add one above.`} />
        ) : (
          pager.pageItems.map((x, i) => (
            <View key={`${x.index}-${x.name}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 52, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: isDark ? GOLD : c.accent }}>{x.index + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 15, color: c.text, fontWeight: '600' }} numberOfLines={2}>{x.name}</Text>
              <TouchableOpacity onPress={() => remove(x.index)} accessibilityLabel={`Remove ${x.name}`} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.danger + (isDark ? '22' : '14'), alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={16} color={c.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>
      <Pagination c={c} accent={accent} page={pager.page} totalPages={pager.totalPages} from={pager.from} to={pager.to} total={pager.total} onChange={pager.setPage} />

      <BottomSheet
        c={c}
        visible={textMode}
        title={`Edit ${noun}s`}
        subtitle={`Enter ${noun} names separated by commas.`}
        onClose={() => setTextMode(false)}
        footer={<PrimaryButton label="Apply" icon={Check} accent={accent} onPress={applyText} />}
      >
        <FormField c={c} isDark={isDark} label={`${noun[0].toUpperCase()}${noun.slice(1)}s`} multiline value={bulk} onChangeText={setBulk} style={{ minHeight: 160 }} />
      </BottomSheet>
    </>
  );
}

/** Searchable list of email / SMS templates; each opens an editor sheet that edits settings live. */
function TemplateList({
  c,
  isDark,
  accent,
  kind,
  templates,
  onChange,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  kind: 'email' | 'sms';
  templates: any[];
  onChange: (idx: number, field: string, val: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const tint = kind === 'email' ? TINT.pink : TINT.blue;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates
      .map((t, index) => ({ t: t || {}, index }))
      .filter(({ t }) => !q || `${t.triggerEvent || ''} ${t.subject || ''} ${t.body || ''}`.toLowerCase().includes(q));
  }, [templates, query]);
  const pager = usePagination(filtered, 10, query);
  const editing = editIdx !== null ? templates[editIdx] || {} : null;

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.surfaceLight, marginTop: 6, marginBottom: 14 }}>
        <FileText size={16} color={c.textMuted} style={{ marginTop: 1 }} />
        <Text style={{ flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 }}>
          Edit automated system responses. Use placeholders like {'{{employeeName}}'} where appropriate.
        </Text>
      </View>
      {templates.length > 4 ? <SearchBox c={c} value={query} onChange={setQuery} placeholder="Search templates" /> : null}

      <Card c={c} padded={false}>
        {pager.pageItems.length === 0 ? (
          <EmptyState c={c} icon={Search} text={`No templates match "${query}".`} />
        ) : (
          pager.pageItems.map(({ t, index }, i) => (
            <TouchableOpacity
              key={index}
              onPress={() => setEditIdx(index)}
              activeOpacity={0.6}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
                {kind === 'email' ? <Mail size={17} color={tint} /> : <MessageSquare size={17} color={tint} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }} numberOfLines={1}>{t.triggerEvent || 'Template'}</Text>
                {kind === 'email' && t.subject ? <Text style={{ fontSize: 13, color: c.text, marginTop: 2 }} numberOfLines={1}>{t.subject}</Text> : null}
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={2}>{String(t.body || '').replace(/\s+/g, ' ') || 'No content'}</Text>
              </View>
              <Pencil size={16} color={c.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </Card>
      <Pagination c={c} accent={accent} page={pager.page} totalPages={pager.totalPages} from={pager.from} to={pager.to} total={pager.total} onChange={pager.setPage} />

      <BottomSheet
        c={c}
        visible={editIdx !== null}
        title={editing?.triggerEvent || 'Template'}
        subtitle={kind === 'email' ? 'Email template' : 'SMS template'}
        onClose={() => setEditIdx(null)}
        footer={<PrimaryButton label="Done" icon={Check} accent={accent} onPress={() => setEditIdx(null)} />}
      >
        {editing && editIdx !== null ? (
          <>
            {kind === 'email' ? (
              <FormField c={c} isDark={isDark} label="Subject" placeholder="Subject..." value={editing.subject || ''} onChangeText={(v) => onChange(editIdx, 'subject', v)} />
            ) : null}
            <FormField
              c={c}
              isDark={isDark}
              label={kind === 'email' ? 'Body' : 'SMS Body (Keep under 160 chars)'}
              placeholder={kind === 'email' ? 'Email Body...' : 'SMS Body...'}
              multiline
              value={editing.body || ''}
              onChangeText={(v) => onChange(editIdx, 'body', v)}
              style={{ minHeight: kind === 'email' ? 180 : 110 }}
              hint={kind === 'sms' ? `${String(editing.body || '').length} / 160 characters` : undefined}
            />
            <Text style={{ fontSize: 12, color: c.textMuted }}>Edits are kept on this device until you tap Save on the settings screen.</Text>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}

const ROLE_OPTIONS = [
  { value: 'Employee', label: 'Employee', desc: 'Standard access' },
  { value: 'ADMIN', label: 'ADMIN', desc: 'Gets Settings access' },
  { value: 'KEY_ADMIN', label: 'KEY_ADMIN', desc: 'Full access, can assign roles' },
];
type RoleFilter = 'all' | 'KEY_ADMIN' | 'ADMIN' | 'other';
const roleTone = (r?: string) => (r === 'KEY_ADMIN' ? 'warning' : r === 'ADMIN' ? 'info' : 'muted') as 'warning' | 'info' | 'muted';

function AccessControlPanel({
  c,
  isDark,
  accent,
  users,
  loading,
  loaded,
  onRefresh,
  onRoleChange,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  users: any[];
  loading: boolean;
  loaded: boolean;
  onRefresh: () => void;
  onRoleChange: (email: string, role: string) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [picker, setPicker] = useState<any>(null);
  const [busy, setBusy] = useState('');

  const isAdminRole = (r?: string) => r === 'KEY_ADMIN' || r === 'ADMIN';
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === 'KEY_ADMIN' && u.role !== 'KEY_ADMIN') return false;
      if (filter === 'ADMIN' && u.role !== 'ADMIN') return false;
      if (filter === 'other' && isAdminRole(u.role)) return false;
      if (!q) return true;
      return `${u.email || ''} ${u.firstName || ''} ${u.lastName || ''} ${u.role || ''}`.toLowerCase().includes(q);
    });
  }, [users, query, filter]);
  const pager = usePagination(filtered, 10, `${query}|${filter}`);

  const counts = {
    all: users.length,
    KEY_ADMIN: users.filter((u) => u.role === 'KEY_ADMIN').length,
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    other: users.filter((u) => !isAdminRole(u.role)).length,
  };

  const choose = async (role: string) => {
    const u = picker;
    setPicker(null);
    if (!u || role === u.role) return;
    setBusy(u.email);
    try {
      await onRoleChange(u.email, role);
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.surfaceLight, marginTop: 6, marginBottom: 14 }}>
        <ShieldCheck size={16} color={c.textMuted} style={{ marginTop: 1 }} />
        <Text style={{ flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 }}>
          Assign the ADMIN or KEY_ADMIN role to employees to give them access to Settings. Role changes apply immediately.
        </Text>
      </View>

      <SearchBox c={c} value={query} onChange={setQuery} placeholder="Search by name, email or role" />
      <FilterChips<RoleFilter>
        c={c}
        accent={accent}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'KEY_ADMIN', label: 'Key admins', count: counts.KEY_ADMIN },
          { value: 'ADMIN', label: 'Admins', count: counts.ADMIN },
          { value: 'other', label: 'Employees', count: counts.other },
        ]}
      />

      <Card c={c} padded={false}>
        {loading ? (
          <ActivityIndicator size="small" color={accent} style={{ marginVertical: 28 }} />
        ) : pager.pageItems.length === 0 ? (
          <View style={{ paddingBottom: 16, alignItems: 'center' }}>
            <EmptyState c={c} icon={Users} text={users.length === 0 ? (loaded ? 'No users found.' : 'Loading users...') : 'No users match your search.'} />
            {users.length === 0 && loaded ? <PrimaryButton label="Reload" icon={RefreshCw} accent={accent} compact onPress={onRefresh} /> : null}
          </View>
        ) : (
          pager.pageItems.map((u, i) => {
            const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
            return (
              <TouchableOpacity
                key={u.email || i}
                onPress={() => setPicker(u)}
                disabled={busy === u.email}
                activeOpacity={0.6}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}
              >
                <Avatar name={name || u.email || '?'} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }} numberOfLines={1}>{name || u.email}</Text>
                  {name ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{u.email}</Text> : null}
                </View>
                {busy === u.email ? <ActivityIndicator size="small" color={accent} /> : <StatusPill label={u.role || 'Employee'} tone={roleTone(u.role)} />}
              </TouchableOpacity>
            );
          })
        )}
      </Card>
      <Pagination c={c} accent={accent} page={pager.page} totalPages={pager.totalPages} from={pager.from} to={pager.to} total={pager.total} onChange={pager.setPage} />

      <BottomSheet c={c} visible={!!picker} title="Change role" subtitle={picker?.email} onClose={() => setPicker(null)}>
        <Group c={c} style={{ marginBottom: 8 }}>
          {ROLE_OPTIONS.map((o) => {
            const active = picker?.role === o.value;
            return (
              <ListRow
                key={o.value}
                c={c}
                isDark={isDark}
                icon={o.value === 'Employee' ? UserIcon : o.value === 'ADMIN' ? Shield : ShieldCheck}
                tint={o.value === 'KEY_ADMIN' ? TINT.gold : o.value === 'ADMIN' ? TINT.blue : c.textMuted}
                title={o.label}
                subtitle={o.desc}
                chevron={false}
                right={active ? <Check size={18} color={accent} /> : null}
                onPress={() => choose(o.value)}
              />
            );
          })}
        </Group>
        <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>Only a KEY_ADMIN can change roles.</Text>
      </BottomSheet>
    </>
  );
}
