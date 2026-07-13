import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ms, vs } from 'react-native-size-matters';
import type { LaunchModalProps } from '../launchModals.registry';
import LaunchModalShell from '../components/LaunchModalShell';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { LATEST_RELEASE } from '@features/MyProfile/data/changelog';
import { APP_VERSION_LABEL } from '@shared/utils/constants';

const BODY_CHANGE_LIMIT = 4;

export default function WhatsNewModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleSeeChangelog = useCallback(() => {
    onDismiss();
    navigation.navigate('ChangelogScreen');
  }, [navigation, onDismiss]);

  return (
    <LaunchModalShell
      visible={visible}
      onDismiss={onDismiss}
      onHidden={onHidden}
      tag="UPDATE"
      title={"What's new ✨"}
      bodyContent={
        <View style={styles.changeList}>
          {LATEST_RELEASE.changes.slice(0, BODY_CHANGE_LIMIT).map(change => (
            <Row key={change.text} align="flex-start" justify="flex-start" style={styles.changeRow}>
              {change.emoji === '⭕' ? (
                <View style={styles.changeIconSlot}>
                  <Icon
                    set="fa6"
                    name="circle-nodes"
                    iconStyle="solid"
                    size={ms(17)}
                    color={colors.tactileMomentumPrimary}
                  />
                </View>
              ) : (
                <TextElement style={styles.changeEmoji}>{change.emoji}</TextElement>
              )}
              <TextElement style={styles.changeText}>{change.text}</TextElement>
            </Row>
          ))}
        </View>
      }
      note={`VERSION ${APP_VERSION_LABEL} 💛`}
      ctaLabel="See full changelog"
      onCtaPress={handleSeeChangelog}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    changeList: {
      marginTop: vs(12),
      marginBottom: vs(-12),
      // backgroundColor: 'red',
      marginHorizontal: ms(-10),
    },
    changeRow: {
      marginBottom: vs(10),
    },
    changeEmoji: {
      width: ms(30),
      fontSize: ms(20),
      lineHeight: ms(20),
      textAlign: 'center',
    },
    changeIconSlot: {
      width: ms(30),
      minHeight: ms(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    changeText: {
      flex: 1,
      fontSize: ms(15),
      lineHeight: ms(20),
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
  });
