import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, colors } from '@shared/theme';
import { showToast } from '@shared/utils/toast';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from '@shared/components/Icons/Icon';
import Ripple from '@shared/components/Buttons/Ripple';
import OutlineButton from '@shared/components/Buttons/OutlineButton';

type Props = {
  link: string;
};

const ReferralLinkCard: React.FC<Props> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(link);
    setCopied(true);
    showToast({ type: 'success', title: 'Link copied!' });
  };

  // 👇 Reset when the screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => setCopied(false);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Ripple onPress={handleCopy} style={styles.linkBox}>
        <TextElement numberOfLines={1} color="text" style={styles.linkText}>
          {link}
        </TextElement>
      </Ripple>

      <OutlineButton
        icon={
          <Icon
            set="ion"
            name={copied ? 'checkmark' : 'link'}
            size={18}
            color={copied ? 'muted' : colors.primary}
            style={{ marginRight: 6 }}
          />
        }
        textStyle={{ color: copied ? 'muted' : colors.primary }}
        title={copied ? 'Copied!' : 'Copy Link'}
        style={styles.copyButton}
        onPress={handleCopy}
        disabled={copied}
      />
    </View>
  );
};

export default ReferralLinkCard;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  linkBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  linkText: {
    textAlign: 'center',
  },
  copyButton: {
    width: '100%',
  },
});
