// Payroll screen (admin ledger + salary structures, employee "My Payslips").
// Redesigned drop-in replacement for the old PayrollView in AppNavigator.tsx: same endpoints, same request bodies.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView, RefreshControl, Platform,
} from 'react-native';
import {
  Wallet, IndianRupee, CircleCheck, Hourglass, Users, Receipt, Settings, ListFilter, X, SquareCheck, Square,
  Banknote, Save, TrendingUp, TrendingDown,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import {
  useAppTheme, StatTile, Avatar, SearchBox, EmptyState, inr, inrShort, GOLD, BRAND_NAVY, Palette,
} from '../../components/DashboardUI';
import { Pagination, usePagination } from '../../components/Pagination';
import {
  PayrollFilters, EMPTY_PAYROLL_FILTERS, PayrollRow, PayrollStatusFilter, PayrollFilterSheet, PayrollEmployeeCard,
  PayslipCard, PayslipModal, MonthBar, MonthPickerSheet, compareRows, countPayrollSheetFilters,
  describePayrollFilters, empName, longMonth,
} from './PayrollUI';
import { downloadPayslipPdf, emailPayslip } from './payslipHtml';

const listFrom = (res: any): any[] =>
  Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];

const empIdOf = (s: any) =>
  typeof s?.employeeId === 'object' && s.employeeId !== null ? (s.employeeId._id || s.employeeId.id) : s?.employeeId;

const EMPTY_STRUCT = {
  basic: 0, hra: 0, travelAllowance: 0, incentive: 0, specialAllowance: 0, pf: 0, esi: 0, professionalTax: 0, incomeTax: 0,
};
type StructForm = typeof EMPTY_STRUCT;

const structFrom = (existing: any): StructForm => ({
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

function MoneyField({ c, label, value, onChange }: { c: Palette; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 6, fontWeight: '600' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 46, borderRadius: 12, paddingHorizontal: 12, backgroundColor: c.surfaceLight, borderWidth: 1, borderColor: c.border }}>
        <Text style={{ color: c.textMuted, fontSize: 14, marginRight: 6 }}>₹</Text>
        <TextInput
          style={[{ flex: 1, color: c.text, fontSize: 15, fontWeight: '600', paddingVertical: 10 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
          keyboardType="numeric"
          value={value === 0 ? '' : String(value)}
          placeholder="0"
          placeholderTextColor={c.textMuted}
          onChangeText={(val) => onChange(val === '' ? 0 : Number(val) || 0)}
        />
      </View>
    </View>
  );
}

export const PayrollView = () => {
  const { c, isDark, accent } = useAppTheme();
  const onAccent = accent === GOLD ? BRAND_NAVY : '#fff';
  const { user } = useAuthStore();
  const isEmployee = String(user?.role || '').toUpperCase().replace(/_/g, '') === 'EMPLOYEE';

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'structures'>('dashboard');
  // Employees see all their slips by default (like the web "My Payslips"); admins start on the current month.
  const [monthYear, setMonthYear] = useState(isEmployee ? '' : new Date().toISOString().slice(0, 7));
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Structures sub-tab state
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [structFormData, setStructFormData] = useState<StructForm>(EMPTY_STRUCT);
  const [saveLoading, setSaveLoading] = useState(false);
  const [structSearch, setStructSearch] = useState('');

  // Payslip detail modal
  const [selectedPayrollSlip, setSelectedPayrollSlip] = useState<any>(null);

  // Search / filters (client-side: /api/payroll only supports monthYear and returns the whole month)
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PayrollFilters>(EMPTY_PAYROLL_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const structScrollRef = useRef<ScrollView>(null);
  const structFormY = useRef(0);

  const slipsMode = isEmployee || !monthYear;

  // ---------------- Data ----------------

  const fetchPayrolls = async () => {
    try {
      const response = await apiCall(`/api/payroll?monthYear=${monthYear}`);
      if (response.success && response.data) {
        setPayrolls(listFrom(response));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployeesAndStructures = async () => {
    try {
      const [empRes, structRes] = await Promise.all([
        apiCall('/api/employees'),
        apiCall('/api/payroll/structure'),
      ]);

      let empList: any[] = [];
      if (empRes.success && empRes.data) {
        empList = listFrom(empRes);
        setEmployees(empList);
      }

      let structList: any[] = [];
      if (structRes.success && structRes.data) {
        structList = listFrom(structRes);
        setStructures(structList);
      }

      if (empList.length > 0) {
        const targetEmpId = selectedEmp || (empList[0]._id || empList[0].id);
        setSelectedEmp(targetEmpId);
        const existing = structList.find((s: any) => String(empIdOf(s)) === String(targetEmpId));
        if (existing) setStructFormData(structFrom(existing));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async (opts: { silent?: boolean } = {}) => {
    if (opts.silent) setRefreshing(true); else setLoading(true);
    // Employees only need their own slips; the employee list and structures are admin data.
    await Promise.all(isEmployee ? [fetchPayrolls()] : [fetchPayrolls(), fetchEmployeesAndStructures()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAllData();
    setSelectedPayrolls([]);
  }, [monthYear]);

  // ---------------- Actions (unchanged logic) ----------------

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
      setSelectedPayrolls(selectedPayrolls.filter((id) => id !== payrollId));
    } else {
      setSelectedPayrolls([...selectedPayrolls, payrollId]);
    }
  };

  const eligiblePayrolls = payrolls.filter((p) => p.status === 'Approved');
  const toggleAll = () => {
    if (selectedPayrolls.length === eligiblePayrolls.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(eligiblePayrolls.map((p) => p._id));
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
          },
        },
      ]
    );
  };

  const selectedTotal = payrolls
    .filter((p) => selectedPayrolls.includes(p._id))
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const handleSelectStructureEmp = (empId: string) => {
    setSelectedEmp(empId);
    const existing = structures.find((s) => String(empIdOf(s)) === String(empId));
    setStructFormData(existing ? structFrom(existing) : EMPTY_STRUCT);
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

  const openStructures = () => {
    setActiveSubTab('structures');
    if (!selectedEmp && employees.length > 0) {
      handleSelectStructureEmp(employees[0]._id || employees[0].id);
    }
  };

  // ---------------- Rows, filters, paging ----------------

  const rows: PayrollRow[] = useMemo(() => {
    if (slipsMode) {
      return payrolls.map((p, i) => ({ key: String(p._id || p.id || i), emp: p.employeeId || {}, payroll: p }));
    }
    return employees.map((emp, i) => {
      const empId = String(emp._id || emp.id || '');
      const empCode = emp.employeeCode;
      const payroll = payrolls.find((p) => {
        const pEmp = p.employeeId;
        if (!pEmp) return false;
        const pEmpId = typeof pEmp === 'object' ? String(pEmp._id || pEmp.id || '') : String(pEmp);
        const pEmpCode = typeof pEmp === 'object' ? pEmp.employeeCode : null;
        return pEmpId === empId || (empCode && pEmpCode && empCode === pEmpCode);
      }) || null;
      return { key: empId || String(i), emp, payroll };
    });
  }, [slipsMode, payrolls, employees]);

  const departments = useMemo(
    () => Array.from(new Set(rows.map((r) => r.emp?.department).filter(Boolean))).sort() as string[],
    [rows]
  );
  const empStatuses = useMemo(
    () => (slipsMode ? [] : (Array.from(new Set(rows.map((r) => r.emp?.status).filter(Boolean))).sort() as string[])),
    [rows, slipsMode]
  );

  // Search + sheet filters, before the status chip (so chip counts reflect the other filters).
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const e = r.emp || {};
      if (q && !`${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''}`.toLowerCase().includes(q)) return false;
      if (filters.department && e.department !== filters.department) return false;
      if (!slipsMode && filters.empStatus && e.status !== filters.empStatus) return false;
      return true;
    });
  }, [rows, search, filters.department, filters.empStatus, slipsMode]);

  const statusMatch = (r: PayrollRow, s: PayrollStatusFilter) =>
    !s ? true : s === 'NotGenerated' ? !r.payroll : (r.payroll?.status || (r.payroll ? 'Draft' : '')) === s;

  const visibleRows = useMemo(
    () => baseFiltered.filter((r) => statusMatch(r, filters.status)).sort((a, b) => compareRows(a, b, filters.sortBy, filters.sortDir)),
    [baseFiltered, filters.status, filters.sortBy, filters.sortDir]
  );

  const resetKey = `${monthYear}|${search}|${JSON.stringify(filters)}`;
  const paging = usePagination(visibleRows, filters.limit, resetKey);

  const goToPage = (p: number) => {
    paging.setPage(p);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const applyFilters = (f: PayrollFilters) => {
    setFilters(f);
    setFilterSheetOpen(false);
  };

  const changeMonth = (m: string) => {
    setMonthYear(m);
    setMonthPickerOpen(false);
    // Sort keys differ between the month view and the slip list; fall back to name when switching.
    const nextSlips = isEmployee || !m;
    if (nextSlips !== slipsMode) setFilters((f) => ({ ...f, sortBy: 'name', status: '', empStatus: '' }));
  };

  const statusChips: { value: PayrollStatusFilter; label: string }[] = [
    { value: '', label: 'All' },
    ...(!slipsMode ? [{ value: 'NotGenerated' as PayrollStatusFilter, label: 'Not generated' }] : []),
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Locked', label: 'Locked' },
  ];

  const sheetCount = countPayrollSheetFilters(filters);
  const appliedFilters = describePayrollFilters(filters, slipsMode);

  // ---------------- Summary (real data only) ----------------

  const sumNet = (list: any[]) => list.reduce((s, p) => s + (p.netSalary || 0), 0);
  const totalNet = sumNet(payrolls);
  const totalGross = payrolls.reduce((s, p) => s + (p.grossSalary || 0), 0);
  const paidList = payrolls.filter((p) => p.status === 'Paid');
  const approvedList = eligiblePayrolls;
  const pendingList = payrolls.filter((p) => p.status !== 'Paid');

  // ---------------- Render helpers ----------------

  const Skeleton = ({ h = 180 }: { h?: number }) => (
    <View style={{ paddingTop: 4 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ height: h, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, marginBottom: 12, opacity: 1 - i * 0.25 }} />
      ))}
    </View>
  );

  const Segmented = () => (
    <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 4, marginBottom: 14 }}>
      {([
        { key: 'dashboard', label: 'Ledger', icon: Receipt, onPress: () => setActiveSubTab('dashboard') },
        { key: 'structures', label: 'Structures', icon: Settings, onPress: openStructures },
      ] as const).map((t) => {
        const active = activeSubTab === t.key;
        const Icon = t.icon;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={t.onPress}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 11, backgroundColor: active ? c.surface : 'transparent', borderWidth: active ? 1 : 0, borderColor: c.border }}
          >
            <Icon size={15} color={active ? accent : c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: active ? c.text : c.textMuted }}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const titleText = isEmployee ? 'My Payslips' : activeSubTab === 'dashboard' ? 'Payroll' : 'Salary Structures';
  const subtitleText = isEmployee
    ? (loading ? 'Loading…' : `${payrolls.length} ${payrolls.length === 1 ? 'salary slip' : 'salary slips'}`)
    : activeSubTab === 'dashboard'
      ? (loading ? 'Loading…' : slipsMode
        ? `${payrolls.length} slips · all months`
        : `${payrolls.length} of ${employees.length} generated · ${longMonth(monthYear)}`)
      : 'Fixed earnings and deductions per employee';

  const Title = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>{titleText}</Text>
        <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{subtitleText}</Text>
      </View>
      {!isEmployee && activeSubTab === 'dashboard' && approvedList.length > 0 ? (
        <TouchableOpacity
          onPress={toggleAll}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 12, height: 40, borderRadius: 12 }}
          accessibilityLabel="Select all approved salaries"
        >
          {selectedPayrolls.length > 0 && selectedPayrolls.length === approvedList.length
            ? <SquareCheck size={16} color={onAccent} />
            : <Square size={16} color={onAccent} />}
          <Text style={{ color: onAccent, fontWeight: '800', fontSize: 13 }}>
            {selectedPayrolls.length > 0 && selectedPayrolls.length === approvedList.length ? 'Clear' : `Approved · ${approvedList.length}`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ---------------- Structures tab ----------------

  const structEmps = useMemo(() => {
    const q = structSearch.trim().toLowerCase();
    return employees.filter((e) => !q || `${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''}`.toLowerCase().includes(q));
  }, [employees, structSearch]);
  const structPaging = usePagination(structEmps, 8, structSearch);

  const renderStructures = () => {
    const activeEmp = employees.find((e) => String(e._id || e.id) === String(selectedEmp)) || employees[0];
    const activeEmpId = activeEmp ? (activeEmp._id || activeEmp.id) : null;
    const configuredCount = employees.filter((emp) => structures.some((s) => String(empIdOf(s)) === String(emp._id || emp.id))).length;
    const f = structFormData;
    const gross = f.basic + f.hra + f.travelAllowance + f.incentive + f.specialAllowance;
    const deductions = f.pf + f.esi + f.professionalTax + f.incomeTax;
    const setField = (k: keyof StructForm) => (n: number) => setStructFormData({ ...structFormData, [k]: n });

    return (
      <ScrollView
        ref={structScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAllData({ silent: true })} tintColor={accent} colors={[accent]} />}
      >
        <Title />
        <Segmented />

        {loading ? <Skeleton h={220} /> : employees.length === 0 ? (
          <EmptyState c={c} icon={Users} text="No employees found. Please add employees to configure salary structures." />
        ) : (
          <>
            {/* Employee picker */}
            <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>Employees ({employees.length})</Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>{configuredCount} configured</Text>
              </View>
              <SearchBox c={c} value={structSearch} onChange={setStructSearch} placeholder="Search employee name or code" />
              {structEmps.length === 0 ? (
                <EmptyState c={c} icon={Users} text="No employees match your search." />
              ) : (
                <View style={{ borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                  {structPaging.pageItems.map((emp, i) => {
                    const empId = emp._id || emp.id;
                    const hasStruct = structures.some((s) => String(empIdOf(s)) === String(empId) || String(empIdOf(s)) === String(emp._id));
                    const isSelected = String(activeEmpId) === String(empId) || String(activeEmpId) === String(emp._id);
                    return (
                      <TouchableOpacity
                        key={empId}
                        onPress={() => {
                          handleSelectStructureEmp(empId);
                          structScrollRef.current?.scrollTo({ y: Math.max(structFormY.current - 12, 0), animated: true });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border, backgroundColor: isSelected ? accent + (isDark ? '22' : '12') : 'transparent' }}
                      >
                        <Avatar name={empName(emp) || '?'} size={34} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: isSelected ? '800' : '600', color: isSelected ? accent : c.text }} numberOfLines={1}>{empName(emp)}</Text>
                          <Text style={{ fontSize: 12, color: c.textMuted }}>{emp.employeeCode || '—'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hasStruct ? c.success : c.danger }} />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: hasStruct ? c.success : c.danger }}>{hasStruct ? 'Set' : 'Not set'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              <Pagination c={c} accent={accent} page={structPaging.page} totalPages={structPaging.totalPages} from={structPaging.from} to={structPaging.to} total={structPaging.total} onChange={structPaging.setPage} />
            </View>

            {/* Form */}
            {activeEmpId ? (
              <View
                onLayout={(e) => { structFormY.current = e.nativeEvent.layout.y; }}
                style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Avatar name={empName(activeEmp) || '?'} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: '600' }}>Configure salary structure</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }} numberOfLines={1}>{empName(activeEmp)}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: accent }}>{activeEmp.employeeCode || '—'}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <TrendingUp size={15} color={c.success} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: c.success, letterSpacing: 0.8 }}>EARNINGS</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <MoneyField c={c} label="Basic Salary" value={f.basic} onChange={setField('basic')} />
                  <MoneyField c={c} label="HRA" value={f.hra} onChange={setField('hra')} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
                  <MoneyField c={c} label="Travel Allowance" value={f.travelAllowance} onChange={setField('travelAllowance')} />
                  <MoneyField c={c} label="Incentive" value={f.incentive} onChange={setField('incentive')} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <TrendingDown size={15} color={c.danger} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: c.danger, letterSpacing: 0.8 }}>FIXED DEDUCTIONS</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <MoneyField c={c} label="PF Amount" value={f.pf} onChange={setField('pf')} />
                  <MoneyField c={c} label="ESI Amount" value={f.esi} onChange={setField('esi')} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <MoneyField c={c} label="Professional Tax" value={f.professionalTax} onChange={setField('professionalTax')} />
                  <MoneyField c={c} label="Income Tax / TDS" value={f.incomeTax} onChange={setField('incomeTax')} />
                </View>

                <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Gross monthly salary</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: c.success, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>{inr(gross)}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Fixed deductions</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: c.danger, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>-{inr(deductions)}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => handleSelectStructureEmp(activeEmpId)}
                    style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveStructure}
                    disabled={saveLoading}
                    style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saveLoading ? 0.7 : 1 }}
                  >
                    {saveLoading ? <ActivityIndicator color={onAccent} /> : (
                      <>
                        <Save size={17} color={onAccent} />
                        <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>Save Structure</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    );
  };

  // ---------------- Ledger / payslips tab ----------------

  const renderLedger = () => (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: selectedPayrolls.length > 0 ? 130 : 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAllData({ silent: true })} tintColor={accent} colors={[accent]} />}
    >
      <Title />
      {!isEmployee && <Segmented />}

      <MonthBar c={c} accent={accent} monthYear={monthYear} allowAll onChange={changeMonth} onOpenPicker={() => setMonthPickerOpen(true)} />

      {/* Summary tiles */}
      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexGrow: 1, flexBasis: '45%', height: 116, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }} />
          ))}
        </View>
      ) : isEmployee ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <StatTile c={c} isDark={isDark} icon={Wallet} tint={c.success} label="Net salary received" value={inrShort(sumNet(paidList))} hint={`${paidList.length} paid`} />
          <StatTile c={c} isDark={isDark} icon={Receipt} tint={c.info} label="Salary slips" value={payrolls.length} hint={pendingList.length ? `${pendingList.length} not paid yet` : undefined} />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <StatTile c={c} isDark={isDark} icon={IndianRupee} tint={c.success} label="Total net generated" value={inrShort(totalNet)} hint={slipsMode ? `${payrolls.length} slips` : `${payrolls.length}/${employees.length} employees`} />
          <StatTile c={c} isDark={isDark} icon={Banknote} tint={c.info} label="Total gross" value={inrShort(totalGross)} />
          <StatTile c={c} isDark={isDark} icon={CircleCheck} tint={c.success} label="Paid" value={inrShort(sumNet(paidList))} hint={`${paidList.length} slips`} onPress={() => setFilters((p) => ({ ...p, status: 'Paid' }))} />
          <StatTile c={c} isDark={isDark} icon={Hourglass} tint={c.warning} label="Approved · awaiting pay" value={inrShort(sumNet(approvedList))} hint={`${approvedList.length} slips`} onPress={() => setFilters((p) => ({ ...p, status: 'Approved' }))} />
        </View>
      )}

      {/* Search + filters */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <SearchBox c={c} value={search} onChange={setSearch} placeholder="Search employee name or code" />
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
        {statusChips.map((o) => {
          const active = filters.status === o.value;
          const count = baseFiltered.filter((r) => statusMatch(r, o.value)).length;
          return (
            <TouchableOpacity
              key={o.value || 'all'}
              onPress={() => setFilters((p) => ({ ...p, status: o.value }))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? accent : c.surface, borderWidth: 1, borderColor: active ? accent : c.border }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? onAccent : c.textMuted }}>{o.label}</Text>
              {!loading ? <Text style={{ fontSize: 12, fontWeight: '700', color: active ? onAccent : c.textMuted, opacity: 0.8 }}>{count}</Text> : null}
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
              onPress={() => setFilters({ ...filters, ...a.clear })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: c.surfaceLight }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{a.label}</Text>
              <X size={13} color={c.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setFilters({ ...EMPTY_PAYROLL_FILTERS, status: filters.status, limit: filters.limit })} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.danger }}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : visibleRows.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
            {slipsMode ? <Receipt size={24} color={c.textMuted} /> : <Users size={24} color={c.textMuted} />}
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
            {rows.length === 0 ? (slipsMode ? 'No salary slips found' : 'No employee records found') : 'No matches'}
          </Text>
          <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center' }}>
            {rows.length === 0
              ? (slipsMode ? 'Salary slips will appear here once payroll is generated.' : 'Add employees to start running payroll.')
              : 'Try a different search or clear the filters.'}
          </Text>
        </View>
      ) : slipsMode ? (
        paging.pageItems.map((r) => (
          <PayslipCard
            key={r.key}
            c={c}
            isDark={isDark}
            accent={accent}
            payroll={r.payroll}
            showEmployee={!isEmployee}
            selectable={!isEmployee}
            selected={selectedPayrolls.includes(r.payroll._id)}
            onToggle={() => toggleSelection(r.payroll._id)}
            onView={() => setSelectedPayrollSlip(r.payroll)}
          />
        ))
      ) : (
        paging.pageItems.map((r) => (
          <PayrollEmployeeCard
            key={r.key}
            c={c}
            isDark={isDark}
            accent={accent}
            row={r}
            selected={!!r.payroll && selectedPayrolls.includes(r.payroll._id || r.payroll.id)}
            generating={generating}
            onToggle={() => r.payroll && toggleSelection(r.payroll._id)}
            onView={() => setSelectedPayrollSlip(r.payroll)}
            onGenerate={() => handleGenerate(r.emp._id || r.emp.id)}
          />
        ))
      )}

      {!loading && (
        <View style={{ marginTop: -4 }}>
          <Pagination c={c} accent={accent} page={paging.page} totalPages={paging.totalPages} from={paging.from} to={paging.to} total={paging.total} onChange={goToPage} />
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {activeSubTab === 'structures' && !isEmployee ? renderStructures() : renderLedger()}

      {/* Floating bulk payment bar */}
      {selectedPayrolls.length > 0 && activeSubTab === 'dashboard' && !isEmployee && (
        <View
          style={{
            position: 'absolute', left: 16, right: 16, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 12,
            shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: '600' }}>Selected ({selectedPayrolls.length})</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: c.text }} numberOfLines={1} adjustsFontSizeToFit>{inr(selectedTotal)}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedPayrolls([])} accessibilityLabel="Clear selection" style={{ width: 40, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
            <X size={18} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBulkPayment}
            disabled={processingBulk}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: accent, opacity: processingBulk ? 0.7 : 1 }}
          >
            {processingBulk ? <ActivityIndicator color={onAccent} /> : (
              <>
                <Banknote size={16} color={onAccent} />
                <Text style={{ color: onAccent, fontWeight: '800', fontSize: 14 }}>Process Transfer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <PayrollFilterSheet
        c={c}
        accent={accent}
        visible={filterSheetOpen}
        initial={filters}
        slipsMode={slipsMode}
        departments={departments}
        empStatuses={empStatuses}
        onApply={applyFilters}
        onClose={() => setFilterSheetOpen(false)}
      />

      <MonthPickerSheet
        c={c}
        accent={accent}
        visible={monthPickerOpen}
        value={monthYear}
        allowAll
        onSelect={changeMonth}
        onClose={() => setMonthPickerOpen(false)}
      />

      <PayslipModal
        c={c}
        isDark={isDark}
        accent={accent}
        slip={selectedPayrollSlip}
        onClose={() => setSelectedPayrollSlip(null)}
        onPdf={() => downloadPayslipPdf(selectedPayrollSlip)}
        onEmail={() => emailPayslip(selectedPayrollSlip)}
      />
    </View>
  );
};
