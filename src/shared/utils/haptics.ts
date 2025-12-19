import { Platform } from 'react-native';
import Haptics from '@mhpdev/react-native-haptics';

/**
 * App-level semantic haptics
 * Never expose raw haptic types to UI code
 */
export const haptics = {
  /**
   * Light UI selection
   * Pills, toggles, tabs
   */
  selection() {
    Haptics.selection();
  },

  /**
   * Opening UI (bottom sheets, menus)
   */
  open() {
    Haptics.impact('light');
  },

  /**
   * Closing UI
   */
  close() {
    Haptics.impact('light');
  },

  /**
   * Confirming an action (Apply, Save)
   */
  confirm() {
    Haptics.impact('medium');
  },

  /**
   * Positive feedback
   */
  success() {
    Haptics.notification('success');
  },

  /**
   * Error feedback
   */
  error() {
    Haptics.notification('error');
  },

  /**
   * Optional: drag / gesture start
   * (only where it makes sense)
   */
  dragStart() {
    if (Platform.OS === 'android') {
      Haptics.androidHaptics('drag-start');
    } else {
      Haptics.impact('light');
    }
  },

  /**
   * Optional: drag / gesture end
   */
  dragEnd() {
    if (Platform.OS === 'android') {
      Haptics.androidHaptics('gesture-end');
    } else {
      Haptics.selection();
    }
  },
};
