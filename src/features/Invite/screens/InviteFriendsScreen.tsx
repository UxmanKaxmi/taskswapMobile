import React from 'react';
import { View, Share, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import ReferralLinkCard from '../components/ReferralLinkCard';

import { spacing, typography, colors } from '@shared/theme';
import { showToast } from '@shared/utils/toast';

// ⬇️ your hook from earlier (channel-aware cache)
import { useReferralLink } from '../hooks/useReferralLink';
import { vs } from 'react-native-size-matters';
import Ripple from '@shared/components/Buttons/Ripple';
import { APP_NAME } from '@shared/utils/constants';

export default function InviteFriendsScreen() {
  // Pick a default channel for analytics attribution; change as needed.
  const { data, isLoading, refetch, sharePayload, rotateLink, rotating } = useReferralLink();

  const referralLink = data?.link ?? '';

  const handleShare = async () => {
    if (!sharePayload) return;
    try {
      await Share.share({
        message: `${sharePayload.message}`,
        url: sharePayload.url, // iOS-friendly
        title: sharePayload.title,
      });
    } catch {
      showToast({ type: 'error', title: 'Could not open share dialog' });
    }
  };

  const handleCopy = () => {
    if (!referralLink) return;
    Clipboard.setString(referralLink);
    showToast({ type: 'success', title: 'Invite link copied' });
  };

  const handleRotate = () => {
    rotateLink(undefined, {
      onSuccess: () => showToast({ type: 'success', title: 'New link generated' }),
    });
  };

  // ✅ Small helper component for stat cards
  function StatBox({ label, value }: { label: string; value: number }) {
    return (
      <View style={styles.statBox}>
        <TextElement variant="title" style={styles.statValue}>
          {value}
        </TextElement>
        <TextElement variant="caption" color="muted" style={styles.statLabel}>
          {label}
        </TextElement>
      </View>
    );
  }

  return (
    <Layout
      footerContent={
        <PrimaryButton
          title={rotating ? 'Generating...' : 'Share App'}
          onPress={handleShare}
          disabled={!referralLink || rotating}
          style={styles.shareButton}
        />
      }
    >
      <AppHeader title="" inDevelopment />

      <View style={styles.content}>
        <View style={{ marginVertical: spacing.sm }}>
          <TextElement variant="title" style={{ fontWeight: '700' }}>
            Invite Your Friends <TextElement style={{ fontSize: 20 }}>👋</TextElement>
          </TextElement>
          <TextElement
            variant="body"
            color="muted"
            style={{ textAlign: 'left', marginTop: spacing.xs }}
          >
            Share the app with your friends and earn rewards when they join {APP_NAME}.
          </TextElement>
        </View>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            {/* Link display + tap-to-copy */}
            <Ripple onPress={handleCopy}>
              <ReferralLinkCard link={referralLink} />
            </Ripple>

            <TextElement variant="caption" color="muted" style={styles.helperText}>
              Tap the link to copy. This is a smart link that opens TaskSwap (or the store) and
              keeps your referral attached.
            </TextElement>

            {/* ✅ Stats Section */}
            <View style={styles.statsContainer}>
              <TextElement variant="subtitle" style={styles.statsHeader}>
                Your Referral Stats
              </TextElement>
              <View style={styles.statsRow}>
                <StatBox label="Total Invites" value={data?.stats?.totalInvites ?? 0} />
                <StatBox label="Joined" value={data?.stats?.joined ?? 0} />
              </View>
              <View style={styles.statsRow}>
                <StatBox label="Rewards Earned" value={data?.stats?.rewardsEarned ?? 0} />
                <StatBox label="Pending Rewards" value={data?.stats?.pendingRewards ?? 0} />
              </View>
            </View>
            {/* Optional: rotate (regenerate) link */}
            {/* <PrimaryButton
              title="Rotate Link"
              onPress={handleRotate}
              disabled={rotating}
              style={{ marginTop: spacing.md }}
            /> */}
          </>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  helperText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  shareButton: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 4,
  },
  statsContainer: {
    marginTop: vs(40),
    width: '100%',
    // borderWidth: 1,
    // borderColor: colors.border,
    // borderRadius: 12,
    // padding: spacing.md,
  },
  statsHeader: {
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
});
