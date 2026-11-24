import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Clock, LogIn, LogOut, UserCheck, UserX, Users, CircleAlert, CircleCheck, Timer, CalendarDays,
  ChevronLeft, ChevronRight, CalendarCheck, Hourglass,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, Card, SectionHeader, StatTile, Avatar, StatusPill, SearchBox, BRAND_NAVY, GOLD, Palette } from '../../components/DashboardUI';
import { Pagination, usePagination } from '../../components/Pagination';
import { Chip, DateField, SheetSection } from '../investors/InvestorListUI';
import {
  ScreenTitle, FilterButton, QuickChips, AppliedFilters, AppliedFilter, SkeletonList, BigEmpty, BottomSheet, Fact,
  PAGE_SIZES, ymd, prettyDate, prettyMonth, shiftMonth, pickList, onAccent,
} from './ui';

// ---------------- helpers ----------------

const formatPunchTime = (punchVal: any) => {
  if (!punchVal) return '—';
  if (typeof punchVal === 'string') {
    if (punchVal.includes(':') && !punchVal.includes('T')) return punchVal;
    const d = new Date(punchVal);
    return isNaN(d.getTime()) ? punchVal : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (punchVal.time) {
    const d = new Date(punchVal.time);
    return isNaN(d.getTime()) ? String(punchVal.time) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return '—';
};

const punchInOf = (r: any) => r?.punchIn || r?.inTime || r?.punchInTime;
const punchOutOf = (r: any) => r?.punchOut || r?.outTime || r?.punchOutTime;
const isLateRec = (r: any) => !!(r?.metrics?.isLate || r?.isLate || r?.status === 'Late');
const hoursOf = (r: any) => Number(r?.metrics?.workingHours || r?.workingHours || 0);
const formatHours = (h: number) => {
  if (!h) return '—';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm ? `${hh}h ${mm}m` : `${hh}h`;
};

type StatusKey = '' | 'Present' | 'Late' | 'Absent' | 'Half-Day' | 'Leave' | 'Holiday';

/** Status matching shared by the quick chips, the sheet and the stat tiles. */
const matchesStatus = (r: any, s: StatusKey) => {
  if (!s) return true;
  if (s === 'Late') return isLateRec(r);
  if (s === 'Present') return r.status === 'Present' || (!!punchInOf(r) && r.status !== 'Half-Day' && r.status !== 'Leave');
  if (s === 'Absent') return r.status === 'Absent' && !punchInOf(r);
  return r.status === s;
};

const statusTone = (label: string) =>
  (label === 'Present' || label === 'Punched in' ? 'success'
    : label === 'Half-Day' ? 'warning'
      : label === 'Leave' || label === 'Holiday' ? 'info'
        : 'danger') as 'success' | 'warning' | 'info' | 'danger';

const displayStatus = (r: any) => {
  if (punchInOf(r) && !punchOutOf(r)) return 'Punched in';
  return r.status || (punchInOf(r) ? 'Present' : 'Absent');
};

const empName = (emp: any) => (emp?.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Unknown Employee');

/** Isolated so the per-second tick doesn't re-render the whole screen. */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <View>
      <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: 0.5 }}>
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
        {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>
    </View>
  );
}

function AttendanceRowCard({ c, record, showEmployee }: { c: Palette; record: any; showEmployee: boolean }) {
  const emp = record.employeeId || {};
  const label = displayStatus(record);
  const late = isLateRec(record);
  const name = empName(emp);
  const dept = emp.department || emp.designation || '';
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {showEmployee ? (
          <Avatar name={name} size={42} />
        ) : (
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>{record.date ? String(record.date).slice(8, 10) : '—'}</Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: c.textMuted }}>
              {record.date ? prettyDate(String(record.date).slice(0, 10), { weekday: 'short' }).toUpperCase() : ''}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }} numberOfLines={1}>
            {showEmployee ? name : prettyDate(record.date ? String(record.date).slice(0, 10) : '', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          {showEmployee ? (
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>
              {[emp.employeeCode, dept].filter(Boolean).join(' · ') || '—'}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <StatusPill label={label} tone={statusTone(label)} />
          {late ? <StatusPill label="Late" tone="warning" /> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
        <Fact c={c} label="Punch in" value={formatPunchTime(punchInOf(record))} tint={punchInOf(record) ? c.success : undefined} />
        <Fact c={c} label="Punch out" value={formatPunchTime(punchOutOf(record))} />
        <Fact c={c} label="Hours" value={formatHours(hoursOf(record))} />
      </View>
    </View>
  );
}

const STATUS_CHIPS: { value: StatusKey; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'Present', label: 'Present' },
  { value: 'Late', label: 'Late' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Half-Day', label: 'Half-Day' },
  { value: 'Leave', label: 'Leave' },
];

// ================= Manager / Admin: all employees for a date =================

interface MgrFilters { status: StatusKey; department: string; limit: number }
const EMPTY_MGR: MgrFilters = { status: '', department: '', limit: 20 };

function ManagerAttendance() {
  const { c, isDark, accent } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MgrFilters>(EMPTY_MGR);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<MgrFilters & { date: string }>({ ...EMPTY_MGR, date: selectedDate });

  const fetchManagerAttendance = async (dateStr: string, silent?: boolean) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const res: any = await apiCall(`/api/attendance/manager?date=${dateStr}`);
      if (res.success && res.data) {
        setRecords(pickList(res.data));
        setError('');
      } else {
        setError(res.error || 'Could not load attendance.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchManagerAttendance(selectedDate); }, [selectedDate]);

  const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Half-Day' || r.punchIn).length;
  const absentCount = records.filter((r) => r.status === 'Absent' && !r.punchIn).length;
  const lateCount = records.filter((r) => r.metrics?.isLate || r.isLate || r.status === 'Late').length;

  const departments = useMemo(
    () => Array.from(new Set(records.map((r) => r.employeeId?.department).filter(Boolean))).sort() as string[],
    [records]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const e = r.employeeId || {};
      if (q && !`${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''} ${e.department || ''} ${e.designation || ''} ${e.email || ''}`.toLowerCase().includes(q)) return false;
      if (filters.department && e.department !== filters.department) return false;
      return matchesStatus(r, filters.status);
    });
  }, [records, search, filters]);

  const statusCounts = useMemo(() => {
    const out: Record<string, number> = {};
    STATUS_CHIPS.forEach((s) => { out[s.value] = records.filter((r) => matchesStatus(r, s.value)).length; });
    return out;
  }, [records]);

  const pager = usePagination(filtered, filters.limit, `${search}|${filters.status}|${filters.department}|${selectedDate}`);
  const goToPage = (p: number) => { pager.setPage(p); scrollRef.current?.scrollTo({ y: 0, animated: true }); };

  const todayStr = new Date().toISOString().slice(0, 10);
  const shiftDay = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = ymd(new Date(y, m - 1, d + delta));
    if (next > todayStr) return;
    setSelectedDate(next);
  };

  const applied: AppliedFilter[] = [];
  if (selectedDate !== todayStr) applied.push({ key: 'date', label: prettyDate(selectedDate), onClear: () => setSelectedDate(todayStr) });
  if (filters.department) applied.push({ key: 'dept', label: filters.department, onClear: () => setFilters({ ...filters, department: '' }) });
  const sheetCount = [selectedDate !== todayStr, filters.department].filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchManagerAttendance(selectedDate, true)} tintColor={accent} colors={[accent]} />}
      >
        <ScreenTitle
          c={c}
          title="Attendance"
          subtitle={loading ? 'Loading…' : `${records.length} employees · ${prettyDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' })}`}
        />

        {/* Date bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 6, marginBottom: 14 }}>
          <TouchableOpacity onPress={() => shiftDay(-1)} accessibilityLabel="Previous day" style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
            <ChevronLeft size={18} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (Platform.OS === 'web' ? (setDraft({ ...filters, date: selectedDate }), setSheetOpen(true)) : setShowPicker(true))}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <CalendarDays size={16} color={accent} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>
              {selectedDate === todayStr ? 'Today' : prettyDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => shiftDay(1)}
            disabled={selectedDate >= todayStr}
            accessibilityLabel="Next day"
            style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight, opacity: selectedDate >= todayStr ? 0.4 : 1 }}
          >
            <ChevronRight size={18} color={c.text} />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker
            value={new Date(`${selectedDate}T00:00:00`)}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(e: any, d?: Date) => {
              setShowPicker(false);
              if (e?.type !== 'dismissed' && d) setSelectedDate(ymd(d));
            }}
          />
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <StatTile c={c} isDark={isDark} icon={Users} tint="#3B82F6" label="Total" value={records.length} onPress={() => setFilters({ ...filters, status: '' })} />
          <StatTile c={c} isDark={isDark} icon={UserCheck} tint="#10B981" label="Present" value={presentCount} onPress={() => setFilters({ ...filters, status: 'Present' })} />
          <StatTile c={c} isDark={isDark} icon={UserX} tint="#EF4444" label="Absent" value={absentCount} onPress={() => setFilters({ ...filters, status: 'Absent' })} />
          <StatTile c={c} isDark={isDark} icon={Timer} tint="#F59E0B" label="Late" value={lateCount} onPress={() => setFilters({ ...filters, status: 'Late' })} />
        </View>

        {/* Search + filters */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Name, code or department" />
          </View>
          <FilterButton c={c} accent={accent} count={sheetCount} onPress={() => { setDraft({ ...filters, date: selectedDate }); setSheetOpen(true); }} />
        </View>

        <QuickChips
          c={c}
          accent={accent}
          value={filters.status}
          options={STATUS_CHIPS.map((s) => ({ ...s, count: loading ? undefined : statusCounts[s.value] }))}
          onChange={(v) => setFilters({ ...filters, status: v })}
        />
        <AppliedFilters c={c} items={applied} onClearAll={() => { setSelectedDate(todayStr); setFilters({ ...EMPTY_MGR, status: filters.status, limit: filters.limit }); }} />

        {error ? (
          <Card c={c} style={{ marginBottom: 12, borderColor: 'rgba(239,68,68,0.3)' }}>
            <Text style={{ color: c.danger, fontSize: 13 }}>{error} Pull down to retry.</Text>
          </Card>
        ) : null}

        {loading ? (
          <SkeletonList c={c} height={130} />
        ) : pager.pageItems.length === 0 ? (
          <BigEmpty
            c={c}
            icon={Users}
            title="No employee records found"
            text={search || filters.status || filters.department ? 'Try a different search or clear the filters.' : 'No attendance for this date yet.'}
          />
        ) : (
          pager.pageItems.map((r: any, i: number) => <AttendanceRowCard key={r._id || i} c={c} record={r} showEmployee />)
        )}

        {!loading && <Pagination c={c} accent={accent} {...pager} onChange={goToPage} />}
      </ScrollView>

      <BottomSheet
        c={c}
        accent={accent}
        visible={sheetOpen}
        title="Filters"
        onClose={() => setSheetOpen(false)}
        secondaryLabel="Reset"
        onSecondary={() => setDraft({ ...EMPTY_MGR, status: draft.status, limit: draft.limit, date: todayStr })}
        primaryLabel="Show results"
        onPrimary={() => {
          setSheetOpen(false);
          const { date, ...rest } = draft;
          setFilters(rest);
          if (date && date !== selectedDate) setSelectedDate(date > todayStr ? todayStr : date);
        }}
      >
        <SheetSection c={c} title="DATE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[{ l: 'Today', d: 0 }, { l: 'Yesterday', d: -1 }, { l: '2 days ago', d: -2 }].map((o) => {
              const v = ymd(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + o.d));
              return <Chip key={o.l} c={c} accent={accent} label={o.l} active={draft.date === v} onPress={() => setDraft({ ...draft, date: v })} />;
            })}
          </View>
          <DateField c={c} label="Specific date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v || todayStr })} />
        </SheetSection>

        <SheetSection c={c} title="STATUS">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {STATUS_CHIPS.map((s) => (
              <Chip key={s.value || 'all'} c={c} accent={accent} label={s.value ? s.label : 'All statuses'} active={draft.status === s.value} onPress={() => setDraft({ ...draft, status: s.value })} />
            ))}
          </View>
        </SheetSection>

        {departments.length > 0 && (
          <SheetSection c={c} title="DEPARTMENT">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip c={c} accent={accent} label="All departments" active={!draft.department} onPress={() => setDraft({ ...draft, department: '' })} />
              {departments.map((d) => (
                <Chip key={d} c={c} accent={accent} label={d} active={draft.department === d} onPress={() => setDraft({ ...draft, department: d })} />
              ))}
            </View>
          </SheetSection>
        )}

        <SheetSection c={c} title="RESULTS PER PAGE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {PAGE_SIZES.map((n) => (
              <Chip key={n} c={c} accent={accent} label={String(n)} active={draft.limit === n} onPress={() => setDraft({ ...draft, limit: n })} />
            ))}
          </View>
        </SheetSection>
      </BottomSheet>
    </View>
  );
}

// ================= Employee: punch + monthly history =================

function EmployeeAttendance() {
  const { c, isDark, accent } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [punching, setPunching] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [month, setMonth] = useState(thisMonth);
  const [monthLoading, setMonthLoading] = useState(false);
  const [status, setStatus] = useState<StatusKey>('');
  const [limit, setLimit] = useState(10);

  const fetchStatus = async () => {
    try {
      const res: any = await apiCall('/api/attendance/today');
      if (res.success && res.data) {
        setTodayStatus(res.data.record || res.data.data || res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMonthly = async (m: string = month) => {
    setMonthLoading(true);
    try {
      const res: any = await apiCall(`/api/attendance/monthly?month=${m}`);
      if (res.success && res.data) {
        setMonthlyRecords(pickList(res.data));
      } else {
        setMonthlyRecords([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setMonthLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);
  useEffect(() => { fetchMonthly(month); }, [month]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchMonthly(month)]);
    setRefreshing(false);
  };

  // Same request as before: action + the fixed coordinates the app has always sent.
  const handlePunch = async (action: 'IN' | 'OUT') => {
    setPunching(true);
    try {
      const res = await apiCall('/api/attendance/punch', {
        method: 'POST',
        body: JSON.stringify({
          action,
          latitude: 28.5355,
          longitude: 77.3910,
        }),
      });

      if (res.success) {
        Alert.alert('Success', `Punched ${action} successfully!`);
        fetchStatus();
        if (month === thisMonth) fetchMonthly(month); else setMonth(thisMonth);
      } else {
        Alert.alert('Error', res.error || 'Failed to record punch.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error while punching in/out');
    } finally {
      setPunching(false);
    }
  };

  const hasPunchedIn = !!(
    todayStatus?.punchIn ||
    todayStatus?.inTime ||
    todayStatus?.punchInTime ||
    (todayStatus?.status && todayStatus?.status !== 'Absent') ||
    todayStatus?.hasPunchedIn
  );
  const hasPunchedOut = !!(
    todayStatus?.punchOut ||
    todayStatus?.outTime ||
    todayStatus?.punchOutTime ||
    todayStatus?.hasPunchedOut
  );
  const lateToday = isLateRec(todayStatus);

  const sorted = useMemo(
    () => [...monthlyRecords].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    [monthlyRecords]
  );
  const filtered = useMemo(() => sorted.filter((r) => matchesStatus(r, status)), [sorted, status]);
  const pager = usePagination(filtered, limit, `${status}|${month}`);
  const goToPage = (p: number) => { pager.setPage(p); scrollRef.current?.scrollTo({ y: 0, animated: true }); };

  const presentDays = monthlyRecords.filter((r) => matchesStatus(r, 'Present')).length;
  const lateDays = monthlyRecords.filter(isLateRec).length;
  const halfDays = monthlyRecords.filter((r) => r.status === 'Half-Day').length;
  const totalHours = monthlyRecords.reduce((s, r) => s + hoursOf(r), 0);
  const worked = monthlyRecords.filter((r) => hoursOf(r) > 0).length;

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    STATUS_CHIPS.forEach((s) => { out[s.value] = monthlyRecords.filter((r) => matchesStatus(r, s.value)).length; });
    return out;
  }, [monthlyRecords]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, gap: 10 }}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={{ color: c.textMuted, fontSize: 13 }}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={accent} colors={[accent]} />}
    >
      <ScreenTitle c={c} title="Attendance" subtitle="Track your daily punches and monthly history." />

      {/* Hero / action centre */}
      <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -90, borderWidth: 24, borderColor: 'rgba(214,175,55,0.10)' }} />
        <LiveClock />

        <View style={{ flexDirection: 'row', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
          {[
            { l: 'Punch in', v: formatPunchTime(punchInOf(todayStatus)) },
            { l: 'Punch out', v: formatPunchTime(punchOutOf(todayStatus)) },
            { l: 'Hours', v: formatHours(hoursOf(todayStatus)) },
          ].map((f) => (
            <View key={f.l} style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' }}>{f.l}</Text>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 2 }}>{f.v}</Text>
            </View>
          ))}
        </View>

        {lateToday && hasPunchedIn ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(245,158,11,0.16)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <CircleAlert size={15} color="#FBBF24" />
            <Text style={{ color: '#FBBF24', fontSize: 13, fontWeight: '700' }}>You were marked Late today.</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 16 }}>
          {!hasPunchedIn && (
            <TouchableOpacity
              onPress={() => handlePunch('IN')}
              disabled={punching}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16, backgroundColor: GOLD, opacity: punching ? 0.7 : 1 }}
            >
              {punching ? <ActivityIndicator color={BRAND_NAVY} /> : (
                <>
                  <LogIn size={19} color={BRAND_NAVY} />
                  <Text style={{ color: BRAND_NAVY, fontSize: 16, fontWeight: '800' }}>Punch In</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {hasPunchedIn && !hasPunchedOut && (
            <TouchableOpacity
              onPress={() => handlePunch('OUT')}
              disabled={punching}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16, backgroundColor: '#EF4444', opacity: punching ? 0.7 : 1 }}
            >
              {punching ? <ActivityIndicator color="#fff" /> : (
                <>
                  <LogOut size={19} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Punch Out</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {hasPunchedIn && hasPunchedOut && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.16)' }}>
              <CircleCheck size={19} color="#34D399" />
              <Text style={{ color: '#34D399', fontSize: 16, fontWeight: '800' }}>Shift Completed</Text>
            </View>
          )}
        </View>
      </View>

      {/* Month switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>Monthly history</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity onPress={() => setMonth(shiftMonth(month, -1))} accessibilityLabel="Previous month" style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
            <ChevronLeft size={16} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, minWidth: 110, textAlign: 'center' }}>{prettyMonth(month)}</Text>
          <TouchableOpacity
            onPress={() => setMonth(shiftMonth(month, 1))}
            disabled={month >= thisMonth}
            accessibilityLabel="Next month"
            style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight, opacity: month >= thisMonth ? 0.4 : 1 }}
          >
            <ChevronRight size={16} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <StatTile c={c} isDark={isDark} icon={CalendarCheck} tint="#10B981" label="Days present" value={presentDays} onPress={() => setStatus('Present')} />
        <StatTile c={c} isDark={isDark} icon={Timer} tint="#F59E0B" label="Late arrivals" value={lateDays} onPress={() => setStatus('Late')} />
        <StatTile c={c} isDark={isDark} icon={Hourglass} tint="#8B5CF6" label="Half days" value={halfDays} onPress={() => setStatus('Half-Day')} />
        <StatTile c={c} isDark={isDark} icon={Clock} tint="#3B82F6" label="Hours worked" value={formatHours(Number(totalHours.toFixed(2)))} hint={worked ? `Avg ${formatHours(Number((totalHours / worked).toFixed(2)))}/day` : undefined} />
      </View>

      <QuickChips
        c={c}
        accent={accent}
        value={status}
        options={STATUS_CHIPS.map((s) => ({ ...s, count: counts[s.value] }))}
        onChange={setStatus}
      />

      {monthLoading ? (
        <SkeletonList c={c} height={120} />
      ) : pager.pageItems.length === 0 ? (
        <BigEmpty
          c={c}
          icon={CalendarDays}
          title="No records"
          text={status ? 'No days match this filter.' : 'No attendance records found for this month.'}
        />
      ) : (
        pager.pageItems.map((r: any, i: number) => <AttendanceRowCard key={r._id || r.id || i} c={c} record={r} showEmployee={false} />)
      )}

      {!monthLoading && filtered.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: c.textMuted }}>Per page</Text>
          {[10, 20, 31].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setLimit(n)}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: limit === n ? accent : c.surfaceLight }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: limit === n ? onAccent(accent) : c.textMuted }}>{n === 31 ? 'All' : n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!monthLoading && <Pagination c={c} accent={accent} {...pager} onChange={goToPage} />}
    </ScrollView>
  );
}

// ================= Entry =================

export const AttendanceView = () => {
  const { user } = useAuthStore();
  const userRole = (user?.role || '').toUpperCase().replace('_', '');
  const isAdmin = userRole === 'ADMIN' || userRole === 'KEYADMIN' || userRole === 'MANAGER';
  return isAdmin ? <ManagerAttendance /> : <EmployeeAttendance />;
};
