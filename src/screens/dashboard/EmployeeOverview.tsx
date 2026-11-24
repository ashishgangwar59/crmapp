import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, IndianRupee, CheckSquare, Gift, Megaphone, CalendarDays, FingerprintPattern as Fingerprint, Wallet } from 'lucide-react-native';
import { apiCall } from '../../services/api';
import {
  useAppTheme, Card, SectionHeader, StatTile, Avatar, StatusPill, EmptyState,
  inr, greeting, GOLD, BRAND_NAVY,
} from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';

const LEAVE_COLORS: Record<string, string> = {
  Paid: '#10B981', Casual: '#F59E0B', Sick: '#3B82F6', Maternity: '#EC4899', Paternity: '#8B5CF6', CompOff: '#D6AF37',
};

const monthLabel = (m: string) => {
  // "2026-10" → "Oct 2026"
  const [y, mo] = String(m || '').split('-').map(Number);
  if (!y || !mo) return String(m || '-');
  return new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export function EmployeeOverview({ userName, onNavigate }: { userName: string; onNavigate: (section: string) => void }) {
  const { c, isDark, accent } = useAppTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res: any = await apiCall('/api/dashboard/employee');
    if (res.success && res.data) {
      setData(res.data.data || res.data);
      setError('');
    } else {
      setError(res.error || 'Could not load your dashboard.');
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const tasks: any[] = data?.tasks || [];
  const salaryHistory: any[] = data?.salaryHistory || [];
  const announcements: any[] = data?.announcements || [];
  const birthdays: any[] = data?.upcomingBirthdays || [];
  const graph: any[] = data?.attendanceGraph || [];
  const leaves: any[] = data?.leaveBalances || [];
  const taskPage = usePagination(tasks, 5);
  const salaryPage = usePagination(salaryHistory, 4);
  const bdayPage = usePagination(birthdays, 5);

  const status = String(data?.todaysAttendance || 'Not Punched In');
  const punched = status.toLowerCase() !== 'not punched in';
  const maxHours = Math.max(9, ...graph.map((g) => Number(g.hours) || 0));
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator color={accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={GOLD} colors={[GOLD]} />}
    >
      {/* Hero with attendance status */}
      <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -90, borderWidth: 24, borderColor: 'rgba(214,175,55,0.10)' }} />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{today}</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{greeting()}, {userName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Today's attendance</Text>
            <Text style={{ color: punched ? '#34D399' : '#fff', fontSize: 17, fontWeight: '800', marginTop: 2 }}>{status}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('Attendance')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Fingerprint size={16} color={BRAND_NAVY} />
            <Text style={{ color: BRAND_NAVY, fontWeight: '800', fontSize: 13 }}>{punched ? 'View' : 'Punch in'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <Card c={c} style={{ marginTop: 14, borderColor: 'rgba(239,68,68,0.3)' }}>
          <Text style={{ color: c.danger, fontSize: 13 }}>{error} Pull down to retry.</Text>
        </Card>
      ) : null}

      {/* KPIs */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        <StatTile
          c={c} isDark={isDark} icon={IndianRupee} tint="#10B981" label="Latest salary"
          value={data?.latestSalary ? inr(data.latestSalary.netSalary) : '—'}
          hint={data?.latestSalary ? monthLabel(data.latestSalary.monthYear) : undefined}
          onPress={() => onNavigate('Payroll')}
        />
        <StatTile c={c} isDark={isDark} icon={CheckSquare} tint="#F59E0B" label="Pending tasks" value={tasks.length} />
        <StatTile c={c} isDark={isDark} icon={CalendarDays} tint="#3B82F6" label="Leave balance" value={leaves.reduce((s, l) => s + (Number(l.value) || 0), 0)} onPress={() => onNavigate('Leave')} />
        <StatTile c={c} isDark={isDark} icon={Gift} tint="#EC4899" label="Birthdays (30 days)" value={birthdays.length} />
      </View>

      {/* Attendance chart */}
      <SectionHeader c={c} title="Last 7 days" action="Attendance" onAction={() => onNavigate('Attendance')} accent={accent} />
      <Card c={c}>
        {graph.length === 0 ? (
          <EmptyState c={c} icon={Clock} text="No attendance in the last 7 days." />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 }}>
            {graph.map((g, i) => {
              const h = Number(g.hours) || 0;
              const isToday = i === graph.length - 1;
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 10, color: c.textMuted, marginBottom: 4 }}>{h ? `${h}h` : ''}</Text>
                  <View style={{ width: 18, height: Math.max(4, (h / maxHours) * 100), borderRadius: 6, backgroundColor: h ? (isToday ? accent : (isDark ? '#3B82F6' : c.accent)) : c.surfaceLight, opacity: isToday || !h ? 1 : 0.55 }} />
                  <Text style={{ fontSize: 10, color: isToday ? c.text : c.textMuted, marginTop: 6, fontWeight: isToday ? '700' : '400' }}>{String(g.date).replace('-', '/')}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Leave balances */}
      <SectionHeader c={c} title="Leave balance" action="Apply leave" onAction={() => onNavigate('Leave')} accent={accent} />
      <Card c={c}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {leaves.map((l) => {
            const col = LEAVE_COLORS[l.name] || c.textMuted;
            return (
              <View key={l.name} style={{ flexBasis: '30%', flexGrow: 1, backgroundColor: col + '14', borderRadius: 14, padding: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: col }}>{l.value}</Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>{l.name}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Tasks */}
      <SectionHeader c={c} title="My tasks" />
      <Card c={c}>
        {taskPage.pageItems.length === 0 ? (
          <EmptyState c={c} icon={CheckSquare} text="You're all caught up." />
        ) : (
          taskPage.pageItems.map((t: any, i: number) => {
            const due = t.dueDate ? new Date(t.dueDate) : null;
            const overdue = due && due.getTime() < Date.now();
            return (
              <View key={t._id || i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: overdue ? c.danger : c.warning }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }} numberOfLines={2}>{t.title || t.name || 'Task'}</Text>
                  {due ? (
                    <Text style={{ fontSize: 12, color: overdue ? c.danger : c.textMuted, marginTop: 2 }}>
                      {overdue ? 'Overdue · ' : 'Due '}{due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  ) : null}
                </View>
                {t.status ? <StatusPill label={t.status === 'InProgress' ? 'In progress' : t.status} tone={t.status === 'InProgress' ? 'info' : 'muted'} /> : null}
              </View>
            );
          })
        )}
        <Pagination c={c} accent={accent} {...taskPage} onChange={taskPage.setPage} />
      </Card>

      {/* Announcements */}
      <SectionHeader c={c} title="Announcements" />
      <Card c={c}>
        {announcements.length === 0 ? (
          <EmptyState c={c} icon={Megaphone} text="No new announcements." />
        ) : (
          announcements.map((a: any, i: number) => (
            <View key={a._id || i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(214,175,55,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={17} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{a.title || 'Announcement'}</Text>
                {a.content || a.message || a.body ? (
                  <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2, lineHeight: 18 }} numberOfLines={3}>{a.content || a.message || a.body}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Salary history */}
      <SectionHeader c={c} title="Salary history" action="Payroll" onAction={() => onNavigate('Payroll')} accent={accent} />
      <Card c={c}>
        {salaryPage.pageItems.length === 0 ? (
          <EmptyState c={c} icon={Wallet} text="No salary history yet." />
        ) : (
          salaryPage.pageItems.map((s: any, i: number) => (
            <View key={s.id || i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <IndianRupee size={16} color="#10B981" />
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: c.text }}>{monthLabel(s.month)}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>{inr(s.amount)}</Text>
            </View>
          ))
        )}
        <Pagination c={c} accent={accent} {...salaryPage} onChange={salaryPage.setPage} />
      </Card>

      {/* Birthdays */}
      <SectionHeader c={c} title="Upcoming birthdays" />
      <Card c={c}>
        {bdayPage.pageItems.length === 0 ? (
          <EmptyState c={c} icon={Gift} text="No birthdays in the next 30 days." />
        ) : (
          bdayPage.pageItems.map((b: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
              <Avatar name={b.name} size={36} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: c.text }} numberOfLines={1}>{b.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#EC4899' }}>{b.date}</Text>
            </View>
          ))
        )}
        <Pagination c={c} accent={accent} {...bdayPage} onChange={bdayPage.setPage} />
      </Card>
    </ScrollView>
  );
}
