import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { colors, spacing } from '@shared/theme';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Avatar from '@shared/components/Avatar/Avatar';
import { HelperUser } from '@features/Home/types/home';
import AppModal from '@shared/components/AppModal/AppModal';
import { ms } from 'react-native-size-matters';
import { MODAL_TOP_RADIUS } from '@shared/constants/modal';

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  friends?: HelperUser[];
  confirmButtonColor?: string;

  onConfirm: (ids: string[]) => void;
};

export default function SelectHelpersModal({
  visible,
  onClose,
  selected,
  friends = [],
  confirmButtonColor = colors.primary,
  onConfirm,
}: Props) {
  const [localSelection, setLocalSelection] = useState<string[]>([]);

  const translateY = useRef(new Animated.Value(300)).current;

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

  useEffect(() => {
    setLocalSelection(selected);
  }, [selected, visible]);

  const toggleSelection = (id: string) => {
    setLocalSelection(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = localSelection.includes(item.id);
    return (
      <TouchableOpacity style={styles.item} onPress={() => toggleSelection(item.id)}>
        <Avatar uri={item.photo} fallback={item.name?.[0] ?? '?'} size={36} />
        <TextElement style={styles.name}>{item.name}</TextElement>
        {isSelected && <Icon name="checkmark" set="ion" color={confirmButtonColor} size={ms(24)} />}
      </TouchableOpacity>
    );
  };

  return (
    <AppModal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
        <View style={styles.container}>
          <TextElement weight="600" variant="subtitle">
            Tag your helpers
          </TextElement>
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: spacing.md }}
          />
          <PrimaryButton
            title={`Confirm (${localSelection.length})`}
            onPress={() => {
              onConfirm(localSelection);
              onClose();
            }}
            backgroundColor={confirmButtonColor}
          />
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <TextElement color="error">Cancel</TextElement>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </AppModal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    maxHeight: height * 0.65,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopLeftRadius: MODAL_TOP_RADIUS,
    borderTopRightRadius: MODAL_TOP_RADIUS,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  modalContent: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopLeftRadius: MODAL_TOP_RADIUS,
    borderTopRightRadius: MODAL_TOP_RADIUS,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  name: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
