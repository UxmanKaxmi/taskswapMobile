import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Avatar from '@shared/components/Avatar/Avatar';
import { HelperUser } from '@features/Home/types/home';
import AppModal from '@shared/components/AppModal/AppModal';
import { MODAL_TOP_RADIUS } from '@shared/constants/modal';
import { getAvatarColor } from '@shared/utils/avatarColor';

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  friends?: HelperUser[];
  onConfirm: (ids: string[]) => void;
};

type SelectableHelper = HelperUser & {
  username?: string;
  handle?: string;
  userName?: string;
};

function getHandle(friend: SelectableHelper, index: number) {
  const raw =
    friend.username?.trim() ||
    friend.handle?.trim() ||
    friend.userName?.trim() ||
    friend.name?.trim() ||
    '';

  if (!raw) {
    return `@friend${index + 1}`;
  }

  if (raw.startsWith('@')) {
    return raw;
  }

  return `@${raw.toLowerCase().replace(/\s+/g, '')}`;
}

export default function SelectHelpersModal({
  visible,
  onClose,
  selected,
  friends = [],
  onConfirm,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const translateY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 420,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [translateY, visible]);

  useEffect(() => {
    if (visible) {
      setLocalSelection(selected);
      setSearch('');
    }
  }, [selected, visible]);

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return friends as SelectableHelper[];

    return (friends as SelectableHelper[]).filter(friend => {
      const handle = getHandle(friend, 0).toLowerCase();
      return friend.name.toLowerCase().includes(query) || handle.includes(query);
    });
  }, [friends, search]);

  const toggleSelection = (id: string) => {
    setLocalSelection(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const commitAndClose = () => {
    onConfirm(localSelection);
    onClose();
  };

  const renderItem = ({ item, index }: { item: SelectableHelper; index: number }) => {
    const isSelected = localSelection.includes(item.id);
    const handle = getHandle(item, index);

    return (
      <Pressable style={styles.row} onPress={() => toggleSelection(item.id)}>
        <View style={styles.rowLeft}>
          <Avatar
            uri={item.photo}
            fallback={item.name}
            size={44}
            borderColor={colors.onboardingLine}
            fallbackStyle={{
              ...styles.avatarFallback,
              backgroundColor: getAvatarColor(item.id || item.name),
            }}
            textStyle={styles.avatarText}
          />

          <View style={styles.textBlock}>
            <TextElement variant="subtitle" weight="700" style={styles.name}>
              {item.name}
            </TextElement>
            <TextElement variant="body" color="muted" style={styles.username}>
              {handle}
            </TextElement>
          </View>
        </View>

        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected ? (
            <Icon
              set="ion"
              name="checkmark"
              size={ms(18)}
              color={colors.tactileMomentumSecondary}
            />
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <AppModal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={commitAndClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.sheetAnchor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <TextElement variant="headline" weight="700" style={styles.title}>
              Tag a friend
            </TextElement>
          </View>

          <View style={styles.searchBar}>
            <Icon set="ion" name="search" size={ms(16)} color={colors.onboardingMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor={colors.onboardingMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          <View style={styles.listWrap}>
            <FlatList
              style={styles.list}
              data={filteredFriends}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={filteredFriends.length === 0 ? styles.emptyList : undefined}
              ListEmptyComponent={
                <TextElement variant="body" color="muted" style={styles.emptyText}>
                  No friends found.
                </TextElement>
              }
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    sheetAnchor: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      width: '100%',
      maxHeight: '88%',
      backgroundColor: colors.onboardingCard,
      borderTopLeftRadius: MODAL_TOP_RADIUS,
      borderTopRightRadius: MODAL_TOP_RADIUS,
      paddingTop: vs(8),
      paddingHorizontal: ms(18),
      paddingBottom: vs(18),
    },
    handle: {
      alignSelf: 'center',
      width: ms(68),
      height: vs(6),
      borderRadius: 999,
      backgroundColor: colors.onboardingLine,
      marginBottom: vs(16),
    },
    title: {
      color: colors.onboardingInk,
      fontSize: ms(20),
      lineHeight: ms(24),
      letterSpacing: -0.6,
      flex: 1,
      paddingRight: ms(10),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(14),
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      paddingHorizontal: ms(18),
      height: vs(36),
    },
    searchInput: {
      flex: 1,
      marginLeft: ms(10),
      fontSize: ms(14),
      lineHeight: ms(18),
      color: colors.onboardingInk,
      paddingVertical: 0,
    },
    listWrap: {
      marginTop: vs(10),
      marginBottom: vs(12),
    },
    list: {
      maxHeight: vs(270),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: vs(64),
      paddingVertical: vs(8),
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: ms(12),
    },
    textBlock: {
      marginLeft: ms(12),
      flex: 1,
    },
    name: {
      color: colors.onboardingInk,
      fontSize: ms(15),
      lineHeight: ms(20),
      letterSpacing: -0.3,
    },
    username: {
      marginTop: vs(1),
      fontSize: ms(12),
      lineHeight: ms(15),
      color: colors.onboardingMuted,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.onboardingLine,
    },
    radio: {
      width: ms(24),
      height: ms(24),
      borderRadius: ms(12),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onboardingCard,
    },
    radioSelected: {
      borderColor: colors.onboardingPush,
      backgroundColor: colors.onboardingPush,
    },
    avatarFallback: {
      borderColor: colors.onboardingLine,
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: vs(18),
    },
  });
