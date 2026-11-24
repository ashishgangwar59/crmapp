import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import {
  Users, Wallet, TrendingUp, Target, Landmark, UserCheck, UserX, AlertCircle, CalendarDays,
  Gift, Clock, IndianRupee, MapPin, ChevronRight, Briefcase,
} from 'lucide-react-native';
import {
  useAppTheme, Card, SectionHeader, StatTile, Avatar, StatusPill, EmptyState, SearchBox, FilterChips,
  inr, inrShort, greeting, GOLD, BRAND_NAVY,
} from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';

type PunchFilter = 'all' | 'present' | 'absent' | 'late';

export function AdminOverview({
  data,
  userName,
  refreshing,
  onRefresh,
  onNavigate,
}: {
  data: any;
  userName: string;
  refreshing: boolean;
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}) {
  const { c, isDark, accent } = useAppTheme();

  const k = data?.kpis || {};
  const att = k.attendanceStats || { present: 0, absent: 0, late: 0, leave: 0 };
  // The API sends `totalInvestment`; older builds read `totalInvestments`, so accept both.
  const totalInvestment = k.totalInvestment ?? k.totalInvestments ?? data?.totalInvestments ?? 0;
  const totalInvestors = k.totalInvestors ?? data?.totalInvestors ?? 0;
  const salaryPaid = Number(k.salaryPaid || 0);
  const salaryPending = Number(k.salaryPending || 0);
  const salaryPct = salaryPaid + salaryPending > 0 ? Math.round((salaryPaid / (salaryPaid + salaryPending)) * 100) : 0;

  // ---- Employee punch list: search + filter + pagination ----
  const records: any[] = Array.isArray(data?.todaysAttendanceList) ? data.todaysAttendanceList : [];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PunchFilter>('all');

  const isLate = (r: any) => !!r.isLate || String(r.status).toLowerCase() === 'late';
  const isPresent = (r: any) => String(r.status).toLowerCase() === 'present';
  const counts = {
    all: records.length,
    present: records.filter((r) => isPresent(r) && !isLate(r)).length,
    absent: records.filter((r) => !isPresent(r) && !isLate(r)).length,
    late: records.filter(isLate).length,
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (filter === 'present' && (!isPresent(r) || isLate(r))) return false;
      if (filter === 'late' && !isLate(r)) return false;
      if (filter === 'absent' && (isPresent(r) || isLate(r))) return false;
      if (!q) return true;
      return [r.name, r.employeeCode, r.department].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [records, query, filter]);
  const punch = usePagination(filtered, 6, `${filter}|${query}`);

  // ---- Birthdays ----
  const birthdays: any[] = Array.isArray(data?.upcomingBirthdays) ? data.upcomingBirthdays : [];
  const bday = usePagination(birthdays, 5);

  // ---- Leads ----
  const conv: any[] = data?.charts?.leadConversion || [];
  const won = Number(conv.find((x) => x.name === 'Won')?.value ?? k.wonLeads ?? 0);
  const open = Number(conv.find((x) => x.name === 'Open')?.value ?? k.openLeads ?? 0);
  const lost = Math.max(0, Number(conv.find((x) => x.name === 'Lost')?.value ?? 0));
  const leadTotal = won + open + lost;
  const winRate = won + open + lost > 0 ? Math.round((won / leadTotal) * 100) : 0;

  const attTotal = att.present + att.absent + att.late + att.leave;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const quick = [
    { label: 'Investors', icon: Landmark, tint: GOLD, section: 'Investors' },
    { label: 'Leads', icon: Target, tint: '#3B82F6', section: 'Leads' },
    { label: 'Attendance', icon: Clock, tint: '#10B981', section: 'Attendance' },
    { label: 'Payroll', icon: IndianRupee, tint: '#8B5CF6', section: 'Payroll' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} colors={[GOLD]} />}
    >
      {/* Hero */}
      <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -80, top: -100, borderWidth: 26, borderColor: 'rgba(214,175,55,0.10)' }} />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{today}</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
          {greeting()}, {userName}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 18, fontWeight: '600', letterSpacing: 0.6 }}>TOTAL INVESTMENT</Text>
        <Text style={{ color: GOLD, fontSize: 30, fontWeight: '800', marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
          {inr(totalInvestment)}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
          {[
            { l: 'Investors', v: String(totalInvestors) },
            { l: 'Wallet', v: inrShort(k.walletBalance) },
            { l: 'Revenue', v: inrShort(k.revenue) },
          ].map((x) => (
            <View key={x.l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }} numberOfLines={1} adjustsFontSizeToFit>{x.v}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>{x.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick actions */}
      <Card c={c} style={{ marginTop: 14, paddingVertical: 14, paddingHorizontal: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          {quick.map((q) => (
            <TouchableOpacity key={q.label} style={{ flex: 1, alignItems: 'center' }} onPress={() => onNavigate(q.section)} activeOpacity={0.7}>
              <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: q.tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <q.icon size={21} color={q.tint} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* KPIs */}
      <SectionHeader c={c} title="Overview" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <StatTile c={c} isDark={isDark} icon={Users} tint="#3B82F6" label="Employees" value={k.totalEmployees ?? 0} onPress={() => onNavigate('Employees')} />
        <StatTile c={c} isDark={isDark} icon={Wallet} tint={GOLD} label="Wallet balance" value={inrShort(k.walletBalance)} onPress={() => onNavigate('Wallet')} />
        <StatTile c={c} isDark={isDark} icon={TrendingUp} tint="#10B981" label="Revenue (won leads)" value={inrShort(k.revenue)} />
        <StatTile c={c} isDark={isDark} icon={Briefcase} tint="#8B5CF6" label="Open leads" value={open} onPress={() => onNavigate('Leads')} />
      </View>

      {/* Salary */}
      <Card c={c} style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Salary this month</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: c.success }}>{salaryPct}% paid</Text>
        </View>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: c.surfaceLight, marginVertical: 12, overflow: 'hidden' }}>
          <View style={{ width: `${salaryPct}%`, height: '100%', backgroundColor: c.success, borderRadius: 5 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 12, color: c.textMuted }}>Paid</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>{inr(salaryPaid)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: c.textMuted }}>Pending</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: c.warning }}>{inr(salaryPending)}</Text>
          </View>
        </View>
      </Card>

      {/* Attendance summary */}
      <SectionHeader c={c} title="Today's attendance" action="Open" onAction={() => onNavigate('Attendance')} accent={accent} />
      <Card c={c}>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: c.surfaceLight, marginBottom: 16 }}>
          {attTotal > 0 && [
            { v: att.present, col: '#10B981' },
            { v: att.late, col: '#F59E0B' },
            { v: att.leave, col: '#3B82F6' },
            { v: att.absent, col: '#EF4444' },
          ].map((s, i) => <View key={i} style={{ flex: s.v, backgroundColor: s.col }} />)}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {[
            { l: 'Present', v: att.present, icon: UserCheck, col: '#10B981' },
            { l: 'Late', v: att.late, icon: AlertCircle, col: '#F59E0B' },
            { l: 'On leave', v: att.leave, icon: CalendarDays, col: '#3B82F6' },
            { l: 'Absent', v: att.absent, icon: UserX, col: '#EF4444' },
          ].map((s) => (
            <View key={s.l} style={{ flex: 1, alignItems: 'center' }}>
              <s.icon size={18} color={s.col} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginTop: 6 }}>{s.v}</Text>
              <Text style={{ fontSize: 11, color: c.textMuted }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Employee punch status */}
      <SectionHeader c={c} title="Employee punch status" action="Refresh" onAction={onRefresh} accent={accent} />
      <Card c={c}>
        <SearchBox c={c} value={query} onChange={setQuery} placeholder="Search name, code or department" />
        <FilterChips
          c={c}
          accent={accent}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'present', label: 'On time', count: counts.present },
            { value: 'late', label: 'Late', count: counts.late },
            { value: 'absent', label: 'Absent', count: counts.absent },
          ]}
        />
        {punch.pageItems.length === 0 ? (
          <EmptyState c={c} icon={Users} text={records.length === 0 ? 'No attendance records for today.' : 'No employees match this filter.'} />
        ) : (
          punch.pageItems.map((r: any, i: number) => {
            const late = isLate(r);
            const present = isPresent(r);
            const tone = present && !late ? 'success' : late ? 'warning' : String(r.status).toLowerCase().includes('leave') ? 'info' : 'danger';
            return (
              <View key={r.id || i} style={{ paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={r.name} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }} numberOfLines={1}>{r.name || 'Unknown'}</Text>
                    <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>
                      {r.employeeCode || '-'} · {r.department || '-'}
                    </Text>
                  </View>
                  <StatusPill label={late && present ? 'Late' : r.status || 'Absent'} tone={tone as any} />
                </View>
                {(r.punchIn && r.punchIn !== '-') ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 52, gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color={c.textMuted} />
                      <Text style={{ fontSize: 12, color: c.text }}>{r.punchIn} → {r.punchOut || '-'}</Text>
                    </View>
                    {r.workingHours && r.workingHours !== '-' ? (
                      <Text style={{ fontSize: 12, color: c.textMuted }}>{r.workingHours}</Text>
                    ) : null}
                    {r.geoUrl ? (
                      <TouchableOpacity onPress={() => Linking.openURL(r.geoUrl)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <MapPin size={13} color={accent} />
                        <Text style={{ fontSize: 12, color: accent, fontWeight: '600' }}>Map</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        <Pagination c={c} accent={accent} {...punch} onChange={punch.setPage} />
      </Card>

      {/* Leads */}
      <SectionHeader c={c} title="Lead conversion" action="View leads" onAction={() => onNavigate('Leads')} accent={accent} />
      <Card c={c}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '800', color: c.text }}>{winRate}%</Text>
            <Text style={{ fontSize: 12, color: c.textMuted }}>Win rate · {leadTotal} leads</Text>
          </View>
          <TrendingUp size={28} color={c.success} />
        </View>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: c.surfaceLight, marginTop: 14, marginBottom: 12 }}>
          {leadTotal > 0 && [
            { v: won, col: '#10B981' },
            { v: open, col: '#3B82F6' },
            { v: lost, col: '#EF4444' },
          ].map((s, i) => <View key={i} style={{ flex: s.v, backgroundColor: s.col }} />)}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { l: 'Won', v: won, col: '#10B981' },
            { l: 'Open', v: open, col: '#3B82F6' },
            { l: 'Lost', v: lost, col: '#EF4444' },
          ].map((s) => (
            <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.col }} />
              <Text style={{ fontSize: 13, color: c.textMuted }}>{s.l}</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: c.text }}>{s.v}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Birthdays */}
      <SectionHeader c={c} title="Upcoming birthdays" />
      <Card c={c}>
        {bday.pageItems.length === 0 ? (
          <EmptyState c={c} icon={Gift} text="No birthdays in the next 30 days." />
        ) : (
          bday.pageItems.map((b: any, i: number) => {
            const d = new Date(b.date);
            const valid = !isNaN(d.getTime());
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                <Avatar name={b.name} size={36} />
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: c.text }} numberOfLines={1}>{b.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(236,72,153,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                  <Gift size={12} color="#EC4899" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#EC4899' }}>
                    {valid ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : String(b.date)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <Pagination c={c} accent={accent} {...bday} onChange={bday.setPage} />
      </Card>
    </ScrollView>
  );
}
