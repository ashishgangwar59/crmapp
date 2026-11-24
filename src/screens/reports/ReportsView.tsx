import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import {
  Clock, CalendarDays, IndianRupee, Wallet, Users, Building2, Target, ChevronLeft, ChevronRight,
  FileSpreadsheet, FileText, ChartColumn, Sparkles, SearchX,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, Card, SearchBox, inr, Palette } from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';
import {
  onAccent, ym, prettyMonth, QuickChips, ListSkeleton, BigEmpty, PAGE_SIZES, exportTablePdf, exportTableCsv,
} from './shared';

// Same report types and request as CRM web: dashboard/reports/page.tsx → GET /api/reports/generator
const REPORT_TYPES: { value: string; label: string; icon: any; tint: string; dated: boolean }[] = [
  { value: 'Attendance', label: 'Attendance', icon: Clock, tint: '#10B981', dated: true },
  { value: 'Leave', label: 'Leave', icon: CalendarDays, tint: '#F59E0B', dated: true },
  { value: 'Salary', label: 'Salary', icon: IndianRupee, tint: '#8B5CF6', dated: true },
  { value: 'Wallet', label: 'Wallet', icon: Wallet, tint: '#D6AF37', dated: true },
  { value: 'Employee', label: 'Employee', icon: Users, tint: '#3B82F6', dated: false },
  { value: 'Department', label: 'Department', icon: Building2, tint: '#14B8A6', dated: false },
  { value: 'Lead', label: 'Lead', icon: Target, tint: '#EC4899', dated: true },
];
// The API answers 403 for these when the caller is an Employee.
const ADMIN_ONLY = ['Wallet', 'Employee', 'Department'];

const PIE = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#06B6D4'];
const MONEY_KEYS = ['Gross', 'Deductions', 'Net', 'Amount'];
const HIDDEN_KEYS = ['PayrollId']; // internal id (web renders it as a "View Slip" link)

// Which column each report's summary buckets come from, so a summary tile can filter the rows.
const SUMMARY_COLUMN: Record<string, string> = {
  Attendance: 'Status', Leave: 'Status', Salary: 'Status', Wallet: 'Type', Employee: 'Department', Department: 'Department', Lead: 'Status',
};

const statusTint = (v: string, c: Palette) => {
  const s = String(v || '').toLowerCase();
  if (['present', 'approved', 'paid', 'credit', 'closed won', 'won'].includes(s)) return c.success;
  if (['absent', 'rejected', 'debit', 'closed lost', 'lost'].includes(s)) return c.danger;
  if (['late', 'pending', 'halfday', 'draft', 'locked'].includes(s)) return c.warning;
  return c.info;
};
const fmt = (k: string, v: any) => (MONEY_KEYS.includes(k) && v !== '' && v != null && !isNaN(Number(v)) ? inr(v) : v == null || v === '' ? '—' : String(v));
const splitCamel = (k: string) => k.replace(/([a-z])([A-Z])/g, '$1 $2');

export const ReportsView = () => {
  const { c, isDark, accent } = useAppTheme();
  const role = (useAuthStore((s) => s.user?.role) || '').toUpperCase();
  const isEmployee = role === 'EMPLOYEE';
  const types = REPORT_TYPES.filter((t) => !(isEmployee && ADMIN_ONLY.includes(t.value)));

  const [reportType, setReportType] = useState(types[0]?.value || 'Attendance');
  const [dateFilter, setDateFilter] = useState<'month' | 'year'>('month');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [summary, setSummary] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [ran, setRan] = useState<{ type: string; period: string }>({ type: '', period: '' });

  // Results: search + summary bucket + page size (web: search any column, rows per page 10/25/50/100)
  const [search, setSearch] = useState('');
  const [bucket, setBucket] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const scrollRef = useRef<ScrollView>(null);
  const resultsY = useRef(0);

  const fetchReport = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    setHasRun(true);
    try {
      const query = new URLSearchParams({ type: reportType });
      if (dateFilter === 'month') query.append('month', monthYear);
      if (dateFilter === 'year') query.append('year', year);

      const res: any = await apiCall(`/api/reports/generator?${query.toString()}`);
      // apiCall wraps the JSON body: { success, data: { success, data: { summary, rows } } }
      const payload = res?.data?.data ?? res?.data;
      if (res.success && payload && (payload.rows || payload.summary)) {
        setSummary(Array.isArray(payload.summary) ? payload.summary : []);
        setRows(Array.isArray(payload.rows) ? payload.rows : []);
        setRan({ type: reportType, period: dateFilter === 'month' ? monthYear : year });
        setSearch('');
        setBucket('');
      } else {
        Alert.alert('Error', res.error || payload?.error || 'Failed to generate report.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ---- period stepper ----
  const stepMonth = (d: number) => {
    const [y, m] = monthYear.split('-').map(Number);
    const base = y && m ? new Date(y, m - 1 + d, 1) : new Date();
    setMonthYear(ym(base));
  };
  const stepYear = (d: number) => setYear(String((Number(year) || new Date().getFullYear()) + d));
  const atCurrent = dateFilter === 'month' ? monthYear >= ym(new Date()) : Number(year) >= new Date().getFullYear();
  const currentType = REPORT_TYPES.find((t) => t.value === reportType);

  // ---- result filtering ----
  const columns = rows.length ? Object.keys(rows[0]).filter((k) => !HIDDEN_KEYS.includes(k)) : [];
  const summaryCol = SUMMARY_COLUMN[ran.type];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (bucket && summaryCol) {
        const v = row[summaryCol];
        const val = v == null || v === '' ? 'Unassigned' : String(v);
        if (val !== bucket) return false;
      }
      if (!q) return true;
      return Object.entries(row).some(([k, v]) => !HIDDEN_KEYS.includes(k) && v != null && String(v).toLowerCase().includes(q));
    });
  }, [rows, search, bucket, summaryCol]);
  const pg = usePagination(filtered, pageSize, `${search}|${bucket}|${pageSize}|${rows.length}|${ran.type}${ran.period}`);
  const summaryTotal = summary.reduce((a, s) => a + (Number(s.value) || 0), 0);

  const goToPage = (p: number) => {
    pg.setPage(p);
    scrollRef.current?.scrollTo({ y: Math.max(0, resultsY.current - 8), animated: true });
  };

  const exportRows = () => filtered.map((r) => columns.map((k) => (r[k] == null ? '' : r[k])));
  const fileBase = `${ran.type}_Report_${ran.period}`;
  const doExport = async (kind: 'pdf' | 'csv') => {
    if (filtered.length === 0) { Alert.alert('Export', 'No data to export'); return; }
    try {
      if (kind === 'pdf') {
        await exportTablePdf({
          title: `${ran.type} Report`,
          subtitle: `${ran.period.length === 7 ? prettyMonth(ran.period) : ran.period} · ${filtered.length} records · Generated on ${new Date().toLocaleDateString('en-IN')}`,
          headers: columns.map(splitCamel),
          rows: exportRows(),
          fileName: `${fileBase}.pdf`,
        });
      } else {
        await exportTableCsv({ headers: columns, rows: exportRows(), fileName: `${fileBase}.csv` });
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Could not export the report.');
    }
  };

  // Pick a title / subtitle / status for a generic row card.
  const titleKey = ['Employee', 'Name', 'Description'].find((k) => columns.includes(k));
  const subKeys = ['Code', 'Date', 'Month', 'Company', 'Email'].filter((k) => columns.includes(k) && k !== titleKey).slice(0, 2);
  const pillKey = ['Status', 'Type'].find((k) => columns.includes(k));
  const amountKey = ['Net', 'Amount'].find((k) => columns.includes(k));
  const detailKeys = columns.filter((k) => k !== titleKey && !subKeys.includes(k) && k !== pillKey && k !== amountKey);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => (hasRun ? fetchReport({ silent: true }) : undefined)} tintColor={accent} colors={[accent]} />}
    >
      {/* Title */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Reports</Text>
        <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>Generate, visualize and export data across modules.</Text>
      </View>

      {/* Control panel */}
      <Card c={c}>
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginBottom: 10 }}>REPORT TYPE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {types.map((t) => {
            const active = reportType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setReportType(t.value)}
                activeOpacity={0.75}
                style={{
                  flexBasis: '30%', flexGrow: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
                  backgroundColor: active ? t.tint + (isDark ? '2E' : '1A') : c.surfaceLight,
                  borderWidth: 1.5, borderColor: active ? t.tint : 'transparent',
                }}
              >
                <t.icon size={20} color={active ? t.tint : c.textMuted} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? c.text : c.textMuted, marginTop: 6 }}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginTop: 18, marginBottom: 10 }}>PERIOD</Text>
        <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 12, padding: 4 }}>
          {(['month', 'year'] as const).map((d) => {
            const active = dateFilter === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDateFilter(d)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9, backgroundColor: active ? c.surface : 'transparent', borderWidth: active ? 1 : 0, borderColor: c.border }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? c.text : c.textMuted }}>{d === 'month' ? 'Monthly' : 'Yearly'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: c.surfaceLight, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            onPress={() => (dateFilter === 'month' ? stepMonth(-1) : stepYear(-1))}
            accessibilityLabel="Previous period"
            style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={20} color={c.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>{dateFilter === 'month' ? prettyMonth(monthYear) : year}</Text>
            {currentType && !currentType.dated ? (
              <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>Shows all active employees (period not applied)</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => (dateFilter === 'month' ? stepMonth(1) : stepYear(1))}
            disabled={atCurrent}
            accessibilityLabel="Next period"
            style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', opacity: atCurrent ? 0.35 : 1 }}
          >
            <ChevronRight size={20} color={c.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => fetchReport()}
          disabled={loading}
          style={{ marginTop: 16, height: 50, borderRadius: 14, backgroundColor: accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <ActivityIndicator color={onAccent(accent)} /> : <Sparkles size={17} color={onAccent(accent)} />}
          <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent(accent) }}>{loading ? 'Generating…' : `Generate ${reportType} report`}</Text>
        </TouchableOpacity>
      </Card>

      {/* Results */}
      <View onLayout={(e) => { resultsY.current = e.nativeEvent.layout.y; }}>
        {!hasRun ? (
          <BigEmpty c={c} icon={ChartColumn} title="No report yet" text="Pick a report type and period, then tap Generate." />
        ) : loading ? (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {[0, 1, 2].map((i) => <View key={i} style={{ flex: 1, height: 70, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }} />)}
            </View>
            <ListSkeleton c={c} count={4} height={110} />
          </View>
        ) : rows.length === 0 ? (
          <BigEmpty c={c} icon={FileText} title="No data found" text="There are no records matching your selected report type and period." />
        ) : (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{ran.type} report</Text>
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                  {ran.period.length === 7 ? prettyMonth(ran.period) : ran.period} · {rows.length.toLocaleString('en-IN')} records
                </Text>
              </View>
              <TouchableOpacity onPress={() => doExport('csv')} accessibilityLabel="Export to Excel (CSV)" style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.success + (isDark ? '26' : '1A'), marginRight: 8 }}>
                <FileSpreadsheet size={18} color={c.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => doExport('pdf')} accessibilityLabel="Export to PDF" style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.danger + (isDark ? '26' : '1A') }}>
                <FileText size={18} color={c.danger} />
              </TouchableOpacity>
            </View>

            {/* Data summary (replaces the web pie chart): distribution bar + tappable tiles */}
            {summary.length > 0 && (
              <Card c={c} style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: c.textMuted, marginBottom: 10 }}>DATA SUMMARY</Text>
                {summaryTotal > 0 && (
                  <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: c.surfaceLight, marginBottom: 12 }}>
                    {summary.map((s, i) => (Number(s.value) > 0 ? <View key={i} style={{ flex: Number(s.value), backgroundColor: PIE[i % PIE.length] }} /> : null))}
                  </View>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {summary.map((s, i) => {
                    const active = bucket === s.name;
                    const tint = PIE[i % PIE.length];
                    const pct = summaryTotal > 0 ? Math.round((Number(s.value) / summaryTotal) * 100) : 0;
                    return (
                      <TouchableOpacity
                        key={`${s.name}-${i}`}
                        onPress={() => summaryCol && setBucket(active ? '' : s.name)}
                        activeOpacity={0.75}
                        style={{
                          flexBasis: '30%', flexGrow: 1, padding: 10, borderRadius: 12,
                          backgroundColor: active ? tint + (isDark ? '30' : '1C') : c.surfaceLight,
                          borderWidth: 1.5, borderColor: active ? tint : 'transparent',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tint }} />
                          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600', flex: 1 }} numberOfLines={1}>{s.name}</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginTop: 4 }}>{s.value}</Text>
                        <Text style={{ fontSize: 10, color: c.textMuted }}>{pct}%</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {summaryCol ? <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 8 }}>Tap a tile to filter rows by {summaryCol.toLowerCase()}.</Text> : null}
              </Card>
            )}

            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Search by employee name, code or any column" />

            {summary.length > 0 && summaryCol && (
              <QuickChips
                c={c}
                accent={accent}
                value={bucket}
                onChange={setBucket}
                options={[{ value: '', label: 'All', count: rows.length }, ...summary.map((s) => ({ value: String(s.name), label: String(s.name), count: Number(s.value) || 0 }))]}
              />
            )}

            {(search || bucket) && (
              <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>
                {filtered.length.toLocaleString('en-IN')} of {rows.length.toLocaleString('en-IN')} records match
              </Text>
            )}

            {filtered.length === 0 ? (
              <BigEmpty c={c} icon={SearchX} title="No matching records" text={search ? `Nothing matches "${search}".` : 'Try a different filter.'} />
            ) : (
              pg.pageItems.map((row: any, idx: number) => {
                const title = titleKey ? String(row[titleKey] ?? '').trim() || '—' : `Record ${pg.from + idx}`;
                const pill = pillKey ? String(row[pillKey] ?? '') : '';
                const tint = statusTint(pill, c);
                const ranType = REPORT_TYPES.find((t) => t.value === ran.type);
                const TypeIcon = ranType?.icon || FileText;
                const typeTint = ranType?.tint || c.info;
                return (
                  <View key={`${pg.page}-${idx}`} style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: typeTint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
                        <TypeIcon size={19} color={typeTint} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }} numberOfLines={1}>{title}</Text>
                        {subKeys.length > 0 && (
                          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                            {subKeys.map((k) => fmt(k, row[k])).filter((v) => v !== '—').join(' · ') || '—'}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        {pill ? (
                          <View style={{ backgroundColor: tint + '1F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                            <Text style={{ color: tint, fontSize: 11, fontWeight: '700' }}>{pill}</Text>
                          </View>
                        ) : null}
                        {amountKey ? (
                          <Text style={{ fontSize: 14, fontWeight: '800', color: pillKey === 'Type' ? tint : c.text }}>{fmt(amountKey, row[amountKey])}</Text>
                        ) : null}
                      </View>
                    </View>
                    {detailKeys.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.surfaceLight, borderRadius: 12, paddingHorizontal: 12, paddingTop: 10, marginTop: 12 }}>
                        {detailKeys.map((k) => (
                          <View key={k} style={{ width: '50%', paddingRight: 8, marginBottom: 10 }}>
                            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{splitCamel(k)}</Text>
                            <Text style={{ fontSize: 13, color: c.text, fontWeight: '700', marginTop: 2 }} numberOfLines={2}>{fmt(k, row[k])}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <Pagination c={c} accent={accent} page={pg.page} totalPages={pg.totalPages} from={pg.from} to={pg.to} total={pg.total} onChange={goToPage} />

            {filtered.length > PAGE_SIZES[0] && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: c.textMuted, marginRight: 4 }}>Rows per page</Text>
                {PAGE_SIZES.map((n) => {
                  const active = pageSize === n;
                  return (
                    <TouchableOpacity key={n} onPress={() => setPageSize(n)} style={{ paddingHorizontal: 10, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? accent : c.surfaceLight }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? onAccent(accent) : c.textMuted }}>{n}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
