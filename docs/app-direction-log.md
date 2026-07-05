# App Direction Log

Use this file to record every screen, component, route, or UI flow that gets removed or deprecated because of the current product direction.

Rules:
- Append-only. Do not rewrite old entries unless you are correcting a mistake.
- Log the reason before deleting the code.
- Include the replacement path when one exists.
- Keep the record short and factual.

## Entry Format

| Date | Item | Kind | Reason | Replaced By | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | `path/to/file.tsx` | screen/component/route | Short reason | `new/path/or-flow` | planned/deprecated/deleted/replaced | Optional follow-up |

## Current Direction Changes

| Date | Item | Kind | Reason | Replaced By | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-06-14 | `src/features/AddTask/screens/ChooseImpactScreen.tsx` | screen | The app is moving to a motivation-first flow, so the choose-impact step is unnecessary. | Direct navigation to `AddMotivation` from onboarding and the add-task stack. | deleted | Removed the route registration and intro screen hop as part of the refactor. |
| 2026-06-14 | `src/features/AddTask/screens/AddMotivationScreen.tsx` | screen | The motivation step is now a single composer, so the old visibility selector, helper card, and helper invite sub-flow are no longer part of the direction. | Single-step motivation composer with feeling tags and a direct submit button. | replaced | Keep the support settings out of this screen unless the product direction changes again. |
| 2026-07-05 | `src/features/AddTask/components/{ImpactOptionCard,VisibilitySelector,VisibilitySelectorWithModal}.tsx` | component | Leftovers of the removed choose-impact/visibility steps (see 2026-06-14 entries). Unreachable from entry point. | Motivation-first composer | deleted | Verified via import-graph scan + tsc. |
| 2026-07-05 | `src/features/Auth/components/{AnimatedTextRotator,AnimatedTextRotatorWithTitle,LogoutButton}.tsx` | component | Superseded auth-intro visuals and logout button; no importers. | Current AuthIntroScreen UI | deleted | |
| 2026-07-05 | `src/features/Debug/NotificationTester.tsx` | component | Unused debug helper; not registered in MainDebugScreen. | — | deleted | |
| 2026-07-05 | `src/features/Friends/components/RecentTaskCard.tsx` | component | Old friends-profile task card; no importers. | FriendsProfileScreen current cards | deleted | |
| 2026-07-05 | `src/features/Home/components/{FilterPill,HomeHeroCard,MotivationOpeningQuote}.tsx`, `hooks/useInCompleteTask.ts` | component/hook | v1 home feed pieces replaced by hero carousel + summary section. | HomeSummarySection / hero carousel | deleted | |
| 2026-07-05 | `src/features/Notification/hooks/useMarkNotificationAsRead.ts` | hook | Superseded read-marking hook; no importers. | Notification API in `NotificationApi.ts` | deleted | |
| 2026-07-05 | `src/features/TaskDetail/components/{CompletedResultCard,PushActivityList,TaskDetailProgress}.tsx` | component | Old task-detail layout pieces; no importers. | Current TaskDetailScreen sections | deleted | |
| 2026-07-05 | `src/features/Tasks/components/{CommentSection,CompletionStatus,FilterTasksModal,TaskDescriptionInput,TaskDetailHeading}.tsx` | component | Legacy Tasks-feature UI from the pre-pivot app; no importers. | TaskDetail/AddTask equivalents | deleted | `ReminderNoteList` and data hooks in Tasks remain live. |
| 2026-07-05 | `src/features/Tasks/hooks/{useGetVotes,useUpdateTask}.ts` | hook | Redundant wrappers; superseded by `useVote.ts` and task mutations. | `useVote.ts` | deleted | |
| 2026-07-05 | `src/features/User/hooks/{useFollowUser,useUnfollowUser,useSyncFcmToken}.ts` | hook | Follow/unfollow replaced by toggle-follow API; FCM sync moved to `src/lib/notifications/`. | `useToggleFollow`, `lib/notifications` | deleted | Follow hooks were fully commented out. |
| 2026-07-05 | `src/lib/react-query/provider.tsx`, `src/navigation/ProtectedTabScreen.tsx` | infra | Unused provider (App.tsx builds its own QueryClientProvider) and unused tab guard. | `App.tsx` | deleted | |
| 2026-07-05 | `src/shared/components/{AnimatedCard,Greeting,HeadingText,TypeTag}/`, `Layout/AnimatedBackground.tsx`, `PushButton/PushButton.types.ts`, `theme/types.ts`, `utils/pingServer.ts` | shared | Unused shared components/utils from the old design; no importers. | — | deleted | |
| 2026-07-05 | `src/features/{Recommendation,Shadow,NewFeature}/` | feature dir | Empty scaffolded directories, never implemented. | — | deleted | |
| 2026-07-05 | `src/assets/images/slider{1,2,3}.png` | asset | Old swiper-based intro images; swiper dependency also removed. | Current IntroScreen | deleted | |

## Removal Checklist

1. Add a log entry here before deleting the code.
2. Update every route or import that points at the removed file.
3. Run `rg` for the old screen/component name and confirm no live references remain.
4. Run typecheck or the relevant test command.
5. Mark the entry as `deleted` once the cleanup is complete.
