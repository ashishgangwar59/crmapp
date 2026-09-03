import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, cardStyles } from '../theme/colors';

interface DetailRow {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface ActionBtn {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'danger' | 'warning' | 'info' | 'gold' | 'default';
  avatarIcon?: React.ReactNode;
  avatarText?: string;
  details?: DetailRow[];
  actions?: ActionBtn[];
  onPressCard?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'default',
  avatarIcon,
  avatarText,
  details = [],
  actions = [],
  onPressCard,
  style,
  children,
}) => {
  const getBadgeColors = () => {
    switch (badgeVariant) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.warning };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: colors.info };
      case 'gold':
        return { bg: 'rgba(214, 175, 55, 0.18)', text: colors.gold };
      default:
        return { bg: colors.surfaceLight, text: colors.textMuted };
    }
  };

  const badgeStyle = getBadgeColors();

  const CardWrapper = onPressCard ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPressCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {avatarIcon ? (
            <View style={[styles.avatarBox, { backgroundColor: colors.cardGlow }]}>
              {avatarIcon}
            </View>
          ) : avatarText ? (
            <View style={[styles.avatarBox, { backgroundColor: colors.cardGlow }]}>
              <Text style={styles.avatarLetter}>{avatarText.slice(0, 2).toUpperCase()}</Text>
            </View>
          ) : null}

          <View style={styles.headerTitleCol}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badgeText}</Text>
          </View>
        ) : null}
      </View>

      {details.length > 0 ? (
        <View style={[styles.detailsContainer, { borderTopColor: colors.border }]}>
          {details.map((d, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{d.label}</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: d.highlight ? colors.accent : colors.text },
                  d.highlight && { fontWeight: '700' },
                ]}
              >
                {d.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {children}

      {actions.length > 0 ? (
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          {actions.map((act, index) => {
            let btnBg = colors.surfaceLight;
            let btnTxtColor = colors.text;

            if (act.variant === 'primary') {
              btnBg = colors.accent;
              btnTxtColor = '#FFFFFF';
            } else if (act.variant === 'danger') {
              btnBg = 'rgba(239, 68, 68, 0.12)';
              btnTxtColor = colors.danger;
            } else if (act.variant === 'success') {
              btnBg = 'rgba(16, 185, 129, 0.12)';
              btnTxtColor = colors.success;
            } else if (act.variant === 'outline') {
              btnBg = 'transparent';
              btnTxtColor = colors.accent;
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionBtn,
                  { backgroundColor: btnBg },
                  act.variant === 'outline' && { borderWidth: 1, borderColor: colors.accent },
                ]}
                onPress={act.onPress}
                activeOpacity={0.8}
              >
                {act.icon ? <View style={{ marginRight: 6 }}>{act.icon}</View> : null}
                <Text style={[styles.actionBtnText, { color: btnTxtColor }]}>{act.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.l,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    ...cardStyles.elevation,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.s,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  headerTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.s,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
