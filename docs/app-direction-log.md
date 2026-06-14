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

## Removal Checklist

1. Add a log entry here before deleting the code.
2. Update every route or import that points at the removed file.
3. Run `rg` for the old screen/component name and confirm no live references remain.
4. Run typecheck or the relevant test command.
5. Mark the entry as `deleted` once the cleanup is complete.
