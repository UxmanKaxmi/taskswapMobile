import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Avatar from '@shared/components/Avatar/Avatar';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getFirstName } from '@shared/utils/helperFunctions';
import type { HelperUser } from '@features/Home/types/home';

export const CIRCLE_MAX_INVITEES = 4;

type Props = {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  // Friends already on PushMeUp, invited in-app on post. External friends
  // ride the share sheet that opens right after posting.
  invitees: HelperUser[];
  onPressInvitees: () => void;
};

// Replaces the Tag-a-friend stub in the motivation composer (spec §8).
// Off by default; the invite share sheet opens after posting.
export default function DoItTogetherCard({ enabled, onToggle, invitees, onPressInvitees }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const seatsLeft = CIRCLE_MAX_INVITEES - invitees.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <TextElement variant="label" weight="700" style={styles.headerLabel}>
          DO IT TOGETHER ·
        </TextElement>
        <TextElement variant="label" weight="500" style={styles.headerSuffix}>
          optional
        </TextElement>
      </View>

      <View style={[styles.card, enabled && styles.cardOn]}>
        <Pressable
          style={styles.toggleRow}
          onPress={() => onToggle(!enabled)}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          accessibilityLabel="Start a circle: do this goal together with up to 4 friends"
        >
          <View style={styles.iconCircle}>
            <Icon set="ion" name="people" size={ms(18)} color={colors.tactileMomentumSecondary} />
          </View>

          <View style={styles.textWrap}>
            <TextElement variant="subtitle" weight="700" style={styles.title}>
              Start a Circle
            </TextElement>
            <TextElement variant="body" color="muted" style={styles.subtitle}>
              Invite up to 4. Everyone gets the same sentence.
            </TextElement>
          </View>

          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.onboardingLine, true: colors.onboardingPush }}
            thumbColor={colors.card}
          />
        </Pressable>

        {enabled ? (
          <View style={styles.inviteesRow}>
            {invitees.map(invitee => (
              <View key={invitee.id} style={styles.inviteeChip}>
                <Avatar
                  uri={invitee.photo || undefined}
                  fallback={invitee.name?.[0] ?? '?'}
                  size={18}
                />
                <TextElement variant="caption" weight="700" style={styles.inviteeChipText}>
                  {getFirstName(invitee.name)} ✓
                </TextElement>
              </View>
            ))}

            {seatsLeft > 0 ? (
              <Pressable
                style={styles.addChip}
                onPress={onPressInvitees}
                accessibilityRole="button"
                accessibilityLabel="Invite friends who are already on PushMeUp"
              >
                <TextElement variant="caption" weight="600" color="muted">
                  {invitees.length === 0
                    ? '+ Invite friends on PushMeUp'
                    : `+ Add · ${seatsLeft} left`}
                </TextElement>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {enabled ? (
        <TextElement variant="caption" color="muted" style={styles.hint}>
          {invitees.length > 0
            ? 'They get an invite the moment you post. The share sheet covers everyone else.'
            : 'Your circle starts as soon as you post. The invite sheet opens right after.'}
        </TextElement>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: ms(8),
      marginBottom: vs(12),
    },
    headerLabel: {
      color: colors.onboardingMuted,
      letterSpacing: 0.8,
    },
    headerSuffix: {
      color: colors.onboardingMuted,
      opacity: 0.9,
      fontSize: ms(12),
    },
    card: {
      backgroundColor: colors.onboardingPaper,
      borderRadius: 26,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      paddingVertical: vs(10),
      paddingHorizontal: ms(16),
    },
    cardOn: {
      borderStyle: 'solid',
      borderColor: colors.onboardingPush,
      backgroundColor: colors.card,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(12),
    },
    iconCircle: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(19),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    title: {
      color: colors.onboardingInk,
      fontSize: ms(13),
      lineHeight: ms(18),
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: vs(2),
      fontSize: ms(12),
      lineHeight: ms(15),
    },
    inviteesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: ms(7),
      marginTop: vs(11),
    },
    inviteeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      backgroundColor: colors.onboardingPaper,
      borderWidth: 1,
      borderColor: colors.onboardingPush,
      borderRadius: 999,
      paddingVertical: vs(3),
      paddingLeft: ms(4),
      paddingRight: ms(10),
    },
    inviteeChipText: {
      fontSize: ms(11.5),
      color: colors.onboardingInk,
    },
    addChip: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      borderRadius: 999,
      paddingVertical: vs(5),
      paddingHorizontal: ms(12),
    },
    hint: {
      marginTop: vs(8),
      marginLeft: ms(4),
      fontSize: ms(11.5),
      lineHeight: ms(15),
    },
  });
