import React from 'react';
import BetaModal from './modals/BetaModal';
import AddFriendsModal from './modals/AddFriendsModal';
import FeedbackModal from './modals/FeedbackModal';

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
