import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import InfoIcon from '@shared/components/InfoIcon';
import Column from '@shared/components/Layout/Column';

type Props = {
  winningOption: string;
  winningVotes: number;
  totalVotes: number;
  onPressInfo?: () => void;
};

type SignalStrength = 'tie' | 'weak' | 'moderate' | 'strong';

export default function DecisionSignalCard({
  winningOption,
  winningVotes,
  totalVotes,
  onPressInfo,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const signalConfig: Record<
    SignalStrength,
    {
      label: string;
      color: string;
      icon: string;
    }
  > = {
    tie: {
      label: 'NO CLEAR SIGNAL',
      color: colors.placeHolder,
      icon: 'swap-horizontal-outline',
    },
    weak: {
      label: 'WEAK SIGNAL',
      color: colors.placeHolder,
      icon: 'trending-neutral-outline',
    },
    moderate: {
      label: 'MODERATE SIGNAL',
      color: colors.warning,
      icon: 'trending-up-outline',
    },
    strong: {
      label: 'STRONG SIGNAL',
      color: colors.motivationBgHardest,
      icon: 'trending-up-outline',
    },
  };

  const signalStrength = useMemo<SignalStrength | null>(() => {
    if (totalVotes === 0) return null;

    // 🟰 Perfect tie (50/50)
    if (winningVotes * 2 === totalVotes) return 'tie';

    const ratio = winningVotes / totalVotes;
    if (ratio >= 0.66) return 'strong';
    if (ratio >= 0.55) return 'moderate';
    return 'weak';
  }, [winningVotes, totalVotes]);

  if (!signalStrength) return null;

  const { label, color, icon } = signalConfig[signalStrength];

  return (
    <Shadow size="tint" style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon set="ion" name="bar-chart-outline" size={14} color={colors.decisionBgHardest} />
        </View>

        <TextElement style={styles.title}>
          {signalStrength === 'tie' ? (
            <>
              <TextElement style={styles.titleStrong}>Votes are evenly split</TextElement> between
              both options.
            </>
          ) : (
            <>
              <TextElement style={styles.titleStrong}>
                {winningVotes} out of {totalVotes} people
              </TextElement>{' '}
              prefer <TextElement style={styles.titleAccent}>{winningOption}</TextElement>.
            </>
          )}
        </TextElement>

        <View style={{ paddingLeft: ms(20) }}>
          <InfoIcon onPress={onPressInfo} />
        </View>
      </View>

      {/* Signal */}
      <View style={styles.signalRow}>
        <Icon set="ion" name={icon} size={ms(14)} color={color} />
        <TextElement style={[styles.signalText, { color }]}>{label}</TextElement>
      </View>
    </Shadow>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.onPrimary,
      borderRadius: 28,
      padding: spacing.md,
      alignItems: 'flex-start',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconWrap: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(20),
      backgroundColor: colors.decisionIconBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },

    title: {
      fontSize: ms(15),
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },

    titleStrong: {
      fontSize: ms(15),
      fontWeight: '700',
      color: colors.text,
    },

    titleAccent: {
      fontWeight: '700',
      fontSize: ms(15),
      color: colors.decisionBgHardest,
    },

    signalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: vs(15),
    },

    signalText: {
      fontSize: ms(12),
      fontWeight: '600',
      marginLeft: spacing.sm,
      letterSpacing: 0.5,
    },
  });
