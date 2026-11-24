// Presentational building blocks for the Payroll screen (cards, filter sheet, month picker, slip viewer).
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, Square, SquareCheck, Eye, Sparkles, Download, Mail, ChevronLeft, ChevronRight, Briefcase, Lock,
} from 'lucide-react-native';
import { Palette, Avatar, StatusPill, GOLD, BRAND_NAVY, inr } from '../../components/DashboardUI';
import { Chip, SheetSection } from '../investors/InvestorListUI';
import { slipMonthName, getPayslipHtml, fitPayslipToScreen } from './payslipHtml';

// ---------------- Types & helpers ----------------

export type PayrollStatusFilter = '' | 'NotGenerated' | 'Draft' | 'Approved' | 'Paid' | 'Locked';
export type SortDir = 'asc' | 'desc';

export interface PayrollFilters {
  status: PayrollStatusFilter;
  department: string;
  empStatus: string;
  sortBy: string;
  sortDir: SortDir;
  limit: number;
}

export const EMPTY_PAYROLL_FILTERS: PayrollFilters = {
  status: '', department: '', empStatus: '', sortBy: 'name', sortDir: 'asc', limit: 10,
};

/** One list row: an employee and (if generated) their payroll for the month. */
export interface PayrollRow {
  key: string;
  emp: any;
  payroll: any | null;
}

// Same sort options the web page offers for each view.
export const SORT_OPTIONS_EMPLOYEES = [
  { value: 'name', label: 'Employee name' },
  { value: 'code', label: 'Employee code' },
  { value: 'designation', label: 'Designation' },
  { value: 'department', label: 'Department' },
  { value: 'status', label: 'Status' },
];
export const SORT_OPTIONS_SLIPS = [
  { value: 'name', label: 'Employee name' },
  { value: 'month', label: 'Month' },
  { value: 'paidDays', label: 'Paid days' },
  { value: 'salary', label: 'Net salary' },
  { value: 'status', label: 'Status' },
];

export const statusTone = (s?: string | null) =>
  (s === 'Paid' ? 'success' : s === 'Approved' ? 'info' : s === 'Locked' ? 'warning' : s ? 'muted' : 'danger') as
  'success' | 'info' | 'warning' | 'muted' | 'danger';

export const ymMonth = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split('-').map(Number);
  return ymMonth(new Date(y, m - 1 + delta, 1));
};

export const prettyMonth = (ym?: string) => {
  if (!ym || !/^\d{4}-\d{2}/.test(ym)) return ym || '';
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const longMonth = (ym?: string) => {
  if (!ym || !/^\d{4}-\d{2}/.test(ym)) return ym || '';
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const empName = (emp: any) => `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim();

/** Same comparison the web payroll page uses, applied to a row. */
export function compareRows(a: PayrollRow, b: PayrollRow, sortBy: string, dir: SortDir) {
  const val = (r: PayrollRow): string | number => {
    const e = r.emp || {};
    const p = r.payroll || {};
    switch (sortBy) {
      case 'code': return e.employeeCode || '';
      case 'designation': return e.designation || '';
      case 'department': return e.department || '';
      case 'salary': return Number(p.netSalary || 0);
      case 'paidDays': return Number(p.paidDays || 0);
      case 'status': return r.payroll ? (p.status || '') : '';
      case 'month': return p.monthYear || '';
      default: return empName(e).toLowerCase();
    }
  };
  const A = val(a);
  const B = val(b);
  const res = typeof A === 'number' && typeof B === 'number' ? A - B : String(A).localeCompare(String(B));
  return dir === 'asc' ? res : -res;
}

export function countPayrollSheetFilters(f: PayrollFilters) {
  let n = 0;
  if (f.department) n++;
  if (f.empStatus) n++;
  if (f.sortBy !== 'name' || f.sortDir !== 'asc') n++;
  return n;
}

export function describePayrollFilters(f: PayrollFilters, slipsMode: boolean) {
  const out: { key: string; label: string; clear: Partial<PayrollFilters> }[] = [];
  if (f.department) out.push({ key: 'dept', label: `Dept: ${f.department}`, clear: { department: '' } });
  if (f.empStatus) out.push({ key: 'empStatus', label: `Employee: ${f.empStatus}`, clear: { empStatus: '' } });
  if (f.sortBy !== 'name' || f.sortDir !== 'asc') {
    const opts = slipsMode ? SORT_OPTIONS_SLIPS : SORT_OPTIONS_EMPLOYEES;
    const lbl = opts.find((o) => o.value === f.sortBy)?.label || 'Employee name';
    out.push({ key: 'sort', label: `Sort: ${lbl} ${f.sortDir === 'asc' ? '↑' : '↓'}`, clear: { sortBy: 'name', sortDir: 'asc' } });
  }
  return out;
}

const onAccentOf = (accent: string) => (accent === GOLD ? BRAND_NAVY : '#fff');

// ---------------- Bottom sheet shell ----------------

function Sheet({
  c, title, visible, onClose, children, footer,
}: { c: Palette; title: string; visible: boolean; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
              <X size={18} color={c.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: footer ? 12 : Math.max(insets.bottom, 16) + 8 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? (
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: c.border }}>
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// ---------------- Filter sheet ----------------

export function PayrollFilterSheet({
  c, accent, visible, initial, slipsMode, departments, empStatuses, onApply, onClose,
}: {
  c: Palette;
  accent: string;
  visible: boolean;
  initial: PayrollFilters;
  slipsMode: boolean;
  departments: string[];
  empStatuses: string[];
  onApply: (f: PayrollFilters) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<PayrollFilters>(initial);
  useEffect(() => { if (visible) setF(initial); }, [visible]);
  const set = (patch: Partial<PayrollFilters>) => setF((prev) => ({ ...prev, ...patch }));
  const sortOptions = slipsMode ? SORT_OPTIONS_SLIPS : SORT_OPTIONS_EMPLOYEES;

  return (
    <Sheet
      c={c}
      title="Filters"
      visible={visible}
      onClose={onClose}
      footer={
        <>
          <TouchableOpacity
            onPress={() => setF({ ...EMPTY_PAYROLL_FILTERS, status: f.status, limit: f.limit })}
            style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onApply(f)}
            style={{ flex: 2, minHeight: 50, borderRadius: 14, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: onAccentOf(accent) }}>Show results</Text>
          </TouchableOpacity>
        </>
      }
    >
      <SheetSection c={c} title="SORT BY">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {sortOptions.map((o) => (
            <Chip key={o.value} c={c} accent={accent} label={o.label} active={f.sortBy === o.value} onPress={() => set({ sortBy: o.value })} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          <Chip c={c} accent={accent} label="Ascending ↑" active={f.sortDir === 'asc'} onPress={() => set({ sortDir: 'asc' })} />
          <Chip c={c} accent={accent} label="Descending ↓" active={f.sortDir === 'desc'} onPress={() => set({ sortDir: 'desc' })} />
        </View>
      </SheetSection>

      {departments.length > 0 && (
        <SheetSection c={c} title="DEPARTMENT">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip c={c} accent={accent} label="All" active={!f.department} onPress={() => set({ department: '' })} />
            {departments.map((d) => (
              <Chip key={d} c={c} accent={accent} label={d} active={f.department === d} onPress={() => set({ department: d })} />
            ))}
          </View>
        </SheetSection>
      )}

      {!slipsMode && empStatuses.length > 1 && (
        <SheetSection c={c} title="EMPLOYEE STATUS">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip c={c} accent={accent} label="All" active={!f.empStatus} onPress={() => set({ empStatus: '' })} />
            {empStatuses.map((s) => (
              <Chip key={s} c={c} accent={accent} label={s} active={f.empStatus === s} onPress={() => set({ empStatus: s })} />
            ))}
          </View>
        </SheetSection>
      )}

      <SheetSection c={c} title="RESULTS PER PAGE">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[10, 20, 50, 100].map((n) => (
            <Chip key={n} c={c} accent={accent} label={String(n)} active={f.limit === n} onPress={() => set({ limit: n })} />
          ))}
        </View>
      </SheetSection>
    </Sheet>
  );
}

// ---------------- Month picker ----------------

export function MonthBar({
  c, accent, monthYear, allowAll, onChange, onOpenPicker,
}: {
  c: Palette; accent: string; monthYear: string; allowAll: boolean;
  onChange: (m: string) => void; onOpenPicker: () => void;
}) {
  const base = monthYear || ymMonth(new Date());
  const Btn = ({ dir }: { dir: -1 | 1 }) => {
    const Icon = dir === -1 ? ChevronLeft : ChevronRight;
    return (
      <TouchableOpacity
        onPress={() => onChange(shiftMonth(base, dir))}
        accessibilityLabel={dir === -1 ? 'Previous month' : 'Next month'}
        style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}
      >
        <Icon size={18} color={c.text} />
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 6, marginBottom: 14 }}>
      <Btn dir={-1} />
      <TouchableOpacity onPress={onOpenPicker} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }} accessibilityLabel="Choose month">
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 0.6 }}>PAY MONTH</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: monthYear ? c.text : accent, marginTop: 1 }}>
          {monthYear ? longMonth(monthYear) : allowAll ? 'All months' : longMonth(base)}
        </Text>
      </TouchableOpacity>
      <Btn dir={1} />
    </View>
  );
}

export function MonthPickerSheet({
  c, accent, visible, value, allowAll, onSelect, onClose,
}: {
  c: Palette; accent: string; visible: boolean; value: string; allowAll: boolean;
  onSelect: (m: string) => void; onClose: () => void;
}) {
  const now = new Date();
  const months = Array.from({ length: 24 }, (_, i) => ymMonth(new Date(now.getFullYear(), now.getMonth() + 1 - i, 1)));
  const years = Array.from(new Set(months.map((m) => m.slice(0, 4))));
  return (
    <Sheet c={c} title="Select month" visible={visible} onClose={onClose}>
      {allowAll && (
        <SheetSection c={c} title="ALL SLIPS">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip c={c} accent={accent} label="All months" active={!value} onPress={() => onSelect('')} />
          </View>
        </SheetSection>
      )}
      {years.map((y) => (
        <SheetSection key={y} c={c} title={y}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {months.filter((m) => m.startsWith(y)).map((m) => (
              <Chip key={m} c={c} accent={accent} label={prettyMonth(m).split(' ')[0]} active={value === m} onPress={() => onSelect(m)} />
            ))}
          </View>
        </SheetSection>
      ))}
    </Sheet>
  );
}

// ---------------- Cards ----------------

function AmountsBox({ c, payroll }: { c: Palette; payroll: any }) {
  const Cell = ({ label, value, color, align }: { label: string; value: string; color: string; align?: 'flex-start' | 'center' | 'flex-end' }) => (
    <View style={{ flex: 1, alignItems: align || 'flex-start' }}>
      <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '800', color, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12 }}>
      <Cell label="Gross" value={inr(payroll.grossSalary)} color={c.text} />
      <Cell label="Deductions" value={`-${inr(payroll.totalDeductions)}`} color={c.danger} align="center" />
      <Cell label="Net salary" value={inr(payroll.netSalary)} color={c.success} align="flex-end" />
    </View>
  );
}

function ActionBtn({ icon: Icon, label, onPress, tint, filled, disabled, isDark }: any) {
  const fg = filled ? onAccentOf(tint) : tint;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 11,
        backgroundColor: filled ? tint : tint + (isDark ? '22' : '14'), opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon size={15} color={fg} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Admin month view: an employee with their payroll for the month (or a Generate action). */
export function PayrollEmployeeCard({
  c, isDark, accent, row, selected, generating, onToggle, onView, onGenerate,
}: {
  c: Palette; isDark: boolean; accent: string; row: PayrollRow; selected: boolean; generating: boolean;
  onToggle: () => void; onView: () => void; onGenerate: () => void;
}) {
  const { emp, payroll } = row;
  const canSelect = !!payroll && payroll.status === 'Approved';
  const name = empName(emp) || '—';
  const sub = [emp.designation, emp.department].filter(Boolean).join(' · ');
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: selected ? accent : c.border, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: accent, marginTop: 1 }} numberOfLines={1}>{emp.employeeCode || '—'}</Text>
          {sub ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{sub}</Text> : null}
        </View>
        <StatusPill label={payroll ? (payroll.status || 'Draft') : 'Not generated'} tone={statusTone(payroll ? payroll.status || 'Draft' : null)} />
      </View>

      {payroll ? (
        <AmountsBox c={c} payroll={payroll} />
      ) : (
        <View style={{ backgroundColor: c.surfaceLight, borderRadius: 14, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Briefcase size={15} color={c.textMuted} />
          <Text style={{ fontSize: 13, color: c.textMuted, flex: 1 }}>Payroll not generated for this month yet.</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, alignItems: 'center' }}>
        {payroll ? (
          <>
            <TouchableOpacity
              onPress={onToggle}
              disabled={!canSelect}
              accessibilityLabel={canSelect ? (selected ? 'Deselect for payment' : 'Select for payment') : payroll.status === 'Paid' ? 'Already paid' : 'Must be approved to pay'}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 10, borderRadius: 11, backgroundColor: c.surfaceLight, opacity: canSelect ? 1 : 0.5 }}
            >
              {selected ? <SquareCheck size={18} color={accent} /> : canSelect ? <Square size={18} color={c.textMuted} /> : <Lock size={16} color={c.textMuted} />}
              <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? accent : c.textMuted }}>
                {payroll.status === 'Paid' ? 'Paid' : canSelect ? (selected ? 'Selected' : 'Select') : 'Approve to pay'}
              </Text>
            </TouchableOpacity>
            <ActionBtn icon={Eye} label="View slip" onPress={onView} tint={accent} filled isDark={isDark} />
          </>
        ) : (
          <ActionBtn icon={Sparkles} label={generating ? 'Generating…' : 'Generate payroll'} onPress={onGenerate} tint={accent} filled disabled={generating} isDark={isDark} />
        )}
      </View>
    </View>
  );
}

/** Slip list view (employee "My Payslips", or admin "All months"). */
export function PayslipCard({
  c, isDark, accent, payroll, showEmployee, selectable, selected, onToggle, onView,
}: {
  c: Palette; isDark: boolean; accent: string; payroll: any; showEmployee: boolean;
  selectable: boolean; selected: boolean; onToggle: () => void; onView: () => void;
}) {
  const emp = payroll.employeeId || {};
  const canSelect = selectable && payroll.status === 'Approved';
  const title = showEmployee ? empName(emp) || '—' : longMonth(payroll.monthYear) || payroll.monthYear || '—';
  const subtitle = showEmployee
    ? [emp.employeeCode, longMonth(payroll.monthYear)].filter(Boolean).join(' · ')
    : [emp.designation, emp.department].filter(Boolean).join(' · ');
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: selected ? accent : c.border, padding: 14, marginBottom: 12 }}>
      <TouchableOpacity onPress={onView} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {showEmployee ? (
          <Avatar name={title} size={44} />
        ) : (
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: accent + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: accent }}>{prettyMonth(payroll.monthYear).split(' ')[0]?.toUpperCase()}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: accent }}>{String(payroll.monthYear || '').slice(0, 4)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{subtitle}</Text> : null}
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>{payroll.paidDays ?? '—'} paid days</Text>
        </View>
        <StatusPill label={payroll.status || 'Draft'} tone={statusTone(payroll.status || 'Draft')} />
      </TouchableOpacity>

      <AmountsBox c={c} payroll={payroll} />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, alignItems: 'center' }}>
        {selectable ? (
          <TouchableOpacity
            onPress={onToggle}
            disabled={!canSelect}
            accessibilityLabel={canSelect ? 'Select for payment' : 'Not payable'}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 10, borderRadius: 11, backgroundColor: c.surfaceLight, opacity: canSelect ? 1 : 0.5 }}
          >
            {selected ? <SquareCheck size={18} color={accent} /> : canSelect ? <Square size={18} color={c.textMuted} /> : <Lock size={16} color={c.textMuted} />}
            <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? accent : c.textMuted }}>
              {payroll.status === 'Paid' ? 'Paid' : canSelect ? (selected ? 'Selected' : 'Select') : 'Approve to pay'}
            </Text>
          </TouchableOpacity>
        ) : null}
        <ActionBtn icon={Eye} label="View slip" onPress={onView} tint={accent} filled isDark={isDark} />
      </View>
    </View>
  );
}

// ---------------- Salary slip viewer ----------------

export function PayslipModal({
  c, isDark, accent, slip, onClose, onPdf, onEmail,
}: {
  c: Palette; isDark: boolean; accent: string; slip: any | null;
  onClose: () => void; onPdf: () => void; onEmail: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<'' | 'pdf' | 'email'>('');
  const run = async (kind: 'pdf' | 'email', fn: () => any) => {
    if (busy) return;
    setBusy(kind);
    try { await fn(); } finally { setBusy(''); }
  };

  // Live preview of the exact slip that is downloaded / emailed (same design as the web slip).
  const [preview, setPreview] = useState<{ id: string; html: string } | null>(null);
  const [previewError, setPreviewError] = useState('');
  useEffect(() => {
    if (!slip) { setPreview(null); setPreviewError(''); return; }
    let alive = true;
    setPreview(null);
    setPreviewError('');
    getPayslipHtml(slip)
      .then(({ html }) => { if (alive) setPreview({ id: String(slip._id || ''), html: fitPayslipToScreen(html) }); })
      .catch(() => { if (alive) setPreviewError('Could not load the salary slip.'); });
    return () => { alive = false; };
  }, [slip]);

  const body = !slip ? null : (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0b1220' : '#e9edf3', padding: 10 }}>
      {/* Quick summary above the document */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1, color: accent }} numberOfLines={1}>
            {empName(slip.employeeId) || 'PAYSLIP'} · {slipMonthName(slip.monthYear)}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: c.text, marginTop: 2 }} numberOfLines={1}>
            {inr(slip.netSalary || 0)} <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>net pay</Text>
          </Text>
        </View>
        <StatusPill label={slip.status || 'Draft'} tone={statusTone(slip.status || 'Draft')} />
      </View>
      <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: c.border }}>
        {preview ? (
          Platform.OS === 'web' ? (
            React.createElement('iframe', { key: preview.id, srcDoc: preview.html, title: 'Salary slip', style: { width: '100%', height: '100%', border: 'none' } })
          ) : (
            <WebView key={preview.id} originWhitelist={['*']} source={{ html: preview.html }} style={{ flex: 1, backgroundColor: '#fff' }} />
          )
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            {previewError ? (
              <Text style={{ color: c.danger, fontWeight: '700', textAlign: 'center' }}>{previewError}</Text>
            ) : (
              <>
                <ActivityIndicator color={BRAND_NAVY} />
                <Text style={{ color: '#6b7280', marginTop: 10, fontSize: 13 }}>Loading salary slip…</Text>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const onAccent = onAccentOf(accent);
  return (
    <Modal visible={!!slip} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: Math.max(insets.top, 20) + 8, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close salary slip" style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceLight }}>
            <X size={20} color={c.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: c.text }}>Salary Slip</Text>
          <View style={{ width: 38 }} />
        </View>

        {body}

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border }}>
          <TouchableOpacity
            onPress={() => run('email', onEmail)}
            disabled={!!busy}
            style={{ flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy && busy !== 'email' ? 0.5 : 1 }}
          >
            <Mail size={17} color={c.text} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{busy === 'email' ? 'Preparing…' : 'Email PDF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => run('pdf', onPdf)}
            disabled={!!busy}
            style={{ flex: 1, minHeight: 50, borderRadius: 14, backgroundColor: accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy && busy !== 'pdf' ? 0.5 : 1 }}
          >
            <Download size={17} color={onAccent} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: onAccent }}>{busy === 'pdf' ? 'Preparing…' : 'Download PDF'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

