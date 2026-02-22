import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors, spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import { Shadow } from '@shared/components/Shadow';
import { showToast } from '@shared/utils/toast';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import { typeIcons } from '@shared/utils/typeVisuals';

type Props = {
  choices: string[];
  onChange: (choices: string[]) => void;
};

export default function DecisionChoicesInput({ choices, onChange }: Props) {
  const updateChoice = (index: number, text: string) => {
    const updated = [...choices];
    updated[index] = text;
    onChange(updated);
  };

  const addChoice = () => {
    showToast({
      type: 'info',
      title: 'Coming soon 🚧',
      message: 'Adding more than 2 choices is not available in beta.',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <SectionHeader label="Your Choices" icon="list" /> */}
      <View style={styles.header}>
        <Icon set="fa6" name={typeIcons.decision} size={ms(15)} color={colors.decisionBgHardest} />
        <TextElement color={'decisionBgHardest'} style={styles.headerText} weight="600">
          Your choices
        </TextElement>
      </View>
      {/* Choices */}
      {choices.map((text, index) => {
        const letter = String.fromCharCode(65 + index);

        return (
          <Shadow key={index} size="tint" style={styles.choiceCard}>
            <AppTextInput
              value={text}
              onChangeText={t => updateChoice(index, t)}
              placeholder={letter === 'A' ? `Pros: better pay.` : `Cons: longer commute `}
              containerStyle={{ flex: 1 }}
              wrapperStyle={styles.inputWrapper}
              inputStyle={styles.optionInput}
              multiline={false}
              numberOfLines={1}
              maxLength={20}
            />

            <View style={styles.badge}>
              <TextElement color={'decisionBgHardest'} style={styles.badgeText}>
                {letter}
              </TextElement>
            </View>
          </Shadow>
        );
      })}

      {/* Add another */}
      <TouchableOpacity style={styles.addRow} onPress={addChoice}>
        <View style={styles.addIcon}>
          <Icon name="add" set="ion" size={ms(12)} color={colors.decisionBgHardest} />
        </View>
        <TextElement style={styles.addText}>Add another choice</TextElement>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  optionInput: {
    // height: vs(40), // ✅ fixed height
    paddingVertical: vs(10), // ❌ remove default padding
    textAlignVertical: 'center',
  },

  inputWrapper: {
    borderWidth: 0,
    marginBottom: 0,
    paddingVertical: 0,
    justifyContent: 'center', // ✅ centers TextInput
  },

  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.sm,
    fontSize: ms(16),
    fontWeight: '600',
  },

  choiceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: vs(0),
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    width: '75%',
  },
  input: {
    flex: 1,
    fontSize: ms(16),
    color: colors.text,
    paddingRight: spacing.md,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.decisionIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md, // ✅ push badge to the right
  },
  badgeText: {
    fontWeight: '600',
    fontSize: ms(14),
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addIcon: {
    width: 25,
    height: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.decisionBgHardest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  addText: {
    color: colors.decisionBgHardest,
    fontSize: ms(14),
  },
});
