# Circles — implementation plan (grounded against code, 2026-07-12)

Companion to the Circles spec/PRD (draft v1). This maps the spec onto what actually exists in
`taskswapMobile`, `taskswapBackend`, and `pushmeup-website`.

**Architecture holds:** a circle is a lens over N solo tasks. Pushes, cheers, updates, complete,
moderation, and anonymity machinery are reused per member task with zero changes. Net-new work:
3 tables + ~7 endpoints + feed aggregation (backend); composer toggle + circle card + circle
detail + join screen (mobile); universal links + invite landing (infra, from scratch).

## Dependency reality check (spec §11)

| Spec assumes | Actual |
|---|---|
| Report/block live | Built both sides. Reuse `getBlockedUserIdsForViewer` / `isTaskHiddenForViewer`; every new read path must call them itself (nothing filters automatically). |
| A4 refresh fix | Half-done: focus invalidation + 15s owner polling exist; the `AppState`→`focusManager` bridge was lost when `provider.tsx` was deleted (2026-07-05). Finish before circle UI. |
| Invite sheet | OS share sheet + clipboard patterns exist (referrals). |
| Web task page (`/c/:token`) | Doesn't exist. Backend is pure JSON; website is static GH Pages. Net-new. |
| Sessions / streaks | Not built (spec-only). v1 lanes show day counts; live badges land with sessions. |
| §10 notification rate-limit framework | No such framework; caps are per-feature constants. 6/day/circle cap implemented locally. |
| §12 analytics | No analytics infra. Deferred (same conclusion as Beats review). |

## Backend

**Schema** (`prisma/schema.prisma`): `Circle` (goalText immutable — no update endpoint; status
active|complete|dissolved), `CircleInvite` (uuid token, expiresAt +7d, multi-use until full —
see spec correction #1), `CircleMember` (`@@unique([circleId,userId])`, state active|left|done,
nullable `taskId` unique FK), `Task.circleId String?`.

Landmines handled:
1. **Feed leak** — feed SQL (`getOrderedFeedTaskIds`) gains `circleId IS NULL`; otherwise member
   tasks render as N duplicate cards (acceptance #7).
2. **`Task @@unique([text,userId])`** collides with shared sentences → converted to a partial
   unique index `WHERE "circleId" IS NULL` (same precedent as the anon partial index).
3. **Deletion ordering** — `Task.user` is `Restrict`; circle rows join the ordered teardown in
   `deleteMyAccount`, and `deleteTask` triggers leave + dissolve re-evaluation.

**Endpoints** (`src/features/circle/`, mounted at `/circles` + `/invites`):
`POST /circles` (tx: circle + creator member + task + first invite; rejects anonymous; max 3
active circles), `POST /circles/:id/invites`, `POST /invites/:token/join` (410 expired, 409
full/limit, idempotent), `GET /invites/:token/preview` (public, for the landing page),
`POST /circles/:id/leave`, `POST /circles/:id/push-all` (reuses push service per member task,
skips self/already-pushed/blocked/done), `GET /circles/:id` (optionalAuth, block-filtered lanes,
positive events only).

**Lifecycle:** evaluated inline on every member state change — complete when active=0 && done≥2;
dissolve when active+done<2 AND no live invites (creator-alone during the invite window is not a
dissolve). Hourly expiry sweep behind a `JobLock` lease. Dissolve/leave null `Task.circleId`
(spec correction #2). Hooks: `markTaskAsDone` → member done + evaluate; `deleteTask` → leave
semantics; `shareTaskProgress` → circle notification fan-out.

**Notifications:** new `circle-*` types, payload `{deeplinkPath:"/circles/:id", screen:
"CircleDetail", circleId}`. Cap = count of today's circle-* Notification rows per recipient per
circle (metadata.circleId); completion + circle-complete bypass.

**Feed card:** v1 returns a `circles` array on the first feed page when the client sends
`includeCircles=1` (version-safe; old clients never see unknown shapes). Circles ranked by max
member `latestActivityAt`, block-filtered, empty cards dropped. Full keyset UNION interleaving is
a follow-up if ranking placement matters at scale.

**Kill switch:** `circles: envFlag("FLAG_CIRCLES", false)` in `globalFlags.ts` → served dark via
`GET /features` (the `firstTimeBeats` precedent).

## Mobile

- **A4 finish:** wire `AppState` → `focusManager` (the deleted `provider.tsx` piece).
- **Slice** `src/features/Circles/` (api/hooks/types/screens/components).
- **Composer:** flag-gated "Do it together" card replaces `TagHelperCard`
  (`AddMotivationScreen.tsx:336`); mutual exclusion with anonymous mirrors the helpers pattern;
  posting calls `POST /circles` and opens the OS share sheet with the invite link (spec's invite
  sheet is channel-based, not a friend picker).
- **Feed:** circle items prepended into the list with a `kind:'circle'` discriminator; new case in
  the `renderGoalNew` switch → `CircleCard` (avatar stack, aggregate pushes, member chips).
- **CircleDetail:** header stats + "Push them all" + one lane per active/done member (mood, day
  count, latest update, push button); lane tap navigates to that member's `GoalDetail`, where all
  existing machinery (cheers, comments, updates) already works. Completed state renders the group
  moment + share via a `ShareModal` members variant.
- **Join:** `JoinCircleScreen` (public preview → mood picker → join), auth-gated via the existing
  pending-route machinery.
- **Notifications:** `circle-*` cases in `getNotificationRoute` → `CircleDetail`.
- **Flag:** `circles` in `FeatureFlags` (default false). Entry points gated; direct navigation to
  existing circles keeps working when the flag drops (acceptance #19).

## Invite links + landing

- Universal links from scratch: iOS associated-domains (`applinks:pushmeup.app`), Android
  `autoVerify` intent-filter, and a `Linking` URL listener that routes `/c/:token` and
  `/circles/:id` through the same pending-auth navigation used by notifications.
- Landing: static `404.html`-based page on pushmeup-website (GH Pages can't route paths) that
  fetches `GET /invites/:token/preview` and shows sentence + members + open-app/store buttons.
  AASA + `assetlinks.json` under `.well-known/` — **verify GH Pages serves AASA with an
  acceptable content-type; if not, front with Cloudflare or move to Netlify.**
- Firebase Dynamic Links is dead (sunset 2025-08) — links are plain `pushmeup.app/c/<token>`, no
  shortening. No deferred deep linking in v1; fresh-install fallback is a follow-up decision.

## Spec corrections folded in (for draft v2)

1. `CircleInvite.redeemedById` contradicts the §10 "public link, first 4 redeemers" edge case →
   tokens are multi-use until full; attribution via `CircleMember.inviteId`.
2. "`circleId` kept on leave" (§5) breaks the feed filter and every read path → `circleId` is
   nulled on leave/dissolve; `CircleMember` (kept forever) is the history.
3. §9's "§10 rate-limit framework" doesn't exist → local per-circle daily cap.
4. Sessions/streaks wording is conditional ("when shipped") — neither exists yet.
5. Dissolve rule clarified: never dissolve while unexpired invites are outstanding (otherwise a
   fresh creator-only circle would dissolve instantly).
6. Wire contract: new endpoints use `goalText` as specced (net-new strings; existing task
   contract untouched per the standing rename rule).

## Rollout

Ship dark behind `FLAG_CIRCLES` → crew/beta two weeks → watch invite→join conversion (>35%) and
notification opt-out delta (<1%) → general. Kill switch hides creation + cards; detail links keep
functioning.
