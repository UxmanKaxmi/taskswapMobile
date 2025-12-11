import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { useTheme } from '@shared/theme/useTheme';
import { ms } from 'react-native-size-matters';

const OPTIONS = [
  { key: 'public', label: 'Public', icon: 'globe-outline' },
  { key: 'friends', label: 'Friends only', icon: 'people-outline' },
  { key: 'private', label: 'Private', icon: 'lock-closed-outline' },
];

export default function VisibilitySelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { colors, spacing } = useTheme();
  const [visible, setVisible] = useState(false);

  // ANIMATION
  const slideAnim = useRef(new Animated.Value(300)).current; // start off-screen

  const openSheet = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const selectedLabel = OPTIONS.find(o => o.key === selected)?.label ?? 'Public';

  return (
    <>
      {/* MAIN ROW same as ListTaskOptionSelector */}
      <TouchableOpacity
        onPress={openSheet}
        style={[styles.container, { borderColor: colors.border }]}
      >
        <View style={styles.row}>
          <Icon set="ion" name="shield-checkmark-outline" size={ms(25)} color={colors.text} />
          <TextElement variant="subtitle" style={[styles.label, { color: colors.text }]}>
            Visibility
          </TextElement>
        </View>

        <View style={styles.row}>
          <TextElement variant="subtitle" style={[styles.value, { color: colors.primary }]}>
            {selectedLabel}
          </TextElement>
          <Icon set="ion" name="chevron-forward" size={spacing.md} color={colors.muted} />
        </View>
      </TouchableOpacity>

      {/* MODAL identical style to DatePicker modal */}
      <Modal visible={visible} transparent animationType="fade">
        {/* BACKDROP */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* SLIDE-UP CONTAINER */}
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {OPTIONS.map(o => (
            <TouchableOpacity
              key={o.key}
              style={styles.optionRow}
              onPress={() => {
                onSelect(o.key);
                closeSheet();
              }}
            >
              <Icon set="ion" name={o.icon} size={ms(22)} color={colors.text} />
              <TextElement style={styles.optionLabel}>{o.label}</TextElement>

              {selected === o.key && (
                <Icon
                  set="ion"
                  name="checkmark"
                  size={ms(20)}
                  color={colors.primary}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 12,
    fontSize: ms(16),
  },
  value: {
    marginRight: 8,
    fontSize: ms(14),
    fontWeight: '500',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 18,
    paddingBottom: 30,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: ms(16),
  },
});
