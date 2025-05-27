// src/features/tasks/screens/AddTaskScreen.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@shared/theme/useTheme';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import ListView from '@shared/components/ListView/ListView';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { AppStackParamList } from 'navigation/navigation';
import { TaskType, Task } from '@features/Tasks/types/tasks';
import { showToast } from '@shared/utils/toast';
import Icon from '@shared/components/Icons/Icon';
import { useCreateTask } from '../hooks/useCreateTask';
import TaskTypeSelector from '../components/TaskTypeSelector';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import Row from '@shared/components/Layout/Row';
import { colors, spacing } from '@shared/theme';
import TaskDescriptionInput from '../components/TaskDescriptionInput';
import { verticalScale, vs } from 'react-native-size-matters';
import ListTaskOptionSelector from '../components/ListTaskOptionSelector';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateTaskPayload } from '../api/taskApi';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

// function ListItem({
//   icon,
//   label,
//   detail,
//   onPress,
// }: {
//   icon: React.ComponentProps<typeof Icon>['name'];
//   label: string;
//   detail?: string;
//   onPress: () => void;
// }) {
//   const { colors, spacing } = useTheme();
//   return (
//     <View style={[styles.listItem, { paddingVertical: spacing.sm }]}>
//       <TouchableOpacity onPress={onPress}>
//         <Icon set="fa6" name={icon} iconStyle="solid" size={spacing.lg} color={colors.muted} />
//       </TouchableOpacity>
//       <TextElement style={[styles.listText, { marginLeft: spacing.md, color: colors.text }]}>
//         {label}
//       </TextElement>
//       {detail && (
//         <TextElement style={[styles.listDetail, { marginRight: spacing.md, color: colors.muted }]}>
//           {detail}
//         </TextElement>
//       )}
//       <TouchableOpacity onPress={onPress}>
//         <Icon
//           set="fa6"
//           name="chevron-right"
//           iconStyle="solid"
//           size={spacing.lg}
//           color={colors.muted}
//         />
//       </TouchableOpacity>
//     </View>
//   );
// }

export default function AddTaskScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const existingTask = route.params?.task;

  const [type, setType] = useState<TaskType>(existingTask?.type ?? 'reminder');
  const [description, setDescription] = useState(existingTask?.text ?? '');
  const [remindAt, setRemindAt] = useState<Date>(
    existingTask?.remindAt ? new Date(existingTask.remindAt) : new Date(),
  );
  const [options, setOptions] = useState<string[]>(existingTask?.options ?? []);
  const { mutate: createTask, isPending } = useCreateTask();

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState<{ description?: string; remindAt?: string }>({});
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) return;

    const payload: Partial<Task> = {
      text: description.trim(),
      type,
      remindAt: ['reminder', 'motivation'].includes(type) ? remindAt.toISOString() : undefined,
      deliverAt: type === 'motivation' ? remindAt.toISOString() : undefined,
      options: type === 'decision' ? options : undefined,
    };

    if (existingTask) {
      // updateTask(existingTask.id, payload)
      //   .then(() => {
      //     showToast({ type: 'success', title: 'Task updated!' });
      //     navigation.navigate('Home');
      //   })
      //   .catch(() => {});
    } else {
      createTask(payload as CreateTaskPayload, {
        onSuccess: () => {
          showToast({ type: 'success', title: 'Task posted!' });
          navigation.goBack();
          navigation.navigate('Tabs', {
            screen: 'Home',
          });
        },
        onError: () => {},
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    // if (['reminder', 'motivation'].includes(type) && remindAt < twoHoursLater) {
    //   newErrors.remindAt = 'Please select a time at least 2 hours from now.';
    // }

    if (type === 'decision' && options.filter(opt => opt.trim()).length < 2) {
      showToast({ type: 'error', title: 'At least 2 options are required.' });
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const hasError = Object.values(errors).some(Boolean);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Animated.View style={{ flex: 1, transform: [{ scale }], opacity }}>
        <Layout edges={['right', 'left']}>
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Icon set="ion" name="close" size={30} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TextElement color="text" weight="600" variant="title" style={styles.label}>
            Task Type
          </TextElement>
          <TaskTypeSelector selected={type} onSelect={setType} />

          <TaskDescriptionInput
            error={errors.description}
            type={type}
            value={description}
            onChange={text => {
              setDescription(text);
              if (errors.description && text.trim()) {
                setErrors(prev => ({ ...prev, description: undefined }));
              }
            }}
          />
          {['reminder', 'motivation'].includes(type) && (
            <ListTaskOptionSelector
              icon="time"
              label="Set Time"
              value={remindAt.toISOString()}
              showDateTimePicker
              defaultPickerOpen
              dateTimeValue={remindAt}
              onDateTimeChange={date => {
                setRemindAt(date);
                if (errors.remindAt && date.getTime() >= Date.now() + 2 * 60 * 60 * 1000) {
                  setErrors(prev => ({ ...prev, remindAt: undefined }));
                }
              }}
              errorText={errors.remindAt}
              error={!!errors.remindAt}
            />
          )}

          <ListTaskOptionSelector
            icon="people"
            label="Who can help?"
            onPress={() => {
              // open user selector
            }}
          />

          {/* <ListTaskOptionSelector
            icon="globe-outline"
            label="Visibility"
            value="Public"
            onPress={() => {
              // toggle between public/private
            }}
          /> */}
        </Layout>
        <View style={styles.footer}>
          <PrimaryButton
            title="Create Task"
            isLoading={isPending}
            disabled={hasError}
            onPress={() => handleSubmit()}
          />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.background,
    marginBottom: verticalScale(20),
    marginHorizontal: spacing.md,
  },
  header: {
    paddingTop: verticalScale(25),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  closeButton: {},
  container: {
    width: '100%',
    backgroundColor: 'red',
  },

  label: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    height: 100,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  listText: {
    flex: 1,
    marginLeft: 12,
  },
  listDetail: {
    marginRight: 12,
  },
  postButton: {},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
