import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Mail, Smartphone, Bell, RadioTower, CircleCheck, CircleX, Send, SearchX, Inbox } from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAppTheme, Card, SearchBox, StatTile, Palette } from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';
import { Chip, SheetSection } from '../investors/InvestorListUI';
import {
  DateFilter, EMPTY_DATE, matchesDate, describeDate, DateFilterSection, BottomSheet, FilterButton, QuickChips,
  AppliedChips, PageSizeSection, ListSkeleton, BigEmpty, dateTime, relativeTime,
} from '../reports/shared';

// Mirrors CRM web: dashboard/reports/notifications/page.tsx → GET /api/reports/notifications
// (the API takes no query params and returns the latest 50 logs, so search/filter/paging run on the device).

type Channel = '' | 'Email' | 'SMS' | 'Push';
type Status = '' | 'Sent' | 'Failed';

interface Filters {
  status: Status;
  trigger: string;
  date: DateFilter;
  limit: number;
}
const EMPTY: Filters = { status: '', trigger: '', date: EMPTY_DATE, limit: 10 };

const channelMeta = (ch: string, c: Palette) =>
  ch === 'Email' ? { icon: Mail, tint: c.info } : ch === 'SMS' ? { icon: Smartphone, tint: c.success } : { icon: Bell, tint: '#8B5CF6' };

const recipientName = (log: any) => `${log.recipientId?.firstName || ''} ${log.recipientId?.lastName || ''}`.trim();
const recipientContact = (log: any) =>
  log.channel === 'Email' ? log.recipientId?.email || '' : log.channel === 'SMS' ? log.recipientId?.phone || '' : 'App User';

export const NotificationsView = () => {
  const { c, isDark, accent } = useAppTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<Channel>('');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);

  const fetchLogs = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    try {
      const res: any = await apiCall('/api/reports/notifications');
      if (res.success && res.data) {
        // apiCall wraps the JSON body ({ success, data: [...] }); accept a bare array too.
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setLogs(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggers = useMemo(() => Array.from(new Set(logs.map((l) => String(l.triggerEvent || '')).filter(Boolean))).sort(), [logs]);

  // Everything except the channel chip, so the chip counts reflect the other filters.
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filters.status && l.status !== filters.status) return false;
      if (filters.trigger && l.triggerEvent !== filters.trigger) return false;
      if (!matchesDate(l.createdAt, filters.date)) return false;
      if (!q) return true;
      return [recipientName(l), l.recipientId?.email, l.recipientId?.phone, l.triggerEvent, l.message, l.channel]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [logs, search, filters]);
  const filtered = useMemo(() => (channel ? baseFiltered.filter((l) => l.channel === channel) : baseFiltered), [baseFiltered, channel]);
  const pg = usePagination(filtered, filters.limit, `${search}|${channel}|${JSON.stringify(filters)}`);

  const goToPage = (p: number) => {
    pg.setPage(p);
    scrollRef.current?.scrollTo({ y: Math.max(0, listY.current - 8), animated: true });
  };

  const sent = logs.filter((l) => l.status === 'Sent').length;
  const failed = logs.filter((l) => l.status === 'Failed').length;
  const rate = logs.length ? Math.round((sent / logs.length) * 100) : 0;

  const applied: { key: string; label: string }[] = [];
  if (filters.status) applied.push({ key: 'status', label: filters.status });
  if (filters.trigger) applied.push({ key: 'trigger', label: filters.trigger });
  const dd = describeDate(filters.date, 'Sent');
  if (dd) applied.push({ key: 'date', label: dd.label });
  const sheetCount = applied.length;

  const removeApplied = (key: string) => {
    if (key === 'status') setFilters({ ...filters, status: '' });
    if (key === 'trigger') setFilters({ ...filters, trigger: '' });
    if (key === 'date') setFilters({ ...filters, date: EMPTY_DATE });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchLogs({ silent: true })} tintColor={accent} colors={[accent]} />}
      >
        {/* Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: accent + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
            <RadioTower size={22} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Notification Logs</Text>
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
              {loading ? 'Loading…' : 'Audit trail of outgoing Email, SMS and Push messages'}
            </Text>
          </View>
        </View>

        {/* Stats (from the loaded logs) */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <StatTile c={c} isDark={isDark} icon={Send} tint={c.info} label="Recent dispatches" value={loading ? '—' : logs.length} />
          <StatTile c={c} isDark={isDark} icon={CircleCheck} tint={c.success} label="Delivered" value={loading ? '—' : sent} hint={logs.length ? `${rate}% success` : undefined} onPress={() => setFilters({ ...filters, status: filters.status === 'Sent' ? '' : 'Sent' })} />
          <StatTile c={c} isDark={isDark} icon={CircleX} tint={c.danger} label="Failed" value={loading ? '—' : failed} onPress={() => setFilters({ ...filters, status: filters.status === 'Failed' ? '' : 'Failed' })} />
        </View>

        {/* Search + filters */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Recipient, event or message" />
          </View>
          <FilterButton c={c} accent={accent} count={sheetCount} onPress={() => { setDraft(filters); setSheetOpen(true); }} />
        </View>

        <QuickChips<Channel>
          c={c}
          accent={accent}
          value={channel}
          onChange={setChannel}
          options={[
            { value: '', label: 'All', count: baseFiltered.length },
            { value: 'Email', label: 'Email', icon: Mail, tint: c.info, count: baseFiltered.filter((l) => l.channel === 'Email').length },
            { value: 'SMS', label: 'SMS', icon: Smartphone, tint: c.success, count: baseFiltered.filter((l) => l.channel === 'SMS').length },
            { value: 'Push', label: 'Push', icon: Bell, tint: '#8B5CF6', count: baseFiltered.filter((l) => l.channel === 'Push').length },
          ]}
        />

        <AppliedChips c={c} items={applied} onRemove={removeApplied} onClearAll={() => setFilters({ ...EMPTY, limit: filters.limit })} />

        <View onLayout={(e) => { listY.current = e.nativeEvent.layout.y; }}>
          {loading ? (
            <ListSkeleton c={c} count={5} />
          ) : logs.length === 0 ? (
            <BigEmpty c={c} icon={Inbox} title="No dispatches yet" text="The notification engine has not dispatched any messages yet. Generate a payroll to trigger an event!" />
          ) : filtered.length === 0 ? (
            <BigEmpty c={c} icon={SearchX} title="No matching logs" text="Try a different search or clear the filters." />
          ) : (
            <Card c={c} padded={false}>
              {pg.pageItems.map((log: any, i: number) => {
                const meta = channelMeta(log.channel, c);
                const ok = log.status === 'Sent';
                const isOpen = expanded === log._id;
                const name = recipientName(log);
                const contact = recipientContact(log);
                return (
                  <TouchableOpacity
                    key={log._id || i}
                    activeOpacity={0.7}
                    onPress={() => setExpanded(isOpen ? null : log._id)}
                    style={{ flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: meta.tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
                      <meta.icon size={18} color={meta.tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '800', color: c.text }} numberOfLines={1}>{name || 'Unknown recipient'}</Text>
                        <Text style={{ fontSize: 11, color: c.textMuted }}>{relativeTime(log.createdAt)}</Text>
                      </View>
                      {contact ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{contact}</Text> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <View style={{ backgroundColor: c.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: c.text }}>{log.triggerEvent || '—'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: (ok ? c.success : c.danger) + '1F', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                          {ok ? <CircleCheck size={11} color={c.success} /> : <CircleX size={11} color={c.danger} />}
                          <Text style={{ fontSize: 11, fontWeight: '700', color: ok ? c.success : c.danger }}>{ok ? 'Sent' : 'Failed'}</Text>
                        </View>
                      </View>
                      {log.message ? (
                        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 6, lineHeight: 17 }} numberOfLines={isOpen ? undefined : 2}>{log.message}</Text>
                      ) : null}
                      {isOpen ? <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 6 }}>{log.channel} · {dateTime(log.createdAt)}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>
          )}

          {!loading && (
            <Pagination c={c} accent={accent} page={pg.page} totalPages={pg.totalPages} from={pg.from} to={pg.to} total={pg.total} onChange={goToPage} />
          )}
          {!loading && logs.length >= 50 ? (
            <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center', marginTop: 12 }}>Showing the 50 most recent dispatches.</Text>
          ) : null}
        </View>
      </ScrollView>

      <BottomSheet
        c={c}
        accent={accent}
        visible={sheetOpen}
        title="Filters"
        onClose={() => setSheetOpen(false)}
        onReset={() => setDraft({ ...EMPTY, limit: draft.limit })}
        onApply={() => { setFilters(draft); setSheetOpen(false); }}
      >
        <SheetSection c={c} title="STATUS">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {(['', 'Sent', 'Failed'] as Status[]).map((s) => (
              <Chip key={s || 'all'} c={c} accent={accent} label={s || 'All'} active={draft.status === s} onPress={() => setDraft({ ...draft, status: s })} />
            ))}
          </View>
        </SheetSection>
        {triggers.length > 0 && (
          <SheetSection c={c} title="TRIGGER EVENT">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['', ...triggers].map((t) => (
                <Chip key={t || 'all'} c={c} accent={accent} label={t || 'All events'} active={draft.trigger === t} onPress={() => setDraft({ ...draft, trigger: t })} />
              ))}
            </View>
          </SheetSection>
        )}
        <DateFilterSection c={c} accent={accent} title="SENT ON" value={draft.date} onChange={(d) => setDraft({ ...draft, date: d })} />
        <PageSizeSection c={c} accent={accent} value={draft.limit} onChange={(n) => setDraft({ ...draft, limit: n })} />
      </BottomSheet>
    </View>
  );
};
