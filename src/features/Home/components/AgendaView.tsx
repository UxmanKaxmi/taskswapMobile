// // AgendaView.tsx
// import React, { useMemo } from 'react';
// import { View, RefreshControl, ScrollViewProps } from 'react-native';
// import { Agenda, AgendaSchedule, AgendaEntry } from 'react-native-calendars';
// import { Task } from '@features/Tasks/types/tasks';
// import TextElement from '@shared/components/TextElement/TextElement';
// import { convertTasksToAgendaItems } from '@shared/utils/helperFunctions';

// const agendaTheme = {
//   agendaDayTextColor: '#0c1128ff',
//   agendaDayNumColor: '#010203ff',
//   agendaTodayColor: '#6C63FF',
//   agendaKnobColor: '#113ef3ff',

//   selectedDayBackgroundColor: '#6b89ffff',
//   selectedDayTextColor: '#fff',

//   todayTextColor: '#4B6EF6',
//   dayTextColor: '#333',
//   textDisabledColor: '#bbb',

//   dotColor: '#4B6EF6',
//   selectedDotColor: '#fff',

//   monthTextColor: '#4B6EF6',
//   arrowColor: '#4B6EF6',
// };

// interface Props {
//   tasks: Task[];
//   isLoading: boolean;
//   refreshing: boolean;
//   onRefresh: () => void;

//   renderItem: ({ item }: { item: Task }) => React.ReactElement | null;
//   // --- Custom agenda props ---
//   theme?: any;
//   pastScrollRange?: number;
//   futureScrollRange?: number;
//   showClosingKnob?: boolean;
//   firstDay?: number;
//   hideKnob?: boolean;
//   horizontal?: boolean;
//   hideArrows?: boolean;
//   disableDayPress?: boolean;
//   allowShadow?: boolean;
//   markingType?: string;

//   rowHasChanged?: (r1: AgendaEntry<Task>, r2: AgendaEntry<Task>) => boolean;

//   calendarHeight?: number;
//   agendaStyle?: any;
//   calendarStyle?: any;
// }

// export default function AgendaView({
//   tasks,
//   isLoading,
//   refreshing,
//   onRefresh,
//   renderItem,

//   // Customisable props
//   theme,
//   pastScrollRange = 12,
//   futureScrollRange = 12,
//   showClosingKnob = true,
//   hideKnob = false,
//   firstDay = 1, // Monday
//   horizontal = false,
//   hideArrows = false,
//   disableDayPress = false,
//   allowShadow = true,
//   markingType = 'dot',
//   rowHasChanged,
//   calendarHeight = 350,
//   agendaStyle,
//   calendarStyle,
// }: Props) {
//   const items = useMemo<AgendaSchedule<Task>>(() => convertTasksToAgendaItems(tasks), [tasks]);

//   const firstDate = Object.keys(items)[0];

//   return (
//     <Agenda<Task>
//       // CORE DATA
//       items={items}
//       selected={firstDate}
//       // APPEARANCE + CUSTOMIZATIONS
//       theme={agendaTheme}
//       markingType={markingType}
//       pastScrollRange={pastScrollRange}
//       futureScrollRange={futureScrollRange}
//       showClosingKnob={showClosingKnob}
//       hideKnob={hideKnob}
//       firstDay={firstDay}
//       horizontal={horizontal}
//       hideArrows={hideArrows}
//       disableDayPress={disableDayPress}
//       allowShadow={allowShadow}
//       calendarStyle={calendarStyle}
//       style={agendaStyle}
//       calendarHeight={calendarHeight}
//       // INTERACTIONS
//       rowHasChanged={
//         rowHasChanged ||
//         ((r1: AgendaEntry<Task>, r2: AgendaEntry<Task>) => r1.item.id !== r2.item.id)
//       }
//       // ❗ Refresh control (Agenda doesn't accept `refreshing`)
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       // RENDER ITEM
//       renderItem={(task: Task) => (
//         <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
//           {renderItem({ item: task })}
//         </View>
//       )}
//       // EMPTY DATE
//       renderEmptyDate={() => (
//         <View style={{ padding: 16 }}>
//           <TextElement color="muted">No tasks for this day.</TextElement>
//         </View>
//       )}
//       // EMPTY AGENDA
//       renderEmptyData={() => (
//         <View style={{ padding: 16 }}>
//           <TextElement color="muted">
//             {isLoading ? 'Loading agenda...' : 'No tasks in your agenda.'}
//           </TextElement>
//         </View>
//       )}
//     />
//   );
// }
