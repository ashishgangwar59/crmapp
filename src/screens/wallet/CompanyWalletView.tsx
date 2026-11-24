import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import {
  Wallet, Plus, Download, ArrowDownRight, ArrowUpRight, SearchX, Receipt, IndianRupee, Smartphone, User,
} from 'lucide-react-native';
import { apiCall } from '../../services/api';
import { useAppTheme, Card, SearchBox, StatTile, inr, inrShort, GOLD, BRAND_NAVY, Palette } from '../../components/DashboardUI';
import { usePagination, Pagination } from '../../components/Pagination';
import { Chip, SheetSection } from '../investors/InvestorListUI';
import {
  DateFilter, EMPTY_DATE, matchesDate, describeDate, DateFilterSection, BottomSheet, FilterButton, QuickChips,
  AppliedChips, PageSizeSection, ListSkeleton, BigEmpty, dateTime, onAccent, exportTablePdf,
} from '../reports/shared';

// Mirrors CRM web: dashboard/wallet/page.tsx
//   GET  /api/wallet               → { balance, transactions } (latest 100, no query params → client-side filters/paging)
//   POST /api/wallet/transaction   → { type: 'Credit' | 'Debit', amount, description }

type TxType = '' | 'Credit' | 'Debit';
type Source = '' | 'Manual' | 'SalaryPayment';

interface Filters {
  source: Source;
  date: DateFilter;
  limit: number;
}
const EMPTY: Filters = { source: '', date: EMPTY_DATE, limit: 10 };
const EMPTY_FORM = { type: 'Credit', amount: '', description: '', upiRef: '' };

const byName = (tx: any) => `${tx.createdBy?.firstName || ''} ${tx.createdBy?.lastName || ''}`.trim();
const salaryFor = (tx: any) => {
  const e = tx.referenceId?.employeeId;
  const n = `${e?.firstName || ''} ${e?.lastName || ''}`.trim();
  return n ? `${n}${e?.employeeCode ? ` (${e.employeeCode})` : ''}${tx.referenceId?.monthYear ? ` · ${tx.referenceId.monthYear}` : ''}` : '';
};

function Field({ c, label, children }: { c: Palette; label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: c.textMuted, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

export const CompanyWalletView = () => {
  const { c, isDark, accent } = useAppTheme();
  const [wallet, setWallet] = useState<{ balance: number; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [txType, setTxType] = useState<TxType>('');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);

  const fetchWallet = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiCall('/api/wallet');
      if (res.success && res.data) {
        setWallet(res.data.data || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransaction = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Validation Error', 'Please enter amount and description.');
      return;
    }
    if (formData.type === 'UPI Top-up' && !formData.upiRef.trim()) {
      Alert.alert('Validation Error', 'Please enter the UPI reference number.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res: any = await apiCall('/api/wallet/transaction', {
        method: 'POST',
        body: JSON.stringify({
          type: formData.type === 'UPI Top-up' ? 'Credit' : formData.type,
          amount: Number(formData.amount),
          description: formData.type === 'UPI Top-up' ? `${formData.description} (UPI Ref: ${formData.upiRef})` : formData.description,
        }),
      });

      if (res.success) {
        Alert.alert('Success', res.data?.message || res.message || 'Transaction executed successfully!');
        setShowForm(false);
        setFormData(EMPTY_FORM);
        fetchWallet();
      } else {
        Alert.alert('Error', res.error || 'Transaction failed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Transaction failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const txs: any[] = Array.isArray(wallet?.transactions) ? wallet!.transactions : [];

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return txs.filter((tx) => {
      if (filters.source && tx.referenceType !== filters.source) return false;
      if (!matchesDate(tx.createdAt, filters.date)) return false;
      if (!q) return true;
      return [tx.description, byName(tx), salaryFor(tx), tx.amount, tx.type].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [txs, search, filters]);
  const filtered = useMemo(() => (txType ? baseFiltered.filter((t) => t.type === txType) : baseFiltered), [baseFiltered, txType]);
  const pg = usePagination(filtered, filters.limit, `${search}|${txType}|${JSON.stringify(filters)}`);

  const goToPage = (p: number) => {
    pg.setPage(p);
    scrollRef.current?.scrollTo({ y: Math.max(0, listY.current - 8), animated: true });
  };

  const sum = (list: any[], type: string) => list.filter((t) => t.type === type).reduce((a, t) => a + (Number(t.amount) || 0), 0);
  const totalIn = sum(txs, 'Credit');
  const totalOut = sum(txs, 'Debit');
  const salaryPaid = txs.filter((t) => t.type === 'Debit' && t.referenceType === 'SalaryPayment').reduce((a, t) => a + (Number(t.amount) || 0), 0);

  const applied: { key: string; label: string }[] = [];
  if (filters.source) applied.push({ key: 'source', label: filters.source === 'Manual' ? 'Manual entries' : 'Salary payments' });
  const dd = describeDate(filters.date);
  if (dd) applied.push({ key: 'date', label: dd.label });

  const removeApplied = (key: string) => {
    if (key === 'source') setFilters({ ...filters, source: '' });
    if (key === 'date') setFilters({ ...filters, date: EMPTY_DATE });
  };

  // Replaces the old placeholder alert: exports the currently filtered ledger as a PDF statement.
  const exportStatement = async () => {
    if (filtered.length === 0) { Alert.alert('Export Statement', 'No transactions to export.'); return; }
    try {
      await exportTablePdf({
        title: 'Company Wallet Statement',
        subtitle: `${filtered.length} transactions · Generated on ${new Date().toLocaleString('en-IN')}`,
        headers: ['Date', 'Description', 'By', 'Type', 'Amount', 'Balance After'],
        rows: filtered.map((tx) => [
          dateTime(tx.createdAt),
          tx.description + (salaryFor(tx) ? ` — ${salaryFor(tx)}` : ''),
          byName(tx) || '—',
          tx.type,
          `${tx.type === 'Credit' ? '+' : '-'}${inr(tx.amount)}`,
          inr(tx.balanceAfter),
        ]),
        fileName: `Wallet_Statement_${new Date().toISOString().slice(0, 10)}.pdf`,
        footer: `Available balance: ${inr(wallet?.balance)}`,
      });
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Could not export the statement.');
    }
  };

  const input = {
    minHeight: 48, borderRadius: 12, paddingHorizontal: 14, backgroundColor: c.surfaceLight, borderWidth: 1, borderColor: c.border,
    color: c.text, fontSize: 15, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWallet({ silent: true })} tintColor={accent} colors={[accent]} />}
      >
        {/* Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Company Wallet</Text>
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>Central funds and financial ledger</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 14, height: 42, borderRadius: 12 }}
          >
            <Plus size={17} color={onAccent(accent)} />
            <Text style={{ color: onAccent(accent), fontWeight: '800', fontSize: 14 }}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Hero balance */}
        <View style={{ backgroundColor: BRAND_NAVY, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -80, top: -100, borderWidth: 26, borderColor: 'rgba(214,175,55,0.10)' }} />
          <View style={{ position: 'absolute', right: 18, bottom: 14, opacity: 0.08 }}>
            <Wallet size={110} color="#fff" />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600', letterSpacing: 0.6 }}>AVAILABLE BALANCE</Text>
          {loading && !wallet ? (
            <View style={{ width: 180, height: 34, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 6 }} />
          ) : (
            <Text style={{ color: GOLD, fontSize: 32, fontWeight: '800', marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
              {inr(wallet?.balance)}
            </Text>
          )}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={() => { setFormData({ ...EMPTY_FORM, type: 'Credit' }); setShowForm(true); }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: GOLD, borderRadius: 12, height: 42 }}
            >
              <ArrowUpRight size={16} color={BRAND_NAVY} />
              <Text style={{ color: BRAND_NAVY, fontWeight: '800', fontSize: 13 }}>Add funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setFormData({ ...EMPTY_FORM, type: 'Debit' }); setShowForm(true); }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 12, height: 42 }}
            >
              <ArrowDownRight size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportStatement}
              accessibilityLabel="Export statement"
              style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 12 }}
            >
              <Download size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats from the loaded ledger */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14, marginBottom: 6 }}>
          <StatTile c={c} isDark={isDark} icon={ArrowUpRight} tint={c.success} label="Credits" value={loading ? '—' : inrShort(totalIn)} hint={loading ? undefined : `${txs.filter((t) => t.type === 'Credit').length} entries`} onPress={() => setTxType(txType === 'Credit' ? '' : 'Credit')} />
          <StatTile c={c} isDark={isDark} icon={ArrowDownRight} tint={c.danger} label="Debits" value={loading ? '—' : inrShort(totalOut)} hint={loading ? undefined : `${txs.filter((t) => t.type === 'Debit').length} entries`} onPress={() => setTxType(txType === 'Debit' ? '' : 'Debit')} />
          {salaryPaid > 0 ? (
            <StatTile c={c} isDark={isDark} icon={IndianRupee} tint="#8B5CF6" label="Salary paid from wallet" value={inrShort(salaryPaid)} onPress={() => setFilters({ ...filters, source: filters.source === 'SalaryPayment' ? '' : 'SalaryPayment' })} />
          ) : null}
        </View>
        {!loading && txs.length >= 100 ? (
          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Totals cover the latest 100 transactions.</Text>
        ) : null}

        {/* Ledger */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 12 }}>
          <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: c.text }}>Ledger</Text>
          <Text style={{ fontSize: 12, color: c.textMuted }}>{loading ? '' : `${filtered.length} of ${txs.length}`}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <SearchBox c={c} value={search} onChange={setSearch} placeholder="Description, employee or amount" />
          </View>
          <FilterButton c={c} accent={accent} count={applied.length} onPress={() => { setDraft(filters); setSheetOpen(true); }} />
        </View>

        <QuickChips<TxType>
          c={c}
          accent={accent}
          value={txType}
          onChange={setTxType}
          options={[
            { value: '', label: 'All', count: baseFiltered.length },
            { value: 'Credit', label: 'Credit', icon: ArrowUpRight, tint: c.success, count: baseFiltered.filter((t) => t.type === 'Credit').length },
            { value: 'Debit', label: 'Debit', icon: ArrowDownRight, tint: c.danger, count: baseFiltered.filter((t) => t.type === 'Debit').length },
          ]}
        />

        <AppliedChips c={c} items={applied} onRemove={removeApplied} onClearAll={() => setFilters({ ...EMPTY, limit: filters.limit })} />

        <View onLayout={(e) => { listY.current = e.nativeEvent.layout.y; }}>
          {loading ? (
            <ListSkeleton c={c} count={5} height={76} />
          ) : txs.length === 0 ? (
            <BigEmpty c={c} icon={Receipt} title="No transactions yet" text="No transactions found in ledger. Add funds to get started." />
          ) : filtered.length === 0 ? (
            <BigEmpty c={c} icon={SearchX} title="No matching transactions" text="Try a different search or clear the filters." />
          ) : (
            <Card c={c} padded={false}>
              {pg.pageItems.map((tx: any, i: number) => {
                const credit = tx.type === 'Credit';
                const tint = credit ? c.success : c.danger;
                const salary = tx.referenceType === 'SalaryPayment';
                const who = byName(tx);
                const sub = salary ? salaryFor(tx) : '';
                return (
                  <View key={tx._id || i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                    <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: tint + (isDark ? '26' : '1A'), alignItems: 'center', justifyContent: 'center' }}>
                      {salary ? <IndianRupee size={18} color={tint} /> : credit ? <ArrowUpRight size={19} color={tint} /> : <ArrowDownRight size={19} color={tint} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }} numberOfLines={2}>{tx.description || (salary ? 'Salary payment' : 'Transaction')}</Text>
                      {sub ? <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }} numberOfLines={1}>{sub}</Text> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        {who ? <User size={11} color={c.textMuted} /> : null}
                        <Text style={{ fontSize: 11, color: c.textMuted }} numberOfLines={1}>
                          {who ? `${who} · ` : ''}{dateTime(tx.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: tint }}>{credit ? '+' : '−'}{inr(tx.amount)}</Text>
                      <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Bal {inr(tx.balanceAfter)}</Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}

          {!loading && (
            <Pagination c={c} accent={accent} page={pg.page} totalPages={pg.totalPages} from={pg.from} to={pg.to} total={pg.total} onChange={goToPage} />
          )}
        </View>
      </ScrollView>

      {/* Filters */}
      <BottomSheet
        c={c}
        accent={accent}
        visible={sheetOpen}
        title="Filters"
        onClose={() => setSheetOpen(false)}
        onReset={() => setDraft({ ...EMPTY, limit: draft.limit })}
        onApply={() => { setFilters(draft); setSheetOpen(false); }}
      >
        <SheetSection c={c} title="SOURCE">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {([['', 'All'], ['Manual', 'Manual entries'], ['SalaryPayment', 'Salary payments']] as [Source, string][]).map(([v, l]) => (
              <Chip key={v || 'all'} c={c} accent={accent} label={l} active={draft.source === v} onPress={() => setDraft({ ...draft, source: v })} />
            ))}
          </View>
        </SheetSection>
        <DateFilterSection c={c} accent={accent} title="DATE" value={draft.date} onChange={(d) => setDraft({ ...draft, date: d })} />
        <PageSizeSection c={c} accent={accent} value={draft.limit} onChange={(n) => setDraft({ ...draft, limit: n })} />
      </BottomSheet>

      {/* Manual transaction */}
      <BottomSheet
        c={c}
        accent={accent}
        visible={showForm}
        title="Manual Transaction"
        onClose={() => setShowForm(false)}
        onApply={handleTransaction}
        applyDisabled={submitLoading}
        applyLabel={submitLoading ? 'Processing…' : 'Execute Transaction'}
      >
        <Field c={c} label="Transaction type">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { v: 'Credit', l: 'Add funds', icon: ArrowUpRight, tint: c.success },
              { v: 'Debit', l: 'Withdraw', icon: ArrowDownRight, tint: c.danger },
              { v: 'UPI Top-up', l: 'UPI Top-up', icon: Smartphone, tint: c.info },
            ].map((o) => {
              const active = formData.type === o.v;
              return (
                <TouchableOpacity
                  key={o.v}
                  onPress={() => setFormData({ ...formData, type: o.v })}
                  style={{
                    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
                    backgroundColor: active ? o.tint + (isDark ? '2E' : '1A') : c.surfaceLight, borderWidth: 1.5, borderColor: active ? o.tint : 'transparent',
                  }}
                >
                  <o.icon size={18} color={active ? o.tint : c.textMuted} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: active ? c.text : c.textMuted, marginTop: 4 }}>{o.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        {formData.type === 'Debit' && wallet ? (
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: -6, marginBottom: 12 }}>Available: {inr(wallet.balance)}</Text>
        ) : null}

        {formData.type === 'UPI Top-up' && (
          <Field c={c} label="UPI reference no. *">
            <TextInput
              style={input}
              placeholder="e.g. 123456789012"
              placeholderTextColor={c.textMuted}
              value={formData.upiRef}
              onChangeText={(val) => setFormData({ ...formData, upiRef: val })}
            />
          </Field>
        )}

        <Field c={c} label="Amount (₹) *">
          <TextInput
            style={[input, { fontSize: 20, fontWeight: '800' }]}
            placeholder="e.g. 5000"
            placeholderTextColor={c.textMuted}
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(val) => setFormData({ ...formData, amount: val })}
          />
        </Field>

        <Field c={c} label="Description *">
          <TextInput
            style={input}
            placeholder="e.g. Bank Transfer"
            placeholderTextColor={c.textMuted}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
          />
        </Field>
        {submitLoading ? <ActivityIndicator color={accent} style={{ marginBottom: 8 }} /> : null}
      </BottomSheet>
    </View>
  );
};
