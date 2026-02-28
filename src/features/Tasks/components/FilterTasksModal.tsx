import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { colors, spacing } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { FeedFilter } from '@features/Home/types/home';
import { Tag, TagGroup } from '@shared/components/Tag';
import { Height } from '@shared/components/Spacing';
import { typeIcons } from '@shared/utils/typeVisuals';
import { MakeFirstLetterUppercase } from '@shared/utils/helperFunctions';
import AppModal from '@shared/components/AppModal/AppModal';

type Props = {
  visible: boolean;
  value: FeedFilter;
  onApply: (value: FeedFilter) => void;
  onClose: () => void;
  allowedTypes?: TaskTypeEnum[];
};

const DEFAULT_TYPES: TaskTypeEnum[] = [
  TaskTypeEnum.Motivation,
  TaskTypeEnum.Decision,
  TaskTypeEnum.Reminder,
  TaskTypeEnum.Advice,
];

export default function FilterTasksModal({
  visible,
  value,
  onApply,
  onClose,
  allowedTypes,
}: Props) {
  const translateY = useRef(new Animated.Value(300)).current;
  const availableTypes = allowedTypes ?? DEFAULT_TYPES;
  const [localFilter, setLocalFilter] = useState<FeedFilter>(value);
  const selectedCount = localFilter.types.length;

  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => {
    const nextTypes = value.types.filter(type => availableTypes.includes(type as TaskTypeEnum));
    setLocalFilter({
      ...value,
      types: nextTypes.length ? nextTypes : [...availableTypes],
    });
  }, [value, visible, availableTypes]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <AppModal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
        {/* Header */}
        <TextElement weight="600" variant="title">
          Your Feed
        </TextElement>
        {hint && (
          <TextElement variant="caption" color="error" style={{ marginTop: spacing.sm }}>
            {hint}
          </TextElement>
        )}
        <Height size={20} />

        {/* Task types */}
        {/* <View style={styles.sectionHeader}>
          <TextElement color="muted">Task types</TextElement>

          <TextElement color="muted" variant="caption">
            {selectedCount} selected
          </TextElement>
        </View> */}

        <TagGroup
          tags={availableTypes}
          value={localFilter.types}
          onChange={types => setLocalFilter(prev => ({ ...prev, types }))}
          renderTag={({ tag, selected, toggle }) => (
            <Tag
              label={MakeFirstLetterUppercase(tag)}
              iconName={typeIcons[tag]}
              selected={selected}
              onPress={toggle}
              onRemove={toggle}
            />
          )}
          onBlockedToggle={() => {
            setHint('Nice try 😄 You need at least one type.');
            setTimeout(() => setHint(null), 2000);
          }}
        />

        <Height size={20} />
        {/* Actions */}
        <PrimaryButton
          title={'Apply filters (' + selectedCount + ')'}
          onPress={() => onApply(localFilter)}
        />

        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <TextElement color="error">Cancel</TextElement>
        </TouchableOpacity>
      </Animated.View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cancel: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
