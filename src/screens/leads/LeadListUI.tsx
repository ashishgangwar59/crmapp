import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Phone, Mail, Building2, Lock, CalendarClock, UserCheck, ChevronRight, UserPlus } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY, Avatar, StatusPill, SearchBox, inr } from '../../components/DashboardUI';
import { Chip, DateField, SheetSection } from '../investors/InvestorListUI';

// ---------------- Filters (mirror CRM web: dashboard/leads/page.tsx) ----------------

export interface LeadFilters {
  stage: string;
  status: string;
  dateFilter: string; // '' | today | yesterday | this_week | custom
  customDate: string; // YYYY-MM-DD when dateFilter === 'custom'
  employeeId: string;
  employeeName: string;
  limit: number;
}

export const EMPTY_LEAD_FILTERS: LeadFilters = {
  stage: '', status: '', dateFilter: '', customDate: '', employeeId: '', employeeName: '', limit: 10,
};

export const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'];
const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'Done', label: 'Done' },
  { value: 'Closed Won', label: 'Closed won' },
  { value: 'Closed Lost', label: 'Closed lost' },
];
const DATES = [
  { value: '', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'custom', label: 'Custom date' },
];

export function buildLeadQuery(search: string, f: LeadFilters, page: number) {
  const q = new URLSearchParams();
  if (search) q.append('search', search);
  if (f.status) q.append('status', f.status);
  if (f.stage) q.append('stage', f.stage);
  if (f.employeeId) q.append('employeeId', f.employeeId);
  q.append('page', String(page));
  q.append('limit', String(f.limit));
  const date = f.dateFilter === 'custom' ? f.customDate : f.dateFilter;
  if (date) q.append('dateFilter', date);
  return `?${q.toString()}`;
}

export function countLeadSheetFilters(f: LeadFilters) {
  return [f.status, f.dateFilter === 'custom' ? f.customDate : f.dateFilter, f.employeeId].filter(Boolean).length;
}

const prettyDate = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function describeLeadFilters(f: LeadFilters): { key: string; label: string; clear: Partial<LeadFilters> }[] {
  const out: { key: string; label: string; clear: Partial<LeadFilters> }[] = [];
  if (f.status) out.push({ key: 'status', label: STATUSES.find((s) => s.value === f.status)?.label || f.status, clear: { status: '' } });
  if (f.dateFilter && f.dateFilter !== 'custom') out.push({ key: 'date', label: DATES.find((d) => d.value === f.dateFilter)?.label || f.dateFilter, clear: { dateFilter: '' } });
  if (f.dateFilter === 'custom' && f.customDate) out.push({ key: 'date', label: prettyDate(f.customDate), clear: { dateFilter: '', customDate: '' } });
  if (f.employeeId) out.push({ key: 'emp', label: f.employeeName || 'Employee', clear: { employeeId: '', employeeName: '' } });
  return out;
}

export const ownerName = (lead: any) => {
  const o = lead?.ownerId;
  if (o && typeof o === 'object') return `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Unassigned';
  return lead?.assignedTo || lead?.owner || 'Unassigned';
};

// ---------------- Filter sheet ----------------

export function LeadFilterSheet({
  c,
  accent,
  visible,
  initial,
  employees,
  showEmployeeFilter,
  onApply,
  onClose,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  initial: LeadFilters;
  employees: any[];
  showEmployeeFilter: boolean;
  onApply: (f: LeadFilters) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [f, setF] = useState<LeadFilters>(initial);
  const [empQuery, setEmpQuery] = useState('');
  useEffect(() => { if (visible) { setF(initial); setEmpQuery(''); } }, [visible]);
  const set = (patch: Partial<LeadFilters>) => setF((p) => ({ ...p, ...patch }));

  const empList = useMemo(() => {
    const q = empQuery.trim().toLowerCase();
    return employees
      .filter((e) => !q || `${e.firstName || ''} ${e.lastName || ''} ${e.employeeCode || ''}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [employees, empQuery]);
  const onAccent = accent === GOLD ? BRAND_NAVY : '#fff';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Filter leads</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close filters" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
              <X size={18} color={c.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
            <SheetSection c={c} title="STATUS">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {STATUSES.map((o) => (
                  <Chip key={o.value || 'all'} c={c} accent={accent} label={o.label} active={f.status === o.value} onPress={() => set({ status: o.value })} />
                ))}
              </View>
            </SheetSection>

            <SheetSection c={c} title="DATE (CREATED OR FOLLOW-UP)">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {DATES.map((o) => (
                  <Chip key={o.value || 'all'} c={c} accent={accent} label={o.label} active={f.dateFilter === o.value} onPress={() => set({ dateFilter: o.value, customDate: o.value === 'custom' ? f.customDate : '' })} />
                ))}
              </View>
              {f.dateFilter === 'custom' ? (
                <View style={{ marginTop: 4 }}>
                  <DateField c={c} label="Date" value={f.customDate} onChange={(v) => set({ customDate: v })} />
                </View>
              ) : null}
            </SheetSection>

            {showEmployeeFilter ? (
              <SheetSection c={c} title="EMPLOYEE-WISE VIEW">
                <SearchBox c={c} value={empQuery} onChange={setEmpQuery} placeholder="Search employee name or code" />
                <View style={{ borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                  {[{ _id: '', firstName: 'All employees' }, ...empList].map((e: any, i: number) => {
                    const active = f.employeeId === e._id;
                    const name = `${e.firstName || ''} ${e.lastName || ''}`.trim();
                    return (
                      <TouchableOpacity
                        key={e._id || 'all'}
                        onPress={() => set({ employeeId: e._id, employeeName: e._id ? name : '' })}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border, backgroundColor: active ? c.surfaceLight : 'transparent' }}
                      >
                        <Text style={{ flex: 1, fontSize: 14, color: c.text, fontWeight: active ? '700' : '400' }} numberOfLines={1}>
                          {name}{e.employeeCode ? <Text style={{ color: c.textMuted }}>  ({e.employeeCode})</Text> : null}
                        </Text>
                        {active ? <Check size={16} color={accent} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </SheetSection>
            ) : null}

            <SheetSection c={c} title="RESULTS PER PAGE">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[10, 25, 50, 100].map((n) => (
                  <Chip key={n} c={c} accent={accent} label={String(n)} active={f.limit === n} onPress={() => set({ limit: n })} />
                ))}
              </View>
            </SheetSection>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
            <TouchableOpacity
              onPress={() => setF({ ...EMPTY_LEAD_FILTERS, stage: f.stage, limit: f.limit })}
              style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(f)}
              style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------- Lead card ----------------

const STAGE_TINT: Record<string, string> = {
  New: '#3B82F6', Contacted: '#8B5CF6', Qualified: '#14B8A6', Proposal: '#F59E0B', Negotiation: '#F97316',
};
const statusTone = (s?: string) =>
  (s === 'Closed Won' || s === 'Done' ? 'success' : s === 'Closed Lost' ? 'danger' : 'info') as 'success' | 'danger' | 'info';
const priorityColor = (p?: string) => (p === 'High' ? '#EF4444' : p === 'Low' ? '#94A3B8' : '#F59E0B');

export function LeadCard({
  c,
  isDark,
  accent,
  lead,
  canAssign,
  onOpen,
  onAssign,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  lead: any;
  canAssign: boolean;
  onOpen: () => void;
  onAssign: () => void;
}) {
  const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Lead';
  const stage = lead.stage || 'New';
  const stageTint = STAGE_TINT[stage] || c.info;
  const stageIdx = Math.max(0, STAGES.indexOf(stage));
  const follow = lead.nextFollowUp ? new Date(lead.nextFollowUp) : null;
  const overdue = follow && follow.getTime() < Date.now() && lead.status === 'Open';

  return (
    <TouchableOpacity
      onPress={onOpen}
      activeOpacity={0.8}
      style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12, opacity: lead.isLocked ? 0.85 : 1 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, flexShrink: 1 }} numberOfLines={1}>{name}</Text>
            {lead.isLocked ? <Lock size={13} color={c.danger} /> : null}
          </View>
          {lead.company ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Building2 size={12} color={c.textMuted} />
              <Text style={{ fontSize: 12, color: c.textMuted }} numberOfLines={1}>{lead.company}</Text>
            </View>
          ) : null}
        </View>
        <StatusPill label={lead.status || 'Open'} tone={statusTone(lead.status)} />
      </View>

      {/* Stage progress */}
      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {STAGES.map((s, i) => (
            <View key={s} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= stageIdx ? stageTint : c.surfaceLight }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: stageTint }}>{stage}</Text>
          <Text style={{ fontSize: 12, color: c.textMuted }}>Stage {stageIdx + 1} of 5</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
        <View style={{ flex: 1.2 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Owner</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <UserCheck size={13} color={c.text} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, flexShrink: 1 }} numberOfLines={1}>{ownerName(lead)}</Text>
          </View>
        </View>
        <View style={{ flex: 0.8 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Priority</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor(lead.priority) }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{lead.priority || 'Medium'}</Text>
          </View>
        </View>
        {Number(lead.dealValue) > 0 ? (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>Value</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: c.success, marginTop: 3 }} numberOfLines={1}>{inr(lead.dealValue)}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
        <CalendarClock size={13} color={overdue ? c.danger : c.textMuted} />
        <Text style={{ flex: 1, fontSize: 12, color: overdue ? c.danger : c.textMuted, fontWeight: overdue ? '700' : '400' }}>
          {follow ? `${overdue ? 'Overdue · ' : 'Follow-up '}${follow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'No follow-up set'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
        {lead.phone ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${String(lead.phone).replace(/\s/g, '')}`)}
            accessibilityLabel={`Call ${name}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(16,185,129,' + (isDark ? '0.18)' : '0.12)') }}
          >
            <Phone size={15} color="#10B981" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>Call</Text>
          </TouchableOpacity>
        ) : null}
        {lead.email ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${lead.email}`)}
            accessibilityLabel={`Email ${name}`}
            style={{ width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}
          >
            <Mail size={15} color={c.text} />
          </TouchableOpacity>
        ) : null}
        {canAssign ? (
          <TouchableOpacity
            onPress={onAssign}
            accessibilityLabel="Assign lead"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.info + (isDark ? '22' : '14') }}
          >
            <UserPlus size={15} color={c.info} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.info }}>Assign</Text>
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={onOpen}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: accent }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: accent === GOLD ? BRAND_NAVY : '#fff' }}>Details</Text>
          <ChevronRight size={15} color={accent === GOLD ? BRAND_NAVY : '#fff'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
