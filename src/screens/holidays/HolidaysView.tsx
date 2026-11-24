import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, Platform } from 'react-native';
import { Plus, Calendar, CalendarDays, Pencil, Trash2, PartyPopper, Building2, Star, Sparkles } from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAuthStore } from '../../services/authStore';
import { useAppTheme, StatTile, SearchBox, BRAND_NAVY, GOLD, Palette } from '../../components/DashboardUI';
import { Pagination, usePagination } from '../../components/Pagination';
import { Chip, DateField, SheetSection } from '../investors/InvestorListUI';
import {
  ScreenTitle, PrimaryButton, FilterButton, QuickChips, AppliedFilters, AppliedFilter, SkeletonList, BigEmpty, BottomSheet,
  PAGE_SIZES, ymd, pickList, onAccent,
} from '../attendance/ui';

const TYPES = ['Public', 'Company', 'Optional'] as const;
const TYPE_COLORS: Record<string, string> = { Public: '#3B82F6', Company: '#10B981', Optional: '#8B5CF6' };
const typeColor = (t?: string) => TYPE_COLORS[t || 'Public'] || '#64748B';

/** Same parsing as before: full ISO strings as-is, bare dates at local midnight. */
const holidayDate = (h: any): Date | null => {
  if (!h?.date) return null;
  const s = String(h.date);
  const d = new Date(s.includes('T') ? s : `${s.substring(0, 10)}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
};
const holidayKey = (h: any) => {
  const d = holidayDate(h);
  return d ? ymd(d) : '';
};

type When = '' | 'upcoming' | 'past';
interface HolidayFilters { when: When; type: string; year: string; month: string; limit: number }
const EMPTY: HolidayFilters = { when: '', type: '', year: '', month: '', limit: 10 };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function HolidayCard({
  c, isDark, holiday, isNext, canEdit, onEdit, onDelete,
}: { c: Palette; isDark: boolean; holiday: any; isNext: boolean; canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  const d = holidayDate(holiday);
  const col = typeColor(holiday.type);
  const todayKey = ymd(new Date());
  const key = holidayKey(holiday);
  const past = key && key < todayKey;
  const daysAway = d ? Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000) : null;
  return (
    <View style={{ flexDirection: 'row', gap: 12, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: isNext ? col : c.border, padding: 14, marginBottom: 12, opacity: past ? 0.7 : 1 }}>
      <View style={{ width: 56, borderRadius: 14, backgroundColor: col + (isDark ? '26' : '14'), alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: col }}>{d ? MONTHS[d.getMonth()].toUpperCase() : '—'}</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: col, lineHeight: 26 }}>{d ? d.getDate() : ''}</Text>
        <Text style={{ fontSize: 10, fontWeight: '700', color: c.textMuted }}>{d ? d.toLocaleDateString(undefined, { weekday: 'short' }) : ''}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }} numberOfLines={2}>{holiday.name}</Text>
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
          {d ? d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <View style={{ backgroundColor: col + '1F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: col, fontSize: 11, fontWeight: '700' }}>{holiday.type || 'Public'} Holiday</Text>
          </View>
          {daysAway !== null && daysAway >= 0 && daysAway <= 60 ? (
            <Text style={{ fontSize: 11, fontWeight: '700', color: daysAway === 0 ? c.success : c.textMuted }}>
              {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `in ${daysAway} days`}
            </Text>
          ) : null}
        </View>
        {holiday.description ? (
          <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 8, lineHeight: 18 }} numberOfLines={3}>{holiday.description}</Text>
        ) : null}
      </View>
      {canEdit && (
        <View style={{ gap: 8 }}>
          <TouchableOpacity onPress={onEdit} accessibilityLabel="Edit holiday" style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
            <Pencil size={15} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete holiday" style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.danger + (isDark ? '26' : '14') }}>
            <Trash2 size={15} color={c.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export const HolidaysView = () => {
  const { c, isDark, accent } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const userRoleStr = (user?.role || '').toUpperCase();
  const isAdminOrKeyAdmin = userRoleStr === 'ADMIN' || userRoleStr === 'KEY_ADMIN' || userRoleStr === 'KEYADMIN';
  const scrollRef = useRef<ScrollView>(null);

  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'Public', description: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<HolidayFilters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<HolidayFilters>(EMPTY);

  const fetchHolidays = async (silent?: boolean) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiCall('/api/holidays');
      if (res.success && res.data) {
        setHolidays(pickList(res.data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const resetForm = () => {
    setShowAddCard(false);
    setEditingId(null);
    setFormData({ name: '', date: '', type: 'Public', description: '' });
  };

  const handleEditHoliday = (holiday: any) => {
    setEditingId(holiday._id || holiday.id);
    const dateStr = holiday.date ? String(holiday.date).substring(0, 10) : '';
    setFormData({
      name: holiday.name || '',
      date: dateStr,
      type: holiday.type || 'Public',
      description: holiday.description || '',
    });
    setShowAddCard(true);
  };

  const handleDeleteHoliday = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this holiday?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await apiCall(`/api/holidays/${id}`, { method: 'DELETE' });
            if (res.success) {
              Alert.alert('Success', 'Holiday deleted successfully!');
              fetchHolidays();
            } else {
              Alert.alert('Error', res.error || 'Failed to delete holiday.');
            }
          } catch (err: any) {
            Alert.alert('Error', err.message || 'An error occurred.');
          }
        },
      },
    ]);
  };

  const handleSaveHoliday = async () => {
    if (!formData.name || !formData.date) {
      Alert.alert('Validation Error', 'Please enter Holiday Name and Date.');
      return;
    }

    setSubmitLoading(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/holidays/${editingId}` : '/api/holidays';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, { method, body: JSON.stringify(formData) });

      if (res.success) {
        Alert.alert('Success', isEdit ? 'Holiday updated successfully!' : 'Holiday added successfully!');
        resetForm();
        fetchHolidays();
      } else {
        Alert.alert('Error', res.error || 'Failed to save holiday.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---- derived ----
  const todayKey = ymd(new Date());
  const thisYear = String(new Date().getFullYear());
  const sorted = useMemo(() => [...holidays].sort((a, b) => holidayKey(a).localeCompare(holidayKey(b))), [holidays]);
  const nextHoliday = sorted.find((h) => holidayKey(h) >= todayKey);
  const years = useMemo(
    () => Array.from(new Set(sorted.map((h) => holidayKey(h).slice(0, 4)).filter(Boolean))).sort().reverse(),
    [sorted]
  );

  const matchesBase = (h: any, f: HolidayFilters) => {
    const key = holidayKey(h);
    if (f.type && (h.type || 'Public') !== f.type) return false;
    if (f.year && key.slice(0, 4) !== f.year) return false;
    if (f.month && key.slice(5, 7) !== f.month) return false;
    const q = search.trim().toLowerCase();
    if (q && !`${h.name || ''} ${h.description || ''} ${h.type || ''}`.toLowerCase().includes(q)) return false;
    return true;
  };
  const matchesWhen = (h: any, w: When) => {
    const key = holidayKey(h);
    if (w === 'upcoming') return key >= todayKey;
    if (w === 'past') return key < todayKey;
    return true;
  };

  const filtered = useMemo(() => {
    const list = sorted.filter((h) => matchesBase(h, filters) && matchesWhen(h, filters.when));
    // Past holidays read best newest-first.
    return filters.when === 'past' ? list.reverse() : list;
  }, [sorted, filters, search]);

  const whenCounts = useMemo(() => {
    const base = sorted.filter((h) => matchesBase(h, filters));
    return { '': base.length, upcoming: base.filter((h) => matchesWhen(h, 'upcoming')).length, past: base.filter((h) => matchesWhen(h, 'past')).length };
  }, [sorted, filters, search]);

  const pager = usePagination(filtered, filters.limit, `${search}|${JSON.stringify(filters)}`);
  const goToPage = (p: number) => { pager.setPage(p); scrollRef.current?.scrollTo({ y: 0, animated: true }); };

  const upcomingCount = sorted.filter((h) => holidayKey(h) >= todayKey).length;
  const yearCount = sorted.filter((h) => holidayKey(h).startsWith(thisYear)).length;
  const publicCount = sorted.filter((h) => holidayKey(h).startsWith(thisYear) && (h.type || 'Public') === 'Public').length;
  const optionalCount = sorted.filter((h) => holidayKey(h).startsWith(thisYear) && h.type === 'Optional').length;

  const applied: AppliedFilter[] = [];
  if (filters.type) applied.push({ key: 'type', label: `${filters.type} holidays`, onClear: () => setFilters({ ...filters, type: '' }) });
  if (filters.year) applied.push({ key: 'year', label: filters.year, onClear: () => setFilters({ ...filters, year: '' }) });
  if (filters.month) applied.push({ key: 'month', label: MONTHS[Number(filters.month) - 1], onClear: () => setFilters({ ...filters, month: '' }) });
  const sheetCount = [filters.type, filters.year, filters.month].filter(Boolean).length;

  const nextDate = nextHoliday ? holidayDate(nextHoliday) : null;
  const nextDays = nextDate ? Math.round((new Date(nextDate.toDateString()).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000) : 0;
  const accentFg = onAccent(accent);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHolidays(true)} tintColor={accent} colors={[accent]} />}
      >
        <ScreenTitle
          c={c}
          title="Holidays"
          subtitle={loading ? 'Loading…' : `${upcomingCount} upcoming · ${holidays.length} total`}
          action={isAdminOrKeyAdmin ? (
            <PrimaryButton accent={accent} icon={Plus} label="Add" onPress={() => { setEditingId(null); setFormData({ name: '', date: '', type: 'Public', description: '' }); setShowAddCard(true); }} />
          ) : undefined}
        />

        {/* Next holiday hero */}
        {!loading && nextHoliday ? (
          <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden', marginBottom: 14 }}>
            <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -90, borderWidth: 24, borderColor: 'rgba(214,175,55,0.10)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PartyPopper size={15} color={GOLD} />
              <Text style={{ color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>NEXT HOLIDAY</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 }} numberOfLines={2}>{nextHoliday.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
              {nextDate ? nextDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>
                {nextDays === 0 ? 'Today!' : nextDays === 1 ? 'Tomorrow' : `${nextDays} days to go`}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' }}>{nextHoliday.type || 'Public'} Holiday</Text>
            </View>
          </View>
        ) : null}

        {!loading && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <StatTile c={c} isDark={isDark} icon={CalendarDays} tint="#F59E0B" label="Upcoming" value={upcomingCount} onPress={() => setFilters({ ...filters, when: 'upcoming' })} />
            <StatTile c={c} isDark={isDark} icon={Calendar} tint="#3B82F6" label={`In ${thisYear}`} value={yearCount} onPress={() => setFilters({ ...filters, year: thisYear, when: '' })} />
            <StatTile c={c} isDark={isDark} icon={Building2} tint="#10B981" label={`Public (${thisYear})`} value={publicCount} onPress={() => setFilters({ ...filters, type: 'Public', year: thisYear })} />
            <StatTile c={c} isDark={isDark} icon={Star} tint="#8B5CF6" label={`Optional (${thisYear})`} value={optionalCount} onPress={() => setFilters({ ...filters, type: 'Optional', year: thisYear })} />
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Search holidays" />
          </View>
          <FilterButton c={c} accent={accent} count={sheetCount} onPress={() => { setDraft(filters); setSheetOpen(true); }} />
        </View>

        <QuickChips
          c={c}
          accent={accent}
          value={filters.when}
          options={[
            { value: '' as When, label: 'All', count: loading ? undefined : whenCounts[''] },
            { value: 'upcoming' as When, label: 'Upcoming', count: loading ? undefined : whenCounts.upcoming },
            { value: 'past' as When, label: 'Past', count: loading ? undefined : whenCounts.past },
          ]}
          onChange={(v) => setFilters({ ...filters, when: v })}
        />
        <AppliedFilters c={c} items={applied} onClearAll={() => setFilters({ ...EMPTY, when: filters.when, limit: filters.limit })} />

        {loading ? (
          <SkeletonList c={c} height={110} />
        ) : pager.pageItems.length === 0 ? (
          <BigEmpty
            c={c}
            icon={Sparkles}
            title="No holidays found"
            text={search || applied.length || filters.when ? 'Try a different search or clear the filters.' : 'No upcoming holidays found.'}
          />
        ) : (
          pager.pageItems.map((h: any, idx: number) => (
            <HolidayCard
              key={h._id || h.id || `holiday-${idx}`}
              c={c}
              isDark={isDark}
              holiday={h}
              isNext={!!nextHoliday && (nextHoliday._id || nextHoliday.id) === (h._id || h.id)}
              canEdit={isAdminOrKeyAdmin}
              onEdit={() => handleEditHoliday(h)}
              onDelete={() => handleDeleteHoliday(h._id || h.id)}
            />
          ))
        )}

        {!loading && <Pagination c={c} accent={accent} {...pager} onChange={goToPage} />}
      </ScrollView>

      {/* Filters */}
      <BottomSheet
        c={c}
        accent={accent}
        visible={sheetOpen}
        title="Filters"
        onClose={() => setSheetOpen(false)}
        secondaryLabel="Reset"
        onSecondary={() => setDraft({ ...EMPTY, when: draft.when, limit: draft.limit })}
        primaryLabel="Show results"
        onPrimary={() => { setSheetOpen(false); setFilters(draft); }}
      >
        <SheetSection c={c} title="WHEN">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[{ v: '' as When, l: 'All' }, { v: 'upcoming' as When, l: 'Upcoming' }, { v: 'past' as When, l: 'Past' }].map((o) => (
              <Chip key={o.v || 'all'} c={c} accent={accent} label={o.l} active={draft.when === o.v} onPress={() => setDraft({ ...draft, when: o.v })} />
            ))}
          </View>
        </SheetSection>
        <SheetSection c={c} title="TYPE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip c={c} accent={accent} label="All types" active={!draft.type} onPress={() => setDraft({ ...draft, type: '' })} />
            {TYPES.map((t) => <Chip key={t} c={c} accent={accent} label={`${t} Holiday`} active={draft.type === t} onPress={() => setDraft({ ...draft, type: t })} />)}
          </View>
        </SheetSection>
        {years.length > 0 && (
          <SheetSection c={c} title="YEAR">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip c={c} accent={accent} label="All years" active={!draft.year} onPress={() => setDraft({ ...draft, year: '' })} />
              {years.map((y) => <Chip key={y} c={c} accent={accent} label={y} active={draft.year === y} onPress={() => setDraft({ ...draft, year: y })} />)}
            </View>
          </SheetSection>
        )}
        <SheetSection c={c} title="MONTH">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip c={c} accent={accent} label="Any month" active={!draft.month} onPress={() => setDraft({ ...draft, month: '' })} />
            {MONTHS.map((m, i) => {
              const v = String(i + 1).padStart(2, '0');
              return <Chip key={m} c={c} accent={accent} label={m} active={draft.month === v} onPress={() => setDraft({ ...draft, month: v })} />;
            })}
          </View>
        </SheetSection>
        <SheetSection c={c} title="RESULTS PER PAGE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {PAGE_SIZES.map((n) => <Chip key={n} c={c} accent={accent} label={String(n)} active={draft.limit === n} onPress={() => setDraft({ ...draft, limit: n })} />)}
          </View>
        </SheetSection>
      </BottomSheet>

      {/* Add / edit (admin & key admin only) */}
      {isAdminOrKeyAdmin && (
        <BottomSheet
          c={c}
          accent={accent}
          visible={showAddCard}
          title={editingId ? 'Edit holiday' : 'Add new holiday'}
          onClose={resetForm}
          secondaryLabel="Cancel"
          onSecondary={resetForm}
          primaryLabel={editingId ? 'Update holiday' : 'Save holiday'}
          onPrimary={handleSaveHoliday}
          primaryDisabled={submitLoading}
          primaryBusy={submitLoading ? <ActivityIndicator color={accentFg} /> : undefined}
        >
          <SheetSection c={c} title="HOLIDAY NAME *">
            <TextInput
              value={formData.name}
              onChangeText={(val) => setFormData({ ...formData, name: val })}
              placeholder="e.g. Christmas"
              placeholderTextColor={c.textMuted}
              style={[
                { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceLight, color: c.text, paddingHorizontal: 12, fontSize: 14 },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
            />
          </SheetSection>
          <SheetSection c={c} title="DATE *">
            <DateField c={c} label="Holiday date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
          </SheetSection>
          <SheetSection c={c} title="TYPE">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {TYPES.map((type) => (
                <Chip key={type} c={c} accent={accent} label={`${type} Holiday`} active={formData.type === type} onPress={() => setFormData({ ...formData, type })} />
              ))}
            </View>
          </SheetSection>
          <SheetSection c={c} title="DESCRIPTION">
            <TextInput
              value={formData.description}
              onChangeText={(val) => setFormData({ ...formData, description: val })}
              placeholder="Optional description..."
              placeholderTextColor={c.textMuted}
              multiline
              style={[
                { minHeight: 80, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceLight, color: c.text, padding: 12, fontSize: 14, textAlignVertical: 'top' },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
            />
          </SheetSection>
        </BottomSheet>
      )}
    </View>
  );
};
