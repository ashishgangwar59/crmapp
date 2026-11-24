import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, Platform } from 'react-native';
import { Plus, Plane, CalendarDays, Check, X, CircleX, Users, Square, SquareCheck } from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, Card, Avatar, StatusPill, SearchBox, Palette } from '../../components/DashboardUI';
import { Pagination, usePagination } from '../../components/Pagination';
import { Chip, DateField, SheetSection } from '../investors/InvestorListUI';
import {
  ScreenTitle, PrimaryButton, FilterButton, QuickChips, AppliedFilters, AppliedFilter, SkeletonList, BigEmpty, BottomSheet,
  PAGE_SIZES, prettyDate, pickList, onAccent,
} from '../attendance/ui';

// ---------------- helpers ----------------

const LEAVE_COLORS: Record<string, string> = {
  Paid: '#10B981', Casual: '#F59E0B', Sick: '#3B82F6', Maternity: '#EC4899', Paternity: '#8B5CF6',
  CompOff: '#D6AF37', 'Comp Off': '#D6AF37', 'Loss of Pay': '#94A3B8', Earned: '#14B8A6',
};
const leaveColor = (t: string) => LEAVE_COLORS[t] || '#64748B';

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const;
const statusTone = (s?: string) =>
  (s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : s === 'Cancelled' ? 'muted' : 'warning') as 'success' | 'danger' | 'muted' | 'warning';

const dayKey = (v: any) => (v ? String(v).slice(0, 10) : '');
const leaveDays = (l: any) => {
  if (l.isHalfDay) return 0.5;
  const s = new Date(dayKey(l.startDate)).getTime();
  const e = new Date(dayKey(l.endDate)).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
};
const dateRange = (l: any) => {
  const s = dayKey(l.startDate);
  const e = dayKey(l.endDate);
  if (!s) return '—';
  if (!e || s === e) return prettyDate(s);
  return `${prettyDate(s, { day: 'numeric', month: 'short' })} – ${prettyDate(e)}`;
};
const empName = (e: any) => `${e?.firstName || 'Unknown'} ${e?.lastName || ''}`.trim();

interface LeaveFilters {
  status: string;
  type: string;
  duration: '' | 'full' | 'half';
  fromDate: string;
  toDate: string;
  limit: number;
}
const emptyFilters = (status = ''): LeaveFilters => ({ status, type: '', duration: '', fromDate: '', toDate: '', limit: 10 });
const sheetCount = (f: LeaveFilters) => [f.type, f.duration, f.fromDate || f.toDate].filter(Boolean).length;

const applyFilters = (list: any[], f: LeaveFilters, search: string, withEmployee: boolean) => {
  const q = search.trim().toLowerCase();
  return list.filter((l) => {
    if (f.status && l.status !== f.status) return false;
    if (f.type && l.leaveType !== f.type) return false;
    if (f.duration === 'half' && !l.isHalfDay) return false;
    if (f.duration === 'full' && l.isHalfDay) return false;
    // Leave overlaps the chosen window.
    if (f.fromDate && dayKey(l.endDate) < f.fromDate) return false;
    if (f.toDate && dayKey(l.startDate) > f.toDate) return false;
    if (q) {
      const e = l.employeeId || {};
      const hay = `${l.leaveType || ''} ${l.reason || ''} ${l.status || ''} ${withEmployee ? `${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''} ${e.department || ''}` : ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};

// ---------------- card ----------------

function LeaveCard({
  c, isDark, leave, showEmployee, onCancel, onApprove, onReject,
}: {
  c: Palette; isDark: boolean; leave: any; showEmployee: boolean;
  onCancel?: () => void; onApprove?: () => void; onReject?: () => void;
}) {
  const col = leaveColor(leave.leaveType);
  const days = leaveDays(leave);
  const e = leave.employeeId || {};
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {showEmployee ? (
          <Avatar name={empName(e)} size={42} />
        ) : (
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: col + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
            <Plane size={19} color={col} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }} numberOfLines={1}>
            {showEmployee ? empName(e) : `${leave.leaveType || 'Leave'} leave`}
          </Text>
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>
            {showEmployee ? [e.employeeCode, e.department].filter(Boolean).join(' · ') || '—' : `Applied ${prettyDate(leave.createdAt)}`}
          </Text>
        </View>
        <StatusPill label={leave.status || 'Pending'} tone={statusTone(leave.status)} />
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12, gap: 8 }}>
        <View style={{ flex: 1.6 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Dates</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: c.text, marginTop: 2 }} numberOfLines={1}>{dateRange(leave)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{showEmployee ? 'Type' : 'Duration'}</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: showEmployee ? col : c.text, marginTop: 2 }} numberOfLines={1}>
            {showEmployee ? leave.leaveType : leave.isHalfDay ? 'Half day' : `${days} day${days === 1 ? '' : 's'}`}
          </Text>
        </View>
        {showEmployee ? (
          <View style={{ flex: 0.8 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Duration</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: c.text, marginTop: 2 }}>{leave.isHalfDay ? 'Half' : `${days}d`}</Text>
          </View>
        ) : null}
      </View>

      {leave.reason ? (
        <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 10, lineHeight: 18 }} numberOfLines={3}>{leave.reason}</Text>
      ) : null}
      {leave.managerNotes ? (
        <Text style={{ fontSize: 12, color: c.text, marginTop: 6, fontStyle: 'italic' }} numberOfLines={2}>Note: {leave.managerNotes}</Text>
      ) : null}

      {onCancel || onApprove || onReject ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
          {onApprove ? (
            <TouchableOpacity onPress={onApprove} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 12, backgroundColor: c.success }}>
              <Check size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Approve</Text>
            </TouchableOpacity>
          ) : null}
          {onReject ? (
            <TouchableOpacity onPress={onReject} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 12, backgroundColor: c.danger + (isDark ? '26' : '14') }}>
              <X size={16} color={c.danger} />
              <Text style={{ color: c.danger, fontWeight: '800', fontSize: 14 }}>Reject</Text>
            </TouchableOpacity>
          ) : null}
          {onCancel ? (
            <TouchableOpacity onPress={onCancel} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 12, backgroundColor: c.danger + (isDark ? '26' : '14') }}>
              <CircleX size={16} color={c.danger} />
              <Text style={{ color: c.danger, fontWeight: '800', fontSize: 14 }}>Cancel request</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : showEmployee ? (
        <Text style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic', marginTop: 10 }}>Processed</Text>
      ) : null}
    </View>
  );
}

// ---------------- filter sheet ----------------

function LeaveFilterSheet({
  c, accent, visible, initial, types, onApply, onClose,
}: {
  c: Palette; accent: string; visible: boolean; initial: LeaveFilters; types: string[];
  onApply: (f: LeaveFilters) => void; onClose: () => void;
}) {
  const [f, setF] = useState(initial);
  useEffect(() => { if (visible) setF(initial); }, [visible]);
  const set = (p: Partial<LeaveFilters>) => setF((prev) => ({ ...prev, ...p }));
  return (
    <BottomSheet
      c={c}
      accent={accent}
      visible={visible}
      title="Filters"
      onClose={onClose}
      secondaryLabel="Reset"
      onSecondary={() => setF({ ...emptyFilters(f.status), limit: f.limit })}
      primaryLabel="Show results"
      onPrimary={() => onApply(f)}
    >
      <SheetSection c={c} title="STATUS">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip c={c} accent={accent} label="All statuses" active={!f.status} onPress={() => set({ status: '' })} />
          {STATUSES.map((s) => <Chip key={s} c={c} accent={accent} label={s} active={f.status === s} onPress={() => set({ status: s })} />)}
        </View>
      </SheetSection>
      <SheetSection c={c} title="LEAVE TYPE">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip c={c} accent={accent} label="All types" active={!f.type} onPress={() => set({ type: '' })} />
          {types.map((t) => <Chip key={t} c={c} accent={accent} label={t} active={f.type === t} onPress={() => set({ type: t })} />)}
        </View>
      </SheetSection>
      <SheetSection c={c} title="DURATION">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[{ v: '', l: 'Any' }, { v: 'full', l: 'Full day(s)' }, { v: 'half', l: 'Half day' }].map((o) => (
            <Chip key={o.v || 'any'} c={c} accent={accent} label={o.l} active={f.duration === o.v} onPress={() => set({ duration: o.v as LeaveFilters['duration'] })} />
          ))}
        </View>
      </SheetSection>
      <SheetSection c={c} title="LEAVE DATES">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <DateField c={c} label="From" value={f.fromDate} onChange={(v) => set({ fromDate: v })} />
          <DateField c={c} label="To" value={f.toDate} onChange={(v) => set({ toDate: v })} />
        </View>
      </SheetSection>
      <SheetSection c={c} title="RESULTS PER PAGE">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {PAGE_SIZES.map((n) => <Chip key={n} c={c} accent={accent} label={String(n)} active={f.limit === n} onPress={() => set({ limit: n })} />)}
        </View>
      </SheetSection>
    </BottomSheet>
  );
}

const describe = (f: LeaveFilters, setF: (f: LeaveFilters) => void): AppliedFilter[] => {
  const out: AppliedFilter[] = [];
  if (f.type) out.push({ key: 'type', label: f.type, onClear: () => setF({ ...f, type: '' }) });
  if (f.duration) out.push({ key: 'dur', label: f.duration === 'half' ? 'Half day' : 'Full day(s)', onClear: () => setF({ ...f, duration: '' }) });
  if (f.fromDate || f.toDate) {
    out.push({
      key: 'range',
      label: `${f.fromDate ? prettyDate(f.fromDate) : '…'} – ${f.toDate ? prettyDate(f.toDate) : '…'}`,
      onClear: () => setF({ ...f, fromDate: '', toDate: '' }),
    });
  }
  return out;
};

// ================= Screen =================

export const LeaveView = () => {
  const { c, isDark, accent } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const userRoleStr = (user?.role || '').toUpperCase();
  const isAdminOrKeyAdmin = userRoleStr === 'ADMIN' || userRoleStr === 'KEY_ADMIN' || userRoleStr === 'KEYADMIN';
  const scrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<'myLeaves' | 'teamApprovals'>('myLeaves');
  const [balances, setBalances] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // list state per tab
  const [mySearch, setMySearch] = useState('');
  const [myFilters, setMyFilters] = useState<LeaveFilters>(emptyFilters());
  const [teamSearch, setTeamSearch] = useState('');
  const [teamFilters, setTeamFilters] = useState<LeaveFilters>(emptyFilters('Pending'));
  const [sheetOpen, setSheetOpen] = useState(false);

  // Apply form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async (silent?: boolean) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const [balRes, leavesRes, teamRes] = await Promise.all([
        apiCall('/api/leave/balances'),
        apiCall('/api/leave'),
        apiCall('/api/leave/manager'),
      ]);

      if (balRes.success && balRes.data) {
        // API body is { success, data: { balances } }.
        setBalances(balRes.data?.data?.balances || balRes.data?.balances || null);
      }
      if (leavesRes.success && leavesRes.data) {
        setLeaves(pickList(leavesRes.data));
      }
      if (teamRes.success && teamRes.data) {
        setTeamLeaves(pickList(teamRes.data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
          },
        },
      ]
    );
  };

  const handleManagerAction = async (leaveId: string, action: 'Approve' | 'Reject') => {
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

  // ---- derived ----
  const isTeam = activeTab === 'teamApprovals' && isAdminOrKeyAdmin;
  const source = isTeam ? teamLeaves : leaves;
  const filters = isTeam ? teamFilters : myFilters;
  const setFilters = isTeam ? setTeamFilters : setMyFilters;
  const search = isTeam ? teamSearch : mySearch;
  const setSearch = isTeam ? setTeamSearch : setMySearch;

  const balanceTypes = Object.keys(balances || {});
  const applyTypes = balanceTypes.length ? [...balanceTypes, 'Loss of Pay'] : ['Paid', 'Casual', 'Sick', 'Loss of Pay'];
  const filterTypes = useMemo(
    () => Array.from(new Set([...balanceTypes, 'Loss of Pay', ...source.map((l) => l.leaveType).filter(Boolean)])),
    [balances, source]
  );

  const filtered = useMemo(() => applyFilters(source, filters, search, isTeam), [source, filters, search, isTeam]);
  const pager = usePagination(filtered, filters.limit, `${activeTab}|${search}|${JSON.stringify(filters)}`);
  const goToPage = (p: number) => { pager.setPage(p); scrollRef.current?.scrollTo({ y: 0, animated: true }); };

  const counts = useMemo(() => {
    const base = applyFilters(source, { ...filters, status: '' }, search, isTeam);
    const out: Record<string, number> = { '': base.length };
    STATUSES.forEach((s) => { out[s] = base.filter((l) => l.status === s).length; });
    return out;
  }, [source, filters, search, isTeam]);

  const teamPending = teamLeaves.filter((l) => l.status === 'Pending').length;
  const myPending = leaves.filter((l) => l.status === 'Pending').length;
  const totalBalance = balanceTypes.reduce((s, k) => s + (Number(balances?.[k]) || 0), 0);
  const applied = describe(filters, setFilters);

  // ensure the selected type exists in the options once balances arrive
  useEffect(() => {
    if (!applyTypes.includes(leaveType)) setLeaveType(applyTypes.includes('Casual') ? 'Casual' : applyTypes[0]);
  }, [balances]);

  const accentFg = onAccent(accent);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={accent} colors={[accent]} />}
      >
        <ScreenTitle
          c={c}
          title="Leave"
          subtitle={loading ? 'Loading…' : isTeam ? `${teamPending} pending approval${teamPending === 1 ? '' : 's'}` : `${totalBalance} days available · ${myPending} pending`}
          action={<PrimaryButton accent={accent} icon={Plus} label="Apply" onPress={() => setShowApplyModal(true)} />}
        />

        {/* Segmented tabs (admin / key admin only, like before) */}
        {isAdminOrKeyAdmin && (
          <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 4, marginBottom: 14 }}>
            {[
              { k: 'myLeaves' as const, l: 'My leaves' },
              { k: 'teamApprovals' as const, l: 'Team approvals', badge: teamPending },
            ].map((t) => {
              const active = activeTab === t.k;
              return (
                <TouchableOpacity
                  key={t.k}
                  onPress={() => { setActiveTab(t.k); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 11, backgroundColor: active ? c.surface : 'transparent' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: active ? c.text : c.textMuted }}>{t.l}</Text>
                  {t.badge ? (
                    <View style={{ minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: accentFg }}>{t.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Balances (my leaves only) */}
        {!isTeam && (
          <Card c={c} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.text, marginBottom: 12 }}>Leave balance</Text>
            {loading ? (
              <ActivityIndicator color={accent} />
            ) : balanceTypes.length === 0 ? (
              <Text style={{ fontSize: 13, color: c.textMuted }}>No leave balance available.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {balanceTypes.map((type) => {
                  const col = leaveColor(type);
                  return (
                    <View key={type} style={{ flexBasis: '30%', flexGrow: 1, backgroundColor: col + (isDark ? '1F' : '14'), borderRadius: 14, padding: 12 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: col }}>{String(balances[type] ?? 0)}</Text>
                      <Text style={{ fontSize: 12, color: c.textMuted }}>{type}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        )}

        <Text style={{ fontSize: 17, fontWeight: '800', color: c.text, marginBottom: 12 }}>
          {isTeam ? 'Team leave requests' : 'My leave history'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder={isTeam ? 'Employee, code, type or reason' : 'Type or reason'} />
          </View>
          <FilterButton c={c} accent={accent} count={sheetCount(filters)} onPress={() => setSheetOpen(true)} />
        </View>

        <QuickChips
          c={c}
          accent={accent}
          value={filters.status}
          options={[{ value: '', label: 'All' }, ...STATUSES.map((s) => ({ value: s as string, label: s }))].map((o) => ({ ...o, count: loading ? undefined : counts[o.value] }))}
          onChange={(v) => setFilters({ ...filters, status: v })}
        />
        <AppliedFilters c={c} items={applied} onClearAll={() => setFilters({ ...emptyFilters(filters.status), limit: filters.limit })} />

        {loading ? (
          <SkeletonList c={c} height={150} />
        ) : pager.pageItems.length === 0 ? (
          <BigEmpty
            c={c}
            icon={isTeam ? Users : CalendarDays}
            title={isTeam ? 'No team leave requests' : 'No leaves found'}
            text={search || applied.length || filters.status ? 'Try a different search or clear the filters.' : isTeam ? 'Nothing to review right now.' : 'Tap Apply to request time off.'}
          />
        ) : (
          pager.pageItems.map((leave: any, i: number) => {
            const isPending = leave.status === 'Pending';
            const isPast = new Date(leave.startDate) < new Date();
            return isTeam ? (
              <LeaveCard
                key={leave._id || i}
                c={c}
                isDark={isDark}
                leave={leave}
                showEmployee
                onApprove={isPending ? () => handleManagerAction(leave._id, 'Approve') : undefined}
                onReject={isPending ? () => handleManagerAction(leave._id, 'Reject') : undefined}
              />
            ) : (
              <LeaveCard
                key={leave._id || i}
                c={c}
                isDark={isDark}
                leave={leave}
                showEmployee={false}
                onCancel={isPending && !isPast ? () => handleCancelLeave(leave._id) : undefined}
              />
            );
          })
        )}

        {!loading && <Pagination c={c} accent={accent} {...pager} onChange={goToPage} />}
      </ScrollView>

      <LeaveFilterSheet
        c={c}
        accent={accent}
        visible={sheetOpen}
        initial={filters}
        types={filterTypes}
        onApply={(f) => { setSheetOpen(false); setFilters(f); }}
        onClose={() => setSheetOpen(false)}
      />

      {/* Apply Leave sheet */}
      <BottomSheet
        c={c}
        accent={accent}
        visible={showApplyModal}
        title="Request time off"
        onClose={() => setShowApplyModal(false)}
        secondaryLabel="Cancel"
        onSecondary={() => setShowApplyModal(false)}
        primaryLabel="Submit request"
        onPrimary={handleApplyLeave}
        primaryDisabled={submitLoading}
        primaryBusy={submitLoading ? <ActivityIndicator color={accentFg} /> : undefined}
      >
        <SheetSection c={c} title="LEAVE TYPE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {applyTypes.map((type) => (
              <Chip
                key={type}
                c={c}
                accent={accent}
                label={balances && balances[type] !== undefined ? `${type} · ${balances[type]} left` : type}
                active={leaveType === type}
                onPress={() => setLeaveType(type)}
              />
            ))}
          </View>
        </SheetSection>

        <SheetSection c={c} title="DATES">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <DateField c={c} label="Start date *" value={startDate} onChange={(v) => { setStartDate(v); if (!endDate || (v && endDate < v)) setEndDate(v); }} />
            <DateField c={c} label="End date *" value={endDate} onChange={setEndDate} />
          </View>
          <TouchableOpacity onPress={() => setIsHalfDay(!isHalfDay)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
            {isHalfDay ? <SquareCheck size={22} color={accent} /> : <Square size={22} color={c.textMuted} />}
            <Text style={{ fontSize: 14, color: c.text, fontWeight: '600' }}>Half day request</Text>
          </TouchableOpacity>
        </SheetSection>

        <SheetSection c={c} title="REASON *">
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Enter reason for leave..."
            placeholderTextColor={c.textMuted}
            multiline
            style={[
              { minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceLight, color: c.text, padding: 12, fontSize: 14, textAlignVertical: 'top' },
              Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            ]}
          />
        </SheetSection>
      </BottomSheet>
    </View>
  );
};

