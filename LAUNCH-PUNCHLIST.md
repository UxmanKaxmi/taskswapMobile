# PushMeUp — Launch Punch List

Read-only pre-launch audit (2026-07-03) against `PUSHMEUP-LAUNCH-AUDIT.md`, covering **both**
repos: the React Native client (`taskswapMobile`) and the Node/Express + Prisma backend
(`taskswapBackend`). File refs are prefixed **[client]** or **[server]**. Backend paths are
relative to `../taskswapBackend/`.

**Severity counts:** Critical 6 · High 8 · Medium 11 · Low 4. Passes: A11 (composer path),
B3 (beta modal), C2 (push idempotency).

**Blocks App Store / Play submission:** B1, B2, N1, plus the C-series security fixes (SEC1–SEC3)
should ship before public launch.

---

## B1. Report + block (Apple 1.2, UGC) — **CRITICAL — submission blocker**

Confirmed missing on **both** sides. No report/block/moderation code in the client
(`git grep -i "report|block|flag|moderat"` → only an unrelated tag-filter toggle), and none in
the backend (no routes, no Prisma tables — [server] `prisma/schema.prisma`, `src/index.ts:39-51`).

**Implementation plan (effort L):**

*Endpoints (server):*
- `POST /tasks/{taskId}/report` — body `{ reason: 'harassment'|'spam'|'inappropriate'|'other', message? }`
- `POST /users/{userId}/block`, `DELETE /users/{userId}/block`
- Feed (`GET /tasks`) and task-detail queries must exclude blocked users' content and tasks the
  caller reported. All behind `requireAuth`.

*Schema (server, minimal v1):*
- `ContentFlag(id, taskId, reporterId, reason, message, status, createdAt)`
- `UserBlock(id, blockerId, blockedUserId, createdAt, @@unique([blockerId, blockedUserId]))`
- Add `onDelete: Cascade` relations so B2 deletion also purges these.
- Admin notification (email/Slack webhook) on new flag is enough for v1 moderation.

*Client UI entry points:*
- `⋯` menu on feed cards — [client] `src/features/Home/components/MotivationCard.tsx`,
  `AdviceCard.tsx`, `DecisionCard.tsx`, `ReminderCard.tsx` — "Report" / "Block user" for
  non-owner content.
- Same on [client] `src/features/TaskDetail/components/TaskDetailHeader.tsx` for non-owners
  (mirror the owner delete-menu at `TaskDetailScreen.tsx:315-334`).
- "Block user" on [client] `src/features/Friends/screens/FriendsProfileScreen.tsx`.
- New `src/features/Moderation/` module (api + `useReportTask`/`useBlockUser` hooks); on report
  success, drop the task from cached feed pages (`setQueriesData` on `buildQueryKey.tasks()`)
  then invalidate.

*Tests:* report hides card immediately for reporter; blocked user's content absent after
refetch; server rejects duplicate block (idempotent) and report of nonexistent task.

---

## B2. Account deletion (Apple 5.1.1(v)) — **CRITICAL — the endpoint does not exist**

**The brief and my Phase-1 (client-only) read were both wrong: deletion silently fails.**
- [client] calls `DELETE /users/me` (`src/shared/api/apiRoutes.ts:32`, `MyProfileAPI.ts:19-21`)
  and the Profile UI wires it up (`ProfileMenu.tsx:45-73`).
- [server] **there is no such route.** `src/features/user/user.routes.ts:19-44` registers sync,
  match, follow, followers/following, me, home-summary, search-friends, profile — **no
  `router.delete`**. The request 404s; the client's `try/catch` shows a generic failure or, worse,
  logs the user out as if it worked while the account persists. **Hard Apple blocker.**

**Fix (effort M, server + S client):**
1. [server] Add `DELETE /users/me` (`requireAuth`, identity from `req.user.id` — never a body id).
2. [server] Cascade or anonymize everything owned by the user. Verify Prisma relations:
   Push already has `onDelete: Cascade`; audit Task, TaskBeat, ProgressUpdate, Cheer, Comment,
   Vote, Notification, Follow, ReminderNote, referrals, and FCM token for cascade/nullation so no
   orphaned or still-attributed content remains.
3. [client] surface real success/failure from the response (don't log out on 404).
4. **Privacy policy URL:** none exists anywhere (`grep "privacy"` → only delete-alert copy). Add a
   Privacy Policy / Terms row (natural home: the Help Center row wired in A10) and set the URL in
   App Store Connect. Required for ASC submission.
5. Apple token revocation is **N/A today** (no Sign in with Apple — see N1); add it if N1 lands.

*Tests:* [server] delete → all owned rows gone/anonymized, re-login creates a fresh profile;
deleted user's tasks absent from other feeds. [client] 404/500 shows an error and does not log out.

---

## A4. Owner never sees incoming cheers — **CRITICAL (core loop payoff) — client-only**

**Backend is fine; this is entirely client caching.** The server creates an inbox notification
**and** sends an FCM push to the owner on every cheer ([server]
`src/features/cheer/cheer.service.ts:178-302,448`), and the cheer-summary response already
carries per-beat state plus `cheerTotal`/`distinctCheererCount` for the whole task. The owner
doesn't see it because the client never refetches while the task-detail screen is open:
- [client] `src/lib/react-query/client.ts:7` sets `refetchOnWindowFocus: false` — a no-op on
  React Native (no window focus), and nothing replaces it (no `focusManager`/`AppState` wiring,
  no `useFocusEffect`, no polling).
- The task query relies on `staleTime: 60s` ([client] `src/features/Home/hooks/useTaskById.ts:18`)
  and only refetches on remount (`TaskDetailScreen.tsx:150-164`). Scrolling triggers nothing.

**Fix (effort M, client):**
1. Wire react-query `focusManager` to `AppState` in [client] `src/lib/react-query/provider.tsx`.
2. `useFocusEffect` in `TaskDetailScreen` to invalidate `taskById(taskId)` on focus.
3. Light polling for the owner while the screen is focused (`refetchInterval: ~15s`) — this is the
   "guarantee support arrives" the brief asks for.

*Tests:* fake-timer test — cheer written server-side while owner focused → count updates within one
poll; navigate-away/back refetches.

---

## A6. Cheer model: overwrite vs history — **NOT A BUG server-side; client display gap (High)**

**Brief hypothesis refuted on both sides.** [server] `Cheer` is append-only and keyed **per beat**:
`@@unique([beatId, userId])` (`prisma/schema.prisma:92-107`); a task's original post is a
`TaskBeat` of type `post`, each update a `TaskBeat` of type `update`. The handler only ever
`create`s and swallows the P2002 duplicate — it **never deletes or upserts** a prior cheer
([server] `src/features/cheer/cheer.service.ts:304-467`). The first cheer was never removed from
the database.

**Real cause of the "disappearance": the client shows only the latest beat's cheers.**
[client] `src/features/TaskDetail/components/MotivationDetail.tsx:179-189` builds `cheerSummary`
from `latestBeat` only, so once a newer beat exists, cheers on earlier beats vanish from the
support card even though the API returns them for every beat. The cheer sheet also quotes the
correct target (`beat.text || task.text`, `TaskDetailScreen.tsx:417` → `CheerModalContent.tsx:51-57`),
refuting the brief's "sheet quotes the task" claim.

Button target logic (documenting per brief): only the latest beat is cheerable —
`isCheeringOpen = beat.isLatest && beat.isCheeringOpen !== false`
([client] `TaskProgressUpdateHistory.tsx:157-161`). Intentional and safe now that we know history
is preserved server-side.

**Fix (effort S, client):** render cheers aggregated across beats (or per-beat history) in the
support card instead of latest-only. No schema change, no migration. *Test:* cheer post then
update → support card reflects both after refetch.

---

## A11. Logged-out "Post it" path — **VERIFIED WORKING (composer); minor Push-gate gap (Medium)**

The composer continuation exists and is correct: signed-out submit packages the draft and routes to
auth ([client] `src/features/AddTask/screens/AddMotivationScreen.tsx:154-188`), the draft is restored
after login (`:63-69`) and auto-submitted exactly once via `hasAutoSubmittedRef` (`:139-152`).
**Gap:** the Push auth gate ([client] `src/features/Home/hooks/usePushInteraction.ts:46`) returns
the user to the app after login but does not resume the push. Fix (S): carry a `resumePushTaskId`
through the auth redirect and fire the push once on return. *Tests:* signed-out post-it → login →
one task created; signed-out push → login → push applied.

---

## A1. AM/PM timestamp bug — **HIGH — environment/clock, not code (both repos clean)**

**No hour-flipping code exists in either repo.** [client] formats the server string with the device
locale, no hardcoded meridiem (`TaskProgressUpdateHistory.tsx:359-373`). [server] sets `createdAt`
via Prisma `@default(now())` and serializes with `.toISOString()` (correct UTC) — no custom 12-hour
patterns or manual hour math ([server] `src/features/task/task.service.ts:104-113`, `:915-1028`).

With formatting code ruled out on both sides, a same-minute 12-hour flip that reproduces on **both
simulators hitting the same dev API** points to the **dev server/DB host clock being set ~12h off**
(a mis-set wall clock, or the DB column storing local time labeled as UTC). This is an environment
defect, not a code defect.

**Fix (effort S):** (1) verify — hit the progress endpoint and compare the raw `createdAt` JSON
against true UTC (`date -u`); if it's ~12h off, correct the server/DB host clock and ensure
timestamps are stored/served as UTC. (2) Optional client hardening the brief asked for: unit-test
`formatTimelineParts` with an afternoon date to lock in correct behavior. (3) Optional robustness:
[server] also send `createdAtMs` (epoch) so the client never depends on ISO parsing.

*Tests:* [client] formatter unit test for 12:29 PM; [server] response `createdAt` within seconds of
`Date.now()`.

---

## A2. Conflicting "DAY N" in hero carousel — **HIGH (confirmed, client)**

Two hero variants call the same helper with **different data sources**, and the helper conflates two
meanings of "day":
- "YOUR GOAL · DAY N" uses server summary: `getGoalDayNumber(summaryGoal.createdAt, summaryGoal.progressCount)`
  ([client] `HomeSummarySection.tsx:345-347,363`).
- "YOUR PROGRESS · DAY N" uses the feed-cached task: `getTaskDayNumber(progressTask)` →
  `progressUpdates?.length` (`:412,505-508`).
- Helper (`:510-519`): `progressCount>0 ? progressCount+1 : calendarDaysSince(createdAt)+1` — an
  "updates" counter vs a calendar counter. Stale feed length vs fresh summary count → DAY 3 vs
  DAY 7/8. `HomeHeroCard.tsx:80` holds a third copy of the calendar math.

**Fix (effort S):** one shared `daysOn(task)` util fed from a single source (prefer `summaryGoal`
for own-goal cards), and pick one product meaning of "DAY" (calendar days since start is the honest
reading). *Tests:* both card configs yield identical day numbers under stale-feed + fresh-summary.

---

## A3. Stale hero data after mutations — **HIGH (confirmed, client)**

The push mutation deliberately does **not** invalidate the feed list, and hero push counts are read
from feed task objects:
- Hero metrics read `pushTask?.pushCount`/`progressTask?.pushCount` from the `tasks` cache
  ([client] `HomeSummarySection.tsx:401,415`); feed card count comes from the separate
  `pushesForTask` query ([client] `useTaskPush.ts:30-46,88-95`).
- The mutation intentionally skips `buildQueryKey.tasks()` so the "Needs a push" card isn't yanked
  mid-tap (documented, `useTaskPush.ts:96-101`). Side effect: hero variants derived from feed tasks
  show the stale count on the same screen.

**Fix (effort S):** in `onMutate`/`onSuccess`, surgically patch the pushed task's
`pushCount`/`hasPushed` inside cached feed pages via `setQueriesData({ queryKey: tasks() }, …)` —
keeps the no-yank behavior while making hero and card agree. *Tests:* after toggle, feed-cache task
object shows incremented count; hero and card render the same number.

---

## A5. Stuck update cooldown — **HIGH — server enforces it; client display + dev value are the bugs**

**Server-side enforcement is correct and confirmed:** [server] `shareTaskProgress` rejects early
updates with HTTP 429 (`task.service.ts:915-1028`, cooldown const `:67-70` = prod 6h / dev 1min,
check `:970-980`). The client problems:
- [client] remaining time is computed once per render with **no ticking timer**
  (`TaskDetailScreen.tsx:1205-1219`, gate `:185`, copy `:737-739`) — "in 1m." never changes and
  the CTA never returns until an unrelated re-render.
- The reviewed build showed the **dev** cooldown (1 min) — [client] `constants.ts:20-21`
  `isDEV ? 60s : 6h`. Confirm the review used a dev build; production copy reads "6 hours".
- The server does **not** return `nextAllowedAt` — it only throws a message string
  ([server] `:970-980`), so the client can't reliably resync the countdown.

**Fix (effort M split):** [client] drive the sticky bar from a 1s `useEffect` interval (cleared on
unmount) and flip the CTA back on expiry; [server] add `nextAllowedAt` to the 429 payload (and/or
to the task response) so the client shows an accurate countdown. Product decision on the real
production cooldown; align copy. *Tests:* [client] fake-timer test — CTA re-enables when countdown
hits 0; [server] 429 body includes future `nextAllowedAt`.

---

## A7. Push toast — **MEDIUM (confirmed, client)**
Duration 2600ms ([client] `src/shared/utils/toast.ts:47`); conflicting bottom offsets
(`toast.ts:45-46` uses 110 vs root `App.tsx:95` uses 60), landing it in the FAB/chip zone (FAB is
70px raised `top:-40`, `BottomTabsAndroid.tsx:219-241`); no fade config. **Fix (S):** prefer the
brief's option — drop the toast for pushes (button morph + count tick already confirm) — or unify
one `bottomOffset ≥ 140`, add fade, ~3500ms.

## A8. Mood "Nervous" pre-selected — **MEDIUM (confirmed, client)**
`useState<FeelingValue>('nervous')` ([client] `AddMotivationScreen.tsx:47`); draft-restore fallback
also defaults to `'nervous'` (`:68`). **Fix (S):** initial state `undefined`, require a selection
before submit. Note: [server] `feelingSchema` should also accept "unset" if mood becomes optional.
*Test:* fresh composer renders no mood selected.

## A9. Inbox unread rendering + glow — **MEDIUM (brief hypothesis refuted, client)**
Unread styling **is** rendered by all 13 notification components
(`item.read ? readCard : unreadCard`, `notification.styles.ts:37-42`). The real cause of "no unread
+ badge dropping 13→9 unprompted": rows auto-mark-read after ≥30% visible for 300ms
([client] `NotifcationMainScreen.tsx:78-98`). **Fix (S):** mark-read on tap/exit (or keep an
"arrived unread" session flag) and strengthen the unread tint (`#E0F7FA` vs white is too subtle).
Glow artifact: no stray gradient on the screen; most likely the raised FAB's yellow shadow (`#FFD23F`,
`BottomTabsAndroid.tsx:225-241`) or motivation-purple card colors showing through the bar — confirm
with the inspector at runtime before changing anything.

## A10. Help Center dead tap — **MEDIUM (confirmed, client)**
`onPress: () => { /* go to help */ }` no-op ([client] `ProfileMenu.tsx:94-101`). **Fix (S):**
repurpose as the home for Privacy Policy / Terms / support links (satisfies part of B2), or remove.

## A12. Copy/consistency — **LOW (confirmed, client)**
"Your request is live" (`MotivationSuccessModalContent.tsx:76`) vs "goal"/"task" elsewhere — pick one.
`APP_NAME = 'Push Me Up'` (`constants.ts:7`) vs "PushMeUp" in ~8 files — standardize via the constant.
"Join 2,400+ people…" is a hardcoded default prop (`LiveSupportBanner.tsx:60,209`) — verify or make
dynamic/remove. Effort S each.

## B3. Beta modal frequency — **PASS**
Shows once ever, persisted in AsyncStorage ([client] `launchModals.storage.ts`,
`useLaunchModals.ts:28-65`, `launchModals.registry.ts:30-36`). No change.

---

## Part C — Security pass (now verified against the backend)

### SEC1 / C1a. IDOR: task update & delete have no owner check — **CRITICAL [server]**
`PATCH /tasks/:id` and `DELETE /tasks/:id` are `requireAuth`-gated ([server] `task.routes.ts:37-38`)
but neither the controller nor the service checks ownership: `updateTask(id, data)` never receives
or compares `userId` ([server] `task.service.ts:522-571`), and `deleteTask(id)` likewise
(`:833-843`). **Any authenticated user can edit or delete anyone's task.** (Complete/incomplete/
progress are correctly guarded — `markTaskAsDone/markTaskAsNotDone` check `task.userId !== userId`,
`:849-913`.) **Fix (S):** thread `req.user.id` into both handlers and throw `UNAUTHORIZED` when
`task.userId !== userId`. *Tests:* user B gets 401/403 updating/deleting user A's task.

### SEC2 / C1b. IDOR: notification read-marking not scoped to owner — **HIGH [server]**
`markNotificationAsRead(id)` / `markNotificationsAsRead(ids)` update by id only, no `userId` filter
([server] `notification.service.ts:52-68`; controllers pass no user). Any authenticated user can
mark another user's notifications read. **Fix (S):** add `where: { id, userId }` (single) and
`where: { id: { in }, userId }` (batch). *Test:* marking a foreign notification affects 0 rows.

### SEC3 / C1c. Unauthenticated `/test-db` dumps all users + open CORS — **HIGH [server]**
`GET /test-db` returns `prisma.user.findMany()` — every user's email/photo — with no auth, always
registered ([server] `src/index.ts:31-38`). `app.use(cors())` (`:24`) allows all origins and there's
no `helmet`. **Fix (S):** gate `/test-db` (and `/routes`) behind `NODE_ENV === 'development'` or
delete; restrict CORS to known origins; add `helmet`. *Test:* `/test-db` 404s in production config.

### C1 (client-asserted identity) — **SAFE**
`POST /users` looks risky (client sends `{id,…}`) but `verifyGoogleToken` overwrites `req.body.id`
with the verified Google `sub` before the upsert ([server] `middleware/verifyGoogleToken.ts:45`,
`user.controller.ts:25-55`) — no takeover. JWT auth is sound; seeded users are blocked
(`requireAuth.ts`).

### C2. Push idempotency — **PASS [server]**
`Push` has `@@unique([userId, taskId])` and the toggle is transactional with P2002 handling
([server] `prisma/schema.prisma:272-286`, `push.service.ts:13-96`). One push per user per task is
guaranteed server-side. (Minor: a redundant duplicate `@@unique([taskId, userId])` — harmless,
optional cleanup.)

### C3. Rate limiting — **HIGH [server]**
No `express-rate-limit` or custom limiter anywhere. Post/push/cheer/comment/feedback endpoints are
unthrottled → spam/abuse/enumeration risk. **Fix (S):** add `express-rate-limit` globally plus
tighter limits on write endpoints. Client-side, add 429 handling in the axios interceptor
([client] `axios.ts:134-208` currently only special-cases 401/403).

### C4. Input validation — **MEDIUM [server]**
Zod is used but task/progress/comment text enforce only `.min(1)`, **no max length**
([server] `task.schema.ts:19-24,134-136`, `comment.schema.ts:1-8`) — the client's 120-char cap is
trivially bypassable, risking DB bloat/oversized payloads. **Fix (S):** add `.max(120)` (task/update)
and a sane comment cap; keep client limits as UX. No HTML/WebView rendering of user text on the
client, so XSS surface stays low. *Tests:* over-limit text rejected with 400.

### C5. Secrets — **PASS**
No backend secrets committed. `firebase-adminsdk.json` and `.env` are gitignored and untracked
(verified); the Google Client ID in `verifyGoogleToken.ts:24` is a public OAuth identifier. Client
Firebase/Google values are public identifiers (restrict to app signatures in the Firebase console).

### C6. Dependencies — **LOW**
Both repos use `bun.lock`, so `npm audit` can't run here. Versions are current (client RN 0.79,
react-query 5; server Express 5.1, Prisma 6.7, zod 3.25, jsonwebtoken 9.0.2). **Action (S):** run
`bun audit` in CI on both repos before submission.

### C7. Notification tokens & PII in logs — **HIGH [client] + MEDIUM [server]**
[client] FCM token logged (`initNotifications.ts:14`, `NotificationPermissionPrompt.tsx:93,237`) and
**full request/response payloads logged unguarded** — profiles, follower lists, notifications
(`axios.ts:123-124`, `userApi.ts:17,23,29`, `NotificationApi.ts:9`, `friendsAPI.ts:17`,
`Home/api/api.ts:72-81`); these reach logcat/os_log in release. [server] the global error handler
`console.error`s full errors and leaks the Prisma error code to clients on unknown DB errors
([server] `middleware/errorHandler.ts:31-55`). **Fix (S):** guard client logs behind `__DEV__` (or a
prod-noop logger); mask Prisma codes in production responses. *Test:* release-mode smoke run shows no
payload/token logs.

---

## Findings the brief missed

### N1. No Sign in with Apple while offering Google login — **HIGH (App Review 4.8 blocker risk)**
[client] only Google login works; the Apple button is a dead placeholder ("Apple Sign-In is not
configured yet.", `LoginScreen.tsx:129-131`). Guideline 4.8 requires an equivalent privacy option
when third-party login is offered, and a visibly dead button invites rejection. Either implement Sign
in with Apple (then wire Apple token revocation into B2 deletion) or hide the button. Effort M.

### N2. Split-case duplicate directories tracked in git — **HIGH (build portability) [client]**
Git tracks feature folders under two casings — `Tasks/`(15) vs `tasks/`(8), `Home/`(16) vs
`home/`(14), `LaunchModals/`(7) vs `launchModals/`(7), `Auth/`(1) vs `auth/`(7), `Debug/` vs
`debug/`. Fine on case-insensitive macOS; on any case-sensitive checkout (Linux CI, cloud build) they
split into half-empty dirs and imports like `@features/Debug/MainDebugScreen` break. **Fix (M,
mechanical):** `git mv` to one canonical casing in a dedicated commit; add a CI guard.

### N3. Hardcoded backdoor email + debug surface in production — **MEDIUM [client]**
`canSeeDevTools = isDEV || user?.email?.toLowerCase() === 'kazmi58@gmail.com'`
([client] `src/features/home/screens/HomeScreen.tsx:105`) exposes a Developer Tools menu (incl.
navigation to `MainDebugScreen`, registered unconditionally in `AppNavigator.tsx:51`) in production,
gated by a personal Gmail shipped in the bundle. **Fix (S):** gate menu + screen registration behind
`isDEV` only; remove the email.

### N4. Dead/stray files — **LOW [client]**
`TaskDetailScreenOld.tsx`, `Layout/LayoutOld.tsx`, and the double-extension
`AddTask/components/DecisionChoicesInput.tsx.tsx`. Delete/rename (S).

---

## Suggested fix order

1. **Security first (SEC1, SEC2, SEC3)** — task-update/delete IDOR, notification IDOR, `/test-db`
   + CORS. Small diffs, highest risk.
2. **B2** — implement `DELETE /users/me` with full cascade + privacy-policy URL (with **A10**).
3. **B1** — report/block (longest lead time; start scoping in parallel).
4. **N1** — Sign in with Apple decision (needs Apple setup lead time).
5. **A4** client refetch/polling; **A6** support-card aggregation; **A5** client timer + server
   `nextAllowedAt`.
6. **A1** verify/fix the dev clock; **A2**, **A3** hero consistency; **C3/C4/C7** hardening;
   **N2** casing.
7. **A7/A8/A9/A12/N3/N4** polish batch.
