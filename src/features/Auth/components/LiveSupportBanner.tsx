import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { colors, platformShadow } from '@shared/theme';

type SupportAvatar = {
  id: string;
  uri: string;
};

type Props = {
  totalLabel?: string;
  avatars?: SupportAvatar[];
};

const DEFAULT_AVATARS: SupportAvatar[] = [
  { id: '0', uri: 'https://i.pravatar.cc/150?img=5' },
  { id: '1', uri: 'https://i.pravatar.cc/150?img=47' },
  { id: '2', uri: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', uri: 'https://i.pravatar.cc/150?img=12' },
  { id: '4', uri: 'https://i.pravatar.cc/150?img=17' },
  { id: '5', uri: 'https://i.pravatar.cc/150?img=21' },
  { id: '6', uri: 'https://i.pravatar.cc/150?img=24' },
  { id: '7', uri: 'https://i.pravatar.cc/150?img=25' },
  { id: '8', uri: 'https://i.pravatar.cc/150?img=28' },
  { id: '9', uri: 'https://i.pravatar.cc/150?img=32' },
  { id: '10', uri: 'https://i.pravatar.cc/150?img=36' },
  { id: '11', uri: 'https://i.pravatar.cc/150?img=41' },
  { id: '12', uri: 'https://i.pravatar.cc/150?img=44' },
  { id: '13', uri: 'https://i.pravatar.cc/150?img=45' },
  { id: '14', uri: 'https://i.pravatar.cc/150?img=52' },
  { id: '15', uri: 'https://i.pravatar.cc/150?img=57' },
  { id: '16', uri: 'https://i.pravatar.cc/150?img=60' },
  { id: '17', uri: 'https://i.pravatar.cc/150?img=63' },
  { id: '18', uri: 'https://i.pravatar.cc/150?img=65' },
  { id: '19', uri: 'https://i.pravatar.cc/150?img=68' },
  { id: '20', uri: 'https://i.pravatar.cc/150?img=70' },
];

const VISIBLE_AVATARS = 3;
const RECENT_HISTORY_LIMIT = 4;
const MIN_CYCLE_DELAY_MS = 14000;
const MAX_CYCLE_DELAY_MS = 30000;
const FADE_DURATION_MS = 600;

function getInitialVisibleAvatarIds(avatars: SupportAvatar[]) {
  const shuffled = [...avatars].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, VISIBLE_AVATARS).map(avatar => avatar.id);
}

function getRandomDelay() {
  return (
    MIN_CYCLE_DELAY_MS + Math.floor(Math.random() * (MAX_CYCLE_DELAY_MS - MIN_CYCLE_DELAY_MS + 1))
  );
}

export default function LiveSupportBanner({
  totalLabel = '2,400+',
  avatars = DEFAULT_AVATARS,
}: Props) {
  const avatarMap = useMemo(() => {
    return new Map(avatars.map(avatar => [avatar.id, avatar]));
  }, [avatars]);
  const opacityValues = useRef(
    Array.from({ length: VISIBLE_AVATARS }, () => new Animated.Value(1)),
  ).current;
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout> | null>>([]);
  const recentAvatarIdsRef = useRef<string[][]>(Array.from({ length: VISIBLE_AVATARS }, () => []));
  const [visibleAvatarIds, setVisibleAvatarIds] = useState(() =>
    getInitialVisibleAvatarIds(avatars),
  );

  useEffect(() => {
    avatars.forEach(avatar => {
      void Image.prefetch(avatar.uri);
    });
  }, [avatars]);

  useEffect(() => {
    setVisibleAvatarIds(getInitialVisibleAvatarIds(avatars));
    recentAvatarIdsRef.current = Array.from({ length: VISIBLE_AVATARS }, () => []);
    opacityValues.forEach(opacity => opacity.setValue(1));
  }, [avatars, opacityValues]);

  const visibleAvatars = useMemo(() => {
    return visibleAvatarIds
      .map(id => avatarMap.get(id))
      .filter((avatar): avatar is SupportAvatar => Boolean(avatar));
  }, [avatarMap, visibleAvatarIds]);

  useEffect(() => {
    if (avatars.length <= VISIBLE_AVATARS) {
      return;
    }

    let isCancelled = false;

    const scheduleNext = (slotIndex: number) => {
      timeoutRefs.current[slotIndex] = setTimeout(() => {
        const opacity = opacityValues[slotIndex];
        const currentIds = visibleAvatarIdsRef.current;
        const currentId = currentIds[slotIndex];
        const reservedIds = currentIds.filter((id, index) => index !== slotIndex);
        const recentIds = recentAvatarIdsRef.current[slotIndex] ?? [];

        const candidates = avatars.filter(
          avatar =>
            avatar.id !== currentId &&
            !reservedIds.includes(avatar.id) &&
            !recentIds.includes(avatar.id),
        );
        const fallbackCandidates = avatars.filter(
          avatar => avatar.id !== currentId && !reservedIds.includes(avatar.id),
        );
        const candidatePool = candidates.length ? candidates : fallbackCandidates;

        if (!candidatePool.length) {
          scheduleNext(slotIndex);
          return;
        }

        const nextAvatar = candidatePool[Math.floor(Math.random() * candidatePool.length)];

        void Image.prefetch(nextAvatar.uri).finally(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: FADE_DURATION_MS,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (!finished || isCancelled) {
              return;
            }

            setVisibleAvatarIds(prev => {
              const next = [...prev];
              next[slotIndex] = nextAvatar.id;
              return next;
            });
            recentAvatarIdsRef.current[slotIndex] = [
              nextAvatar.id,
              ...recentAvatarIdsRef.current[slotIndex].filter(id => id !== nextAvatar.id),
            ].slice(0, RECENT_HISTORY_LIMIT);

            Animated.timing(opacity, {
              toValue: 1,
              duration: FADE_DURATION_MS,
              useNativeDriver: true,
            }).start(({ finished: fadeInFinished }) => {
              if (fadeInFinished && !isCancelled) {
                scheduleNext(slotIndex);
              }
            });
          });
        });
      }, getRandomDelay());
    };

    opacityValues.forEach((_, slotIndex) => {
      scheduleNext(slotIndex);
    });

    return () => {
      isCancelled = true;
      timeoutRefs.current.forEach(timeoutId => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
      opacityValues.forEach(opacity => opacity.stopAnimation());
    };
  }, [avatars, opacityValues]);

  const visibleAvatarIdsRef = useRef(visibleAvatarIds);

  useEffect(() => {
    visibleAvatarIdsRef.current = visibleAvatarIds;
  }, [visibleAvatarIds]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarGroup}>
        {visibleAvatars.map((avatar, index) => (
          <Animated.View
            key={index}
            style={[
              styles.avatarWrap,
              {
                opacity: opacityValues[index] ?? 1,
                marginLeft: index === 0 ? 0 : -ms(12),
                zIndex: visibleAvatars.length - index + 1,
              },
            ]}
          >
            <Image source={{ uri: avatar.uri }} style={styles.avatar} fadeDuration={0} />
          </Animated.View>
        ))}

        <View style={styles.moreBubble}>
          <TextElement variant="bodySmall" weight="700" style={styles.moreText}>
            +2k
          </TextElement>
        </View>
      </View>

      <View style={styles.copyWrap}>
        <TextElement variant="body" weight="800" style={styles.copyStrong}>
          Join {totalLabel} people{' '}
          <TextElement variant="bodySmall" weight="500" style={styles.copyMuted}>
            getting pushes today
          </TextElement>
        </TextElement>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: ms(10),
    backgroundColor: '#FFF',
    paddingHorizontal: ms(18),
    paddingVertical: vs(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    ...platformShadow({
      color: colors.onboardingInk,
      opacity: 0.04,
      radius: 18,
      offset: { width: 0, height: 6 },
    }),
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: ms(94),
  },
  avatarWrap: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    borderWidth: 1,
    borderColor: '#F8F6EF',
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(14),
  },
  moreBubble: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(15),
    marginLeft: -ms(6),
    backgroundColor: colors.tactileMomentumPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: colors.tactileMomentumSecondary,
    fontSize: ms(10),
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  copyStrong: {
    color: colors.onboardingInk,
    fontSize: ms(12),
    lineHeight: vs(14),
    // letterSpacing: -0.25,
  },
  copyMuted: {
    color: colors.onboardingMuted,
    fontSize: ms(12),
    // lineHeight: ms(19),
    // marginTop: vs(2),
  },
});
