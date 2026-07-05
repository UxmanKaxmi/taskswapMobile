# Cleanup Plan — Dead Code & Structure Audit (2026-07-05)

Method: automated import-graph reachability scan from `index.js` (resolving the
`@features/@shared/...` babel aliases), cross-checked file-by-file with `rg` for
every disputed entry. Numbers below are verified, not estimated.

**Totals: 38 dead code files (~2,870 lines), 3 empty feature dirs, 4 removable
npm deps, 5 case-duplicate dirs in git, ~13 stray files (.DS_Store, unused images).**

---

## What the app actually is today (reachable surface)

Entry → `RootNavigator` → onboarding (`Intro`), auth (`Auth`), and the app stack:
tabs (Home, Friends, AddTask, Notification, MyProfile) plus TaskDetail,
FindFriends, InviteFriends, SendFeedback, Debug (dev-only). All four task types
(motivation / advice / decision / reminder) are still live, as are cheers,
pushes, votes, comments, and the follow system. The pivot removed the
*choose-impact* and *visibility* steps from task creation (logged in
`app-direction-log.md` 2026-06-14) — the dead files below are largely the
leftovers of that refactor plus superseded v1 components.

---

## Phase 0 — Zero-risk hygiene (do first, one commit)

- [ ] Delete all `.DS_Store` files under `src/` and add `.DS_Store` to `.gitignore`.
- [ ] Remove the stale `tsconfig.json` exclude for
      `src/features/TaskDetail/screens/TaskDetailScreenOld.tsx` (file no longer exists).
- [ ] Rename `src/features/AddTask/components/DecisionChoicesInput.tsx.tsx` →
      `DecisionChoicesInput.tsx` and fix the import in `AddDecisionScreen.tsx:`
      (it currently imports with the `.tsx` suffix in the specifier).
- [ ] Delete empty feature directories: `src/features/Recommendation/`,
      `src/features/Shadow/`, `src/features/NewFeature/` (0 files each, never imported).
- [ ] Delete unused images: `src/assets/images/slider1.png`, `slider2.png`,
      `slider3.png` (old swiper-based intro).

## Phase 1 — Delete dead code files (38 files, ~2,870 lines)

All verified unreachable from the entry point AND zero grep hits outside their
own file. Log each in `docs/app-direction-log.md` per the removal checklist,
then `rg` the component name and run `tsc --noEmit`.

### Old-pivot leftovers (impact/visibility steps removed 2026-06-14)
- `src/features/AddTask/components/ImpactOptionCard.tsx` (204)
- `src/features/AddTask/components/VisibilitySelector.tsx` (235)
- `src/features/AddTask/components/VisibilitySelectorWithModal.tsx` (171)

### Superseded v1 components/hooks
- `src/features/Auth/components/AnimatedTextRotator.tsx` (58)
- `src/features/Auth/components/AnimatedTextRotatorWithTitle.tsx` (114)
- `src/features/Auth/components/LogoutButton.tsx` (26)
- `src/features/Debug/NotificationTester.tsx` (58)
- `src/features/Friends/components/RecentTaskCard.tsx` (128)
- `src/features/Home/components/FilterPill.tsx` (51)
- `src/features/Home/components/HomeHeroCard.tsx` (163)
- `src/features/Home/components/MotivationOpeningQuote.tsx` (29)
- `src/features/Home/hooks/useInCompleteTask.ts` (22)
- `src/features/Notification/hooks/useMarkNotificationAsRead.ts` (15)
- `src/features/TaskDetail/components/CompletedResultCard.tsx` (181)
- `src/features/TaskDetail/components/PushActivityList.tsx` (160)
- `src/features/TaskDetail/components/TaskDetailProgress.tsx` (182)

### Dead files in `features/Tasks` (safe now — NOT the whole feature, see Phase 4)
- `src/features/Tasks/components/CommentSection.tsx` (218) — TaskDetail has its own comment UI
- `src/features/Tasks/components/CompletionStatus.tsx` (41)
- `src/features/Tasks/components/FilterTasksModal.tsx` (152)
- `src/features/Tasks/components/TaskDescriptionInput.tsx` (83) — duplicate of AddTask's
- `src/features/Tasks/components/TaskDetailHeading.tsx` (80)
- `src/features/Tasks/hooks/useGetVotes.ts` (12) — superseded by `useVote.ts`
- `src/features/Tasks/hooks/useUpdateTask.ts` (21)

### Replaced by newer implementations elsewhere
- `src/features/User/hooks/useFollowUser.ts` (18) — fully commented out, replaced by toggle-follow API
- `src/features/User/hooks/useUnfollowUser.ts` (17) — same
- `src/features/User/hooks/useSyncFcmToken.ts` (15) — FCM sync now lives in `src/lib/notifications/`
- `src/lib/react-query/provider.tsx` (26) — `App.tsx` builds its own `QueryClientProvider`
- `src/navigation/ProtectedTabScreen.tsx` (12)

### Unused shared components/utils
- `src/shared/components/AnimatedCard/` (49)
- `src/shared/components/Greeting/` (3 files, 61)
- `src/shared/components/HeadingText/` (55)
- `src/shared/components/Layout/AnimatedBackground.tsx` (65) — keep the rest of Layout/
- `src/shared/components/PushButton/PushButton.types.ts` (11)
- `src/shared/components/TypeTag/` (95)
- `src/shared/theme/types.ts` (6)
- `src/shared/utils/pingServer.ts` (35)

### Do NOT delete (looked dead in earlier audits, verified live)
- `src/navigation/types/navigation.d.ts` — imported as `@navigation/types/navigation`
- `src/types/react-native-config.d.ts` — ambient declaration for `react-native-config`
- `src/shared/components/AppInfoBottomSheet/` — used by `TaskDetail/components/DecisionDetail.tsx`
- All `ModalProvider/modals/*` — triggered via `openModal(...)` in TaskDetail/AddTask
- `src/features/Home/hooks/useAddTask.ts` — its `useAddReminder` export is used by
  `ReminderCard` and `TaskDetailScreen` (rename to `useAddReminder.ts` for clarity)
- `src/features/Tasks/components/ReminderNoteList.tsx` (458) — used by `TaskDetail/ReminderDetail`
- Features `Empty`, `Share`, `User`, `LaunchModals`, `Invite` — all small but live

## Phase 2 — Remove unused dependencies

Zero imports anywhere in `src/`, `index.js`, or native config:

- [ ] `@react-native-community/datetimepicker`
- [ ] `@react-native-picker/picker`
- [ ] `react-native-contacts` (the app uses `@s77rt/react-native-contacts`)
- [ ] `react-native-swiper` (old intro slider)

Then `bun install && cd ios && pod install`, rebuild both platforms.

**Do NOT remove despite zero direct imports:** `react-native-screens` (required
by `@react-navigation/native-stack`) and `react-native-bottom-tabs` (native
module behind `@bottom-tabs/react-navigation`, used by `BottomTabsIOS`).

## Phase 3 — Fix case-duplicate directories in git (punchlist N2)

Git tracks disjoint file sets under both casings (verified: zero path overlap,
so the merge is mechanical): `Home/`(16)+`home/`(14), `Tasks/`(15)+`tasks/`(8),
`Auth/`(3)+`auth/`(7), `LaunchModals/`(2)+`launchModals/`(7), `Debug/`(0)+`debug/`(2).
On macOS they merge silently; on any case-sensitive checkout (CI, cloud builds)
imports break. Fix with `git mv` to one canonical casing (suggest PascalCase to
match imports like `@features/Debug/...`) in a dedicated commit. Do this AFTER
Phase 1 so you move fewer files.

## Phase 4 — Structural decisions (need a product call)

1. **Unify the add-task flow.** iOS uses the current multi-screen
   `AddTask/navigation/AddTaskNavigator`; Android's tab uses the legacy
   single-screen `Tasks/screens/AddTaskScreen.tsx` — which is broken (its
   description input is commented out, lines 161–166). Recommendation: point
   `BottomTabsAndroid.tsx` at `AddTaskNavigator` like iOS, then delete
   `Tasks/screens/AddTaskScreen.tsx` (237) and
   `Tasks/components/ListTaskOptionSelector.tsx` (156).
2. **Rename/refocus `features/Tasks`.** After 1, what remains is the shared
   task data layer (`types/tasks.ts`, `useVote`, `useTaskPush`, `useTaskCheer`,
   `useTaskProgress`, `useComment`, `api/*`, `cheerPresets`) consumed by Home,
   TaskDetail, and AddTask. Either leave it as the data layer or move it to
   `src/shared/tasks/` so "features" only holds screens.
3. **Feature flags: wire or remove.** `src/shared/featureFlags/` fetches
   per-task-type flags (motivation/advice/decision/reminder) from the backend
   and caches them, but `useFeatureFlags()` has ZERO consumers — all task types
   render unconditionally. Either gate the type selectors with the flags
   (useful if you plan to sunset task types as the app simplifies) or delete
   the provider and its App.tsx wiring.
4. **(From punchlist N3, related)** `MainDebugScreen` registration and the
   hardcoded backdoor email in HomeScreen should be dev-gated — do together
   with the Debug cleanup.

## Verification after each phase

1. `bunx tsc --noEmit`
2. `bun run lint`
3. Build & smoke-test both platforms (add task, open task detail, notifications tab)
4. Mark entries `deleted` in `docs/app-direction-log.md`
