# PushMeUp — Launch Punch List (Re-Audit)

Read-only re-audit on **2026-07-06** after the team added **Sign in with Apple** and a
**moderation feature** (report + block), and completed a large refactor (Task→Goal rename,
`TaskDetail`→`GoalDetail`, case-duplicate dir consolidation, dead-code cleanup). Covers both the
React Native client (`taskswapMobile`) and the Node/Express + Prisma backend (`taskswapBackend`).
Backend paths are relative to `../taskswapBackend/`.

**Headline:** the three items that blocked the previous audit are now **resolved** — B1 exists,
B2 is handled, N1 is implemented. What remains are **completeness/safety gaps inside the new
moderation feature**, not missing features.

**New/open severity counts:** Critical 0 · High 3 · Medium 5 · Low 4.

---

## ✅ Resolved since the last audit

- **N1 — Sign in with Apple: DONE (client + server + entitlement).**
  - Server verifies the Apple identity token properly — JWKS signature, `audience` = `APPLE_CLIENT_ID`,
    `issuer` = `appleid.apple.com`, RS256, identity from `sub` ([verifyGoogleToken.ts:139-164](../taskswapBackend/src/middleware/verifyGoogleToken.ts)).
  - Client button is iOS-only, functional, sends the identity token as Bearer and stores the app JWT
    like Google ([LoginScreen.tsx:246-269](src/features/Auth/screens/LoginScreen.tsx), [useAppleAuth.ts:24-46](src/features/Auth/api/useAppleAuth.ts)).
  - iOS entitlement present (`com.apple.developer.applesignin`) and `@invertase/react-native-apple-authentication` installed.
  - Cross-provider account linking is safe (keyed on verified `(provider, providerUserId)`).
- **B2 — Account deletion + Apple token revocation: DONE.** `deleteMyAccount` calls
  `revokeAppleRefreshToken` before deletion and cascades auth accounts, blocks, and reports
  ([user.service.ts:201-299](../taskswapBackend/src/features/user/user.service.ts), [appleAuth.service.ts:50-83](../taskswapBackend/src/features/user/appleAuth.service.ts)). (Adding Apple Sign-In had turned this into a hard 5.1.1(v) blocker — now handled. See M4 for a hardening note.)
- **B1 — Report + block: implemented** on both sides (endpoints, admin surface, mutual blocking,
  Blocked-Users screen, schema cascades, validation, rate limiting). Remaining gaps are listed below.
- **No regressions.** All prior fixes verified intact in current code: SEC1/SEC2/SEC3, C3/C4, A5
  (`nextAllowedAt`), C7, and A2/A3/A6/A8 on the client, plus the **Android MainActivity
  `onCreate(null)` notification-crash fix** ([MainActivity.kt:25-32](android/app/src/main/java/com/pushmeup/app/MainActivity.kt)). The Task→Goal
  refactor did not break them.

---

## Open items (this re-audit)

### H1. Reported content is not hidden from the reporter — **HIGH (Apple 1.2 gap)**
Apple's UGC guideline expects reported content to disappear for the reporter immediately. Right
now **neither side hides it**: the server doesn't auto-hide on report
([moderation.service.ts:10-56](../taskswapBackend/src/features/moderation/moderation.service.ts)), and the client's report success handler only
toasts — it doesn't remove the task from cache or navigate away
([GoalDetailScreen.tsx:361-367](src/features/GoalDetail/screens/GoalDetailScreen.tsx)). **Fix (S):** on report success, client
`queryClient.removeQueries` the reported task + invalidate the feed; optionally have the server
treat a report as an implicit hide-for-reporter. *Test:* report a goal → it vanishes from the
reporter's feed and detail without a refresh.

### H2. Blocked users can still push / cheer / vote on the blocker's content — **HIGH (safety)**
Blocking correctly filters the feed, detail, and comments, but the push, cheer, and vote mutations
have **no block check**, so a blocked user can still trigger notifications and interact:
[push.service.ts:13-31](../taskswapBackend/src/features/push/push.service.ts), [cheer.service.ts:304-380](../taskswapBackend/src/features/cheer/cheer.service.ts), [vote.service.ts:5-31](../taskswapBackend/src/features/vote/vote.service.ts). **Fix (S):**
call the existing `isTaskHiddenForViewer(task.userId, userId)` at the top of each and reject with
403 when blocked. *Test:* B blocks A → A's push/cheer/vote on B's task is rejected.

### H3. Report/Block not reachable from feed cards — **HIGH→MEDIUM (reachability)**
Report and Block are only in the Goal Detail three-dot menu ([GoalDetailScreen.tsx:1330-1341](src/features/GoalDetail/screens/GoalDetailScreen.tsx));
the feed cards (`MotivationCard`, `AdviceCard`, `ReminderCard`, `DecisionCard`) have no moderation
menu. Report *is* reachable (via detail), so this may pass review, but Apple prefers report/block
directly on the content surface. **Fix (M):** add a shared `⋯` menu to the feed card footer/header
that opens the existing report sheet / block action. *Test:* report + block reachable from a feed card.

### M1. User profile is exposed to blocked users — **MEDIUM (privacy)**
`getUserProfileById` returns full profile (stats, follow counts, mutual friends) even when the
viewer is blocked by that user — only the recent-tasks list is emptied
([user.service.ts:897-962](../taskswapBackend/src/features/user/user.service.ts)). **Fix (S):** if `isTaskHiddenForViewer(targetUserId, viewerId)`,
return 404. *Test:* B blocks A → A gets 404 on B's profile.

### M2. No duplicate-report constraint — **MEDIUM (spam)**
`TaskReport` has no `@@unique([reporterId, taskId])` and `reportTask` doesn't dedupe, so one user
can file unlimited reports on the same task ([moderation.service.ts:10-56](../taskswapBackend/src/features/moderation/moderation.service.ts)). **Fix (S):**
add the unique constraint (needs a migration) + a friendly "already reported" 409. *Test:* second
report on the same task by the same user is rejected.

### M3. Report free-text `details` is collected in types but never sent — **MEDIUM (bug)**
The report payload type includes `details`, the server validates it (`.max(1000)`), but the modal
passes only the reason and the client API omits `details` from the POST body
([ReportTaskModalContent.tsx:46](src/shared/components/ModalProvider/modals/ReportTaskModalContent.tsx), [reportApi.ts:5-20](src/features/Reports/api/reportApi.ts)). Either add a
details field to the sheet and send it, or drop the dead param. **Fix (S).**

### M4. Apple token-revocation failure is swallowed on deletion — **MEDIUM (5.1.1(v) hardening)**
If Apple's `/auth/revoke` call fails (network/Apple down), the error is logged but account
deletion proceeds, leaving a live Apple refresh token ([user.service.ts:232-234](../taskswapBackend/src/features/user/user.service.ts)). Apple
requires the *attempt* (which exists), so this is hardening, not a blocker. **Fix (S):** either
fail the deletion when revocation fails (fail-safe), or record a retry/audit flag.

### M5. `console.log('Redirect to:', redirectTo, route)` ships in production — **MEDIUM (log leak)**
[LoginScreen.tsx:59](src/features/Auth/screens/LoginScreen.tsx) logs the redirect target and route object (which can carry a draft
payload) unguarded. **Fix (S):** wrap in `if (__DEV__)` or remove. (This is a fresh instance of
the C7 class of issue, introduced after the last audit.)

### L1. A4 `AppState`→`focusManager` bridge lost in the cleanup — **LOW (partial regression)**
The refactor deleted `src/lib/react-query/provider.tsx`, so the app-foreground→refetch bridge is
gone and the comment in [client.ts:8](src/lib/react-query/client.ts) is now stale. A4's core still works — the owner's
Goal Detail screen keeps `useFocusEffect` refetch + 15s polling — so cheers still arrive while the
screen is open. **Fix (S):** re-add the AppState/focusManager bridge (or delete the stale comment).

### L2. Provider inference reads an unverified token's `iss` — **LOW (not exploitable)**
`inferProviderFromBearer` decodes (not verifies) the bearer to pick a provider
([verifyGoogleToken.ts:214-229](../taskswapBackend/src/middleware/verifyGoogleToken.ts)); real verification still runs afterward, so a forged
`iss` can't authenticate. Add a clarifying comment. **Fix (S).**

### L3. FCM error logs not `__DEV__`-guarded — **LOW**
`console.warn('Failed to fetch FCM token…')` in [useGoogleAuth.ts:27](src/features/Auth/api/useGoogleAuth.ts) and
[useAppleAuth.ts:22](src/features/Auth/api/useAppleAuth.ts) run in production. Benign, but guard for consistency. **Fix (S).**

### L4. `contentModeration.ts` banned-word filter is easily bypassed — **LOW (defense-in-depth)**
The create-time text filter ([contentModeration.ts](../taskswapBackend/src/utils/contentModeration.ts), applied in `createTask`/`createComment`) is a
small hardcoded list with basic leet normalization — fine as a first pass, but not a substitute
for the report/admin flow (which exists). No change required; noted for expectations.

---

## Submission readiness

Compared to the first audit (B1 missing, B2 broken, N1 absent) this is a large step forward — all
three are now in place, and nothing regressed. Before submitting I'd close, in order:

1. **H1** (hide reported content for the reporter) — closest thing to a real Apple 1.2 gap.
2. **H2** (block-bypass on push/cheer/vote) — user-safety integrity of the block feature.
3. **H3** (report/block from feed cards) — reachability polish; safe to ship without, better with.
4. **M1–M5** hardening/bug batch.

Everything here is read-only findings — no code was changed in this re-audit.
