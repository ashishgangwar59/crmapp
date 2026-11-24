import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  RefreshControl,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Pencil, Trash2, X, UserPlus, Users, ListFilter, Phone, Mail, User as UserIcon, Briefcase,
  IdCard, HeartPulse, KeyRound, ShieldCheck, Eye, EyeOff, Check, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAppTheme, SearchBox, Avatar, StatusPill } from '../../components/DashboardUI';
import { Pagination } from '../../components/Pagination';
import {
  EmployeeFilters, EMPTY_EMP_FILTERS, EMP_STATUSES, buildEmployeeQuery, countEmpSheetFilters, describeEmpFilters,
  EmployeeFilterSheet, EmployeeCard, EmployeeCardSkeleton, DetailSection, InfoItem, FormLabel, FormInput, OptionRow,
  FormDateField, statusTone, prettyDate, onAccentOf,
} from './EmployeeUI';

const DEFAULT_MODULES = ['Overview', 'Attendance', 'Leads', 'Reports', 'Profile'];
const ALL_MODULES = [
  'Overview', 'Attendance', 'Leads', 'Reports', 'Profile', 'Executive AI', 'Wallet', 'Payroll', 'Leave',
  'Holidays', 'Employees', 'Notifications', 'Settings',
];
const STEP_LABELS = ['Personal', 'Official', 'KYC', 'Bank', 'Roles'];

const listFrom = (response: any): any[] =>
  Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data) ? response.data : [];

// --- Employees Sub-View ---
export const EmployeesView = () => {
  const { c, isDark, accent } = useAppTheme();
  const onAccent = onAccentOf(accent);
  const insets = useSafeAreaInsets();

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<EmployeeFilters>(EMPTY_EMP_FILTERS);
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState({ total: 0, totalPages: 1 });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [summary, setSummary] = useState<any[] | null>(null); // slim list of everyone visible, for status counts + departments
  const listScrollRef = useRef<ScrollView>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [preparingEdit, setPreparingEdit] = useState(false);

  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string>('');

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
  const [moduleAccess, setModuleAccess] = useState<string[]>(DEFAULT_MODULES);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ---------------- Data ----------------

  const fetchEmployees = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    try {
      const response: any = await apiCall(`/api/employees${buildEmployeeQuery(debouncedSearch, filters, page)}`);
      if (response.success && response.data) {
        const list = listFrom(response);
        setEmployees(list);
        const pg = response.data?.pagination;
        setPaging(pg ? { total: pg.total || 0, totalPages: Math.max(1, pg.totalPages || 1) } : { total: list.length, totalPages: 1 });
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch employees.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response: any = await apiCall('/api/employees?slim=true');
      if (response.success) setSummary(listFrom(response));
    } catch (e) {
      console.error(e);
    }
  };

  // Debounce typing (500 ms, like the web) and jump back to page 1 for a new search.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() !== debouncedSearch) {
        setDebouncedSearch(searchQuery.trim());
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, filters, page]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // If a delete empties the last page, step back to the new last page.
  useEffect(() => {
    if (!loading && employees.length === 0 && page > 1 && page > paging.totalPages) setPage(paging.totalPages);
  }, [loading, employees.length, page, paging.totalPages]);

  const refreshAll = () => {
    fetchEmployees();
    fetchSummary();
  };

  const statusCounts = useMemo(() => {
    if (!summary) return null;
    const m: Record<string, number> = { '': summary.length };
    summary.forEach((e) => { const s = e.status || 'Active'; m[s] = (m[s] || 0) + 1; });
    return m;
  }, [summary]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    (summary || []).forEach((e) => { if (e.department) set.add(String(e.department)); });
    if (filters.department) set.add(filters.department);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [summary, filters.department]);

  const applyFilters = (next: EmployeeFilters) => {
    setFilters(next);
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    listScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  /** The single-employee endpoint also returns the login account's role + accessibleModules. */
  const loadFull = async (emp: any) => {
    const id = emp?._id || emp?.id;
    if (!id) return emp;
    try {
      const res: any = await apiCall(`/api/employees/${id}`);
      const full = res?.data?.data ?? res?.data;
      if (res?.success && full && typeof full === 'object' && !Array.isArray(full)) return { ...emp, ...full };
    } catch (e) {
      console.error(e);
    }
    return emp;
  };

  const openDetail = async (emp: any) => {
    setSelectedEmployee(emp);
    setResetPassword('');
    const id = emp._id || emp.id;
    const full = await loadFull(emp);
    setSelectedEmployee((prev: any) => (prev && (prev._id || prev.id) === id ? full : prev));
  };

  // ---------------- Form ----------------

  const resetForm = () => {
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
    setSystemRole('Employee');
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
    setModuleAccess(DEFAULT_MODULES);
  };

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

  const openAddForm = () => {
    resetForm();
    setIsEditMode(false);
    setEditId('');
    setShowAddForm(true);
  };

  const handleEditClick = async (empIn: any) => {
    // Make sure we have the login role / modules, otherwise saving would reset them to the defaults.
    let emp = empIn;
    if (!emp.accessibleModules && !emp.role) {
      setPreparingEdit(true);
      emp = await loadFull(empIn);
      setPreparingEdit(false);
    }

    setIsEditMode(true);
    setEditId(emp._id || emp.id);
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
    setSystemRole(emp.systemRole || emp.role || 'Employee');
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
    setModuleAccess(emp.moduleAccess || emp.accessibleModules || DEFAULT_MODULES);

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
                refreshAll();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete employee.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          },
        },
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
        // The API reads `newPassword`; `password` is kept for backwards compatibility.
        body: JSON.stringify({ password: resetPassword, newPassword: resetPassword }),
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

      const url = isEditMode ? `/api/employees/${editId}` : '/api/employees';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.success) {
        Alert.alert('Success', isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
        setShowAddForm(false);
        setIsEditMode(false);
        setEditId('');
        setSelectedEmployee(null);
        resetForm();
        refreshAll();
      } else {
        Alert.alert('Error', response.error || 'Failed to submit employee.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---------------- Render helpers ----------------

  const renderStepper = () => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 14 }}>
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <React.Fragment key={label}>
            {i > 0 ? <View style={{ flex: 1, height: 2, marginTop: 15, backgroundColor: stepNum <= currentStep ? accent : c.border }} /> : null}
            <TouchableOpacity onPress={() => setCurrentStep(stepNum)} activeOpacity={0.7} style={{ alignItems: 'center', width: 56 }}>
              <View
                style={{
                  width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: done || active ? accent : c.surfaceLight, borderWidth: 1, borderColor: done || active ? accent : c.border,
                }}
              >
                {done ? <Check size={16} color={onAccent} /> : (
                  <Text style={{ fontSize: 13, fontWeight: '800', color: active ? onAccent : c.textMuted }}>{stepNum}</Text>
                )}
              </View>
              <Text style={{ fontSize: 11, marginTop: 4, fontWeight: active ? '800' : '600', color: active ? c.text : c.textMuted }}>{label}</Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );

  const stepHeader = (title: string, desc: string) => (
    <View style={{ marginBottom: 2 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{title}</Text>
      <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{desc}</Text>
    </View>
  );

  const appliedFilters = describeEmpFilters(filters);
  const sheetCount = countEmpSheetFilters(filters);
  const rangeFrom = paging.total === 0 ? 0 : (page - 1) * filters.limit + 1;
  const rangeTo = Math.min(page * filters.limit, paging.total);

  // ---------------- Detail view ----------------

  const renderDetail = () => {
    const emp = selectedEmployee;
    const id = emp._id || emp.id;
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || '—';
    const modules: string[] | undefined = emp.accessibleModules || emp.moduleAccess;
    const role = emp.systemRole || emp.role;

    const QuickBtn = ({ icon: Icon, label, onPress }: any) => (
      <TouchableOpacity
        onPress={onPress}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 12, backgroundColor: c.surfaceLight }}
      >
        <Icon size={15} color={c.text} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{label}</Text>
      </TouchableOpacity>
    );

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => setSelectedEmployee(null)}
            accessibilityLabel="Back to employees"
            style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}
          >
            <ArrowLeft size={20} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '800', color: c.text, marginLeft: 12 }}>Employee profile</Text>
        </View>

        {/* Hero */}
        <View style={{ backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={name} size={64} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 19, fontWeight: '800', color: c.text }} numberOfLines={2}>{name}</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                <Text style={{ color: accent, fontWeight: '700' }}>{emp.employeeCode || '—'}</Text> • {emp.designation || 'Staff'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <StatusPill label={emp.status || 'Active'} tone={statusTone(emp.status)} />
                <StatusPill label={emp.employeeType || 'Full-Time'} tone="info" />
              </View>
            </View>
          </View>

          {(emp.phone || emp.email) ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              {emp.phone ? <QuickBtn icon={Phone} label="Call" onPress={() => Linking.openURL(`tel:${emp.phone}`)} /> : null}
              {emp.email ? <QuickBtn icon={Mail} label="Email" onPress={() => Linking.openURL(`mailto:${emp.email}`)} /> : null}
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => handleEditClick(selectedEmployee)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, backgroundColor: accent }}
            >
              <Pencil size={16} color={onAccent} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: onAccent }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteEmployee(id)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, backgroundColor: c.danger + (isDark ? '26' : '14') }}
            >
              <Trash2 size={16} color={c.danger} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: c.danger }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DetailSection c={c} isDark={isDark} icon={UserIcon} tint="#3B82F6" title="Personal Details">
          <InfoItem c={c} label="Email" value={emp.email} full />
          {emp.officeEmail ? <InfoItem c={c} label="Office Email" value={emp.officeEmail} full /> : null}
          <InfoItem c={c} label="Phone" value={emp.phone} />
          {emp.companyPhone ? <InfoItem c={c} label="Company Phone" value={emp.companyPhone} /> : null}
          {emp.gender ? <InfoItem c={c} label="Gender" value={emp.gender} /> : null}
          {emp.bloodGroup ? <InfoItem c={c} label="Blood Group" value={emp.bloodGroup} /> : null}
          {emp.maritalStatus ? <InfoItem c={c} label="Marital Status" value={emp.maritalStatus} /> : null}
          {emp.dateOfBirth ? <InfoItem c={c} label="Date of Birth" value={prettyDate(emp.dateOfBirth)} /> : null}
          <InfoItem c={c} label="Status" value={emp.status || 'Active'} />
          <InfoItem c={c} label="Employee Type" value={emp.employeeType || 'Full-Time'} />
          {emp.permanentAddress ? <InfoItem c={c} label="Permanent Address" value={emp.permanentAddress} full /> : null}
          {emp.correspondenceAddress ? <InfoItem c={c} label="Correspondence Address" value={emp.correspondenceAddress} full /> : null}
        </DetailSection>

        <DetailSection c={c} isDark={isDark} icon={Briefcase} tint="#8B5CF6" title="Official Details">
          <InfoItem c={c} label="Department" value={emp.department || 'N/A'} />
          <InfoItem c={c} label="Designation" value={emp.designation || 'N/A'} />
          {emp.dateOfJoining ? <InfoItem c={c} label="Joined Date" value={prettyDate(emp.dateOfJoining)} /> : null}
          {emp.workLocation ? <InfoItem c={c} label="Work Location" value={emp.workLocation} /> : null}
        </DetailSection>

        <DetailSection c={c} isDark={isDark} icon={IdCard} tint="#10B981" title="KYC & Bank Information">
          <InfoItem c={c} label="Aadhar Number" value={emp.kyc?.aadharNumber} />
          <InfoItem c={c} label="PAN Number" value={emp.kyc?.panNumber} />
          {emp.kyc?.passportNumber ? <InfoItem c={c} label="Passport Number" value={emp.kyc.passportNumber} /> : null}
          {emp.bankDetails?.bankName ? (
            <>
              <InfoItem c={c} label="Bank Name" value={emp.bankDetails.bankName} />
              <InfoItem c={c} label="Account Number" value={emp.bankDetails.accountNumber} />
              {emp.bankDetails?.ifscCode ? <InfoItem c={c} label="IFSC Code" value={emp.bankDetails.ifscCode} /> : null}
              {emp.bankDetails?.branchName ? <InfoItem c={c} label="Bank Branch" value={emp.bankDetails.branchName} /> : null}
            </>
          ) : null}
        </DetailSection>

        {emp.emergencyContact?.name ? (
          <DetailSection c={c} isDark={isDark} icon={HeartPulse} tint="#EC4899" title="Emergency Contact">
            <InfoItem c={c} label="Name" value={emp.emergencyContact.name} />
            <InfoItem c={c} label="Relation" value={emp.emergencyContact.relation} />
            <InfoItem c={c} label="Contact Number" value={emp.emergencyContact.phone} />
          </DetailSection>
        ) : null}

        {(role || modules) ? (
          <DetailSection c={c} isDark={isDark} icon={ShieldCheck} tint="#F97316" title="Access">
            {role ? <InfoItem c={c} label="System Role" value={role} full /> : null}
            {modules ? (
              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600', marginBottom: 6 }}>Modules</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {modules.length ? modules.map((m) => (
                    <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: c.surfaceLight }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{m}</Text>
                    </View>
                  )) : <Text style={{ fontSize: 13, color: c.textMuted }}>None</Text>}
                </View>
              </View>
            ) : null}
          </DetailSection>
        ) : null}

        {/* Administrative Actions (Password Force Reset) */}
        <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.danger + '55', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.danger + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={16} color={c.danger} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>Administrative Actions</Text>
          </View>
          <Text style={{ fontSize: 13, color: c.textMuted, lineHeight: 19 }}>
            Force reset this user's login password. They will be prompted to change it on their next login.
          </Text>
          <FormLabel c={c}>New Password</FormLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FormInput
              c={c}
              style={{ flex: 1, paddingRight: 44 }}
              placeholder="Enter minimum 6 characters..."
              value={resetPassword}
              onChangeText={setResetPassword}
              secureTextEntry={!showResetPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowResetPassword((v) => !v)}
              accessibilityLabel={showResetPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 12, padding: 4 }}
            >
              {showResetPassword ? <EyeOff size={18} color={c.textMuted} /> : <Eye size={18} color={c.textMuted} />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => handleForceResetPassword(id)}
            style={{ marginTop: 12, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.danger }}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Force Reset</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ---------------- List view ----------------

  const renderList = () => (
    <ScrollView
      ref={listScrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { fetchEmployees({ silent: true }); fetchSummary(); }}
          tintColor={accent}
          colors={[accent]}
        />
      }
    >
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Employees</Text>
          <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
            {loading ? 'Loading…' : `${paging.total.toLocaleString('en-IN')} ${paging.total === 1 ? 'employee' : 'employees'}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={openAddForm}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 14, height: 42, borderRadius: 12 }}
        >
          <UserPlus size={17} color={onAccent} />
          <Text style={{ color: onAccent, fontWeight: '800', fontSize: 14 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search + filter button */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <SearchBox c={c} value={searchQuery} onChange={setSearchQuery} placeholder="Name, email or code" />
        </View>
        <TouchableOpacity
          onPress={() => setFilterSheetOpen(true)}
          accessibilityLabel="Open filters"
          style={{ height: 42, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: sheetCount ? accent : c.surfaceLight }}
        >
          <ListFilter size={17} color={sheetCount ? onAccent : c.text} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: sheetCount ? onAccent : c.text }}>
            Filters{sheetCount ? ` · ${sheetCount}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
        {['', ...EMP_STATUSES].map((s) => {
          const active = filters.status === s;
          const count = statusCounts ? statusCounts[s] || 0 : undefined;
          return (
            <TouchableOpacity
              key={s || 'all'}
              onPress={() => applyFilters({ ...filters, status: s })}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                backgroundColor: active ? accent : c.surface, borderWidth: 1, borderColor: active ? accent : c.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? onAccent : c.textMuted }}>{s || 'All'}</Text>
              {count !== undefined ? (
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? onAccent : c.textMuted, opacity: 0.75 }}>{count}</Text>
              ) : null}
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
              onPress={() => applyFilters({ ...filters, ...a.clear })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: c.surfaceLight }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{a.label}</Text>
              <X size={13} color={c.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => applyFilters({ ...EMPTY_EMP_FILTERS, status: filters.status, limit: filters.limit })} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.danger }}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={{ paddingTop: 4 }}>
          {[0, 1, 2].map((i) => <EmployeeCardSkeleton key={i} c={c} index={i} />)}
        </View>
      ) : employees.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color={c.textMuted} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>No employees found</Text>
          <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>
            {debouncedSearch || appliedFilters.length || filters.status ? 'Try a different search or clear the filters.' : 'Add your first employee to get started.'}
          </Text>
        </View>
      ) : (
        employees.map((emp) => (
          <EmployeeCard
            key={emp._id || emp.id}
            c={c}
            isDark={isDark}
            accent={accent}
            emp={emp}
            onView={() => openDetail(emp)}
            onEdit={() => handleEditClick(emp)}
            onDelete={() => handleDeleteEmployee(emp._id || emp.id)}
          />
        ))
      )}

      {!loading && (
        <View style={{ marginTop: -4 }}>
          <Pagination
            c={c}
            accent={accent}
            page={page}
            totalPages={paging.totalPages}
            from={rangeFrom}
            to={rangeTo}
            total={paging.total}
            onChange={goToPage}
          />
        </View>
      )}
    </ScrollView>
  );

  // ---------------- Add / edit form ----------------

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            {stepHeader('Personal Details', 'Basic contact and personal information.')}
            <FormLabel c={c}>First Name *</FormLabel>
            <FormInput c={c} placeholder="Enter First Name" value={firstName} onChangeText={setFirstName} />
            <FormLabel c={c}>Last Name *</FormLabel>
            <FormInput c={c} placeholder="Enter Last Name" value={lastName} onChangeText={setLastName} />
            <FormLabel c={c}>Email Address *</FormLabel>
            <FormInput c={c} placeholder="Enter Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <FormLabel c={c}>Phone Number *</FormLabel>
            <FormInput c={c} placeholder="Enter Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <FormLabel c={c}>Office Email</FormLabel>
            <FormInput c={c} placeholder="Enter Office Email" value={officeEmail} onChangeText={setOfficeEmail} keyboardType="email-address" autoCapitalize="none" />
            <FormLabel c={c}>Company Phone No.</FormLabel>
            <FormInput c={c} placeholder="Enter Company Phone Number" value={companyPhone} onChangeText={setCompanyPhone} keyboardType="phone-pad" />
            <FormLabel c={c}>Permanent Address</FormLabel>
            <FormInput c={c} placeholder="Enter Permanent Address" value={permanentAddress} onChangeText={setPermanentAddress} multiline />
            <FormLabel c={c}>Correspondence Address</FormLabel>
            <FormInput c={c} placeholder="Enter Correspondence Address" value={correspondenceAddress} onChangeText={setCorrespondenceAddress} multiline />
            <FormLabel c={c}>Gender</FormLabel>
            <OptionRow c={c} accent={accent} options={['Male', 'Female', 'Other']} value={gender} onChange={setGender} />
            <FormLabel c={c}>Blood Group</FormLabel>
            <FormInput c={c} placeholder="e.g. O+, A+, B+" value={bloodGroup} onChangeText={setBloodGroup} autoCapitalize="characters" />
            <FormLabel c={c}>Marital Status</FormLabel>
            <OptionRow c={c} accent={accent} options={['Single', 'Married', 'Divorced', 'Widowed']} value={maritalStatus} onChange={setMaritalStatus} />
            <FormLabel c={c}>Date of Birth</FormLabel>
            <FormDateField
              c={c} accent={accent} value={dateOfBirth} onChange={setDateOfBirth}
              placeholder="Select Date of Birth (YYYY-MM-DD)" fallback={new Date(1995, 0, 1)} maximumDate={new Date()}
            />
            <FormLabel c={c}>Profile Photo URL</FormLabel>
            <FormInput c={c} placeholder="Enter Photo URL" value={profilePhotoUrl} onChangeText={setProfilePhotoUrl} autoCapitalize="none" />
          </View>
        );
      case 2:
        return (
          <View>
            {stepHeader('Official Details', 'Work location, department and role details.')}
            <FormLabel c={c}>Joined Date</FormLabel>
            <FormDateField c={c} accent={accent} value={dateOfJoining} onChange={setDateOfJoining} placeholder="Select Joined Date (YYYY-MM-DD)" fallback={new Date()} />
            <FormLabel c={c}>Department</FormLabel>
            <FormInput c={c} placeholder="Engineering, Sales, HR, etc." value={department} onChangeText={setDepartment} />
            <FormLabel c={c}>Designation</FormLabel>
            <FormInput c={c} placeholder="Developer, Manager, Designer, etc." value={designation} onChangeText={setDesignation} />
            <FormLabel c={c}>Work Location</FormLabel>
            <FormInput c={c} placeholder="e.g. Noida, Delhi" value={workLocation} onChangeText={setWorkLocation} />
            <FormLabel c={c}>Employee Type</FormLabel>
            <OptionRow c={c} accent={accent} options={['Full-Time', 'Part-Time', 'Contract', 'Intern']} value={employeeType} onChange={setEmployeeType} />
          </View>
        );
      case 3:
        return (
          <View>
            {stepHeader('KYC & Verification', 'Government identification details.')}
            <FormLabel c={c}>Aadhar Number</FormLabel>
            <FormInput c={c} placeholder="Enter 12-digit Aadhar Number" value={aadharNumber} onChangeText={setAadharNumber} keyboardType="number-pad" />
            <FormLabel c={c}>PAN Number</FormLabel>
            <FormInput c={c} placeholder="Enter 10-digit PAN" value={panNumber} onChangeText={setPanNumber} autoCapitalize="characters" />
            <FormLabel c={c}>Passport Number</FormLabel>
            <FormInput c={c} placeholder="Enter Passport Number" value={passportNumber} onChangeText={setPassportNumber} autoCapitalize="characters" />
          </View>
        );
      case 4:
        return (
          <View>
            {stepHeader('Bank & Emergency Details', 'Bank account info & emergency contact details.')}
            <FormLabel c={c}>Bank Name</FormLabel>
            <FormInput c={c} placeholder="Enter Bank Name" value={bankName} onChangeText={setBankName} />
            <FormLabel c={c}>Account Number</FormLabel>
            <FormInput c={c} placeholder="Enter Bank Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
            <FormLabel c={c}>IFSC Code</FormLabel>
            <FormInput c={c} placeholder="Enter IFSC Code" value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" />
            <FormLabel c={c}>Branch Name</FormLabel>
            <FormInput c={c} placeholder="Enter Branch Name" value={branchName} onChangeText={setBranchName} />

            <View style={{ marginTop: 18, paddingTop: 4, borderTopWidth: 1, borderTopColor: c.border }}>
              <FormLabel c={c} tint={accent}>Emergency Contact Name</FormLabel>
              <FormInput c={c} placeholder="Enter Emergency Contact Name" value={emergencyName} onChangeText={setEmergencyName} />
              <FormLabel c={c} tint={accent}>Emergency Contact Relation</FormLabel>
              <FormInput c={c} placeholder="e.g. Spouse, Parent, Sibling" value={emergencyRelation} onChangeText={setEmergencyRelation} />
              <FormLabel c={c} tint={accent}>Emergency Contact Number</FormLabel>
              <FormInput c={c} placeholder="Enter Emergency Contact Phone Number" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />
            </View>
          </View>
        );
      default: {
        const roleOptions = [{ v: 'Employee', l: 'Employee (Default)' }, { v: 'ADMIN', l: 'Administrator' }];
        if (systemRole && !roleOptions.some((r) => r.v === systemRole)) roleOptions.push({ v: systemRole, l: `Keep ${systemRole}` });
        return (
          <View>
            {stepHeader('System Role & Credentials', 'Establish access levels and login passwords.')}
            <FormLabel c={c}>System Role (Key Admin Only)</FormLabel>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {roleOptions.map((r) => {
                const active = systemRole === r.v;
                return (
                  <TouchableOpacity
                    key={r.v}
                    onPress={() => setSystemRole(r.v)}
                    style={{
                      flexGrow: 1, flexBasis: '45%', minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
                      backgroundColor: active ? accent : c.surfaceLight, borderWidth: 1, borderColor: active ? accent : c.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: active ? onAccent : c.text }}>{r.l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 8, lineHeight: 18 }}>
              Administrators have elevated access and use the default password <Text style={{ fontWeight: '800', color: c.text }}>Admin@123</Text>. Employees use <Text style={{ fontWeight: '800', color: c.text }}>Employee@123</Text>.
            </Text>

            {!isEditMode ? (
              <>
                <FormLabel c={c}>Custom Password (Optional)</FormLabel>
                <FormInput c={c} placeholder="Override default password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
              </>
            ) : (
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 10, lineHeight: 18 }}>
                To change this employee's login password, use Force Reset on their profile.
              </Text>
            )}

            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>Module Access</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.textMuted }}>{moduleAccess.length} selected</Text>
              </View>
              <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2, marginBottom: 10 }}>Select which sidebar modules this employee can access.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                {ALL_MODULES.map((mod) => {
                  const isChecked = moduleAccess.includes(mod);
                  return (
                    <View key={mod} style={{ width: '50%', padding: 4 }}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          if (isChecked) setModuleAccess(moduleAccess.filter((m) => m !== mod));
                          else setModuleAccess([...moduleAccess, mod]);
                        }}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 10, borderRadius: 12,
                          backgroundColor: isChecked ? accent + (isDark ? '22' : '14') : c.surfaceLight,
                          borderWidth: 1, borderColor: isChecked ? accent : c.border,
                        }}
                      >
                        <View
                          style={{
                            width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isChecked ? accent : 'transparent', borderWidth: 1.5, borderColor: isChecked ? accent : c.textMuted,
                          }}
                        >
                          {isChecked ? <Check size={13} color={onAccent} /> : null}
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: c.text }} numberOfLines={1}>{mod}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        );
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {selectedEmployee && !showAddForm ? renderDetail() : renderList()}

      <EmployeeFilterSheet
        c={c}
        accent={accent}
        visible={filterSheetOpen}
        initial={filters}
        departments={departments}
        onApply={(f) => { setFilterSheetOpen(false); applyFilters(f); }}
        onClose={() => setFilterSheetOpen(false)}
      />

      {/* Loading overlay while the full record is fetched before editing */}
      <Modal visible={preparingEdit} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 20 }}>
            <ActivityIndicator color={accent} size="large" />
          </View>
        </View>
      </Modal>

      {/* Multi-step Add/Edit Employee sheet */}
      <Modal visible={showAddForm} animationType="slide" transparent onRequestClose={() => setShowAddForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '94%' }}>
              <View style={{ alignItems: 'center', paddingTop: 10 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>Step {currentStep} of 5</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddForm(false)}
                  accessibilityLabel="Close form"
                  style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}
                >
                  <X size={18} color={c.text} />
                </TouchableOpacity>
              </View>

              {renderStepper()}

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                {renderFormStep()}
              </ScrollView>

              {/* Stepper navigation */}
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
                <TouchableOpacity
                  onPress={handlePreviousStep}
                  disabled={currentStep === 1}
                  style={{
                    flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, flexDirection: 'row', gap: 4,
                    alignItems: 'center', justifyContent: 'center', opacity: currentStep === 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronLeft size={18} color={c.text} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Previous</Text>
                </TouchableOpacity>

                {currentStep < 5 ? (
                  <TouchableOpacity
                    onPress={handleNextStep}
                    style={{ flex: 1.4, minHeight: 50, borderRadius: 14, backgroundColor: accent, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>Next</Text>
                    <ChevronRight size={18} color={onAccent} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleAddEmployee}
                    disabled={submitLoading}
                    style={{ flex: 1.4, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', opacity: submitLoading ? 0.7 : 1 }}
                  >
                    {submitLoading ? <ActivityIndicator color={onAccent} /> : (
                      <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>{isEditMode ? 'Save changes' : 'Submit'}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
