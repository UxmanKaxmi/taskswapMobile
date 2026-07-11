import React from 'react';
import BetaModal from './modals/BetaModal';
import AddFriendsModal from './modals/AddFriendsModal';
import FeedbackModal from './modals/FeedbackModal';
import WhatsNewModal from './modals/WhatsNewModal';
import { APP_VERSION_LABEL } from '@shared/utils/constants';
import {
  getAppLaunchCount,
  getWhatsNewBaseline,
  setWhatsNewBaseline,
} from './launchModals.storage';

export type LaunchModalScreen = 'HOME' | 'ANY';

export type LaunchModalContext = {
  screen: LaunchModalScreen;
  userId?: string | null;
  isLoggedIn?: boolean;
};

export type LaunchModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onHidden?: () => void;
  ctx: LaunchModalContext;
};

export type LaunchModalConfig = {
  id: string;
  screen: LaunchModalScreen;
  priority: number;
  when: (ctx: LaunchModalContext) => boolean | Promise<boolean>;
  component: React.ComponentType<LaunchModalProps>;
};

export const launchModalRegistry: LaunchModalConfig[] = [
  // Release notes: the id embeds the app version, so each shipped build can
  // show its notes exactly once after updating.
  {
    id: `whats_new_${APP_VERSION_LABEL}`,
    screen: 'HOME',
    priority: 0,
    when: async () => {
      const baseline = await getWhatsNewBaseline();
      // Installed at this version — nothing is "new" to them.
      if (baseline === APP_VERSION_LABEL) return false;
      if (!baseline) {
        const launches = await getAppLaunchCount();
        if (launches <= 1) {
          // Fresh install: record the install version and stay quiet.
          await setWhatsNewBaseline(APP_VERSION_LABEL);
          return false;
        }
        // Existing user updating into this feature — show the notes.
        await setWhatsNewBaseline('pre_whats_new');
      }
      return true;
    },
    component: WhatsNewModal,
  },
  {
    id: 'beta_v1',
    screen: 'HOME',
    priority: 1,
    when: () => true,
    component: BetaModal,
  },
  {
    id: 'add_friends_v1',
    screen: 'HOME',
    priority: 2,
    when: ctx => !!ctx.isLoggedIn,
    component: AddFriendsModal,
  },
  // Fallback: only surfaces once every higher-priority launch modal has been
  // seen/skipped — i.e. when nothing else is queued for this launch.
  {
    id: 'feedback_v1',
    screen: 'HOME',
    priority: 99,
    when: () => true,
    component: FeedbackModal,
  },
];
