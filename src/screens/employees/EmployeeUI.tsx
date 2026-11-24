import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, TextInput, TextInputProps } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Calendar, Eye, Pencil, Trash2, Mail, Phone, Building2, Briefcase, Hash, CalendarDays } from 'lucide-react-native';
import { Palette, GOLD, BRAND_NAVY, Avatar, StatusPill } from '../../components/DashboardUI';
import { Chip, SheetSection } from '../investors/InvestorListUI';

// ---------------- Filters (mirror CRM web: dashboard/employees/page.tsx + /api/employees) ----------------

export type SortDirection = 'asc' | 'desc';

export interface EmployeeFilters {
  status: string;
  department: string; // supported by the API (exact match); not exposed on the web page
  sortBy: string;
  sortDirection: SortDirection;
  limit: number;
}

export const EMPTY_EMP_FILTERS: EmployeeFilters = {
  status: '', department: '', sortBy: 'createdAt', sortDirection: 'desc', limit: 10,
};

export const EMP_STATUSES = ['Active', 'Inactive', 'Notice Period', 'Resigned', 'Absconding'];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest added' },
  { value: 'name', label: 'Name' },
  { value: 'employeeCode', label: 'Code' },
  { value: 'department', label: 'Department' },
  { value: 'designation', label: 'Designation' },
  { value: 'status', label: 'Status' },
];

/** Same params the web sends: search, status, page, limit, sortBy, sortDirection (+ department when chosen). */
export function buildEmployeeQuery(search: string, f: EmployeeFilters, page: number) {
  const p: string[] = [
    `search=${encodeURIComponent(search)}`,
    `status=${encodeURIComponent(f.status)}`,
    `page=${page}`,
    `limit=${f.limit}`,
    `sortBy=${f.sortBy}`,
    `sortDirection=${f.sortDirection}`,
  ];
  if (f.department) p.push(`department=${encodeURIComponent(f.department)}`);
  return `?${p.join('&')}`;
}

const isDefaultSort = (f: EmployeeFilters) => f.sortBy === 'createdAt' && f.sortDirection === 'desc';

export const directionLabel = (sortBy: string, dir: SortDirection) =>
  sortBy === 'createdAt' ? (dir === 'desc' ? 'Newest first' : 'Oldest first') : dir === 'asc' ? 'A–Z' : 'Z–A';

/** Filters set inside the sheet (status has its own quick chips). */
export function countEmpSheetFilters(f: EmployeeFilters) {
  return [f.department, !isDefaultSort(f)].filter(Boolean).length;
}

export function describeEmpFilters(f: EmployeeFilters): { key: string; label: string; clear: Partial<EmployeeFilters> }[] {
  const out: { key: string; label: string; clear: Partial<EmployeeFilters> }[] = [];
  if (f.department) out.push({ key: 'dept', label: `Dept: ${f.department}`, clear: { department: '' } });
  if (!isDefaultSort(f)) {
    const name = SORT_OPTIONS.find((o) => o.value === f.sortBy)?.label || f.sortBy;
    out.push({ key: 'sort', label: `Sort: ${name} · ${directionLabel(f.sortBy, f.sortDirection)}`, clear: { sortBy: 'createdAt', sortDirection: 'desc' } });
  }
  return out;
}

export const statusTone = (s?: string) =>
  (s === 'Active' || !s ? 'success' : s === 'Notice Period' ? 'warning' : s === 'Inactive' ? 'muted' : 'danger') as
    'success' | 'warning' | 'muted' | 'danger';

export const prettyDate = (s?: string) => {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d.getTime()) ? String(s) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const onAccentOf = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

// ---------------- Filter sheet ----------------

export function EmployeeFilterSheet({
  c,
  accent,
  visible,
  initial,
  departments,
  onApply,
  onClose,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  initial: EmployeeFilters;
  departments: string[];
  onApply: (f: EmployeeFilters) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [f, setF] = useState<EmployeeFilters>(initial);
  useEffect(() => { if (visible) setF(initial); }, [visible]);
  const set = (patch: Partial<EmployeeFilters>) => setF((prev) => ({ ...prev, ...patch }));
  const onAccent = onAccentOf(accent);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Filters</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close filters" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
              <X size={18} color={c.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
            <SheetSection c={c} title="STATUS">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['', ...EMP_STATUSES].map((s) => (
                  <Chip key={s || 'all'} c={c} accent={accent} label={s || 'All statuses'} active={f.status === s} onPress={() => set({ status: s })} />
                ))}
              </View>
            </SheetSection>

            <SheetSection c={c} title="DEPARTMENT">
              {departments.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['', ...departments].map((d) => (
                    <Chip key={d || 'all'} c={c} accent={accent} label={d || 'All departments'} active={f.department === d} onPress={() => set({ department: d })} />
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 13, color: c.textMuted }}>No departments found.</Text>
              )}
            </SheetSection>

            <SheetSection c={c} title="SORT BY">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {SORT_OPTIONS.map((o) => (
                  <Chip
                    key={o.value} c={c} accent={accent} label={o.label} active={f.sortBy === o.value}
                    onPress={() => set({ sortBy: o.value, sortDirection: o.value === 'createdAt' ? 'desc' : 'asc' })}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 4, marginBottom: 8 }}>Order</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {(f.sortBy === 'createdAt' ? (['desc', 'asc'] as SortDirection[]) : (['asc', 'desc'] as SortDirection[])).map((d) => (
                  <Chip key={d} c={c} accent={accent} label={directionLabel(f.sortBy, d)} active={f.sortDirection === d} onPress={() => set({ sortDirection: d })} />
                ))}
              </View>
            </SheetSection>

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
              onPress={() => setF({ ...EMPTY_EMP_FILTERS, limit: f.limit })}
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

// ---------------- Employee card ----------------

export function EmployeeCard({
  c,
  isDark,
  accent,
  emp,
  onView,
  onEdit,
  onDelete,
}: {
  c: Palette;
  isDark: boolean;
  accent: string;
  emp: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || '—';
  const onAccent = onAccentOf(accent);

  const IconBtn = ({ icon: Icon, label, onPress, tint }: any) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={{ width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: tint + (isDark ? '22' : '14') }}
    >
      <Icon size={16} color={tint} />
    </TouchableOpacity>
  );

  const Fact = ({ icon: Icon, label, value }: any) => (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon size={11} color={c.textMuted} />
        <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, marginTop: 3 }} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12 }}>
      <TouchableOpacity onPress={onView} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: accent, marginTop: 1 }} numberOfLines={1}>{emp.employeeCode || '—'}</Text>
        </View>
        <StatusPill label={emp.status || 'Active'} tone={statusTone(emp.status)} />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 10 }}>
        {emp.email ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
            <Mail size={13} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted, flexShrink: 1 }} numberOfLines={1}>{emp.email}</Text>
          </View>
        ) : null}
        {emp.phone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Phone size={13} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{emp.phone}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
        <Fact icon={Building2} label="Department" value={emp.department} />
        <Fact icon={Briefcase} label="Designation" value={emp.designation} />
        <Fact icon={CalendarDays} label="Joined" value={prettyDate(emp.dateOfJoining)} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
        <TouchableOpacity
          onPress={onView}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 10, backgroundColor: accent }}
        >
          <Eye size={15} color={onAccent} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: onAccent }}>View profile</Text>
        </TouchableOpacity>
        {emp.employeeType ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 38, borderRadius: 10, backgroundColor: c.surfaceLight }}>
            <Hash size={12} color={c.textMuted} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>{emp.employeeType}</Text>
          </View>
        ) : null}
        <IconBtn icon={Pencil} label="Edit employee" onPress={onEdit} tint={c.info} />
        <IconBtn icon={Trash2} label="Delete employee" onPress={onDelete} tint={c.danger} />
      </View>
    </View>
  );
}

export function EmployeeCardSkeleton({ c, index }: { c: Palette; index: number }) {
  const bar = (w: any, h = 10, mt = 0) => <View style={{ width: w, height: h, borderRadius: 6, backgroundColor: c.surfaceLight, marginTop: mt }} />;
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 12, opacity: 1 - index * 0.2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceLight }} />
        <View style={{ flex: 1 }}>
          {bar('55%', 14)}
          {bar('30%', 10, 6)}
        </View>
        <View style={{ width: 56, height: 22, borderRadius: 11, backgroundColor: c.surfaceLight }} />
      </View>
      {bar('70%', 10, 14)}
      <View style={{ height: 56, borderRadius: 14, backgroundColor: c.surfaceLight, marginTop: 12 }} />
      <View style={{ height: 38, borderRadius: 10, backgroundColor: c.surfaceLight, marginTop: 12 }} />
    </View>
  );
}

// ---------------- Detail building blocks ----------------

export function DetailSection({ c, isDark, icon: Icon, tint, title, children }: { c: Palette; isDark: boolean; icon: any; tint: string; title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={tint} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 }}>{children}</View>
    </View>
  );
}

export function InfoItem({ c, label, value, full }: { c: Palette; label: string; value?: any; full?: boolean }) {
  return (
    <View style={{ width: full ? '100%' : '50%', paddingRight: 8 }}>
      <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600', marginBottom: 3 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: c.text, fontWeight: '600' }} selectable>{value || '-'}</Text>
    </View>
  );
}

// ---------------- Form building blocks ----------------

export function FormLabel({ c, children, tint }: { c: Palette; children: React.ReactNode; tint?: string }) {
  return <Text style={{ fontSize: 13, fontWeight: '700', color: tint || c.text, marginBottom: 6, marginTop: 14 }}>{children}</Text>;
}

export function FormInput({ c, multiline, style, ...rest }: { c: Palette } & TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={c.textMuted}
      multiline={multiline}
      {...rest}
      style={[
        {
          minHeight: multiline ? 72 : 48, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceLight,
          paddingHorizontal: 14, paddingVertical: multiline ? 12 : 10, fontSize: 15, color: c.text,
          textAlignVertical: multiline ? 'top' : 'center',
        },
        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
        style,
      ]}
    />
  );
}

export function OptionRow({ c, accent, options, value, onChange }: { c: Palette; accent: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {options.map((o) => (
        <Chip key={o} c={c} accent={accent} label={o} active={value === o} onPress={() => onChange(o)} />
      ))}
    </View>
  );
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** YYYY-MM-DD date input: native picker on phones, text field on web. */
export function FormDateField({
  c, accent, value, onChange, placeholder, fallback, maximumDate,
}: {
  c: Palette; accent: string; value: string; onChange: (v: string) => void; placeholder: string; fallback: Date; maximumDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const box = {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, minHeight: 48, borderRadius: 12,
    borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceLight, paddingHorizontal: 14,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={box}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, color: c.text, fontSize: 15, outlineStyle: 'none' } as any}
        />
        <Calendar size={18} color={accent} />
      </View>
    );
  }

  const current = value && !isNaN(new Date(value).getTime()) ? new Date(value) : fallback;
  return (
    <View>
      <TouchableOpacity style={box} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={{ color: value ? c.text : c.textMuted, fontSize: 15 }}>{value ? prettyDate(value) : placeholder}</Text>
        <Calendar size={18} color={accent} />
      </TouchableOpacity>
      {open && (
        <View>
          <DateTimePicker
            value={current}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumDate}
            onChange={(event: any, selectedDate?: Date) => {
              setOpen(Platform.OS === 'ios');
              if (selectedDate) onChange(ymd(selectedDate));
            }}
          />
          {Platform.OS === 'ios' ? (
            <TouchableOpacity onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ color: accent, fontWeight: '700', fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}
