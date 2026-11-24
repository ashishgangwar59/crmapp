import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { lightColors } from '../theme/colors';

type Palette = typeof lightColors;

/** Client-side paging for a list. Resets to page 1 when the list length or `resetKey` changes. */
export function usePagination<T>(items: T[], pageSize = 5, resetKey?: unknown) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => { setPage(1); }, [items.length, resetKey]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    totalPages,
    pageItems,
    setPage,
    from: items.length === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, items.length),
    total: items.length,
  };
}

/** Compact "‹ 1 2 3 ›" pager with a "6–10 of 42" summary. Renders nothing for a single page. */
export function Pagination({
  c,
  page,
  totalPages,
  from,
  to,
  total,
  onChange,
  accent,
}: {
  c: Palette;
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onChange: (p: number) => void;
  accent?: string;
}) {
  if (totalPages <= 1) return null;
  const tint = accent || c.accent;

  // At most 5 page numbers, centred on the current page.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  const NavBtn = ({ dir }: { dir: -1 | 1 }) => {
    const disabled = dir === -1 ? page === 1 : page === totalPages;
    const Icon = dir === -1 ? ChevronLeft : ChevronRight;
    return (
      <TouchableOpacity
        onPress={() => onChange(page + dir)}
        disabled={disabled}
        accessibilityLabel={dir === -1 ? 'Previous page' : 'Next page'}
        style={{
          width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
          backgroundColor: c.surfaceLight, opacity: disabled ? 0.4 : 1,
        }}
      >
        <Icon size={18} color={c.text} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
      <Text style={{ fontSize: 12, color: c.textMuted }}>
        {from}–{to} of {total}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <NavBtn dir={-1} />
        {pages.map((p) => {
          const active = p === page;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => onChange(p)}
              accessibilityLabel={`Page ${p}`}
              style={{
                minWidth: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
                backgroundColor: active ? tint : 'transparent',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? (tint.toUpperCase() === '#D6AF37' ? '#0C1C3D' : '#fff') : c.textMuted }}>{p}</Text>
            </TouchableOpacity>
          );
        })}
        <NavBtn dir={1} />
      </View>
    </View>
  );
}
