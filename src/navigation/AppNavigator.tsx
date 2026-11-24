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
  RefreshControl,
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
import { colors, spacing, borderRadius, setForcedScheme, cardStyles } from '../theme/colors';
import { apiCall, getApiBaseUrl } from '../services/api';
import { useAuthStore } from '../services/authStore';
import { SkeletonBox, DashboardSkeleton } from '../components/SkeletonLoader';
import { styles } from '../theme/legacyStyles';
import { generatePaymentBondHtml, BOND_PAGE } from '../screens/investorPortal/bondHtml';
import { AttendanceView } from '../screens/attendance/AttendanceView';
import { LeaveView } from '../screens/leave/LeaveView';
import { HolidaysView } from '../screens/holidays/HolidaysView';
import { DebentureFormView } from '../screens/debenture/DebentureFormView';
import { InvestorPortalView } from '../screens/investorPortal/InvestorPortalView';
import { EmployeesView } from '../screens/employees/EmployeesView';
import { PayrollView } from '../screens/payroll/PayrollView';
import { ReportsView } from '../screens/reports/ReportsView';
import { NotificationsView } from '../screens/notifications/NotificationsView';
import { CompanyWalletView } from '../screens/wallet/CompanyWalletView';
import { SettingsView } from '../screens/settings/SettingsView';
import { EmployeeProfileView } from '../screens/profile/EmployeeProfileView';
import { MobileCard } from '../components/MobileCard';
import { NativeHeader } from '../components/NativeHeader';
import { NativeBottomBar } from '../components/NativeBottomBar';
import { AppMenuDrawer, MenuContent } from '../components/AppMenu';
import { AboutCompanyScreen } from '../screens/AboutCompanyScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { InvestorRegisterScreen } from '../screens/InvestorRegisterScreen';
import { AdminOverview } from '../screens/dashboard/AdminOverview';
import { EmployeeOverview } from '../screens/dashboard/EmployeeOverview';
import { useAppTheme, SearchBox } from '../components/DashboardUI';
import { Pagination } from '../components/Pagination';
import {
  InvestorCard, InvestorFilterSheet, InvestorFilters, EMPTY_FILTERS, STATUS_OPTIONS,
  buildInvestorQuery, describeFilters, countSheetFilters,
} from '../screens/investors/InvestorListUI';
import {
  LeadCard, LeadFilterSheet, LeadFilters, EMPTY_LEAD_FILTERS, STAGES as LEAD_STAGES,
  buildLeadQuery, describeLeadFilters, countLeadSheetFilters, ownerName,
} from '../screens/leads/LeadListUI';


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
  UserPlus,
  Landmark,
  ChevronRight,
  ListFilter as ListFilterIcon,
} from 'lucide-react-native';

// Types
type RootStackParamList = {
  AboutCompany: undefined;
  Login: undefined;
  InvestorRegister: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Leads Pipeline Sub-View ---
const LeadsView = () => {
  const { c: pal, isDark: palDark, accent: palAccent } = useAppTheme();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsRefreshing, setLeadsRefreshing] = useState(false);
  const [debouncedLeadSearch, setDebouncedLeadSearch] = useState('');
  const [leadFilters, setLeadFilters] = useState<LeadFilters>(EMPTY_LEAD_FILTERS);
  const [leadPage, setLeadPage] = useState(1);
  const [leadPaging, setLeadPaging] = useState({ total: 0, totalPages: 1 });
  const [leadSheetOpen, setLeadSheetOpen] = useState(false);
  const [leadEmployees, setLeadEmployees] = useState<any[]>([]);
  const leadsScrollRef = useRef<ScrollView>(null);

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

  const fetchLeads = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setLeadsRefreshing(true); else setLoading(true);
    try {
      const res: any = await apiCall(`/api/leads${buildLeadQuery(debouncedLeadSearch, leadFilters, leadPage)}`);
      if (res.success && res.data) {
        const body = res.data;
        const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setLeads(list);
        const pg = body?.pagination;
        setLeadPaging(pg ? { total: pg.total || 0, totalPages: Math.max(1, pg.totalPages || 1) } : { total: list.length, totalPages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLeadsRefreshing(false);
    }
  };

  // Debounce typing (500 ms, like the web) and restart from page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() !== debouncedLeadSearch) {
        setDebouncedLeadSearch(search.trim());
        setLeadPage(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchLeads();
  }, [debouncedLeadSearch, leadFilters, leadPage]);

  useEffect(() => {
    if (!isAdminOrKeyAdmin) return;
    apiCall('/api/employees?status=Active&slim=true').then((res: any) => {
      const d = res?.data?.data ?? res?.data;
      if (Array.isArray(d)) setLeadEmployees(d);
    });
  }, []);

  const applyLeadFilters = (next: LeadFilters) => {
    setLeadFilters(next);
    setLeadPage(1);
  };
  const goToLeadPage = (pg: number) => {
    setLeadPage(pg);
    leadsScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

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
                {ownerName(selectedLead)}
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

  // MAIN PIPELINE LIST VIEW
  const leadApplied = describeLeadFilters(leadFilters);
  const leadSheetCount = countLeadSheetFilters(leadFilters);
  const leadFrom = leadPaging.total === 0 ? 0 : (leadPage - 1) * leadFilters.limit + 1;
  const leadTo = Math.min(leadPage * leadFilters.limit, leadPaging.total);
  const onAccentText = palDark ? '#0C1C3D' : '#fff';

  return (
    <View style={{ flex: 1, backgroundColor: pal.background }}>
      <ScrollView
        ref={leadsScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={leadsRefreshing} onRefresh={() => fetchLeads({ silent: true })} tintColor={palAccent} colors={[palAccent]} />}
      >
        {/* Title + actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: pal.text }}>Leads</Text>
            <Text style={{ fontSize: 13, color: pal.textMuted, marginTop: 2 }}>
              {loading ? 'Loading…' : `${leadPaging.total.toLocaleString('en-IN')} ${leadPaging.total === 1 ? 'lead' : 'leads'}`}
            </Text>
          </View>
          {isAdminOrKeyAdmin && (
            <>
              <TouchableOpacity
                onPress={() => setShowImportModal(true)}
                accessibilityLabel="Import CSV"
                style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.border, marginRight: 8 }}
              >
                <Download size={18} color={pal.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExportLeads}
                accessibilityLabel="Export CSV"
                style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.border, marginRight: 8 }}
              >
                <UploadCloud size={18} color={pal.text} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palAccent, paddingHorizontal: 14, height: 42, borderRadius: 12 }}
          >
            <Plus size={17} color={onAccentText} />
            <Text style={{ color: onAccentText, fontWeight: '800', fontSize: 14 }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search + filters */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={pal} value={search} onChange={setSearch} placeholder="Name, company, email or phone" />
          </View>
          <TouchableOpacity
            onPress={() => setLeadSheetOpen(true)}
            accessibilityLabel="Open filters"
            style={{ height: 42, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: leadSheetCount ? palAccent : pal.surfaceLight }}
          >
            <ListFilterIcon size={17} color={leadSheetCount ? onAccentText : pal.text} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: leadSheetCount ? onAccentText : pal.text }}>
              Filters{leadSheetCount ? ` · ${leadSheetCount}` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stage chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
          {['', ...LEAD_STAGES].map((st) => {
            const active = leadFilters.stage === st;
            return (
              <TouchableOpacity
                key={st || 'all'}
                onPress={() => applyLeadFilters({ ...leadFilters, stage: st })}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? palAccent : pal.surface, borderWidth: 1, borderColor: active ? palAccent : pal.border }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? onAccentText : pal.textMuted }}>{st || 'All stages'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Applied filters */}
        {leadApplied.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {leadApplied.map((a) => (
              <TouchableOpacity
                key={a.key}
                onPress={() => applyLeadFilters({ ...leadFilters, ...a.clear })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: pal.surfaceLight }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: pal.text }}>{a.label}</Text>
                <X size={13} color={pal.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => applyLeadFilters({ ...EMPTY_LEAD_FILTERS, stage: leadFilters.stage, limit: leadFilters.limit })} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: pal.danger }}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {loading ? (
          <View style={{ paddingTop: 8 }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ height: 210, borderRadius: 18, backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.border, marginBottom: 12, opacity: 1 - i * 0.25 }} />
            ))}
          </View>
        ) : leads.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: pal.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color={pal.textMuted} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: pal.text }}>No leads found</Text>
            <Text style={{ fontSize: 13, color: pal.textMuted, textAlign: 'center' }}>
              {debouncedLeadSearch || leadApplied.length || leadFilters.stage ? 'Try a different search or clear the filters.' : 'Tap Add to create your first lead.'}
            </Text>
          </View>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead._id || lead.id}
              c={pal}
              isDark={palDark}
              accent={palAccent}
              lead={lead}
              canAssign={isAdminOrKeyAdmin}
              onOpen={() => setSelectedLead(lead)}
              onAssign={() => openAssignModal(lead)}
            />
          ))
        )}

        {!loading && (
          <Pagination
            c={pal}
            accent={palAccent}
            page={leadPage}
            totalPages={leadPaging.totalPages}
            from={leadFrom}
            to={leadTo}
            total={leadPaging.total}
            onChange={goToLeadPage}
          />
        )}
      </ScrollView>

      <LeadFilterSheet
        c={pal}
        accent={palAccent}
        visible={leadSheetOpen}
        initial={leadFilters}
        employees={leadEmployees}
        showEmployeeFilter={isAdminOrKeyAdmin}
        onApply={(f) => { setLeadSheetOpen(false); applyLeadFilters(f); }}
        onClose={() => setLeadSheetOpen(false)}
      />

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
                      justifyContent: 'space-between',
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

// --- Investors Admin View Sub-Component ---
const InvestorsAdminView = () => {
  const { c: pal, isDark: palDark, accent: palAccent } = useAppTheme();
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [invFilters, setInvFilters] = useState<InvestorFilters>(EMPTY_FILTERS);
  const [invPage, setInvPage] = useState(1);
  const [invPaging, setInvPaging] = useState({ total: 0, totalPages: 1 });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [referralEmployees, setReferralEmployees] = useState<any[]>([]);
  const listScrollRef = useRef<ScrollView>(null);

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

  const fetchInvestors = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    try {
      const res: any = await apiCall(`/api/investors/me${buildInvestorQuery(debouncedSearch, invFilters, invPage)}`);
      const pg = res?.data?.pagination;
      setInvPaging(pg ? { total: pg.total || 0, totalPages: Math.max(1, pg.totalPages || 1) } : { total: 0, totalPages: 1 });
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
      setRefreshing(false);
    }
  };

  // Debounce typing (500 ms, like the web) and jump back to page 1 for a new search.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() !== debouncedSearch) {
        setDebouncedSearch(searchQuery.trim());
        setInvPage(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchInvestors();
  }, [debouncedSearch, invFilters, invPage]);

  // Employees for the "Referred by" filter.
  useEffect(() => {
    apiCall('/api/employees?status=Active&slim=true').then((res: any) => {
      const d = res?.data?.data ?? res?.data;
      if (Array.isArray(d)) setReferralEmployees(d);
    });
  }, []);

  const applyInvFilters = (next: InvestorFilters) => {
    setInvFilters(next);
    setInvPage(1);
  };

  const goToInvPage = (p: number) => {
    setInvPage(p);
    listScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // The list response leaves out document/photo URLs to stay small, so load the full record when a detail opens.
  const openWithFullRecord = async (inv: any, setter: (fn: any) => void) => {
    setter(inv);
    const id = inv?._id || inv?.id;
    if (!id) return;
    const res: any = await apiCall(`/api/investors/me?id=${id}`);
    const full = res?.success ? (res.data?.data || res.data) : null;
    if (full && typeof full === 'object' && !Array.isArray(full)) {
      setter((cur: any) => (cur && (cur._id || cur.id) === id ? { ...cur, ...full } : cur));
    }
  };

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

  const appliedFilters = describeFilters(invFilters);
  const sheetCount = countSheetFilters(invFilters);
  const rangeFrom = invPaging.total === 0 ? 0 : (invPage - 1) * invFilters.limit + 1;
  const rangeTo = Math.min(invPage * invFilters.limit, invPaging.total);

  return (
    <View style={{ flex: 1, backgroundColor: pal.background }}>
    <ScrollView
      ref={listScrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 110 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchInvestors({ silent: true })} tintColor={palAccent} colors={[palAccent]} />}
    >
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: pal.text }}>Investors</Text>
          <Text style={{ fontSize: 13, color: pal.textMuted, marginTop: 2 }}>
            {loading ? 'Loading…' : `${invPaging.total.toLocaleString('en-IN')} ${invPaging.total === 1 ? 'investor' : 'investors'}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palAccent, paddingHorizontal: 14, height: 42, borderRadius: 12 }}
        >
          <UserPlus size={17} color={palDark ? '#0C1C3D' : '#fff'} />
          <Text style={{ color: palDark ? '#0C1C3D' : '#fff', fontWeight: '800', fontSize: 14 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search + filter button */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <SearchBox c={pal} value={searchQuery} onChange={setSearchQuery} placeholder="Name, email, phone or code" />
        </View>
        <TouchableOpacity
          onPress={() => setFilterSheetOpen(true)}
          accessibilityLabel="Open filters"
          style={{ height: 42, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: sheetCount ? palAccent : pal.surfaceLight }}
        >
          <ListFilterIcon size={17} color={sheetCount ? (palDark ? '#0C1C3D' : '#fff') : pal.text} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: sheetCount ? (palDark ? '#0C1C3D' : '#fff') : pal.text }}>
            Filters{sheetCount ? ` · ${sheetCount}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
        {STATUS_OPTIONS.map((o) => {
          const active = invFilters.status === o.value;
          return (
            <TouchableOpacity
              key={o.value || 'all'}
              onPress={() => applyInvFilters({ ...invFilters, status: o.value })}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? palAccent : pal.surface, borderWidth: 1, borderColor: active ? palAccent : pal.border }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? (palDark ? '#0C1C3D' : '#fff') : pal.textMuted }}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
        {[{ v: 'done', l: 'Maturity done' }, { v: 'due_soon', l: 'Due in 7 days' }].map((q) => {
          const active = invFilters.maturity === q.v;
          return (
            <TouchableOpacity
              key={q.v}
              onPress={() => applyInvFilters({ ...invFilters, maturity: active ? '' : q.v })}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? palAccent : pal.surface, borderWidth: 1, borderColor: active ? palAccent : pal.border }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? (palDark ? '#0C1C3D' : '#fff') : pal.textMuted }}>{q.l}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Applied filters */}
      {appliedFilters.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {appliedFilters.map((a) => (
            <TouchableOpacity
              key={a.key}
              onPress={() => applyInvFilters({ ...invFilters, ...a.clear })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: pal.surfaceLight }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: pal.text }}>{a.label}</Text>
              <X size={13} color={pal.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => applyInvFilters({ ...EMPTY_FILTERS, status: invFilters.status, limit: invFilters.limit })} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: pal.danger }}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={{ paddingTop: 8 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ height: 190, borderRadius: 18, backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.border, marginBottom: 12, opacity: 1 - i * 0.25 }} />
          ))}
        </View>
      ) : investors.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: pal.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color={pal.textMuted} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: pal.text }}>No investors found</Text>
          <Text style={{ fontSize: 13, color: pal.textMuted, textAlign: 'center' }}>
            {debouncedSearch || appliedFilters.length || invFilters.status ? 'Try a different search or clear the filters.' : 'Add your first investor to get started.'}
          </Text>
        </View>
      ) : (
        investors.map((inv) => (
          <InvestorCard
            key={inv._id || inv.id}
            c={pal}
            isDark={palDark}
            accent={palAccent}
            inv={inv}
            onView={() => openWithFullRecord(inv, setSelectedInvestor)}
            onForm={() => openWithFullRecord(inv, setSelectedDebentureForm)}
            onBond={() => openWithFullRecord(inv, setBondInvestorModal)}
            onEdit={() => setEditInvestor({ ...inv })}
            onDelete={() => handleDeleteInvestor(inv)}
          />
        ))
      )}

      {!loading && (
        <View style={{ marginTop: -4 }}>
          <Pagination
            c={pal}
            accent={palAccent}
            page={invPage}
            totalPages={invPaging.totalPages}
            from={rangeFrom}
            to={rangeTo}
            total={invPaging.total}
            onChange={goToInvPage}
          />
        </View>
      )}

    </ScrollView>

      <InvestorFilterSheet
        c={pal}
        accent={palAccent}
        visible={filterSheetOpen}
        initial={invFilters}
        employees={referralEmployees}
        onApply={(f) => { setFilterSheetOpen(false); applyInvFilters(f); }}
        onClose={() => setFilterSheetOpen(false)}
      />

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
      <div class="addr">MEZZANINE LEVEL SHIVAJI STADIUM  METRO STATION BABA KHARAK SINGH ROAD CONNAUGHT PLACE NEW DELHI 110001</div>
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
      <tr><td class="field-label">No. of Debentures Applied</td><td class="field-colon">:</td><td class="field-val">${noOfDebs} <span style="font-weight:normal;font-size:11px;color:#64748b;">(${df.numDebenturesWords || "Units"})</span></td></tr>
      <tr><td class="field-label">Total Application Amount</td><td class="field-colon">:</td><td class="field-val" style="color:#059669;font-size:14px;">&#8377;${calculatedTotal.toLocaleString()} \${df.totalApplicationAmountWords ? \` <span style="font-weight:normal;font-size:11px;color:#64748b;">(\${df.totalApplicationAmountWords})</span>\` : ''}</td></tr>
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
      <div class="stamp-circle">NEW DELHI<br>110001<br>INDIA</div>
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
                        } catch (_) { }
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
    </View>
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

  const colorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';

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

  const [refreshing, setRefreshing] = useState(false);
  const fetchDashboardData = async (opts?: { silent?: boolean }) => {
    if (!isAdminOrKeyAdmin) {
      setLoading(false);
      setOverviewAttLoading(false);
      return;
    }
    if (opts?.silent) setRefreshing(true); else setLoading(true);
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
      setRefreshing(false);
      setOverviewAttLoading(false);
    }
  };

  // Fetch attendance records for admin/keyadmin overview
  const fetchOverviewAttendance = async () => {
    await fetchDashboardData({ silent: true });
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

  const selectSection = (name: string) => {
    setSidebarOpen(false);
    setActiveSection(name);
    if (name === 'Overview') fetchDashboardData({ silent: true });
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} translucent={true} />
        <DashboardSkeleton />
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
    totalInvestors: 0,
    totalInvestments: 0,
  };

  // Resolve investor stats from multiple possible API response paths
  const totalInvestors = k.totalInvestors ?? data?.totalInvestors ?? data?.investors?.total ?? data?.investorCount ?? 0;
  const totalInvestments = k.totalInvestments ?? data?.totalInvestments ?? data?.investmentAmount ?? data?.totalInvestmentAmount ?? 0;

  const wonPercentage = k.openLeads + k.wonLeads > 0
    ? Math.round((k.wonLeads / (k.openLeads + k.wonLeads)) * 100)
    : 0;

  const displayName =
    (user as any)?.firstName ||
    String((user as any)?.name || '').split(' ')[0] ||
    String(user?.email || '').split('@')[0] ||
    'there';

  const sidebarTopGap = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : Math.max(insets.top, 16);
  const sidebarBottomGap = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} translucent={true} />
      {/* Executive Header Bar */}
      <NativeHeader
        title={activeSection === 'Overview' ? 'Dashboard' : activeSection}
        subtitle="Niventra Capital Advisory"
        onOpenSidebar={() => setSidebarOpen(true)}
        onLogout={handleLogout}
      />

      {/* Conditional rendering of sections */}
      {activeSection === 'Overview' ? (
        isAdminOrKeyAdmin ? (
          <AdminOverview
            data={data}
            userName={displayName}
            refreshing={refreshing}
            onRefresh={() => fetchDashboardData({ silent: true })}
            onNavigate={setActiveSection}
          />
        ) : (
          <EmployeeOverview userName={displayName} onNavigate={setActiveSection} />
        )
      ) : (
        <View style={{ flex: 1, paddingBottom: 60 + insets.bottom }}>
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
          ) : activeSection === 'Menu' ? (
            <MenuContent activeSection={activeSection} onSelect={selectSection} onLogout={handleLogout} />
          ) : (
            <View style={styles.placeholderSection}>
              <Text style={styles.placeholderTitle}>{activeSection} Module</Text>
              <Text style={styles.placeholderSubtitle}>This panel is currently active. Mobile integration coming soon.</Text>
            </View>
          )}
        </View>
      )}

      {/* App menu (hamburger + bottom "Menu" tab) */}
      <AppMenuDrawer
        visible={sidebarOpen}
        activeSection={activeSection}
        onSelect={selectSection}
        onLogout={() => { setSidebarOpen(false); handleLogout(); }}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Executive Native Bottom Bar */}
      <NativeBottomBar
        activeSection={activeSection}
        setActiveSection={(sec) => {
          setActiveSection(sec);
          if (sec === 'Overview') {
            fetchDashboardData({ silent: true });
          }
        }}
        onOpenMenu={() => setSidebarOpen(true)}
      />
    </View>
  );
};

// --- Navigation Configuration ---
export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const colorScheme = useColorScheme(); // Subscribes the navigation component to system theme updates
  const themeMode = useAuthStore((state) => state.themeMode);
  const [showSplash, setShowSplash] = useState(true);

  const isDark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';
  const themeKey = isDark ? 'dark' : 'light';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0c1c3d',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#0c1c3d" translucent={false} />
        {/* Animated-like circular emblem */}
        <View style={{
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: '#c9972f',
          marginBottom: 32,
          shadowColor: '#c9972f',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 85, height: 85, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{
          fontSize: 30,
          fontWeight: '900',
          color: '#ffffff',
          letterSpacing: 2,
          textAlign: 'center',
          marginBottom: 4,
          textTransform: 'uppercase',
        }}>
          Niventra <Text style={{ color: '#c9972f' }}>Capital</Text>
        </Text>
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: '#e8b84b',
          letterSpacing: 4,
          textAlign: 'center',
          marginBottom: 40,
          textTransform: 'uppercase',
        }}>
          Advisory India Pvt. Ltd.
        </Text>

        {/* Compound Growth Visual */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 48,
          height: 40,
        }}>
          <View style={{ width: 8, height: 10, backgroundColor: 'rgba(201, 151, 47, 0.4)', borderRadius: 2 }} />
          <View style={{ width: 8, height: 18, backgroundColor: 'rgba(201, 151, 47, 0.6)', borderRadius: 2 }} />
          <View style={{ width: 8, height: 26, backgroundColor: 'rgba(201, 151, 47, 0.8)', borderRadius: 2 }} />
          <View style={{ width: 8, height: 35, backgroundColor: '#c9972f', borderRadius: 2 }} />
        </View>

        <ActivityIndicator size="large" color="#c9972f" />
        <Text style={{
          color: '#e8b84b',
          fontSize: 13,
          fontWeight: '600',
          marginTop: 16,
          letterSpacing: 1,
        }}>
          Securely loading portal...
        </Text>
      </View>
    );
  }

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
