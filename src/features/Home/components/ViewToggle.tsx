// // ../components/viewToggle.tsx
// import React from 'react';
// import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
// import TextElement from '@shared/components/TextElement/TextElement';
// import { colors, spacing, typography } from '@shared/theme';
// import Icon from '@shared/components/Icons/Icon';
// import { ms } from 'react-native-size-matters';

// export type ViewMode = 'list' | 'agenda';

// type Props = {
//   value: ViewMode;
//   onChange: (mode: ViewMode) => void;
//   style?: ViewStyle;
// };

// const OPTIONS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
//   {
//     key: 'list',
//     label: 'List',
//     icon: <Icon name="list" set="ion" color="muted" size={ms(14)} style={{ marginLeft: 4 }} />,
//   }, // list icon
//   {
//     key: 'agenda',
//     label: 'Agenda',
//     icon: <Icon name="calendar" set="ion" color="muted" size={ms(14)} style={{ marginLeft: 4 }} />,
//   }, // calendar icon
// ];

// const ViewToggle: React.FC<Props> = ({ value, onChange, style }) => {
//   return (
//     <View style={[styles.container, style]}>
//       {OPTIONS.map(option => {
//         const isActive = option.key === value;

//         return (
//           <TouchableOpacity
//             key={option.key}
//             activeOpacity={0.85}
//             onPress={() => onChange(option.key)}
//             style={[styles.button, isActive && styles.buttonActive]}
//           >
//             <TextElement variant="caption" style={[styles.icon, isActive && styles.textActive]}>
//               {option.icon}
//             </TextElement>

//             <TextElement variant="caption" style={[styles.label, isActive && styles.textActive]}>
//               {option.label}
//             </TextElement>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// };

// export default ViewToggle;
// const TOGGLE_WIDTH = 180;

// const styles = StyleSheet.create({
//   container: {
//     width: TOGGLE_WIDTH, // ← FIXED WIDTH

//     flexDirection: 'row',
//     backgroundColor: colors.inputBackground,
//     borderRadius: 999,
//     padding: 2,
//   },
//   button: {
//     flex: 1, // ✅ keeps widths consistent for both options
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 999,
//     paddingVertical: spacing.xs,
//     paddingHorizontal: spacing.sm,
//     gap: spacing.xs,
//   },
//   buttonActive: {
//     backgroundColor: colors.primary,
//   },
//   icon: {
//     fontSize: typography.small,
//     color: colors.muted,
//   },
//   label: {
//     fontSize: typography.small,
//     color: colors.muted,
//   },
//   textActive: {
//     color: colors.onPrimary,
//     fontWeight: '600',
//   },
// });
