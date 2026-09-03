import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, borderRadius } from '../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusVal?: number;
  style?: any;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusVal = borderRadius.m,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius: borderRadiusVal,
          opacity,
          backgroundColor: colors.surfaceLight,
        },
        style,
      ]}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerSkeletonRow}>
        <SkeletonBox width={160} height={28} />
        <SkeletonBox width={40} height={40} borderRadiusVal={20} />
      </View>
      <SkeletonBox width="100%" height={80} style={{ marginVertical: 16 }} />
      <View style={styles.grid2x2}>
        <SkeletonBox width="48%" height={90} />
        <SkeletonBox width="48%" height={90} />
        <SkeletonBox width="48%" height={90} />
        <SkeletonBox width="48%" height={90} />
      </View>
      <SkeletonBox width="100%" height={160} style={{ marginTop: 16 }} />
      <SkeletonBox width="100%" height={220} style={{ marginTop: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    overflow: 'hidden',
  },
  container: {
    padding: 16,
  },
  headerSkeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
});
