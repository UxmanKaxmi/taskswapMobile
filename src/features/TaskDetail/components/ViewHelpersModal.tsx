// src/features/tasks/components/ViewHelpersModal.tsx

import React, { useEffect, useRef } from 'react';
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
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import { HelperUser } from '@features/Home/types/home';
import AppModal from '@shared/components/AppModal/AppModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  helpers: HelperUser[];
};

export default function ViewHelpersModal({ visible, onClose, helpers }: Props) {
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

  const renderItem = ({ item }: { item: HelperUser }) => {
    return (
      <View style={styles.item}>
        <Avatar uri={item.photo} fallback={item.name?.[0] ?? '?'} size={40} />
        <TextElement style={styles.name}>{item.name}</TextElement>
      </View>
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
            Helpers
          </TextElement>

          <FlatList
            data={helpers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: spacing.md }}
          />
        </View>
      </Animated.View>
    </AppModal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    maxHeight: height * 0.6,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  modalContent: {
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
    marginLeft: spacing.md,
    fontSize: 15,
  },
});
