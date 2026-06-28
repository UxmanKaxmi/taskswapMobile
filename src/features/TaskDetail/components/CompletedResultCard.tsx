import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors, platformShadow, spacing } from '@shared/theme';
import { getFirstName } from '@shared/utils/helperFunctions';
import Height from '@shared/components/Spacing/Height';

type Supporter = {
  id: string;
  name: string;
};

type Props = {
  ownerName: string;
  isOwner: boolean;
  createdAt: string;
  completedAt?: string | null;
  supporters: Supporter[];
  progressUpdateCount?: number;
};

export default function CompletedResultCard({
  ownerName,
  isOwner,
  createdAt,
  completedAt,
  supporters,
  progressUpdateCount = 0,
}: Props) {
  const uniqueSupporters = useMemo(() => {
    const map = new Map<string, Supporter>();
    supporters.forEach(supporter => {
      if (!supporter?.id) return;
      map.set(supporter.id, supporter);
    });
    return Array.from(map.values());
  }, [supporters]);

  const supporterCount = uniqueSupporters.length;
  const firstSupporterName = getFirstName(uniqueSupporters[0]?.name ?? 'someone');
  const ownerFirstName = getFirstName(ownerName);
  const ownerLabel = isOwner ? 'You' : ownerFirstName;

  const bodyText = useMemo(() => {
    if (supporterCount === 0) {
      return `${ownerLabel} finished this without any pushes.`;
    }

    if (supporterCount === 1) {
      return `${ownerLabel} completed this with support from ${firstSupporterName}.`;
    }

    return `${ownerLabel} completed this with support from ${supporterCount} people.`;
  }, [firstSupporterName, ownerLabel, supporterCount]);

  const secondaryText = useMemo(() => {
    if (supporterCount > 1 && progressUpdateCount > 0) {
      return `${progressUpdateCount} progress updates shared along the way.`;
    }

    const durationText = formatDuration(createdAt, completedAt);
    if (!durationText) return null;

    return `Finished ${durationText} after posting.`;
  }, [completedAt, createdAt, progressUpdateCount, supporterCount]);

  return (
    <View>
      <Height size={vs(20)} />

      <SectionHeader label="Result" icon="checkmark-circle-outline" />

      <Shadow size="tint" style={styles.shadow}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.badge}>
              <Icon set="ion" name="checkmark" size={ms(16)} color={colors.motivationBgHardest} />
            </View>

            <View style={styles.copy}>
              <TextElement variant="title" style={styles.title}>
                Completed
              </TextElement>
              <TextElement style={styles.body}>{bodyText}</TextElement>

              {secondaryText ? (
                <TextElement style={styles.secondary}>{secondaryText}</TextElement>
              ) : null}
            </View>
          </View>
        </View>
      </Shadow>
    </View>
  );
}

function formatDuration(createdAt: string, completedAt?: string | null) {
  const createdTime = new Date(createdAt).getTime();
  const completedTime = new Date(completedAt ?? '').getTime();

  if (!Number.isFinite(createdTime) || !Number.isFinite(completedTime)) return null;

  const elapsedMs = Math.max(0, completedTime - createdTime);
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));

  if (minutes < 60) {
    return `about ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.max(1, Math.round(minutes / 60));

  if (hours < 24) {
    return `about ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.max(1, Math.round(hours / 24));
  return `about ${days} day${days === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
  },
  card: {
    backgroundColor: colors.onPrimary,
    borderRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    ...platformShadow({
      color: '#000',
      opacity: 0.08,
      radius: 16,
      offset: { width: 0, height: 10 },
    }),
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.motivationIconBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: ms(20),
    lineHeight: ms(24),
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    marginTop: vs(4),
    fontSize: ms(12),
    lineHeight: ms(16),
    fontWeight: '400',
    color: colors.placeHolder,
  },
  secondary: {
    marginTop: vs(6),
    fontSize: ms(12),
    lineHeight: ms(15),
    fontWeight: '400',
    color: colors.muted,
  },
});
